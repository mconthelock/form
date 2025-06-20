// 000. Onload function
// 001. Add Prop: Click add prop button
// 002. Add Alert to: Click add alert button

import { s2disableSearch, setSelect2 } from "../inc/_select2.js";
import { showLoader } from "../utils.js";
import { getCategory, setProp, setOption, removeOption } from "./data.js";

// 000. On load document state
$(document).ready(async function () {
  showLoader(true);
  $(".nav-admin").find("details").attr("open", true);
  const category = await getCategory();
  category.map((el) => {
    $("#doc_type").append(
      `<option value="${el.CATE_ID}">${el.CATE_NAME}</option>`
    );
  });
  setSelect2({ allowClear: false }, "#doc_type");
  setSelect2({ ...s2disableSearch, allowClear: false }, "#doctermunit");
  $("#memder-loader").addClass("hidden");
  showLoader(false);
});

// 001. Add Prop
$(document).on("click", "#addprop", async function (e) {
  e.preventDefault();
  const prop = await setProp();
  $("#prop").append(`${prop}`);
});

$(document).on("change", ".proptype", async function (e) {
  e.preventDefault();
  const val = $(this).val();
  if (val == "list") {
    const listItem = $(this).closest(".prop-row");
    const id = $(".prop-row").index(listItem);
    const opt = await setOption(id);
    $(this).closest(".prop-row").append(opt);
  } else {
    $(this).closest(".prop-row").find(".prop-option").remove();
  }
});

$(document).on("click", ".add-option", async function (e) {
  e.preventDefault();
  const id = $(this).closest(".prop-option").attr("data-id");
  const opt = await setOption(id);
  $(this).closest(".prop-option").after(opt);
});

$(document).on("click", ".remove-option", async function (e) {
  e.preventDefault();
  await removeOption($(this));
});

// 002. Add Alert to
