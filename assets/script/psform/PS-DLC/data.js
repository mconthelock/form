import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { data } from "jquery";

export async function getEmpData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}

export async function getSchedule(q = {}) {
  return await fetchUtils({
    url: `${process.env.APP_API}/calendar/range/`,
    method: "POST",
    data: q,
  });
}

// create form
export async function createdlcForm(data) {
  return await fetchUtils({
    url: `${process.env.APP_API}/psform/ps-dlc`,
    method: "POST",
    data: data,
  });
}

// get form data
export async function getFormData(nfrno, vorgno, cyear, cyear2, runno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/psform/ps-dlc/${nfrno}/${vorgno}/${cyear}/${cyear2}/${runno}`,
    method: "GET",
  });
}

// get report data
export async function getReport(data) {
  return await fetchUtils({
    url: `${process.env.APP_API}/psform/ps-dlc/getReport`,
    method: "POST",
    data,
  });
}

// update flow approve
export async function updateController(state) {
  return await fetchUtils({
    url: `${process.env.APP_API}/psform/ps-dlc`,
    method: "PATCH",
    data: state,
  });
}

// update PSDLC_FORM
export async function updateDLCform(state) {
  return await fetchUtils({
    url: `${process.env.APP_API}/psform/ps-dlc/updateForm`,
    method: "PATCH",
    data: state,
  });
}

export function validateDrawingNo(input) {
	if (!input || typeof input !== "string") return null;
	let dwg = input.replace(/\s+/g, "");
	if (dwg.startsWith("X") && dwg.length > 6 && /[G\-]/.test(dwg[5])) {
		return dwg.slice(0, 5) + " " + dwg.slice(5);
	}

	const lengthBasedRules = [
		{ length: 8, checkIndex: 5 },
		{ length: 9, checkIndex: 6 },
		{ length: 10, checkIndex: 7 },
		{ length: 11, checkIndex: 8 },
	];
	for (const rule of lengthBasedRules) {
		if (dwg.length === rule.length && /[G\-]/.test(dwg[rule.checkIndex])) {
			return (
				dwg.slice(0, rule.checkIndex) + " " + dwg.slice(rule.checkIndex)
			);
		}
	}

	dwg = formatDrawingNo(input);
	const fullPattern =
		/^(([A-Z0-9\-]{5,9})\s*((?:G[0-9]{2,3}|\-[0-9]{2,3}))(.*))((?: L[0-9]{2,3})*)$/;
	if (fullPattern.test(dwg)) {
		// const spaceMatch = dwg.match(/ /g);
		// const firstSpaceIndex = dwg.indexOf(" ");
		// if (spaceMatch && spaceMatch.length > 1 && firstSpaceIndex !== -1) {
		// 	dwg =
		// 		dwg.slice(0, firstSpaceIndex) +
		// 		" " +
		// 		dwg.slice(firstSpaceIndex + 1).replace(/\s+/g, "");
		// }
		return dwg;
	}

	if (dwg.length >= 5 && dwg.length <= 13) {
		return dwg;
	}
	return null; 
}


export function formatDrawingNo(input) {
	const basePattern =
		/^([A-Z0-9\-]{5,9})\s*((?:G[0-9]{2,3}|\-[0-9]{2,3}))(.*)$/;
	const match = input.match(basePattern);
	if (!match) return input;

	const dwgno = match[1];
	const gno = match[2];
	const lno = match[3] || "";
	const lval = [...lno.matchAll(/L[0-9]{2,3}/g)].map((m) => m[0]);
	return [dwgno, gno, ...lval].join(" ");
}

export function getDrawingGroups(input) {
  const validated = validateDrawingNo(input);
  if (!validated) return { pnzuba: null, pnhing: null };

  const parts = validated.trim().split(/\s+/);
  return {
    pnzuba: parts[0] || null,
    pnhing: parts[1] || null,
  };
}