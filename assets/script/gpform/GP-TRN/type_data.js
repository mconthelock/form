"use strict";

// =======================
// Collect Functions
// =======================
function collectFunctionalForm() {
    return {
        funcTrainingSubject: document.getElementById("funcTrainingSubject")?.value ?? "",
        funcDateFrom: document.getElementById("funcDateFrom")?.value ?? "",
        funcDateTo: document.getElementById("funcDateTo")?.value ?? "",
        funcTimeFromHour: document.getElementById("funcTimeFromHour")?.value ?? "",
        funcTimeFromMin: document.getElementById("funcTimeFromMin")?.value ?? "",
        funcTimeToHour: document.getElementById("funcTimeToHour")?.value ?? "",
        funcTimeToMin: document.getElementById("funcTimeToMin")?.value ?? "",
        funcLocation: document.getElementById("funcLocation")?.value ?? "",
        funcInstitute: document.getElementById("funcInstitute")?.value ?? "",
        funcTraineeCode: document.getElementById("funcTraineeCode")?.value ?? "",
        funcJdName: document.getElementById("funcJdName")?.value ?? "",
        funcJdRelation: document.getElementById("funcJdRelation")?.value ?? "",
        funcAmountInput: document.getElementById("funcAmountInput")?.value ?? "",
        funcAmountNote: document.getElementById("funcAmountNote")?.value ?? "",
        funcExpenseOption: document.querySelector("input[name='funcExpenseOption']:checked")?.value ?? "",
        funcReason: document.getElementById("funcReason")?.value ?? "",
        funcReasonOtherText: document.getElementById("funcReasonOtherText")?.value ?? "",
        funcObjective: Array.from(document.querySelectorAll("input[name='funcObjective[]']"))
            .map(el => el.value)
            .filter(val => val.trim() !== ""),
        funcExpectation: Array.from(document.querySelectorAll("input[name='funcExpectation[]']"))
            .map(el => el.value)
            .filter(val => val.trim() !== ""),
        funcJdFiles: Array.from(document.getElementById("funcJdFiles")?.files ?? []).map(f => f.name),
        funcCompareFiles: Array.from(document.getElementById("funcCompareFiles")?.files ?? []).map(f => f.name),
    };
}
