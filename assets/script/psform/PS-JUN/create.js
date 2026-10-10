import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createTable } from '@amec/webasset/dataTable';
import { setRequester, getTemplate, exportExcel } from '../../service';
import { tableOption } from '../../utils.js';
dayjs.extend(customParseFormat);
var table;
var calendarData;

$(document).ready(async function () {
    await setRequester();
    await reloadTable();
});

async function reloadTable() {
    calendarData = await getActualSchedule();
    const data = await getSchedule();
    const actualData = calendarData.filter((item) => item.SCHDMFG != null);
    const mappedData = await MapData(data, actualData);
    //const lp = LastP1(mappedData, 20260312);
    //console.log(lp);
    //console.log(mappedData);
    if (!table) {
        await createDataTable(mappedData);
    } else {
        table.clear();
        table.rows.add(mappedData);
        table.draw();
    }
}

async function createDataTable(data) {
    const dateFormat = (value) => {
        const valueString = String(value ?? '');
        const compactDate = /^(\d{4})(\d{2})(\d{2})$/.exec(valueString);
        const dateString = compactDate
            ? `${compactDate[1]}-${compactDate[2]}-${compactDate[3]}`
            : valueString;
        const date = dayjs(dateString, 'YYYY-MM-DD', true);
        return date.isValid() ? date.format('DD MMM YY') : value;
    };
    const opt = { ...tableOption };
    opt.data = data;
    opt.searching = true;
    // opt.paging = false;
    // opt.ordering = false;
    // opt.pageLength = -1;
    opt.columns = [
        { data: 'workId', className: 'hidden' },
        {
            data: 'schdMfg',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') {
                    return row.subGroup == 'P1' ? data : '';
                }
                return data;
            },
        },
        {
            data: 'workingDays',
            className: 'border border-slate-200 text-center!',
        },
        {
            data: 'setupdate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') {
                    return row.subGroup == 'P1' ? dateFormat(data) : '';
                }
                return data;
            },
        },
        { data: 'subGroup', className: 'border border-slate-200 text-center!' },
        {
            data: 'workId',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'ncProgramDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'feeder1StartDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'feeder1FinishDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'feeder2StartDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'feeder2FinishDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'subAssyStartDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'subAssyFinishDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'paintDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'assyDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'inspectionDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
        {
            data: 'packingDate',
            className: 'border border-slate-200 text-center!',
            render: (data, type, row) => {
                if (type == 'display') return dateFormat(data);
                return data;
            },
        },
    ];
    // opt.initComplete = function (...args) {
    //     tableOption.initComplete.apply(this, args);
    // };
    table = await createTable(opt);
}

async function getSchedule() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/calendar/generate`,
            method: 'POST',
            dataType: 'json',
            data: {
                year: 2026,
                startMonth: 4,
                startId: 20260312,
            },
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                reject(err);
            },
        });
    });
}

async function getActualSchedule() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/calendar/range`,
            method: 'POST',
            dataType: 'json',
            data: {
                sdate: 20260101,
                edate: 20270501,
            },
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                reject(err);
            },
        });
    });
}

const countDate = (start, end) => {
    const d = calendarData.filter(
        (item) => item.WORKID > start && item.WORKID <= end,
    );
    const diffDays = d.length;
    return diffDays;
};

const LastP1 = (data, sdate) => {
    // const d = data
    //     .sort((a, b) => b.workId - a.workId)
    //     .filter((item) => item.subGroup == 'P1' && item.workId < sdate);
    // if (d.length > 0) return d[0].workId;

    // const lastWorkId = calendarData
    //     .sort((a, b) => b.WORKID - a.WORKID)
    //     .filter((item) => item.PRIORITY == 'P1' && item.WORKID < sdate);
    // if (lastWorkId.length > 0) return lastWorkId[0].WORKID;
    const maxId = (list, idKey, groupKey) =>
        list.reduce(
            (max, item) =>
                item[groupKey] == 'P1' && // 1. ต้องเป็นกลุ่ม P1
                item[idKey] < sdate && // 2. ต้องอยู่ก่อนหน้า record ปัจจุบัน
                item[idKey] > max // 3. ต้องใหม่ที่สุดในบรรดาที่เข้าเงื่อนไข 1,2
                    ? item[idKey]
                    : max,
            null,
        );
    return (
        maxId(data, 'workId', 'subGroup') ??
        maxId(calendarData, 'WORKID', 'PRIORITY')
    );
};

async function MapData(data) {
    return data.map((item) => ({
        workingDays: countDate(item.workId, item.packingDate),
        setupdate: LastP1(data, item.workId),
        workId: item.workId,
        schdMfg: item.schdMfg,
        subGroup: item.subGroup,
        ncProgramDate: item.ncProgramDate,
        feeder1StartDate: item.feeder1StartDate,
        feeder1FinishDate: item.feeder1FinishDate,
        feeder2StartDate: item.feeder2StartDate,
        feeder2FinishDate: item.feeder2FinishDate,
        subAssyStartDate: item.subAssyStartDate,
        subAssyFinishDate: item.subAssyFinishDate,
        paintDate: item.paintDate,
        assyDate: item.assyDate,
        inspectionDate: item.inspectionDate,
        packingDate: item.packingDate,
    }));
}

$(document).on('click', '#export-button', async function () {
    try {
        const dateFormat = (value) => {
            const valueString = String(value ?? '');
            const compactDate = /^(\d{4})(\d{2})(\d{2})$/.exec(valueString);
            const dateString = compactDate
                ? `${compactDate[1]}-${compactDate[2]}-${compactDate[3]}`
                : valueString;
            return dayjs(dateString, 'YYYY-MM-DD', true);
        };

        const template = await getTemplate(
            'PS/PS-JUN/export-templates/master-plan.xlsx',
        );
        const data = table.rows({ search: 'applied' }).data().toArray();

        const toDateColumn = [
            'workId',
            'ncProgramDate',
            'feeder1StartDate',
            'feeder1FinishDate',
            'feeder2StartDate',
            'feeder2FinishDate',
            'subAssyStartDate',
            'subAssyFinishDate',
            'paintDate',
            'assyDate',
            'inspectionDate',
            'packingDate',
        ];
        const result = data.map((item) => {
            // const schd = item.SCHDNUMBER.substring(6, 7);
            toDateColumn.forEach((col) => {
                item[col] = dateFormat(item[col]);
            });
            return {
                ...item,
                schdMfg: item.subGroup == 'P1' ? item.schdMfg : '',
            };
        });
        await exportExcel(result, template, {
            filename: `AMEC Manufacturing Master Schedule For Production.xlsx`,
            rowstart: 6,
        });
    } catch (error) {
        console.error('Failed to export data:', error);
    }
});
