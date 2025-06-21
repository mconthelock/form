import CryptoJS from "crypto-js";
export function getNews() {
  return new Promise((resolve) => {
    $.ajax({
      type: "get",
      url: `${process.env.APP_API}/gpreport/news/`,
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
    });
  });
}

export function passwordLogin(data) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/auth/login/`,
      dataType: "json",
      data: data,
      //   xhrFields: {
      //     withCredentials: true,
      //   },
      success: function (response) {
        //resolve({ status: true, data: response });
        resolve(response);
      },
      error: function (xhr, status, error) {
        console.error("Login error:", status, error);
        resolve({ status: false, message: "Login failed. Please try again." });
      },
    });
  });
}

export function directlogin(empno, id) {
  const md5Hash = CryptoJS.MD5(empno).toString().toUpperCase();
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/auth/directlogin/`,
      dataType: "json",
      data: {
        username: md5Hash,
        appid: id,
      },
      success: function (response) {
        resolve(response);
      },
      error: function (xhr, status, error) {
        console.error("Login error:", status, error);
        resolve({ status: false, message: "Login failed. Please try again." });
      },
    });
  });
}

// Docinv
export function getAmecwebAccess(q) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/docinv/amecweb/accessright`,
      dataType: "json",
      data: q,
      success: function (response) {
        resolve(response);
      },
    });
  });
}

export function getUserGroup(id, program) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/docinv/amecweb/userGroup/`,
      dataType: "json",
      data: {
        id,
        program,
      },
      success: function (response) {
        resolve(response);
      },
    });
  });
}

export function getApplication(q) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/docinv/amecweb/application/`,
      dataType: "json",
      data: q,
      success: function (response) {
        resolve(response);
      },
    });
  });
}

// Webform
export function getformlist(q) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/webflow/formlist/listdata/`,
      dataType: "json",
      data: q,
      success: function (response) {
        resolve(response);
      },
    });
  });
}

// User
export function getEmployee(q = {}) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      dataType: "json",
      url: `${process.env.APP_API}/webflow/amecusers/users/`,
      data: q,
      success: function (data) {
        resolve(data);
      },
    });
  });
}

export function getAmecusers() {
  const amecusers = JSON.parse(localStorage.getItem("amecusers"));
  if (amecusers) {
    return new Promise((resolve) => {
      resolve(amecusers);
    });
  }

  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      dataType: "json",
      url: `${process.env.APP_API}/webflow/amecusers/users/`,
      data: { status: 1, mode: 1 },
      success: function (data) {
        localStorage.setItem("amecusers", JSON.stringify(data));
        resolve(data);
      },
    });
  });
}
