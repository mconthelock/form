import { showflow } from "@amec/webasset/api/webform";
import { host } from '../../utils';

$(document).ready(async function () {
    const { nfrmno, vorgno, cyear, cyear2, nrunno } = $(".form-data").data();
    // console.log(host);
    // console.log(nfrmno, vorgno, cyear, cyear2, nrunno);
    const flow = await showflow(
        {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: nrunno,
        }
    );
    $(".flow").html(flow.html);

    const data = await $.ajax({
        type: "POST",
        url: `${host}psform/PS-ID/main/getDataForm`,
        data: {
            nfrmno: nfrmno,
            vorgno: vorgno,
            cyear: cyear,
            cyear2: cyear2,
            nrunno: nrunno,
        },
        dataType: "json",
    });

    // <tr class="hover:bg-base-200/40">
    //     <td class="text-center text-base-content/60">3</td>
    //     <td class="font-mono font-semibold text-base-content">RM-005-C</td>
    //     <td>
    //         <div class="font-semibold text-base-content">Copper Wire 1.5mm</div>
    //         <div class="text-xs text-base-content/60">Roll 100m</div>
    //     </td>
    //     <td class="text-sm text-base-content/80">DW-8820</td>
    //     <td class="text-right font-medium text-base-content/70">12</td>
    //     <td class="text-right font-semibold text-base-content">14</td>
    //     <td class="text-right">
    //         <span class="badge badge-warning badge-sm font-semibold">+2</span>
    //     </td>
    //     <td class="text-sm text-base-content/80">พบม้วนที่เบิกไปแล้วหน้างานนำมาคืน แต่ยังไม่ได้ทำรับเข้า</td>
    //     <td class="text-sm text-base-content/80">แจ้งฝ่ายสโตร์คีย์รับเข้าย้อนหลัง</td>
    // </tr>
    data.forEach((item, index) => {
        const ACTUAL_QTY = item.ACTUAL_QTY ?? item.ON_HAND;
        const DIFF = ACTUAL_QTY - item.ON_HAND;
        const diffClass = DIFF === 0 ? '' : (DIFF > 0 ? 'text-success' : 'text-error');
        const diffText = DIFF === 0 ? '-' : (DIFF > 0 ? `+${DIFF}` : `${DIFF}`);
        const row = `<tr class="hover:bg-base-200/40">
            <td class="text-center text-base-content/60">${index + 1}</td>
            <td class="font-mono font-semibold text-base-content">${item.ITEM_CODE}</td>
            <td>
                <div class="font-semibold text-base-content">${item.DESC}</div>
            </td>
            <td class="text-sm text-base-content/80">${item.DWG}</td>
            <td class="text-right font-medium text-base-content/70">${item.ON_HAND}</td>
            <td class="text-right font-semibold text-base-content">${ACTUAL_QTY}</td>
            <td class="text-right">
                <span class="${diffClass} font-semibold">${diffText}</span>
            </td>
            <td class="text-sm text-base-content/80">${item.REMARK}</td>
            <td class="text-sm text-base-content/80"></td>
        </tr>`;
        $("#data-table tbody").append(row);
    });

    $("#controller").text(data[0].SNAME);
    $("#zone").text(data[0].ZONE);
    const checkDate = data[0]?.CHECK_DATE;
    $("#check_date").text(checkDate ? new Date(checkDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');



    console.log("Data:", data);
});