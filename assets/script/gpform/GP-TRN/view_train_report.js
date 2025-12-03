console.log("✅ view_train_report.js loaded (OMG V3)");

import { showFlow } from "../../public/v1.0.3/_form.js";
import { host } from "../../utils.js";
import Swal from "sweetalert2";

$(document).ready(async function () {
    console.log("view_train_report.js : version =", "OMG V2");

    const fd = $(".form-data").data();
    const nfrmno = fd.nfrmno;
    const vorgno = fd.vorgno;
    const cyear  = fd.cyear;
    const cyear2 = fd.cyear2;
    const nrunno = fd.nrunno;
    const empno  = fd.empno;

    const exdata = $("#txt_exdata").val();
    const trainee_pos = $("#txt_trainee_pos").val();
    const allowList = ["55", "60", "61", "62", "63"];

 
    /* ============================================================
       🔄 Load Flow
    ============================================================ */
    try {
        const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
        $(".flow").html(flow.html);
    } catch (err) {
        console.error("❌ Error loading flow:", err);
    }

    /* ============================================================
       📨 Submit Action
    ============================================================ */
    $(".btnSubmit").on("click", async function (e) {
        e.preventDefault();

        // Prevent click if disabled
        if ($(this).prop("disabled")) {
            return false;
        }

        const content = $("#CONTENT").val()?.trim() || "";
        const apply   = $("#APPLY").val()?.trim() || "";

        const fileInput = $("input[name='txt_trn_att[]']")[0];
        const hasFile = fileInput && fileInput.files.length > 0;

        try {
            if (exdata === "99") {

                /* CASE 1: Upload File */
                if (allowList.includes(trainee_pos)) {

                    if (!hasFile) {
                        return Swal.fire({
                            icon: "warning",
                            title: "⚠ กรุณาแนบไฟล์",
                            text: "ตำแหน่งนี้ต้องแนบไฟล์เท่านั้น"
                        });
                    }

                    const formData = new FormData();
                    formData.append("mode", "upload");
                    formData.append("frmno", nfrmno);
                    formData.append("orgno", vorgno);
                    formData.append("cyear", cyear);
                    formData.append("cyear2", cyear2);
                    formData.append("nrunno", nrunno);

                    for (let f of fileInput.files) {
                        formData.append("txt_trn_att[]", f);
                    }

                    const res = await fetch(
                        `${host}gpform/GP-TRNRP/trainingreport/handle_trnrp`,
                        { method: "POST", body: formData }
                    );

                    const json = await res.json();
                    if (!json.status) throw json.message;

                    return Swal.fire({
                        icon: "success",
                        title: "อัปโหลดไฟล์สำเร็จ!",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                }

                /* CASE 2: Content + Apply */
                else {

                    if (!content || !apply) {
                        return Swal.fire({
                            icon: "warning",
                            title: "⚠ กรอกข้อมูลไม่ครบ",
                            text: "กรุณากรอกเนื้อหาและการประยุกต์ใช้งาน"
                        });
                    }

                    const res = await fetch(
                        `${host}gpform/GP-TRNRP/trainingreport/handle_trnrp`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: new URLSearchParams({
                                mode: "update_only",
                                frmno: nfrmno,
                                orgno: vorgno,
                                cyear: cyear,
                                cyear2: cyear2,
                                nrunno: nrunno,
                                content: content,
                                apply: apply
                            })
                        }
                    );

                    const json = await res.json();
                    if (!json.status) throw json.message;

                    return Swal.fire({
                        icon: "success",
                        title: "บันทึกสำเร็จ",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                }
            }

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: err,
            });
        }
    });

});
