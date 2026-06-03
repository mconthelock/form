import { attachTypeManager } from "./formManager";
export function selectAttachType(type) {
    console.log(type);
    switch (type) {
        case "oversea":
            attachTypeManager.show([
                "cer",
                "other",
            ]);
            break;
        default:
            attachTypeManager.show([
                "cer",
                "vat",
                "book",
                "other",
            ]);
            break;
    }
}

export async function clearaddr(){
    $("#PROVINCE_TH").val("");
    $("#PROVINCE_EN").val("");
    $("#DISTRICT_TH").val("");
    $("#DISTRICT_EN").val("");
    $("#SUB_DISTRICT_EN").val("");
    $("#SUB_DISTRICT_TH").val("");
    $("#POSTCODE_EN").val("");
    $("#POSTCODE_TH").val("");
}