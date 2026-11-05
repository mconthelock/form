import { createTable } from '@amec/webasset/dataTable';
import { dayOff, getDayOff, setDatePicker } from '@amec/webasset/flatpickr';
import { redirectWebflow } from '@amec/webasset/form';
import { showMessage } from '@amec/webasset/utils';
import ExcelJS from 'exceljs';
import { createFEOTForm, deletedataOT, getdatOT, updatedataOT } from './data';
import { data } from 'jquery';

var mockupTable;
var editingRow,
    editingOriginal = null;
var isLoadingOTForEdit = false;
//main
$(async function () {
    try {
        mockupTable = await createTable(
            {
                responsive: false,
                data: [],
                columns: [
                    { data: 'SEMPNO', title: 'Employee No.' },
                    { data: 'WORKDATE', title: 'Date' },
                    { data: 'WORKTIMEIN', title: 'Time In' },
                    { data: 'WORKTIMEOUT', title: 'Time Out' },
                    { data: 'WORKHOURS', title: 'Hour' },
                    { data: 'WORKDESC', title: 'Detail' },
                    { data: 'WORKTYPE', title: 'Type' },
                    {
                        data: null,
                        title: 'Action',
                        orderable: false,
                        searchable: false,
                        className: 'whitespace-nowrap',
                        render: () => `
                    <button
                        type="button"
                        class="edit-expense btn btn-sm btn-info btn-outline btn-square btn-edit-ot"
                        aria-label="Edit expense"
                        title="Edit expense">
                        <i class="fi fi-rr-pencil"></i>
                    </button>
                    <button
                        type="button"
                        class="delete-expense btn btn-sm btn-error btn-outline btn-square btn-delete-ot"
                        aria-label="Delete expense"
                        title="Delete expense">
                        <i class="fi fi-rr-trash"></i>
                    </button>
                `,
                    },
                ],
            },
            {
                id: '#tableOT',
                domScroll: {
                    status: true,
                },
            },
        );

        const displayMonth = getOTDisplayMonth();
        const lastDayOfDisplayMonth = new Date(
            displayMonth.getFullYear(),
            displayMonth.getMonth() + 1,
            0,
        );
        setDatePicker({
            element: '#calendarOT',
            dayOff: true,
            dayOffSelected: true,
            minDate: displayMonth,
            maxDate: lastDayOfDisplayMonth,

            onDayCreate: (_, __, instance, dayElement) => {
                const workDates = getOTWorkDates();
                const dateKey = instance.formatDate(
                    dayElement.dateObj,
                    'Y-m-d',
                );

                if (!workDates.has(dateKey)) return;

                dayElement.classList.add('has-ot');
                dayElement.title = 'มีรายการ OT';

                const marker = document.createElement('span');
                marker.style.cssText = `
                    position: absolute;
                    bottom: 3px;
                    left: 50%;
                    width: 5px;
                    height: 5px;
                    border-radius: 9999px;
                    background: #2563eb;
                    transform: translateX(-50%);
                `;

                dayElement.style.position = 'relative';
                dayElement.appendChild(marker);
            },

            onReady: (_, __, instance) => {
                instance.jumpToDate(displayMonth);
                $('#PLANYEAR').val(instance.currentYear);
                $('#PLANMONTH').val(instance.currentMonth + 1);

                const monthFromCalendar = new Date(
                    instance.currentYear,
                    instance.currentMonth,
                    1,
                );

                document.querySelector('#monthOT').textContent =
                    new Intl.DateTimeFormat('en-US', {
                        month: 'long',
                        year: 'numeric',
                    }).format(monthFromCalendar);
            },

            onChange: async (_, dateKey) => {
                if (isLoadingOTForEdit || !dateKey) return;

                const rowIndex = mockupTable
                    .rows()
                    .indexes()
                    .toArray()
                    .find(
                        (index) =>
                            String(
                                mockupTable.row(index).data().WORKDATE ?? '',
                            ).slice(0, 10) === dateKey,
                    );

                if (rowIndex !== undefined) {
                    await loadOTForEdit(mockupTable.row(rowIndex));
                }
            },
        });

        setDatePicker({
            element: '#timeIN, #timeOUT',
            time: true,
        });
    } catch (error) {}
});

function refreshOTCalendar() {
    document.querySelector('#calendarOT')._flatpickr?.redraw();
}

function getOTWorkDates() {
    return new Set(
        mockupTable
            .rows()
            .data()
            .toArray()
            .map((row) => String(row.WORKDATE ?? '').slice(0, 10))
            .filter(Boolean),
    );
}

// logic for display date ot
function getOTDisplayMonth(today = new Date()) {
    const holidays = new Set(getDayOff()?.value ?? []);

    const dateKey = (date) =>
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    const isWorkingDay = (date) =>
        ![0, 6].includes(date.getDay()) && !holidays.has(dateKey(date));

    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let fifthLastWorkday;
    let workdayCount = 0;

    for (
        const date = new Date(lastDay);
        workdayCount < 5;
        date.setDate(date.getDate() - 1)
    ) {
        if (isWorkingDay(date)) {
            workdayCount += 1;

            if (workdayCount === 5) {
                fifthLastWorkday = new Date(date);
            }
        }
    }

    const targetMonthOffset = today >= fifthLastWorkday ? 2 : 1;

    return new Date(
        today.getFullYear(),
        today.getMonth() + targetMonthOffset,
        1,
    );
}

// ฟังก์ชันคำนวณหาจำนวนชั่วโมง
async function calculateHours(timeIn, timeOut) {
    // ป้องกันกรณีที่ผู้ใช้ยังไม่ได้กรอกเวลา
    if (!timeIn || !timeOut) return 0;

    // แยกชั่วโมงและนาทีออกจากกัน แล้วแปลงเป็นตัวเลข
    let [inHour, inMin] = timeIn.split(':').map(Number);
    let [outHour, outMin] = timeOut.split(':').map(Number);

    // แปลงเวลาทั้งหมดให้เป็น "นาที" นับจาก 00:00
    let totalInMinutes = inHour * 60 + inMin;
    let totalOutMinutes = outHour * 60 + outMin;

    // หาผลต่าง (นาที)
    let diffMinutes = totalOutMinutes - totalInMinutes;

    // กรณีทำงานข้ามวัน (เช่น เข้า 22:00 ออก 02:00) ค่าจะติดลบ ให้บวกเพิ่ม 24 ชม. (1440 นาที)
    if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
    }

    // แปลงกลับเป็นชั่วโมงแบบทศนิยม (เช่น 8 ชั่วโมง 30 นาที = 8.5)
    return diffMinutes / 60;
}

function toMinutes(time) {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
}

function isTimeInRange(timeIn, timeOut, start, end) {
    let inMinute = toMinutes(timeIn);
    let outMinute = toMinutes(timeOut);
    const startMinute = toMinutes(start);
    let endMinute = toMinutes(end);

    // ช่วงเวลาที่ข้ามวัน เช่น 20:00 - 05:00 หรือ 17:30 - 00:00
    if (endMinute <= startMinute) {
        endMinute += 24 * 60;
    }

    if (outMinute <= inMinute) {
        outMinute += 24 * 60;
    }

    return inMinute >= startMinute && outMinute <= endMinute;
}

function isHolidayOT(workDate) {
    const [year, month, day] = workDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const dayOfWeek = selectedDate.getDay();

    // วันเสาร์ / วันอาทิตย์
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return true;
    }

    // วันหยุดบริษัทจาก calendarOT
    const holidays = getDayOff()?.value ?? [];
    const dateKey = `${year}-${month}-${day}`;

    return holidays.includes(dateKey);
}

async function getOTType(workDate, timeIn, timeOut) {
    if (!workDate || !timeIn || !timeOut) {
        return null;
    }

    const isHoliday = isHolidayOT(workDate);

    if (!isHoliday) {
        // จ.-ศ. = Type 1.5
        const weekdayRanges = [
            ['00:00', '08:00'],
            ['17:30', '00:00'],
            ['05:30', '12:00'],
            ['17:10', '00:00'],
        ];

        return weekdayRanges.some(([start, end]) =>
            isTimeInRange(timeIn, timeOut, start, end),
        )
            ? '1.5'
            : null;
    }

    // ส.-อา. หรือวันหยุดบริษัท = Type 1.3
    const type13Ranges = [
        ['08:00', '17:00'],
        ['20:00', '05:00'],
    ];

    if (
        type13Ranges.some(([start, end]) =>
            isTimeInRange(timeIn, timeOut, start, end),
        )
    ) {
        return '1.3';
    }

    // เวลานอก Type 1.3 ในวันหยุด = Type 3
    const type3Ranges = [
        ['00:00', '08:00'],
        ['17:10', '00:00'],
        ['05:10', '12:00'],
        ['12:00', '20:00'],
    ];

    return type3Ranges.some(([start, end]) =>
        isTimeInRange(timeIn, timeOut, start, end),
    )
        ? '3'
        : null;
}

//download FE-OT template file
$(document).on('click', '#templateOT', async function (e) {
    e.preventDefault();
    const fileUrl = `${process.env.APP_ENV}/assets/files/FE-OT_template/FE-OT_template.xlsx`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'FE-OT_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

function formatExcelDate(value) {
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return String(value ?? '').trim();
}

function formatExcelTime(value) {
    if (typeof value === 'number') {
        const minutes = Math.round(value * 24 * 60) % (24 * 60);
        const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
        const minute = String(minutes % 60).padStart(2, '0');
        return `${hour}:${minute}`;
    }

    if (value instanceof Date) {
        const hour = String(value.getUTCHours()).padStart(2, '0');
        const minute = String(value.getUTCMinutes()).padStart(2, '0');

        return `${hour}:${minute}`;
    }

    return String(value ?? '').trim();
}

// upload file excel and save to database and bring to tableOT
$(document).on('change', '#uploadFile', async function () {
    try {
        const file = $('#uploadFile')[0].files[0];

        if (file) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await file.arrayBuffer());

            const worksheet = workbook.worksheets[0];
            const uploadedRows = [];
            for (
                let rowNumber = 4;
                rowNumber <= worksheet.rowCount;
                rowNumber++
            ) {
                const row = worksheet.getRow(rowNumber);

                const empNo = String(row.getCell(2).value ?? '').trim();
                const workDate = formatExcelDate(row.getCell(3).value);
                const timeIn = formatExcelTime(row.getCell(4).value);
                const timeOut = formatExcelTime(row.getCell(5).value);
                const detail = formatExcelTime(row.getCell(6).value);

                // ข้ามแถวว่าง
                if (!empNo && !workDate && !timeIn && !timeOut) continue;

                const date = new Date(`${workDate}T00:00:00`);
                // const planyear = date.getFullYear();
                // const planmonth = date.getMonth() + 1 ;
                const otHour = await calculateHours(timeIn, timeOut);
                const otType = await getOTType(workDate, timeIn, timeOut);

                const dataOT = {
                    PLANYEAR: date.getFullYear(),
                    PLANMONTH: date.getMonth() + 1,
                    SEMPNO: empNo,
                    WORKDATE: workDate,
                    WORKTIMEIN: timeIn,
                    WORKTIMEOUT: timeOut,
                    WORKHOURS: otHour.toFixed(2),
                    WORKTYPE: otType,
                    CSTATUS: 'A',
                    WORKDESC: detail,
                };

                const res = await createFEOTForm(dataOT);

                uploadedRows.push(dataOT);

                if (res.status == true) {
                    showMessage(res.message, 'success');
                } else {
                    throw new Error(res.message);
                }
            }
            // const getDataotfile = await getdatOT(planyear, planmonth, empNo);
            mockupTable.rows.add(uploadedRows).draw(false);
            refreshOTSummary();
            refreshOTCalendar();

            $('#uploadFile').val('');
        }
    } catch (error) {
        console.log(error);
    }
});

// save/update form to database and bring to tableOT
$(document).on('click', '#saveOT', async function (e) {
    e.preventDefault();
    try {
        const workDate = $('#calendarOT').val();
        const tIn = $('#timeIN').val();
        const tOut = $('#timeOUT').val();
        const otHour = await calculateHours(tIn, tOut);
        const otType = await getOTType(workDate, tIn, tOut);
        $('#OTHour').val(otHour.toFixed(2));
        $('#OTType').val(otType);
        console.log('OT Data:', {
            planMonth: $('#PLANMONTH').val(),
            planYear: $('#PLANYEAR').val(),
            empNo: $('#empNo').val(),
            calendarOT: $('#calendarOT').val(),
            timeIn: $('#timeIN').val(),
            timeOut: $('#timeOUT').val(),
            otHour: otHour.toFixed(2),
            detail: $('#deTail').val(),
            otType: otType,
        });
        const dataOT = {
            PLANYEAR: $('#PLANYEAR').val(),
            PLANMONTH: $('#PLANMONTH').val(),
            SEMPNO: $('#empNo').val(),
            WORKDATE: $('#calendarOT').val(),
            WORKTIMEIN: $('#timeIN').val(),
            WORKTIMEOUT: $('#timeOUT').val(),
            WORKHOURS: $('#OTHour').val(),
            WORKTYPE: $('#OTType').val(),
            CSTATUS: editingRow ? 'U' : 'A',
            WORKDESC: $('#deTail').val(),
        };
        let res;

        if (editingRow) {
            res = await updatedataOT({
                ...dataOT,

                // API update ต้องใช้ key เดิมเพื่อหา record
                OLD_PLANYEAR: editingOriginal.PLANYEAR,
                OLD_PLANMONTH: editingOriginal.PLANMONTH,
                OLD_SEMPNO: editingOriginal.SEMPNO,
                OLD_WORKDATE: editingOriginal.WORKDATE,
            });
        } else {
            res = await createFEOTForm(dataOT);
        }
        // const res = await createFEOTForm(dataOT);

        // mockupTable.row.add(dataOT).draw(false);

        if (res.status == true) {
            if (editingRow) {
                editingRow.data(dataOT).draw(false);
                editingRow = null;
                editingOriginal = null;
                $('#saveOT').text('Save OT');
            } else {
                mockupTable.row.add(dataOT).draw(false);
            }
            showMessage(res.message, 'success');
            const currentEmpNo = $('#empNo').val();
            $('#OTform')[0].reset();
            $('#empNo').val(currentEmpNo);
            document.querySelector('#calendarOT')._flatpickr?.clear();
            document.querySelector('#timeIN')._flatpickr?.clear();
            document.querySelector('#timeOUT')._flatpickr?.clear();
            refreshOTSummary();
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        console.log(error);
    }
});

// กด Delete: ลบแถวออกจากตาราง
$(document).on('click', '.btn-delete-ot', async function () {
    const row = mockupTable.row($(this).closest('tr'));
    const dataOT = row.data();

    const confirmed = confirm(
        `ต้องการลบ OT ของพนักงาน ${dataOT.SEMPNO} วันที่ ${dataOT.WORKDATE} ใช่หรือไม่?`,
    );

    if (!confirmed) return;

    try {
        const res = await deletedataOT(
            dataOT.PLANYEAR,
            dataOT.PLANMONTH,
            dataOT.SEMPNO,
            dataOT.WORKDATE,
        );
        if (res.status == true) {
            showMessage(res.message, 'success');
        } else {
            throw new Error(res.message);
        }
        row.remove().draw(false);
        refreshOTSummary();
    } catch (error) {
        console.error(error);
        showMessage(error.message || 'ลบข้อมูลไม่สำเร็จ', 'error');
    }
});

// get hour and ot type
async function refreshOTCalculation() {
    const workDate = $('#calendarOT').val();
    const timeIn = $('#timeIN').val();
    const timeOut = $('#timeOUT').val();

    if (!workDate || !timeIn || !timeOut) {
        $('#OTHour').val('');
        $('#OTType').val('');
        return;
    }

    const otHour = await calculateHours(timeIn, timeOut);
    const otType = await getOTType(workDate, timeIn, timeOut);

    $('#OTHour').val(otHour.toFixed(2));
    $('#OTType').val(otType ?? '');
}

// sum hour with ot type
function refreshOTSummary() {
    const totals = {
        bronze: 0, // Type 1.3
        silver: 0, // Type 1.5
        gold: 0, // Type 3
    };

    mockupTable
        .rows()
        .data()
        .toArray()
        .forEach((row) => {
            const hour = Number.parseFloat(row.WORKHOURS);
            const type = Number.parseFloat(row.WORKTYPE);

            if (!Number.isFinite(hour)) return;

            if (type === 1.3) totals.bronze += hour;
            if (type === 1.5) totals.silver += hour;
            if (type === 3) totals.gold += hour;
        });

    $('#bronze').text(totals.bronze.toFixed(2));
    $('#silver').text(totals.silver.toFixed(2));
    $('#gold').text(totals.gold.toFixed(2));
}

async function loadOTForEdit(row) {
    editingRow = row;
    const dataOT = editingRow.data();

    editingOriginal = {
        PLANYEAR: dataOT.PLANYEAR,
        PLANMONTH: dataOT.PLANMONTH,
        SEMPNO: dataOT.SEMPNO,
        WORKDATE: dataOT.WORKDATE,
    };

    $('#PLANYEAR').val(dataOT.PLANYEAR);
    $('#PLANMONTH').val(dataOT.PLANMONTH);
    $('#empNo').val(dataOT.SEMPNO);

    const calendar = document.querySelector('#calendarOT')._flatpickr;

    if (calendar) {
        // ป้องกัน onChange เรียกซ้ำจากการ setDate ในโหมด Edit
        isLoadingOTForEdit = true;
        calendar.setDate(dataOT.WORKDATE, true, 'Y-m-d');
        isLoadingOTForEdit = false;
    } else {
        $('#calendarOT').val(dataOT.WORKDATE);
    }

    const timeInPicker = document.querySelector('#timeIN')._flatpickr;
    const timeOutPicker = document.querySelector('#timeOUT')._flatpickr;

    if (timeInPicker) {
        timeInPicker.setDate(dataOT.WORKTIMEIN, true, 'H:i');
    } else {
        $('#timeIN').val(dataOT.WORKTIMEIN);
    }

    if (timeOutPicker) {
        timeOutPicker.setDate(dataOT.WORKTIMEOUT, true, 'H:i');
    } else {
        $('#timeOUT').val(dataOT.WORKTIMEOUT);
    }

    $('#deTail').val(dataOT.WORKDESC);

    await refreshOTCalculation();

    $('#saveOT').text('Update OT');
}

// กด Edit: นำข้อมูลแถวนั้นกลับไปแสดงในฟอร์ม
$(document).on('click', '.btn-edit-ot', async function () {
    await loadOTForEdit(mockupTable.row($(this).closest('tr')));
});
