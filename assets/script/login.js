import {
  createCarousel,
  sendSession,
  showLoader,
  host,
  uri,
  setCkkey,
  stampApp,
} from "./utils";
// import { getIP } from "./webservice";
import {
  getApp,
  setAuthen,
  getLinks,
  setApp,
  getAllApps,
} from "./indexDB/application";
import { setApplication } from "./indexDB/setIndexDB";
import { showMessage } from "./jFuntion";
import { encryptText } from "./inc/_crypto";
import Cookies from "js-cookie";
import { setImage, setInfo } from "./indexDB/employee";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { io } from "socket.io-client";

$(document).ready(async function () {
  await showLoader(true);
  await createCarousel("login");
  if ($("#appid").val() != "1") $("#webflow-link").removeClass("hidden");
  $(".loginform:visible").find("input").first().focus();

  //Test Socket.io
  console.log("Frontend application loaded!");
  console.log(process.env.APP_API);
  const socket = io(`http://localhost:3001`);
  socket.on("connect", () => {
    console.log("Connected to Socket.io server:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Socket.io server.");
  });

  socket.on("orderViewing", (data) => {
    console.log("Order viewing update received:", data);
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
  });

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
      const cammera = await showCamera(target);
      if (cammera) return;
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
  if (!user.status) {
    await showMessage(user.message);
    frm.find(".loading").addClass("hidden");
    frm.find("input").attr("readonly", false);
    frm.find(".btn").attr("disabled", false);
    return;
  }

  const response = user.data;
  //   const id = `${usr.appid}-${usr.username}`;
  //   const app = await setApplication(response.apps);
  const emp = await setInfo(usr.username, response.appuser);
  const empprofile = await setImage(usr.username, response.appuser.image);
  //   const group = await setAppGroup(id, response.appgroup);
  //   const menu = await setAppMenu(id, response.auth, group);

  if (response.apps.APP_ID == 1) {
    window.location.href = `${process.env.APP_ENV}/home`;
    return;
  }
  if (response.apps.APP_TYPE == "1") {
    window.location.href = `${process.env.APP_HOST}/${response.apps.APP_LOCATION}/authen/move`;
    return;
  }
  window.location.href = `${process.env.APP_HOST}/${
    response.apps.APP_LOCATION
  }/${
    response.appgroup.GROUP_HOME == null ? "" : response.appgroup.GROUP_HOME
  }`;

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

function passwordLogin(data) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/auth/login/`,
      dataType: "json",
      data: data,
      xhrFields: {
        withCredentials: true,
      },
      success: function (response) {
        resolve({ status: true, data: response });
      },
      error: function (xhr, status, error) {
        console.error("Login error:", status, error);
        resolve({ status: false, message: "Login failed. Please try again." });
      },
    });
  });
}

function cardLogin(data) {
  return new Promise((resolve) => {});
}

function barcodeLogin(data) {
  return new Promise((resolve) => {});
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
      // ไม่มีกล้อง
      $("#manual-input").show();
      $("#result").text("ไม่พบกล้อง กรุณากรอกข้อมูลเอง");
      return;
    }

    $("#manual-input").hide();
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

    await codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      videoElement,
      (result, error, controls) => {
        if (result) {
          $("#result").text("ผลลัพธ์: " + result.getText());
          controls.stop();
        }
        if (error) {
          console.warn("อ่านผิดพลาด: ", error.message);
        }
      }
    );
    return true;
  } catch (err) {
    console.error("เกิดข้อผิดพลาด:", err);
    $("#manual-input").show();
    $("#result").text("ไม่สามารถเปิดกล้องได้");
  }
}
