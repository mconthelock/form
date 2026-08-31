export async function getFormList({ user, status }) {
    console.log(user, status);

    let url = ``;
    switch (status) {
        case '0':
            //Under prepare
            url = `${process.env.APP_API}/form/underprepare/${user}`;
            break;
        case '1':
            //Waiting for approve
            url = `${process.env.APP_API}/form/waitforapprove/${user}`;
            break;
        case '2':
            //Comming
            url = `${process.env.APP_API}/form/comming/${user}`;
            break;
        case '3':
            //Mine
            url = `${process.env.APP_API}/form/mine/${user}`;
            break;
        case '4':
            //Approved
            url = `${process.env.APP_API}/form/approved/${user}`;
            break;
        case '5':
            //Represent
            url = `${process.env.APP_API}/form/represent/${user}`;
            break;
        default:
            //Finish
            url = `${process.env.APP_API}/form/finish/${user}`;
            break;
    }
    return await getForms(url);
}

export async function getForms(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
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
