import ExcelJS from "exceljs";
import { hexToRgb } from "../utils";
import {
  getLinks,
  setLinks,
  getAmecweb,
  setAmecweb,
} from "../indexDB/application";
import { getAmecwebAccess } from "../webservice";

//สร้าง Link ของ Other Links section
export async function createLinks(id, data, obj) {
  let content = "";
  data.map((el) => {
    const apps = el.data;
    if (apps.group == id) {
      content += `<li class="min-w-[250px]">
        <a class="link link-hover links-stamp"
            data-id="${apps.iid}"
            target="${apps.type == 1 ? "_self" : "_blank"}"
            href="${apps.url}">
                ${apps.name}
        </a>
    </li>`;
    }
  });
  obj.html(content);
}

//Check ข้อมูล Links ที่อ่านมาจาก Excel เป็นค่าล่าสุดแล่วหรือยัง
export async function checkUpdateLinks() {
  const modifyDate = await getModifyDate("assets/files", "App_color.xlsx");
  const fileLinksDate = new Date(modifyDate[0].modifyDate);
  const locatLinksDate = localStorage.getItem("webflowlinksdate");
  const alllinks = await getLinks();
  if (fileLinksDate != locatLinksDate || alllinks.length == 0) {
    const links = await readExcel();
    links.map((el) => {
      setLinks(el.id, el);
    });
    localStorage.setItem("webflowlinksdate", fileLinksDate);
  }
  return await getLinks();
}

export async function readExcel() {
  var response = [];
  const template = await getfileInPath("assets/files", "App_color.xlsx");
  const file = template[0].buffer;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file).then(async (workbook) => {
    const sheet = workbook.worksheets[0];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        const [id, iid, code, name, type, url, color, group, icon] =
          row.values.slice(1);
        response.push({ id, iid, code, name, type, url, color, group, icon });
      }
    });
  });
  return response;
}

export async function exportExcel() {
  const template = await getfileInPath("assets/files", "App_color.xlsx");
  const file = template[0].buffer;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file).then(async (workbook) => {
    const sheet = workbook.worksheets[0];
    appColors.applications.map((el, i) => {
      sheet.addRow([
        el.id,
        el.code,
        el.name,
        el.type,
        el.url,
        el.color,
        el.group,
      ]);
    });

    workbook.xlsx.writeBuffer().then(function (buffer) {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `appcolors.xlsx`;
      link.click();
    });
  });
}

export function getfileInPath(path, fileName = "") {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${process.env.APP_ENV}/excel/getfileInPath/`,
      type: "post",
      dataType: "json",
      data: {
        path: path,
        fileName: fileName,
      },
      success: function (res) {
        res.forEach(async (file) => {
          console.log(`Processing file: ${file.filename}`);
          const binaryData = atob(file.content); // แปลง Base64 เป็น Binary
          const buffer = new Uint8Array(binaryData.length);

          for (let i = 0; i < binaryData.length; i++) {
            buffer[i] = binaryData.charCodeAt(i);
          }
          file.buffer = buffer; // เอา buffer ไปใช้งานต่อ เขียนหรืออ่าน
        });
        resolve(res);
      },
      error: function (xhr, err) {
        console.log(xhr, err);
      },
    });
  });
}

export async function getModifyDate(path, fileName = "") {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${process.env.APP_ENV}/excel/getModifyDate/`,
      type: "post",
      dataType: "json",
      data: {
        path: path,
        fileName: fileName,
      },
      success: function (res) {
        resolve(res);
      },
    });
  });
}

export const appColors = async () => {
  var response = [];
  const template = await getfileInPath("assets/files", "App_color.xlsx");
  const file = template[0].buffer;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file).then(async (workbook) => {
    const sheet = workbook.worksheets[0];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        const [id, code, name, type, url, color, group] = row.values.slice(1);
        response.push({ id, code, name, type, url, color, group });
      }
    });
  });
  return response;
};

export async function amecwebData(id) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${process.env.APP_API}/docinv/appsusers/user/${id}/`,
      type: "get",
      dataType: "json",
      success: function (res) {
        resolve(res);
      },
      error: function (xhr, err) {
        console.log(xhr, err);
        reject(err);
      },
    });
  });
}
