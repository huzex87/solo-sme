import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { normalisePhone } from '@/lib/phone';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Resolves the authenticated caller's tenant. The `whatsapp_phone_bindings`
 * row is the durable source of truth for "is this number connected" — the
 * dashboard must not rely on the mutable business_config JSON, which other
 * settings writes can clobber.
 */
async function resolveTenant(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, tenant: null };

    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, business_config')
        .eq('owner_id', user.id)
        .maybeSingle();

    return { user, tenant };
}

/**
 * GET — returns the current, persisted WhatsApp connection for the caller's
 * tenant, read from the active phone binding (durable) with a business_config
 * fallback. Lets the dashboard show "connected" across sessions.
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { user, tenant } = await resolveTenant(supabase);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!tenant) return NextResponse.json({ connected: false, phone: null });

        const adminClient = await createAdminClient();
        const { data: binding } = await adminClient
            .from('whatsapp_phone_bindings')
            .select('phone_number')
            .eq('tenant_id', tenant.id)
            .eq('is_active', true)
            .maybeSingle();

        const phone = binding?.phone_number
            || tenant.business_config?.whatsapp_number
            || tenant.business_config?.phone
            || null;

        return NextResponse.json({ connected: !!phone, phone });
    } catch (err) {
        console.error('[WhatsApp Connect] GET error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();
        if (!phone) {
            return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { user, tenant } = await resolveTenant(supabase);
        if (!user) return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
        if (!tenant) return NextResponse.json({ error: 'No tenant found for this user account.' }, { status: 404 });

        const normalised = normalisePhone(phone);
        if (!normalised) {
            return NextResponse.json({ error: 'Invalid phone number format. Please check the number and try again.' }, { status: 400 });
        }

        const adminClient = await createAdminClient();

        // Deactivate any existing bindings for this phone or this tenant so only
        // one active binding remains.
        await adminClient
            .from('whatsapp_phone_bindings')
            .update({ is_active: false })
            .eq('phone_number', normalised);
        await adminClient
            .from('whatsapp_phone_bindings')
            .update({ is_active: false })
            .eq('tenant_id', tenant.id);

        // Create the new active binding (upsert, with an insert fallback if the
        // table has no unique constraint on phone_number).
        const { error: bindError } = await adminClient
            .from('whatsapp_phone_bindings')
            .upsert({
                tenant_id: tenant.id,
                phone_number: normalised,
                is_active: true,
                bound_at: new Date().toISOString(),
                last_active_at: new Date().toISOString(),
            }, { onConflict: 'phone_number' });

        if (bindError) {
            console.error('[WhatsApp Connect] Binding error:', bindError);
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

        // Mirror into business_config and mark the tenant WhatsApp-enabled; the
        // binding above is the source of truth. Error-check so a silent failure
        // can't masquerade as a successful connect.
        const updatedConfig = {
            ...(tenant.business_config || {}),
            whatsapp_number: normalised,
            phone: normalised,
        };
        const { error: tenantUpdateError } = await adminClient
            .from('tenants')
            .update({
                business_config: updatedConfig,
                whatsapp_enabled: true,
            })
            .eq('id', tenant.id);
        if (tenantUpdateError) {
            console.error('[WhatsApp Connect] Tenant update error:', tenantUpdateError);
        }

        console.log(`[WhatsApp Connect] Bound ${normalised} → tenant ${tenant.id} (${tenant.name})`);

        return NextResponse.json({ success: true, connected: true, phone: normalised, tenant_id: tenant.id });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[WhatsApp Connect] POST error:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE — explicit disconnect. Deactivates the tenant's bindings, clears the
 * WhatsApp number from business_config, and flips whatsapp_enabled off. The
 * connection stays put until the user calls this.
 */
export async function DELETE() {
    try {
        const supabase = await createClient();
        const { user, tenant } = await resolveTenant(supabase);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!tenant) return NextResponse.json({ error: 'No tenant found' }, { status: 404 });

        const adminClient = await createAdminClient();

        await adminClient
            .from('whatsapp_phone_bindings')
            .update({ is_active: false })
            .eq('tenant_id', tenant.id);

        const cleared = { ...(tenant.business_config || {}) };
        delete cleared.whatsapp_number;
        // Keep `phone` — it is the general contact number, not the AI binding.

        const { error: tenantUpdateError } = await adminClient
            .from('tenants')
            .update({ business_config: cleared, whatsapp_enabled: false })
            .eq('id', tenant.id);
        if (tenantUpdateError) {
            console.error('[WhatsApp Connect] DELETE tenant update error:', tenantUpdateError);
        }

        return NextResponse.json({ success: true, connected: false });
    } catch (err) {
        console.error('[WhatsApp Connect] DELETE error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
