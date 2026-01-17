/**
 * Build FormData สำหรับทุกรูปแบบฟอร์ม
 * @param {object} headResult - ผลลัพธ์จาก createForm()
 * @param {string} fid - form id (1=functional,2=legal,3=meth)
 * @param {string} prefix - prefix form ("func","legal","meth")
 */
export function buildFormDataGeneric(headResult, fid, prefix) {
	const fd = new FormData();

	// ✅ Base Head
	fd.append("PREFIX", prefix);
	fd.append("NFRMNO", headResult.data.NFRMNO);
	fd.append("VORGNO", headResult.data.VORGNO);
	fd.append("CYEAR", headResult.data.CYEAR);
	fd.append("CYEAR2", headResult.data.CYEAR2);
	fd.append("NRUNNO", headResult.data.NRUNNO);
	fd.append("FID", fid);

	// helper get value
	const getVal = (id, def = "") =>
		document.getElementById(`${prefix}${id}`)?.value || def;

	// ✅ Mapping field (ทุกฟอร์มใช้ได้)
	fd.append("SUBJECT", getVal("TrainingSubject"));

	const dateFrom = getVal("DateFrom");
	if (dateFrom) fd.append("DATE_FROM", dateFrom.replace(/-/g, ""));
	const dateTo = getVal("DateTo");
	if (dateTo) fd.append("DATE_TO", dateTo.replace(/-/g, ""));

	const timeFromHour = getVal("TimeFromHour", "00");
	const timeFromMin = getVal("TimeFromMin", "00");
	fd.append("TIME_FROM", timeFromHour + timeFromMin);

	const timeToHour = getVal("TimeToHour", "00");
	const timeToMin = getVal("TimeToMin", "00");
	fd.append("TIME_TO", timeToHour + timeToMin);

	fd.append("PLACE", getVal("Location"));
	fd.append("INSTITUTION", getVal("Institute"));
	fd.append("COST", getVal("AmountInput", "0"));
	fd.append("COST_NOTE", getVal("AmountNote"));

	// ✅ Radio
	const expenseOption =
		document.querySelector(`input[name='${prefix}ExpenseOption']:checked`)
			?.value || "";
	fd.append("TRN_EXPENSE_STATUS", expenseOption);

	const reason =
		document.querySelector(`input[name='${prefix}Reason']:checked`)
			?.value || "";
	fd.append("TRN_EXPENSE_REASON", reason);

	fd.append("TRN_EXPENSE_OTHER", getVal("ReasonOtherText"));

	// ✅ Arrays (objective, expectation)
	document
		.querySelectorAll(`input[name='${prefix}Objective[]']`)
		.forEach((el) => {
			if (el.value.trim())
				fd.append(`${prefix}Objective[]`, el.value.trim());
		});

	document
		.querySelectorAll(`input[name='${prefix}Expectation[]']`)
		.forEach((el) => {
			if (el.value.trim())
				fd.append(`${prefix}Expectation[]`, el.value.trim());
		});

	// ✅ Files
	const compareFiles = document.getElementById(
		`${prefix}CompareFiles`,
	)?.files;
	if (compareFiles) {
		for (let i = 0; i < compareFiles.length; i++) {
			fd.append(`${prefix}CompareFiles[]`, compareFiles[i]);
		}
	}

	// ✅ Special case by form type
	switch (prefix) {
		case "func":
			fd.append("TRAINEE_ID", getVal("TraineeCode")); // ✅ prefix + id = funcTraineeCode
			fd.append("JD_NAME", getVal("JdName"));
			fd.append("JD_DESC", getVal("JdRelation"));
			const jdFiles = document.getElementById(`${prefix}JdFiles`)?.files;
			if (jdFiles) {
				for (let i = 0; i < jdFiles.length; i++) {
					fd.append(`${prefix}JdFiles[]`, jdFiles[i]);
				}
			}
			break;
		case "legal":
			document
				.querySelectorAll("input[name='legalTraineecode[]']")
				.forEach((el) => {
					if (el.value.trim())
						fd.append("TRAINEE_ID[]", el.value.trim());
				});
			fd.append("LAWS", getVal("ConcernLaw"));
			break;
		case "meth":
		case "pos":
		case "out":
			fd.append("TRAINEE_ID", getVal("TraineeCode"));
			break;
		default:
			console.warn(`Unhandled prefix: ${prefix}`);
	}

	return fd;
}

/**
 * Save form detail ไปยัง API save_formcreate
 */
export async function savedetailForm(formData) {
	const res = await fetch(
		`${process.env.APP_ENV}/gpform/GP-TRN/training/save_formcreate`,
		{
			//const res = await fetch(`${mainUrl}/save_formcreate`, {
			method: "POST",
			body: formData,
		},
	);

	const text = await res.text();
	try {
		return JSON.parse(text);
	} catch {
		console.error("❌ Response is not JSON:", text);
		throw new Error("Invalid JSON response");
	}
}
