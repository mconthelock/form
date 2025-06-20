var iscookie = "";
const host = document.querySelector('meta[name="base_url"]').content;

const cookies = document.cookie.split(";");
for (let cookie of cookies) {
  const name = document.querySelector('meta[name="appname"]').content;
  cookie = cookie.trim();
  if (cookie.startsWith(name + "=")) {
    iscookie = cookie.substring(name.length + 1);

    const date = new Date();
    date.setTime(date.getTime() + 15 * 60 * 1000);
    const expires = "; Expires=" + date.toUTCString();
    document.cookie = name + "=" + iscookie + expires + "; path=/";
  }
}

if (iscookie == "") {
  window.location.href = `${host}`;
}
