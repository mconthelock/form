declare const getEmpUrl: string;

// ==================================================
// Training.ts
// รวม logic ของหน้าจอเลือกฟอร์ม + ฟอร์มย่อย (functional, legal, meth)
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
    // =====================
    // ส่วนกลาง: ตัวแปร DOM ที่ใช้ทุกหน้า
    // =====================
    const trainingType = document.getElementById("trainingType") as HTMLSelectElement | null;
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement | null;
    const selectCard = document.getElementById("selectCard") as HTMLElement | null;
    const requestForm = document.getElementById("requestForm") as HTMLElement | null;
    const detailBox = document.getElementById("detailBox") as HTMLElement | null;
    const detailTitle = document.getElementById("detailTitle") as HTMLElement | null;
    const detailDesc = document.getElementById("detailDesc") as HTMLElement | null;
    const alertModal = document.getElementById("alertModal") as HTMLDialogElement | null;
    const alertTitle = document.getElementById("alertTitle") as HTMLElement | null;
    const alertMessage = document.getElementById("alertMessage") as HTMLElement | null;


    // =====================
    // ส่วนกลาง: โครงสร้างรายละเอียด training type
    // =====================
    interface Detail {
        title: string;
        desc: string;
    }

    const details: Record<string, Detail> = {
        functional: {
            title: "Support Specific Functional Competency",
            desc: "ฟอร์มสำหรับฝึกอบรมเพื่อพัฒนาสมรรถนะเฉพาะทาง",
        },
        legal: {
            title: "Support Legal Requirement",
            desc: "ฟอร์มสำหรับฝึกอบรมที่เกี่ยวข้องกับข้อกำหนดทางกฎหมาย",
        },
        meth: {
            title: "Support ME-TH Training subject",
            desc: "ฟอร์มสำหรับหัวข้อการฝึกอบรม ME-TH",
        },
    };

    // =====================
    // ส่วนกลาง: Modal Alert
    // =====================
    function showAlert(title: string, message: string) {
        if (alertModal && typeof alertModal.showModal === "function") {
            if (alertTitle) alertTitle.textContent = title;
            if (alertMessage) alertMessage.textContent = message;
            alertModal.showModal();
        } else {
            alert(message);
        }
    }

    // =====================
    // ส่วนกลาง: Toggle ปุ่ม Submit
    // =====================
    function toggleSubmit() {
        if (!trainingType || !submitBtn) return;

        if (trainingType.value === "") {
            submitBtn.disabled = true;
            submitBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700", "cursor-pointer");
            submitBtn.classList.add("bg-indigo-400", "cursor-not-allowed");
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove("bg-indigo-400", "cursor-not-allowed");
            submitBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700", "cursor-pointer");
        }
    }

    // =====================
    // ตัวแปรบอกว่าอยู่ฟอร์มไหน
    // =====================
    let currentFormType: "functional" | "legal" | "meth" | null = null;

    // =====================
    // Event เมื่อ select เปลี่ยนค่า
    // =====================
    trainingType?.addEventListener("change", () => {
        const val = trainingType.value;

        if (details[val]) {
            if (detailTitle) detailTitle.textContent = details[val].title;
            if (detailDesc) detailDesc.textContent = details[val].desc;
            detailBox?.classList.remove("hidden");
        } else {
            detailBox?.classList.add("hidden");
        }

        toggleSubmit();
    });

    // =====================
    // Event เมื่อกดปุ่ม Submit (ไปยังฟอร์ม)
    // =====================
    submitBtn?.addEventListener("click", () => {
        const val = trainingType?.value as "functional" | "legal" | "meth" | "";
        if (!val) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกประเภทการฝึกอบรมก่อน !!");
            return;
        }

        // ซ่อน card เลือก
        selectCard?.classList.add("hidden");
        document.querySelectorAll("#requestForm > div").forEach(div => {
            (div as HTMLElement).classList.add("hidden");
        });

        const selectedForm = document.getElementById("form_" + val);
        if (selectedForm) {
            requestForm?.classList.remove("hidden");
            selectedForm.classList.remove("hidden");

            currentFormType = val; // 👉 เก็บว่าฟอร์มไหน active

            // เรียก init เฉพาะฟอร์ม
            if (val === "functional") initFunctionalForm();
            else if (val === "legal") initLegalForm();
            else if (val === "meth") initMethForm();
        } else {
            showAlert("⚠ แจ้งเตือน", "ฟอร์มนี้ยังไม่ได้ถูกสร้างครับ");
        }
    });

    // =====================
    // Dynamic List (+/-)
    // =====================
    function bindDynamicList(listId: string, inputName: string, placeholder: string, type: "objective" | "expectation") {
        const list = document.getElementById(listId);

        list?.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains(`add-${type}`)) {
                const newRow = document.createElement("div");
                newRow.className = `flex items-center gap-2 ${type}-item`;
                newRow.innerHTML = `
                    <input type="text" name="${inputName}[]" placeholder="${placeholder}" class="input input-bordered w-full">
                    <button type="button" class="btn btn-sm bg-red-500 text-white remove-${type}">–</button>
                `;
                list.appendChild(newRow);
            } else if (target.classList.contains(`remove-${type}`)) {
                target.closest(`.${type}-item`)?.remove();
            }
        });
    }

    // Functional
    bindDynamicList("funcObjectiveList", "funcObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("funcExpectationList", "funcExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");

    // Legal
    bindDynamicList("legalObjectiveList", "legalObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("legalExpectationList", "legalExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");

    // Meth
    bindDynamicList("methObjectiveList", "methObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("methExpectationList", "methExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");

    // ==================================================
    // ฟังก์ชันกลาง: ดึงข้อมูลพนักงาน
    // ==================================================
    async function bindEmpLookup(
        inputEl: HTMLInputElement | null,
        outputMap: { [key: string]: HTMLElement | HTMLInputElement | null }
    ) {
        inputEl?.addEventListener("input", async () => {
            const empno = inputEl.value.trim();
            if (empno.length === 5) {
                try {
                    const res = await fetch(getEmpUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: "empno=" + encodeURIComponent(empno)
                    });
                    const data = await res.json();

                    if (data.status === "success") {
                        Object.entries(outputMap).forEach(([key, el]) => {
                            if (!el) return;
                            if ("value" in el) {
                                (el as HTMLInputElement).value = data[key] ?? "";
                            } else {
                                el.textContent = data[key] ?? "";
                            }
                        });
                    } else {
                        Object.values(outputMap).forEach(el => {
                            if (!el) return;
                            if ("value" in el) (el as HTMLInputElement).value = "";
                            else el.textContent = "";
                        });
                        showAlert("⚠ แจ้งเตือน", data.message);
                    }
                } catch (err) {
                    console.error(err);
                    showAlert("⚠ แจ้งเตือน", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
                }
            } else {
                Object.values(outputMap).forEach(el => {
                    if (!el) return;
                    if ("value" in el) (el as HTMLInputElement).value = "";
                    else el.textContent = "";
                });
            }
        });
    }

    // =====================================================================
    // init + back button ของแต่ละ Form
    // =====================================================================
    function initFunctionalForm() {
        bindEmpLookup(document.getElementById("funcRequestBy") as HTMLInputElement,
            { SNAME: document.getElementById("funcRequestByName") });

        bindEmpLookup(document.getElementById("funcTraineeCode") as HTMLInputElement,
            {
                SNAME: document.getElementById("funcTraineeName") as HTMLInputElement,
                SPOSITION: document.getElementById("funcTraineePosition") as HTMLInputElement,
                SSEC: document.getElementById("funcSec") as HTMLInputElement,
                SDEPT: document.getElementById("funcDept") as HTMLInputElement,
                SDIV: document.getElementById("funcDiv") as HTMLInputElement
            });
    }

    function initLegalForm() {
        bindEmpLookup(document.getElementById("legalRequestBy") as HTMLInputElement,
            { SNAME: document.getElementById("legalRequestByName") });

        bindEmpLookup(document.getElementById("legalCode") as HTMLInputElement,
            {
                SNAME: document.getElementById("legalName") as HTMLInputElement,
                SPOSITION: document.getElementById("legalPosition") as HTMLInputElement,
                SSEC: document.getElementById("legalSec") as HTMLInputElement,
                SDEPT: document.getElementById("legalDept") as HTMLInputElement,
                SDIV: document.getElementById("legalDiv") as HTMLInputElement
            });
    }

    function initMethForm() {
        bindEmpLookup(document.getElementById("methRequestBy") as HTMLInputElement,
            { SNAME: document.getElementById("methRequestByName") });

        bindEmpLookup(document.getElementById("methCode") as HTMLInputElement,
            {
                SNAME: document.getElementById("methName") as HTMLInputElement,
                SPOSITION: document.getElementById("methPosition") as HTMLInputElement,
                SSEC: document.getElementById("methSec") as HTMLInputElement,
                SDEPT: document.getElementById("methDept") as HTMLInputElement,
                SDIV: document.getElementById("methDiv") as HTMLInputElement
            });
    }

    // =====================================================================
    // Validate Function (ตาม requirement)
    // =====================================================================
    function validateFunctionalForm(): boolean {
        // Request By
        const requestBy = (document.getElementById("funcRequestBy") as HTMLInputElement)?.value.trim();
        if (!requestBy) { showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By"); return false; }

        // Part 1
        const part1Fields = ["funcTrainingSubject","funcDateFrom","funcDateTo","funcTimeFrom","funcTimeTo","funcLocation","funcInstitute"];
        for (const id of part1Fields) {
            const el = document.getElementById(id) as HTMLInputElement;
            if (!el?.value.trim()) { showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part1 `); el?.focus(); return false; }
        }

        // Part 2
        const objective = document.querySelector<HTMLInputElement>("#funcObjectiveList input[name='funcObjective[]']");
        if (!objective?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์"); return false; }

        // Part 3
        const expectation = document.querySelector<HTMLInputElement>("#funcExpectationList input[name='funcExpectation[]']");
        if (!expectation?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกความคาดหวัง"); return false; }

        // Part 4
        const part4Fields = ["funcTraineeCode","funcTraineeName","funcTraineePosition","funcSec","funcDept","funcDiv","funcJdName","funcJdRelation"];
        for (const id of part4Fields) {
            const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
            if (!el?.value.trim()) { showAlert("⚠ แจ้งเตือน", `กรุณากรอก Part4 (${id})`); el?.focus(); return false; }
        }

        // Part 5
        const expenseOption = document.querySelector<HTMLInputElement>("input[name='funcExpenseOption']:checked");
        if (!expenseOption) { showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part5 ค่าใช้จ่าย"); return false; }
        if (expenseOption.value === "not_compare") {
            const reason = document.querySelector<HTMLInputElement>("input[name='funcReason']:checked");
            if (!reason) { showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล"); return false; }
            if (reason.value === "other") {
                const reasonText = document.getElementById("funcReasonOtherText") as HTMLInputElement;
                if (!reasonText?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น"); return false; }
            }
        } else if (expenseOption.value === "compare") {
            const files = (document.getElementById("funcCompareFiles") as HTMLInputElement)?.files;
            if (!files || files.length === 0) { showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา"); return false; }
        }

        // Part 6
        const amount = document.getElementById("funcAmountInput") as HTMLInputElement;
        if (!amount?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน"); return false; }

        return true;
    }

    function validateLegalForm(): boolean {
        const requestBy = (document.getElementById("legalRequestBy") as HTMLInputElement)?.value.trim();
        if (!requestBy) { showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By"); return false; }

        const part1Fields = ["legalSubject","legalDateFrom","legalDateTo","legalTimeFrom","legalTimeTo","legalPlace","legalInstitute"];
        for (const id of part1Fields) {
            const el = document.getElementById(id) as HTMLInputElement;
            if (!el?.value.trim()) { showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part1 `); return false; }
        }

        const concernLaw = document.getElementById("legalConcernLaw") as HTMLTextAreaElement;
        if (!concernLaw?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกข้อกฎหมาย"); return false; }

        const objective = document.querySelector<HTMLInputElement>("#legalObjectiveList input[name='legalObjective[]']");
        if (!objective?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์"); return false; }

        const traineeCode = document.getElementById("legalCode") as HTMLInputElement;
        if (!traineeCode?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกรหัสพนักงาน"); return false; }

        const part5Fields = ["legalName","legalPosition","legalSec","legalDept","legalDiv"];
        for (const id of part5Fields) {
            const el = document.getElementById(id) as HTMLInputElement;
            if (!el?.value.trim()) { showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part5 (${id})`); return false; }
        }

        const expenseOption = document.querySelector<HTMLInputElement>("input[name='legalExpenseOption']:checked");
        if (!expenseOption) { showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part6 ค่าใช้จ่าย"); return false; }
        if (expenseOption.value === "not_compare") {
            const reason = document.querySelector<HTMLInputElement>("input[name='legalReason']:checked");
            if (!reason) { showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล"); return false; }
            if (reason.value === "other") {
                const reasonText = document.getElementById("legalReasonText") as HTMLInputElement;
                if (!reasonText?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น"); return false; }
            }
        } else if (expenseOption.value === "compare") {
            const files = (document.getElementById("legalCompareFiles") as HTMLInputElement)?.files;
            if (!files || files.length === 0) { showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา"); return false; }
        }

        const amount = document.getElementById("legalAmount") as HTMLInputElement;
        if (!amount?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน"); return false; }

        return true;
    }

    function validateMethForm(): boolean {
        const requestBy = (document.getElementById("methRequestBy") as HTMLInputElement)?.value.trim();
        if (!requestBy) { showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By"); return false; }

        const part1Fields = ["methSubject","methDateFrom","methDateTo","methTimeFrom","methTimeTo","methPlace","methInstitute"];
        for (const id of part1Fields) {
            const el = document.getElementById(id) as HTMLInputElement;
            if (!el?.value.trim()) { showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part1 `); return false; }
        }

        const objective = document.querySelector<HTMLInputElement>("#methObjectiveList input[name='methObjective[]']");
        if (!objective?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์"); return false; }

        const expectation = document.querySelector<HTMLInputElement>("#methExpectationList input[name='methExpectation[]']");
        if (!expectation?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกความคาดหวัง"); return false; }

        const part4Fields = ["methCode","methName","methPosition","methSec","methDept","methDiv"];
        for (const id of part4Fields) {
            const el = document.getElementById(id) as HTMLInputElement;
            if (!el?.value.trim()) { showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part4 (${id})`); return false; }
        }

        const expenseOption = document.querySelector<HTMLInputElement>("input[name='methExpenseOption']:checked");
        if (!expenseOption) { showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part5 ค่าใช้จ่าย"); return false; }
        if (expenseOption.value === "not_compare") {
            const reason = document.querySelector<HTMLInputElement>("input[name='methReason']:checked");
            if (!reason) { showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล"); return false; }
            if (reason.value === "other") {
                const reasonText = document.getElementById("methReasonText") as HTMLInputElement;
                if (!reasonText?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น"); return false; }
            }
        } else if (expenseOption.value === "compare") {
            const files = (document.getElementById("methCompareFiles") as HTMLInputElement)?.files;
            if (!files || files.length === 0) { showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา"); return false; }
        }

        const amount = document.getElementById("methAmount") as HTMLInputElement;
        if (!amount?.value.trim()) { showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน"); return false; }

        return true;
    }

    // =====================================================================
    // ปุ่มส่งฟอร์มแต่ละ Form
    // =====================================================================
    document.getElementById("sendFuncFormBtn")?.addEventListener("click", () => {
        if (validateFunctionalForm()) {
            showAlert("✅ สำเร็จ", "ฟอร์ม Functional พร้อมส่ง");
            // TODO: submit functional
        }
    });

    document.getElementById("sendLegalFormBtn")?.addEventListener("click", () => {
        if (validateLegalForm()) {
            showAlert("✅ สำเร็จ", "ฟอร์ม Legal พร้อมส่ง");
            // TODO: submit legal
        }
    });

    document.getElementById("sendMethFormBtn")?.addEventListener("click", () => {
        if (validateMethForm()) {
            showAlert("✅ สำเร็จ", "ฟอร์ม METH พร้อมส่ง");
            // TODO: submit meth
        }
    });

    // =====================
    // เรียกตอนโหลดครั้งแรก
    // =====================
    toggleSubmit();
});
