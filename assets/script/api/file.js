import { showErrorMessage } from "@public/jFuntion";

/**
 * 
 * @param {string} baseDir e.g. //amecnas/AMECWEB/File/development/Form/QA/QAINS//QA-INS25-000005
 * @param {string} storedName e.g. 1759891435422-433903288.xlsx
 * @param {string} originalName e.g. Specification.xlsx
 * @param {string} mode e.g. 'open' | 'download'
 *  baseDir: string;
  storedName: string;
  originalName?: string;
  mode: 'open' | 'download';
 */
export async function downloadOrOpenFile(body) {
    let href; // ไว้ cleanup แม้เกิด error
    try {
        // const res = await fetch(`${process.env.APP_API}/files/OpenOrDownload`, {
        const res = await fetch(`${process.env.APP_API}/files/OpenOrDownload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

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
/**
 * @param {string} baseDir e.g. //amecnas/AMECWEB/File/development/Form/QA/QAINS//QA-INS25-000005
 * @param {string} storedName e.g. 1759891435422-433903288.xlsx
 * @param {string} originalName e.g. Specification.xlsx
 * @param {string} mode e.g. 'open' | 'download'
 *
 */
export async function getFile(body) {
    try {
        // const res = await fetch(`${process.env.APP_API}/files/OpenOrDownload`, {
        const res = await fetch(`${process.env.APP_API}/files/OpenOrDownload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        // fetch จะ reject เฉพาะ network error; สเตตัส 4xx/5xx ยังถือว่า ok ทางเครือข่าย
        if (!res.ok) {
            // พยายามอ่านข้อความจากเซิร์ฟเวอร์เพื่อเดบัก
            const text = await res.text().catch(() => "");
            throw new Error(
                `HTTP ${res.status} ${res.statusText} ${text?.slice(0, 200)}`
            );
        }
        const blob = await res.blob();
        const type = blob.type || "application/octet-stream";
        const file = new File(
            [blob],
            body.originalName || body.storedName || "file",
            { type }
        );
        return file;
    } catch (error) {
        console.log("Error getFile", error);
        showErrorMessage("Error getFile");
        throw error;
    }
}

export async function getBase64Image(path) {
    try {
        const res = await fetch(`${process.env.APP_API}/files/getBase64Image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: path,
            }),
        });
        if (!res.ok) {
            // พยายามอ่านข้อความจากเซิร์ฟเวอร์เพื่อเดบัก
            const text = await res.text().catch(() => "");
            throw new Error(
                `HTTP ${res.status} ${res.statusText} ${text?.slice(0, 200)}`
            );
        }
        return res.text();
    } catch (error) {
        console.log("Error getBase64Image", error);
        showErrorMessage("Error getBase64Image");
        throw error;
    }
}

/**
 * Get list of files and folders in a directory
 * @param {Object} data
 * @typedef {Object} GetListInFolderData
 * @property {string} baseDir e.g. //amecnas/AMECWEB/File/development/Form/QA/QAINS//QA-INS25-000005
 * @property {string} [path] e.g. subfolder1/subfolder2 (ถ้าไม่มีจะเป็นโฟลเดอร์หลัก)
 * @property {string[]} [allow] e.g. ["doc","docx", "xlsx"] เอาไฟล์อะไรบ้าง (ถ้าไม่มีจะเอาทุกชนิด)
 *
 * @typedef {Object} FileItem
 * @property {string} name - ชื่อไฟล์หรือโฟลเดอร์
 * @property {string} path - เส้นทางสัมพัทธ์จาก baseDir
 * @property {boolean} isDir - เป็นโฟลเดอร์หรือไม่
 * @property {number} [size] - ขนาดไฟล์ (ถ้าเป็นไฟล์)
 * @property {string} [mimeType] - ชนิดของไฟล์ (ถ้าเป็นไฟล์)
 *
 * @returns {Promise<FileItem[]>} รายการไฟล์และโฟลเดอร์ในโฟลเดอร์ที่ระบุ
 */
export async function getListInFolder(data) {
    try {
        const res = await fetch(
            `${process.env.APP_API}/files/list/`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
        );
        if (!res.ok) {
            // พยายามอ่านข้อความจากเซิร์ฟเวอร์เพื่อเดบัก
            const text = await res.text().catch(() => "");
            throw new Error(
                `HTTP ${res.status} ${res.statusText} ${text?.slice(0, 200)}`
            );
        }
        return res.json();
    } catch (error) {
        console.log("Error getListInFolder", error);
        showErrorMessage("Error getListInFolder");
        throw error;
    }
}
