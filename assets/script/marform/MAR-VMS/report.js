import { showLoader } from "../../public/v1.0.3/preloader";
import {
  requiredForm,
  ajaxOptions,
  getData
} from "../../public/v1.0.3/jFuntion";
import { host } from "../../utils";
import Swal from "sweetalert2";
import { setDatePicker , setDatefpk } from "../../public/v1.0.3/_flatpickr";
import { createTable } from "../../public/v1.0.3/_dataTable";
import {  exportExcel, defaultExcel } from "../../public/v1.0.3/_excel";
setDatePicker({ element: '.datesel', dateFormat: "Y-m-d" });
setDatePicker({
  element: '.monthsel',
  plugins: [
    new monthSelectPlugin({
        shorthand: true, //defaults to false
        dateFormat: "Y-m",
    })
],
});
setDatefpk({
  name: '.yearsel', // name ของ input
  date: '2025',    // ถ้าต้องการ set default
  onReady: function(selectedDates, dateStr, instance) {
      // ซ่อนเดือน
      instance.currentYearElement.focus();
      instance.monthElements.forEach(m => m.style.display = 'none');
  },
  dateFormat: "Y",    // output เป็นปี
  altFormat: "Y",     // แสดงใน input
});
$('#dateMode').on('change', function () {
  $('#dateRange, #monthRange, #yearRange').addClass('hidden');

  if (this.value === 'date') {
    $('#dateRange').removeClass('hidden');
  } else if (this.value === 'month') {
    $('#monthRange').removeClass('hidden');
  } else if (this.value === 'year') {
    $('#yearRange').removeClass('hidden');
  }
});
$('#searchBtn').on('click', async function () {
  console.log(process.env.APP_API);
  if (!(await requiredForm("#form-report"))) return;
    const datemode = $('#dateMode').val();
    let startdate = "";
    let enddate = "";
    let datareport = {};
    let columns = [];
    const reporttype = $('#report_type').val();
    let url = "";
    if(datemode == "date")
    {
      startdate = $('#start_date').val();
      enddate = $('#end_date').val();
    }else if(datemode == "month")
    {
      startdate = $('#start_month').val();
      enddate = $('#end_month').val();
    }else if(datemode == "year")
    {
      startdate = $('#start_year').val();
      enddate = $('#end_year').val();
    }
    if(reporttype == "VR")
    {
       columns = [
        {
          data: "VISITDATE",
          title: "Visit Date",
          width: "10%",
        },
        {
          data: "COUNTRY",
          title: "Country",
          width: "10%",
        },
        {
          data: "COMPANY",
          title: "Company",
          width: "20%",
        },
        {
          data: "NAME",
          title: "Visitor Name",
          width: "30%",
        },
        {
          data: "POSITION",
          title: "Position",
          width: "20%",
        },
        {
          data: "VISITEXP",
          title: "Previous Visit Experience",
          width: "5%",
        },
        {
          data: "VISIT_NO",
          title: "No. of Visitors",
          width: "5%",
        },
      ];
    }else if(reporttype == "VO")
    {
      columns = [
        {
          data: "TOTAL_VISITS",
          title: "Total Visits",
          width: "10%",
        },
        {
          data: "TOTAL_VISITORS",
          title: "Total Visitors",
          width: "10%",
        },
        {
          data: "UNIQUE_COMPANIES",
          title: "Unique Companies",
          width: "10%",
        },
        {
          data: "UNIQUE_COUNTRIES",
          title: "Countries Represented",
          width: "10%",
        },
      ];

    }
    showLoader({ show: true });
    try {
      datareport = await getData({
        ...ajaxOptions,
        url: host + "marform/MAR-VMS/report/get_report_vms",
        data: { datemode:datemode , reporttype:reporttype , startdate:startdate , enddate:enddate },
      });
      await createTableResult(datareport,columns,"reportTable");
    } catch(err) {
      Swal.fire({
        icon: "error",
        title: "Report.",
        text: err.responseText || "Failed to search report.",
      });
    } finally {
  
      showLoader({ show: false });
    }
  
  
});

/**
 * Create export excel
 */
 $('#exportBtn').on('click', async function () {
  if (!(await requiredForm("#form-report"))) return;
  const datemode = $('#dateMode').val();
  let startdate = "";
  let enddate = "";
  let datareport = {};
  const reporttype = $('#report_type').val();
  let url = "";
  if(datemode == "date")
  {
    startdate = $('#start_date').val();
    enddate = $('#end_date').val();
  }else if(datemode == "month")
  {
    startdate = $('#start_month').val();
    enddate = $('#end_month').val();
  }else if(datemode == "year")
  {
    startdate = $('#start_year').val();
    enddate = $('#end_year').val();
  }
  showLoader({ show: true });
  try {
  datareport = await getData({
    ...ajaxOptions,
    url: host + "marform/MAR-VMS/report/get_report_vms",
    data: { datemode:datemode , reporttype:reporttype , startdate:startdate , enddate:enddate },
  });
  
  var now = new Date();
  var timestamp = 
    ('0' + now.getDate()).slice(-2) +
    ('0' + (now.getMonth() + 1)).slice(-2) +
    now.getFullYear() +
    ('0' + now.getHours()).slice(-2) +
    ('0' + now.getMinutes()).slice(-2) +
    ('0' + now.getSeconds()).slice(-2);
  var reportname = $('#report_type option:selected').text();
  var fileName = `${reportname}_${timestamp}`;
  const opt = {
    data: datareport,
    column: [
      {header : 'Total Visits' , key : 'TOTAL_VISITS'},
      {header : 'Total Visitors' , key : 'TOTAL_VISITORS'},
      {header : 'Unique Companies'    , key : 'UNIQUE_COMPANIES'},
      {header : 'Countries Represented'     , key : 'UNIQUE_COUNTRIES'},
     ],
    sheetName:  `${reportname}`,
    font: { bold: true, size: 12 }, // ตัวหนา + ขนาด 12
    alignment: { vertical: "middle", horizontal: "center" },
    extraWidth: 5,
    manual: true,
    manualActions: (sheet) => {
      // ทำอะไรเพิ่มเติม เช่น แทรก row, สีพื้น, border
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFC000" }, // สีส้มพื้น header
      };
    },
  };
  const workbook = await defaultExcel(opt);
  exportExcel(workbook, fileName);
  } catch(err) {
    Swal.fire({
      icon: "error",
      title: "Report.",
      text: err.responseText || "Failed to export.",
    });
  } finally {
    showLoader({ show: false });
  }

});

/**
 * Create table
 * @param {array} data
 * @returns
 */
 async function createTableResult(data,columns, tableid) {
   createTable({
    data : data,
    columns:columns,
    ordering: false,
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find('th').css({
        'background-color': '#fb923c', // ส้ม 
        'color': '#ffffff',            // ดำ
        'font-weight': 'bold',         // ตัวหนา
        'text-align': 'center'         // จัดกลาง
      });
    },
    paging: false,
    searching: false,
    info: false
  },{
    id: '#' + tableid,
    join: true
  });
}






























