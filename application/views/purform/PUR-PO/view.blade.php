@extends('layouts/webflowTemplate')

@section('contents')
@php
    $cst = $wfForm['CST'] ?? '1';
    $statusLabel = ['0' => 'DRAFT', '1' => 'PENDING APPROVAL', '2' => 'APPROVED', '3' => 'REJECTED'][$cst] ?? $cst;
    $badgeClass = ['0' => 'badge-warning', '1' => 'badge-info', '2' => 'badge-success', '3' => 'badge-error'][$cst] ?? 'badge-neutral';
@endphp
<div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between border-b pb-4">
        <div>
            <h1 class="text-2xl font-bold">Purchase Order Approval (PUR-PO)</h1>
            <p class="text-sm opacity-70">
                Form #{{ $formKey['NFRMNO'] }}-{{ $formKey['VORGNO'] }}-{{ $formKey['CYEAR'] }}-{{ $formKey['CYEAR2'] }}-{{ $formKey['NRUNNO'] }}
                | PO No: <strong>{{ $purpo['ORD_PONO'] ?? '-' }}</strong>
                | DocRev: {{ $purpo['ORD_DOCREV'] ?? 1 }} | Revision: {{ $order['revision'] ?? ($purpo['ORD_REVISION'] ?? 0) }}
            </p>
        </div>
        <span class="badge {{ $badgeClass }} badge-lg">{{ $statusLabel }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200 p-4 rounded-box text-sm">
        <div><span class="font-semibold">Vendor:</span> {{ $purpo['VENDORCODE'] ?? '-' }} ({{ $purpo['VENDOR_NAME'] ?? '-' }})</div>
        <div><span class="font-semibold">Total Amount:</span> {{ number_format($order['totalAmount'] ?? ($purpo['ORD_AMOUNT'] ?? 0), 2) }} {{ $purpo['ORD_CURRENCY'] ?? 'THB' }}</div>
        <div><span class="font-semibold">Buyer:</span> {{ $purpo['BUYER_EMPNO'] ?? '-' }}</div>
        <div><span class="font-semibold">Ship To:</span> {{ $order['plantCode'] ?? '-' }}</div>
        <div><span class="font-semibold">Payment:</span> {{ $order['paymentTerms'] ?? '-' }}</div>
        <div><span class="font-semibold">Trade Terms:</span> {{ $order['tradeTerms'] ?? '-' }}</div>
    </div>

    <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr>
                    <th>Line</th>
                    <th>Part No</th>
                    <th>Description</th>
                    <th class="text-right">Qty</th>
                    <th>Unit</th>
                    <th class="text-right">Unit Price</th>
                    <th>Due Date</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach (($order['items'] ?? []) as $item)
                <tr>
                    <td>{{ $item['lineNo'] }}</td>
                    <td>{{ $item['partNo'] }}</td>
                    <td>{{ $item['description'] }}</td>
                    <td class="text-right">{{ number_format($item['orderedQty'], 2) }}</td>
                    <td>{{ $item['unit'] }}</td>
                    <td class="text-right">{{ number_format($item['unitPrice'], 2) }}</td>
                    <td>{{ $item['dueDate'] }}</td>
                    <td class="text-right font-mono">{{ number_format($item['orderedQty'] * $item['unitPrice'], 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if ($canApprove)
    <div class="card bg-base-200 p-4 space-y-3">
        <h3 class="font-bold">Approver Action</h3>
        <textarea id="approverRemark" class="textarea textarea-bordered w-full" rows="2" placeholder="Remark (จำเป็นกรณี Return / Reject)"></textarea>
        <div class="flex gap-2 justify-end">
            <button type="button" class="btn btn-error btn-outline" onclick="doAction('reject')">Reject</button>
            <button type="button" class="btn btn-warning btn-outline" onclick="doAction('return')">Return to Buyer</button>
            <button type="button" class="btn btn-success" onclick="doAction('approve')">Approve</button>
        </div>
    </div>
    @endif

    @if ($cst === '3')
    <div class="flex justify-end">
        <button type="button" class="btn btn-primary" onclick="recreateFromRejected()">
            แก้ไขและส่งขออนุมัติใหม่ (Create New Draft Form)
        </button>
    </div>
    @endif
</div>

<script>
const baseUrl = "{{ base_url('purform/PUR-PO/form') }}";
const empno = "{{ $empno }}";
const formKey = @json($formKey);

async function doAction(action) {
    const remark = document.getElementById('approverRemark')?.value || '';
    if ((action === 'return' || action === 'reject') && !remark.trim()) {
        alert('กรุณาระบุเหตุผลในการ Return / Reject');
        return;
    }
    if (!confirm(`ยืนยันการทำรายการ ${action.toUpperCase()}?`)) return;
    const res = await fetch(`${baseUrl}/batchAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [formKey], action, empno, remark }),
    });
    const data = await res.json();
    if (data.status) {
        alert('บันทึกผลการพิจารณาเรียบร้อยแล้ว');
        window.location.reload();
    } else {
        alert('Error: ' + JSON.stringify(data.data?.failed || data.message));
    }
}

async function recreateFromRejected() {
    if (!confirm('สร้างฟอร์ม Draft ใบใหม่เพื่อแก้ไขและส่งขออนุมัติอีกครั้ง?')) return;
    const res = await fetch(`${baseUrl}/recreateFromRejected`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formKey, empno }),
    });
    const data = await res.json();
    if (data.status && data.data?.formUrl) {
        window.location.href = data.data.formUrl + '&empno=' + encodeURIComponent(empno);
    } else {
        alert('Error: ' + (data.message || 'Cannot recreate form'));
    }
}
</script>
@endsection
