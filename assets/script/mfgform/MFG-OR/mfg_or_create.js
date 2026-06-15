import {
    getUserbyemp,
    createMfgOr
} from "./data.js";
import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { createBtn, activatedBtn } from "@amec/webasset/components/buttons";
import { createForm } from "@amec/webasset/api/webform";
import { host } from "../../utils.js";
import { redirectWebflow } from "@amec/webasset/form";
import Swal from "sweetalert2";

$(document).ready(function () {
    const OR = {
        baseUrl: $('#base_url').val() || '',

        init: function () {
            this.bindEvents();
            this.initRequestBy();
            this.initApplyForOptions();
            this.initRadioTextbox();
        },

        bindEvents: function () {
            this.bindRequestByEvent();
            this.bindButtonEvents();
            this.bindRadioEvents();
        },

        bindRequestByEvent: function () {
            $('#request_by').on('input', async function () {
                const empno = $.trim(this.value);

                if (empno.length !== 5) {
                    $('#request_by_name').text('');
                    return;
                }

                const user = await getUserbyemp(empno);
                OR.setRequestByName(user);
            });
        },

        bindButtonEvents: function () {
            $('#btnSendForm').on('click', function () {
                OR.submitForm('send_form');
            });

            $('#btnResetForm').on('click', function () {
                $('#formMfgOr')[0].reset();
                OR.initRadioTextbox();
            });
        },

        bindRadioEvents: function () {
            $('input[name="type_form"]').on('change', function () {
                OR.toggleTypeForm();
            });

            $('input[name="item_type"]').on('change', function () {
                OR.toggleItemType();
            });
        },

        initRequestBy: async function () {
            const user = await getUserbyemp($.trim($('#inputBy').val()));
            this.setInputByInfo(user);
            this.setSection(user);
        },

        setInputByInfo: function (user) {
            this.setUserInfo(user, '#input_name', true);
        },

        setRequestByName: function (user) {
            this.setUserInfo(user, '#request_by_name', false);
        },

        setUserInfo: function (user, target, showEmpno = true) {
            const $target = $(target);

            if (!user?.SEMPNO) {
                $target
                    .removeClass('text-emerald-700 text-slate-500')
                    .addClass('text-red-500')
                    .text('ไม่พบข้อมูลพนักงาน');
                return;
            }

            $target
                .removeClass('text-red-500 text-slate-500')
                .addClass('text-emerald-700')
                .text(showEmpno ? `${user.SEMPNO} - ${user.SNAME}` : user.SNAME);
        },

        setSection: function (user) {
            $('#sseccode').val($.trim(user?.SSECCODE));
            $('#sdepcode').val($.trim(user?.SDEPCODE));
            $('#ssec').val($.trim(user?.SSEC));
        },

        initApplyForOptions: function () {
            const list = [
                'BS,SH,GC',
                'PR',
                'PB,PS',
                'TP,IW',
                'EW,AG,YS,SY',
                'RL',
                'VM',
                'HB',
                'HG',
                'BD,RD,SD',
                'MC,NL',
                'AC,WC',
                'ASSY',
                'Other'
            ];

            $('#apply_for')
                .empty()
                .append('<option value="">--- Please select ---</option>')
                .append(list.map(item => `<option value="${item}">${item}</option>`).join(''));
        },

        initRadioTextbox: function () {
            this.toggleTypeForm();
            this.toggleItemType();
        },

        toggleTypeForm: function () {
            const typeForm = $('input[name="type_form"]:checked').val();
            this.toggleTextbox(typeForm === 'REVISE', '#current_no');
        },

        toggleItemType: function () {
            const itemType = $('input[name="item_type"]:checked').val();

            this.toggleTextbox(itemType === 'ALL', '#overall_item');
            this.toggleTextbox(itemType === 'OR', '#or_item');
        },

        toggleTextbox: function (isActive, selector) {
            $(selector)
                .prop('disabled', !isActive)
                .val(isActive ? $(selector).val() : '');

            if (isActive) {
                $(selector).focus();
            }
        },

        validateForm: function () {
            const errors = [];

            if (!$.trim($('#request_by').val())) errors.push('Request By');
            if (!$('input[name="type_form"]:checked').val()) errors.push('Type Form');
            if (!$('input[name="classification"]:checked').val()) errors.push('Classification');
            if (!$.trim($('#topic').val())) errors.push('Topic');
            if (!$('input[name="item_type"]:checked').val()) errors.push('Item Type');
            if (!$('#apply_for').val()) errors.push('Apply For');

            if ($('input[name="type_form"]:checked').val() === 'REVISE'
                && !$.trim($('#current_no').val())) {
                errors.push('Current No.');
            }

            if ($('input[name="item_type"]:checked').val() === 'ALL'
                && !$.trim($('#overall_item').val())) {
                errors.push('Overall Item');
            }

            if ($('input[name="item_type"]:checked').val() === 'OR'
                && !$.trim($('#or_item').val())) {
                errors.push('OR Item');
            }

            if ($('#or_excel')[0].files.length === 0) errors.push('OR Excel File');
            if ($('#or_pdf')[0].files.length === 0) errors.push('OR PDF File');

            if (errors.length > 0) {
                this.showAlert({
                    icon: 'warning',
                    title: 'Data Not Complete',
                    text: 'กรุณากรอกข้อมูลให้ครบถ้วน !!'
                });
                return false;
            }

            return true;
        },

        getWebflowParams: function () {
            const inputBy = String($('#inputBy').val() || '');
            return {
                NFRMNO: String($('#nfrmno').val() || ''),
                VORGNO: String($('#vorgno').val() || ''),
                CYEAR: String($('#cyear').val() || ''),
                REQBY: String($('#request_by').val() || inputBy),
                INPUTBY: inputBy,
                SSECCODE: String($('#sseccode').val() || '')
            };
        },

        createWebflowForm: async function () {
            const params = this.getWebflowParams();

            if (!params.NFRMNO || !params.VORGNO || !params.CYEAR) {
                throw new Error('ไม่พบข้อมูล NFRMNO / VORGNO / CYEAR');
            }

            const result = await createForm(params);

            if (!result?.status) {
                throw new Error(result?.message || 'Create form ไม่สำเร็จ');
            }

            return result;
        },

        uploadFile: async function (webflowData = {}) {
            const excelInput = $('#or_excel')[0];
            const pdfInput = $('#or_pdf')[0];

            const formData = new FormData();

            formData.append('NFRMNO', webflowData.NFRMNO || $('#nfrmno').val());
            formData.append('VORGNO', webflowData.VORGNO || $('#vorgno').val());
            formData.append('CYEAR', webflowData.CYEAR || $('#cyear').val());
            formData.append('CYEAR2', webflowData.CYEAR2 || '');
            formData.append('NRUNNO', webflowData.NRUNNO || '');

            if (excelInput?.files?.length) {
                Array.from(excelInput.files).forEach(function (file) {
                    formData.append('filUpload_ref[]', file);
                });
            }

            if (pdfInput?.files?.length) {
                Array.from(pdfInput.files).forEach(function (file) {
                    formData.append('filUpload_ref[]', file);
                });
            }

            const res = await $.ajax({
                url: host + 'mfgform/MFG-OR/main_or/uploadfile',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json'
            });

            console.log('OR UPLOAD RESULT:', res);

            if (!res.status) {
                throw new Error(res.message || 'Upload file ไม่สำเร็จ');
            }

            return res.files || [];
        },

        getFormPayload: function (webflowData = {}, uploadedFiles = []) {
            const typeform = String($('input[name="type_form"]:checked').val() || '');
            const currentNo = $.trim($('#current_no').val()) || null;
            const itemType = String($('input[name="item_type"]:checked').val() || '');

            return {
                NFRMNO: Number(webflowData.NFRMNO || $('#nfrmno').val()),
                VORGNO: String(webflowData.VORGNO || $('#vorgno').val()),
                CYEAR: String(webflowData.CYEAR || $('#cyear').val()),
                CYEAR2: String(webflowData.CYEAR2),
                NRUNNO: Number(webflowData.NRUNNO),

                INPUTBY: String($('#inputBy').val() || ''),
                REQBY: String($('#request_by').val() || ''),
                SSECCODE: String($('#sseccode').val() || ''),
                SDEPCODE: String($('#sdepcode').val() || ''),
                SSEC: String($('#ssec').val() || ''),

                TYPEFORM: typeform,
                ORNO: typeform === 'REVISE' ? currentNo : null,

                CLASS: String($('input[name="classification"]:checked').val() || ''),
                TOPIC: $.trim($('#topic').val()) || null,
                DWGNO: $.trim($('#dwg_no').val()) || null,
                SHOPNO: $.trim($('#shop_no').val()) || null,

                ITEMNO: itemType === 'ALL'
                    ? $.trim($('#overall_item').val()) || null
                    : $.trim($('#or_item').val()) || null,

                APPLY_FOR: String($('#apply_for').val() || ''),
                SEQNO: null,
                REV: $.trim($('#rev').val()) || '*',

                att: uploadedFiles.map(file => ({
                    FILENAME: file
                }))
            };
        },

        submitForm: async function (actionType) {
            if (!this.validateForm()) {
                return;
            }

            this.setLoading(true);
            showLoader({ show: true });

            try {
                const webflow = await this.createWebflowForm();
                const webflowData = webflow?.data || {};

                const uploadedFiles = await this.uploadFile(webflowData);
                const payload = this.getFormPayload(webflowData, uploadedFiles);

                console.log('MFG OR PAYLOAD:', payload);

                const res = await createMfgOr(payload);

                if (res.status === true || res.status === 'success') {
                    showLoader({ show: false });
                    this.setLoading(false);

                    await this.showAlert({
                        icon: 'success',
                        title: 'บันทึกข้อมูลสำเร็จ',
                        text: 'ระบบได้ทำการบันทึกข้อมูลเรียบร้อยแล้ว'
                    });

                    // redirectWebflow(); // เดี๋ยวค่อยเปิดใช้ภายหลัง
                } else {
                    this.showAlert({
                        icon: 'error',
                        title: 'บันทึกข้อมูลไม่สำเร็จ',
                        text: res.message || ''
                    });
                }

            } catch (error) {
                console.log(error);
                console.log(JSON.stringify(error));
                console.error('SUBMIT OR FORM ERROR:', error);

                this.showAlert({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: error?.message || 'เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล'
                });
            } finally {
                showLoader({ show: false });
                this.setLoading(false);
            }
        },

        setLoading: function (isLoading) {
            $('#btnSendForm, #btnResetForm').prop('disabled', isLoading);
            $('#btnSendForm').text(isLoading ? 'Sending...' : 'Send Form');
        },

        showAlert: function ({
            icon = 'info',
            title = '',
            text = '',
            confirmButtonText = 'ตกลง'
        } = {}) {
            return Swal.fire({
                icon,
                title,
                text,
                confirmButtonText,
                confirmButtonColor: '#38a4ec'
            });
        }
    };

    OR.init();
});