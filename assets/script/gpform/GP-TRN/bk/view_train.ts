import { showFlow } from "../../inc/_form";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import $ from "jquery";  // ✅ บอก TS ว่า $ คือ jQuery

$(document).ready(async function () {
    flatpickr("#start-date", { dateFormat: "Y-m-d" });

    const formData = $(".form-data").data() as {
        nfrmno: string;
        vorgno: string;
        cyear: string;
        cyear2: string;
        nrunno: string;
        empno: string;
    };

    const { nfrmno, vorgno, cyear, cyear2, nrunno } = formData;
    const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);

    $(".flow").html(flow.html);
});
