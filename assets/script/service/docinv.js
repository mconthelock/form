export function getAppsList() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/docinv/application/`,
            type: 'get',
            dataType: 'json',
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, err) {
                console.log(err);
                reject(err);
            },
        });
    });
}
