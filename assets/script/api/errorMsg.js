export async function fetchMsgErr(res){
    const text = await res.text().catch(() => "");
    return `HTTP ${res.status} ${res.statusText} ${text?.slice(0, 200)}`;
}