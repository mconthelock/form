import { showFlow } from "../../inc/_form";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import $ from "jquery";  // ใช้ jQuery

$(document).ready(async function () {
    // init date picker
    flatpickr("#start-date", { dateFormat: "Y-m-d" });

    // ดึงค่า data-* จาก element .form-data
    const formData = $(".form-data").data();

    const nfrmno = formData.nfrmno;
    const vorgno = formData.vorgno;
    const cyear  = formData.cyear;
    const cyear2 = formData.cyear2;
    const nrunno = formData.nrunno;

    // call showFlow
    const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);

    $(".flow").html(flow.html);
});
