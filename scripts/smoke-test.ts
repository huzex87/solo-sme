import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

console.log("=========================================");
console.log("    SOLO SME - SYSTEM SMOKE TEST         ");
console.log("=========================================\n");

async function checkSupabase() {
    console.log("Checking Supabase connection and tables...");
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("❌ Supabase keys missing in .env.local\n");
        return false;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check Tenants table
    try {
        const { data: tenants, error } = await supabase.from("tenants").select("id, name").limit(1);
        if (error) throw error;
        console.log(`✅ tenants table: OK (Found ${tenants.length} records)`);
    } catch (err: any) {
        console.error(`❌ tenants table check failed: ${err.message || err}`);
        return false;
    }

    // 2. Check Products table
    try {
        const { data: products, error } = await supabase.from("products").select("id, name").limit(1);
        if (error) throw error;
        console.log(`✅ products table: OK (Found ${products.length} records)`);
    } catch (err: any) {
        console.error(`❌ products table check failed: ${err.message || err}`);
        return false;
    }

    // 3. Check Orders table
    try {
        const { data: orders, error } = await supabase.from("orders").select("id").limit(1);
        if (error) throw error;
        console.log(`✅ orders table: OK (Found ${orders.length} records)`);
    } catch (err: any) {
        console.error(`❌ orders table check failed: ${err.message || err}`);
        return false;
    }

    // 4. Check Delivery Agents table (Logistics)
    try {
        const { data: agents, error } = await supabase.from("delivery_agents").select("id, name, city").limit(5);
        if (error) throw error;
        console.log(`✅ delivery_agents table: OK (Found ${agents.length} records)`);
        agents.forEach(a => console.log(`   - Rider: ${a.name} in ${a.city}`));
    } catch (err: any) {
        console.error(`❌ delivery_agents table check failed: ${err.message || err}`);
        return false;
    }

    return true;
}

async function checkGemini() {
    console.log("\nChecking Gemini AI API Key...");
    if (!geminiApiKey) {
        console.error("❌ GEMINI_API_KEY missing in .env.local\n");
        return false;
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: "Hello! Say 'Gemini Connection OK'" }] }]
        });
        const text = result.response.text();
        console.log(`✅ Gemini API Connection: OK (Response: "${text.trim()}")`);
        return true;
    } catch (err: any) {
        console.error(`❌ Gemini API Key check failed: ${err.message || err}`);
        return false;
    }
}

async function run() {
    const supabaseOk = await checkSupabase();
    const geminiOk = await checkGemini();

    console.log("\n=========================================");
    if (supabaseOk && geminiOk) {
        console.log("🎉 SMOKE TEST PASSED: ALL SYSTEMS FUNCTIONAL 🎉");
    } else {
        console.log("❌ SMOKE TEST FAILED: PLEASE CHECK LOGS ABOVE ❌");
    }
    console.log("=========================================");
}

run().catch(console.error);
