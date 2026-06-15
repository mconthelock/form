@extends('layouts/webflowTemplate')

@section('contents')
<style>
    .or-wrap {
        background: linear-gradient(135deg, #f1f5f9, #ffffff, #ecfeff);
        min-height: 100vh;
        padding: 12px;
    }

    .or-card {
        max-width: 1600px;
        margin: 0 auto;
        background: #fff;
        border-radius: 0 0 14px 14px;
        overflow: hidden;
        box-shadow: 0 18px 45px rgba(15, 23, 42, .12);
    }

    .or-header {
        background: linear-gradient(90deg, #00604f, #0093b5);
        color: #fff;
        text-align: center;
        padding: 10px 16px 18px;
    }

    .or-header h1 {
        font-size: 28px;
        font-weight: 800;
        margin: 0;
    }

    .or-header p {
        margin: 2px 0 0;
        font-size: 13px;
        font-weight: 700;
    }

    .or-table {
        width: calc(100% - 24px);
        margin: 12px;
        border-collapse: separate;
        border-spacing: 0;
        border: 1px solid #b7c8dc;
        border-radius: 12px;
        overflow: hidden;
        font-size: 14px;
    }

    .or-table th {
        width: 260px;
        background: #d7fbec;
        color: #00796b;
        font-weight: 800;
        text-align: left;
        vertical-align: top;
        padding: 10px 16px;
        border-right: 1px solid #b7c8dc;
        border-bottom: 1px solid #b7c8dc;
    }

    .or-table td {
        padding: 9px 14px;
        border-bottom: 1px solid #b7c8dc;
        color: #0f172a;
        vertical-align: top;
        min-height: 38px;
    }

    .or-table tr:last-child th,
    .or-table tr:last-child td {
        border-bottom: none;
    }

    .or-view-text {
        min-height: 26px;
        white-space: pre-wrap;
    }

    .or-link {
        color: #4f46e5;
        font-weight: 700;
        text-decoration: none;
        margin-right: 24px;
    }

    .or-link:hover {
        text-decoration: underline;
    }

    .flow-box {
        padding: 8px 12px;
        background: #f8fafc;
        border-bottom: 1px solid #b7c8dc;
    }

    .remark-box {
        width: 100%;
        min-height: 90px;
        border: 1px solid #b7c8dc;
        border-radius: 8px;
        padding: 10px;
        outline: none;
        resize: vertical;
    }

    .btn-zone {
        display: flex;
        justify-content: center;
        gap: 14px;
        padding: 16px 0 22px;
    }

    .btn-submit {
        min-width: 120px;
        border: none;
        border-radius: 999px;
        padding: 10px 28px;
        font-weight: 800;
        color: #fff;
        cursor: pointer;
        box-shadow: 0 6px 14px rgba(15, 23, 42, .16);
    }

    .btn-approve {
        background: #059669;
    }

    .btn-reject {
        background: #dc2626;
    }

    .file-link {
        display: inline-block;
        color: #2563eb;
        font-weight: 700;
        text-decoration: underline;
        margin-right: 18px;
        margin-bottom: 4px;
    }

    .req-star {
        color: red;
        font-weight: 900;
    }
</style>

<input type="hidden" id="nfrmno" value="{{ $NFRMNO }}">
<input type="hidden" id="vorgno" value="{{ $VORGNO }}">
<input type="hidden" id="cyear" value="{{ $CYEAR }}">
<input type="hidden" id="cyear2" value="{{ $CYEAR2 }}">
<input type="hidden" id="nrunno" value="{{ $NRUNNO }}">
<input type="hidden" id="empno" value="{{ $EMPNO ?? '' }}">
<input type="hidden" id="mode" value="{{ $mode ?? '' }}">
<input type="hidden" id="txt_exdata" value="{{ $exdata ?? '' }}">
<input type="hidden" id="base_url" value="{{ base_url() }}">

<div class="or-wrap">
    <div class="or-card">

        <div class="or-header">
            <h1>MFG OR Form</h1>
            <p>Operation Regulation (OR) - Production Department</p>
        </div>

        <div class="flow-box">
            <div class="flow"></div>
        </div>

        <table class="or-table">
            <tr>
                <th>Form No</th>
                <td>
                    <div id="v_form_no" data-formno="{{ $formno ?? '' }}" class="or-view-text">
                        {{ $formno ?? '-' }}
                    </div>
                </td>
            </tr>
            <tr>
                <th>Create By</th>
                <td>
                    <div id="v_create_by" class="or-view-text">Loading...</div>
                </td>
            </tr>

            <tr>
                <th>Request By</th>
                <td>
                    <div id="v_request_by" class="or-view-text">Loading...</div>
                </td>
            </tr>

            <tr>
                <th>Type form</th>
                <td>
                    <div id="v_type_form" class="or-view-text">-</div>
                    <div class="mt-1">
                        Current No. :
                        <span id="v_or_no">-</span>
                    </div>
                </td>
            </tr>

            <tr>
                <th>Classification</th>
                <td>
                    <div id="v_class" class="or-view-text">-</div>
                </td>
            </tr>

            <tr>
                <th>Topic</th>
                <td>
                    <div id="v_topic" class="or-view-text">-</div>
                </td>
            </tr>

            <tr>
                <th>DWG No</th>
                <td>
                    <div id="v_dwg_no" class="or-view-text">-</div>
                </td>
            </tr>

            <tr>
                <th>Shop No</th>
                <td>
                    <div id="v_shop_no" class="or-view-text">-</div>
                </td>
            </tr>

            <tr>
                <th>Item No</th>
                <td>
                    <div id="v_item_no" class="or-view-text">-</div>
                </td>
            </tr>

            <tr>
                <th>Apply For</th>
                <td>
                    <div id="v_apply_for" class="or-view-text">-</div>
                </td>
            </tr>

            <tr>
                <th>Rev</th>
                <td>
                    <div id="v_rev" class="or-view-text">-</div>
                </td>
            </tr>

            <tr>
                <th>Attach File</th>
                <td>
                    <div id="v_file_list">Loading...</div>
                </td>
            </tr>

            <tr>
                <th>Remark <span class="req-star">*</span></th>
                <td>
                    <textarea id="remark" class="remark-box" placeholder="Remark..."></textarea>
                </td>
            </tr>
        </table>

        <div class="btn-zone">
            <button type="button" data-action="approve" class="btn-submit btn-approve">
                Approve
            </button>

            <button type="button" data-action="reject" class="btn-submit btn-reject">
                Reject
            </button>
        </div>

    </div>
</div>

@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/mfg_or_approve.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection