import { NextRequest, NextResponse } from 'next/server';
import { RefundService, RefundReason } from '@/services/refundService';
import { createClient } from '@/lib/supabase/server';

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

    let body: { tenantId: string; amount: number; reason: RefundReason; notes?: string; restoreInventory?: boolean };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { tenantId, amount, reason, notes, restoreInventory } = body;

    if (!tenantId) return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    if (!amount || amount <= 0) return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    if (!reason) return NextResponse.json({ error: 'reason is required' }, { status: 400 });

    const validReasons: RefundReason[] = ['customer_request', 'damaged_item', 'wrong_item', 'not_delivered', 'duplicate_order', 'other'];
    if (!validReasons.includes(reason)) {
        return NextResponse.json({ error: `reason must be one of: ${validReasons.join(', ')}` }, { status: 400 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('tenant_id', tenantId)
        .single();

    if (!profile) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allowedRoles = ['owner', 'admin', 'manager'];
    if (!allowedRoles.includes(profile.role)) {
        return NextResponse.json({ error: 'Insufficient permissions to process refunds' }, { status: 403 });
    }

    const result = await RefundService.processRefund({
        orderId,
        tenantId,
        amount,
        reason,
        notes,
        actorId: user.id,
        restoreInventory: restoreInventory ?? false,
    });

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, refundId: result.refundId });
}
