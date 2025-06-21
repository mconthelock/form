(function () {
  const host = document.querySelector('meta[name="base_url"]').content;
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
          console.error("Service Worker registration failed:", err)
        );
    });
  }
})();
