import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { Product } from "@/lib/models/product";
import { Sale } from "@/lib/models/sale";
import { listSales } from "@/lib/services/sales";
import { getInventorySummary, getLowStockVariants } from "@/lib/services/inventory";

export type RangePreset = "today" | "7d" | "30d" | "month" | "all" | "custom";

export function resolveRange(preset?: string, from?: string, to?: string) {
  const now = new Date();
  const safePreset = (preset ?? "30d") as RangePreset;
  let start: Date;
  let end = endOfDay(now);
  let label = "Last 30 days";

  switch (safePreset) {
    case "today":
      start = startOfDay(now);
      label = "Today";
      break;
    case "7d":
      start = startOfDay(subDays(now, 6));
      label = "Last 7 days";
      break;
    case "month":
      start = startOfMonth(now);
      label = format(now, "MMMM yyyy");
      break;
    case "all":
      start = new Date("2020-01-01T00:00:00.000Z");
      label = "All time";
      break;
    case "custom": {
      const parsedFrom = from ? new Date(from) : startOfDay(subDays(now, 29));
      const parsedTo = to ? new Date(to) : now;
      start = startOfDay(Number.isNaN(parsedFrom.getTime()) ? subDays(now, 29) : parsedFrom);
      end = endOfDay(Number.isNaN(parsedTo.getTime()) ? now : parsedTo);
      label = `${format(start, "d MMM yyyy")} – ${format(end, "d MMM yyyy")}`;
      break;
    }
    default:
      start = startOfDay(subDays(now, 29));
  }

  if (start > end) {
    const swap = start;
    start = startOfDay(end);
    end = endOfDay(swap);
  }

  return {
    preset: safePreset,
    from: start,
    to: end,
    fromISO: start.toISOString(),
    toISO: end.toISOString(),
    label,
  };
}

export type DashboardRange = ReturnType<typeof resolveRange>;

const SALE_MATCH = (range: DashboardRange) => ({
  saleDate: { $gte: range.from, $lte: range.to },
  saleStatus: { $ne: "Cancelled" as const },
});

export async function getSalesSummary(range: DashboardRange) {
  await connectDB();
  const rows = await Sale.aggregate([
    { $match: SALE_MATCH(range) },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        grossRevenue: { $sum: "$total" },
        refunds: { $sum: { $ifNull: ["$refundAmount", 0] } },
        totalCost: { $sum: "$totalCost" },
        refundCost: { $sum: { $ifNull: ["$refundCost", 0] } },
        outstanding: {
          $sum: {
            $cond: [
              { $in: ["$paymentStatus", ["Pending", "Partially Paid"]] },
              { $max: [0, { $subtract: [{ $subtract: ["$total", "$amountPaid"] }, { $ifNull: ["$refundAmount", 0] }] }] },
              0,
            ],
          },
        },
        pendingCount: {
          $sum: { $cond: [{ $in: ["$paymentStatus", ["Pending", "Partially Paid"]] }, 1, 0] },
        },
      },
    },
  ]);

  const row = rows[0] ?? {
    count: 0,
    grossRevenue: 0,
    refunds: 0,
    totalCost: 0,
    refundCost: 0,
    outstanding: 0,
    pendingCount: 0,
  };

  const revenue = row.grossRevenue - row.refunds;
  const cost = row.totalCost - row.refundCost;
  const profit = revenue - cost;

  return {
    salesCount: row.count as number,
    grossRevenue: row.grossRevenue as number,
    refunds: row.refunds as number,
    revenue,
    cost,
    profit,
    margin: revenue > 0 ? (profit / revenue) * 100 : 0,
    outstanding: row.outstanding as number,
    pendingCount: row.pendingCount as number,
    averageOrder: row.count > 0 ? revenue / row.count : 0,
  };
}

function fillSeries(
  rows: { _id: string; revenue: number; profit: number; orders: number }[],
  range: DashboardRange,
) {
  const map = new Map(rows.map((row) => [row._id, row]));
  const days = eachDayOfInterval({ start: range.from, end: range.to }).slice(-120);
  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const row = map.get(key);
    return {
      date: key,
      label: format(day, "d MMM"),
      revenue: Math.round(row?.revenue ?? 0),
      profit: Math.round(row?.profit ?? 0),
      orders: row?.orders ?? 0,
    };
  });
}

async function getRevenueSeries(range: DashboardRange) {
  const rows = await Sale.aggregate([
    { $match: SALE_MATCH(range) },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate", timezone: "UTC" } },
        revenue: { $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] } },
        cost: {
          $sum: { $subtract: ["$totalCost", { $ifNull: ["$refundCost", 0] }] },
        },
        orders: { $sum: 1 },
      },
    },
    {
      $project: {
        revenue: 1,
        orders: 1,
        profit: { $subtract: ["$revenue", "$cost"] },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return fillSeries(rows as any[], range);
}

async function getTopProducts(range: DashboardRange, limit = 5) {
  const rows = await Sale.aggregate([
    { $match: SALE_MATCH(range) },
    { $unwind: "$items" },
    {
      $project: {
        productId: { $toString: "$items.productId" },
        name: "$items.productName",
        qty: "$items.quantity",
        netQty: {
          $subtract: ["$items.quantity", { $ifNull: ["$items.returnedQuantity", 0] }],
        },
        gross: { $subtract: ["$items.subtotal", { $ifNull: ["$items.discount", 0] }] },
      },
    },
    {
      $project: {
        productId: 1,
        name: 1,
        netQty: 1,
        revenue: {
          $cond: [
            { $gt: ["$qty", 0] },
            { $multiply: [{ $divide: ["$netQty", "$qty"] }, "$gross"] },
            0,
          ],
        },
      },
    },
    { $match: { netQty: { $gt: 0 } } },
    {
      $group: {
        _id: "$productId",
        name: { $first: "$name" },
        quantity: { $sum: "$netQty" },
        revenue: { $sum: "$revenue" },
      },
    },
    { $sort: { quantity: -1, revenue: -1 } },
    { $limit: limit },
  ]);
  return rows.map((row: any) => ({
    productId: row._id as string,
    name: row.name as string,
    quantity: row.quantity as number,
    revenue: Math.round(row.revenue) as number,
  }));
}

async function getCategoryPerformance(range: DashboardRange) {
  const rows = await Sale.aggregate([
    { $match: SALE_MATCH(range) },
    { $unwind: "$items" },
    {
      $group: {
        _id: { $ifNull: ["$items.categoryName", "Uncategorised"] },
        quantity: {
          $sum: {
            $subtract: ["$items.quantity", { $ifNull: ["$items.returnedQuantity", 0] }],
          },
        },
        revenue: {
          $sum: {
            $cond: [
              { $gt: ["$items.quantity", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$items.quantity", { $ifNull: ["$items.returnedQuantity", 0] }] },
                      "$items.quantity",
                    ],
                  },
                  { $subtract: ["$items.subtotal", { $ifNull: ["$items.discount", 0] }] },
                ],
              },
              0,
            ],
          },
        },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  return rows.map((row: any) => ({
    name: (row._id as string) || "Uncategorised",
    quantity: row.quantity as number,
    revenue: Math.round(row.revenue) as number,
  }));
}

async function getPaymentMix(range: DashboardRange) {
  const rows = await Sale.aggregate([
    { $match: SALE_MATCH(range) },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        revenue: {
          $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
        },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  return rows.map((row: any) => ({
    method: row._id as string,
    count: row.count as number,
    revenue: Math.round(row.revenue) as number,
  }));
}

export async function getDashboardData(range: DashboardRange) {
  await connectDB();

  const [summary, inventory, series, topProducts, categories, paymentMix, lowStock, recent, productCount, publishedCount, outOfStock, movementCount] =
    await Promise.all([
      getSalesSummary(range),
      getInventorySummary(),
      getRevenueSeries(range),
      getTopProducts(range, 5),
      getCategoryPerformance(range),
      getPaymentMix(range),
      getLowStockVariants(6),
      listSales({ page: 1, pageSize: 5 }),
      Product.countDocuments({ isArchived: false }),
      Product.countDocuments({ isArchived: false, isPublished: true }),
      Product.countDocuments({ isArchived: false, "variants.stockQuantity": 0 }),
      Product.countDocuments({ isArchived: false }),
    ]);

  const stockByCategory = await Product.aggregate([
    { $match: { isArchived: false } },
    { $unwind: "$variants" },
    {
      $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" },
    },
    {
      $group: {
        _id: { $ifNull: [{ $first: "$cat.name" }, "Uncategorised"] },
        units: { $sum: "$variants.stockQuantity" },
      },
    },
    { $sort: { units: -1 } },
    { $limit: 8 },
  ]);

  const stockByGender = await Product.aggregate([
    { $match: { isArchived: false } },
    { $unwind: "$variants" },
    { $group: { _id: "$gender", units: { $sum: "$variants.stockQuantity" } } },
  ]);

  return {
    range,
    summary,
    inventory,
    series,
    topProducts,
    categories,
    paymentMix,
    lowStock,
    recentSales: recent.items,
    totals: {
      productCount,
      publishedCount,
      outOfStockProducts: outOfStock,
      lowStockVariants: inventory.lowStock,
      outOfStockVariants: inventory.outOfStock,
      unitsOnHand: inventory.totalUnits,
      movements: movementCount,
    },
    stockByCategory: stockByCategory.map((row: any) => ({
      name: row._id as string,
      units: row.units as number,
    })),
    stockByGender: stockByGender.map((row: any) => ({
      name: row._id as string,
      units: row.units as number,
    })),
  };
}

async function getSeriesByGranularity(range: DashboardRange, granularity: "day" | "week" | "month") {
  const formats = { day: "%Y-%m-%d", week: "%G-W%V", month: "%Y-%m" } as const;
  const rows = await Sale.aggregate([
    { $match: SALE_MATCH(range) },
    {
      $group: {
        _id: { $dateToString: { format: formats[granularity], date: "$saleDate", timezone: "UTC" } },
        revenue: { $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] } },
        cost: { $sum: { $subtract: ["$totalCost", { $ifNull: ["$refundCost", 0] }] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        period: "$_id",
        revenue: 1,
        orders: 1,
        profit: { $subtract: ["$revenue", "$cost"] },
        _id: 0,
      },
    },
  ]);
  return rows.map((row: any) => ({
    period: row.period as string,
    revenue: Math.round(row.revenue),
    profit: Math.round(row.profit),
    orders: row.orders as number,
  }));
}

export async function getReportData(range: DashboardRange) {
  await connectDB();
  const [summary, daily, weekly, monthly, topProducts, categories, inventory, lowStock, paymentMix, salesList] =
    await Promise.all([
      getSalesSummary(range),
      getSeriesByGranularity(range, "day"),
      getSeriesByGranularity(range, "week"),
      getSeriesByGranularity(range, "month"),
      getTopProducts(range, 10),
      getCategoryPerformance(range),
      getInventorySummary(),
      getLowStockVariants(20),
      getPaymentMix(range),
      listSales({ from: range.fromISO, to: range.toISO, page: 1, pageSize: 1000 }),
    ]);

  const categoryDocs = await Category.find({ isActive: true }).sort({ name: 1 }).lean();

  const outOfStock = await Product.aggregate([
    { $match: { isArchived: false } },
    { $unwind: "$variants" },
    { $match: { "variants.stockQuantity": 0 } },
    {
      $project: {
        _id: 0,
        productName: "$name",
        size: "$variants.size",
        colour: "$variants.colour",
        sizingSystem: "$sizingSystem",
      },
    },
    { $limit: 100 },
  ]);

  const stockByCategory = await Product.aggregate([
    { $match: { isArchived: false } },
    { $unwind: "$variants" },
    {
      $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" },
    },
    {
      $group: {
        _id: { $ifNull: [{ $first: "$cat.name" }, "Uncategorised"] },
        units: { $sum: "$variants.stockQuantity" },
        costValue: { $sum: { $multiply: ["$variants.stockQuantity", "$variants.costPrice"] } },
      },
    },
    { $sort: { units: -1 } },
  ]);

  return {
    range,
    summary,
    daily,
    weekly,
    monthly,
    topProducts,
    categories,
    inventory,
    lowStock,
    paymentMix,
    outOfStock,
    stockByCategory: stockByCategory.map((row: any) => ({
      name: row._id as string,
      units: row.units as number,
      costValue: row.costValue as number,
    })),
    categoryCount: categoryDocs.length,
    sales: salesList.items,
  };
}

export function buildSalesCsv(
  sales: { saleReference: string; saleDate: string; customerName: string; customerPhone: string; itemCount: number; total: number; netTotal: number; grossProfit: number; paymentMethod: string; paymentStatus: string; saleStatus: string; createdByName: string }[],
) {
  const header = [
    "Sale reference",
    "Date",
    "Customer",
    "Phone",
    "Items",
    "Total (GHS)",
    "Net after returns (GHS)",
    "Gross profit (GHS)",
    "Payment method",
    "Payment status",
    "Sale status",
    "Recorded by",
  ];
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = sales.map((sale) =>
    [
      sale.saleReference,
      new Date(sale.saleDate).toISOString().slice(0, 19).replace("T", " "),
      sale.customerName,
      sale.customerPhone,
      sale.itemCount,
      sale.total.toFixed(2),
      sale.netTotal.toFixed(2),
      sale.grossProfit.toFixed(2),
      sale.paymentMethod,
      sale.paymentStatus,
      sale.saleStatus,
      sale.createdByName,
    ]
      .map(escape)
      .join(","),
  );
  return [header.map(escape).join(","), ...rows].join("\r\n");
}
