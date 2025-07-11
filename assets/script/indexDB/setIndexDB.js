import { getApplication } from "../webservice";
import { setApp, getApp } from "./application";
import { getAllImage, getImage, getInfo, setImage, setInfo } from "./employee";
import { getGroup, getMenu, setGroup, setMenu } from "./userAuth";
import jsSHA from "jssha";

// IndexedDB
export async function generateSchemaHash(schema) {
  // ใช้ SHA-256 ในการสร้าง hash ของ schema รองรับ http
  if (!window.crypto || !window.crypto.subtle) {
    // console.log("Web Crypto API not supported in this browser.");
    const schemaString = JSON.stringify(schema);
    const shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(schemaString);
    return shaObj.getHash("HEX");
  }
  const schemaString = JSON.stringify(schema);
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(schemaString)
  );
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function setApplication(apps) {
  // console.log("beforeApplication", new Date(), apps.APP_ID, apps);
  const data = await getApp(apps.APP_ID);
  //   console.log("getApplication", new Date(), apps.APP_ID, data);

  if (data == undefined || data == null) {
    // console.log("setApplication", new Date(), apps.APP_ID, apps);
    await setApp(apps.APP_ID, apps);
  }
}

export async function setAppGroup(id, data) {
  // console.log("beforeGroup", new Date(), id, data);
  const res = await getGroup(id);
  // console.log("getAppGroup", new Date(), id, res);
  if (
    res == undefined ||
    res == null
    //res.data.UPDATE_DATE < data.UPDATE_DATE
  ) {
    // console.log("setAppGroup", new Date(), id, data);

    await setGroup(id, data);
    return true;
  }
  return false;
}

export async function setAppMenu(id, data, update = false) {
  // console.log("beforeMenu", new Date(), id, data);
  const res = await getMenu(id);
  // console.log("getAppMenu", new Date(), id, res);
  if (res == undefined || res == null || update) {
    // console.log("setAppMenu", new Date(), id, data);
    await setMenu(id, data);
  }
}

/**
 * Fill employee image in the specified element.
 * @param {string} e e.g. '#empImage', '.avatar-24008'
 * @param {string} empno e.g. '24008'
 */
export async function fillImages(e, empno) {
  const element = $(e);
  const img = await displayEmpImage(empno);
  //   console.log(element,e);

  element.attr("src", img);
  element.removeClass("hidden");
}

/**
 * Set avatar options in a select element based on employee IDs.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since 2025-06-20
 * @param {Array} allUsers [24008, 24009, 24010]
 * @param {string} selectElement '.operator'
 * @note for function formatAvatar in Select2
 */
export async function setAvatarSelect(allUsers, selectElement) {
  // console.log('setAvatarSelect', allUsers, selectElement);
  const empImage = await getAllImage();
  // console.log(empImage,allUsers);
  allUsers.filter(async (user) => {
    let img = empImage.find((img) => img.id == user);
    console.log(`setAvatarSelect: user ${user}`, img);

    if (img) {
      setAvatarOption(selectElement, user, img.image);
    } else {
      img = await displayEmpImage(user);
      setAvatarOption(selectElement, user, img);
    }
  });

  function setAvatarOption(selectElement, empno, img) {
    const option = $(selectElement).find(`option[value="${empno}"]`);
    if (option.length > 0) {
      option.data("img", img);
    }
  }
}

// ดึงรูปภาพจาก IndexedDB
export async function displayEmpImage(id) {
  const cachedImage = await getImage(id);
  if (cachedImage) {
    return `${cachedImage}`;
  } else {
    // ดึงรูปภาพจาก API
    const response = await fetch(
      // `${process.env.APP_API}/webflow/amecusers/images/${id}`
      `${process.env.APP_API}/users/image/${id}`
    );
    // console.log(response);
    if (response.ok) {
      const img = await response.text();
      console.log(id, img);
      // บันทึกลง IndexedDB
      await setImage(id, img);
      return `${img}`;
    } else {
      console.log(`Error fetching image for ID ${id}: ${response.statusText}`);
      return false;
    }
  }
}

// ดึงข้อมูลพนักงานจาก IndexedDB
export async function displayEmpInfo(id) {
  const cachedInfo = await getInfo(id);
  if (cachedInfo) {
    return cachedInfo.data;
  } else {
    // ดึงข้อมูลจาก API
    const response = await fetch(`${process.env.APP_API}/users/${id}`);
    const text = await response.text();

    if (!text) {
      // ถ้า response body ว่าง
      return null;
    }
    try {
      const data = JSON.parse(text);
      if (!data) return null;
      await setInfo(id, data);
      return data;
    } catch (e) {
      // parse ไม่ได้
      console.error("JSON parse error:", e);
      return null;
    }
    // const data = await response.json();
    // console.log(data);
    // if(!data) return null;
    // await setInfo(id, data);
    // return data;
  }
}
