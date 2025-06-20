import Cookies from "js-cookie";
import { decryptText } from "./inc/_crypto";
import { getAppDataById } from "./indexDB/userAuth";
$(document).ready(async function () {
  //Set user profile
  const cookie = Cookies.get(process.env.APP_NAME);
  const indexedDBID = decryptText(cookie, process.env.APP_NAME);
  const res = await getAppDataById(indexedDBID);

  const user = res.info.data;
  let displayname = "";
  if (user.SNAME) {
    const names = user.SNAME.trim().split(" ");
    const firstname = names[0]
      ? names[0].charAt(0).toUpperCase() + names[0].slice(1).toLowerCase()
      : "";
    const lastnameInitial =
      names.length > 1 && names[names.length - 1]
        ? names[names.length - 1].charAt(0).toUpperCase() + "."
        : "";
    displayname = firstname + (lastnameInitial ? " " + lastnameInitial : "");
  }
  $("#login-name").html(displayname);
  $("#login-section").html(user.SSEC);
  $("#login-id").val(user.SEMPNO);
  //Set side bar
});

$(document).on("click", ".mainmenu", function () {
  const m = $(".mainmenu").length;
  $(".mainmenu").map((i, el) => {
    $(el).find("details").removeAttr("open");
  });
});

$(document).on("click", "#mastermenu-close", function () {
  $("#mastermenu").prop("checked", false);
});

$(document).on("click", "#signout", function (e) {
  e.preventDefault();
  Cookies.remove(process.env.APP_NAME);
  location.reload();
});
