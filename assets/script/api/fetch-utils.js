export async function fetchMsgErr(res) {
    const text = await res.text().catch(() => "");
    console.error(`HTTP ${res.status} ${res.statusText} ${text}`);
}

export function serializeRequestBody(data) {
    if (data instanceof FormData) {
        return {
            method: "POST",
            body: data,
        };
    } else {
        return {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
    }
}
