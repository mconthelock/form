import "@flaticon/flaticon-uicons/css/all/all.css";
import { initAuthen } from "./public/v1.0.3/authen.js";
// import Cookies from "js-cookie";
// import { decryptText } from "./inc/_crypto";
// import { getAppDataById } from "./indexDB/userAuth";

$(document).ready(async function () {
  initAuthen({
    icon: `${process.env.APP_IMG}/sidebar/brand_text_w.svg`,
    iconLogo: `${process.env.APP_IMG}/icon_512.png`,
    programName: "Web Flow",
    showIcon: false,
    showProgramName: false,
    showLogo: true,
    sidebarClass: `size-xl text-gray-300 bg-primary`,
  });
  //Set user profile
  //   const cookie = Cookies.get(process.env.APP_NAME);
  //   const indexedDBID = decryptText(cookie, process.env.APP_NAME);
  //   const res = await getAppDataById(indexedDBID);
  //   const user = res.info.data;
  //   let displayname = "";
  //   if (user.SNAME) {
  //     const names = user.SNAME.trim().split(" ");
  //     const firstname = names[0]
  //       ? names[0].charAt(0).toUpperCase() + names[0].slice(1).toLowerCase()
  //       : "";
  //     const lastnameInitial =
  //       names.length > 1 && names[names.length - 1]
  //         ? names[names.length - 1].charAt(0).toUpperCase() + "."
  //         : "";
  //     displayname = firstname + (lastnameInitial ? " " + lastnameInitial : "");
  //   }
  //   $("#login-name").html(displayname);
  //   $("#login-section").html(user.SSEC);
  //   $("#login-id").val(user.SEMPNO);
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
