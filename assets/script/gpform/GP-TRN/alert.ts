export function showAlert(title: string, message: string) {
    const alertModal = document.getElementById("alertModal") as HTMLDialogElement | null;
    const alertTitle = document.getElementById("alertTitle") as HTMLElement | null;
    const alertMessage = document.getElementById("alertMessage") as HTMLElement | null;

    if (alertModal && typeof alertModal.showModal === "function") {
        if (alertTitle) alertTitle.textContent = title;
        if (alertMessage) alertMessage.textContent = message;
        alertModal.showModal();
    } else {
        alert(message);
    }
}
