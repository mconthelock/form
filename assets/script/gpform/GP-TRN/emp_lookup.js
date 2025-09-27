async function bindEmpLookup(inputEl, outputMap) {
    if (!inputEl) return;
    let empTimer;

    inputEl.addEventListener("input", () => {
        clearTimeout(empTimer);

        const empno = inputEl.value.trim();

        if (empno.length !== 5) {
            // Reset ถ้าไม่ครบ
            Object.values(outputMap).forEach(el => {
                if (!el) return;
                if ("value" in el) el.value = "";
                else el.textContent = "";
            });
            return;
        }

        empTimer = setTimeout(async () => {
            try {
                const res = await fetch(getEmpUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: "empno=" + encodeURIComponent(empno)
                });

                let data;
                try {
                    data = await res.json();
                } catch {
                    showAlert("⚠ แจ้งเตือน", "ข้อมูลที่ได้ไม่ถูกต้องจาก server");
                    return;
                }

                if (data.status === "success") {
                    Object.entries(outputMap).forEach(([key, el]) => {
                        if (!el) return;
                        if ("value" in el) el.value = data[key] ?? "";
                        else el.textContent = data[key] ?? "";
                    });
                } else {
                    inputEl.value = "";
                    Object.values(outputMap).forEach(el => {
                        if (!el) return;
                        if ("value" in el) el.value = "";
                        else el.textContent = "";
                    });
                    showAlert("⚠ แจ้งเตือน", data.message || "ไม่พบข้อมูลพนักงาน");
                }
            } catch (err) {
                console.error("emp_lookup fetch error:", err);
                showAlert("⚠ แจ้งเตือน", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
            }
        }, 300);
    });

    // กัน Enter กดส่งฟอร์มโดยไม่ตั้งใจ
    inputEl.addEventListener("keypress", e => {
        if (e.key === "Enter") e.preventDefault();
    });
}
