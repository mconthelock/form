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
                this.renderForm(data.form || {}, data.head || {});
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

        renderForm(form, head) {
            $("#v_request_by").text(`${form.REQ_EMPNO || "-"} - ${form.REQ_NAME || "-"}`);
            $("#v_create_by").text(`${form.INP_EMPNO || "-"} - ${form.INP_NAME || "-"}`);

            const typeForm = String(head.TYPEFORM || "-");
            const orNo = String(head.ORNO || "").trim();
            const rev = String(head.REV || "").trim();

            if (typeForm === "REVISE") {
                $("#v_type_form").text(`Revise${orNo ? "    Current No : " + orNo : ""}${rev ? "    Rev : " + rev : ""}`);
            } else {
                $("#v_type_form").text("New");
            }

            $("#v_class").text(head.CLASS || "-");
            $("#v_topic").text(head.TOPIC || "-");
            $("#v_dwg_no").text(head.DWGNO || "-");
            $("#v_shop_no").text(head.SHOPNO || "-");
            $("#v_item_no").text(head.ITEMNO || "-");
            $("#v_apply_for").text(head.APPLY_FOR || "-");
        },

        renderFile(att = []) {
            const formno = $("#v_form_no").data("formno");
            const baseUrl = $("#base_url").val();
            const $excel = $("#v_file_excel").empty();
            const $pdf = $("#v_file_pdf").empty();

            const renderLink = (file) => {
                const filename = file.FILENAME || "";
                const url = `${baseUrl}mfgform/MFG-OR/main_or/preview_file/${formno}/${encodeURIComponent(filename)}`;
                return `<a href="${url}" target="_blank" class="file-link">${filename}</a>`;
            };

            const excelFiles = att.filter(file => /\.(xlsx|xls|xlsm)$/i.test(file.FILENAME || ""));
            const pdfFiles = att.filter(file => /\.pdf$/i.test(file.FILENAME || ""));

            $excel.html(excelFiles.length ? excelFiles.map(renderLink).join("") : "-");
            $pdf.html(pdfFiles.length ? pdfFiles.map(renderLink).join("") : "-");
        },
    };

    VIEW.init();
});