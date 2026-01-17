import { displayEmpInfo } from "@amec/webasset/indexDB";
$(document).ready(async function () {
	$(".requester-info").addClass("hidden");
	await setInputter();
	await setObjective();
	await setWage($("#select-position"));
	await setDevice($("#select-device"));
});

//Data source
export const getObjective = () => {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${process.env.APP_API}/form/is/form1/objective/all`,
			method: "GET",
			success: function (data) {
				resolve(data);
			},
			error: function (error) {
				reject(error);
			},
		});
	});
};

export const setObjective = async () => {
	const objective = await getObjective();
	$("#objective").append(
		objective.map(
			(obj) =>
				`<option value="${obj.OBJECTIVE_ID}">${obj.OBJECTIVE_NAME}</option>`
		)
	);
};

export const setInputter = async () => {
	const emp = await displayEmpInfo("12069");
	const empDiv = $(".inputter-info");
	empDiv.removeClass("hidden");
	empDiv.find("h1").text(`${emp.SNAME} (${emp.SEMPNO})`);
	empDiv.find("p").text(`${emp.SDIV}/${emp.SDEPT}/${emp.SSEC}`);
	empDiv.find("img").attr("src", emp.image);
	empDiv.find("inpput").val(emp.SEMPNO);
};

export const setWage = async (obj) => {
	const wage = await getWage();
	obj.append(
		wage.map(
			(item) =>
				`<option value="${item.POSITION}">${item.pposition.SPOSITION}</option>`
		)
	);
};

export const getWage = () => {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${process.env.APP_API}/form/is/form1/wage/all`,
			method: "GET",
			success: function (data) {
				resolve(data);
			},
			error: function (error) {
				reject(error);
			},
		});
	});
};

export const setDevice = async (obj) => {
	const device = await getDevice();
	obj.append(
		device.map(
			(item) => `<option value="${item.DNO}">${item.DEVICE}</option>`
		)
	);
};

export const getDevice = () => {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${process.env.APP_API}/form/isform/devicemst/all`,
			method: "GET",
			success: function (data) {
				resolve(data);
			},
			error: function (error) {
				reject(error);
			},
		});
	});
};
