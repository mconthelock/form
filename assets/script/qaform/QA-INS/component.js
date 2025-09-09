const btnStatus = ({
    cls = 'list-status',
    status = 1,
    attr = ''
} = {}) => `<button class="btn  flex items-center gap-2 ${cls}" ${attr}>
        Status
        <input type="checkbox" ${status == 1 ? 'checked="checked"' : ""} class="toggle toggle-xl toggle-success " />
    </button>`;
const btnDel = ({cls = '', text = 'Delete', attr = ''} = {}) => `<button class="btn btn-error ${cls}" ${attr}><i class="icofont-ui-delete"></i>${text}</button>`;
const btnAdd = ({cls = '', text = '', attr = ''} = {}) => `<button class="${cls} btn" ${attr}><i class="icofont-ui-add"></i>${text}</button>`;
const input = ({val="", cls = '', type = 'text', attr = ''} = {}) => `<input type="${type}" class="input w-full text-black ${cls}" value="${val}" ${attr} />`;

export { btnStatus, btnDel, btnAdd, input };