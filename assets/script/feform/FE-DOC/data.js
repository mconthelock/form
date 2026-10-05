import { host } from '../../utils';

export async function getDocTypeSteps(docTypeCode) {
    return $.ajax({
        url: host + 'feform/FE-DOC/form/GetDocTypeSteps',
        type: 'GET',
        data: { docTypeCode },
        dataType: 'json',
    });
}

export async function saveDocMaster(formData) {
    return $.ajax({
        url: host + 'feform/FE-DOC/form/SaveDocMaster',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
    });
}

export async function deleteDraftDoc(payload) {
    return $.ajax({
        url: host + 'feform/FE-DOC/form/DeleteDraftDoc',
        type: 'POST',
        data: payload,
        dataType: 'json',
    });
}

export async function getFilesDisplay(payload) {
    return $.ajax({
        url: host + 'feform/FE-DOC/form/GetFilesDisplay',
        type: 'POST',
        data: payload,
        dataType: 'json',
    });
}
