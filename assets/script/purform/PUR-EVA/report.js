import { getOrganize } from '../../finform/FIN-PCK/dataloc';
import { deptManager, divManager, secManager } from './formManager';

$(async function () {
    const org = await getOrganize();
    const orgfilter = org.filter((item) => item.VORGNO !== '00');
    const groupedOrg = orgfilter.reduce((acc, item) => {
        // ถ้ายังไม่มี property ของ type นี้ ให้สร้าง Array ว่างเตรียมไว้
        if (!acc[item.CTYPE]) {
            acc[item.CTYPE] = [];
        }
        // ดันข้อมูลเข้าไปใน type นั้นๆ
        acc[item.CTYPE].push(item);
        return acc;
    }, {});
    console.log(groupedOrg[1]);

    const secdata = groupedOrg[1].map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));
    const deptdata = groupedOrg[2].map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));
    const divdata = groupedOrg[3].map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));
    secManager.init(secdata);
    deptManager.init(deptdata);
    divManager.init(divdata);
});

$(document).on('click', '#btnExport', async function () {
    const NRUNNO = $('input[name="FORM_NO"]').val();
    const VENDCODE = $('input[name="VENDOR_CODE"]').val();
    const COMNAME = $('input[name="VENDOR_NAME"]').val();
    const VENDGROUPTYPE = $('input[name="VENDOR_GROUP_TYPE"]').val();
    const SNAME = $('input[name="REQUESTER"]').val();
    const CST = $('input[name="CST"]').val();
    const SREQDATE = $('input[name="REQUEST_DATE_FROM"]').val();
    const EREQDATE = $('input[name="REQUEST_DATE_TO"]').val();
    const SEMPNO = $('input[name="EMP_NO"]').val();
    const SSECCODE = $('input[name="SECTION"]').val();
    const SDEPCODE = $('input[name="DEPARTMENT"]').val();
    const SDIVCODE = $('input[name="DIVISION"]').val();
    const hasReqtorData = SEMPNO || SNAME || SSECCODE || SDEPCODE || SDIVCODE;
    const hasEvaformData = SREQDATE || EREQDATE || CST || hasReqtorData;
    if (VENDGROUPTYPE == 'Indirect') {
    } else if (VENDGROUPTYPE == 'Direct') {
    } else if (VENDGROUPTYPE == 'Subcon') {
    }

    const payload = {
        ...(NRUNNO && { NRUNNO: NRUNNO }),
        ...(VENDCODE && { VENDCODE: VENDCODE }),
        ...(COMNAME && { COMNAME: `LIKE ${SNAME}` }),
        // หากต้องการแนบ VENDOR ต่างๆ ไปที่ Root level สามารถเพิ่มตรงนี้ได้เลย เช่น:
        // ...(VENDCODE && { VENDCODE: VENDCODE }),

        ...(hasEvaformData && {
            evaform: {
                ...(SREQDATE && { START_DREQDATE: SREQDATE }),
                ...(EREQDATE && { END_DREQDATE: EREQDATE }),
                ...(CST && { flow: { CST: CST } }),
                // ถ้ามีข้อมูลในกลุ่ม reqtor ค่อยสร้างก้อน reqtor
                ...(hasReqtorData && {
                    reqtor: {
                        ...(SEMPNO && { SEMPNO: SEMPNO }),
                        ...(SNAME && { SNAME: `LIKE ${SNAME}` }),
                        ...(SSECCODE && { SSECCODE: SSECCODE }),
                        ...(SDEPCODE && { SDEPCODE: SDEPCODE }),
                        ...(SDIVCODE && { SDIVCODE: SDIVCODE }),
                    },
                }),
            },
        }),
    };

    console.log(payload);
});
