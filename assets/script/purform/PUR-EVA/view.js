import {
    doaction,
    getExtData,
    getFormStatus,
    showflow,
} from '@amec/webasset/api/webform';
import { getformDetail, webflowSubmit } from '@amec/webasset/components/form';
import {
    filterFormData,
    getAllAttr,
    logFormData,
    setRound,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getData, updatePurEvaForm } from './data';
import { formatDate } from '@amec/webasset/dayjs';
import { downloadOrOpenFile } from '@amec/webasset/api/file';
import { formSubmitSkeleton } from '@amec/webasset/skeleton';
import { showLoader } from '@amec/webasset/preloader';
import {
    bindComplianceData,
    bindScoreData,
    renderFilesByType,
} from './formManager';
import { redirectWebflow } from '@amec/webasset/form';

var form = {};
const cextdata = '';

$(async function () {
    showLoader({ show: true });
    try {
        const formInfo = await getAllAttr('.form-info');
        form = {
            NFRMNO: formInfo.nfrmno,
            VORGNO: formInfo.vorgno,
            CYEAR: formInfo.cyear,
            CYEAR2: formInfo.cyear2,
            NRUNNO: formInfo.nrunno,
            MODE: Number(formInfo.mode) ?? null,
            EMPNO: $('.apv-data').attr('empno'),
            RETURN: formInfo.return ?? null,
        };

        const cst = await getFormStatus(form);

        const [formDetail, apvno, flow, formeva] = await Promise.all([
            getformDetail(form),
            $('.apv-data').attr('empno'),
            showflow({ ...form, showStep: true }),
            getData(form),
        ]);
        console.log(formeva);
        if (cst != '0') {
            formSubmitSkeleton({
                count: form.RETURN ? 3 : 4,
                element: '#form-action-container',
                mode: form.MODE === 2 ? 'edit' : 'view',
            });
        }

        //filterFormData(formeva);
        //logFormData(formeva);

        cextdata = await getExtData({ ...form, EMPNO: apvno });
        $('#form-detail').html(formDetail);

        const renderTable = (type, tableId, msg) => {
            const data =
                formeva.RELATIONS?.filter((i) => i.ENTITY_TYPE === type) || [];
            const html = data.length
                ? data
                      .map(
                          (i) => `
            <tr>
                <td class="border border-gray-300 px-4 py-2">${i.ENTITY_NAME || '-'}</td>
                <td class="border border-gray-300 px-4 py-2 text-center w-32">${i.PERCENT || '0'}</td>
            </tr>`,
                      )
                      .join('')
                : `<tr><td colspan="2" class="border border-gray-300 px-4 py-4 text-center text-gray-500">${msg}</td></tr>`;
            $(`#${tableId}`).html(html);
        };

        const formatStatus = (status, reason) => {
            if (!status) return '-';
            const text =
                status === 'Y' ? 'Yes' : status === 'N' ? 'No' : status;
            return reason ? `${text} - ${reason}` : text;
        };
        bindScoreData(formeva.SCORES);

        // const topicMap = {
        //     'FINANCIAL STATEMENT': 'FIN_LEVEL',
        //     'QUALITY CLASSIFICATION': 'QA_LEVEL',
        //     ENVIRONMENTAL: 'ENV_LEVEL',
        //     'ADVANCE VERIFYING': 'VERIFYING',
        //     'PRICE LEVEL': 'PRICE_LEVEL',
        //     'ORDER MANAGEMENT': 'ORDER_LEVEL',
        //     'CUSTOMER SERVICE': 'CUSTOMER_LEVEL',
        //     'STANDARD DELIVERY': 'DELIVERY_LEVEL',
        // };

        // let totalScore = 0;
        // formeva.SCORES?.forEach((item) => {
        //     const group = topicMap[item.TOPIC];
        //     if (group)
        //         $(`input[name="${group}"][value="${item.SCORE}"]`).prop(
        //             'checked',
        //             true,
        //         );
        //     totalScore += Number(item.SCORE || 0);
        // });

        // const grades = [
        //     { min: 80, text: 'EXCELLENT (80 UP)', class: 'text-green-600' },
        //     { min: 70, text: 'GOOD (70 UP)', class: 'text-blue-600' },
        //     { min: 60, text: 'FAIR (60 UP)', class: 'text-orange-500' },
        //     { min: 40, text: 'POOR (40 UP)', class: 'text-orange-500' },
        //     {
        //         min: 0,
        //         text: 'NOT APPRICABLE (LESSTHAN 40)',
        //         class: 'text-red-600',
        //     },
        // ].find((g) => totalScore >= g.min);

        // $('.total-score').text(totalScore);
        // $('.judgement-result')
        //     .text(grades.text)
        //     .attr(
        //         'class',
        //         `uppercase italic ml-2 judgement-result ${grades.class}`,
        //     );
        const isNonPro = formeva.VENDGROUP === '6:Non-Production (6)';
        $('.nonpro').toggle(isNonPro);
        $('.pro').toggle(!isNonPro);

        $('#titleprofit').text(
            isNonPro ? 'กำไรขาดทุนสุทธิ 3 ปีล่าสุด' : 'Last 3 Years Turnover',
        );
        $('#thprofit').text(isNonPro ? 'Net Profit/Loss' : 'Turnover');
        $('#VENDPURPOSE').closest('.info-row').toggle(!isNonPro);
        if (!isNonPro && cextdata == '02') {
            const htmlContent = `
                <div class="flex flex-col gap-2 border border-gray-200 rounded-md p-3 bg-gray-50">
                    <span class="text-sm font-semibold underline">TOTAL EVALUATION</span>
                    
                    <div class="flex flex-col gap-2 text-sm">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="MJUDGEMEN" value="A" class="w-4 h-4 accent-blue-600"> 
                            A: EXCELLENT (80 UP)
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="MJUDGEMEN" value="B" class="w-4 h-4 accent-blue-600"> 
                            B: GOOD (70 UP)
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="MJUDGEMEN" value="C" class="w-4 h-4 accent-blue-600"> 
                            C: FAIR (60 UP)
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="MJUDGEMEN" value="D" class="w-4 h-4 accent-blue-600"> 
                            D: POOR (40 UP)
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="MJUDGEMEN" value="E" class="w-4 h-4 accent-blue-600"> 
                            E: NOT APPLICABLE (LESS THAN 40)
                        </label>
                    </div>
                </div>
            `;
            // นำไปใส่ใน div ที่กำหนด
            $('#MJUDGEMENT').html(htmlContent);
        }

        if (isNonPro) {
            const isLocal = formeva.VENDTYPE === 'Local';
            $('#PRODCAT')
                .text(formeva.PRODCAT || '-')
                .closest('.prodcat-container')
                .toggle(isLocal);
            $('#COMPLIANCE_READONLY_CONTAINER')
                .closest('.info-row')
                .toggle(!isLocal);
            if (!isLocal)
                bindComplianceData(
                    formeva.COMPLIANCE,
                    formeva.COMPLIANCE_OTHER,
                );

            $('#BUSTYPE_REG').text(formeva.BUSTYPE_REG || '-');
            $('#BUSTYPE_SUB').text(formeva.BUSTYPE_SUB || '-');
            $('#LEGAL_STATUS').text(formeva.LEGAL_STATUS || '-');
            $('#CORPORATE_ID').text(formeva.CORPORATE_ID || '-');
            $('#TAX_ID').text(formeva.TAX_ID || '-');
            $('#CONCERNEDORG').text(formeva.VORG?.VNAME || '-');
            $('#FY_AMOUNT').text(formeva.FY_AMOUNT || '-');
            $('#AMOUNT').text(setRound(Number(formeva.AMOUNT), 2) || '-');

            const levels = {
                A: {
                    text: 'Level A: ≥ 1,000,000 Baht',
                    class: 'bg-green-100 text-green-700',
                },
                B: {
                    text: 'Level B: < 1,000,000 and ≥ 100,000 Baht',
                    class: 'bg-blue-100 text-blue-700',
                },
                C: {
                    text: 'Level C: < 100,000 and ≥ 10,000 Baht',
                    class: 'bg-orange-100 text-orange-700',
                },
                D: {
                    text: 'Level D: < 10,000 Baht',
                    class: 'bg-gray-100 text-gray-700',
                },
            }[formeva.PUR_LEVEL];

            $('#PUR_LEVEL_BADGE')
                .toggle(!!levels)
                .attr(
                    'class',
                    `px-2 py-0.5 text-xs font-semibold rounded-md ${levels?.class || ''}`,
                )
                .text(levels?.text || '');
            $('#PUR_STATUS').prop(
                'checked',
                formeva.PUR_STATUS === 'DO NOT USE',
            );
        } else {
            $('#PRODCAT').closest('.prodcat-container').hide();
            $('#COMPLIANCE_READONLY_CONTAINER').closest('.info-row').hide();
            $('#VENDCAT').text(formeva.VENDCAT || '-');
            $('#TAX_ID_PRO').text(formeva.TAX_ID || '-');
            $('#CAPITAL').text(
                `${setRound(Number(formeva.CAPITAL), 2)} ${formeva.CAPITAL_CUR || '-'}`,
            );
            $('#COM_TYPE').text(
                formeva.COM_TYPE === 'อื่นๆ ระบุ'
                    ? `อื่นๆ ระบุ : ${formeva.COM_OTHER || '-'}`
                    : formeva.COM_TYPE || '-',
            );

            renderTable('N', 'shareholder-tbody', 'Not have shareholder data');
            renderTable('C', 'customer-tbody', 'Not have main customer data');
            renderTable(
                'S',
                'supplier-tbody',
                'Not have supplier of main material data',
            );
            renderTable('P', 'product-tbody', 'Not have main product data');

            $('#EMPDIRECT').text(setRound(Number(formeva.EMPDIRECT), 2) || '-');
            $('#EMPINDIRECT').text(
                setRound(Number(formeva.EMPINDIRECT), 2) || '-',
            );
            $('#EMPTOTAL').text(
                setRound(
                    Number(formeva.EMPINDIRECT || 0) +
                        Number(formeva.EMPDIRECT || 0),
                    2,
                ) || '-',
            );
            $('#AVGAGE').text(formeva.AVGAGE || '-');
            $('#LAND').text(setRound(Number(formeva.LAND), 2) || '-');
            $('#FACTORY').text(setRound(Number(formeva.FACTORY), 2) || '-');

            $('#QM_STATUS').text(
                formatStatus(formeva.QM_STATUS, formeva.QM_REASON),
            );
            $('#CSR_STATUS').text(
                formatStatus(formeva.CSR_STATUS, formeva.CSR_REASON),
            );
            $('#ENV_STATUS').text(
                formatStatus(formeva.ENV_STATUS, formeva.ENV_REASON),
            );

            const laborDate = formeva.LABOR_ESTABLISH_DATE
                ? formatDate(formeva.LABOR_ESTABLISH_DATE, 'DD/MM/YYYY')
                : '';
            const laborText =
                formeva.LABOR_STATUS === 'Y'
                    ? laborDate
                        ? `Have established - ${laborDate}`
                        : 'Have established'
                    : formeva.LABOR_STATUS === 'N'
                      ? 'Do not have'
                      : '-';
            $('#LABOR_STATUS').text(laborText);
        }

        // --- 4. Profit Turnover Table ---
        const profitHtml = formeva.PROFIT_TURNOVERS?.length
            ? formeva.PROFIT_TURNOVERS.map(
                  (i) => `
        <tr>
            <td class="border border-gray-300 px-4 py-2 text-left">${i.MYEAR || '-'}</td>
            <td class="border border-gray-300 px-4 py-2 text-right w-32">${setRound(Number(i.AMOUNT), 2) || '0'}</td>
        </tr>`,
              ).join('')
            : `<tr><td colspan="2" class="border border-gray-300 px-4 py-4 text-center text-gray-500">ไม่มีข้อมูล</td></tr>`;
        $('#profit-tbody').html(profitHtml);

        // --- 5. General Info Binding ---
        let opText = operationMap[formeva.OPERATION] || '';
        if (formeva.OPERATION === 'A' && formeva.UPSTATUS === 'Y')
            opText += ' - Update Vendor Master';
        let vendGroup = formeva.VENDGROUP?.includes(':')
            ? formeva.VENDGROUP.split(':')[1]
            : formeva.VENDGROUP;

        $('#OPERATION').text(opText);
        $('#VENDGROUP').text(vendGroup);
        $('#COMNAME').html(
            `${formeva.COMNAME} <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">${formeva.VENDTYPE}</span>`,
        );

        $('#ADDREN').text(
            formatAddress(formeva.ADDRESSES?.find((i) => i.ADDRTYPE === 'E')),
        );
        $('#ADDRTH').text(
            formatAddress(formeva.ADDRESSES?.find((i) => i.ADDRTYPE === 'T')),
        );

        const fields = [
            'VENDCODE',
            'CONTACT',
            'EMAIL',
            'WEBSITE',
            'TELNO',
            'FAX',
            'BANKNAME',
            'BRANCH',
            'BANKADDR',
            'ACCNUMBER',
        ];
        fields.forEach((f) => $(`#${f}`).text(formeva[f] || '-'));

        $('#TERMCODE').text(formeva.TERM?.STERMDESC || '-');
        $('#CURCODE').text(formeva.STDCUR?.SCURRENCY || '-');

        formeva.ATTACH_OTHER &&
            $('#ATTACH_OTHER_TEXT').text(formeva.ATTACH_OTHER);

        const attachedFiles = formeva.FILES || [];

        renderFilesByType(attachedFiles, 11, 'file-type-11');
        renderFilesByType(attachedFiles, 12, 'file-type-12');
        renderFilesByType(attachedFiles, 13, 'file-type-13');
        renderFilesByType(attachedFiles, 2, 'file-type-2');
        $('input[name="JUDGEMENT"]').val(formeva.JUDGEMENT);
        console.log(form.MODE);
        if (cst != '0') {
            $('#form-action-container').html(
                webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: form.MODE == 2 ? true : false,
                    reject:
                        form.MODE == 2 && ['01', '02', '03'].includes(cextdata)
                            ? true
                            : false,
                    remark: false,
                    back: form.MODE == 2 ? true : false,
                    return:
                        form.MODE == 2 && ['01', '02'].includes(cextdata)
                            ? true
                            : false,
                    returnb: form.MODE == 2 && cextdata == '03' ? true : false,
                }),
            );
        }
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
    } finally {
        $('#frmmain').css('visibility', 'visible');
        showLoader({ show: false });
    }
});

const operationMap = { N: 'New Vendor', A: 'Annual evaluation' };

function formatAddress(addrObj) {
    if (!addrObj) return '-';
    return (
        [
            addrObj.ADDR,
            addrObj.SUBDISTRICT,
            addrObj.DISTRICT,
            `${addrObj.PROVINCE || ''} ${addrObj.POSTCODE || ''}`.trim(),
            addrObj.COUNTRY,
        ]
            .filter(Boolean)
            .join(', ') || '-'
    );
}

$(document).on('click', '.file-link', async function (e) {
    e.preventDefault();
    const filePath = $(this).attr('href');
    const filename = $(this).attr('originalName');
    const storedName = $(this).attr('storedName');
    const ext = filename.split('.').pop();

    await downloadOrOpenFile({
        baseDir: filePath,
        storedName: storedName,
        originalName: filename,
        mode: ext == 'pdf' ? 'open' : 'download',
    });
});

$(document).on('click', 'button[name="btnAction"]', async function () {
    const act = $(this).val();
    const remark = $('textarea[name="txtRemark"]').val();
    if (cextdata == '02') {
        const formElement = $('#frmmain')[0];
        const fd = new FormData(formElement);
        const formInfo = await getAllAttr('.form-info');
        fd.append('NFRMNO', formInfo.nfrmno);
        fd.append('VORGNO', formInfo.vorgno);
        fd.append('CYEAR', formInfo.cyear);
        fd.append('CYEAR2', formInfo.cyear2);
        fd.append('NRUNNO', formInfo.nrunno);
        const apvno = $('.apv-data').attr('empno');
        fd.append('ACTION', act);
        fd.append('EMPNO', apvno);
        const data = filterFormData(fd);
        const resform = await updatePurEvaForm(data);
    }
    if (act != 'approve' && remark == '') {
        showMessage(
            'Please fill in the reason field for the return or rejection request.',
            'warning',
        );
        return false;
    }
    try {
        showLoader();
        const res = await doaction({ ...form, ACTION: act, REMARK: remark });
        if (res.status == true) {
            redirectWebflow();
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error);
    } finally {
        showLoader({ show: false });
    }
});
