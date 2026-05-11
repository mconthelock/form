import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getFormDetail } from "@amec/webasset/api/webform";
import { getUrlParams } from "@amec/webasset/utils";

$(async function () {
  const param = getUrlParams();
  console.log(param);

  const form = {
    NFRMNO: param.NFRMNO,
    VORGNO: param.VORGNO,
    CYEAR: param.CYEAR,
    CYEAR2: param.CYEAR2,
    NRUNNO: param.NRUNNO,
  };

  const formDetail = await getFormDetail(form);
  console.log(formDetail);
  $("#INPUTBY").val(formDetail.VINPUTER);
  $("#REQBY").val(formDetail.VREQNO);

  const empData = await getEmpData(formDetail.VREQNO);
  console.log(empData);

  $("#empName").val(empData.STNAME);
  $("#empDept").val(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
  $("#empPos").val(empData.SPOSITION);

  /*เอามาจาก bcackend */
  /*เรียกใช้ข้อมูลทีละตัว*/
  const purpose = await getData();
  console.log(purpose);
  const Purposedata = purpose
    .map((a) => {
      const otherSelect = `<input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1"
                            id="otherSelect" name="PURPOSE_OTHER" placeholder="Please specify other purpose" disabled>`;

      return `<label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="PURPOSE_ID" 
                                    class="radio radio-xs rounded border-base-content [--chkbg:var(--bc)] [--chkfg:var(--b1)] req" value="${a.PURPOSE_ID}"
                                    id="purpose_${a.PURPOSE_ID}">
                                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                                ${a.PURPOSE_ID == 4 ? otherSelect : ""}
                            </label>`;
    })
    .join("");
  const getShowdata = await getShowData();
  console.log(getShowdata.PURPOSE_ID);
  $("#purpose_${a.PURPOSE_ID").val(getShowdata.PURPOSE_ID);
  $("NAME_STAMP").val(getShowdata.NAMESTAMP);

  $("#purposeList").html(Purposedata);
});

async function getData() {
  return await fetchUtils({
    url: `${process.env.APP_API}/gpform/gp-rb`,
    method: "GET",
  });
}

async function getShowData() {
  return await fetchUtils({
    url: `${process.env.APP_API}/gpform/showstamp-gp-rb`,
    method: "GET",
  });
}
async function getEmpData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}
