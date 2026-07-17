export const stampConfig = {
  chkP: { sizeMm: 22, sizePx: 88, target: "stampCircle1" },
  chkGM: { sizeMm: 21, sizePx: 84, target: "stampCircle1" },
  chkDIM: { sizeMm: 21, sizePx: 84, target: "stampCircle1" },
  chkDDIM: { sizeMm: 21, sizePx: 84, target: "stampCircle1" },
  chkDEM: { sizeMm: 19, sizePx: 76, target: "stampCircle1" },
  chkDDEM: { sizeMm: 19, sizePx: 76, target: "stampCircle1" },
  chkADV: { sizeMm: 19, sizePx: 76, target: "stampCircle1" },
  chkSSPE: { sizeMm: 19, sizePx: 76, target: "stampCircle1" },
  chkSEM: { sizeMm: 17, sizePx: 68, target: "stampCircle1" },
  chkSPE: { sizeMm: 17, sizePx: 68, target: "stampCircle1" },
  chkASM: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
  chkSUP: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
  chkFO: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
  chkLEA: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
  chkENG: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
  chkSTAFF: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
};

export const positionCodeMapping = {
  "02": "chkP",
  "05": "chkGM",
  "10": "chkDIM",
  "11": "chkDDIM",
  "20": "chkDEM",
  "21": "chkDDEM",
  "90": "chkADV",
  "22": "chkSSPE",
  "30": "chkSEM",
  "32": "chkSPE",
  "33": "chkASM",
  "49": "chkSUP",
  "50": "chkFO",
  "55": "chkLEA",
  "35": "chkENG",
  "40": "chkSTAFF",
};

export const targetPosCodeForCircle2 = ["33", "49", "50", "55", "35", "40"];
