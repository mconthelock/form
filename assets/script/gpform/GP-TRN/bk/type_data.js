"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectFunctionalForm = collectFunctionalForm;
// =======================
// Collect Functions
// =======================
function collectFunctionalForm() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
    return {
        funcTrainingSubject: (_b = (_a = document.getElementById("funcTrainingSubject")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "",
        funcDateFrom: (_d = (_c = document.getElementById("funcDateFrom")) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : "",
        funcDateTo: (_f = (_e = document.getElementById("funcDateTo")) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : "",
        funcTimeFromHour: (_h = (_g = document.getElementById("funcTimeFromHour")) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : "",
        funcTimeFromMin: (_k = (_j = document.getElementById("funcTimeFromMin")) === null || _j === void 0 ? void 0 : _j.value) !== null && _k !== void 0 ? _k : "",
        funcTimeToHour: (_m = (_l = document.getElementById("funcTimeToHour")) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : "",
        funcTimeToMin: (_p = (_o = document.getElementById("funcTimeToMin")) === null || _o === void 0 ? void 0 : _o.value) !== null && _p !== void 0 ? _p : "",
        funcLocation: (_r = (_q = document.getElementById("funcLocation")) === null || _q === void 0 ? void 0 : _q.value) !== null && _r !== void 0 ? _r : "",
        funcInstitute: (_t = (_s = document.getElementById("funcInstitute")) === null || _s === void 0 ? void 0 : _s.value) !== null && _t !== void 0 ? _t : "",
        funcTraineeCode: (_v = (_u = document.getElementById("funcTraineeCode")) === null || _u === void 0 ? void 0 : _u.value) !== null && _v !== void 0 ? _v : "",
        funcJdName: (_x = (_w = document.getElementById("funcJdName")) === null || _w === void 0 ? void 0 : _w.value) !== null && _x !== void 0 ? _x : "",
        funcJdRelation: (_z = (_y = document.getElementById("funcJdRelation")) === null || _y === void 0 ? void 0 : _y.value) !== null && _z !== void 0 ? _z : "",
        funcAmountInput: (_1 = (_0 = document.getElementById("funcAmountInput")) === null || _0 === void 0 ? void 0 : _0.value) !== null && _1 !== void 0 ? _1 : "",
        funcAmountNote: (_3 = (_2 = document.getElementById("funcAmountNote")) === null || _2 === void 0 ? void 0 : _2.value) !== null && _3 !== void 0 ? _3 : "",
        funcExpenseOption: (_5 = (_4 = document.querySelector("input[name='funcExpenseOption']:checked")) === null || _4 === void 0 ? void 0 : _4.value) !== null && _5 !== void 0 ? _5 : "",
        funcReason: (_7 = (_6 = document.getElementById("funcReason")) === null || _6 === void 0 ? void 0 : _6.value) !== null && _7 !== void 0 ? _7 : "",
        funcReasonOtherText: (_9 = (_8 = document.getElementById("funcReasonOtherText")) === null || _8 === void 0 ? void 0 : _8.value) !== null && _9 !== void 0 ? _9 : "",
        funcObjective: Array.from(document.querySelectorAll("input[name='funcObjective[]']")).map(el => el.value).filter(val => val.trim() !== ""),
        funcExpectation: Array.from(document.querySelectorAll("input[name='funcExpectation[]']")).map(el => el.value).filter(val => val.trim() !== ""),
        funcJdFiles: Array.from((_11 = (_10 = document.getElementById("funcJdFiles")) === null || _10 === void 0 ? void 0 : _10.files) !== null && _11 !== void 0 ? _11 : []).map(f => f.name),
        funcCompareFiles: Array.from((_13 = (_12 = document.getElementById("funcCompareFiles")) === null || _12 === void 0 ? void 0 : _12.files) !== null && _13 !== void 0 ? _13 : []).map(f => f.name),
    };
}
