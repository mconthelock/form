import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getExtData,
         getFormDetail,
         getMode,
         showflow,
         doaction,
       } from "@amec/webasset/api/webform";
import { getUrlParams, showMessage, showErrorMessage } from "@amec/webasset/utils";
import { getFileForm, downloadOrOpenFile } from "@amec/webasset/api/file";
import { webflowSubmit } from "@amec/webasset/components/form";
import { redirectWebflow } from "@amec/webasset/form";

$(async function () {
  const params = getUrlParams();
  const form = {
    NFRMNO: params.NFRMNO,
    VORGNO: params.VORGNO,
    CYEAR: params.CYEAR,
    CYEAR2: params.CYEAR2,
    NRUNNO: params.NRUNNO,
    EMPNO: params.EMPNO || params.empno,
  };
  console.log(form);

  try {
    const CATEGORY_CODE = await getCategory();
    const formDetail = await getFormDetail(form);
    console.log(formDetail);
    const showData = await getShowData(form);
    const data = CATEGORY_CODE.find((c) => {
      return c.CATEGORY_CODE === showData.CATEGORY_CODE;
    });
    // console.log(data);

    await loadAttachedFiles(form);
    $("#VIEW_INBY").text(formDetail.VINPUTER || "-");
    $("#VIEW_REQBY").text(formDetail.VREQNO || "-");
    $("#VIEW_FORMNO").text(formDetail.FORMNO || "-");
    $("#VIEW_REQDATE").text(formDetail.DREQDATE || "-");
    $("#VIEW_CATEGORY").text(data.CATEGORY_NAME || "-");
    $("#VIEW_REMARK").text(showData.REMARK || "-");

    // ปุ่ม approve กับ reject จะโชว์ก็ต่อเมื่อเป็นผู้อนุมัติเท่านั้น
    const mode = await getMode({ ...form, EMPNO: form.EMPNO });
    const cextData = await getExtData({ ...form, EMPNO: form.EMPNO });
    const flow = await showflow(form);
    // console.log("mode:", mode);
    // console.log("cextData:", cextData);
    // console.log("flow:", flow);

    let action = "";
    switch (mode) {
      case "2": // edit / approve
        if (cextData === "01") {
          $("#nameInput").removeAttr("readonly");
        }
        action = webflowSubmit({
          flow: true,
          flowhtml: flow.html,
          approve: true,
          reject: true,
        });
        break;
      case "3": // view
        action = webflowSubmit({
          flow: true,
          flowhtml: flow.html,
          actionsForm: false,
        });
        break;
    }
    $("#sentApprove").html(action);
  } catch (error) {
    console.error("Error loading form data:", error);
    alert("Error loading form data. Please check console for details.");
  }

  async function loadAttachedFiles(form) {
    try {
      const fileForm = await getFileForm({
        ...form,
        FORM_TYPE: "GP",
      });
      // console.log("fileForm:", fileForm);
      if (!fileForm.status) {
        throw new Error(fileForm.message || "Cannot get attached files");
      }
      const fileList = Array.isArray(fileForm.data) ? fileForm.data : [];
      renderAttachedFiles(fileList);
    } catch (error) {
      console.error("Error fetching file form:", error);
      renderAttachedFiles([]);
    }
  }

  function renderAttachedFiles(fileList) {
    if (!fileList.length) {
      $("#file-list").html(`
        <div class="w-full min-h-[2rem] rounded-md border border-base-300 bg-base-100 px-4 py-2 flex items-center">
          <span class="opacity-60">-</span>
        </div>
      `);
      return;
    }
    const fileHtml = fileList
      .map((f) => {
        const originalName = f.FILE_ONAME || f.FILE_FNAME || "-";
        const storedName = f.FILE_FNAME || "";
        const filePath = f.FILE_PATH || "";
        return `
          <div class="file-item flex items-center gap-2 w-full min-w-0 min-h-[2rem] rounded-md border border-base-300 bg-base-100 px-4 py-2">
            <span class="flex-1 min-w-0 truncate">
              ${originalName}
            </span>

            <button
              type="button"
              class="download-btn btn btn-primary btn-sm ml-auto shrink-0"
              data-stored-name="${storedName}"
              data-original-name="${originalName}"
              data-path="${filePath}"
            >
              Download
            </button>
          </div>
        `;
      })
      .join("");
    $("#file-list").html(fileHtml);
    // console.log(fileHtml);
  }
});

  $(document).on("click", ".download-btn", async function () {
    try {
      const file = await downloadOrOpenFile({
        baseDir: $(this).data("path"),
        storedName: $(this).data("stored-name"),
        originalName: $(this).data("original-name"),
        mode: "download",
      });
    } catch (error) {
      console.error("Error downloading or opening file:", error);
    }
  });


// action form approve, reject
$(document).on('click', "button[name='btnAction']", async function () {
    try {
        const param = getUrlParams();
        const form = {
            NFRMNO: param.NFRMNO,
            VORGNO: param.VORGNO,
            CYEAR: param.CYEAR,
            CYEAR2: param.CYEAR2,
            NRUNNO: param.NRUNNO,
        };
        // console.log(form);
        const action = $(this).val();
        const remark = $('#remark').val();
        const empno = param.EMPNO || param.empno || new URLSearchParams(window.location.search).get('empno');
        const cextData = await getExtData({ ...form, EMPNO: empno });
        const state = {
            ...form,
            EMPNO: empno,
            ACTION: action,
            REMARK: remark,
        };
        // console.log(cextData);
        let res;
        if (cextData == '01') {
            const nameStamp = getNameStampValue();
            if (!nameStamp) {
                throw new Error('ไม่พบชื่อที่ต้องการอัพเดท');
            }
            state.NAME_STAMP = nameStamp;
            res = await updateStamp(state);
        } else {
            res = await doaction(state);
        }
        // console.log(res);
        if (res.status) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        console.error(error);
        showMessage(error.message);
    }
});

// Created url Get form
async function getShowData(form){
  const url = `${process.env.APP_API}/gpform/gp-gar/${form.NFRMNO}/${form.VORGNO}/${form.CYEAR}/${form.CYEAR2}/${form.NRUNNO}`;
  return await fetchUtils({
    url: url,
    method: "GET",
  });
}
async function getCategory() {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-gar`,
        method: "GET",
    });
}

// async function getEmpData(empno) {
//     return await fetchUtils({
//         url: `${process.env.APP_API}/users/${empno}`,
//         method: 'GET',
//     });
// }
