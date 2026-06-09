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
        rowIndex: 0,
        currentTableType: null,
        baseUrl: $('#base_url').val() || '',

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
                confirmButtonColor: '#38a4ec',
            });
        },

        init: function () {
            //this.bindEvents();
            this.initReqno();
        },

        initReqno: function () {
            const empno = $.trim($('#inputBy').val());
            const $target = $('#input_name');

            getUserbyemp(empno).then(function (user) {
                const empName = user?.SEMPNO + ' - ' + user?.SNAME;
                $target
                    .removeClass('text-red-500 text-slate-500')
                    .addClass('text-emerald-700')
                    .text(empName);

                    $('#sseccode').val(user?.SSECCODE);
                    $('#sdepcode').val(user?.SDEPCODE);
                    $('#ssec').val($.trim(user?.SSEC || '').replace(/\//g, '').substring(0, 3));
            });
        },


        setLoading: function (isLoading) {
            $('#btnSaveDraft, #btnSendForm, #btnAddRow').prop('disabled', isLoading);

            if (isLoading) {
                $('#btnSendForm').text('Sending...');
            } else {
                $('#btnSendForm').text('Send Form');
            }
        }
    };
    OR.init();
});