$(document).ready(async function () {
    $('#computer-uid').focus();
});

$(document).on('keyup', '#computer-uid', async function (e) {
    e.preventDefault();
    const val = $(this).val();
    if (val.length != 8) return;

    $('#computer-name').removeClass('hidden').text(`Loading...`);
    const computerName = await fetchComputerName(val);
    if (computerName.length == 0) {
        $('#computer-name').text(`No computer found for UID: ${val}`);
        $(this).val('');
        return;
    }

    $('#computer-name').text(`Computer Name: ${computerName[0].PC_NAME}`);
});

async function fetchComputerName(uid) {
    // Simulate an API call to fetch the computer name based on the UID
    return new Promise((resolve) => {
        $.ajax({
            url: `${process.env.APP_API}/is-cbo/get-device`,
            method: 'POST',
            data: { uid },
            dataType: 'json',
            success: function (data) {
                resolve(data);
            },
            error: function () {
                resolve('Error fetching computer name');
            },
        });
    });
}
