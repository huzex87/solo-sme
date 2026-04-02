import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RefundService, RefundReason } from '@/services/refundService';

const VALID_REASONS: RefundReason[] = [
    'customer_request',
    'damaged_item',
    'wrong_item',
    'not_delivered',
    'duplicate_order',
    'other',
];

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await params;
    if (!orderId) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    let body: { tenantId?: string; amount?: number; reason?: string; notes?: string; restoreInventory?: boolean };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { tenantId, amount, reason, notes, restoreInventory } = body;

    if (!tenantId) {
        return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }
    if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'A positive refund amount is required' }, { status: 400 });
    }
    if (!reason || !VALID_REASONS.includes(reason as RefundReason)) {
        return NextResponse.json(
            { error: `reason must be one of: ${VALID_REASONS.join(', ')}` },
            { status: 400 }
        );
    }

    // Verify the user belongs to this tenant
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.tenant_id !== tenantId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['owner', 'admin', 'manager'].includes(profile.role)) {
        return NextResponse.json({ error: 'Insufficient permissions to process refunds' }, { status: 403 });
    }

    const result = await RefundService.processRefund({
        orderId,
        tenantId,
        amount,
        reason: reason as RefundReason,
        notes,
        actorId: user.id,
        restoreInventory: restoreInventory ?? false,
    });

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({ success: true, refundId: result.refundId });
}
