import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getFormDetail, getMode, showflow } from "@amec/webasset/api/webform";
import { getUrlParams } from "@amec/webasset/utils";


$(async function () {
  const param = getUrlParams();
  console.log(param);


  const form = {
    EMPNO: param.EMPNO,
  };
  console.log(form);


  const data = await getShowData(form);
  console.log(data);
  const showflowdata = await showflow(param.NFRMNO, param.VORGNO, param.CYEAR, param.CYEAR2, param.NRUNNO, param.EMPNO);
  console.log(showflowdata);
  

// $("#VIEW_INBY").val(params.EMPNO);


});

// async function getShowData(params) {
//   const url = `${process.env.APP_API}/gpform/gp-gar/${params.NFRMNO}/${params.VORGNO}/${params.CYEAR}/${params.CYEAR2}/${params.NRUNNO}`;
//   return await fetchUtils({
//     url: url,
//     method: "GET",
//   });

async function getShowData(params) {
  const url = `${process.env.APP_API}/gpform/gp-gar/${form.NFRMNO}/${form.VORGNO}/${form.CYEAR}/${form.CYEAR2}/${form.NRUNNO}`;
  return await fetchUtils({
    url: url,
    method: "GET",
  });
}
