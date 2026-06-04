import { attachTypeManager, districtEnManager, districtThManager, postcodeEnManager, postcodeThManager, provinceEnManager, provinceThManager, subDistrictEnManager, subDistrictThManager } from "./formManager";
export function selectAttachType(type) {
    console.log(type);
    switch (type) {
        case "Oversea":
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
    provinceThManager.value = "";
    provinceEnManager.value = "";
    districtThManager.value = "";
    districtEnManager.value = "";
    subDistrictThManager.value = "";
    subDistrictEnManager.value = "";
    postcodeThManager.value = "";
    postcodeEnManager.value = "";
}