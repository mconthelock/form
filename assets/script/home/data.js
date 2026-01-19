import ExcelJS from "exceljs";
import {
	getLinks,
	setLinks,
	getAmecweb,
	setAmecweb,
} from "@amec/webasset/indexDB";
import { hexToRgb } from "../utils";

//สร้าง Link ของ Other Links section
export async function createLinks(id, data, obj) {
	let content = "";
	data.map((el) => {
		const apps = el.data;
		if (apps.group == id) {
			content += `<li class="min-w-62.5">
        <a class="link link-hover links-stamp block w-full"
            data-id="${apps.iid}"
            target="${apps.type == 1 ? "_self" : "_blank"}"
            href="${apps.url}">
                ${apps.name}
        </a>
    </li>`;
		}
	});
	obj.html(content);
}

//Check ข้อมูล Links ที่อ่านมาจาก Excel เป็นค่าล่าสุดแล่วหรือยัง
export async function checkUpdateLinks() {
	const modifyDate = await getModifyDate("assets/files", "App_color.xlsx");
	const fileLinksDate = new Date(modifyDate[0].modifyDate);
	const locatLinksDate = localStorage.getItem("webflowlinksdate");
	const alllinks = await getLinks();
	if (fileLinksDate != locatLinksDate || alllinks.length == 0) {
		const links = await readExcel();
		links.map((el) => {
			setLinks(el.id, el);
		});
		localStorage.setItem("webflowlinksdate", fileLinksDate);
	}
	return await getLinks();
}

export async function readExcel() {
	var response = [];
	const template = await getfileInPath("assets/files", "App_color.xlsx");
	const file = template[0].buffer;
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(file).then(async (workbook) => {
		const sheet = workbook.worksheets[0];
		sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
			if (rowNumber > 1) {
				const [id, iid, code, name, type, url, color, group, icon] =
					row.values.slice(1);
				response.push({
					id,
					iid,
					code,
					name,
					type,
					url,
					color,
					group,
					icon,
				});
			}
		});
	});
	return response;
}

export async function exportExcel() {
	const template = await getfileInPath("assets/files", "App_color.xlsx");
	const file = template[0].buffer;
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(file).then(async (workbook) => {
		const sheet = workbook.worksheets[0];
		appColors.applications.map((el, i) => {
			sheet.addRow([
				el.id,
				el.code,
				el.name,
				el.type,
				el.url,
				el.color,
				el.group,
			]);
		});

		workbook.xlsx.writeBuffer().then(function (buffer) {
			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `appcolors.xlsx`;
			link.click();
		});
	});
}

export function getfileInPath(path, fileName = "") {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${process.env.APP_ENV}/excel/getfileInPath/`,
			type: "post",
			dataType: "json",
			data: {
				path: path,
				fileName: fileName,
			},
			success: function (res) {
				res.forEach(async (file) => {
					console.log(`Processing file: ${file.filename}`);
					const binaryData = atob(file.content); // แปลง Base64 เป็น Binary
					const buffer = new Uint8Array(binaryData.length);

					for (let i = 0; i < binaryData.length; i++) {
						buffer[i] = binaryData.charCodeAt(i);
					}
					file.buffer = buffer; // เอา buffer ไปใช้งานต่อ เขียนหรืออ่าน
				});
				resolve(res);
			},
			error: function (xhr, err) {
				console.log(xhr, err);
			},
		});
	});
}

export async function getModifyDate(path, fileName = "") {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${process.env.APP_ENV}/excel/getModifyDate/`,
			type: "post",
			dataType: "json",
			data: {
				path: path,
				fileName: fileName,
			},
			success: function (res) {
				resolve(res);
			},
		});
	});
}

export const appColors = async () => {
	var response = [];
	const template = await getfileInPath("assets/files", "App_color.xlsx");
	const file = template[0].buffer;
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(file).then(async (workbook) => {
		const sheet = workbook.worksheets[0];
		sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
			if (rowNumber > 1) {
				const [id, code, name, type, url, color, group] =
					row.values.slice(1);
				response.push({ id, code, name, type, url, color, group });
			}
		});
	});
	return response;
};

export async function setRecentApps() {
	let recentApp = JSON.parse(localStorage.getItem("recentapp")) || [];
	if (!(recentApp.data && recentApp.data.length)) {
		$(".recent-apps").hide();
		return;
	}

	let content = "";
	recentApp.data
		.filter((el) => el.user == $("#login-id").val())
		.map((el, i) => {
			if (i < 10) {
				content += `<a class="flex flex-col items-center gap-3 w-28 links-stamp"
        href="${el.url}"
        data-id="${el.id}"
        target="${el.type == 1 ? "_self" : "_blank"}"
        >
            <div
                class="flex items-center justify-center text-xl font-bold rounded-full w-12 h-12"
                    style="background-color: rgba(${hexToRgb(
						el.color,
					)}, 0.5); color: ${el.color};"
            >
                ${el.label}
            </div>
            <div class="text-sm text-gray-500 text-wrap text-center">
                ${
					el.name.length > 8
						? el.name.substring(0, 8) + "..."
						: el.name
				}
            </div>
        </a>`;
			}
		});
	if (content == "") $(".recent-apps").hide();
	$("#recent-apps").html(content);
}

export async function setAmecwebLinks() {
	const amecweb = await amecwebData($("#login-id").val());
	if (amecweb.length == 0) {
		$("#amecweb_links").html(
			`<h1 class="text-lg italic text-gray-400">No access right any system</h1>`,
		);
		return;
	}
	const obj = $("#amecweb_links");
	obj.html("");
	amecweb.map(async (val) => {
		const app = val.application;
		const groups = val.appsgroups;
		//await setApplication(app);
		//await setAppGroup(`${app.APP_ID}-${val.USERS_ID}`, groups);
		const url = `${process.env.APP_HOST}/${app.APP_LOCATION}/${
			app.APP_TYPE == "1" ? "authen/move/" : ""
		}`;

		const bg =
			app.APP_ICON != null
				? ""
				: `style="background-color: rgba(${hexToRgb(
						app.APP_COLOR,
					)}, 0.5); color:${app.APP_COLOR};"`;
		const label = `<div class="flex flex-none rounded-full w-16 h-16 justify-center items-center" ${bg}>
            ${
				app.APP_ICON == null
					? app.APP_LABEL == null
						? ""
						: `<span class="font-bold text-2xl">${app.APP_LABEL}</span>`
					: `<img src="${app.APP_ICON}" class="w-16 h-16" />`
			}
        </div>`;
		const str = `<a class="card bg-white bordered w-full h-auto shadow-xl flex gap-3 flex-row items-center p-3 lg:w-72 lg:max-w-[18rem] links-stamp"
        href="${url}"
        data-id="${app.APP_ID}"
        data-color="${app.APP_COLOR}"
        data-label="${app.APP_LABEL}"
        data-name="${app.APP_NAME}"
        data-type="${app.APP_TYPE}"
        data-location="${app.APP_LOCATION}"
        target="${app.APP_TYPE == "1" ? "_self" : "_blank"}">
            ${label}
            <div class="flex-1 flex flex-col gap-0">
                <div class="font-bold">${app.APP_NAME}</div>
                <div class="text-md">${app.APP_LOCATION}</div>
            </div>
        </a>`;
		obj.append(str);
	});
}

export async function amecwebData(id) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${process.env.APP_API}/docinv/appsusers/user/${id}/`,
			type: "get",
			dataType: "json",
			success: function (res) {
				resolve(res);
			},
			error: function (xhr, err) {
				console.log(xhr, err);
				reject(err);
			},
		});
	});
}
