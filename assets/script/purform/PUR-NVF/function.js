import { attachTypeManager, districtEnManager, districtThManager, postcodeEnManager, postcodeThManager, provinceEnManager, provinceThManager, subDistrictEnManager, subDistrictThManager } from "./formManager";
export function selectAttachType(reqtype,type) {
    console.log(type);
    if(reqtype == "A")
    {
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
    }else if(reqtype == "U")
    {
        attachTypeManager.show([
                    "letter",
                    "other"
                ]);
    }else if(reqtype == "D")
    {
        attachTypeManager.show([
                    "other"
                ]);
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