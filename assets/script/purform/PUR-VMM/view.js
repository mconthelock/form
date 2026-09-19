import { getFormStatus, showflow } from '@amec/webasset/api/webform';
import { getformDetail, webflowSubmit } from '@amec/webasset/components/form';
import { showLoader } from '@amec/webasset/preloader';
import { formSubmitSkeleton } from '@amec/webasset/skeleton';
import {
    getAllAttr,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { approve, getData } from './data';
import { renderFilesByType } from '../PUR-EVA/formManager';
import { downloadOrOpenFile } from '@amec/webasset/api/file';
import { redirectWebflow } from '@amec/webasset/form';
import { renderLink } from './function';

var form = {};
var formvmm = {};

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
        ((formvmm = await getData(form)), console.log(formvmm));
        const mode =
            formvmm.REQTYPE === 'A'
                ? 'Add'
                : formvmm.REQTYPE === 'U'
                  ? 'Update'
                  : formvmm.REQTYPE === 'D'
                    ? 'Delete'
                    : '';
        $('#REQTYPE').text(mode);
        $('#VENDGROUPTYPE').text(formvmm.VENDGROUPTYPE);
        $('#VENDCODE').text(formvmm.VENDCODE);
        $('#VENDNAME').text(formvmm.VENDNAME);
        $('#ADDREN').text(
            formatAddress(formvmm.ADDRESSES?.find((i) => i.ADDRTYPE === 'E')),
        );
        $('#ADDRTH').text(
            formatAddress(formvmm.ADDRESSES?.find((i) => i.ADDRTYPE === 'T')),
        );
        $('#VENDCAT').text(formvmm.VENDCAT);
        $('#TAXID').text(formvmm.TAXID);
        $('#CANO').text(formvmm.CANO);
        $('#BANO').text(formvmm.BANO);
        $('#constdcur').text(formvmm.CURRENCY.CURR_NAME);
        $('#VPAYTO').text(formvmm.VPAYTO || '-');
        $('#VTYPE').text(formvmm.VTYPE || '-');
        $('#VPAYTY').text(formvmm.VPAYTY || '-');
        $('#TERMCODE').text(formvmm.TERM.STERMDESC || '-');
        $('#V1TIME').text(formvmm.V1TIME || '-');
        $('#VNALPH').text(formvmm.VNALPH || '-');
        $('#CONTACT').text(formvmm.CONTACT || '-');
        $('#EMAIL').text(formvmm.EMAIL || '-');
        $('#WEBSITE').text(formvmm.WEBSITE || '-');
        $('#TELNO').text(formvmm.TELNO || '-');
        $('#FAX').text(formvmm.FAX || '-');
        $('#BANKNAME').text(formvmm.BANKNAME || '-');
        $('#BRANCH').text(formvmm.BRANCH || '-');
        $('#ACCNUMBER').text(formvmm.ACCNUMBER || '-');
        $('#BANKADDR').text(formvmm.BANKADDR || '-');
        $('input[name="EVANO"]').val(formvmm.EVANO);
        $('input[name="BUYER"]').val(formvmm.FORM.VREQNO);
        $('input[name="REQTYPE"]').val(mode);
        $('input[name="VENDGROUPTYPE"]').val(formvmm.VENDGROUPTYPE);
        $('input[name="VENDCODE"]').val(formvmm.VENDCODE);
        $('input[name="VENDNAME"]').val(formvmm.VENDNAME);
        if (formvmm.TRADE_CODE) {
            const trade = formvmm.TRADE.TRADE_SHIPBY
                ? `${formvmm.TRADE_CODE}_${formvmm.TRADE.TRADE_NAME} to ${formvmm.TRADE.TRADE_SHIPTO} (${formvmm.TRADE.TRADE_SHIPBY})`
                : `${formvmm.TRADE_CODE}_${formvmm.TRADE.TRADE_NAME}`;
            $('#TRADE_CODE').text(trade);
        }

        if (formvmm.EVANO) {
            await renderLink(formvmm.EVANO);
        }

        formvmm.ATTACH_OTHER &&
            $('#ATTACH_OTHER_TEXT').text(formvmm.ATTACH_OTHER);

        const attachedFiles = formvmm.FILES || [];

        renderFilesByType(attachedFiles, 11, 'file-type-11');
        renderFilesByType(attachedFiles, 2, 'file-type-2');

        if (formvmm.SCMUSER.length > 0) {
            $('.scmuser').show();
        } else {
            $('.scmuser').hide();
        }

        formvmm.SCMUSER.sort((a, b) => a.ID - b.ID);

        // 2. สร้างโครงสร้าง HTML จากข้อมูล
        let rowsHtml = '';
        formvmm.SCMUSER.forEach((item) => {
            rowsHtml += `
            <div class="grid grid-cols-12 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 text-slate-600 transition-colors">
                <div class="col-span-1 p-3 border-r border-slate-200 text-center">${item.ID}</div>
                <div class="col-span-3 p-3 border-r border-slate-200">${item.NAME}</div>
                <div class="col-span-6 p-3 border-r border-slate-200 truncate">${item.EMAIL}</div>
                <div class="col-span-2 p-3 truncate">${item.USERNAME}</div>
            </div>
        `;
        });
        $('#table-body').html(rowsHtml);

        const [formDetail, apvno, flow] = await Promise.all([
            getformDetail(form),
            $('.apv-data').attr('empno'),
            showflow({ ...form, showStep: true }),
        ]);
        $('#form-detail').html(formDetail);
        if (form.MODE === 2) {
            $('.txtremark').show();
            console.log('edit');
        } else {
            $('.txtremark').hide();
            console.log('view');
        }
        if (cst != '0') {
            formSubmitSkeleton({
                count: form.RETURN ? 3 : 4,
                element: '#form-action-container',
                mode: form.MODE === 2 ? 'edit' : 'view',
            });

            $('#form-action-container').html(
                webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: form.MODE == 2 ? true : false,
                    reject: form.MODE == 2 ? true : false,
                    remark: false,
                    back: form.MODE == 2 ? true : false,
                    return: form.MODE == 2 ? true : false,
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

function formatAddress(addrObj) {
    if (!addrObj) return '-';
    return (
        [
            [addrObj.ADDR1, addrObj.ADDR2].filter(Boolean).join(' '),
            addrObj.CITY,
            addrObj.STATE,
            addrObj.POSTCODE,
            addrObj.COUNTRY,
        ]
            .map((item) => (item ? String(item).trim() : ''))
            .filter(Boolean)
            .join(',') || '-'
    );
}

$(document).on('click', 'button[name="btnAction"]', async function () {
    const act = $(this).val();
    const remark = $('textarea[name="txtRemark"]').val();
    const apvno = $('.apv-data').attr('empno');
    const evano = $('input[name="EVANO"]').val();
    const buyer = $('input[name="BUYER"]').val();
    const reqtype = $('input[name="REQTYPE"]').val();
    const vendgrouptype = $('input[name="VENDGROUPTYPE"]').val();
    const vendcode = $('input[name="VENDCODE"]').val();
    const vendname = $('input[name="VENDNAME"]').val();

    if (act != 'approve' && remark == '') {
        showMessage(
            'Please fill in the reason field for the return or rejection request.',
            'warning',
        );
        return false;
    }

    try {
        showLoader({ show: true });
        const formData = {
            NFRMNO: form.NFRMNO,
            VORGNO: form.VORGNO,
            CYEAR: form.CYEAR,
            CYEAR2: form.CYEAR2,
            NRUNNO: form.NRUNNO,
            EMPNO: form.EMPNO,
            ACTION: act,
            REMARK: remark,
            EVANO: evano,
            BUYER: buyer,
            REQTYPE: reqtype,
            VENDGROUPTYPE: vendgrouptype,
            VENDCODE: vendcode,
            VENDNAME: vendname,
        };
        const resapv = await approve(formData);
        redirectWebflow();
    } catch (error) {
        console.error(error);
        showErrorMessage(error);
    } finally {
        showLoader({ show: false });
    }
});
