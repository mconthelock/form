import { FunctionalFormPayload } from "./type_data.js";
import { showAlert } from "./alert.js";
declare const mainUrl: string;

export async function bksavedetailForm(formData: any) {
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

export async function savedetailForm(formData: FormData) {
  const res = await fetch(`${mainUrl}/save_functional`, {
    method: "POST",
    body: formData, // ✅ ส่งตรง ไม่ต้อง set headers
  });
  if (!res.ok) throw new Error("Failed to save functional form");
  return res.json();
}
