import {
    getUserbyemp,
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

        submitForm: async function (actionType) {
            if (!this.validateForm()) {
                return;
            }

            this.setLoading(true);
            showLoader({ show: true });

            try {
                console.log('OR ACTION:', actionType);

                // TODO: createForm / upload file / save data ต่อจากตรงนี้

            } catch (error) {
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