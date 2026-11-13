export async function getItems() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/gpreport/tax/items/`,
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

export async function getCurrent(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/gpreport/tax/current/${id}`,
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

export async function getForm(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/gpreport/tax/history/`,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

export async function requestSaveTax(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/gpreport/tax/create`,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}
