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

export function getEmployee(empno = '') {
  return new Promise((resolve) => {
    $.ajax({
      type: "get",
      url: `${process.env.APP_API}/amec/employee/${empno}`,
      dataType: "json",
      success: function (response) {
        resolve(response);
      }
    });
  });
}

export function getUserImage(empno) {
    return new Promise((resolve) => {
        $.ajax({
        type: "get",
        url: `${process.env.APP_API}/users/image/${empno}`,
        dataType: "text",
        success: function (response) {
            resolve(response);
        },
        error: function (xhr, status, error) {
            console.log(`Error fetching image for ID ${empno}: ${xhr.statusText}`);
            resolve(`${process.env.APP_IMG}/Avatar.png`); // Return default avatar if there's an error
        }
        });
    });
}

export function getUser(empno) {
    return new Promise((resolve) => {
        $.ajax({
            type: "get",
            url: `${process.env.APP_API}/users/${empno}`,
            dataType: "json",
            success: function (response) {
                resolve(response);
            },
            error: function (xhr, status, error) {
                console.error(`Error fetching user data for ${empno}:`, status, error);
                resolve(null); // Return null if there's an error
            }
        });
    });
}