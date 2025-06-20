import { tableOption, showLoader } from "../utils.js";

$(document).ready(async function () {
  showLoader(true);
  $(".nav-admin").find("details").attr("open", true);
  await createTable();
  showLoader(false);
});

async function createTable(data) {
  const id = "#table";
  const opt = { ...tableOption };
  opt.data = data;
  opt.pageLength = 20;
  opt.responsive = true;
  opt.order = [[0, "asc"]];
  opt.columns = [{ data: null, title: "No." }];
  opt.initComplete = async function () {
    const str = `<div class="flex justify-between items-center gap-2">
        <a class="btn btn-primary" href="${process.env.APP_ENV}/licence/template/add/">New Template</a>
    </div>`;
    $(id).closest(".dt-container").find(".table-option").append(str);
    $(id).closest(".dt-container").find(".dt-length").addClass("hidden");
  };
  return new DataTable(id, opt);
}
