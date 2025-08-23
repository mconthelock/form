import CryptoJS from "crypto-js";
export function passwordLogin(data) {
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
        resolve(response);
      },
      error: function (xhr, status, error) {
        console.error("Login error:", status, error);
        resolve({
          status: false,
          message: "Login failed. Please try again.",
        });
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
      xhrFields: {
        withCredentials: true,
      },
      data: {
        username: md5Hash,
        appid: id,
      },
      success: function (response) {
        resolve(response);
      },
      error: function (xhr, status, error) {
        console.error("Login error:", status, error);
        resolve({
          status: false,
          message: "Login failed. Please try again.",
        });
      },
    });
  });
}
