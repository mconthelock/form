import { getAuditMasterAll } from "@amec/webasset/api/escs";
import { showErrorMessage } from "@amec/webasset/utils";
import { setSkeleton } from "./function";
import { createScoreBoard, createTableAuditMaster, setScore } from "./template";

$(async function () {
	try {
		$("body").addClass("bg-[#ecf0f5]");
		setSkeleton();
		const master = await getAuditMasterAll({
			ARM_SECID: $(".secid").attr("secid"),
			ARM_REV: $("#revision").attr("rev"),
			ARM_STATUS: 1,
		});
		$("#score").replaceWith(await createScoreBoard());
		$("#auditReport").replaceWith(await createTableAuditMaster(master, 1));
		setScore();
	} catch (error) {
		showErrorMessage(error);
	}
});
