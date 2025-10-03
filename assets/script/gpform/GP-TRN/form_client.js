// assets/script/gpform/GP-TRN/form_client.js
import * as base from "../../api/webform/form.js";

// กำหนดค่าจริงจาก Blade แทน process.env
const APP_API = window.mainUrl || "{{ site_url('gpform/GP-TRN') }}";

// wrap ทุก function แล้ว inject APP_API
export async function createForm(form) {
    const res = await fetch(`${APP_API}/createForm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("Failed to createForm");
    return res.json();
}

// ทำแบบเดียวกันสำหรับ getFormDetail, getMode, getFormno, deleteFlowandForm
