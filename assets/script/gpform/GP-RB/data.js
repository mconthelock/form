import { fetchUtils } from '@amec/webasset/api/fetch-utils';
export async function getPurpose() {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-rb/purpose`,
        method: 'GET',
    });
}

export async function getConfig() {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-rb/config`,
        method: 'GET',
    });
}

export async function getEmpData(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: 'GET',
    });
}

export async function getFormData(nfrno, vorgno, cyear, cyear2, runno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-rb/${nfrno}/${vorgno}/${cyear}/${cyear2}/${runno}`,
        method: 'GET',
    });
}

export async function getFileForm() {
    return await fetchUtils({
        url: `${process.env.APP_API}/webform/file/get-file/`,
        method: 'POST',
        data,
    });
}

export async function toggleStandard(val) {
    const el = $('#standardStampSection');
    if (val == '1') {
        // Enable all inputs inside the section
        el.find('input, select, textarea, button').prop('disabled', false);
        el.css({ opacity: '1', 'pointer-events': 'auto' });
    } else {
        // Disable all inputs inside the section
        el.find('input, select, textarea, button').prop('disabled', true);
        el.css({ opacity: '0.5', 'pointer-events': 'none' });
    }
}

export async function toggleOther(val) {
    const el = $('#otherStampSection');
    if (val == '1') {
        // Disable all inputs inside the section
        el.find('input, select, textarea, button').prop('disabled', true);
        el.css({ opacity: '0.5', 'pointer-events': 'none' });
    } else {
        el.find('input, select, textarea, button').prop('disabled', false);
        el.css({ opacity: '1', 'pointer-events': 'auto' });
    }
}

export async function renderPurpose(mode = 'create') {
    const purpose = await getPurpose();
    const sortpurpose = purpose.sort((a, b) => a.PURPOSE_ID - b.PURPOSE_ID);
    const Purposedata = sortpurpose
        .map((a) => {
            const otherSelect = `<input type="text"
        class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1"
        id="otherSelect"
        name="PURPOSE_OTHER"
        placeholder="Please specify other purpose"
        ${mode === 'create' ? '' : 'readonly'}
        >`;

            return `<label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio"
                name="PURPOSE_ID"
                class="radio radio-xs rounded border-base-content [--chkbg:var(--bc)] [--chkfg:var(--b1)] req"
                value="${a.PURPOSE_ID}"
                id="purpose_${a.PURPOSE_ID}"
                data-purpose-group="${a.PURPOSE_GROUP}"
                ${mode === 'create' ? '' : 'disabled'}
                >
                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                ${a.PURPOSE_GROUP == 3 ? otherSelect : ''}
            </label>`;
        })
        .join('');
    $('#purposeList').html(Purposedata);
}

export async function renderAttachedFiles(fileList) {
    if (!fileList.length) {
        $('.file-list').html(`
      <div class="w-full min-h-8 rounded-md border border-base-300 bg-base-100 px-4 py-2 flex items-center">
        <span class="opacity-60">-</span>
      </div>
    `);
        return;
    }

    const fileHtml = fileList
        .map((f) => {
            const originalName = f.FILE_ONAME || f.FILE_FNAME || '-';
            const storedName = f.FILE_FNAME || '';
            const filePath = f.FILE_PATH || '';

            return `
        <div class="file-item flex items-center gap-2 w-full min-w-0 min-h-8 rounded-md border border-base-300 bg-base-100 px-4 py-2">
          <span class="flex-1 min-w-0 truncate">
            ${originalName}
          </span>

          <button
            type="button"
            class="download-btn btn btn-primary btn-sm ml-auto shrink-0"
            data-stored-name="${storedName}"
            data-original-name="${originalName}"
            data-path="${filePath}"
          >
            Download
          </button>
        </div>
      `;
        })
        .join('');

    $('.file-list').html(fileHtml);
}

export async function createForm(data) {
    return fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-rb`,
        method: 'POST',
        data: data,
    });
}
