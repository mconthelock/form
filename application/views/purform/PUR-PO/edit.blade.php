@extends('layouts/webflowTemplate')

@section('contents')
<div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between border-b pb-4">
        <div>
            <h1 class="text-2xl font-bold">
                Purchase Order Approval (PUR-PO) — {{ $isDraft ? 'Draft Edit' : 'Returned for Revision' }}
            </h1>
            <p class="text-sm opacity-70">
                Form #{{ $formKey['NFRMNO'] }}-{{ $formKey['VORGNO'] }}-{{ $formKey['CYEAR'] }}-{{ $formKey['CYEAR2'] }}-{{ $formKey['NRUNNO'] }}
                | PO No: <strong>{{ $purpo['ORD_PONO'] ?? '-' }}</strong>
                | DocRev: {{ $purpo['ORD_DOCREV'] ?? 1 }} | Revision: {{ $purpo['ORD_REVISION'] ?? 0 }}
            </p>
        </div>
        <span class="badge badge-warning badge-lg">{{ $isDraft ? 'DRAFT' : 'RETURNED' }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200 p-4 rounded-box">
        <div><span class="font-semibold">Vendor:</span> {{ $purpo['VENDORCODE'] ?? '-' }} ({{ $purpo['VENDOR_NAME'] ?? '-' }})</div>
        <div><span class="font-semibold">Currency:</span> {{ $purpo['ORD_CURRENCY'] ?? 'THB' }}</div>
        <div><span class="font-semibold">Buyer:</span> {{ $purpo['BUYER_EMPNO'] ?? '-' }}</div>
        <div>
            <label class="label"><span class="label-text font-semibold">Ship To</span></label>
            <input id="shipTo" type="text" class="input input-bordered input-sm w-full" value="{{ $order['plantCode'] ?? '' }}" />
        </div>
        <div>
            <label class="label"><span class="label-text font-semibold">Payment Terms</span></label>
            <input id="payment" type="text" class="input input-bordered input-sm w-full" value="{{ $order['paymentTerms'] ?? '' }}" />
        </div>
        <div>
            <label class="label"><span class="label-text font-semibold">Trade Terms</span></label>
            <input id="trade" type="text" class="input input-bordered input-sm w-full" value="{{ $order['tradeTerms'] ?? '' }}" />
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="table table-zebra w-full" id="poItemsTable">
            <thead>
                <tr>
                    <th>Line</th>
                    <th>Part No</th>
                    <th>Description</th>
                    <th class="w-28">Qty</th>
                    <th class="w-20">Unit</th>
                    <th class="w-32">Unit Price</th>
                    <th class="w-36">Due Date</th>
                    <th class="text-right">Line Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach (($order['items'] ?? []) as $item)
                <tr data-ordd-id="{{ $item['id'] }}">
                    <td>{{ $item['lineNo'] }}</td>
                    <td>{{ $item['partNo'] }}</td>
                    <td>
                        <input type="text" class="input input-bordered input-xs w-full item-desc" value="{{ $item['description'] }}" />
                    </td>
                    <td>
                        <input type="number" step="0.0001" min="0" class="input input-bordered input-xs w-full item-qty" value="{{ $item['orderedQty'] }}" />
                    </td>
                    <td>{{ $item['unit'] }}</td>
                    <td>
                        <input type="number" step="0.0001" min="0" class="input input-bordered input-xs w-full item-price" value="{{ $item['unitPrice'] }}" />
                    </td>
                    <td>
                        <input type="date" class="input input-bordered input-xs w-full item-due" value="{{ $item['dueDate'] }}" />
                    </td>
                    <td class="text-right font-mono item-total">
                        {{ number_format(($item['orderedQty'] ?? 0) * ($item['unitPrice'] ?? 0), 2) }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div>
        <label class="label"><span class="label-text font-semibold">Buyer Comment / Remark</span></label>
        <textarea id="buyerComment" class="textarea textarea-bordered w-full" rows="3">{{ $order['buyerComment'] ?? ($purpo['REMARK'] ?? '') }}</textarea>
    </div>

    <div class="flex gap-3 justify-end">
        <button id="btnSaveDraft" type="button" class="btn btn-outline">Save Draft</button>
        <button id="btnSubmitForm" type="button" class="btn btn-primary">Submit for Approval</button>
    </div>
</div>

<script>
(function() {
    const baseUrl = "{{ base_url('purform/PUR-PO/form') }}";
    const ordId = {{ (int)($purpo['ORD_ID'] ?? 0) }};
    const empno = "{{ $empno }}";
    const formKey = @json($formKey);

    function collectDraft() {
        const items = [];
        document.querySelectorAll('#poItemsTable tbody tr').forEach((tr) => {
            items.push({
                orddId: Number(tr.dataset.orddId),
                description: tr.querySelector('.item-desc').value,
                qty: Number(tr.querySelector('.item-qty').value),
                price: Number(tr.querySelector('.item-price').value),
                dueDate: tr.querySelector('.item-due').value,
            });
        });
        return {
            buyerComment: document.getElementById('buyerComment').value,
            shipTo: document.getElementById('shipTo').value,
            payment: document.getElementById('payment').value,
            trade: document.getElementById('trade').value,
            items,
        };
    }

    document.getElementById('btnSaveDraft').addEventListener('click', async () => {
        const res = await fetch(`${baseUrl}/saveDraft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ordId, draft: collectDraft() }),
        });
        const data = await res.json();
        alert(data.status ? 'Draft saved successfully' : ('Failed: ' + (data.message || 'Unknown error')));
    });

    document.getElementById('btnSubmitForm').addEventListener('click', async () => {
        if (!confirm('ยืนยันส่งใบสั่งซื้อเข้าสู่ขั้นตอนการอนุมัติ?')) return;
        const draft = collectDraft();
        const res = await fetch(`${baseUrl}/submitForm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ordId,
                draft,
                form: { ...formKey, EMPNO: empno, REMARK: draft.buyerComment },
            }),
        });
        const data = await res.json();
        if (data.status) {
            alert('ส่งขออนุมัติเรียบร้อยแล้ว');
            window.location.reload();
        } else {
            alert('Error: ' + (data.message || 'Submit failed'));
        }
    });
})();
</script>
@endsection
