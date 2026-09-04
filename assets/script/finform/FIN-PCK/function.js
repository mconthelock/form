export const getTemplate = async (filename) => {
    const data = {
        path: `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE/${filename}`,
        name: filename,
    };
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/files/template/read/`,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (res) {
                const binaryData = atob(res.content);
                const buffer = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                    buffer[i] = binaryData.charCodeAt(i);
                }
                res.buffer = buffer;
                resolve(res);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
};
