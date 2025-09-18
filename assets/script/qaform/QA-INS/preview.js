import { getAuditMasterAll } from "../../api/escs/audit_master_all";
import { showErrorMessage } from "../../public/v1.0.3/jFuntion";
import { setSkeleton } from "./function";
import { calScoreTotal, createScoreBoard, createTableAuditMaster, setScore} from "./template";

$(async function(){
    try {
        $("body").addClass("bg-[#ecf0f5]");
        setSkeleton();
        const master = await getAuditMasterAll({ARM_SECID: $('.secid').attr('secid'), ARM_REV: $('#revision').attr('rev'), ARM_STATUS: 1});
        $("#score").replaceWith(await createScoreBoard());
        $('#auditReport').replaceWith(await createTableAuditMaster(master));
        setScore();
    } catch (error) {
        showErrorMessage(error);
    }
})