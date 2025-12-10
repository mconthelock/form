export async function getFyear(fyear) {
    const res = await fetch(`${process.env.APP_API}/docinv/work-annual-dev-plan/${fyear}`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch data");
    }
    return res.json();
}