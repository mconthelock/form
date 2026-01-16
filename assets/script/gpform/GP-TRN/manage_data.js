// =====================================================
// 📦 GP-TRN: Form Data Builder & Saver (jQuery Version)
// =====================================================

import { showAlert } from "./formUtils.js";
import { redirectWebflow } from "../../public/v1.0.3/_form.js";

/**
 * 🔹 Build FormData สำหรับทุกประเภทฟอร์ม (func/legal/meth/pos/out)
 * @param {object} head - ผลลัพธ์จาก createForm()
 * @param {string} fid - form id (1=functional,2=legal,3=meth,4=pos,5=out)
 * @param {string} prefix - prefix form เช่น "func", "legal", "meth"
 * @returns {FormData}
 */
export function buildFormDataGeneric(head, fid, prefix) {
  const fd = new FormData();

  // 🧩 Base head info
  const base = head?.data || {};
  ["NFRMNO", "VORGNO", "CYEAR", "CYEAR2", "NRUNNO"].forEach(k => fd.append(k, base[k] || ""));
  fd.append("PREFIX", prefix);
  fd.append("FID", fid);

  // 🔹 Helper
  const getVal = (id, def = "") => $(`#${prefix}${id}`).val()?.trim() || def;
  fd.append("SUBJECT", getVal("TrainingSubject"));
  

  ["DateFrom", "DateTo"].forEach(k => {
    const v = getVal(k);
    if (v) fd.append(k === "DateFrom" ? "DATE_FROM" : "DATE_TO", v.replace(/-/g, ""));
  });

  fd.append("TIME_FROM", getVal("TimeFromHour", "00") + getVal("TimeFromMin", "00"));
  fd.append("TIME_TO", getVal("TimeToHour", "00") + getVal("TimeToMin", "00"));
  fd.append("PLACE", getVal("Location"));
  fd.append("INSTITUTION", getVal("Institute"));
  fd.append("COST", getVal("AmountInput", "0"));
  fd.append("COST_NOTE", getVal("AmountNote"));
  

  // 🔹 Radio group
  fd.append("TRN_EXPENSE_STATUS", $(`input[name='${prefix}ExpenseOption']:checked`).val() || "");
  fd.append("TRN_EXPENSE_REASON", $(`input[name='${prefix}Reason']:checked`).val() || "");
  fd.append("TRN_EXPENSE_OTHER", getVal("ReasonOtherText"));

  // 🔹 Arrays (objective, expectation)
  $(`input[name='${prefix}Objective[]']`).each((_, el) => {
    const v = $(el).val()?.trim();
    if (v) fd.append(`${prefix}Objective[]`, v);
  });

  $(`input[name='${prefix}Expectation[]']`).each((_, el) => {
    const v = $(el).val()?.trim();
    if (v) fd.append(`${prefix}Expectation[]`, v);
  });

  // 🔹 Helper สำหรับแนบไฟล์
  const appendFiles = (name) => {
    const files = $(`#${prefix}${name}`)[0]?.files;
    if (files) for (const f of files) fd.append(`${prefix}${name}[]`, f);
  };

  // แนบไฟล์เปรียบเทียบ (ทุกฟอร์มมี)
  appendFiles("CompareFiles");
  appendFiles("OtherFiles");
  // 🔹 Special Logic ต่อฟอร์ม
  switch (prefix) {
    case "func":
      fd.append("TRAINEE_ID[]", getVal("TraineeCode"));
      fd.append("JD_NAME", getVal("JdName"));
      fd.append("JD_DESC", getVal("JdRelation"));
      appendFiles("JdFiles");
      break;

    case "legal":
      $("#legal_participants tbody tr").each(function () {
        const id = $(this).find("input[name='legalTraineecode[]']").val()?.trim();
        const poscode = $(this).find("input[name='legalTraineeposcode[]']").val()?.trim();
        const cost = $(this).find("input[name='legalTraineecost[]']").val()?.trim();
        if (id) {
          fd.append("TRAINEE_ID[]", id);
          fd.append("TRAINEE_COST[]", cost || "0");
          fd.append("SPOSCODE[]", poscode || "");
        }
      });
      fd.append("LAWS", getVal("ConcernLaw"));
      break;

    case "meth":
    case "pos":
      fd.append("TRAINEE_ID[]", getVal("TraineeCode"));
      break;
    case "out":
      $("input[name='legalTraineecode[]']").each((_, el) => {
        const v = $(el).val()?.trim();
        if (v) fd.append("TRAINEE_ID[]", v);
      });
      break;

    default:
      console.warn(`⚠️ Unhandled prefix: ${prefix}`);
  }

  return fd;
}

/**
 * 🔹 Save Form Detail ไปยัง API save_formcreate
 * @param {FormData} fd - ข้อมูลฟอร์มทั้งหมด
 * @returns {Promise<object>} - JSON response จาก server
 */
export async function savedetailForm(fd) {
  const API = window.mainUrl || "{{ site_url('gpform/GP-TRN') }}";
  try {
    const res = await fetch(`${API}/save_formcreate`, {
      method: "POST",
      body: fd
    });

    const text = await res.text();
    console.log("🧩 Raw response:", text); // <--- เพิ่มบรรทัดนี้
    const json = JSON.parse(text);

    // ถ้าสำเร็จ แสดง alert
    if (json.status === "success") {
      //showAlert("✅ บันทึกสำเร็จ", "ข้อมูลฟอร์มถูกบันทึกเรียบร้อยแล้ว");
    } else {
      showAlert("⚠ แจ้งเตือน", json.message || "ไม่สามารถบันทึกข้อมูลได้");
    }

    return json;
    redirectWebflow();
  } catch (err) {
    console.error("❌ save_formcreate error:", err);
    showAlert("❌ ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    throw err;
  }
}


export async function createClearanceForm(fd_clr) {
  const API = window.mainUrl || "{{ site_url('gpform/GP-TRN') }}";
  try {
    const res = await fetch(`${API}/save_formcreate_clearance`, {
      method: "POST",
      body: fd_clr
    });

    const text = await res.text();
    console.log("🧩 Raw response clearance form:", text); // <--- เพิ่มบรรทัดนี้
    const json = JSON.parse(text);

    if (json.status === "success") {
      //showAlert("✅ บันทึกสำเร็จ", "ข้อมูลฟอร์มถูกบันทึกเรียบร้อยแล้ว");
    } else {
      showAlert("⚠ แจ้งเตือน", json.message || "ไม่สามารถบันทึกข้อมูลได้");
    }

    return json;

  } catch (err) {
    console.error("❌ save formcreate clearance error:", err);
    showAlert("❌ ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    throw err;
  }
}




export async function createReportForm(fd_report) {
  const API = window.mainUrl || "{{ site_url('gpform/GP-TRN') }}";
  try {
    const res = await fetch(`${API}/save_formcreate_report`, {
      method: "POST",
      body: fd_report
    });

    const text = await res.text();
    console.log("🧩 Raw response training report form :", text); // <--- เพิ่มบรรทัดนี้
    const json = JSON.parse(text);

    // ถ้าสำเร็จ แสดง alert
    if (json.status === "success") {
      //showAlert("✅ บันทึกสำเร็จ", "ข้อมูลฟอร์มถูกบันทึกเรียบร้อยแล้ว");
    } else {
      showAlert("⚠ แจ้งเตือน", json.message || "ไม่สามารถบันทึกข้อมูลได้");
    }

    return json;
  } catch (err) {
    console.error("❌ save_formcreate report error:", err);
    showAlert("❌ ข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    throw err;
  }
}
