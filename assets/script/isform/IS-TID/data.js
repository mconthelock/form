export async function getUserLogin() {
    const res = await fetch(`${process.env.APP_API}/itgc/specialuser/getUserLogin`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch user");
    }
    return res.json();
}

export async function getController() {
    const res = await fetch(`${process.env.APP_API}/itgc/specialuser/getController`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch user");
    }
    return res.json();
}

