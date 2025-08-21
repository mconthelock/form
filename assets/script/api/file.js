import { showErrorMessage } from "../v1.0.3/jFuntion";

export async function downloadOrOpenFile(body) {
    let href; // ไว้ cleanup แม้เกิด error
    try {
        // const res = await fetch(`${process.env.APP_API}/files/OpenOrDownload`, {
        const res = await fetch(
            `${process.env.APP_APITEST}/files/OpenOrDownload`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        );

        // fetch จะ reject เฉพาะ network error; สเตตัส 4xx/5xx ยังถือว่า ok ทางเครือข่าย
        if (!res.ok) {
            // พยายามอ่านข้อความจากเซิร์ฟเวอร์เพื่อเดบัก
            const text = await res.text().catch(() => "");
            throw new Error(
                `HTTP ${res.status} ${res.statusText} ${text?.slice(0, 200)}`
            );
        }

        const blob = await res.blob();
        href = URL.createObjectURL(blob);

        if (body.mode === "download") {
            const a = document.createElement("a");
            a.href = href;
            a.download = body.originalName || body.storedName || "file";
            document.body.appendChild(a);
            a.click();
            a.remove();
            // บางเบราว์เซอร์ต้องหน่วงนิดนึงค่อย revoke
            setTimeout(() => URL.revokeObjectURL(href), 0);
            href = null; // กัน revoke ซ้ำใน finally
        } else {
            window.open(href, "_blank");
            setTimeout(() => URL.revokeObjectURL(href), 5000);
            href = null;
        }
    } catch (err) {
        console.error("download/open failed:", err);
        showErrorMessage("failed to download/open file");
        throw err; // ถ้าผู้เรียกอยากรู้ว่าพัง ให้ rethrow ต่อ
    } finally {
        if (href) URL.revokeObjectURL(href); // cleanup กรณีเกิด error ก่อน revoke ข้างบน
    }
}