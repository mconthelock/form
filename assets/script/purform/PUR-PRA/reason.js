import { showErrorMessage } from '@amec/webasset/utils';
import {
    getReasonConditionRevise,
    getReasonCostDown,
    getReasonCostUp,
    getReasonEstimatePrice,
} from './data';

const reasons = new Map();
export const getReasons = (containerId) => reasons.get(containerId);
/**
 * @class ChangeReason
 * @description จัดการเหตุผลในการเปลี่ยนแปลง (Change Reason) สำหรับฟอร์ม PUR-PRA
 * @author Sutthipong tangmongkhoncharoen(24008)
 * @since 2026-10-07
 * @example
 * const changeReason = await ChangeReason.create({
 *     containerId: 'reason-container',
 *     name: 'reason',
 *     type: 'up'
 * });
 */
export class ChangeReason {
    constructor({
        containerId = null,
        name = null,
        type = null, // up, down, basic, estimate
        lists = [],
        halfColumn = false,
    }) {
        if (!containerId) throw new Error('Container not found');
        if (!lists || !Array.isArray(lists) || lists.length === 0)
            throw new Error('Lists must be an array');
        this.containerId = containerId;
        this.container = containerId
            ? document.getElementById(containerId)
            : null;
        this.name = name;
        this.type = type;
        this.lists = lists;
        this.halfColumn = halfColumn;

        this.container.innerHTML = lists
            .map((r) => this.#render({ list: r }))
            .join('');
        if (this.halfColumn) {
            const rows = Math.ceil(this.lists.length / 2);
            this.container.style.gridTemplateRows = `repeat(${rows}, auto)`;
        }
        this.#bindEvents();
        reasons.set(this.containerId, this);
    }
    getValue() {
        const lists = Array.from(
            this.container.querySelectorAll('input:checked'),
        ).map((input) => input.value);

        const input = Array.from(
            this.container.querySelectorAll('input[type="text"], textarea'),
        )
            .filter((input) => input.value != '')
            .map((input) => ({
                name: input.name,
                value: input.value,
                parent: input.dataset.parent,
                input: input.dataset.input,
            }));
        const res = lists.map((list) => {
            const reason = {
                NREASON_ID: list,
            };

            input
                .filter((i) => i.parent === list)
                .forEach((i) => {
                    switch (i.input) {
                        case 'from':
                            reason.VFROM = i.value;
                            break;
                        case 'to':
                            reason.VTO = i.value;
                            break;
                        default:
                            reason.VVALUE = i.value;
                            break;
                    }
                });

            return reason;
        });
        return res;
    }
    setValue(value, disabled = false) {
        const checkboxes = this.container.querySelectorAll(
            'input[type="checkbox"], input[type="radio"]',
        );
        const textInputs = this.container.querySelectorAll(
            'input[type="text"], input[type="number"], textarea',
        );

        checkboxes.forEach((checkbox) => {
            checkbox.checked = value.some(
                (v) => v.NREASON_ID == checkbox.value,
            );
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            if (disabled) {
                checkbox.disabled = true;
                checkbox.hidden = true;
            }
        });

        textInputs.forEach((input) => {
            const matched = value.find(
                (v) => v.NREASON_ID == input.dataset.parent,
            );
            if (matched) {
                switch (input.dataset.input) {
                    case 'from':
                        input.value = matched.VFROM || '';
                        break;
                    case 'to':
                        input.value = matched.VTO || '';
                        break;
                    default:
                        input.value = matched.VVALUE || '';
                        break;
                }
            }
            if (disabled) {
                input.disabled = true;
            }
        });
    }
    /**
     * @author Sutthipong tangmongkhoncharoen(24008)
     * @since 2026-10-07
     * @description สร้าง instance ของ ChangeReason โดยดึงข้อมูลเหตุผลจาก API ตามประเภทที่ระบุใน options
     * @param {Object} options
     * @returns {ChangeReason} instance of ChangeReason class
     */
    static async create(options) {
        const { type } = options;
        let res = null;
        switch (type) {
            case 'up':
                res = await getReasonCostUp();
                break;
            case 'down':
                res = await getReasonCostDown();
                break;
            case 'basic':
                res = await getReasonConditionRevise();
                break;
            case 'estimate':
                res = await getReasonEstimatePrice();
                break;
            default:
                throw new Error('Type is not supported: ' + type);
        }
        if (!res.status) throw new Error('Failed to fetch reasons');
        return new ChangeReason({ ...options, lists: res.data });
    }
    /**
     * @author Sutthipong tangmongkhoncharoen(24008)
     * @since 2026-10-07
     * @description สร้าง HTML ของ input element สำหรับรายการเหตุผลที่ระบุ
     * @param {Object[]} r - รายการเหตุผล
     * @param {string} name - ชื่อของ input element
     * @param {boolean} parent - ระบุว่ารายการนี้เป็น parent หรือไม่
     * @returns {string} HTML ของ input element
     */
    #render({ list, name = this.name, parent = false } = {}) {
        const type = list.VINPUT_TYPE.toLowerCase();

        let inputClass =
            type === 'radio'
                ? 'radio radio-sm radio-primary'
                : 'checkbox checkbox-sm checkbox-primary';

        let valueHtml = ''; // สำหรับ input ปกติ
        let valueHtml2 = ''; // สำหรับ input แบบ from_to
        const childrenName = `${name}_${list.NID}`; // ชื่อของ input element สำหรับรายการลูก (child)
        let label = `${list.NSEQ}. ${list.VNAME}`; // ป้ายชื่อของรายการเหตุผล
        let parentId = null;
        if (parent) {
            label = list.VNAME; // ป้ายชื่อของรายการเหตุผลสำหรับรายการลูก (child)
            parentId = list.NPARENT_ID;
        }

        if (list.VVALUE_TYPE) {
            switch (list.VVALUE_TYPE.toLowerCase()) {
                case 'text':
                    valueHtml = `<input type="text" name="${childrenName}_text" class="input w-full req hidden" data-parent="${list.NID}" data-message="Please enter a ${list.VNAME}" disabled>`;
                    break;
                case 'number':
                    valueHtml = `<input type="number" name="${childrenName}_number" class="input w-full req hidden" data-parent="${list.NID}" data-message="Please enter a ${list.VNAME}" disabled>`;
                    break;
                case 'area':
                    valueHtml = `<textarea name="${childrenName}_area" class="textarea w-full req hidden" rows="2" data-parent="${list.NID}" data-message="Please enter a ${list.VNAME}" disabled></textarea>`;
                    break;
                case 'from_to_percent':
                    valueHtml2 = `
                        <fieldset class="hidden flex flex-col gap-2 w-full mt-2 pl-8">
                            <label class="input w-full">
                                <span class="label">From</span>
                                <input type="number" name="${childrenName}_from" class="req" class="w-32" step="0.01" min="0" max="100" data-message="Please enter a ${list.VNAME}" data-parent="${list.NID}" data-input="from" disabled>
                            </label>
                            <label class="input w-full">
                                <span class="label">To</span>
                                <input type="number" name="${childrenName}_to" class="req" class="w-32" step="0.01" min="0" max="100" data-message="Please enter a ${list.VNAME}" data-parent="${list.NID}" data-input="to" disabled>
                            </label>
                        </fieldset>`;
                    break;
                case 'from_to':
                    valueHtml2 = `
                        <fieldset class="hidden flex flex-col gap-2 w-full mt-2 pl-8">
                            <label class="input w-full">
                                <span class="label">From</span>
                                <input type="text" name="${childrenName}_from" class="req" data-message="Please enter a ${list.VNAME}" data-parent="${list.NID}" data-input="from" disabled>
                            </label>
                            <label class="input w-full">
                                <span class="label">To</span>
                                <input type="text" name="${childrenName}_to" class="req" data-message="Please enter a ${list.VNAME}" data-parent="${list.NID}" data-input="to" disabled>
                            </label>
                        </fieldset>`;
                    break;
                default:
                    throw new Error(`Unsupported type: ${type}`);
            }
        }
        let html = `
            <div class="rounded-lg border border-slate-200 px-3 py-2 ${parent ? 'bg-base-100' : ''}">

                <label class="flex items-start gap-2 cursor-pointer!">
                    <input
                        type="${type}"
                        name="${name}"
                        value="${list.NID}"
                        class="${inputClass} handle-children ${parent ? 'hidden' : ''}"
                        data-children="${childrenName}"
                        data-container-id="${this.containerId}"
                        ${parentId ? `data-parent="${parentId}"` : ''}
                        ${parent ? 'disabled' : ''}
                    >

                    <span class="label-text text-nowrap">
                        ${label}
                    </span>

                    ${valueHtml}
                </label>
                ${valueHtml2}
        `;

        // ตรวจสอบว่ามีรายการลูก (child) หรือไม่ และสร้าง HTML สำหรับรายการลูก (child) ถ้ามี
        if (list.children?.length) {
            html += `
                <div class="pl-8 mt-2 flex flex-wrap gap-2" data-parent-id="${list.NID}">
                    ${list.children.map((child) => this.#render({ list: child, name: childrenName, parent: true })).join('')}
                </div>
            `;
        }

        html += `</div>`;

        return html;
    }
    #bindEvents() {
        if (!this.containerId) return;
        /**
         * @author Sutthipong Tangmongkhoncharoen(24008)
         * @since 2026-10-07
         * @description จัดการเหตุการณ์เปลี่ยนแปลง (change) สำหรับองค์ประกอบ input ภายใน container.
         *
         */
        document.addEventListener('change', (event) => {
            const target = event.target;
            /**
             * @description ตรวจสอบว่าเหตุการณ์เกิดขึ้นจากองค์ประกอบ input ภายใน container หรือไม่.
             */
            if (target.matches(`[data-container-id="${this.containerId}"]`)) {
                try {
                    const checked = target.checked;
                    // ฟังก์ชันสำหรับตั้งค่าสีพื้นหลังขององค์ประกอบตามสถานะ checked.
                    function setBgColor(element, checked) {
                        const labelElement = element.parentElement;
                        const divElement = labelElement.parentElement;
                        const parent = element.getAttribute('data-parent');
                        if (checked) {
                            divElement.style.borderColor =
                                'oklch(0.84 0.09 278.07)';
                            divElement.style.backgroundColor =
                                'oklch(0.97 0.01 256.9)';
                            if (parent) {
                                divElement.style.backgroundColor =
                                    'oklch(0.92 0.03 261.1)';
                                divElement.style.color =
                                    'oklch(0.48 0.26 267.11)';
                            }
                        } else {
                            divElement.style.borderColor =
                                'var(--color-slate-200)';
                            divElement.style.backgroundColor = 'white';
                            if (parent) {
                                divElement.style.backgroundColor =
                                    'var(--color-base-100)';
                                divElement.style.color = 'black';
                            }
                        }
                    }
                    // ตั้งค่าสีพื้นหลังขององค์ประกอบเป้าหมายตามสถานะ checked.
                    // หากเป็น radio button ให้จัดการกลุ่มของ radio buttons ทั้งหมดที่มีชื่อเดียวกัน.
                    if (target.getAttribute('type') === 'radio') {
                        const radioGroupName = target.getAttribute('name');
                        const radioGroup = document.querySelectorAll(
                            `[name="${radioGroupName}"]`,
                        );
                        radioGroup.forEach((r) => {
                            setBgColor(r, r.checked);
                        });
                    } else {
                        setBgColor(target, checked);
                    }
                    const textElement = (child) =>
                        (child.tagName === 'INPUT' &&
                            child.type !== 'radio' &&
                            child.type !== 'checkbox') ||
                        child.tagName === 'TEXTAREA';
                    const radioElement = (child) =>
                        child.tagName === 'INPUT' && child.type === 'radio';
                    const checkboxElement = (child) =>
                        child.tagName === 'INPUT' && child.type === 'checkbox';
                    const getChildren = (name) =>
                        document.querySelectorAll(
                            `[name="${name}"], [name="${name}_to"], [name="${name}_from"], [name="${name}_text"], [name="${name}_number"], [name="${name}_area"]`,
                        );
                    const handleChildren = ({ children, radio }) => {
                        children.forEach((child) => {
                            // ตรวจสอบและจัดการ children ของ radio button
                            // หาก child เป็น radio button ให้จัดการกลุ่มของ radio buttons ทั้งหมดที่มีชื่อเดียวกัน.
                            if (child.getAttribute('type') === 'radio') {
                                const radioGroupName =
                                    child.getAttribute('name'); // ชื่อกลุ่มของ radio buttons
                                // เลือกกลุ่มของ radio buttons ทั้งหมดที่มีชื่อเดียวกัน
                                const radioGroup = document.querySelectorAll(
                                    `[name="${radioGroupName}"]`,
                                );
                                radioGroup.forEach((r) => {
                                    const childrenName =
                                        r.getAttribute('data-children');
                                    handleChildren({
                                        children: getChildren(childrenName),
                                        radio: r,
                                    });
                                });
                            }

                            // หาก radio button ไม่ตรงกับ target ให้ปิดใช้งานและซ่อน children.
                            if (radio && radio !== target) {
                                child.disabled = true;
                                child.classList.add('hidden');
                                if (textElement(child)) {
                                    child.value = '';
                                }
                                if (
                                    radioElement(child) ||
                                    checkboxElement(child)
                                ) {
                                    child.checked = false;
                                    setBgColor(child, false);
                                }
                                if (this.#isFromTo(child)) {
                                    child
                                        .closest('fieldset')
                                        .classList.toggle('hidden', !checked);
                                }
                                return;
                            }
                            // เปิดใช้งานและแสดง children
                            child.disabled = !checked;
                            child.classList.toggle('hidden', !checked);
                            if (textElement(child)) {
                                child.value = '';
                            }
                            if (radioElement(child) || checkboxElement(child)) {
                                child.checked = false;
                                setBgColor(child, false);
                            }
                            if (this.#isFromTo(child)) {
                                child
                                    .closest('fieldset')
                                    .classList.toggle('hidden', !checked);
                            }
                        });
                    };
                    // ตรวจสอบว่า target เป็น radio button หรือไม่
                    // หาก target เป็น radio button จะต้องจัดการ children ของกลุ่ม radio buttons ทั้งหมด
                    if (target.getAttribute('type') == 'radio') {
                        const radioGroupName = target.getAttribute('name'); // ชื่อกลุ่มของ radio buttons
                        // เลือกกลุ่มของ radio buttons ทั้งหมดที่มีชื่อเดียวกัน
                        const radioGroup = document.querySelectorAll(
                            `[name="${radioGroupName}"]`,
                        );
                        radioGroup.forEach((radio) => {
                            const childrenName =
                                radio.getAttribute('data-children');
                            handleChildren({
                                children: getChildren(childrenName),
                                radio,
                            });
                        });
                        return;
                    }
                    // หาก target ไม่ใช่ radio button จะต้องจัดการ children ของ target element โดยตรง
                    const childrenName = target.getAttribute('data-children');
                    handleChildren({
                        children: getChildren(childrenName),
                    });
                } catch (error) {
                    console.error(error);
                    showErrorMessage(error.message);
                }
            }
        });
    }
    /**
     * @author Sutthipong tangmongkhoncharoen(24008)
     * @since 2026-10-07
     * @description ตรวจสอบว่า input element เป็น from/to หรือไม่
     * @param {HTMLInputElement} document
     * @returns {boolean} true ถ้าเป็น from/to, false ถ้าไม่ใช่
     */
    #isFromTo(document) {
        const name = document.getAttribute('name');
        return name.endsWith('_to') || name.endsWith('_from');
    }
}
