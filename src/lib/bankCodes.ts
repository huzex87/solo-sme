/**
 * Paystack Bank Codes for Nigerian Banks
 * Used for creating and routing settlements to subaccounts.
 */
export const NIGERIAN_BANKS = [
    { name: 'Access Bank', code: '044' },
    { name: 'Access Bank (Diamond)', code: '063' },
    { name: 'Citibank', code: '023' },
    { name: 'Ecobank Nigeria', code: '050' },
    { name: 'Fidelity Bank', code: '070' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'First City Monument Bank (FCMB)', code: '214' },
    { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
    { name: 'Heritage Bank', code: '030' },
    { name: 'Keystone Bank', code: '082' },
    { name: 'Kuda Bank', code: '50211' },
    { name: 'Moniepoint MFB', code: '50515' },
    { name: 'OPay', code: '999992' },
    { name: 'PalmPay', code: '999991' },
    { name: 'Providus Bank', code: '101' },
    { name: 'Stanbic IBTC Bank', code: '221' },
    { name: 'Standard Chartered Bank', code: '068' },
    { name: 'Sterling Bank', code: '232' },
    { name: 'Taj Bank', code: '302' },
    { name: 'Union Bank of Nigeria', code: '032' },
    { name: 'United Bank for Africa (UBA)', code: '033' },
    { name: 'Unity Bank', code: '215' },
    { name: 'VFD Microfinance Bank', code: '566' },
    { name: 'Wema Bank', code: '035' },
    { name: 'Zenith Bank', code: '057' }
] as const;

/**
 * Finds a bank code by matching the bank name.
 * Performs a normalized, case-insensitive substring search.
 */
export function getBankCode(bankName: string): string | undefined {
    if (!bankName) return undefined;
    
    const normalizedSearch = bankName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Exact or partial match
    const found = NIGERIAN_BANKS.find(b => {
        const normalizedName = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName);
    });
    
    return found?.code;
}
