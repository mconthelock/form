import { skeleton, skeletons } from "@amec/webasset/skeleton";
import { getAuditee, getOA } from "./data";

function handleClassList(num) {
	return num % 2 === 0 ? "bg-base-200" : "bg-white";
}

function shortName(name) {
	const clean = name.replace(/\s+/g, " ").trim().split(" ");
	return clean[0] + " " + clean[1][0] + ".";
}

function shortSec(sec) {
	const clean = sec.replace(/\s+/g, " ").trim().split(" ");
	return clean[0];
}

function finishAndClose() {
	// set ค่าใน localStorage เพื่อ trigger main
	localStorage.setItem("TableAuditeeReload", Date.now());
	window.close();
}

function setSkeleton() {
	skeleton({ element: "#auditReport", height: "h-[60vh]", width: "w-full" });
	skeleton({ element: "#score", height: "h-24", width: "w-full lg:w-40" });
	skeleton({
		element: "#detail",
		height: "h-56",
		width: "w-full xl:w-[50vw]",
	});
	skeleton({
		element: "#tableRevision",
		height: "h-56",
		width: "w-full xl:w-[40vw]",
	});
	skeletons({
		element: "#action",
		count: 3,
		pattern: [
			{ width: "w-28", height: "h-10" },
			{ width: "w-28", height: "h-10" },
			{ width: "w-28", height: "h-10" },
		],
	});
	skeleton({
		element: "#tableCS",
		height: "h-96",
		width: "w-full",
	});
}

const setAuditorToString = async (form, typecode = "ESA") => {
	const data = await getOA({ ...form, QOA_TYPECODE: typecode });
	return data
		.map(
			(list) =>
				`${shortName(list.QOA_EMPNO_INFO.SNAME)} (${
					list.QOA_EMPNO_INFO.SPOSNAME
				} ${shortSec(list.QOA_EMPNO_INFO.SSEC)})`
		)
		.join(", ");
	// return data.QA_AUD_OPT.filter((i) => i.QOA_TYPECODE == typecode)
	//     .map(
	//         (list) =>
	//             `${shortName(list.QOA_EMPNO_INFO.SNAME)} (${
	//                 list.QOA_EMPNO_INFO.SPOSNAME
	//             } ${shortSec(list.QOA_EMPNO_INFO.SSEC)})`
	//     )
	//     .join(", ");
};

export {
	handleClassList,
	shortName,
	shortSec,
	finishAndClose,
	setSkeleton,
	setAuditorToString,
};
