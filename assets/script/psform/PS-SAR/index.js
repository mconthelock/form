// import { tableOption } from "../../inc/_dataTable.js";
import { host } from "../../utils";
import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
$(document).ready(async function () {
  // Initialize DataTable
  //  $("#table-detail").DataTable();
  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = $(".form-data").data();

  const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
  $(".flow").html(flow.html);

  const dataForm = await $.post(
    `${host}psform/PS-SAR/main/getDataForm`,
    {
      nfrmno,
      vorgno,
      cyear,
      cyear2,
      nrunno,
      empno,
    },
    null,
    "json"
  );

  const rows = dataForm
    .map(
      (item, i) => `
        <tr class="text-center">
          <td class="border border-gray-300">${i + 1}</td>
          <td class="border border-gray-300">${item.CODE_ITEM}</td>
          <td class="border border-gray-300">${item.DWGNO}</td> 
          <td class="border border-gray-300">${item.DESCRIPT}</td>
          <td class="border border-gray-300">${item.OLD_ADDR ?? ""}</td>
          <td class="border border-gray-300">${item.OLD_USER ?? ""}</td>
          <td class="border border-gray-300">${item.NEW_ADDR ?? ""}</td>
          <td class="border border-gray-300">${item.NEW_USER ?? ""}</td>
          <td class="border border-gray-300">${item.REASON ?? ""}</td>
          <td class="border border-gray-300"><input type="radio" name="confirm_${i}" class="checkbox checkbox-success"></td>
          <td class="border border-gray-300"><input type="radio" name="confirm_${i}" class="checkbox checkbox-success"></td>
        </tr>
      `
    )
    .join("");

  $("#table-detail tbody").html(rows);
});
