// =======================
// Interfaces
// =======================
export interface FunctionalFormPayload {
    NFRMNO: string;
    VORGNO: string;
    CYEAR: string;
    CYEAR2: string;
    NRUNNO: string;
    FID: string;
    funcTrainingSubject: string;
    funcDateFrom: string;
    funcDateTo: string;
    funcTimeFromHour: string;
    funcTimeFromMin: string;
    funcTimeToHour: string;
    funcTimeToMin: string;
    funcLocation: string;
    funcInstitute: string;
    funcTraineeCode: string;
    funcJdName: string;
    funcJdRelation: string;
    funcAmountInput: string;
    funcAmountNote: string;
    funcExpenseOption: string;
    funcReason: string;
    funcReasonOtherText: string;
    funcExpectation: string[];
    funcObjective: string[];
    funcJdFiles : string[];
    funcCompareFiles: string[];
}

// =======================
// Collect Functions
// =======================
export function collectFunctionalForm(): Omit<FunctionalFormPayload, "NFRMNO" | "VORGNO" | "CYEAR" | "CYEAR2" | "NRUNNO" | "FID"> {
    return {
        funcTrainingSubject: (document.getElementById("funcTrainingSubject") as HTMLInputElement)?.value ?? "",
        funcDateFrom: (document.getElementById("funcDateFrom") as HTMLInputElement)?.value ?? "",
        funcDateTo: (document.getElementById("funcDateTo") as HTMLInputElement)?.value ?? "",
        funcTimeFromHour: (document.getElementById("funcTimeFromHour") as HTMLInputElement)?.value ?? "",
        funcTimeFromMin: (document.getElementById("funcTimeFromMin") as HTMLInputElement)?.value ?? "",
        funcTimeToHour: (document.getElementById("funcTimeToHour") as HTMLInputElement)?.value ?? "",
        funcTimeToMin: (document.getElementById("funcTimeToMin") as HTMLInputElement)?.value ?? "",
        funcLocation: (document.getElementById("funcLocation") as HTMLInputElement)?.value ?? "",
        funcInstitute: (document.getElementById("funcInstitute") as HTMLInputElement)?.value ?? "",
        funcTraineeCode: (document.getElementById("funcTraineeCode") as HTMLInputElement)?.value ?? "",
        funcJdName: (document.getElementById("funcJdName") as HTMLInputElement)?.value ?? "",
        funcJdRelation: (document.getElementById("funcJdRelation") as HTMLInputElement)?.value ?? "",
        funcAmountInput: (document.getElementById("funcAmountInput") as HTMLInputElement)?.value ?? "",
        funcAmountNote: (document.getElementById("funcAmountNote") as HTMLInputElement)?.value ?? "",
        funcExpenseOption: (document.querySelector("input[name='funcExpenseOption']:checked") as HTMLInputElement)?.value ?? "",
        funcReason: (document.getElementById("funcReason") as HTMLInputElement)?.value ?? "",
        funcReasonOtherText: (document.getElementById("funcReasonOtherText") as HTMLInputElement)?.value ?? "",
        funcObjective: Array.from(document.querySelectorAll<HTMLInputElement>("input[name='funcObjective[]']")).map(el => el.value).filter(val => val.trim() !== ""),
        funcExpectation: Array.from(document.querySelectorAll<HTMLInputElement>("input[name='funcExpectation[]']")).map(el => el.value).filter(val => val.trim() !== ""),
        funcJdFiles: Array.from((document.getElementById("funcJdFiles") as HTMLInputElement)?.files ?? []).map(f => f.name),
        funcCompareFiles: Array.from((document.getElementById("funcCompareFiles") as HTMLInputElement)?.files ?? []).map(f => f.name),
    };
}
