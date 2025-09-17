function handleClassList(num) {
    return num % 2 === 0 ? "bg-base-200" : "bg-white";
}

function shortName(name){
    const clean = name.replace(/\s+/g, ' ').trim().split(' ');
    return clean[0] + ' ' + clean[1][0] + '.';
}

function shortSec(sec){
    const clean = sec.replace(/\s+/g, ' ').trim().split(' ');
    return clean[0];
}

function finishAndClose() {
  // set ค่าใน localStorage เพื่อ trigger main
  console.log('test');
  
  localStorage.setItem("triggerReload", Date.now());
  window.close();
}
export {handleClassList, shortName, shortSec, finishAndClose};