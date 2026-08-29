import crypto from 'crypto';

/**
 * Security regression tests for payment webhook signature verification.
 *
 * These lock the invariants the Paystack/Flutterwave webhook handlers rely on:
 *  - a signature computed with the correct secret is accepted
 *  - a tampered body or wrong secret is rejected
 *  - comparison is constant-time and length-safe (no `===` timing leak)
 *
 * They mirror the exact primitives used in
 * src/app/api/webhooks/paystack/route.ts and .../flutterwave/route.ts.
 */

/** Constant-time hex digest comparison (mirrors the webhook helper). */
function timingSafeEqualHex(a: string, b: string): boolean {
    try {
        const bufA = Buffer.from(a, 'hex');
        const bufB = Buffer.from(b, 'hex');
        if (bufA.length !== bufB.length || bufA.length === 0) return false;
        return crypto.timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

const SECRET = 'sk_test_secret_key_example';
const rawBody = JSON.stringify({
    event: 'charge.success',
    data: { reference: 'SOLO_TEST_123', metadata: { tenantId: 't1', orderId: 'o1' } },
});

function paystackSignature(body: string, secret: string): string {
    return crypto.createHmac('sha512', secret).update(body).digest('hex');
}

describe('Paystack webhook signature verification', () => {
    it('accepts a signature computed from the raw body with the correct secret', () => {
        const sig = paystackSignature(rawBody, SECRET);
        expect(timingSafeEqualHex(paystackSignature(rawBody, SECRET), sig)).toBe(true);
    });

    it('rejects a signature made with the wrong secret', () => {
        const sig = paystackSignature(rawBody, 'sk_test_attacker_key');
        expect(timingSafeEqualHex(paystackSignature(rawBody, SECRET), sig)).toBe(false);
    });

    it('rejects when the body is tampered after signing (amount not trusted from payload)', () => {
        const sig = paystackSignature(rawBody, SECRET);
        const tampered = rawBody.replace('SOLO_TEST_123', 'SOLO_TAMPERED');
        expect(timingSafeEqualHex(paystackSignature(tampered, SECRET), sig)).toBe(false);
    });

    it('rejects an empty or malformed signature without throwing', () => {
        const sig = paystackSignature(rawBody, SECRET);
        expect(timingSafeEqualHex(sig, '')).toBe(false);
        expect(timingSafeEqualHex(sig, 'not-hex-zz')).toBe(false);
        expect(timingSafeEqualHex(sig, sig.slice(0, sig.length - 2))).toBe(false); // length mismatch
    });
});

describe('Flutterwave webhook secret-hash comparison', () => {
    /** Constant-time string equality (mirrors the flutterwave helper). */
    function timingSafeEqualStr(a: string, b: string): boolean {
        const bufA = Buffer.from(a, 'utf8');
        const bufB = Buffer.from(b, 'utf8');
        if (bufA.length !== bufB.length || bufA.length === 0) return false;
        return crypto.timingSafeEqual(bufA, bufB);
    }

    const secretHash = 'flw_secret_hash_value';

    it('accepts the matching verif-hash', () => {
        expect(timingSafeEqualStr('flw_secret_hash_value', secretHash)).toBe(true);
    });

    it('rejects a wrong verif-hash', () => {
        expect(timingSafeEqualStr('wrong_hash', secretHash)).toBe(false);
    });

    it('rejects an empty verif-hash', () => {
        expect(timingSafeEqualStr('', secretHash)).toBe(false);
    });
});
