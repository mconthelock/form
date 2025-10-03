
import { collectFunctionalForm, buildFunctionalForm, savedetailForm } from "./manage_data.js";
import { showAlert } from "./formUtils.js";

export async function submitFunctionalForm() {
    try {
        const collected = collectFunctionalForm();
        const baseHead = {
            NFRMNO: document.getElementById("NFRMNO")?.value ?? "",
            VORGNO: document.getElementById("VORGNO")?.value ?? "",
            CYEAR:  document.getElementById("CYEAR")?.value ?? "",
            CYEAR2: document.getElementById("CYEAR2")?.value ?? "",
            NRUNNO: document.getElementById("NRUNNO")?.value ?? "",
            FID: "1",
            EMPNO: collected.funcInputBy,
        };
        const formData = buildFunctionalForm(baseHead, collected);
        const res = await savedetailForm(formData);

        if (res.status === "success") {
            showAlert("✅ สำเร็จ", "บันทึกฟอร์ม Functional เรียบร้อยแล้ว!");
        } else {
            showAlert("⚠️ ผิดพลาด", res.message || "บันทึกไม่สำเร็จ");
        }
    } catch (err) {
        console.error(err);
        showAlert("❌ Error", "เกิดข้อผิดพลาดระหว่างส่งฟอร์ม");
    }
}
