import { uri, host } from "./utils";
export function employeeLogin(data) {
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
