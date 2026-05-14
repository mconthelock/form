
import { attachTypeManager } from "./formManager";
export function selectAttachType(type) {
    switch (type) {
        case 1:
            attachTypeManager.show(["po", "other"]);
            break;
        case "final":
            attachTypeManager.show([
                "part",
                "thirdparty",
                "delivery",
                "asset",
                "other",
            ]);
            break;
        default:
            attachTypeManager.show([
                "equipment",
                "thirdparty",
                "delivery",
                "other",
            ]);
            break;
    }
}
