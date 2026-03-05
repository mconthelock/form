import { doaction, showflow } from "@amec/webasset/api/webform";
import { createTable } from "@amec/webasset/dataTable";
import { redirectWebflow } from "@amec/webasset/form";

$(document).ready(async function () {
	await createTable({}, { id: "#logTable" });
	const formData = $(".form-data").data();
	const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

	const flow = await showflow({NFRMNO: nfrmno, VORGNO: vorgno, CYEAR: cyear, CYEAR2: cyear2, NRUNNO: nrunno});
	$(".flow").html(flow.html);

	$(".btn-submit").click(async function () {
		const action = $(this).data("action");
		const confirm = await doaction({
			NFRMNO: nfrmno,
			VORGNO: vorgno,
			CYEAR: cyear,
			CYEAR2: cyear2,
			NRUNNO: nrunno,
			ACTION: action,
			EMPNO: empno,
        });
		if (confirm.status) redirectWebflow();
	});
});
