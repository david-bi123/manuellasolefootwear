// Client-safe constants shared between server models and client components.
// Kept free of any database / Node imports so it can be bundled for the browser.

export const PAYMENT_METHODS = ["Cash", "Mobile Money", "Bank Transfer", "Other"] as const;
export const PAYMENT_STATUSES = ["Paid", "Partially Paid", "Pending"] as const;
export const SALE_STATUSES = ["Completed", "Partially Returned", "Returned", "Cancelled"] as const;

export const GENDERS = ["Men", "Women", "Unisex"] as const;
export const SIZING_SYSTEMS = ["UK", "EU"] as const;

export const MOVEMENT_TYPES = [
  "Initial stock",
  "Restock",
  "Sale",
  "Return",
  "Cancellation",
  "Adjustment",
] as const;