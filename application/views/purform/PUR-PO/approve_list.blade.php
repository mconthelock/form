@extends('layouts/webflowTemplate')

@section('contents')
<div class="max-w-7xl mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between border-b pb-4">
        <div>
            <h1 class="text-2xl font-bold">PUR-PO Batch Approval</h1>
            <p class="text-sm opacity-70">รายการใบสั่งซื้อที่รอการอนุมัติสำหรับรหัสพนักงาน: <strong>{{ $empno ?: '-' }}</strong></p>
        </div>
        <div class="flex gap-2">
            <button type="button" class="btn btn-warning btn-outline btn-sm" onclick="submitBatch('return')">Return Selected</button>
            <button type="button" class="btn btn-error btn-outline btn-sm" onclick="submitBatch('reject')">Reject Selected</button>
            <button type="button" class="btn btn-success btn-sm" onclick="submitBatch('approve')">Approve Selected</button>
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr>
                    <th class="w-10"><input type="checkbox" id="checkAll" class="checkbox checkbox-sm" /></th>
                    <th>Form No</th>
                    <th>PO No</th>
                    <th>Type</th>
                    <th>Vendor</th>
                    <th class="text-right">Amount</th>
                    <th>Buyer</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($pending as $row)
                @php $k = $row['formKey']; $p = $row['purpo']; @endphp
                <tr>
                    <td>
                        <input type="checkbox" class="checkbox checkbox-sm row-check"
                               data-key='@json($k)' />
                    </td>
                    <td class="font-mono text-xs">{{ $k['NFRMNO'] }}-{{ $k['VORGNO'] }}-{{ $k['CYEAR'] }}-{{ $k['CYEAR2'] }}-{{ $k['NRUNNO'] }}</td>
                    <td class="font-semibold">
                        {{ $p['ORD_PONO'] }}
                        @if (!empty($p['IS_REVISE']))
                            <span class="badge badge-accent badge-xs ml-1">REVISE</span>
                        @endif
                    </td>
                    <td>{{ $p['ORD_TYPE'] }}</td>
                    <td>{{ $p['VENDORCODE'] }} - {{ $p['VENDOR_NAME'] }}</td>
                    <td class="text-right font-mono">{{ number_format($p['ORD_AMOUNT'], 2) }} {{ $p['ORD_CURRENCY'] }}</td>
                    <td>{{ $p['BUYER_EMPNO'] }}</td>
                    <td>
                        <a class="btn btn-xs btn-outline"
                           href="{{ base_url('purform/PUR-PO/form/main') }}?no={{ $k['NFRMNO'] }}&orgNo={{ $k['VORGNO'] }}&y={{ $k['CYEAR'] }}&y2={{ $k['CYEAR2'] }}&runNo={{ $k['NRUNNO'] }}&empno={{ urlencode($empno) }}">
                            View Detail
                        </a>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" class="text-center py-8 opacity-60">ไม่มีรายการใบสั่งซื้อที่รออนุมัติ</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<script>
const baseUrl = "{{ base_url('purform/PUR-PO/form') }}";
const empno = "{{ $empno }}";

document.getElementById('checkAll')?.addEventListener('change', (e) => {
    document.querySelectorAll('.row-check').forEach((cb) => {
        cb.checked = e.target.checked;
    });
});

async function submitBatch(action) {
    const items = [];
    document.querySelectorAll('.row-check:checked').forEach((cb) => {
        items.push(JSON.parse(cb.dataset.key));
    });
    if (items.length === 0) {
        alert('กรุณาเลือกอย่างน้อย 1 รายการ');
        return;
    }
    let remark = '';
    if (action !== 'approve') {
        remark = prompt(`กรุณาระบุเหตุผลสำหรับ ${action.toUpperCase()}:`) || '';
        if (!remark.trim()) return;
    }
    if (!confirm(`ยืนยัน ${action.toUpperCase()} จำนวน ${items.length} รายการ?`)) return;

    const res = await fetch(`${baseUrl}/batchAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, action, empno, remark }),
    });
    const data = await res.json();
    const ok = data.data?.succeededCount ?? 0;
    const fail = data.data?.failedCount ?? 0;
    alert(`เสร็จสิ้น: สำเร็จ ${ok} รายการ, ไม่สำเร็จ ${fail} รายการ`);
    window.location.reload();
}
</script>
@endsection
