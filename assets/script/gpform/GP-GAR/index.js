import {
  logFormData,
  requiredForm,
  showErrorMessage,
  showMessage,
} from "@amec/webasset/utils";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { webflowSubmit } from "@amec/webasset/components/form";
import { setSelect2 } from "@amec/webasset/select2";
import Select2 from "select2";
import { data } from "jquery";
import { logFormData } from "@amec/webasset/utils";
import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { redirectWebflow } from "@amec/webasset/form";

Select2();

$(async function () {
  const querystring = window.location.search;
  const urlParams = new URLSearchParams(querystring);
  const empno = urlParams.get("empno");
  $("#INBY").val(empno);

  setDatePicker({
    element: "#REQDATE",
  });
  const CATEGORY_CODE = await getCategory();
  const data = await CATEGORY_CODE.map((c) => {
    return { value: c.CATEGORY_CODE, text: c.CATEGORY_NAME };
  });
  console.log(data);

  setSelect2({
    id: "#CATEGORY_CODE",
    data: data,
  });

  const action = webflowSubmit({ request: true });
  $("#action").html(action);
});

$(document).on("click", "#btnRequest", async function () {
  try {
    const requiredmessage = [
      { element: $("#INBY"), message: "Please fill in input by fields." },
      { element: $("#REQBY"), message: "Please fill in required by fields." },
      { element: $("#REQDATE"), message: "Please fill required date fields." },
      { element: $("#CATEGORY_CODE"), message: "Please fill in required for fields."},
    ];
     

    if (!(await requiredForm("#form", requiredmessage))) return;

    if (!$("#FILE").val() && !$("#remark").val()) {
      showMessage("Please fill in either remark or file attachment.", "warning");
      return;
    }
    const formData = new FormData($("#form")[0]);
    formData.set("REMARK", $("#remark").val());
    logFormData(formData);
    const res = await createform(formData);
    console.log(res);
    if (res.status == true) {
      showMessage(res.message, "success");
      redirectWebflow();
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    showErrorMessage(error.message);
  };
});



async function getCategory() {
  return await fetchUtils({
    url: `${process.env.APP_API}/gpform/gp-gar`,
    method: "GET",
  });
}

async function createform(data) {
  return fetchUtils({
    url: `${process.env.APP_API}/gpform/gp-gar`,
    method: "POST",
    data: data,
  });
}
