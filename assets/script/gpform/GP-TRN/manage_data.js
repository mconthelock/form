export async function saveFunctionalForm(formData) {
    const res = await fetch(mainUrl + "save_functional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });
    if (!res.ok) {
        throw new Error("Failed to save functional form");
    }
    return res.json();
}
