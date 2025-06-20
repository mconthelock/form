import { showLoader, createCarousel, stampApp, hexToRgb } from "../utils";
import { getAmecweb, getLinks, setAmecweb } from "../indexDB/application";
import { setImage, setInfo } from "../indexDB/employee";
import { setAppGroup, setApplication, setAppMenu } from "../indexDB/setIndexDB";
import { checkUpdateLinks, createLinks, amecwebData } from "./data";
import { getAmecwebAccess, directlogin } from "../webservice";
import { setCookie } from "../inc/_jsCookie";
import { encryptText } from "../inc/_crypto";

$(document).ready(async function (e) {
  await showLoader(true);
  $(".nav-form").find("details").attr("open", true);
  const news = await createCarousel();
  const links = await checkUpdateLinks();
  await createLinks(1, links, $("#amecweb_system"));
  await createLinks(2, links, $("#design_system"));
  await createLinks(3, links, $("#utility_system"));
  await createLinks(4, links, $("#other_system"));
  await setRecentApps();
  await setAmecwebLinks();
  //const waitforapproveData = await waitforapprove({ empno: "02035" });
  await showLoader(false);
});

$(document).on("click", ".links-stamp", async function (e) {
  e.preventDefault();
  await showLoader(true);
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
  await stampApp(curent);
  await setRecentApps();
  setCookie(curent.location, encryptText(`${curent.id}-${curent.user}`, curent.location));
//   const response = await directlogin(curent.user, curent.id);
//   const id = `${curent.id}-${curent.user}`;
//   const app = await setApplication(response.apps);
//   const group = await setAppGroup(id, response.appgroup);
//   const menu = await setAppMenu(id, response.auth, group);
  window.location.href = curent.url;
  //   if ([6, 12].includes(response.apps.APP_ID)) {
  //     window.location.href = `${process.env.APP_HOST}/${response.apps.APP_LOCATION}/authen/move`;
  //     return;
  //   }
  //   window.location.href = `${process.env.APP_HOST}/${
  //     response.apps.APP_LOCATION
  //   }/${
  //     response.appgroup.GROUP_HOME == null ? "" : response.appgroup.GROUP_HOME
  //   }`;
  //await showLoader(false);
});

$(document).on("click", "#reload_amecweb", async function () {
  showLoader(true);
  const id = $("#loginuser").val();
  const links = await getAmecwebAccess({ empno: id });
  if (links.length > 0) {
    await setAmecweb(id, links);
  } else {
    $("#amecweb_links").html(
      `<h1 class="text-lg italic text-gray-400">No access right any system</h1>`
    );
  }
  await setAmecwebLinks();
  showLoader(false);
});

async function setAmecwebLinks() {
  const amecweb = await amecwebData($("#login-id").val());
  if (amecweb.length == 0) {
    $("#amecweb_links").html(
      `<h1 class="text-lg italic text-gray-400">No access right any system</h1>`
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
            app.APP_COLOR
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

async function setRecentApps() {
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
                      el.color
                    )}, 0.5); color: ${el.color};"
            >
                ${el.label}
            </div>
            <div class="text-sm text-gray-500 text-wrap text-center">
                ${
                  el.name.length > 8 ? el.name.substring(0, 8) + "..." : el.name
                }
            </div>
        </a>`;
      }
    });
  if (content == "") $(".recent-apps").hide();
  $("#recent-apps").html(content);
}
