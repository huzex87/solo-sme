import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();
        if (!phone) {
            return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
        }

        // Get current user's tenant
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: tenant } = await supabase
            .from('tenants')
            .select('id, name, business_config')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (!tenant) {
            return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
        }

        // Normalise phone: strip non-digits, add 234 prefix if needed
        let normalised = phone.replace(/\D/g, '');
        if (normalised.startsWith('0') && normalised.length === 11) {
            normalised = '234' + normalised.slice(1);
        }
        if (!normalised.startsWith('234')) {
            normalised = '234' + normalised;
        }

        // Use admin client to bypass RLS on whatsapp_phone_bindings
        const adminClient = await createAdminClient();

        // Deactivate any existing bindings for this phone
        await adminClient
            .from('whatsapp_phone_bindings')
            .update({ is_active: false })
            .eq('phone_number', normalised);

        // Also deactivate any existing bindings for this tenant
        await adminClient
            .from('whatsapp_phone_bindings')
            .update({ is_active: false })
            .eq('tenant_id', tenant.id);

        // Create new binding
        const { error: bindError } = await adminClient
            .from('whatsapp_phone_bindings')
            .upsert({
                tenant_id: tenant.id,
                phone_number: normalised,
                is_active: true,
                verified: true,
            }, {
                onConflict: 'phone_number'
            });

        if (bindError) {
            console.error('[WhatsApp Connect] Binding error:', bindError);
            // Try insert if upsert fails (no unique constraint on phone_number)
            const { error: insertError } = await adminClient
                .from('whatsapp_phone_bindings')
                .insert({
                    tenant_id: tenant.id,
                    phone_number: normalised,
                    is_active: true,
                    verified: true,
                });
            if (insertError) {
                console.error('[WhatsApp Connect] Insert error:', insertError);
                return NextResponse.json({ error: 'Failed to create phone binding' }, { status: 500 });
            }
        }

        // Also update business_config with the phone
        const updatedConfig = {
            ...(tenant.business_config || {}),
            whatsapp_number: phone,
            phone: phone,
        };

        await adminClient
            .from('tenants')
            .update({ business_config: updatedConfig })
            .eq('id', tenant.id);

        console.log(`[WhatsApp Connect] Bound ${normalised} → tenant ${tenant.id} (${tenant.name})`);

        return NextResponse.json({
            success: true,
            phone: normalised,
            tenant_id: tenant.id,
        });
    } catch (err) {
        console.error('[WhatsApp Connect] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
