import "@flaticon/flaticon-uicons/css/all/all.css";

import { BrowserMultiFormatReader } from "@zxing/browser";
import {
	setApplication,
	setImage,
	setInfo,
	getApp,
	getAppDataById,
} from "@amec/webasset/indexDB";
import { getCookie, deleteCookie } from "@amec/webasset/jsCookie";
import { decryptText } from "@amec/webasset/crypto";
import { directlogin, passwordLogin } from "@amec/webasset/api/auth";
import { createCarousel } from "@amec/webasset/api/gpreport";
import { redirectProduction } from "@amec/webasset/authen";
import { showMessage, showErrorMessage } from "@amec/webasset/utils";
import { sendSession, host, uri } from "./utils";

var camera;
const startTime = Date.now();
const MIN_DISPLAY_TIME = 2000;
$(document).ready(async function () {
	await splashScreen();
	const id = $("#appid").val();
	await redirectProduction(id);
	await createCarousel("login");
	console.log(id);
	if (id == "1") {
		const cookie = await getCookie(process.env.APP_NAME);
		if (cookie) {
			const decrypted = await decryptText(cookie, process.env.APP_NAME);
			const user = await getAppDataById(decrypted);
			if (!user) {
				await deleteCookie(process.env.APP_NAME);
				window.location.href = `${process.env.APP_ENV}`;
			}

			// const group = user.group.data.GROUP_HOME || "home";
			console.log(user.group);
			//window.location.href = `${process.env.APP_ENV}/${group}`;
		}
	} else {
		$("#webflow-link").removeClass("hidden");
	}
	$(".loginform:visible").find("input").first().focus();
});

$(document).on("click", "#show-password", function (e) {
	e.preventDefault();
	const status = $(this).hasClass("show-password");
	if (status) {
		$(this).closest("label").find("input").attr("type", "text");
		$(this).removeClass("show-password");
		$(this).find(".eye-close").addClass("hidden");
		$(this).find(".eye-open").removeClass("hidden").addClass("flex");
	} else {
		$(this).closest("label").find("input").attr("type", "password");
		$(this).addClass("show-password");
		$(this).find(".eye-close").removeClass("hidden");
		$(this).find(".eye-open").addClass("hidden");
	}
});

$(document).on("click", ".toggle-login", function (e) {
	e.preventDefault();
	const target = $(this).attr("data-type");
	$(".toggle-login").each(function () {
		if ($(this).attr("data-type") !== target) {
			$(this).removeClass("hidden");
		} else {
			$(this).addClass("hidden");
		}
	});

	$(".loginform").each(async function () {
		if ($(this).attr("id") !== target) {
			$(this).addClass("hidden");
		} else {
			//if target is "Barcode Login", check camera on device and turn it on.
			camera = await showCamera(target);
			if (camera) return;
			$(this).removeClass("hidden");
			$(this).find("input").val("");
			$(this).find("input").first().focus();
		}
	});
});

//Click Login Button
$(document).on("submit", "#passwordLogin", async function (e) {
	e.preventDefault();
	const frm = $(".form-cover");
	frm.find(".loading").removeClass("hidden");
	frm.find("input").attr("readonly", true);
	frm.find(".btn").attr("disabled", true);

	const form = $("#frm-password");
	const usr = {
		username: form.find(".username").val(),
		password: form.find(".password").val(),
		appid: $("#appid").val(),
	};
	const user = await passwordLogin(usr);
	if (user.status !== undefined) {
		await showErrorMessage(user.message);
		frm.find(".loading").addClass("hidden");
		frm.find("input").attr("readonly", false);
		frm.find(".btn").attr("disabled", false);
		return;
	}
	const url = await successLogin(user);
	window.location.replace(url);
});

//RFID Login Button
$(document).on("keyup", "#rfid-input", async function (e) {
	console.log($(this).val());
	e.preventDefault();
	if ($(this).val().length == 5) {
		$(this).prop("disabled", true);
		const sid = await new Promise((resolve) => {
			$.ajax({
				type: "post",
				url: `${host}authen/setMD5`,
				dataType: "json",
				data: {
					id: $(this).val(),
				},
				success: function (response) {
					resolve(response);
				},
			});
		});
		const client = await getIP(); //Reduce -- 1
		const usr = {
			username: sid,
			program: $("#appid").val(),
			auth: await getAuth(), //$("#auth").val() || 0,
			client: client.IP,
		};
		const user = await bglogin(usr);
		if (user.status === true) {
			const apps = user.message.apps;
			const location = apps.APP_LOCATION;
			const dir = await sendSession(`${uri}/${location}`, user.message);
			// await setAuthen(id, user.message);
			window.location.replace(`${uri}/${location}/${dir.url}`);
		} else {
			showMessage(user.message);
			$(this).prop("disabled", false);
		}
	}
});

$(document).on("submit", "#rfidLogin", async function (e) {
	e.preventDefault();
});

//Barcode Login Button
$(document).on("keyup", "#barcode-input", async function (e) {});

$(document).on("submit", "#barcodeLogin", async function (e) {
	e.preventDefault();
});

$(document).on("click", "#close-camera", function (e) {
	e.preventDefault();
	$("#frm-barcode").removeClass("hidden");
	$("#frm-barcode").find("input").val("");
	$("#frm-barcode").find("input").first().focus();
	$("#open-camera").hide();
	camera.stop();
});

async function successLogin(user) {
	const emp = await setInfo(user.appuser.SEMPNO, user.appuser);
	const empprofile = await setImage(user.appuser.SEMPNO, user.appuser.image);

	if (user.apps.APP_ID == 1) {
		const appgroup = user.appgroup.GROUP_HOME || "home";
		return `${process.env.APP_ENV}/${appgroup}/`;
	}

	if (user.apps.APP_TYPE == "1") {
		return `${process.env.APP_HOST}/${user.apps.APP_LOCATION}/authen/move/`;
	}

	return `${process.env.APP_HOST}/${user.apps.APP_LOCATION}/${
		user.appgroup.GROUP_HOME == null ? "" : user.appgroup.GROUP_HOME
	}`;
}

//สร้าง  Session ในระบบ
export function setSession(data) {
	return new Promise((resolve) => {
		$.ajax({
			type: "post",
			url: `${process.env.APP_ENV}/authen/setSession`,
			dataType: "json",
			data: data,
			success: function (response) {
				resolve(response);
			},
		});
	});
}

export async function getAuth(appid) {
	let app = await getApp(appid);
	if (!app) {
		await setApplication({ id: appid });
		app = await getApp(appid);
	}
	return app.data.APP_LOGIN;
}

function cardLogin(data) {
	return new Promise((resolve) => {});
}

async function barcodeLogin(empcode) {
	if (user.status !== undefined) {
		await showErrorMessage(user.message);
		// frm.find(".loading").addClass("hidden");
		// frm.find("input").attr("readonly", false);
		// frm.find(".btn").attr("disabled", false);
		return;
	}
	const url = await successLogin(user);
	window.location.href = url;
}

async function showCamera(target) {
	if (target !== "frm-barcode") return false;
	const videoElement = document.getElementById("video");
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const videoInputDevices = devices.filter(
			(device) => device.kind === "videoinput",
		);

		if (videoInputDevices.length === 0) {
			return;
		}

		$("#open-camera").show();
		const codeReader = new BrowserMultiFormatReader();
		let selectedDeviceId = videoInputDevices[0].deviceId;
		const preferred = videoInputDevices.find(
			(device) =>
				/back|rear/i.test(device.label) &&
				!/depth|ultrawide/i.test(device.label),
		);

		if (preferred) {
			selectedDeviceId = preferred.deviceId;
		}

		return await codeReader.decodeFromVideoDevice(
			selectedDeviceId,
			videoElement,
			async (result, error, controls) => {
				if (result) {
					const empno = (
						"00000" + (result.getText() / 4 - 92).toString()
					).slice(-5);
					const user = await directlogin(empno, 1);
					//await barcodeLogin(result.getText());
					if (user.status !== undefined) {
						await showErrorMessage(user.message);
						return false;
					}
					//$("#open-camera").hide();
					controls.stop();
					const url = await successLogin(user);
					window.location.replace(url);
				}
				if (error) {
					console.warn("อ่านผิดพลาด: ", error.message);
				}
			},
		);
		//return true;
	} catch (err) {
		console.error("เกิดข้อผิดพลาด:", err);
	}
}

function splashScreen() {
	//   console.log("Page content is fully loaded.");
	const timeElapsed = Date.now() - startTime;
	if (timeElapsed >= MIN_DISPLAY_TIME) {
		hideSplashScreen();
	} else {
		const timeToWait = MIN_DISPLAY_TIME - timeElapsed;
		// console.log(`Content loaded fast. Waiting ${timeToWait}ms more.`);
		setTimeout(hideSplashScreen, timeToWait);
	}
}

function hideSplashScreen() {
	//   console.log("Hiding splash screen.");
	const splashScreen = document.querySelector(".splash-screen");
	if (splashScreen) {
		splashScreen.classList.add("hidden");
	}
	document.body.style.overflow = "auto";
}

//Note for Socket.io
//   console.log("Frontend application loaded!");
//   console.log(process.env.APP_API);
//   const socket = io(`http://localhost:3001`);
//   socket.on("connect", () => {
//     console.log("Connected to Socket.io server:", socket.id);
//   });
//   socket.on("disconnect", () => {
//     console.log("Disconnected from Socket.io server.");
//   });
//   socket.on("orderViewing", (data) => {
//     console.log("Order viewing update received:", data);
// const orderId = data.orderId;
// const viewerId = data.viewerId; // The socket ID of the user viewing
// const isViewing = data.isViewing;
// $(`#order-row-${orderId}`).each(function() {
//     const $row = $(this);
//     // Remove any existing indicators
//     $row.removeClass('viewing-indicator');
//     if (isViewing) {
//         // Add indicator if this order is being viewed by someone else
//         // We compare viewerId to socket.id to prevent showing "viewing" on own screen
//         if (viewerId !== socket.id) {
//             $row.addClass('viewing-indicator');
//         }
//     }
// });
//   });
