import { getFormMasterByVaname } from '@amec/webasset/api/webform';
export function checkAttFile() {
    const hasCer =
        $('#file-cer')[0].files.length > 0 ||
        $('#file-type-11').find('a').length > 0;

    const hasQth =
        $('#file-other')[0].files.length > 0 ||
        $('#file-type-2').find('a').length > 0;
    if (!hasCer && !hasQth) {
        showMessage('Please Attached file', 'warning');
        return false;
    }
    return true;
}

export function renderNewFilesUI(inputId, dataTransfer, container) {
    let newFilesDiv = container.find('.new-selected-files');
    if (newFilesDiv.length === 0) {
        container.append('<div class="new-selected-files mt-1"></div>');
        newFilesDiv = container.find('.new-selected-files');
    }

    newFilesDiv.empty();

    $.each(dataTransfer.files, function (index, file) {
        let fileItemHtml = `
            <div class="flex items-center gap-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     class="cursor-pointer remove-new-file shrink-0"
                     data-id="${inputId}" data-index="${index}" title="Remove file">
                    <circle cx="12" cy="12" r="10" fill="#dc2626"></circle>
                    <line x1="7" y1="12" x2="17" y2="12" stroke="white" stroke-width="3" stroke-linecap="round"></line>
                </svg>
                <span class="text-sm text-gray-700">${file.name}</span>
            </div>
        `;
        newFilesDiv.append(fileItemHtml);
    });
}

export async function renderLink(formno) {
    console.log('ENTER RENDERLINK');

    const protocol = window.location.protocol;
    const subDomain = window.location.hostname.split('.')[0];
    console.log(protocol);
    console.log(subDomain);

    const regex = /^([A-Z-]+)(\d{2})-(\d+)$/;
    const match = formno.match(regex);

    if (match) {
        // let frmtype = match[1];
        let frmtype = 'PRO-VMM';
        let year = '20' + match[2];
        let runningNo = parseInt(match[3], 10);

        // ใช้งาน await ได้ตามปกติแล้วเพราะใส่ async ถูกตำแหน่ง
        console.log(frmtype);

        const formeva = await getFormMasterByVaname(frmtype);

        if (formeva) {
            // แนะนำให้เช็คด้วยว่าเจอข้อมูล formeva หรือไม่ เพื่อป้องกัน Error เพิ่มเติม
            let linkUrl = `${protocol}//${subDomain}.mitsubishielevatorasia.co.th/form/purform/PUR-EVA/form/main?no=${formeva.NNO}&orgNo=${formeva.VORGNO}&y=${formeva.CYEAR}&y2=${year}&runNo=${runningNo}`;

            $('#EVANO').html(
                formno
                    ? `<a href="${linkUrl}" target="_blank" class="text-blue-600 underline hover:text-blue-800">${formno}</a>`
                    : '',
            );
        }
    }
}

export const getTemplate = async (filename) => {
    const data = {
        path: `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/PUR/PURVMM/TEMPLATE/${filename}`,
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
