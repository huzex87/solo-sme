/**
 * Server-side order repricing helpers.
 *
 * Order totals are computed client-side at checkout, so before charging we
 * re-derive the authoritative merchandise value from live product prices and
 * reject a charge that falls below what the items can legitimately cost.
 */

export interface RepriceItem {
    id?: string;
    price?: number;
    quantity?: number;
}

/** The only supported discount is the 15% group-buy, so the legitimate floor is 85%. */
export const GROUP_BUY_FACTOR = 0.85;

/**
 * Recomputes the line-item subtotal using authoritative DB prices, falling back
 * to the stored line price only when a product can't be resolved (e.g. deleted).
 */
export function computeServerSubtotal(items: RepriceItem[], priceById: Map<string, number>): number {
    let subtotal = 0;
    for (const item of items) {
        const qty = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
        const dbPrice = item.id ? priceById.get(item.id) : undefined;
        const unitPrice = dbPrice != null && Number.isFinite(dbPrice) ? dbPrice : Number(item.price) || 0;
        subtotal += unitPrice * qty;
    }
    return subtotal;
}

/**
 * The lowest amount that may legitimately be charged for the given merchandise
 * subtotal: 85% of it (max group-buy discount), minus a 1-unit rounding
 * tolerance. Delivery fee and tax only add to a charge, so the charged total
 * must never dip below this.
 */
export function minLegitimateCharge(serverSubtotal: number): number {
    return Math.round(serverSubtotal * GROUP_BUY_FACTOR) - 1;
}

/** True when `amount` is below the legitimate floor for `serverSubtotal`. */
export function isAmountBelowFloor(amount: number, serverSubtotal: number): boolean {
    if (!(serverSubtotal > 0)) return false; // can't reprice — don't block
    return amount < minLegitimateCharge(serverSubtotal);
}
