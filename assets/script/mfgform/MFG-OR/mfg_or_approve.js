import { getMfgOrDetail } from "./data.js";
import { showLoader } from "@amec/webasset/preloader";
import { doaction, showflow } from "@amec/webasset/api/webform";
import { redirectWebflow } from "@amec/webasset/form";
import { host } from "../../utils.js";
import Swal from "sweetalert2";

$(document).ready(function () {
    const VIEW = {
        async init() {
            await this.loadData();
            this.bindEvents();
        },

        bindEvents() {
            $(".btn-submit").on("click", async function () {
                const action = $(this).data("action");
                const remark = $("#remark").val()?.trim() || "";
                const empno = $("#empno").val() || "";

                if ((action === "reject" || action === "returnb") && !remark) {
                    await Swal.fire({
                        icon: "warning",
                        title: "กรุณากรอก Remark ก่อนทำรายการ",
                        confirmButtonText: "ตกลง",
                    });
                    return;
                }

                const confirmResult = await Swal.fire({
                    icon: "question",
                    title: "ยืนยันการทำรายการ",
                    html: `ต้องการ ${String(action).toUpperCase()} ใช่หรือไม่ ?`,
                    showCancelButton: true,
                    confirmButtonText: "ยืนยัน",
                    cancelButtonText: "ยกเลิก",
                });

                if (!confirmResult.isConfirmed) return;

                try {
                    $(".btn-submit").prop("disabled", true).addClass("opacity-50 pointer-events-none");
                    showLoader({ show: true });

                    const result = await doaction({
                        ...VIEW.getBasePayload(),
                        ACTION: action,
                        EMPNO: String(empno),
                        REMARK: remark,
                        CEXTDATA: $("#txt_exdata").val() || "",
                    });

                    console.log("DO ACTION RESULT =", result);

                    if (result?.status) {
                        await Swal.fire({
                            icon: "success",
                            title: "ดำเนินการสำเร็จแล้ว",
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        redirectWebflow();
                        return;
                    }

                    await Swal.fire({
                        icon: "error",
                        title: result?.message || "เกิดข้อผิดพลาด",
                        confirmButtonText: "ตกลง",
                    });
                } catch (err) {
                    console.error(err);
                    await Swal.fire({
                        icon: "error",
                        title: "ไม่สามารถเชื่อมต่อระบบได้",
                        text: err?.message || "",
                        confirmButtonText: "ตกลง",
                    });
                } finally {
                    showLoader({ show: false });
                    $(".btn-submit").prop("disabled", false).removeClass("opacity-50 pointer-events-none");
                }
            });
        },

        getBasePayload() {
            return {
                NFRMNO: $("#nfrmno").val(),
                VORGNO: $("#vorgno").val(),
                CYEAR: $("#cyear").val(),
                CYEAR2: $("#cyear2").val(),
                NRUNNO: $("#nrunno").val(),
            };
        },

        async loadData() {
            showLoader({ show: true });

            try {
                const urlParams = new URLSearchParams(window.location.search);

                const getVal = (inputId, paramNames = []) => {
                    const inputVal = $.trim($(inputId).val());
                    if (inputVal) return inputVal;

                    for (const name of paramNames) {
                        const val = $.trim(urlParams.get(name) || "");
                        if (val) return val;
                    }

                    return "";
                };

                const payload = {
                    NFRMNO: getVal("#nfrmno", ["no", "NFRMNO"]),
                    VORGNO: getVal("#vorgno", ["orgNo", "orgno", "VORGNO"]),
                    CYEAR: getVal("#cyear", ["y", "CYEAR"]),
                    CYEAR2: getVal("#cyear2", ["y2", "CYEAR2"]),
                    NRUNNO: getVal("#nrunno", ["runNo", "runno", "NRUNNO"]),
                };

                console.log("OR VIEW PAYLOAD =", payload);

                if (!payload.NFRMNO || !payload.VORGNO || !payload.CYEAR || !payload.CYEAR2 || !payload.NRUNNO) {
                    throw new Error("ไม่พบข้อมูล key ของฟอร์ม");
                }

                const flow = await showflow(payload);
                $(".flow").html(flow.html);

                const res = await getMfgOrDetail(payload);
                console.log("GET MFG OR =", res);

                if (!res?.status) {
                    throw new Error(res?.message || "Data not found");
                }

                const data = res.data || {};
                this.renderForm(data.form || {});
                this.renderFile(data.att || []);
            } catch (err) {
                console.error("LOAD OR VIEW ERROR:", err);
                await Swal.fire({
                    icon: "error",
                    title: "Load data failed",
                    text: err?.message || "",
                    confirmButtonText: "ตกลง",
                });
            } finally {
                showLoader({ show: false });
            }
        },

        renderForm(form) {
            $("#v_request_by").text(`${form.REQ_EMPNO || "-"}_${form.REQ_NAME || "-"}`);
            $("#v_create_by").text(`${form.INP_EMPNO || "-"}_${form.INP_NAME || "-"}`);
            $("#v_type_form").text(form.TYPEFORM || "-");
            $("#v_class").text(form.CLASS || "-");
            $("#v_topic").text(form.TOPIC || "-");
            $("#v_dwg_no").text(form.DWGNO || "-");
            $("#v_shop_no").text(form.SHOPNO || "-");
            $("#v_item_no").text(form.ITEMNO || "-");
            $("#v_apply_for").text(form.APPLY_FOR || "-");
            $("#v_or_no").text(form.ORNO || "-");
            $("#v_rev").text(form.REV || "-");
        },

        renderFile(att = []) {
            const formno = $("#v_form_no").data("formno");
            const baseUrl = $("#base_url").val();
            const $fileList = $("#v_file_list").empty();

            if (!att.length) {
                $fileList.html("-");
                return;
            }

            att.forEach(file => {
                const filename = file.FILENAME || "";
                const url = `${baseUrl}mfgform/MFG-OR/main_or/preview_file/${formno}/${encodeURIComponent(filename)}`;

                $fileList.append(`
                    <div>
                        <a href="${url}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                            ${filename}
                        </a>
                    </div>
                `);
            });
        },
    };

    VIEW.init();
});