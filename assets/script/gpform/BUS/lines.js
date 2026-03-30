import { showLoader } from "@amec/webasset/preloader";
import { showMessage } from "@amec/webasset/utils";
import { initApp } from "../../utils.js";
$(document).ready(async function (e) {
	try {
		await initApp({ submenu: ".nav-bus" });
	} catch (error) {
		console.log(error);
		await showMessage();
		return;
	} finally {
		await showLoader({ show: false });
	}
});
