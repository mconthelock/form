export function showAlert(title, message) {
    const alertModal = document.getElementById("alertModal");
    const alertTitle = document.getElementById("alertTitle");
    const alertMessage = document.getElementById("alertMessage");
    if (alertModal && typeof alertModal.showModal === "function") {
        if (alertTitle)
            alertTitle.textContent = title;
        if (alertMessage)
            alertMessage.textContent = message;
        alertModal.showModal();
    }
    else {
        alert(message);
    }
}
