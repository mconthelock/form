import { showAlert } from "./alert.js";
import { bindEmpLookup } from "./emp_lookup.js";
import { toggleSubmit, bindDynamicList, populateSelect } from "./formUtils.js";
import { validateFunctionalForm, validateLegalForm, validateMethForm } from "./validators.js";
import { initFunctionalForm, initLegalForm, initMethForm, initBackButtons} from "./initForms.js";
import { createForm } from "../../api/webform/form.js";
import { redirectWebflow } from "../../inc/_form.js";
import { FunctionalFormPayload, collectFunctionalForm } from "./type_data.js";
declare const mainUrl: string;

    // ✅ Loader helper
    function showLoader() {document.getElementById("loaderOverlay")?.classList.remove("hidden");}
    function hideLoader() {document.getElementById("loaderOverlay")?.classList.add("hidden");}
    // ✅ ฟังก์ชันรวมใช้ได้ทุกฟอร์ม
    function buildFormDataGeneric(headResult: any, fid: string, prefix: "func" | "legal" | "meth"): FormData {
        const fd = new FormData();
        fd.append("PREFIX", prefix);
        fd.append("NFRMNO", headResult.data.NFRMNO);
        fd.append("VORGNO", headResult.data.VORGNO);
        fd.append("CYEAR", headResult.data.CYEAR);
        fd.append("CYEAR2", headResult.data.CYEAR2);
        fd.append("NRUNNO", headResult.data.NRUNNO);
        fd.append("FID", fid);

        // helper get value
        const getVal = (id: string, def: string = "") =>
            (document.getElementById(`${prefix}${id}`) as HTMLInputElement | HTMLTextAreaElement)?.value || def;

        // ✅ Mapping field
        fd.append("SUBJECT", getVal("TrainingSubject"));
        const dateFrom = getVal("DateFrom");
        if (dateFrom) fd.append("DATE_FROM", dateFrom.replace(/-/g, ""));
        const dateTo = getVal("DateTo");
        if (dateTo) fd.append("DATE_TO", dateTo.replace(/-/g, ""));

        const timeFromHour = getVal("TimeFromHour", "00");
        const timeFromMin = getVal("TimeFromMin", "00");
        fd.append("TIME_FROM", timeFromHour + timeFromMin);

        const timeToHour = getVal("TimeToHour", "00");
        const timeToMin = getVal("TimeToMin", "00");
        fd.append("TIME_TO", timeToHour + timeToMin);

        fd.append("PLACE", getVal("Location"));
        fd.append("INSTITUTION", getVal("Institute"));
        fd.append("TRAINEE_ID", getVal("TraineeCode"));
        fd.append("COST", getVal("AmountInput", "0"));
        fd.append("COST_NOTE", getVal("AmountNote"));

        // ✅ Radio
        const expenseOption = document.querySelector<HTMLInputElement>(`input[name='${prefix}ExpenseOption']:checked`)?.value || "";
        fd.append("TRN_EXPENSE_STATUS", expenseOption);

        const reason = document.querySelector<HTMLInputElement>(`input[name='${prefix}Reason']:checked`)?.value || "";
        fd.append("TRN_EXPENSE_REASON", reason);

        fd.append("TRN_EXPENSE_OTHER", getVal("ReasonOtherText"));

        // ✅ Arrays
        document.querySelectorAll<HTMLInputElement>(`input[name='${prefix}Objective[]']`).forEach(el => {
            if (el.value.trim()) fd.append(`${prefix}Objective[]`, el.value.trim());
        });
        document.querySelectorAll<HTMLInputElement>(`input[name='${prefix}Expectation[]']`).forEach(el => {
            if (el.value.trim()) fd.append(`${prefix}Expectation[]`, el.value.trim());
        });
        
        const compareFiles = (document.getElementById(`${prefix}CompareFiles`) as HTMLInputElement)?.files;
        if (compareFiles) {
            for (let i = 0; i < compareFiles.length; i++) {
            fd.append(`${prefix}CompareFiles[]`, compareFiles[i]);
            }
        }

        //Speical Case By Form
        switch (prefix) {
            case "func":
                fd.append("JD_NAME", getVal("JdName"));
                fd.append("JD_DESC", getVal("JdRelation"));
                const jdFiles = (document.getElementById(`${prefix}JdFiles`) as HTMLInputElement)?.files;
                if (jdFiles) {
                    for (let i = 0; i < jdFiles.length; i++) {
                        fd.append(`${prefix}JdFiles[]`, jdFiles[i]);
                    }
                }
                break;
            case "legal":
                fd.append("LAWS", getVal("legalConcernLaw"));
                break;
            case "meth":
                //fd.append("METHOD", getVal("methMethod"));
                break;
            default:
                console.warn(`Unhandled prefix: ${prefix}`);
        }
        return fd;
    }

    async function savedetailForm(formData: FormData) {
        const res = await fetch(`${mainUrl}/save_formcreate`, { method: "POST", body: formData });
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            console.error("❌ Response is not JSON:", text);
            throw new Error("Invalid JSON response");
        }
    }

    
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
    async function submitForm(formType: "functional" | "legal" | "meth", reqby: string, inputby: string, fid :string) {
        try {
            showLoader();
            const nfrmno = (document.getElementById("NFRMNO") as HTMLInputElement)?.value?.trim() || "";
            const vorgno = (document.getElementById("VORGNO") as HTMLInputElement)?.value?.trim() || "";
            const cyear  = (document.getElementById("CYEAR")  as HTMLInputElement)?.value?.trim() || "";

            // ✅ ตรวจสอบ required fields
            if (!nfrmno || !vorgno || !cyear || !reqby?.trim() || !inputby?.trim()) {
                hideLoader();
                showAlert("⚠ แจ้งเตือน", "ข้อมูลไม่ครบถ้วน (NFRMNO, VORGNO, CYEAR, Request By, Input By)");
                return;
            }

            const formDatakey = {
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR:  cyear,
                REQBY:  reqby.trim(),
                INPUTBY: inputby.trim(),
                REMARK: "",
                DRAFT: "1", // 0 = เตรียม, 1 = รออนุมัติ
            };

            const headResult  = await createForm(formDatakey);
            console.log(`[${formType}] Form created successfully:`, headResult );

            const formData = buildFormDataGeneric(headResult, fid, formType === "functional" ? "func" : formType);
            const saveResult = await savedetailForm(formData);

            hideLoader();
            if (saveResult.status !== "success") {
                showAlert("❌ ล้มเหลว", saveResult.message || "ไม่สามารถบันทึกข้อมูลได้");
                return;
            }
            showAlert("✅ สำเร็จ", `ฟอร์ม ${formType} ส่งเรียบร้อยแล้ว`);
            redirectWebflow();
        } catch (err) {
            hideLoader();
            console.error(`[${formType}] Error creating form:`, err);
            showAlert("❌ ล้มเหลว", `ฟอร์ม ${formType} ส่งไม่สำเร็จ`);
        }
    }
    

    async function handleFormSubmit(formType: "functional" | "legal" | "meth") {
        let reqby = "";
        let inputby = "";
        let isValid = false;
        let fid ="";
        if (formType === "functional") {
            isValid = validateFunctionalForm();
            reqby   = (document.getElementById("funcRequestBy") as HTMLInputElement)?.value || "";
            inputby = (document.getElementById("funcInputBy") as HTMLInputElement)?.value || "";
            fid = '1';
        } else if (formType === "legal") {
            isValid = validateLegalForm();
            reqby   = (document.getElementById("legalRequestBy") as HTMLInputElement)?.value || "";
            inputby = (document.getElementById("legalInputBy") as HTMLInputElement)?.value || "";
            fid = '2';
        } else if (formType === "meth") {
            isValid = validateMethForm();
            reqby   = (document.getElementById("methRequestBy") as HTMLInputElement)?.value || "";
            inputby = (document.getElementById("methInputBy") as HTMLInputElement)?.value || "";
            fid = '3';
        }
        if (!isValid) return;
        await submitForm(formType, reqby, inputby, fid);
    }

    // Event ปุ่มส่งฟอร์ม
    document.getElementById("sendFuncFormBtn")?.addEventListener("click", () => handleFormSubmit("functional"));
    document.getElementById("sendLegalFormBtn")?.addEventListener("click", () => handleFormSubmit("legal"));
    document.getElementById("sendMethFormBtn")?.addEventListener("click", () => handleFormSubmit("meth"));

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
