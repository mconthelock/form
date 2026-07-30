import { getExtData, showflow } from '@amec/webasset/api/webform';
import { getformDetail, webflowSubmit } from '@amec/webasset/components/form';
import { getAllAttr } from '@amec/webasset/utils';
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
    } else {
        // ถ้าเป็นอันอื่น ให้แสดงแถวตามปกติ
        $('#VENDPURPOSE').closest('.info-row').show();
        let vendPurposeText = formeva.VENDPURPOSE;
        if (vendPurposeText && vendPurposeText.includes(':')) {
            vendPurposeText = vendPurposeText.split(':')[1];
        }
    }
    // 3. นำข้อความไปแสดงผล
    $('#OPERATION').text(displayText);
    $('#VENDGROUP').text(vendGroupText);
    console.log('xxxxxxxxx' + formeva.VENDTYPE);
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
