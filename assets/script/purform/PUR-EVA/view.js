import { getExtData, showflow } from '@amec/webasset/api/webform';
import { getformDetail, webflowSubmit } from '@amec/webasset/components/form';
import { getAllAttr, setRound } from '@amec/webasset/utils';
import { getData } from './data';
var form = {};
$(async function () {
    const formInfo = await getAllAttr('.form-info');
    form = {
        NFRMNO: formInfo.nfrmno,
        VORGNO: formInfo.vorgno,
        CYEAR: formInfo.cyear,
        CYEAR2: formInfo.cyear2,
        NRUNNO: formInfo.nrunno,
    };

    const formDetail = await getformDetail(form);
    const apvno = $('.apv-data').attr('empno');
    const cextdata = await getExtData({ ...form, EMPNO: apvno });
    const flow = await showflow({ ...form, showStep: true });
    const container = $('#form-action-container');
    const showformdetail = $('#form-detail');
    const mode = Number(formInfo.mode);
    showformdetail.html(formDetail);
    console.log(formDetail);
    const formeva = await getData(form);
    console.log(formeva);
    const operationMap = {
        N: 'New Vendor',
        A: 'Annual evaluation',
    };
    let displayText = operationMap[formeva.OPERATION] || '';
    if (formeva.OPERATION === 'A' && formeva.UPSTATUS === 'Y') {
        displayText += ' - Update Vendor Master';
    }
    let vendGroupText = formeva.VENDGROUP;
    if (vendGroupText && vendGroupText.includes(':')) {
        vendGroupText = vendGroupText.split(':')[1];
    }
    if (formeva.VENDGROUP === '6:Non-Production (6)') {
        // ถ้าเป็น 6:Non-Production (6) ให้ซ่อนทั้งแถว
        $('#VENDPURPOSE').closest('.info-row').hide();
        if (formeva.VENDTYPE == 'Local') {
            $('#PRODCAT').text(formeva.PRODCAT || '-');
            $('#PRODCAT').closest('.prodcat-container').show();
            $('#COMPLIANCE_READONLY_CONTAINER').closest('.info-row').hide();
        } else {
            bindComplianceData(formeva.COMPLIANCE, formeva.COMPLIANCE_OTHER);
            $('#PRODCAT').closest('.prodcat-container').hide();
            $('#COMPLIANCE_READONLY_CONTAINER').closest('.info-row').show();
        }

        $('#BUSTYPE_REG').text(formeva.BUSTYPE_REG || '-');
        $('#BUSTYPE_SUB').text(formeva.BUSTYPE_SUB || '-');
        $('#titleprofit').text('กำไรขาดทุนสุทธิ 3 ปีล่าสุด');
        $('#thprofit').text('Net Profit/Loss');
        $('.nonpro').show();
        $('.pro').hide();
    } else {
        // ถ้าเป็นอันอื่น ให้แสดงแถวตามปกติ
        $('#PRODCAT').closest('.prodcat-container').hide();
        $('#COMPLIANCE_READONLY_CONTAINER').closest('.info-row').hide();
        $('#VENDPURPOSE').closest('.info-row').show();
        let vendPurposeText = formeva.VENDPURPOSE;
        if (vendPurposeText && vendPurposeText.includes(':')) {
            vendPurposeText = vendPurposeText.split(':')[1];
        }
        $('#VENDCAT').text(formeva.VENDCAT || '-');
        $('#TAX_ID_PRO').text(formeva.TAX_ID || '-');

        $('#CAPITAL').text(
            setRound(Number(formeva.CAPITAL), 2) + ' ' + formeva.CAPITAL_CUR ||
                '-',
        );
        $('#COM_TYPE').text(
            formeva.COM_TYPE === 'อื่นๆ ระบุ'
                ? 'อื่นๆ ระบุ : ' + (formeva.COM_OTHER || '-')
                : formeva.COM_TYPE || '-',
        );
        let tbodyHtml = '';
        const nationalityData = formeva.RELATIONS.filter(
            (item) => item.ENTITY_TYPE === 'N',
        );
        if (nationalityData.length > 0) {
            // ถ้ามี วนลูปเฉพาะข้อมูลที่กรองมาแล้ว
            nationalityData.forEach((item) => {
                tbodyHtml += `
            <tr>
                <td class="border border-gray-300 px-4 py-2">${item.ENTITY_NAME || '-'}</td>
                <td class="border border-gray-300 px-4 py-2 text-center w-32">${item.PERCENT || '0'}</td>
            </tr>
            `;
            });
        } else {
            // ถ้าไม่มีข้อมูล ให้แสดงข้อความแจ้งเตือนสวยๆ
            tbodyHtml = `
            <tr>
            <td colspan="2" class="border border-gray-300 px-4 py-4 text-center text-gray-500">
                ไม่มีข้อมูลสัญชาติ
            </td>
            </tr>
        `;
        }

        // 4. เอา HTML ไปแสดงผลในตาราง
        $('#shareholder-tbody').html(tbodyHtml);
        $('#EMPDIRECT').text(setRound(Number(formeva.EMPDIRECT), 2) || '-');
        $('#EMPINDIRECT').text(setRound(Number(formeva.EMPINDIRECT), 2) || '-');
        $('#EMPTOTAL').text(
            setRound(
                Number(formeva.EMPINDIRECT) + Number(formeva.EMPDIRECT),
                2,
            ) || '-',
        );
        $('#AVGAGE').text(formeva.AVGAGE || '-');
        $('#LAND').text(setRound(Number(formeva.LAND), 2) || '-');
        $('#FACTORY').text(setRound(Number(formeva.FACTORY), 2) || '-');
        $('#titleprofit').text('Last 3 Years Turnover');
        $('#thprofit').text('Turnover');
        $('.nonpro').hide();
        $('.pro').show();
    }

    let tbodyprofitHtml = '';

    if (formeva.PROFIT_TURNOVERS.length > 0) {
        // ถ้ามี วนลูปเฉพาะข้อมูลที่กรองมาแล้ว
        formeva.PROFIT_TURNOVERS.forEach((item) => {
            tbodyprofitHtml += `
            <tr>
                <td class="border border-gray-300 px-4 py-2">${item.MYEAR || '-'}</td>
                <td class="border border-gray-300 px-4 py-2 text-center w-32">${item.AMOUNT || '0'}</td>
            </tr>
            `;
        });
    } else {
        // ถ้าไม่มีข้อมูล ให้แสดงข้อความแจ้งเตือนสวยๆ
        tbodyprofitHtml = `
            <tr>
            <td colspan="2" class="border border-gray-300 px-4 py-4 text-center text-gray-500">
                ไม่มีข้อมูล
            </td>
            </tr>
        `;
    }
    // 3. นำข้อความไปแสดงผล
    $('#OPERATION').text(displayText);
    $('#VENDGROUP').text(vendGroupText);
    $('#COMNAME').html(
        formeva.COMNAME +
            ' <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">' +
            formeva.VENDTYPE +
            '</span>',
    );
    const enAddressObj = formeva.ADDRESSES.find(
        (item) => item.ADDRTYPE === 'E',
    );
    const thAddressObj = formeva.ADDRESSES.find(
        (item) => item.ADDRTYPE === 'T',
    );
    $('#ADDREN').text(formatAddress(enAddressObj));
    $('#ADDRTH').text(formatAddress(thAddressObj));
    $('#VENDCODE').text(formeva.VENDCODE || '-');
    $('#CONTACT').text(formeva.CONTACT || '-');
    $('#EMAIL').text(formeva.EMAIL || '-');
    $('#WEBSITE').text(formeva.WEBSITE || '-');
    $('#TELNO').text(formeva.TELNO || '-');
    $('#FAX').text(formeva.FAX || '-');
    $('#BANKNAME').text(formeva.BANKNAME || '-');
    $('#BRANCH').text(formeva.BRANCH || '-');
    $('#BANKADDR').text(formeva.BANKADDR || '-');
    $('#ACCNUMBER').text(formeva.ACCNUMBER || '-');
    $('#TERMCODE').text(formeva.TERM.STERMDESC || '-');
    $('#CURCODE').text(formeva.STDCUR.SCURRENCY || '-');
    container.html(
        webflowSubmit({
            flow: true,
            flowhtml: flow.html,
            approve: true,
            reject: false,
            remark: false,
            return: cextdata !== '01' && cextdata !== '02' && cextdata !== '06',
        }),
    );
});

function formatAddress(addrObj) {
    if (!addrObj) return '-';
    const parts = [
        addrObj.ADDR,
        addrObj.SUBDISTRICT,
        addrObj.DISTRICT,
        // เอาจังหวัดกับรหัสไปรษณีย์ติดกันแบบที่นิยมใช้
        `${addrObj.PROVINCE || ''} ${addrObj.POSTCODE || ''}`.trim(),
        addrObj.COUNTRY,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : '-';
}

function bindComplianceData(complianceString, complianceOther) {
    // 1. จัดการ Checkbox หลักจากตัวแปร COMPLIANCE
    if (complianceString) {
        const selectedValues = complianceString
            .split(',')
            .map((item) => item.trim());

        $('#COMPLIANCE_READONLY_CONTAINER .chk-compliance').each(function () {
            const cbValue = $(this).val();

            if (selectedValues.includes(cbValue)) {
                // ติ๊กถูกที่ Checkbox
                $(this).prop('checked', true);

                // ค้นหา Label ที่อยู่ถัดไป (next element) เพื่อเปลี่ยนคลาสสี
                $(this)
                    .next('.chk-label')
                    .removeClass('text-gray-500')
                    .addClass('text-gray-900 font-medium');
            }
        });
    }

    // 2. จัดการ Checkbox "อื่นๆ ระบุ" และ Input Text จากตัวแปร COMPLIANCE_OTHER
    if (complianceOther && complianceOther.trim() !== '') {
        // ค้นหา Checkbox ที่มี value เป็น "อื่นๆ ระบุ"
        const $otherCheckbox = $(
            '#COMPLIANCE_READONLY_CONTAINER .chk-compliance',
        ).filter(function () {
            return $(this).val() === 'อื่นๆ ระบุ';
        });

        if ($otherCheckbox.length > 0) {
            $otherCheckbox.prop('checked', true);
            $otherCheckbox
                .next('.chk-label')
                .removeClass('text-gray-500')
                .addClass('text-gray-900 font-medium');
        }

        // นำข้อความไปใส่ในช่อง Input Text
        $('#COMPLIANCE_OTHER_READONLY').val(complianceOther);
    }
}
