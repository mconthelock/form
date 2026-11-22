/**
 * โครงสร้างเมนู Sidebar แบบแยกตามหมวดหมู่ (Multi-Sidebar Pattern แบบเดียวกับ Procurement)
 * เมื่อคลิกเลือกกลุ่ม (เช่น IS Form, QA Form, Advanced Features) จะแสดงเมนูย่อยของกลุ่มนั้นพร้อมปุ่ม Back to Home
 */

const quickStartItem = {
  text: "Back to Home",
  link: "/quick-start",
  roles: ["*"],
};

const isForm = [
  {
    text: "IS Form",
    collapsed: false,
    roles: ["ADMIN", "REQUESTER", "APPROVER", "MANAGER"],
    items: [
      {
        text: "Confirm Sheet Form (IS-CFS)",
        link: "/form/isform/is-cfs",
        roles: ["ADMIN", "REQUESTER", "APPROVER", "MANAGER"],
      },
      {
        text: "Result Confirmation (IS-JDR)",
        link: "/form/isform/is-jdr",
        roles: ["ADMIN", "REQUESTER", "APPROVER", "MANAGER"],
      },
      {
        text: "Special Authorization ID (IS-SPC)",
        link: "/form/isform/is-spc",
        roles: ["ADMIN", "REQUESTER", "APPROVER", "MANAGER"],
      },
      {
        text: "Temporary User Request (IS-TID)",
        link: "/form/isform/is-tid",
        roles: ["ADMIN", "REQUESTER", "APPROVER", "MANAGER"],
      },
      {
        text: "Varied Off AS400 Display (IS-OFF)",
        link: "/form/isform/is-off",
        roles: ["ADMIN", "REQUESTER", "APPROVER", "MANAGER"],
      },
    ],
  },
];

const qaForm = [
  {
    text: "QA Form",
    collapsed: false,
    roles: ["ADMIN", "REQUESTER", "APPROVER", "MANAGER"],
    items: [
      {
        text: "E-Self Inspection and Authorize (QA-INS)",
        link: "/form/qaform/qa-ins",
        roles: ["ADMIN", "REQUESTER", "APPROVER", "MANAGER"],
      },
    ],
  },
];

const tool = [
  {
    text: "Advanced Features",
    collapsed: false,
    roles: ["ADMIN", "MANAGER"],
    items: [
      {
        text: "QR Code Generator",
        link: "/form/tool/qrcode",
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },
];

export const isFormItem = [...isForm, quickStartItem];
export const qaFormItem = [...qaForm, quickStartItem];
export const toolItem = [...tool, quickStartItem];
