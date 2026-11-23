/**
 * โครงสร้างเมนู Sidebar แบบแยกตามหมวดหมู่ (Multi-Sidebar Pattern แบบเดียวกับ Procurement)
 * เมื่อคลิกเลือกกลุ่ม (เช่น IS Form, PUR Form, QA Form, Advanced Features) จะแสดงเมนูย่อยของกลุ่มนั้นพร้อมปุ่ม Back to Home
 */

const quickStartItem = {
    text: 'Back to Home',
    link: '/quick-start',
    roles: ['*'],
};

const isForm = [
    {
        text: 'IS Form',
        collapsed: false,
        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
        items: [
            {
                text: 'Confirm Sheet Form (IS-CFS)',
                link: '/form/isform/is-cfs',
                roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
            },
            {
                text: 'Result Confirmation (IS-JDR)',
                link: '/form/isform/is-jdr',
                roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
            },
            {
                text: 'Special Authorization ID (IS-SPC)',
                link: '/form/isform/is-spc',
                roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
            },
            {
                text: 'Temporary User Request (IS-TID)',
                link: '/form/isform/is-tid',
                roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
            },
            {
                text: 'Varied Off AS400 Display (IS-OFF)',
                link: '/form/isform/is-off',
                roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
            },
        ],
    },
];

const purForm = [
    {
        text: 'PUR Form',
        collapsed: false,
        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
        items: [
            {
                text: 'Price Comparison',
                collapsed: false,
                roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                items: [
                    {
                        text: 'Create Form',
                        link: '/form/purform/pur-cpc/create',
                        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                    },
                    {
                        text: 'Search Form',
                        link: '/form/purform/pur-cpc/search',
                        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                    },
                ],
            },
            {
                text: 'Price Approval',
                collapsed: false,
                roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                items: [
                    {
                        text: 'Create Form',
                        link: '/form/purform/pur-pra/create',
                        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                    },
                    {
                        text: 'View',
                        link: '/form/purform/pur-pra/view',
                        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                    },
                    {
                        text: 'Return',
                        link: '/form/purform/pur-pra/return',
                        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                    },
                    {
                        text: 'Specification',
                        link: '/form/purform/pur-pra/spec',
                        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
                    },
                ],
            },
        ],
    },
];

const qaForm = [
    {
        text: 'QA Form',
        collapsed: false,
        roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
        items: [
            {
                text: 'E-Self Inspection and Authorize (QA-INS)',
                link: '/form/qaform/qa-ins',
                roles: ['ADMIN', 'REQUESTER', 'APPROVER', 'MANAGER'],
            },
        ],
    },
];

const tool = [
    {
        text: 'Advanced Features',
        collapsed: false,
        roles: ['*'],
        items: [
            {
                text: 'QR Code Generator',
                link: '/form/tool/qrcode',
                roles: ['*'],
            },
        ],
    },
];

export const isFormItem = [...isForm, quickStartItem];
export const purFormItem = [...purForm, quickStartItem];
export const qaFormItem = [...qaForm, quickStartItem];
export const toolItem = [...tool, quickStartItem];
