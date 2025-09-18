@extends('layouts/webflowTemplate')

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" cyear2="{{ $CYEAR2 }}"
    nrunno="{{ $NRUNNO }}" seq="{{ $seq }}" empno="{{$empno}}"></div>
<div class="flex flex-col gap-5">
    <div
        class="flex flex-col gap-5 p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc] relative">
        <u class="flex flex-col items-center mb-5">
            <span class="text-2xl font-bold">Quality Built In Line Audit Report</span>
            <span class="text-2xl font-bold">Strengthen Trouble Report After Shipment</span>
        </u>
        <div id="rev" class="absolute left-4 text-sm text-gray-500 font-bold"></div>
        <div id="score" class="lg:absolute right-8"></div>
        <div class="flex flex-col xl:flex-row gap-5 justify-between mt-10">
            <div class="overflow-auto w-full xl:w-1/2">
                <div id="detail"></div>
            </div>
            <div class="overflow-y-auto w-full xl:w-fit xl:max-w-[45vw] max-h-48 rounded shadow">
                <div id="tableRevision"></div>
            </div>
        </div>
        <div id="part1" class="flex flex-col gap-3">
            <div class="text-2xl font-bold italic underline">
                Part I: Self inspection audit item
            </div>
            <div id="auditReport"></div>
        </div>
        <div class="flex flex-col xl:flex-row gap-5 justify-between">
            <div id="comment-suggestion">
                <div class="text-2xl font-bold underline">
                    Comment/Suggestion
                </div>
                <table class="table">
                    <colgroup>
                        <col class="w-fit border">
                        <col class="w-fit border">
                    </colgroup>
                    <tr>
                        <td class="text-center font-bold">C</td>
                        <td>Comment(Must improvement) ข้อคิดเห็นต้องมีการปรับปรุง</td>
                    </tr>
                    <tr>
                        <td class="text-center font-bold">S</td>
                        <td>Suggestion(No need improvement) ข้อเสนอแนะไม่จำเป็นต้องปรับปรุง</td>
                    </tr>
                </table>
            </div>
            <div id="score-rank">
                <div class="text-2xl font-bold underline">
                    Score Ranking
                </div>
                <table class="table">
                    <colgroup>
                        <col class="w-fit border">
                        <col class="w-fit border">
                    </colgroup>
                    <tr>
                        <td class="text-center">0</td>
                        <td>ไม่เข้าใจวิธีการตรวจสอบงาน และไม่เข้าใจระบบ E-check sheet</td>
                    </tr>
                    <tr>
                        <td class="text-center">1</td>
                        <td>เข้าใจในการตรวจสอบคุณภาพ และเข้าใจระบบ E-check sheet ในระดับน้อย (ต้องปรับปรุง)</td>
                    </tr>
                    <tr>
                        <td class="text-center">2</td>
                        <td>เข้าใจในการตรวจสอบคุณภาพ และเข้าใจระบบ E-check sheet ในระดับปานกลาง
                            (สามารถปฏิบัติงานด้วยตนเองได้)</td>
                    </tr>
                    <tr>
                        <td class="text-center">3</td>
                        <td>เข้าใจในการตรวจสอบคุณภาพ และเข้าใจระบบ E-check sheet ในระดับดีมาก (สามารถปฏิบัติงานด้วยตนเอง
                            และสอนผู้อื่นได้)</td>
                    </tr>
                </table>
            </div>
        </div>
        <div id="part2">
            <div class="text-2xl font-bold italic underline">
                Part II: Summary comment/suggestion Result
            </div>
            <div id="tableCS"></div>
        </div>

        <div id="action" class="flex gap-5"></div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/eSelfAudit.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection