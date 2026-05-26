import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import {
    doaction,
    getExtData,
    getFormDetail,
    getMode,
    showflow,
} from '@amec/webasset/api/webform';
import { webflowSubmit } from '@amec/webasset/components/form';
import {
    getUrlParams,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { downloadOrOpenFile, getFileForm } from '@amec/webasset/api/file';
import { redirectWebflow } from '@amec/webasset/form';
import {
    renderPurpose,
    getFormData,
    getConfig,
    getEmpData,
    getFileForm,
    renderAttachedFiles,
} from './data';

var cextData;
$(async function () {
    try {
        await renderPurpose('view');
        const param = getUrlParams();
        const data = await getFormData(
            param.NFRMNO,
            param.VORGNO,
            param.CYEAR,
            param.CYEAR2,
            param.NRUNNO,
        );
        console.log(data);
        console.log(`${data.formmaster.VANAME}${data.form.CYEAR2.slice(-2)}-${('000000'+data.form.NRUNNO).slice(-6)}`);
        //Show requester info
        const empData = await getEmpData(data.form.VREQNO);
        $('#formNo').text(`${data.formmaster.VANAME}${data.form.CYEAR2.slice(-2)}-${('000000'+data.form.NRUNNO).slice(-6)}`);
        $('#INPUTBY').text(data.form.VINPUTER);
        $('#REQBY').text(data.form.VREQNO);
        $('#empName').text(empData.STNAME);
        $('#empDept').text(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
        $('#empPos').text(empData.SPOSNAME);

        const config = await getConfig();
        const selectedConfig = config.find(
            (c) => c.SPOSCODE === empData.SPOSCODE,
        );
        const nameParts = empData.SNAME.split(' ');
        //Show purpose
        if (data.REQ_TYPE == '1') {
            $('#standardStampSection').removeClass('hidden');
            $('#otherStampSection').addClass('hidden');
            $(`#purpose_${data.PURPOSE_ID}`).prop('checked', true);
            $('#otherSelect').val(data.PURPOSE_OTHER || '');
            $('#stampSize').html(selectedConfig.SIZE_MM + ' mm.');
            $('#stampCircle-name').html(nameParts[0]); //
            $('#nameInput').val(nameParts[0]); //

            if (selectedConfig.STAMP_TYPE == '2') {
                $('#stampCircle-label').html(empData.SDIV);
                $('#standardStampSection').removeClass('hidden');
                $('#otherStampSection').addClass('hidden');
                $(`#purpose_${data.PURPOSE_ID}`).prop('checked', true);
                $('#otherSelect').val(data.PURPOSE_OTHER || '');
                $('#stampSize').html(selectedConfig.SIZE_MM + ' mm.');
                $('#stampCircle-name').html(nameParts[0]); //
                $('#nameInput').val(nameParts[0]); //
            }
        } else {
            $('#standardStampSection').addClass('hidden');
            $('#otherStampSection').removeClass('hidden');
            $('#otherReason').val(data.PURPOSE_OTHER || '');
            $('#otherQty').val(data.PURPOSE_QTY || '1');

            //await loadAttachedFiles(data);
            const fileForm = await getFileForm({
                NFRMNO: param.NFRMNO,
                VORGNO: param.VORGNO,
                CYEAR: param.CYEAR,
                CYEAR2: param.CYEAR2,
                NRUNNO: param.NRUNNO,
                FORM_TYPE: 'GP',
            });

            if (fileForm.status) {
                const fileList = Array.isArray(fileForm.data)
                    ? fileForm.data
                    : [];
                await renderAttachedFiles(fileList);
            }
        }


        //ปุ่ม approve กับ reject จะโชว์ก็ต่อเมื่อเป็นผู้อนุมัติเท่านั้น
        const mode = await getMode({ ...data, EMPNO: param.EMPNO });
        cextData = await getExtData({ ...data, EMPNO: param.EMPNO });
        const flow = await showflow(data);
        console.log(mode);

        let action = '';
        switch (mode) {
            case '2': // edit
                if(cextData == '01'){
                    $('#nameInput').removeAttr('readonly');
                }
                action = webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: true,
                    reject: true,
                });
                break;

            case '3': // view
                action = webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    actionsForm: false,
                });
                break;
        }
        $('#sentApprove').html(action);
    } catch (error) {
        console.error('Error in show.js:', error);
        showErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูลแบบฟอร์ม');
        return;
    }
    
});

$(document).on('click', '.download-btn', async function () {
    try {
        const file = await downloadOrOpenFile({
            baseDir: $(this).data('path'),
            storedName: $(this).data('stored-name'),
            originalName: $(this).data('original-name'),
            mode: 'download',
        });
    } catch (error) {
        console.error('Error downloading or opening file:', error);
    }
});

// action form approve, reject
$(document).on('click', "button[name='btnAction']", async function () {
    try {
        const param = getUrlParams();
        const form = {
            NFRMNO: param.NFRMNO,
            VORGNO: param.VORGNO,
            CYEAR: param.CYEAR,
            CYEAR2: param.CYEAR2,
            NRUNNO: param.NRUNNO,
        };
        console.log(form);
        const action = $(this).val();
        const remark = $('#remark').val();
        cextData = await getExtData({ ...form, EMPNO: param.EMPNO });
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const empno = urlParams.get('empno');
        const state = {
            ...form,
            EMPNO: empno,
            ACTION: action,
            REMARK: remark,
        };
        console.log(state.Name_Stamp);
        console.log(cextData);

        let res;
        if (cextData == '01') {
            const nameStamp = getNameStampValue();
            if (!nameStamp) {
                throw new Error('ไม่พบชื่อที่ต้องการอัพเดท');
            }
            state.NAME_STAMP = nameStamp;
            res = await updateStamp(state);
        } else {
            res = await doaction(state);
        }

        console.log(res);

        if (res.status) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        console.error(error);
        showMessage(error.message);
    }
});


async function getShowData(form) {
    const url = `${process.env.APP_API}/gpform/showstamp-gp-rb/${form.NFRMNO}/${form.VORGNO}/${form.CYEAR}/${form.CYEAR2}/${form.NRUNNO}`;
    return await fetchUtils({
        url: url,
        method: 'GET',
    });
}

async function getShowCusData(form) {
    const url = `${process.env.APP_API}/gpform/showcusstamp-gp-rb/${form.NFRMNO}/${form.VORGNO}/${form.CYEAR}/${form.CYEAR2}/${form.NRUNNO}`;
    return await fetchUtils({
        url: url,
        method: 'GET',
    });
}



async function updateStamp(state) {
    const url = `${process.env.APP_API}/gpform/showstamp-gp-rb`;
    return await fetchUtils({
        url: url,
        method: 'PATCH',
        data: state,
    });
}
