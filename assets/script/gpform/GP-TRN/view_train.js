"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _form_1 = require("../../inc/_form");
const flatpickr_1 = __importDefault(require("flatpickr"));
require("flatpickr/dist/flatpickr.min.css");
const jquery_1 = __importDefault(require("jquery")); // ✅ บอก TS ว่า $ คือ jQuery
(0, jquery_1.default)(document).ready(async function () {
    (0, flatpickr_1.default)("#start-date", { dateFormat: "Y-m-d" });
    const formData = (0, jquery_1.default)(".form-data").data();
    const { nfrmno, vorgno, cyear, cyear2, nrunno } = formData;
    const flow = await (0, _form_1.showFlow)(nfrmno, vorgno, cyear, cyear2, nrunno);
    (0, jquery_1.default)(".flow").html(flow.html);
});
