import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { host } from "../../utils.js";
import { createForm, getFormMasterByVaname } from "@amec/webasset/api/webform";

$(async function () {
    const params = new URLSearchParams(window.location.search);
    const nfrmno = params.get("no");
    const vorgno = params.get("orgNo");
    const cyear = params.get("y");
    const runno = params.get("runNo");
    const cyear2 = params.get("y2");
    const empno = params.get("empno");

    showLoader();
    const dataForm = await $.ajax({
        type: "POST",
        url: `${process.env.APP_API}/is-sef/getSessionByForm`,
        data: {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: runno,
        },
        dataType: "json"
    });

    const dataProject = dataForm.workPlan;
    console.log('Form Data:', { dataProject });

    const Criteria = await $.getJSON(`${process.env.APP_API}/is-sef/getCriteria`);
    const prog = Criteria.filter(c => c.SECTION === 'P');
    const app = Criteria.filter(c => c.SECTION === 'A');

    const progItems = prog.map(c => ({ num: parseInt(c.EVA_ID), en: c.NAME_EN, th: c.NAME_TH }));
    const appItems = app.map(c => ({ num: parseInt(c.EVA_ID), en: c.NAME_EN, th: c.NAME_TH }));

    const progIds = progItems.map(i => i.num);
    const appIds = appItems.map(i => i.num);
    const allIds = [...progIds, ...appIds];

    const scores = {};

    function scoreColors(v) {
        if (v === 5) return '#16a34a';
        if (v === 4) return '#65a30d';
        if (v === 3) return '#ca8a04';
        if (v === 2) return '#ea580c';
        return '#dc2626';
    }

    function buildRows(items, tbodyId) {
        const $tbody = $('#' + tbodyId);
        items.forEach(function (item, i) {
            const scoreId = 'score_' + item.num;
            scores[scoreId] = null;

            const scoreCells = [5, 4, 3, 2, 1].map(function (v) {
                return `<td style="padding:0.5rem; text-align:center;">
                    <button class="score-btn"
                        id="btn_${scoreId}_${v}"
                        data-id="${scoreId}"
                        data-value="${v}"
                        style="width:34px;height:34px;border-radius:50%;border:1.5px solid #e2e8f0;background:white;cursor:pointer;font-size:0.82rem;font-weight:600;color:#94a3b8;transition:all 0.15s;"
                    >${v}</button>
                </td>`;
            }).join('');

            const $tr = $('<tr>').css({
                borderBottom: '1px solid #f1f5f9',
                background: i % 2 === 0 ? 'white' : '#fafafa'
            }).html(`
                <td style="padding:0.6rem 0.5rem; text-align:center; color:#94a3b8; font-size:0.85rem;">${item.num}</td>
                <td style="padding:0.6rem 0.75rem; color:#1e293b; font-size:0.85rem; font-weight:500;">${item.en}</td>
                <td style="padding:0.6rem 0.75rem; color:#475569; font-size:0.83rem;">${item.th}</td>
                ${scoreCells}
                <td style="padding:0.5rem 0.75rem; text-align:center;">
                    <span id="disp_${scoreId}" style="display:inline-block;min-width:36px;padding:0.2rem 0.4rem;border-radius:6px;font-weight:700;font-size:0.95rem;color:#cbd5e1;">—</span>
                </td>
            `);
            $tbody.append($tr);
        });
    }

    function setScore(id, v) {
        scores[id] = v;
        [5, 4, 3, 2, 1].forEach(function (n) {
            const $btn = $('#btn_' + id + '_' + n);
            if (n === v) {
                $btn.css({ background: scoreColors(v), color: 'white', borderColor: scoreColors(v) }).addClass('sel');
            } else {
                $btn.css({ background: 'white', color: '#94a3b8', borderColor: '#e2e8f0' }).removeClass('sel');
            }
        });
        $('#disp_' + id).text(v).css({ color: scoreColors(v), background: scoreColors(v) + '18' });
        updateAverages();
    }

    function avg(ids) {
        const vals = ids.map(function (i) { return scores['score_' + i]; }).filter(function (v) { return v !== null; });
        if (!vals.length) return null;
        return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    }

    function levelLabel(a) {
        if (a === null) return { num: null, text: '—', color: '#94a3b8', bg: '#f1f5f9' };
        if (a >= 4.5) return { num: 5, text: '★★★★★ Excellent', color: '#14532d', bg: '#dcfce7' };
        if (a >= 3.5) return { num: 4, text: '★★★★ Good', color: '#365314', bg: '#ecfccb' };
        if (a >= 2.5) return { num: 3, text: '★★★ Fair', color: '#713f12', bg: '#fef9c3' };
        if (a >= 1.5) return { num: 2, text: '★★ Poor', color: '#7c2d12', bg: '#ffedd5' };
        return { num: 1, text: '★ Very Poor', color: '#7f1d1d', bg: '#fee2e2' };
    }

    function updateAverages() {
        const pA = avg(progIds);
        const aA = avg(appIds);
        const allScored = allIds
            .map(function (i) { return scores['score_' + i]; })
            .filter(function (v) { return v !== null; });
        const oA = allScored.length ? allScored.reduce(function (a, b) { return a + b; }, 0) / allScored.length : null;

        $('#progAvg').text(pA !== null ? pA.toFixed(2) : '—');
        $('#appAvg').text(aA !== null ? aA.toFixed(2) : '—');
        $('#overallAvg').text(oA !== null ? oA.toFixed(2) : '—');

        const lv = levelLabel(oA);
        $('#levelBadge').css({ background: lv.bg, borderColor: lv.color + '44' });
        $('#levelText').text(lv.text).css('color', lv.color);
    }

    function resetForm() {
        Object.keys(scores).forEach(function (id) {
            scores[id] = null;
            [5, 4, 3, 2, 1].forEach(function (n) {
                $('#btn_' + id + '_' + n).css({ background: 'white', color: '#94a3b8', borderColor: '#e2e8f0' }).removeClass('sel');
            });
            $('#disp_' + id).text('—').css({ color: '#cbd5e1', background: 'transparent' });
        });
        $('#projectName').val('');
        $('#comments').val('');
        updateAverages();
    }

    async function submitForm() {
        // const proj = $('#projectName').val();
        const proj = 1234;
        const empno = "24012";
        const missing = Object.values(scores).filter(function (v) { return v === null; }).length;
        // if (!proj) {
        //     alert('กรุณาระบุชื่อโปรเจกต์');
        //     return;
        // }
        if (missing > 0) {
            alert('กรุณาประเมินให้ครบทุกหัวข้อ (ยังขาดอีก ' + missing + ' หัวข้อ)');
            return;
        }
        const pA = avg(progIds);
        const aA = avg(appIds);
        const oA = allIds
            .map(function (i) { return scores['score_' + i]; })
            .reduce(function (a, b) { return a + b; }, 0) / allIds.length;
        const lv = levelLabel(oA);

        const scoreMap = Object.fromEntries(allIds.map(i => [i, scores['score_' + i]]));

        const formMst = await getFormMasterByVaname('IS-SEF');

        console.log(progIds, appIds, allIds);
        console.log('scoreMap:', scoreMap);
        // const nfrmno = formMst.NNO;
        // const vorgno = formMst.VORGNO;
        // const cyear = formMst.CYEAR;

        // const form_data = {
        //     NFRMNO: nfrmno,
        //     VORGNO: vorgno,
        //     CYEAR: cyear,
        //     REQBY: empno,
        //     INPUTBY: empno,
        //     REMARK: ""
        // };
        // const form = createForm(form_data);

        const data_scores = {
            PROJECT_ID: proj,
            REQBY: empno,
            INPUTBY: empno,
            REMARK: "",
            SCORE: scoreMap,
            PRO_AVG: pA,
            APP_AVG: aA,
            OVERALL_AVG: oA,
            LEVEL: lv.num,
            COMMENT: $('#comments').val() || ''
        };

        console.log(process.env.APP_API);
        await fetchUtils({
            url: process.env.APP_API + "/is-sef/insertForm",
            method: "POST",
            data: data_scores
        })
        // $.ajax({
        //     type: "POST",
        //     url: process.env.APP_API + "/is-sef/insertForm",
        //     data: JSON.stringify(data_scores),
        //     contentType: "application/json",
        //     dataType: "json",
        //     success: function (response) {
        //         console.log(response);
        //     },
        //     error: function (xhr, status, error) {
        //         console.error('Error submitting form:', error);
        //     }
        // });

        console.log('Form Master:', formMst);
        console.log(
            'บันทึกผลการประเมินความพึงพอใจ:\n' +
            '- โปรเจกต์: ' + proj + '\n' +
            '- คะแนนเฉลี่ย Programmer: ' + pA.toFixed(2) + '\n' +
            '- คะแนนเฉลี่ย Application: ' + aA.toFixed(2) + '\n' +
            '- คะแนนรวม: ' + oA.toFixed(2) + '/5.00\n' +
            '- ระดับ: ' + lv.num + '\n' +
            '- ข้อเสนอแนะ: ' + ($('#comments').val() || '(ไม่มี)')
        );
    }

    // Event delegation — score buttons
    $(document).on('click', '.score-btn', function () {
        setScore($(this).data('id'), parseInt($(this).data('value')));
    });

    $(document).on('mouseenter', '.score-btn', function () {
        if (!$(this).hasClass('sel')) {
            $(this).css('border-color', scoreColors(parseInt($(this).data('value'))));
        }
    }).on('mouseleave', '.score-btn', function () {
        if (!$(this).hasClass('sel')) {
            $(this).css('border-color', '#e2e8f0');
        }
    });

    $('#resetBtn').on('click', resetForm);
    $('#submitBtn').on('click', submitForm);

    buildRows(progItems, 'progBody');
    buildRows(appItems, 'appBody');
});
