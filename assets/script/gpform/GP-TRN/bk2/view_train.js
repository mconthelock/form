console.log("✅ view_train.js loaded");
import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
import { createForm } from "../../api/webform/form.js";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { host } from "../../utils.js";
import Swal from "sweetalert2";

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
    const empno = formData.empno;

    // call showFlow
    const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
    $(".flow").html(flow.html);


    // 🔹 ปุ่ม Approve / Reject / Return
    $(".btn-submit").on("click", async function () {
        const action = $(this).data("action");
        const remark = $("#txt_remark").val()?.trim() || "";

        // ✅ บังคับกรอก remark สำหรับ reject / return
        if ((action === "reject" || action === "returnb") && !remark) {
            await Swal.fire({
                icon: "warning",
                title: "⚠ กรุณากรอก Remark ก่อนทำรายการ",
                confirmButtonText: "ตกลง"
            });
            return;
        }

        try {
            const result = await doaction( nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, remark);

            if (result?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "ดำเนินการสำเร็จ",
                    text: `Action: ${action.toUpperCase()}`,
                    timer: 1500,
                    showConfirmButton: false
                });

                 // 🔹 เรียก Controller เพื่อเช็คค่า CST
                try {
                    const response = await fetch(`${host}gpform/GP-TRN/training/check_fin_form`, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            frmno: nfrmno,
                            orgno: vorgno,
                            cyear: cyear,
                            cyear2: cyear2,
                            nrunno: nrunno
                        })
                    });

                    const data = await response.json();
                    if (data.status && data.data?.CST == 2) {
                        await Swal.fire({
                            icon: "info",
                            title: "Form is finish",
                            text: "CST = 2",
                            confirmButtonText: "ตกลง"
                        });

                        const formDatakey = { 
                            NFRMNO: nfrmno, 
                            VORGNO: vorgno, 
                            CYEAR: cyear, 
                            REQBY: data.data?.VREQNO, 
                            INPUTBY: data.data?.VINPUTER, 
                            REMARK: "",
                            DRAFT:0,
                        };                        
                        const headResult  = await createForm(formDatakey);
                        console.log("🟢 headResult:", headResult);

                    }else{
                        await Swal.fire({
                            icon: "info",
                            title: "Form is not fininsh",
                            text: "CST = 1",
                            confirmButtonText: "ตกลง"
                        });
                    }


                } catch (e) {
                    console.error("Error while checking CST:", e);
                }












                redirectWebflow();
            } else {
                await Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: result?.message || "ไม่สามารถดำเนินการได้",
                });
            }
        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: "error",
                title: "ไม่สามารถเชื่อมต่อระบบได้",
                text: err?.message || "",
            });
        } finally {
            $("#loading-overlay").hide();
        }
    });
});


