

/**
 * แสดงข้อความแจ้งเตือน
 * - ถ้ามี modal #alertModal จะใช้ modal
 * - ถ้าไม่มี modal หรือ browser ไม่รองรับ → ใช้ window.alert()
 * @param {string} title - หัวข้อแจ้งเตือน
 * @param {string} message - เนื้อหาแจ้งเตือน
 */
export function showAlert(title, message) {
    const alertModal = document.getElementById("alertModal");
    const alertTitle = document.getElementById("alertTitle");
    const alertMessage = document.getElementById("alertMessage");

    if (alertModal && typeof alertModal.showModal === "function") {
        if (alertTitle) alertTitle.textContent = title;
        if (alertMessage) alertMessage.textContent = message;
        alertModal.showModal();
    } else {
        alert(message);
    }
}
