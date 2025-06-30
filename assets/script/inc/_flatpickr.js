

import "flatpickr/dist/flatpickr.min.css";

//JS Loader
import flatpickr    from "flatpickr";
import dayjs        from 'dayjs';

export const fpkTimeOpt = {
    enableTime: true,
    noCalendar: true, // ไม่เอาวัน เอาแต่เวลา
    dateFormat: "H:i", // รูปแบบเวลา (เช่น 13:45)
    time_24hr: true    // ใช้เวลา 24 ชั่วโมง
};
/**
 * Set day off in .fdate
 * @param {object} options 
 * @param {string or object} e string id e.g. #date or element e.g. $('#date')
 * @returns 
 */
export const setDatePicker = (options = {}, e = '') => {
    const element = e == '' ? '.fdate' : e;
    //Date Picker
    const storedDayOffs = JSON.parse(localStorage.getItem("dayoff")) || [];
    const instance = flatpickr(element, {
        dateFormat: "Y-m-d",
        ...options,
        // allowInput: true,
        // disableMobile: true,
        // disable: storedDayOffs.value,  // disble วันหยุด
        // flatpickr เป็น readonly อยู๋แล้วที่ใส่เพิ่มเพื่อสามารถ required ได้นั่นได้ หากไม่ใส่จะข้ามไปถึงแม้จะใส่ก็ตาม
        onReady: function(selectedDates, dateStr, instance) {
            // // 1) ปิดคีย์บอร์ดเสมือนบนมือถือ (iOS/Android ใหม่ ๆ รองรับ)
            // instance._input.setAttribute('inputmode', 'none');

            // // 2) บล็อกทุกช่องทางพิมพ์
            // ['beforeinput','keydown','keypress','keyup',
            // 'input','textInput','paste','drop',
            // 'compositionstart','compositionupdate','compositionend']
            // .forEach(ev => {
            // instance._input.addEventListener(ev, e => {
            //     e.preventDefault();
            //     // ถ้า event บางตัวเล็ดลอด เผื่อ reset ค่า
            //     if (ev === 'input') e.target.value = instance.input.value;
            // });
            // });

            // // 3) ซ่อน caret ให้คนไม่งง (CSS)
            // instance._input.style.caretColor = 'transparent';

            instance._input.removeAttribute('readonly');
             // แต่กันพิมพ์ด้วย event
            instance._input.addEventListener('keydown', function (e) {
                e.preventDefault();
            });
            instance._input.addEventListener('paste', function (e) {
                e.preventDefault();
            });
        },
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            try {
                const dateStr = dayElem.dateObj.toLocaleDateString().split("T")[0]; // แปลงวันที่เป้นสตริง
                
                const dd = dayjs(dateStr).format("YYYY-M-D"); // แปลงสตริงเป็น fomat วันที่ ที่ต้องการ\

                if (storedDayOffs.value.includes(dd)) {
                dayElem.classList.add("day-off"); // เพิ่มคลาส
                }
            } catch (error) {
                console.error("Error in onDayCreate:", error);
            }
        },
    });
    return instance;
};


/**
 * Set local stored
 */
//Delete Cache
const version = process.env.VERSION;
const lversion = localStorage.getItem("version") || null;
if (lversion === null || lversion != version) {
  localStorage.removeItem("dayoff");
  localStorage.removeItem("schedule");
  localStorage.setItem("version", version);
}
//Setting Dayoff
if (
  localStorage.getItem("dayoff") === null ||
  localStorage.getItem("schedule") === null
) {
  getameccalendar();
} else {
  const itemStr = localStorage.getItem("dayoff");
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (
    now.getTime() > item.expiry ||
    item.version === undefined ||
    item.version < 240128
  ) {
    localStorage.removeItem("dayoff");
    localStorage.removeItem("schedule");
    getameccalendar();
  }
}

function getameccalendar() {
  var today = new Date();
  var sdate = today.getFullYear() - 1 + "-01-01";
  var edate = today.getFullYear() + 1 + "-12-31";
  var dayoff = [];
  //var schedule = [];
  let calenda = [];
  let url = `${process.env.APP_WEBSERVICE}/api/calendar/getcalendarrange`;
  $.ajax({
    url: url,
    type: "post",
    dataType: "json",
    data: { sdate: sdate, edate: edate },
    async: false,
    success: function (res) {
      res.map(function (data) {
        //console.log(data);
        var schd = {
          WORKID: data.WORKID,
          MFGSCHD: data.SCHDMFG,
          MFGSCHDNUM: data.SCHDNUMBER,
          MFGSCHDP: data.PRIORITY,
          MFGFEEDER1: data.FEEDER1,
          MFGFEEDER2: data.FEEDER1,
          MFGSUBASSY: data.SUBASSY_FINISH,
          MFGASSY: data.ASSY_FINISH,
          MFGPACKING: data.PACKING,
          DAYOFF: data.DAYOFF,
          WORKNUM: data.WORKNUM,
        };
        calenda.push(schd);
        if (data.DAYOFF == 1)
          dayoff.push(
            data.WORKYEAR + "-" + data.WORKMONTH + "-" + data.WORKDAY
          );
      });

      const item_dayoff = {
        value: dayoff,
        version: 240128,
        expiry: today.getTime() + 7889400000,
      };
      const item_schedule = {
        value: calenda,
        version: 240128,
        expiry: today.getTime() + 7889400000,
      };
      localStorage.setItem("dayoff", JSON.stringify(item_dayoff));
      localStorage.setItem("schedule", JSON.stringify(item_schedule));
    },
  });
}
