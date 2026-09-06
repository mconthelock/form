export async function getReportMaster() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/webform/report`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}
