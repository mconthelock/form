import { host } from "../../utils.js";
import { createForm, redirectWebflow } from "../../inc/_form.js";
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
    // ส่วนกลาง: Event เมื่อ select เปลี่ยนค่า
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
    // ส่วนกลาง: Event เมื่อกดปุ่ม Submit
    // =====================
    submitBtn?.addEventListener("click", () => {
        const val = trainingType?.value;

        if (!val) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกประเภทการฝึกอบรมก่อน !!");
            return;
        }

        selectCard?.classList.add("hidden");
        document.querySelectorAll("#requestForm > div").forEach(div => {
            (div as HTMLElement).classList.add("hidden");
        });

        const selectedForm = document.getElementById("form_" + val);
        if (selectedForm) {
            requestForm?.classList.remove("hidden");
            selectedForm.classList.remove("hidden");

            // 🔑 เรียก init ของแต่ละฟอร์ม
            if (val === "functional") initFunctionalForm();
            else if (val === "legal") initLegalForm();
            else if (val === "meth") initMethForm();
        } else {
            showAlert("⚠ แจ้งเตือน", "ฟอร์มนี้ยังไม่ได้ถูกสร้างครับ");
        }
    });

    
    // ฟังก์ชันตรวจสอบฟอร์มก่อนส่ง
    function validateFunctionalForm(): boolean {
        const requiredFields = [
            "trainingSubject",
            "dateFrom",
            "dateTo",
            "timeFrom",
            "timeTo",
            "location",
            "institute",
            "objective",
            "expectation",
            "traineeName",
            "traineeCode",
            "traineePosition",
            "sect",
            "dept",
            "div",
            "jdName",
            "jdRelation"
        ];

        for (const id of requiredFields) {
            const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
            if (el && !el.value.trim()) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน (${id})`);
                el.focus();
                return false;
            }
        }
        return true;
    }

    // Event ส่งฟอร์ม
    const sendFormBtn = document.getElementById("sendFormBtn") as HTMLButtonElement | null;
    sendFormBtn?.addEventListener("click", () => {
        if (validateFunctionalForm()) {
            // ถ้าผ่านการตรวจสอบ
            showAlert("✅ สำเร็จ", "ฟอร์มถูกกรอกครบแล้ว พร้อมส่งข้อมูล");
            // TODO: เพิ่มการ submit form ที่นี่ เช่น AJAX / fetch()
        }
    });


// ======================================================================================================================================================
// ฟอร์ม Functional *************************************************************************************************************************************
// ======================================================================================================================================================
    const backBtnFunctional = document.getElementById("backBtn_functional") as HTMLButtonElement | null;
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

        const optionRadios = document.querySelectorAll<HTMLInputElement>("input[name='expense_option']");
        const reasonBox = document.getElementById("reasonBox") as HTMLElement | null;
        const part6 = document.getElementById("part6") as HTMLElement | null;
        const reasonRadios = document.querySelectorAll<HTMLInputElement>("input[name='reason']");
        const compareUpload = document.getElementById("compareUpload") as HTMLElement | null;

        const amountInput = document.getElementById("amountInput") as HTMLInputElement | null;
        const vatResult = document.getElementById("vatResult") as HTMLElement | null;

        // toggle Part5
        optionRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "not_compare" && radio.checked) {
                    reasonBox?.classList.remove("hidden");
                    compareUpload?.classList.add("hidden");
                } else if (radio.value === "compare" && radio.checked) {
                    compareUpload?.classList.remove("hidden");
                    reasonBox?.classList.add("hidden");
                } else {
                    reasonBox?.classList.add("hidden");
                    compareUpload?.classList.add("hidden");
                }
            });
        });

        // toggle เหตุผลใน not_compare
        reasonRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "free" && radio.checked) {
                    part6?.classList.add("hidden"); // disable Part 6
                } else {
                    part6?.classList.remove("hidden");
                }
            });
        });


        // คำนวณ VAT 7%
        amountInput?.addEventListener("input", () => {
            if (!amountInput.value || !vatResult) return;

            const amount = parseFloat(amountInput.value);
            if (isNaN(amount)) {
                vatResult.classList.add("hidden");
                vatResult.textContent = "";
                return;
            }

            const vat = amount * 0.07;
            const total = amount + vat;
            vatResult.textContent = `จำนวนเงิน: ${amount.toLocaleString()} บาท | VAT 7%: ${vat.toLocaleString()} บาท | รวมทั้งหมด: ${total.toLocaleString()} บาท`;
            vatResult.classList.remove("hidden");
        });

        // คำนวณ VAT 7% และแสดงด้านหลัง input
        amountInput?.addEventListener("input", () => {
            if (!amountInput.value || !vatResult) return;

            const amount = parseFloat(amountInput.value);
            if (isNaN(amount)) {
                vatResult.classList.add("hidden");
                vatResult.textContent = "";
                return;
            }

            const vat = amount * 0.07;
            const total = amount + vat;
            vatResult.textContent = `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
            vatResult.classList.remove("hidden");
        });

        // ✅ Reset ตอนเข้าหน้าใหม่
        if (vatResult) {
            vatResult.textContent = "";
            vatResult.classList.add("hidden");
        }
    }
// ======================================================================================================================================================
// ======================================================================================================================================================


// ======================================================================================================================================================
// ฟอร์ม L E G E L ***************************************************************************************************************************************
// ======================================================================================================================================================
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
        const expenseRadios = document.querySelectorAll<HTMLInputElement>("input[name='legalExpenseOption']");
        const reasonBox = document.getElementById("legalReasonBox");
        const reasonRadios = document.querySelectorAll<HTMLInputElement>("input[name='legalReason']");
        const compareUpload = document.getElementById("legalCompareUpload");
        const part7 = document.getElementById("legal_part7");
        const amountInput = document.getElementById("legalAmount") as HTMLInputElement | null;
        const vatResult = document.getElementById("legalVatResult") as HTMLElement | null;

        const requestByInput = document.getElementById("legalRequestBy") as HTMLInputElement | null;
        const requestByName = document.getElementById("legalRequestByName") as HTMLElement | null;

        requestByInput?.addEventListener("input", async () => {
            const empno = requestByInput.value.trim();
            if (empno.length === 5) {
                try {
                    const response = await fetch("gpform/GP-TRN/training/get_emp", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: `empno=${empno}`
                    });

                    const data = await response.json();

                    if (data.status === "success") {
                        if (requestByName) requestByName.textContent = data.SNAME;
                    } else {
                        if (requestByName) requestByName.textContent = "";
                        showAlert("⚠ แจ้งเตือน", data.message);
                    }
                } catch (err) {
                    console.error(err);
                    showAlert("⚠ แจ้งเตือน", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
                }
            } else {
                if (requestByName) requestByName.textContent = "";
            }
        });



        // Reset ชื่อเมื่อเข้าหน้าใหม่
        if (requestByName) requestByName.textContent = "";


        // reset state
        if (vatResult) {
            vatResult.textContent = "";
            vatResult.classList.add("hidden");
        }

        // toggle Part6
        expenseRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "not_compare" && radio.checked) {
                    reasonBox?.classList.remove("hidden");
                    compareUpload?.classList.add("hidden");
                } else if (radio.value === "compare" && radio.checked) {
                    reasonBox?.classList.add("hidden");
                    compareUpload?.classList.remove("hidden");
                }
            });
        });

        // toggle เหตุผล not_compare
        reasonRadios.forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.value === "free" && radio.checked) {
                    part7?.classList.add("hidden");
                } else if (radio.value === "other" && radio.checked) {
                    part7?.classList.remove("hidden");
                }
            });
        });

        // คำนวณ VAT 7%
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

        // ปุ่ม Back
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
    }


// ======================================================================================================================================================
// ======================================================================================================================================================





// ======================================================================================================================================================
// ฟอร์ม M E - T H ***************************************************************************************************************************************
// ======================================================================================================================================================
    const backBtn_meth = document.getElementById("backBtn_meth") as HTMLButtonElement | null;
    backBtn_meth?.addEventListener("click", () => {
        const form = document.getElementById("form_meth");
        form?.classList.add("hidden");
        requestForm?.classList.add("hidden");
        selectCard?.classList.remove("hidden");
        if (trainingType) trainingType.value = "";
        if (detailBox) detailBox.classList.add("hidden");
        toggleSubmit();
    });


    function initMethForm() {

    }

// ======================================================================================================================================================
// ======================================================================================================================================================



    // =====================
    // เรียกตอนโหลดครั้งแรก
    // =====================
    toggleSubmit();
});
