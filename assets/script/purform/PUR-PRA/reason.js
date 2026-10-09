import { showErrorMessage } from '@amec/webasset/utils';
import {
    getReasonConditionRevise,
    getReasonCostDown,
    getReasonCostUp,
    getReasonEstimatePrice,
} from './data';

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
            .map((r) => this.#render(r, name))
            .join('');
        if (this.halfColumn) {
            const rows = Math.ceil(this.lists.length / 2);
            this.container.style.gridTemplateRows = `repeat(${rows}, auto)`;
        }
        this.#bindEvents();
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
    #render(r, name, parent = true) {
        const type = r.VINPUT_TYPE.toLowerCase();

        let inputClass =
            type === 'radio'
                ? 'radio radio-sm radio-primary'
                : 'checkbox checkbox-sm checkbox-primary';

        let valueHtml = ''; // สำหรับ input ปกติ
        let valueHtml2 = ''; // สำหรับ input แบบ from_to
        const childrenName = `${name}_${r.NID}`; // ชื่อของ input element สำหรับรายการลูก (child)
        let label = `${r.NSEQ}. ${r.VNAME}`; // ป้ายชื่อของรายการเหตุผล
        if (!parent) {
            label = r.VNAME; // ป้ายชื่อของรายการเหตุผลสำหรับรายการลูก (child)
        }

        if (r.VVALUE_TYPE) {
            switch (r.VVALUE_TYPE.toLowerCase()) {
                case 'text':
                    valueHtml = `<input type="text" name="${childrenName}" class="input w-full hidden" disabled>`;
                    break;
                case 'number':
                    valueHtml = `<input type="number" name="${childrenName}" class="input w-full hidden" disabled>`;
                    break;
                case 'area':
                    valueHtml = `<textarea name="${childrenName}" class="textarea w-full hidden" rows="2" disabled></textarea>`;
                    break;
                case 'from_to_percent':
                    valueHtml2 = `
                        <fieldset class="hidden flex flex-col gap-2 w-full mt-2 pl-8">
                            <label class="input w-full">
                                <span class="label">From</span>
                                <input type="number" name="${childrenName}_from" class="w-32" step="0.01" min="0" max="100" disabled>
                            </label>
                            <label class="input w-full">
                                <span class="label">To</span>
                                <input type="number" name="${childrenName}_to" class="w-32" step="0.01" min="0" max="100" disabled>
                            </label>
                        </fieldset>`;
                    break;
                case 'from_to':
                    valueHtml2 = `
                        <fieldset class="hidden flex flex-col gap-2 w-full mt-2 pl-8">
                            <label class="input w-full">
                                <span class="label">From</span>
                                <input type="text" name="${childrenName}_from" disabled>
                            </label>
                            <label class="input w-full">
                                <span class="label">To</span>
                                <input type="text" name="${childrenName}_to" disabled>
                            </label>
                        </fieldset>`;
                    break;
                default:
                    throw new Error(`Unsupported type: ${type}`);
            }
        }

        let html = `
            <div class="rounded-lg border border-slate-200 px-3 py-2">

                <label class="flex items-start gap-2 cursor-pointer!">
                    <input
                        type="${type}"
                        name="${name}"
                        value="${r.NID}"
                        class="${inputClass} handle-children ${!parent ? 'hidden' : ''}"
                        data-children="${childrenName}"
                        data-container-id="${this.containerId}"
                        ${!parent ? 'disabled' : ''}
                    >

                    <span class="label-text text-nowrap">
                        ${label}
                    </span>

                    ${valueHtml}
                </label>
                ${valueHtml2}
        `;

        // ตรวจสอบว่ามีรายการลูก (child) หรือไม่ และสร้าง HTML สำหรับรายการลูก (child) ถ้ามี
        if (r.children?.length) {
            html += `
                <div class="pl-8 mt-2 flex flex-wrap gap-2" data-parent-id="${r.NID}">
                    ${r.children.map((child) => this.#render(child, childrenName, false)).join('')}
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
                    const type = target.getAttribute('type');
                    // ตรวจสอบประเภทของ input ว่าเป็น radio หรือไม่.
                    if (type === 'radio') {
                        const radioGroupName = target.getAttribute('name'); // ชื่อกลุ่มของ radio buttons
                        // เลือกกลุ่มของ radio buttons ทั้งหมดที่มีชื่อเดียวกัน
                        const radioGroup = document.querySelectorAll(
                            `[name="${radioGroupName}"]`,
                        );
                        // วนลูปผ่าน radio buttons ในกลุ่มเพื่อตรวจสอบและจัดการ children ของแต่ละ radio.
                        radioGroup.forEach((radio) => {
                            const childrenName =
                                radio.getAttribute('data-children');
                            const children = document.querySelectorAll(
                                `[name="${childrenName}"], [name="${childrenName}_to"], [name="${childrenName}_from"]`,
                            );
                            if (!children.length) return;
                            children.forEach((child) => {
                                // หาก radio button ไม่ตรงกับ target ให้ปิดใช้งานและซ่อน children ของมัน.
                                if (radio !== target) {
                                    child.disabled = true;
                                    child.classList.add('hidden');
                                    child.value = '';
                                    if (this.#isFromTo(child)) {
                                        child
                                            .closest('fieldset')
                                            .classList.toggle(
                                                'hidden',
                                                !checked,
                                            );
                                    }
                                    return;
                                }
                                // หาก radio button ตรงกับ target ให้เปิดใช้งานและแสดง children ของมัน.
                                child.disabled = !checked;
                                child.classList.toggle('hidden', !checked);
                                child.value = '';
                                if (this.#isFromTo(child)) {
                                    child
                                        .closest('fieldset')
                                        .classList.toggle('hidden', !checked);
                                }
                            });
                        });
                        return;
                    }
                    const childrenName = target.getAttribute('data-children');
                    const children = document.querySelectorAll(
                        `[name="${childrenName}"], [name="${childrenName}_to"], [name="${childrenName}_from"]`,
                    );
                    if (!children.length) return;
                    // วนลูปผ่าน children ของ target เพื่อตรวจสอบและจัดการสถานะการเปิดใช้งานและการแสดงผล.
                    children.forEach((child) => {
                        child.disabled = !checked;
                        child.value = '';
                        child.classList.toggle('hidden', !checked);
                        if (this.#isFromTo(child)) {
                            child
                                .closest('fieldset')
                                .classList.toggle('hidden', !checked);
                        }
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
