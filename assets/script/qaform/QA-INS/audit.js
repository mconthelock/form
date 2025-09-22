import { getAuditMasterAll } from "../../api/escs/audit_master_all";
import { getAuditRevision } from "../../api/escs/audit_revision";
import { handleFiles } from "../../public/v1.0.3/_dragdrop";
import { fancybox } from "../../public/v1.0.3/_fancyBox";
import {
    autosizeTextarea,
    getAllAttr,
    logFormData,
    logtest,
    showErrorMessage,
    showMessage,
} from "../../public/v1.0.3/jFuntion";
import { btn } from "./component";
import { getformData, saveAudit } from "./data";
import { finishAndClose, setSkeleton, shortName, shortSec } from "./function";
import {
    calScoreTotal,
    createDetail,
    createScoreBoard,
    createTableAuditMaster,
    createTableCS,
    createTableRevision,
    setScore,
} from "./template";
var formInfo, formData, auditor, auditee, master, form;
const typecode = "ESO";

$(async function () {
    try {
        logtest("------------------- Audit Preview -------------------");
        $("body").addClass("bg-[#ecf0f5]");
        setSkeleton();
        // return;
        formInfo = await getAllAttr(document.querySelector(".form-info"));
        form = {
            NFRMNO: formInfo.nfrmno,
            VORGNO: formInfo.vorgno,
            CYEAR: formInfo.cyear,
            CYEAR2: formInfo.cyear2,
            NRUNNO: formInfo.nrunno,
        };
        formData = await getformData(form);
        if (!formData || formData.length === 0) {
            throw new Error("No form data found");
        }
        const revision = await getAuditRevision({
            ARR_SECID: formData.QA_INCHARGE_SECTION,
        });
        auditee =
            formData.QA_AUD_OPT.find(
                (i) => i.QOA_TYPECODE == typecode && i.QOA_SEQ == formInfo.seq
            ) || {};
        if (!auditee || Object.keys(auditee).length === 0) {
            throw new Error("You are not authorized to audit this form.");
        }
        master = formData.QA_MASTER.filter((i) => i.ARM_STATUS === 1);
        if (!master || master.length === 0) {
            throw new Error("No audit master data found");
        }


        logtest("Form Info", formInfo);
        logtest("Form Data", formData);
        logtest("Auditee", auditee);
        logtest("Revision", revision);

        $("#rev").html(`Revision: ${formData.QA_REV_INFO.ARR_REV_TEXT}`);
        $("#score").replaceWith(await createScoreBoard());
        $("#detail").replaceWith(await createDetail(formData, auditee));
        $("#tableRevision").replaceWith(await createTableRevision(revision));
        $("#auditReport").replaceWith(
            await createTableAuditMaster(
                master,
                auditee.QOA_AUDIT,
                auditee.QA_AUDIT
            )
        );
        $("#tableCS").replaceWith(await createTableCS(auditee, auditee.QOA_AUDIT));
        if (auditee.QOA_AUDIT != 1) {
            $("#action").html(
                btn({
                    id: "saveDraft",
                    text: "Save Draft",
                    cls: "btn-neutral",
                }) +
                    btn({
                        id: "submit",
                        text: "Submit",
                        cls: "btn-primary",
                    }) +
                    btn({
                        id: "cancel",
                        text: "Cancel",
                        cls: "btn-error",
                    })
            );
        } else {
            $("#action").html("");
        }
        logtest("Master", master);
        setScore();
        fancybox();
        logtest(document.getElementById("audit-result"));
    } catch (error) {
        console.error(error);
        showErrorMessage(error);
    }
});

async function setDataToSave() {
    const data = [];
    $(".list-row").each((i, el) => {
        const input = $(el).find(".audit-score");
        const topic = $(el).attr("topic");
        const seq = $(el).attr("seq");
        data.push({
            ...form,
            QAA_TYPECODE: typecode,
            QAA_AUDIT_SEQ: formInfo.seq,
            QAA_TOPIC: topic,
            QAA_SEQ: seq,
            QAA_AUDIT: input.val(),
            QAA_COMMENT: $(el)
                .find(`input[name="list-${topic}-${seq}"]:checked`)
                .val(),
        });
    });
    return data;
}

$(document).on("click", ".cs-radio", function (e) {
    const radio = $(this);
    const sibling = radio.siblings('input[type="radio"]');
    if (sibling.prop("click") == 1) {
        sibling.prop("click", 0);
    }
    if (radio.prop("click") == 1) {
        radio.prop("checked", false);
        radio.prop("click", 0);
    } else {
        radio.prop("click", 1);
    }
});

$(document).on('change', 'input[name="files"]', function(){
    handleFiles();
});

$(document).on('click', '#cancel', function(){
    finishAndClose();
});

$(document).on("click", "#saveDraft", async function () {
    try {
        logtest("-------------------Save Draft-------------------");
        logtest("Form ", form);

        const data = await setDataToSave();
        logtest("Data to save", data);
        const formData = new FormData($("#part2")[0]);
        // $("#tableCS")
        //     .find("input, select, textarea")
        //     .each(function () {
        //         const name = $(this).attr("name");
        //         const value = $(this).val();
        //         if (name) {
        //             formData.append(name, value);
        //         }
        //     });
        formData.append("NFRMNO", form.NFRMNO);
        formData.append("VORGNO", form.VORGNO);
        formData.append("CYEAR", form.CYEAR);
        formData.append("CYEAR2", form.CYEAR2);
        formData.append("NRUNNO", form.NRUNNO);
        formData.append("typecode", typecode);
        formData.append("auditSeq", formInfo.seq);
        formData.append("actionBy", formInfo.empno);
        formData.append("draft", 1);
        // formData.append("data", JSON.stringify(data));
        data.forEach((item, i) => {
            // NestJS จะมองเป็น data[0][field], data[1][field]
            Object.keys(item).forEach((key) => {
                formData.append(`data[${i}][${key}]`, item[key] ?? "");
            });
        });
        // ถ้ามี array ของ string เช่น delImageIds
        // delImageIds?.forEach((id, i) => formData.append(`delImageIds[${i}]`, id));
        $('.delete-from-db').each(function(i, el) {
            formData.append(`delImageIds[${i}]`, $(el).attr('file-id'));
        });

        // บันทึกผลลัพธ์
        // logFormData(formData);
        // return
        const res = await saveAudit(formData);
        // return;

        // const res = await saveAudit({
        //     ...form,
        //     data,
        //     draft: 1,
        //     typecode: typecode,
        //     auditSeq: formInfo.seq,
        // });
        if (res && res.status) {
            showMessage("Save draft successfully", "success");
            finishAndClose();
        } else {
            throw new Error("Failed to save draft");
        }
    } catch (error) {
        logtest("Error saving draft", error);
        showErrorMessage(error);
    }
});

$(document).on("click", "#submit", async function () {
    try {
        logtest("-------------------Submit-------------------");
        logtest("Form ", form);
        // ดึงคะแนนที่ได้
        const score = $("#totalScore").text();
        // คิดเกรด
        // แปลงเป็นผลลัพธ์
        const data = await setDataToSave();
        // บันทึกผลลัพธ์
        const res = await saveAudit({
            ...form,
            data,
            typecode: typecode,
            auditSeq: formInfo.seq,
            score,
        });
        if (res && res.status) {
            showMessage("Save draft successfully", "success");
            // finishAndClose();
        } else {
            throw new Error("Failed to save draft");
        }
    } catch (error) {
        logtest("Error submitting form", error);
        showErrorMessage(error);
    }
});
