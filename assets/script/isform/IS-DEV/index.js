$(document).ready(async function () {
  //await setInputter();
});

$(document).on("change", ".request-type", async function () {
  const type = $(this).val();
  if (type == "1" || type == "2") {
    $(".form-roi").removeClass("hidden");
  } else {
    $(".form-roi").addClass("hidden");
  }
});
