"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bksavedetailForm = bksavedetailForm;
exports.savedetailForm = savedetailForm;
async function bksavedetailForm(formData) {
    const res = await fetch(`${mainUrl}/save_functional`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });
    if (!res.ok) {
        throw new Error("Failed to save functional form");
    }
    return res.json();
}
async function savedetailForm(formData) {
    const res = await fetch(`${mainUrl}/save_functional`, {
        method: "POST",
        body: formData, // ✅ ส่งตรง ไม่ต้อง set headers
    });
    if (!res.ok)
        throw new Error("Failed to save functional form");
    return res.json();
}
