import { showAlert } from "./alert.js";
export async function bindEmpLookup(inputEl, outputMap) {
    inputEl === null || inputEl === void 0 ? void 0 : inputEl.addEventListener("input", async () => {
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
                        var _a, _b;
                        if (!el)
                            return;
                        if ("value" in el) {
                            el.value = (_a = data[key]) !== null && _a !== void 0 ? _a : "";
                        }
                        else {
                            el.textContent = (_b = data[key]) !== null && _b !== void 0 ? _b : "";
                        }
                    });
                }
                else {
                    inputEl.value = "";
                    Object.values(outputMap).forEach(el => {
                        if (!el)
                            return;
                        if ("value" in el)
                            el.value = "";
                        else
                            el.textContent = "";
                    });
                    showAlert("⚠ แจ้งเตือน", data.message);
                }
            }
            catch (err) {
                console.error(err);
                showAlert("⚠ แจ้งเตือน", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
            }
        }
        else {
            Object.values(outputMap).forEach(el => {
                if (!el)
                    return;
                if ("value" in el)
                    el.value = "";
                else
                    el.textContent = "";
            });
        }
    });
}
