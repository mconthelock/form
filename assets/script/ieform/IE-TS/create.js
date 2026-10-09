import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';

$(document).ready(async function () {
    flatpickr('#jun', {
        dateFormat: 'm/Y',
        defaultDate: $('#jun').val() || 'today',
        plugins: [
            new monthSelectPlugin({
                shorthand: true, // ใช้ชื่อเดือนย่อ (Jan, Feb)
                dateFormat: 'Y/m',
                altFormat: 'Y/m',
            }),
        ],
    });
});
