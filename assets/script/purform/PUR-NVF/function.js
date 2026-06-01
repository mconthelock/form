
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
