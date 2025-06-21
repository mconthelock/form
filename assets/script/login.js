import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  createCarousel,
  sendSession,
  showLoader,
  host,
  uri,
  showMessage,
} from "./utils";
import { getApp } from "./indexDB/application";
import { setApplication } from "./indexDB/setIndexDB";
import { setImage, setInfo } from "./indexDB/employee";
import { directlogin, passwordLogin } from "./webservice";

var camera;
$(document).ready(async function () {
  await showLoader(true);
  await createCarousel("login");
  if ($("#appid").val() != "1") $("#webflow-link").removeClass("hidden");
  $(".loginform:visible").find("input").first().focus();
  //Test Socket.io
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

  await showLoader(false);
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
    await showMessage(user.message);
    frm.find(".loading").addClass("hidden");
    frm.find("input").attr("readonly", false);
    frm.find(".btn").attr("disabled", false);
    return;
  }
  const url = await successLogin(user);
  window.location.href = url;
  //await setSession(user.message);
  //const apps = user.message.apps;
  //const location = apps.APP_LOCATION;

  //เช็คว่าเป็น Webflow หรือไม่ ถ้าใช่ให้ Redirect ไปหน้า Home
  //   const app = $("#appid").val(); //1 = webflow
  //   if (app == 1) {
  //     window.location.href = `${process.env.APP_ENV}/home`;
  //     return;
  //   }

  //เก็บข้อมูล App ลง LocalStorage
  //   const id = `${usr.program}-${usr.username}`;
  //   await setAuthen(id, user.message);

  //   await setUserAuth(id, user.message); // เก็บข้อมูล Session ลง IndexDB ให้เว็บปลายทางใช้
  //   const authKey = setCkkey(usr.program, usr.username);
  //   localStorage.setItem(location, authKey); // เก็บ key cookie ไว้ใน localStorage
  //   Cookies.set(authKey, encryptText(id, location), { expires: 0.5 / 24 }); // Set cookie for 30 minutes

  // เก็บข้อมูลลง Recent App
  //   try {
  //     const links = await getLinks(apps.APP_ID); //.find((el) => el.id == id);
  //     const appdata = links.data;
  //     if (appdata !== null) {
  //       await stampApp(appdata);
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }

  //ส่งข้อมูล Session ไปยัง Site ปลายทาง
  //   if (apps.APP_ID != "28") {
  //     const dir = await sendSession(
  //       `${process.env.APP_HOST}/${location}`,
  //       user.message
  //     );
  //     if (!dir.url) {
  //       showMessage(
  //         "You have no permission to Access on our system, Please contact admin Tel. 2032-2038"
  //       );
  //     } else {
  //       window.location.href = `${process.env.APP_HOST}/${location}/${dir.url}`;
  //       return;
  //     }
  //   } else {
  //     const dir =
  //       user.message.group.length > 0
  //         ? user.message.group[0].GROUP_HOME
  //           ? user.message.group[0].GROUP_HOME
  //           : ""
  //         : "";
  //     window.location.href = `${process.env.APP_HOST}/${location}/`;
  //   }
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
      window.location.href = `${uri}/${location}/${dir.url}`;
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
  console.log("close");
  $("#frm-barcode").removeClass("hidden");
  $("#open-camera").hide();
  camera.stop();
});

async function successLogin(user) {
  const emp = await setInfo(user.appuser.SEMPNO, user.appuser);
  const empprofile = await setImage(user.appuser.SEMPNO, user.appuser.image);
  if (user.apps.APP_ID == 1) return `${process.env.APP_ENV}/home`;

  if (user.apps.APP_TYPE == "1")
    return `${process.env.APP_HOST}/${user.apps.APP_LOCATION}/authen/move`;

  return `${process.env.APP_HOST}/${user.apps.APP_LOCATION}/${
    user.appgroup.GROUP_HOME == null ? "" : user.appgroup.GROUP_HOME
  }`;
}

export function setSession(data) {
  //สร้าง  Session ในระบบ
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
  const empno = ("00000" + (empcode / 4 - 92).toString()).slice(-5);
  const user = await directlogin(empno, 1);
  if (user.status !== undefined) {
    await showMessage(user.message);
    // frm.find(".loading").addClass("hidden");
    // frm.find("input").attr("readonly", false);
    // frm.find(".btn").attr("disabled", false);
    return;
  }
  const url = await successLogin(user);
  window.location.href = url;
}

function bglogin(data) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${uri}/webservice/api/authentication/directlogin`,
      dataType: "json",
      data: data,
      success: function (response) {
        resolve(response);
      },
    });
  });
}

async function showCamera(target) {
  if (target !== "frm-barcode") return false;
  const videoElement = document.getElementById("video");
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputDevices = devices.filter(
      (device) => device.kind === "videoinput"
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
        !/depth|ultrawide/i.test(device.label)
    );

    if (preferred) {
      selectedDeviceId = preferred.deviceId;
    }

    return await codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      videoElement,
      async (result, error, controls) => {
        if (result) {
          await barcodeLogin(result.getText());
          $("#open-camera").hide();
          controls.stop();
        }
        if (error) {
          console.warn("อ่านผิดพลาด: ", error.message);
        }
      }
    );
    //return true;
  } catch (err) {
    console.error("เกิดข้อผิดพลาด:", err);
  }
}
