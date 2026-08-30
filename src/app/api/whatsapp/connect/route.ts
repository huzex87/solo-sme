import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { normalisePhone } from '@/lib/phone';

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
            return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
        }

        const { data: tenant } = await supabase
            .from('tenants')
            .select('id, name, business_config')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (!tenant) {
            return NextResponse.json({ error: 'No tenant found for this user account.' }, { status: 404 });
        }

        // Normalise phone number
        const normalised = normalisePhone(phone);
        if (!normalised) {
            return NextResponse.json({ error: 'Invalid phone number format. Please check the number and try again.' }, { status: 400 });
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
                bound_at: new Date().toISOString(),
                last_active_at: new Date().toISOString(),
            }, {
                onConflict: 'phone_number'
            });

        if (bindError) {
            console.error('[WhatsApp Connect] Binding error:', bindError);
            // Try insert if upsert fails
            const { error: insertError } = await adminClient
                .from('whatsapp_phone_bindings')
                .insert({
                    tenant_id: tenant.id,
                    phone_number: normalised,
                    is_active: true,
                    bound_at: new Date().toISOString(),
                    last_active_at: new Date().toISOString(),
                });
            if (insertError) {
                console.error('[WhatsApp Connect] Insert error:', insertError);
                return NextResponse.json({ error: `Failed to create phone binding: ${insertError.message}` }, { status: 500 });
            }
        }

        // Also update business_config and set whatsapp_enabled = true
        const updatedConfig = {
            ...(tenant.business_config || {}),
            whatsapp_number: normalised,
            phone: normalised,
        };

        const { error: tenantUpdateError } = await adminClient
            .from('tenants')
            .update({
                business_config: updatedConfig,
                whatsapp_enabled: true
            })
            .eq('id', tenant.id);

        if (tenantUpdateError) {
            console.error('[WhatsApp Connect] Tenant update error:', tenantUpdateError);
        }

        console.log(`[WhatsApp Connect] Bound ${normalised} → tenant ${tenant.id} (${tenant.name})`);

        return NextResponse.json({
            success: true,
            phone: normalised,
            tenant_id: tenant.id,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[WhatsApp Connect] Error:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
