import { showAlert } from "./alert.js";
import { bindEmpLookup } from "./emp_lookup.js";
import { toggleSubmit, bindDynamicList, populateSelect } from "./formUtils.js";
import { validateFunctionalForm, validateLegalForm, validateMethForm } from "./validators.js";
import { initFunctionalForm, initLegalForm, initMethForm, initBackButtons} from "./initForms.js";
import { createForm } from "../../api/webform/form.js";


document.addEventListener("DOMContentLoaded", () => {
    const trainingType = document.getElementById("trainingType") as HTMLSelectElement | null;
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement | null;
    const selectCard = document.getElementById("selectCard") as HTMLElement | null;
    const requestForm = document.getElementById("requestForm") as HTMLElement | null;
    const detailBox = document.getElementById("detailBox") as HTMLElement | null;
    const detailTitle = document.getElementById("detailTitle") as HTMLElement | null;
    const detailDesc = document.getElementById("detailDesc") as HTMLElement | null;

    // 👉 ส่ง element เข้าไปให้ initForms ใช้
    initBackButtons(trainingType, selectCard, requestForm, detailBox);

    const details: Record<string, { title: string; desc: string }> = {
        functional: { title: "Support Specific Functional Competency", desc: "ฟอร์มสำหรับฝึกอบรมเพื่อพัฒนาสมรรถนะเฉพาะทาง" },
        legal: { title: "Support Legal Requirement", desc: "ฟอร์มสำหรับฝึกอบรมที่เกี่ยวข้องกับข้อกำหนดทางกฎหมาย" },
        meth: { title: "Support ME-TH Training subject", desc: "ฟอร์มสำหรับหัวข้อการฝึกอบรม ME-TH" },
    };

    trainingType?.addEventListener("change", () => {
        const val = trainingType.value;
        if (details[val]) {
            if (detailTitle) detailTitle.textContent = details[val].title;
            if (detailDesc) detailDesc.textContent = details[val].desc;
            detailBox?.classList.remove("hidden");
        } else {
            detailBox?.classList.add("hidden");
        }
        toggleSubmit(trainingType, submitBtn);
    });

    // Event ปุ่ม "ไปยังแบบฟอร์ม"
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
            if (val === "functional") initFunctionalForm();
            if (val === "legal") initLegalForm();
            if (val === "meth") initMethForm();
        }
    });

    // ✅ ฟังก์ชันส่งฟอร์มจริง (เรียก API)
    async function submitForm(formType: "functional" | "legal" | "meth", reqby: string, inputby: string) {
        try {
            const nfrmno = (document.getElementById("NFRMNO") as HTMLInputElement)?.value?.trim() || "";
            const vorgno = (document.getElementById("VORGNO") as HTMLInputElement)?.value?.trim() || "";
            const cyear  = (document.getElementById("CYEAR")  as HTMLInputElement)?.value?.trim() || "";

            // ✅ ตรวจสอบ required fields
            if (!nfrmno || !vorgno || !cyear || !reqby?.trim() || !inputby?.trim()) {
                showAlert("⚠ แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน (NFRMNO, VORGNO, CYEAR, Request By, Input By)");
                return;
            }

            const formData = {
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR:  cyear,
                REQBY:  reqby.trim(),
                INPUTBY: inputby.trim(),
                REMARK: "",
                DRAFT: "0", // 0 = เตรียม, 1 = รออนุมัติ
            };

            const result = await createForm(formData);
            console.log(`[${formType}] Form created successfully:`, result);
            showAlert("✅ สำเร็จ", `ฟอร์ม ${formType} ส่งเรียบร้อยแล้ว`);
            setTimeout(() => { window.location.href = "http://webflow.mitsubishielevatorasia.co.th/formtest/workflow/WaitApv.asp";}, 1500); 
        } catch (err) {
            console.error(`[${formType}] Error creating form:`, err);
            showAlert("❌ ล้มเหลว", `ฟอร์ม ${formType} ส่งไม่สำเร็จ`);
        }
    }

    // Event ปุ่มส่งฟอร์ม
    document.getElementById("sendFuncFormBtn")?.addEventListener("click", () => {
       setTimeout(() => { window.location.href = "http://webflow.mitsubishielevatorasia.co.th/formtest/workflow/WaitApv.asp/15199";}, 1500); 
       /* if (validateFunctionalForm()) {
            const reqby   = (document.getElementById("funcRequestBy") as HTMLInputElement)?.value || "";
            const inputby = (document.getElementById("funcInputBy") as HTMLInputElement)?.value || "";
            setTimeout(() => { window.location.href = "http://webflow.mitsubishielevatorasia.co.th/formtest/workflow/WaitApv.asp";}, 1500); 
            //submitForm("functional", reqby, inputby);
        }*/
    });

    document.getElementById("sendLegalFormBtn")?.addEventListener("click", () => {
        if (validateLegalForm()) {
            const reqby   = (document.getElementById("legalRequestBy") as HTMLInputElement)?.value || "";
            const inputby = (document.getElementById("legalInputBy") as HTMLInputElement)?.value || "";
            submitForm("legal", reqby, inputby);
        }
    });

    document.getElementById("sendMethFormBtn")?.addEventListener("click", () => {
        if (validateMethForm()) {
            const reqby   = (document.getElementById("methRequestBy") as HTMLInputElement)?.value || "";
            const inputby = (document.getElementById("methInputBy") as HTMLInputElement)?.value || "";
            submitForm("meth", reqby, inputby);
        }
    });

    // Initial
    toggleSubmit(trainingType, submitBtn);

    // ใช้งาน bindDynamicList ได้เหมือนเดิม
    bindDynamicList("funcObjectiveList", "funcObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("funcExpectationList", "funcExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");

    bindDynamicList("legalObjectiveList", "legalObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("legalExpectationList", "legalExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");

    bindDynamicList("methObjectiveList", "methObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("methExpectationList", "methExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
});
