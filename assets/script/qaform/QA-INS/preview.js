import { getAuditMasterAll } from "../../api/escs/audit_master_all";
import { showErrorMessage } from "../../public/v1.0.3/jFuntion";
import { createTableAuditMaster } from "./template";

$(async function(){
    try {
        $("body").addClass("bg-[#ecf0f5]");
        const master = await getAuditMasterAll({ARM_SECID: $('.secid').attr('secid'), ARM_REV: $('#revision').attr('rev')});
        $('#auditReport').html(await createTableAuditMaster(master));
    } catch (error) {
        showErrorMessage(error);
    }
})