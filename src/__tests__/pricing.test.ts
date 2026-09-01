import { computeServerSubtotal, isAmountBelowFloor, minLegitimateCharge, type RepriceItem } from '@/lib/pricing';

describe('computeServerSubtotal', () => {
    it('uses authoritative DB prices over the stored line price', () => {
        const items: RepriceItem[] = [{ id: 'p1', price: 1, quantity: 2 }]; // tampered price
        const priceById = new Map([['p1', 5000]]);
        expect(computeServerSubtotal(items, priceById)).toBe(10000); // 5000 * 2
    });

    it('falls back to the stored line price when the product is not found', () => {
        const items: RepriceItem[] = [{ id: 'missing', price: 3000, quantity: 1 }];
        expect(computeServerSubtotal(items, new Map())).toBe(3000);
    });

    it('defaults a missing/invalid quantity to 1', () => {
        const items: RepriceItem[] = [{ id: 'p1', quantity: 0 }, { id: 'p2' }];
        const priceById = new Map([['p1', 1000], ['p2', 2000]]);
        expect(computeServerSubtotal(items, priceById)).toBe(3000);
    });

    it('sums multiple line items', () => {
        const items: RepriceItem[] = [{ id: 'a', quantity: 2 }, { id: 'b', quantity: 3 }];
        const priceById = new Map([['a', 1000], ['b', 500]]);
        expect(computeServerSubtotal(items, priceById)).toBe(3500);
    });
});

describe('isAmountBelowFloor', () => {
    const subtotal = 10000;
    // floor = round(10000 * 0.85) - 1 = 8499

    it('rejects a charge well below the floor (tampered to pay ₦1)', () => {
        expect(isAmountBelowFloor(1, subtotal)).toBe(true);
    });

    it('accepts the full price', () => {
        expect(isAmountBelowFloor(10000, subtotal)).toBe(false);
    });

    it('accepts exactly the 15% group-buy discount', () => {
        expect(isAmountBelowFloor(8500, subtotal)).toBe(false); // 8500 >= 8499
    });

    it('accepts a total that is higher than subtotal (delivery + tax added)', () => {
        expect(isAmountBelowFloor(12500, subtotal)).toBe(false);
    });

    it('rejects a charge just under the discount floor', () => {
        expect(isAmountBelowFloor(minLegitimateCharge(subtotal) - 1, subtotal)).toBe(true);
    });

    it('does not block when the subtotal cannot be recomputed (0)', () => {
        expect(isAmountBelowFloor(1, 0)).toBe(false);
    });
});
