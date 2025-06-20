import $ from "jquery";
import { tableOptions } from "./utils";
import DataTable from "datatables.net-dt";
import "datatables.net-responsive";
import "datatables.net-responsive-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.min.css";

var table;
var empdata = [];
export async function initial() {
  empdata = await getUsers();
  const fileter = empdata.find((e) => {
    e.SEMPNO == "12069";
  });
  table = await createTable(fileter);
}

export async function createTable(data) {
  const tbname = "#amec-employee";
  if ($.fn.DataTable.isDataTable(tbname)) $(tbname).DataTable().destroy();

  const opt = { ...tableOptions };
  opt.data = data;
  opt.columns = [
    { data: "SDIV", title: "Div" },
    { data: "SDEPT", title: "Dept" },
    { data: "SSEC", title: "Sec" },
    {
      data: "SEMPNO",
      title: "Employee",
      render: (data, e, row) => {
        return `(${data}) ${row.SNAME}`;
      },
    },
    { data: "STNAME", title: "Employee" },
    { data: "SPOSITION", title: "Position" },
    { data: "SRECMAIL", title: "Email" },
    { data: "NTELNO", title: "Tel." },
  ];
  return new $(tbname).DataTable(opt);
}

function getUsers(q = "") {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: "https://amecweb.mitsubishielevatorasia.co.th/webservice/api/employee/getusers/",
      dataType: "json",
      data: { q },
      success: function (response) {
        resolve(response);
      },
    });
  });
}

function getDivision() {}

function getDepartment() {}

function getSection() {}
