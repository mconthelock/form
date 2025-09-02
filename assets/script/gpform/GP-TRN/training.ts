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
    // ปุ่มส่งฟอร์มกลาง
    // =====================
    const sendFormBtn = document.getElementById("sendFormBtn") as HTMLButtonElement | null;

    sendFormBtn?.addEventListener("click", () => {
        if (!currentFormType) {
            showAlert("⚠ แจ้งเตือน", "ยังไม่ได้เลือกฟอร์ม");
            return;
        }

        if (currentFormType === "functional") {
            if (validateFunctionalForm()) {
                showAlert("✅ Functional", "ฟอร์ม Functional พร้อมส่ง");
                // TODO: submit functional
            }
        } else if (currentFormType === "legal") {
            if (validateLegalForm()) {
                showAlert("✅ Legal", "ฟอร์ม Legal พร้อมส่ง");
                // TODO: submit legal
            }
        } else if (currentFormType === "meth") {
            if (validateMethForm()) {
                showAlert("✅ METH", "ฟอร์ม METH พร้อมส่ง");
                // TODO: submit meth
            }
        }
    });

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
    // ฟอร์ม Functional
    // =====================================================================
    const backBtnFunctional = document.getElementById("backBtn_func") as HTMLButtonElement | null;
    backBtnFunctional?.addEventListener("click", () => {
        const form = document.getElementById("form_functional");
        form?.classList.add("hidden");
        requestForm?.classList.add("hidden");
        selectCard?.classList.remove("hidden");

        if (trainingType) trainingType.value = "";
        if (detailBox) detailBox.classList.add("hidden");

        toggleSubmit();
    });

    function initFunctionalForm() {
        console.log("🚀 init Functional Form");

        // Request By
        bindEmpLookup(
            document.getElementById("funcRequestBy") as HTMLInputElement,
            { SNAME: document.getElementById("funcRequestByName") }
        );

        // Trainee
        bindEmpLookup(
            document.getElementById("funcTraineeCode") as HTMLInputElement,
            {
                SNAME: document.getElementById("funcTraineeName") as HTMLInputElement,
                SPOSITION: document.getElementById("funcTraineePosition") as HTMLInputElement,
                SSEC: document.getElementById("funcSec") as HTMLInputElement,
                SDEPT: document.getElementById("funcDept") as HTMLInputElement,
                SDIV: document.getElementById("funcDiv") as HTMLInputElement
            }
        );

        // ================================
        // Part 5 : การพิจารณาค่าใช้จ่าย
        // ================================
        const expenseRadios = document.querySelectorAll<HTMLInputElement>("input[name='funcExpenseOption']");
        const reasonBox = document.getElementById("funcReasonBox");
        const compareUpload = document.getElementById("funcCompareUpload");
        const part6 = document.getElementById("func_part6");

        expenseRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "not_compare" && radio.checked) {
                    reasonBox?.classList.remove("hidden");
                    compareUpload?.classList.add("hidden");
                } else if (radio.value === "compare" && radio.checked) {
                    reasonBox?.classList.add("hidden");
                    compareUpload?.classList.remove("hidden");
                    part6?.classList.remove("hidden");
                }
            });
        });

        // toggle เหตุผล not_compare
        const reasonRadios = document.querySelectorAll<HTMLInputElement>("input[name='funcReason']");
        reasonRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "free" && radio.checked) {
                    part6?.classList.add("hidden");
                } else {
                    part6?.classList.remove("hidden");
                }
            });
        });

        // ================================
        // Part 6 : ค่าใช้จ่าย (คำนวณ VAT)
        // ================================
        const vatResult = document.getElementById("funcVatResult") as HTMLElement | null;
        const amountInput = document.getElementById("funcAmountInput") as HTMLInputElement | null;

        vatResult?.classList.add("hidden");
        if (amountInput) {
            amountInput.value = "";
            amountInput.addEventListener("input", () => {
                if (!amountInput.value || !vatResult) return;

                const amount = parseFloat(amountInput.value);
                if (isNaN(amount)) {
                    vatResult.textContent = "";
                    vatResult.classList.add("hidden");
                    return;
                }

                const vat = amount * 0.07;
                const total = amount + vat;
                vatResult.textContent = `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
                vatResult.classList.remove("hidden");
            });
        }
    }


    // =====================================================================
    // ฟอร์ม Legal
    // =====================================================================
    const backBtnLegal = document.getElementById("backBtn_legal") as HTMLButtonElement | null;
    backBtnLegal?.addEventListener("click", () => {
        const form = document.getElementById("form_legal");
        form?.classList.add("hidden");
        requestForm?.classList.add("hidden");
        selectCard?.classList.remove("hidden");

        if (trainingType) trainingType.value = "";
        if (detailBox) detailBox.classList.add("hidden");

        toggleSubmit();
    });

    function initLegalForm() {
        console.log("🚀 init Legal Form");

        // Request By
        bindEmpLookup(
            document.getElementById("legalRequestBy") as HTMLInputElement,
            { SNAME: document.getElementById("legalRequestByName") }
        );

        // Trainee
        bindEmpLookup(
            document.getElementById("legalCode") as HTMLInputElement,
            {
                SNAME: document.getElementById("legalName") as HTMLInputElement,
                SPOSITION: document.getElementById("legalPosition") as HTMLInputElement,
                SSEC: document.getElementById("legalSec") as HTMLInputElement,
                SDEPT: document.getElementById("legalDept") as HTMLInputElement,
                SDIV: document.getElementById("legalDiv") as HTMLInputElement
            }
        );

        // Part 6 : การพิจารณาค่าใช้จ่าย
        const expenseRadios = document.querySelectorAll<HTMLInputElement>("input[name='legalExpenseOption']");
        const reasonBox = document.getElementById("legalReasonBox");
        const compareUpload = document.getElementById("legalCompareUpload");
        const part7 = document.getElementById("legal_part7");

        expenseRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "not_compare" && radio.checked) {
                    reasonBox?.classList.remove("hidden");
                    compareUpload?.classList.add("hidden");
                } else if (radio.value === "compare" && radio.checked) {
                    reasonBox?.classList.add("hidden");
                    compareUpload?.classList.remove("hidden");
                    part7?.classList.remove("hidden");
                }
            });
        });

        // toggle เหตุผล not_compare
        const reasonRadios = document.querySelectorAll<HTMLInputElement>("input[name='legalReason']");
        reasonRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "free" && radio.checked) {
                    part7?.classList.add("hidden");
                } else {
                    part7?.classList.remove("hidden");
                }
            });
        });

        // Part 7 : ค่าใช้จ่าย (คำนวณ VAT)
        const vatResult = document.getElementById("legalVatResult") as HTMLElement | null;
        const amountInput = document.getElementById("legalAmount") as HTMLInputElement | null;

        vatResult?.classList.add("hidden");
        if (amountInput) {
            amountInput.value = "";
            amountInput.addEventListener("input", () => {
                if (!amountInput.value || !vatResult) return;

                const amount = parseFloat(amountInput.value);
                if (isNaN(amount)) {
                    vatResult.textContent = "";
                    vatResult.classList.add("hidden");
                    return;
                }

                const vat = amount * 0.07;
                const total = amount + vat;
                vatResult.textContent = `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
                vatResult.classList.remove("hidden");
            });
        }
    }

    // =====================================================================
    // ฟอร์ม METH
    // =====================================================================
    const backBtnMeth = document.getElementById("backBtn_meth") as HTMLButtonElement | null;
    backBtnMeth?.addEventListener("click", () => {
        const form = document.getElementById("form_meth");
        form?.classList.add("hidden");
        requestForm?.classList.add("hidden");
        selectCard?.classList.remove("hidden");

        if (trainingType) trainingType.value = "";
        if (detailBox) detailBox.classList.add("hidden");

        toggleSubmit();
    });

    function initMethForm() {
        console.log("🚀 init Meth Form");

        // Request By
        bindEmpLookup(
            document.getElementById("methRequestBy") as HTMLInputElement,
            { SNAME: document.getElementById("methRequestByName") }
        );

        // Trainee
        bindEmpLookup(
            document.getElementById("methCode") as HTMLInputElement,
            {
                SNAME: document.getElementById("methName") as HTMLInputElement,
                SPOSITION: document.getElementById("methPosition") as HTMLInputElement,
                SSEC: document.getElementById("methSec") as HTMLInputElement,
                SDEPT: document.getElementById("methDept") as HTMLInputElement,
                SDIV: document.getElementById("methDiv") as HTMLInputElement
            }
        );

        // Reset ค่า VAT/Note (Part 6)
        const vatResult = document.getElementById("methVatResult") as HTMLElement | null;
        if (vatResult) {
            vatResult.textContent = "";
            vatResult.classList.add("hidden");
        }

        const amountInput = document.getElementById("methAmount") as HTMLInputElement | null;
        amountInput?.addEventListener("input", () => {
            if (!amountInput.value || !vatResult) return;

            const amount = parseFloat(amountInput.value);
            if (isNaN(amount)) {
                vatResult.textContent = "";
                vatResult.classList.add("hidden");
                return;
            }
            const vat = amount * 0.07;
            const total = amount + vat;
            vatResult.textContent = `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
            vatResult.classList.remove("hidden");
        });

        // toggle Expense Option (Part 5)
        const expenseRadios = document.querySelectorAll<HTMLInputElement>("input[name='methExpenseOption']");
        const reasonBox = document.getElementById("methReasonBox");
        const compareUpload = document.getElementById("methCompareUpload");
        const part6 = document.getElementById("meth_part6");

        expenseRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "not_compare" && radio.checked) {
                    reasonBox?.classList.remove("hidden");
                    compareUpload?.classList.add("hidden");
                } else if (radio.value === "compare" && radio.checked) {
                    reasonBox?.classList.add("hidden");
                    compareUpload?.classList.remove("hidden");
                    part6?.classList.remove("hidden");
                }
            });
        });

        // toggle เหตุผล not_compare
        const reasonRadios = document.querySelectorAll<HTMLInputElement>("input[name='methReason']");
        reasonRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "free" && radio.checked) {
                    part6?.classList.add("hidden");
                } else {
                    part6?.classList.remove("hidden");
                }
            });
        });
    }

    // =====================
// Validate Functional Form
// =====================
function validateFunctionalForm(): boolean {
    // Request By
    const requestBy = (document.getElementById("funcRequestBy") as HTMLInputElement)?.value.trim();
    if (!requestBy) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By");
        return false;
    }

    // Part 1
    const part1Fields = ["funcTrainingSubject","funcDateFrom","funcDateTo","funcTimeFrom","funcTimeTo","funcLocation","funcInstitute"];
    for (const id of part1Fields) {
        const el = document.getElementById(id) as HTMLInputElement;
        if (!el?.value.trim()) {
            showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูล Part 1 (${id})`);
            el?.focus(); return false;
        }
    }

    // Part 2
    const objective = document.querySelector<HTMLInputElement>("#funcObjectiveList input[name='funcObjective[]']");
    if (!objective?.value.trim()) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์ (Part 2)");
        objective?.focus(); return false;
    }

    // Part 3
    const expectation = document.querySelector<HTMLInputElement>("#funcExpectationList input[name='funcExpectation[]']");
    if (!expectation?.value.trim()) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอกความคาดหวัง / ประโยชน์ (Part 3)");
        expectation?.focus(); return false;
    }

    // Part 4
    const part4Fields = ["funcTraineeCode","funcTraineeName","funcTraineePosition","funcSec","funcDept","funcDiv","funcJdName","funcJdRelation"];
    for (const id of part4Fields) {
        const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
        if (!el?.value.trim()) {
            showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูล Part 4 (${id})`);
            el?.focus(); return false;
        }
    }

    // Part 5
    const expenseOption = document.querySelector<HTMLInputElement>("input[name='funcExpenseOption']:checked");
    if (!expenseOption) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part 5 (ค่าใช้จ่าย)");
        return false;
    }
    if (expenseOption.value === "not_compare") {
        const reason = document.querySelector<HTMLInputElement>("input[name='funcReason']:checked");
        if (!reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล (Part 5)");
            return false;
        }
        if (reason.value === "other") {
            const reasonText = document.getElementById("funcReasonOtherText") as HTMLInputElement;
            if (!reasonText?.value.trim()) {
                showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น (Part 5)");
                reasonText?.focus(); return false;
            }
        }
    } else if (expenseOption.value === "compare") {
        const files = (document.getElementById("funcCompareFiles") as HTMLInputElement)?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา (Part 5)");
            return false;
        }
    }

    // Part 6
    const amount = document.getElementById("funcAmountInput") as HTMLInputElement;
    if (!amount?.value.trim()) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน (Part 6)");
        amount?.focus(); return false;
    }

    return true;
}

// =====================
// Validate Legal Form
// =====================
function validateLegalForm(): boolean {
    // Request By
    const requestBy = (document.getElementById("legalRequestBy") as HTMLInputElement)?.value.trim();
    if (!requestBy) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By");
        return false;
    }

    // Part 1
    const part1Fields = ["legalSubject","legalDateFrom","legalDateTo","legalTimeFrom","legalTimeTo","legalPlace","legalInstitute"];
    for (const id of part1Fields) {
        const el = document.getElementById(id) as HTMLInputElement;
        if (!el?.value.trim()) {
            showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part 1 `);
            el?.focus(); return false;
        }
    }

    // Part 2
    const concernLaw = document.getElementById("legalConcernLaw") as HTMLTextAreaElement;
    if (!concernLaw?.value.trim()) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอกข้อกฎหมายที่เกี่ยวข้อง (Part 2)");
        concernLaw?.focus(); return false;
    }

    // Part 3
    const objective = document.querySelector<HTMLInputElement>("#legalObjectiveList input[name='legalObjective[]']");
    if (!objective?.value.trim()) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์ (Part 3)");
        objective?.focus(); return false;
    }

    // Part 4
    const traineeCode = document.getElementById("legalCode") as HTMLInputElement;
    if (!traineeCode?.value.trim()) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอกรหัสพนักงาน (Part 4)");
        traineeCode?.focus(); return false;
    }

    // Part 5
    const part5Fields = ["legalName","legalPosition","legalSec","legalDept","legalDiv"];
    for (const id of part5Fields) {
        const el = document.getElementById(id) as HTMLInputElement;
        if (!el?.value.trim()) {
            showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูล Part 5 (${id})`);
            el?.focus(); return false;
        }
    }

    // Part 6
    const expenseOption = document.querySelector<HTMLInputElement>("input[name='legalExpenseOption']:checked");
    if (!expenseOption) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part 6 (ค่าใช้จ่าย)");
        return false;
    }
    if (expenseOption.value === "not_compare") {
        const reason = document.querySelector<HTMLInputElement>("input[name='legalReason']:checked");
        if (!reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล (Part 6)");
            return false;
        }
        if (reason.value === "other") {
            const reasonText = document.getElementById("legalReasonText") as HTMLInputElement;
            if (!reasonText?.value.trim()) {
                showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น (Part 6)");
                reasonText?.focus(); return false;
            }
        }
    } else if (expenseOption.value === "compare") {
        const files = (document.getElementById("legalCompareFiles") as HTMLInputElement)?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา (Part 6)");
            return false;
        }
    }

    // Part 7
    const amount = document.getElementById("legalAmount") as HTMLInputElement;
    if (!amount?.value.trim()) {
        showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน (Part 7)");
        amount?.focus(); return false;
    }

    return true;
}

    // =====================
    // Validate Meth Form
    // =====================
    function validateMethForm(): boolean {
        // Request By
        const requestBy = (document.getElementById("methRequestBy") as HTMLInputElement)?.value.trim();
        if (!requestBy) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By");
            return false;
        }

        // Part 1
        const part1Fields = ["methSubject","methDateFrom","methDateTo","methTimeFrom","methTimeTo","methPlace","methInstitute"];
        for (const id of part1Fields) {
            const el = document.getElementById(id) as HTMLInputElement;
            if (!el?.value.trim()) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part 1 `);
                el?.focus(); return false;
            }
        }

        // Part 2
        const objective = document.querySelector<HTMLInputElement>("#methObjectiveList input[name='methObjective[]']");
        if (!objective?.value.trim()) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์ (Part 2)");
            objective?.focus(); return false;
        }

        // Part 3
        const expectation = document.querySelector<HTMLInputElement>("#methExpectationList input[name='methExpectation[]']");
        if (!expectation?.value.trim()) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกความคาดหวัง / ประโยชน์ (Part 3)");
            expectation?.focus(); return false;
        }

        // Part 4
        const part4Fields = ["methCode","methName","methPosition","methSec","methDept","methDiv"];
        for (const id of part4Fields) {
            const el = document.getElementById(id) as HTMLInputElement;
            if (!el?.value.trim()) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูล Part 4 (${id})`);
                el?.focus(); return false;
            }
        }

        // Part 5
        const expenseOption = document.querySelector<HTMLInputElement>("input[name='methExpenseOption']:checked");
        if (!expenseOption) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part 5 (ค่าใช้จ่าย)");
            return false;
        }
        if (expenseOption.value === "not_compare") {
            const reason = document.querySelector<HTMLInputElement>("input[name='methReason']:checked");
            if (!reason) {
                showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล (Part 5)");
                return false;
            }
            if (reason.value === "other") {
                const reasonText = document.getElementById("methReasonText") as HTMLInputElement;
                if (!reasonText?.value.trim()) {
                    showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น (Part 5)");
                    reasonText?.focus(); return false;
                }
            }
        } else if (expenseOption.value === "compare") {
            const files = (document.getElementById("methCompareFiles") as HTMLInputElement)?.files;
            if (!files || files.length === 0) {
                showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา (Part 5)");
                return false;
            }
        }

        // Part 6
        const amount = document.getElementById("methAmount") as HTMLInputElement;
        if (!amount?.value.trim()) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน (Part 6)");
            amount?.focus(); return false;
        }

        return true;
    }


    // =====================
    // เรียกตอนโหลดครั้งแรก
    // =====================
    toggleSubmit();
});
