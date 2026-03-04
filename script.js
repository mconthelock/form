(function () {
	const amecdomain = (host, state) => {
		if (state == "local") return;
		const isdomain = host.indexOf("mitsubishielevatorasia.co.th");
		var s = host.split("/");
		if (isdomain == -1) {
			window.location.replace(
				"https://" + s[2] + ".mitsubishielevatorasia.co.th/" + s[3],
			);
		}

		const currenturl = window.location.href;
		const protocol = window.location.protocol;
		if (protocol == "http:") {
			const url = currenturl.replace(protocol, "https:");
			window.location.replace(url);
		}
	};

	const checkCookie = () => {
		var iscookie = "";
		const name = document.querySelector('meta[name="appname"]').content;
		const cookies = document.cookie.split(";");
		for (let cookie of cookies) {
			cookie = cookie.trim();
			if (cookie.startsWith(name + "=")) {
				iscookie = cookie.substring(name.length + 1);
			}
		}

		return iscookie;
	};

	// Swich Theme
	const savedTheme = localStorage.getItem("theme") || "light"; // ค่าเริ่มต้นเป็น 'light'
	document.documentElement.setAttribute("data-theme", savedTheme);
	document.documentElement.setAttribute("class", savedTheme);
	localStorage.setItem("theme", savedTheme);
	document.addEventListener("DOMContentLoaded", function () {
		if (savedTheme === "dark") {
			document.getElementById("theme").checked = true;
		}
	});

	// Register Service worker and Windows Notification
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register(`${host}sw.js`, {
					scope: "./",
				})
				.then((reg) => {})
				.catch((err) =>
					console.error("Service Worker registration failed:", err),
				);
		});
	}

	const host = document.querySelector('meta[name="base_url"]').content;
	const state = document.querySelector('meta[name="appstatus"]').content;
	const appid = document.getElementById("appid");
	//   const domain = amecdomain(host, state);
	const cookie = checkCookie();
	if (cookie != "" && appid == 1) window.location.replace(`${host}home`);
})();
