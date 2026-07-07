import { setDatePicker } from "@amec/webasset/flatpickr";
import dayjs from "dayjs";
import { getSchedule } from "./data";


$(async function () {
    // ----------JUNG BM-------------------------
      await setDatePicker({
        element: "#selectedDate",
        dateFormat: "Y-m-d",
        // maxDate: 'today',
        dayOff: false,
        onChange: async (selectedDates, dateStr) => {
          await setSchedule(dateStr);
        },
      });
      // -------------------------------------------------
});

//BM date
$(document).on("click", "#openDatePicker", function (e) {
  e.preventDefault();
  const datePicker = document.querySelector("#selectedDate")?._flatpickr;
  if (datePicker) datePicker.open();
});

//BM date
async function setSchedule(dateStr) {
  let currentDate = dayjs(dateStr);
  if (!currentDate.isValid()) {
    currentDate = dayjs(String(dateStr), "YYYYMMDD");
  }

  let res = [];
  const maxLookbackDays = 365;
  for (let i = 0; i < maxLookbackDays; i++) {
    const queryDate = currentDate.format("YYYYMMDD");
    res = await getSchedule({ sdate: queryDate, edate: queryDate });
    if (Array.isArray(res) && res.length > 0 && res[0].SCHDNUMBER != null) {
      break;
    }
    currentDate = currentDate.subtract(1, "day");
  }

  if (!Array.isArray(res) || res.length === 0) {
    $("#schd_txt").val("");
    $("#schd_number").val("");
    $("#schd_p").val("");
    showMessage("No schedule found.");
    return;
  }

  $("#schd_txt").val(res[0].SCHDMFG + '-' + res[0].PRIORITY);
  const workId = String(res?.[0]?.WORKID ?? "");
  const formattedWorkId = /^\d{8}$/.test(workId)
    ? `${workId.slice(0, 4)}-${workId.slice(4, 6)}-${workId.slice(6, 8)}`
    : workId;
  console.log(formattedWorkId);
  $("#selectedDate").val(formattedWorkId);
}