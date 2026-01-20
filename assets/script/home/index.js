import { setAmecweb } from "@amec/webasset/indexDB";
import { setCookie } from "@amec/webasset/jsCookie";
import { encryptText } from "@amec/webasset/crypto";
import { showLoader } from "@amec/webasset/preloader";
import { showErrorMessage } from "@amec/webasset/utils";
import { createCarousel } from "@amec/webasset/api/gpreport";
import {
	checkUpdateLinks,
	createLinks,
	setRecentApps,
	setAmecwebLinks,
} from "./data";
import * as utils from "../utils";

$(document).ready(async function (e) {
	try {
		await utils.initApp({ submenu: ".nav-electronic" });
		const news = await createCarousel();
		const links = await checkUpdateLinks();
		await createLinks(1, links, $("#amecweb_system"));
		await createLinks(2, links, $("#design_system"));
		await createLinks(3, links, $("#utility_system"));
		await createLinks(4, links, $("#other_system"));
		await setRecentApps();
		await setAmecwebLinks();
		// await waitforapprove({ empno: "02035" });
	} catch (error) {
		console.log(error);
		showErrorMessage();
		return;
	} finally {
		await showLoader({ show: false });
	}
});

$(document).on("click", ".links-stamp", async function (e) {
	e.preventDefault();
	try {
		await showLoader();
		const curent = {
			id: $(this).attr("data-id"),
			user: $("#login-id").val(),
			url: $(this).attr("href"),
			target: $(this).attr("target"),
			color: $(this).attr("data-color") || "#000000",
			label: $(this).attr("data-label") || "",
			name: $(this).attr("data-name") || "👍",
			type: $(this).attr("data-type") || "2",
			location: $(this).attr("data-location"),
			updateDate: new Date().toISOString(),
		};
		await utils.stampApp(curent);
		await setRecentApps();
		setCookie(
			curent.location,
			encryptText(`${curent.id}-${curent.user}`, curent.location),
		);
		window.location.href = curent.url;
	} catch (error) {
		console.log(error);
		showErrorMessage();
		return;
	} finally {
		await showLoader({ show: false });
	}
});

$(document).on("click", "#reload_amecweb", async function () {
	showLoader();
	const id = $("#loginuser").val();
	const links = await getAmecwebAccess({ empno: id });
	if (links.length > 0) {
		await setAmecweb(id, links);
	} else {
		$("#amecweb_links").html(
			`<h1 class="text-lg italic text-gray-400">No access right any system</h1>`,
		);
	}
	await setAmecwebLinks();
	showLoader({ show: false });
});
