import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function assignSuperAdmin(email: string) {
    console.log(`[SuperAdmin] Assigning superadmin to: ${email}`);

    // 1. Get user by email
    const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
    if (fetchError) {
        console.error("Error fetching users:", fetchError);
        return;
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
        console.error(`User with email ${email} not found.`);
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // 2. Update profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_superadmin: true })
        .eq('id', user.id);

    if (updateError) {
        console.error("Error updating profile:", updateError);
        return;
    }

    console.log(`Successfully promoted ${email} to Super Admin.`);
}

const targetEmail = process.argv[2];
if (!targetEmail) {
    console.error("Please provide an email address as the first argument.");
    console.error("Usage: npx ts-node scripts/assign-superadmin.ts user@example.com");
} else {
    assignSuperAdmin(targetEmail).catch(console.error);
}
