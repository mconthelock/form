import { getFormno, showflow, getMode, doaction } from "@amec/webasset/api/webform";
import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { showLoader } from "@amec/webasset/preloader";
import { redirectWebflow } from "@amec/webasset/form";
$(async function () {
    const params = new URLSearchParams(window.location.search);
    const nfrmno = params.get("no");
    const vorgno = params.get("orgNo");
    const cyear = params.get("y");
    const runno = params.get("runNo");
    const cyear2 = params.get("y2");
    const empno = params.get("empno");

    const flow = await showflow(
        {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: runno,
            showStep: true
        }
    );

    const mode = await getMode({ NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: runno, EMPNO: empno });
    console.log('Form Mode:', mode);
    $(".flow").html(flow.html);

    const formno = await getFormno({ NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: runno });
    $("#vFormNo").text(`[${formno}]`);

    const [dataForm, Criteria] = await Promise.all([
        $.ajax({
            type: "POST",
            url: `${process.env.APP_API}/is-sef/getSessionByForm`,
            data: { NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: runno },
            dataType: "json"
        }),
        $.getJSON(`${process.env.APP_API}/is-sef/getCriteria`)
    ]);

    const dataHead = dataForm.head;
    const dataDetail = dataForm.detail;
    const dataProject = dataForm.workPlan;

    console.log(dataProject);
    // Populate header info
    $('#vProjectName').html(dataProject[0].TITLE ? `<span class="text-lg"> ${dataProject[0].TITLE} [ ${dataProject[0].REQ_NO} ]</span>` : '—');
    $('#vEmpNo').text(dataHead.REQBY || dataHead.INPUTBY || '—');
    $('#vYear').text(dataHead.CYEAR || cyear || '—');
    $('#vDate').text(dataHead.INPUTDATE || dataHead.CREATEDATE || '—');

    const prog = Criteria.filter(c => c.SECTION === 'P');
    const app = Criteria.filter(c => c.SECTION === 'A');

    const progItems = prog.map(c => ({ num: parseInt(c.EVA_ID), en: c.NAME_EN, th: c.NAME_TH }));
    const appItems = app.map(c => ({ num: parseInt(c.EVA_ID), en: c.NAME_EN, th: c.NAME_TH }));

    const progIds = progItems.map(i => i.num);
    const appIds = appItems.map(i => i.num);
    const allIds = [...progIds, ...appIds];

    // --- SHARED HELPERS ---

    function scoreColor(v) {
        if (v === 5) return '#16a34a';
        if (v === 4) return '#65a30d';
        if (v === 3) return '#ca8a04';
        if (v === 2) return '#ea580c';
        return '#dc2626';
    }

    function avg(ids, scoreMap) {
        const vals = ids.map(i => scoreMap['score_' + i]).filter(v => v);
        if (!vals.length) return null;
        return vals.reduce((a, b) => a + b, 0) / vals.length;
    }

    function levelLabel(a) {
        if (a === null) return { num: null, text: '—', color: '#94a3b8', bg: '#f1f5f9' };
        if (a >= 4.5) return { num: 5, text: '★★★★★ Excellent', color: '#14532d', bg: '#dcfce7' };
        if (a >= 3.5) return { num: 4, text: '★★★★ Good', color: '#365314', bg: '#ecfccb' };
        if (a >= 2.5) return { num: 3, text: '★★★ Fair', color: '#713f12', bg: '#fef9c3' };
        if (a >= 1.5) return { num: 2, text: '★★ Poor', color: '#7c2d12', bg: '#ffedd5' };
        return { num: 1, text: '★ Very Poor', color: '#7f1d1d', bg: '#fee2e2' };
    }

    function updateAverages(scoreMap) {
        const pA = avg(progIds, scoreMap);
        const aA = avg(appIds, scoreMap);
        const allVals = allIds.map(i => scoreMap['score_' + i]).filter(v => v);
        const oA = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : null;

        $('#progAvg').text(pA !== null ? pA.toFixed(2) : '—');
        $('#appAvg').text(aA !== null ? aA.toFixed(2) : '—');
        $('#overallAvg').text(oA !== null ? oA.toFixed(2) : '—');

        const lv = levelLabel(oA);
        $('#levelBadge').css({ background: lv.bg, borderColor: lv.color + '44' });
        $('#levelText').text(lv.text).css('color', lv.color);
    }

    const hasScores = dataDetail && dataDetail.length > 0 && dataDetail.some(d => d.SCORE !== null);

    // --- VIEW MODE (scores already exist OR not authorized to fill) ---
    if (hasScores || mode != 2) {
        const scores = {};
        dataDetail.forEach(d => {
            scores['score_' + parseInt(d.EVA_ID)] = parseInt(d.SCORE) || 0;
        });

        function checkMark(score, col) {
            return score === col
                ? `<span style="font-size:1.1rem; color:${scoreColor(col)};">✓</span>`
                : '';
        }

        function buildTableView(items, tbodyId) {
            const tbody = document.getElementById(tbodyId);
            tbody.innerHTML = '';
            items.forEach((item, i) => {
                const v = scores['score_' + item.num] || 0;
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #f1f5f9';
                tr.style.background = i % 2 === 0 ? 'white' : '#fafafa';
                tr.innerHTML = `
                    <td style="padding:0.65rem 0.5rem; text-align:center; color:#94a3b8; font-size:0.85rem;">${item.num}</td>
                    <td style="padding:0.65rem 0.75rem; color:#1e293b; font-size:0.85rem; font-weight:500;">${item.en}</td>
                    <td style="padding:0.65rem 0.75rem; color:#475569; font-size:0.83rem;">${item.th}</td>
                    ${[5, 4, 3, 2, 1].map(col => `<td style="padding:0.65rem 0.5rem; text-align:center;">${checkMark(v, col)}</td>`).join('')}
                    <td style="padding:0.65rem 0.75rem; text-align:center;">
                        <span class="font-semibold text-lg badge badge-info">${v ? v.toFixed(0) : '—'}</span>
                    </td>`;
                tbody.appendChild(tr);
            });
        }

        buildTableView(progItems, 'progBody');
        buildTableView(appItems, 'appBody');
        updateAverages(scores);

        $('#vComments').text(dataHead.COMMENT || dataHead.REMARK || '(ไม่มีข้อเสนอแนะ)').show();
        $('#comments').hide();
        $('#resetBtn, #submitBtn').hide();

        // --- EDIT MODE (no scores yet AND mode == 2) ---
    } else {
        const scores = {};

        function buildRowsEdit(items, tbodyId) {
            const $tbody = $('#' + tbodyId);
            items.forEach((item, i) => {
                const scoreId = 'score_' + item.num;
                scores[scoreId] = null;

                const scoreCells = [5, 4, 3, 2, 1].map(v => `
                    <td style="padding:0.5rem; text-align:center;">
                        <button class="score-btn"
                            id="btn_${scoreId}_${v}"
                            data-id="${scoreId}"
                            data-value="${v}"
                            style="width:34px;height:34px;border-radius:50%;border:1.5px solid #e2e8f0;background:white;cursor:pointer;font-size:0.82rem;font-weight:600;color:#94a3b8;transition:all 0.15s;"
                        >${v}</button>
                    </td>`).join('');

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
            [5, 4, 3, 2, 1].forEach(n => {
                const $btn = $('#btn_' + id + '_' + n);
                if (n === v) {
                    $btn.css({ background: scoreColor(v), color: 'white', borderColor: scoreColor(v) }).addClass('sel');
                } else {
                    $btn.css({ background: 'white', color: '#94a3b8', borderColor: '#e2e8f0' }).removeClass('sel');
                }
            });
            $('#disp_' + id).text(v).css({ color: scoreColor(v), background: scoreColor(v) + '18' });
            updateAverages(scores);
        }

        function resetForm() {
            Object.keys(scores).forEach(id => {
                scores[id] = null;
                [5, 4, 3, 2, 1].forEach(n => {
                    $('#btn_' + id + '_' + n).css({ background: 'white', color: '#94a3b8', borderColor: '#e2e8f0' }).removeClass('sel');
                });
                $('#disp_' + id).text('—').css({ color: '#cbd5e1', background: 'transparent' });
            });
            $('#comments').val('');
            updateAverages(scores);
        }

        async function submitForm() {
            const missing = Object.values(scores).filter(v => v === null).length;
            if (missing > 0) {
                alert('กรุณาประเมินให้ครบทุกหัวข้อ (ยังขาดอีก ' + missing + ' หัวข้อ)');
                return;
            }

            const pA = avg(progIds, scores);
            const aA = avg(appIds, scores);
            const oA = allIds.map(i => scores['score_' + i]).reduce((a, b) => a + b, 0) / allIds.length;
            const lv = levelLabel(oA);
            const scoreMap = Object.fromEntries(allIds.map(i => [i, scores['score_' + i]]));

            showLoader();
            await doaction({
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR: cyear,
                CYEAR2: cyear2,
                NRUNNO: runno,
                ACTION: 'approve',
                EMPNO: empno,
                REMARK: 'Approved' // optional
            })
            await fetchUtils({
                url: process.env.APP_API + "/is-sef/update",
                method: "PATCH",
                data: {
                    NFRMNO: nfrmno,
                    VORGNO: vorgno,
                    CYEAR: cyear,
                    CYEAR2: cyear2,
                    NRUNNO: runno,
                    PROJECT_ID: dataHead.PROJECT_ID,
                    REQBY: dataHead.REQBY || empno,
                    INPUTBY: dataHead.INPUTBY || empno,
                    REMARK: "",
                    SCORE: scoreMap,
                    PRO_AVG: pA,
                    APP_AVG: aA,
                    OVERALL_AVG: oA,
                    LEVEL: lv.num,
                    COMMENT: $('#comments').val() || ''
                }
            });
            showLoader({ show: false });
            redirectWebflow();
        }

        $(document).on('click', '.score-btn', function () {
            setScore($(this).data('id'), parseInt($(this).data('value')));
        });

        $(document).on('mouseenter', '.score-btn', function () {
            if (!$(this).hasClass('sel')) $(this).css('border-color', scoreColor(parseInt($(this).data('value'))));
        }).on('mouseleave', '.score-btn', function () {
            if (!$(this).hasClass('sel')) $(this).css('border-color', '#e2e8f0');
        });

        $('#resetBtn').on('click', resetForm);
        $('#submitBtn').on('click', submitForm);

        buildRowsEdit(progItems, 'progBody');
        buildRowsEdit(appItems, 'appBody');

        $('#vComments').hide();
        $('#comments').show();
        $('#resetBtn, #submitBtn').show();
    }
});