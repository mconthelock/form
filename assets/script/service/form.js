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
