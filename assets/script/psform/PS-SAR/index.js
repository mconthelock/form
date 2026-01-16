// import { tableOption } from "../../inc/_dataTable.js";
import { host } from "../../utils";
import { showFlow, doaction, redirectWebflow } from "@amec/webasset/form";
$(document).ready(async function () {
	// Initialize DataTable
	//  $("#table-detail").DataTable();
	const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } =
		$(".form-data").data();

	// Set current date
	const today = new Date();
	const formattedDate = today.toLocaleDateString("th-TH", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	$("#form-date").text(formattedDate);

	const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
	$(".flow").html(flow.html);

	const dataForm = await $.post(
		`${host}psform/PS-SAR/main/getDataForm`,
		{
			nfrmno,
			vorgno,
			cyear,
			cyear2,
			nrunno,
			empno,
		},
		null,
		"json"
	);

	// Set Person in Charge and Type
	if (dataForm && dataForm.length > 0) {
		const firstItem = dataForm[0];

		// Set Person in Charge
		if (
			firstItem.PERSON_IN_CHARGE ||
			firstItem.EMPNAME ||
			firstItem.CREATE_BY
		) {
			$("#person-in-charge").text(
				firstItem.PERSON_IN_CHARGE ||
					firstItem.EMPNAME ||
					firstItem.CREATE_BY ||
					"-"
			);
		}

		// Set Type with badge color
		const formType = firstItem.TYPE_NAME;
		const badgeClass =
			formType === "New Address" ? "badge-success" : "badge-info";
		$("#form-type").text(formType).addClass(badgeClass);
	}

	const rows = dataForm
		.map(
			(item, i) => `
        <tr class="text-center">
          <td class="border border-gray-300">${i + 1}</td>
          <td class="border border-gray-300">${item.CODE_ITEM}</td>
          <td class="border border-gray-300">${item.DWGNO}</td>
          <td class="border border-gray-300">${item.DESCRIPT}</td>
          <td class="border border-gray-300">${item.OLD_ADDR ?? "-"}</td>
          <td class="border border-gray-300">${item.OLD_USER ?? "-"}</td>
          <td class="border border-gray-300">${item.NEW_ADDR ?? "-"}</td>
          <td class="border border-gray-300">${item.NEW_USER ?? "-"}</td>
          <td class="border border-gray-300">${item.ISSUE_TO ?? "-"}</td>
          <td class="border border-gray-300">${item.REASON ?? "-"}</td>
          <td class="border border-gray-300"><input type="radio" name="confirm_${i}" class="checkbox checkbox-success"></td>
          <td class="border border-gray-300"><input type="radio" name="confirm_${i}" class="checkbox checkbox-success"></td>
        </tr>
      `
		)
		.join("");

	$("#table-detail tbody").html(rows);
});
