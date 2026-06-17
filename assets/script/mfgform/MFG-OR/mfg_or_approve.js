import { getMfgOrDetail, generateMfgOrNo, updateReviseCenter, exportPdf } from "./data.js";
import { showLoader } from "@amec/webasset/preloader";
import { doaction, showflow } from "@amec/webasset/api/webform";
import { redirectWebflow } from "@amec/webasset/form";
import Swal from "sweetalert2";

$(document).ready(function () {
    const VIEW = {
        headData: {},

        async init() {
            this.applyButtonPermission();
            this.bindEvents();
            await this.loadData();
        },

        bindEvents() {
            $(document).on("click", "[data-action]", async function () {
                if (isSubmitting) return;

                const mode = String($("#mode").val() || "").trim();
                if (mode !== "2") return;

                const $btn = $(this);
                const action = $btn.data("action");
                const empno = $("#empno").val() || "";
                const exdata = $("#txt_exdata").val() || "";
                const remark = $("#remark").val()?.trim() || "";
                const formno = $("#formno").val()?.trim() || "";
                
                if (!action) return;

                if ((action === "reject" || action === "returnb") && !remark) {
                    await Swal.fire({
                        icon: "warning",
                        title: "กรุณากรอก Remark ก่อนทำรายการ",
                        confirmButtonText: "ตกลง",
                    });
                    return;
                }

                isSubmitting = true;

                try {// Approve
                    VIEW.getActionButtons()
                        .prop("disabled", true)
                        .addClass("opacity-50 pointer-events-none");

                    showLoader({ show: true });
                    if (action === "approve" && exdata === "05" && mode === "2") { //DIM Approve Last step
                        const typeform = String(VIEW.headData.TYPEFORM || "").trim();
                        if (typeform.toUpperCase() === "NEW") {
                            await generateMfgOrNo(VIEW.getBasePayload(), formno);
                        }else if (typeform.toUpperCase() === "REVISE") {
                            await updateReviseCenter(VIEW.getBasePayload(), formno);
                        }

                        // Export PDF
                        const exportPdf = (formno) => {
                            const baseUrl = $("#base_url").val();

                            return $.ajax({
                                url: `${baseUrl}mfgform/MFG-OR/main_or/export_pdf`,
                                type: "POST",
                                dataType: "json",
                                data: { formno }
                            });
                        };
                    }
                /*
                    const result = await doaction({
                        ...VIEW.getBasePayload(),
                        ACTION: action,
                        EMPNO: String(empno),
                        REMARK: remark,
                        CEXTDATA: exdata,
                    });

                    console.log("DO ACTION RESULT =", result);
                    showLoader({ show: false });

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
             */   
                } catch (err) {
                    console.error(err);
                    Swal.close();

                    await Swal.fire({
                        icon: "error",
                        title: "ไม่สามารถเชื่อมต่อระบบได้",
                        text: err?.message || "",
                        confirmButtonText: "ตกลง",
                    });
                } finally {
                    showLoader({ show: false });
                    isSubmitting = false;

                    VIEW.getActionButtons()
                        .prop("disabled", false)
                        .removeClass("opacity-50 pointer-events-none");
                }
            });
        },

        getActionButtons() {
            return $("[data-action]");
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
                const payload = this.getBasePayload();
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
                this.headData = data.head || {};

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

            if (typeForm.toUpperCase() === "REVISE") {
                $("#v_type_form").text("Revise");

                $("#v_current_no").text(orNo || "-");
                $("#v_rev").text(rev || "-");

                $("#row_current_no").removeClass("hidden");
                $("#row_rev").removeClass("hidden");
            } else {
                $("#v_type_form").text("New");

                $("#v_current_no").text("");
                $("#v_rev").text("");

                $("#row_current_no").addClass("hidden");
                $("#row_rev").addClass("hidden");
            }

            const classTextMap = {
                BASIC: "Basic Knowledge (ความรู้พื้นฐาน)",
                IMPROVE: "Improvement Case (กรณีปรับปรุงงาน)",
                TROUBLE: "Trouble Case (กรณีเกิดปัญหาซ้ำ)",
                REGULATION: "Regulation (กฎระเบียบ/ข้อบังคับ)"
            };

            $("#v_class").text(classTextMap[head.CLASS] || head.CLASS || "-");
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

        applyButtonPermission() {
            const mode = String($("#mode").val() || "").trim();
            const canAction = mode === "2";

            this.getActionButtons().toggle(canAction);
            $("#remark").closest("tr").toggle(canAction);
        },
    };

    let isSubmitting = false;
    VIEW.init();
});