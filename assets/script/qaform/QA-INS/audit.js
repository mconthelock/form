import { getAuditMasterAll } from "../../api/escs/audit_master_all";
import {
    getAllAttr,
    logtest,
    showErrorMessage,
} from "../../public/v1.0.3/jFuntion";
import { btn } from "./component";
import { getformData } from "./data";
import { finishAndClose } from "./function";
import {
    calScoreTotal,
    createScoreBoard,
    createTableAuditMaster,
    setScore,
} from "./template";
var formInfo, formData, auditee, master;

$(async function () {
    try {
        $("body").addClass("bg-[#ecf0f5]");
        formInfo = await getAllAttr(document.querySelector(".form-info"));
        formData = await getformData({
            NFRMNO: formInfo.nfrmno,
            VORGNO: formInfo.vorgno,
            CYEAR: formInfo.cyear,
            CYEAR2: formInfo.cyear2,
            NRUNNO: formInfo.nrunno,
        });
        auditee =
            formData.QA_AUD_OPT.find(
                (i) => i.QOA_TYPECODE == "ESO" && i.QOA_SEQ == formInfo.seq
            ) || {};
        if (!auditee || Object.keys(auditee).length === 0) {
            throw new Error("You are not authorized to audit this form.");
        }
        logtest("Form Info", formInfo);
        logtest("Form Data", formData);
        logtest("Auditee", auditee);
        if (!formData || formData.length === 0) {
            throw new Error("No form data found");
        }
        master = await getAuditMasterAll({
            ARM_SECID: formData.QA_INCHARGE_SECTION,
            ARM_REV: formData.QA_REV,
            ARM_STATUS: 1,
        });
        $("#score").replaceWith(await createScoreBoard());
        $("#auditReport").replaceWith(
            await createTableAuditMaster(master, auditee.QOA_AUDIT)
        );
        $("#action").html(
            btn({ id: "saveDraft", text: "Save Draft", cls: "btn-neutral" }) +
                btn({
                    id: "submit",
                    text: "Submit",
                    cls: "btn-primary",
                }) +
                btn({
                    id: "reset",
                    text: "Reset",
                    cls: "btn-error",
                })
        );
        setScore();
    } catch (error) {
        showErrorMessage(error);
    }
});

$(document).on("click", "#saveDraft", function () {
    finishAndClose();
});


