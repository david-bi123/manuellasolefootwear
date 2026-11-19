import { NextResponse, type NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import { buildSalesCsv, getReportData, resolveRange } from "@/lib/services/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await requirePermission("reports.view");

  const { searchParams } = request.nextUrl;
  const preset = searchParams.get("preset") ?? "30d";
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const range = resolveRange(preset, from, to);

  const data = await getReportData(range);
  const csv = buildSalesCsv(data.sales);
  const filename = `manuella-sales-${range.fromISO.slice(0, 10)}-to-${range.toISO.slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}