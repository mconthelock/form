const btnStatus = ({
    cls = "list-status",
    status = 1,
    attr = "",
} = {}) => `<button class="btn  flex items-center gap-2 ${cls}" ${attr}>
        Status
        <input type="checkbox" ${
            status == 1 ? 'checked="checked"' : ""
        } class="toggle toggle-xl toggle-success " />
    </button>`;

const btnDel = ({ cls = "", text = "Delete", attr = "" } = {}) =>
    `<button class="btn btn-error ${cls}" ${attr}><i class="icofont-ui-delete"></i>${text}</button>`;

const btnAdd = ({ cls = "", text = "", attr = "" } = {}) =>
    `<button class="${cls} btn" ${attr}><i class="icofont-ui-add"></i>${text}</button>`;

const input = ({ val = "", cls = "", type = "text", attr = "", disabled = false } = {}) =>
    `<input type="${type}" class="input w-full text-black ${cls}" value="${val}" ${attr} ${disabled ? 'disabled="disabled"' : ""} />`;

const radio = ({ name = "", val = "", cls = "", checked = false, attr = "", disabled = false } = {}) =>
    `<input type="radio" name="${name}" value="${val}" class="btn btn-sm [&:not(:checked)]:bg-white shadow-sm ${cls}" ${
        checked ? 'checked="checked"' : ""
    } ${disabled ? 'disabled="disabled"' : ""} ${attr}  aria-label="${val}" value="${val}" />`;

const inputNum = ({min = 0, max = 10, name = "", val = 3, disabled = false, cls = ""} = {}) => `<input type="number" class="input input-sm ${cls}" value="${val}" min="${min}" max="${max}" name="${name}" ${disabled ? 'disabled="disabled"' : ""} />`;

const btnMinus = ({ disabled = false, cls = ""} = {}) => `<button class="btn btn-sm p-2 minus ${cls}" ${disabled ? 'disabled="disabled"' : ""}><i class="icofont-minus text-xl"></i></button>`;
const btnPlus = ({ disabled = false, cls = ""} = {}) => `<button class="btn btn-sm p-2 plus ${cls}" ${disabled ? 'disabled="disabled"' : ""}><i class="icofont-plus text-xl"></i></button>`;
export { btnStatus, btnDel, btnAdd, input, radio, btnMinus, btnPlus, inputNum };
