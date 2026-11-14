import { displayEmpInfo } from '@amec/webasset/indexDB';
import { showMessage } from '@amec/webasset/utils';

export async function setRequester() {
    const inputuser = $('#EMPNO').val();
    const users = await displayEmpInfo(inputuser);
    //Requester Info
    $('#req-by-img').find('img').attr('src', users.image).removeClass('hidden');
    $('#req-by-name').html(users.SNAME);
    $('#req-by-id').html(users.SEMPNO);
    $('#req-by-organization').html(
        `${users.SDIV}` +
            (users.SDEPT ? ` - ${users.SDEPT}` : '') +
            (users.SSEC ? ` - ${users.SSEC}` : ''),
    );
    $('#req-by-info').find('.skeleton').addClass('hidden');

    // Input Employee Info
    $('#input-by-img')
        .find('img')
        .attr('src', users.image)
        .removeClass('hidden');
    $('#input-by-name').html(users.SNAME);
    $('#input-by-id').html(users.SEMPNO);
    $('#input-by-organization').html(
        `${users.SDIV}` +
            (users.SDEPT ? ` - ${users.SDEPT}` : '') +
            (users.SSEC ? ` - ${users.SSEC}` : ''),
    );
    $('#input-by-info').find('.skeleton').addClass('hidden');

    $(document).on('click', '#change-req-employee', async function (e) {
        e.preventDefault();
        $('#req-by-input').removeClass('hidden');
        $('#req-by-info').addClass('hidden');
        $('#req-by-input').focus();
    });

    $(document).on('change', '#req-by-input', async function (e) {
        e.preventDefault();
        const inputuser = $(this).val();
        const users = await displayEmpInfo(inputuser);
        if (!users) {
            await showMessage('Employee do not found.');
            $(this).val('').focus();
            return;
        }

        $('#req-by-img').find('img').attr('src', users.image);
        $('#req-by-name').html(users.SNAME);
        $('#req-by-id').html(users.SEMPNO);
        $('#req-by-organization').html(
            `${users.SDIV}` +
                (users.SDEPT ? ` - ${users.SDEPT}` : '') +
                (users.SSEC ? ` - ${users.SSEC}` : ''),
        );
        $('#req-by-info').removeClass('hidden');
        $(this).val('').addClass('hidden');
    });
}

export async function formHeader(data) {
    const setVname = (name) => {
        const arr = name.split('-');
        if (arr.length == 1) return name;

        return arr[1].substr(0, 2);
    };

    const setStatus = (status) => {
        switch (status) {
            case '1':
                return {
                    classed: 'bg-amber-200  border-amber-500 text-amber-700',
                    en: 'Approval',
                    th: 'อยู่ระหว่างการอนุมัติ',
                    icon: '<i class="fi fi-ts-duration-alt text-3xl"></i>',
                };
            case '2':
                return {
                    classed: 'bg-green-200  border-green-500 text-green-700',
                    en: 'Approved',
                    th: 'อนุมัติสมบูรณ์',
                    icon: '<i class="fi fi-rr-shield-trust text-3xl"></i>',
                };
            case '3':
                return {
                    classed: 'bg-red-200  border-red-500 text-red-700',
                    en: 'Rejected',
                    th: 'ไม่อนุมัติ',
                    icon: '<i class="fi fi-rr-message-xmark text-3xl"></i>',
                };
            default:
                return {
                    classed: 'bg-gray-200  border-gray-300 text-gray-500',
                    en: 'Unkown',
                    th: 'ไม่ระบุสถานะ/ฉบับร่าง',
                    icon: '❌',
                };
        }
    };

    const master = data.formmst;
    $('#form-header-icon').html(setVname(master.VANAME));
    $('#form-header-title').html(master.VNAME);
    $('#form-header-subtitle').html(master.VDESC);
    //const form = master.form;
    const stat = setStatus('1');
    $('#form-header-status').addClass(stat.classed);
    $('#form-header-status-icon').html(stat.icon);
    $('#form-header-status-en').html(stat.en);
    $('#form-header-status-th').html(stat.th);
}

export async function formHeaderInfo(data) {}
