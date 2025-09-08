const btnStatus = ({
    cls = 'list-status',
    status = 1,
} = {}) => `<button class="btn  flex items-center gap-2 ${cls}">
        Status
        <input type="checkbox" ${status == 1 ? 'checked="checked"' : ""} class="toggle toggle-xl toggle-success " />
    </button>`;
const btnDel = ({cls = '', text = 'Delete'} = {}) => `<button class="btn btn-error ${cls}"><i class="icofont-ui-delete"></i>${text}</button>`;
const btnAdd = ({cls = '', text = ''} = {}) => `<button class="${cls} btn"><i class="icofont-ui-add"></i>${text}</button>`;
const input = ({val="", cls = '', type = 'text', attr = ''} = {}) => `<input type="${type}" class="input w-full text-black ${cls}" value="${val}" ${attr} />`;

export { btnStatus, btnDel, btnAdd, input };