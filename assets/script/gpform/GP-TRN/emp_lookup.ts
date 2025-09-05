import { showAlert } from "./alert.js";

declare const getEmpUrl: string;

export async function bindEmpLookup(
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
                    inputEl.value = "";
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
