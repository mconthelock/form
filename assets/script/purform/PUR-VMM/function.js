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
