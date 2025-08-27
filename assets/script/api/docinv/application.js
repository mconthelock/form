export function getApplication(id) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "get",
      url: `${process.env.APP_API}/docinv/application/${id}`,
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (res) {
        reject(res);
      },
    });
  });
}

export function getAllApplication() {
  return new Promise((resolve) => {
    $.ajax({
      type: "get",
      url: `${process.env.APP_API}/docinv/application/`,
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (res) {
        reject(res);
      },
    });
  });
}
