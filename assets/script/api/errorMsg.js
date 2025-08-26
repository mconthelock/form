export async function fetchMsgErr(res){
    const text = await res.text().catch(() => "");
    console.error(`HTTP ${res.status} ${res.statusText} ${text}`);
}