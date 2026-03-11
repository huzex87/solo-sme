import 'dotenv/config';
import { IntentEngine } from '../src/services/intentEngine';
import { WhatsAppCommandService } from '../src/services/whatsappCommandService';
import { WhatsAppAuthService } from '../src/services/whatsappAuthService';

/**
 * WhatsApp E2E Verification Script
 * Simulates inbound messages to verify Intent Classification and Command Execution.
 */

const TEST_CASES = [
    {
        name: 'Record Sale (English)',
        message: 'Sold 5 bags of rice for 25000 to Mallam Yusuf',
        expectedIntent: 'RECORD_SALE',
    },
    {
        name: 'Record Sale (Pidgin)',
        message: 'I don sell 3 cartons of malt to Alhaja for 4500',
        expectedIntent: 'RECORD_SALE',
    },
    {
        name: 'Check Inventory (Hausa)',
        message: 'Nawa ne shinkafa?',
        expectedIntent: 'CHECK_INVENTORY',
    },
    {
        name: 'Record Expense',
        message: 'Spent 4000 on generator fuel',
        expectedIntent: 'RECORD_EXPENSE',
    },
    {
        name: 'Business Advice',
        message: 'How can I sell more this month?',
        expectedIntent: 'BUSINESS_ADVICE',
    },
    {
        name: 'Void last sale',
        message: 'Cancel that last sale I made',
        expectedIntent: 'VOID_SALE',
    }
];

async function runTests() {
    console.log('🚀 Starting WhatsApp E2E Verification...\n');

    let passed = 0;

    for (const test of TEST_CASES) {
        console.log(`Testing: "${test.name}"`);
        console.log(`Message: "${test.message}"`);

        try {
            const result = await IntentEngine.classify(test.message);

            const intentMatch = result.intent === test.expectedIntent;

            if (intentMatch) {
                console.log(`✅ Intent Matched: ${result.intent}`);
                passed++;
            } else {
                console.log(`❌ Intent Mismatch: Expected ${test.expectedIntent}, got ${result.intent}`);
            }

            console.log(`Response: "${result.response_text}"`);
            console.log('---');
        } catch (err) {
            console.error(`💥 Error testing "${test.name}":`, err);
        }
    }

    console.log(`\nVerification Complete: ${passed}/${TEST_CASES.length} Passed`);
}

runTests().catch(console.error);
