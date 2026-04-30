import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { webflowSubmit } from "@amec/webasset/components/form";
import { logFormData, requiredForm, showMessage } from "@amec/webasset/utils";


$(async function ()  {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const empno =  urlParams.get("empno");
    $('#INPUTBY').val(empno);
    
    /*const empData = await getEmpData(empno);
    $('#INPUTBY').val(empno +'_'+ empData.SNAME);
    $("#empDept").val(empData.SSEC + '/'  + empData.SDEPT + '/' + empData.SDIV);
    $("#empPos").val(empData.SPOSITION);*/
    

    const purpose = await getData();
    console.log(purpose);
    const Purposedata = purpose.map((a) => {
        const otherSelect = `<input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1"
                            id="otherSelect" name="otherSelect" placeholder="Please specify other purpose" disabled>`;

        return `<label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="purpose" 
                                    class="radio radio-xs rounded border-base-content [--chkbg:var(--bc)] [--chkfg:var(--b1)] req" value="${a.PURPOSE_ID}"
                                    id="purpose_${a.PURPOSE_ID}">
                                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                                ${a.PURPOSE_ID == 4 ? otherSelect : "" }
                            </label>`
        
        
        
        
        }).join("");
    
    $('#purposeList').html(Purposedata);

    const action = webflowSubmit({request:true});
    $("#sentRequest").html(action);
});

$(document).on("change", "input[name='purpose']", async function () {

            const purposeSelected = $(`input[name="purpose"]:checked`).val();
            console.log(purposeSelected);
            if(purposeSelected  == 4) {
                console.log("other selected");
                $('#otherSelect').attr("disabled", false);
                /*$('#otherSize').attr("disabled", false);
                $('#otherQty').attr("disabled", false);
                $('#otherRemark').attr("disabled", false);*/
            }  else {
                console.log("1");
                $('#otherSelect').attr("disabled", true);
                /*$('#otherSize').attr("disabled", true);
                $('#otherQty').attr("disabled", true);
                $('#otherRemark').attr("disabled", true);*/

            }
});

$(document).on("click", "#btnRequest", async function () {
    try {
        const requiredMessage = [{element: $('#empName'), message: 'Please fill the Name'}, {element: $('#empCode'), message: 'Please fill the Emp Code'}, 
            {element: $('#empDept'), message: 'Please fill the SECT/DEPT/DIV'}, {element: $('#empPos'), message: 'Please fill the Position'},
            {element: $('#purposeList input[name="purpose"]'), message: 'Please select the Purpose'}];
        if(!(await requiredForm(`#rbForm`, requiredMessage))) 
            return;

        
        const formData = new FormData($(`#rbForm`)[0]);
        logFormData(formData);
        const res = await createForm(formData);
        console.log(res);

    }catch (error) {
        console.log(error);
        showMessage(error.message);
    }
});

$(document).on("change", "#REQBY", async function () {
    const REQBY = $(this).val();  
    const empData = await getEmpData(REQBY);
    $("#empName").val(empData.STNAME);
    $("#empDept").val(empData.SSEC + '/'  + empData.SDEPT + '/' + empData.SDIV);
    $("#empPos").val(empData.SPOSITION);
    const divTxt = `<span id="divText" class="origin-center whitespace-nowrap inline-block transition-transform duration-300">${empData.SDIV}</span>`
    $('#divisionDisplay').html(divTxt);
});

$(document).on("change", "#radioStandard, #radioOther", async function () {
    const isStandard = $('#radioStandard').is(':checked');
    if (isStandard) {
        $('#standardStampSection').css({'opacity': '1', 'pointer-events': 'auto'}).find('input').prop('disabled', false);
        $('#otherStampSection').css({'opacity': '0.4', 'pointer-events': 'none'}).find('input').prop('disabled', true);
    } else {
        $('#standardStampSection').css({'opacity': '0.4', 'pointer-events': 'none'}).find('input').prop('disabled', true);
        $('#otherStampSection').css({'opacity': '1', 'pointer-events': 'auto'}).find('input').prop('disabled', false);
    }
});

$(document).on("change", "#nameInput1, #nameInput2", async function () {
    const name1 = $('#nameInput1').val().trim();
    const name2 = $('#nameInput2').val().trim();
    if (name1) {
        
    }
});

async function getData() {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-rb`,
        method: "GET",
    });
}

async function getEmpData(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: "GET",          
        
    });
}

async function createForm(data) {
    return fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-rb`,
        method: "POST",
        data: data,
    });
}




            


        // ✅ 2. ฟังก์ชันจัดการตรายาง (ย่อขนาด, เปลี่ยนข้อความ, ไฮไลท์และ Disable ช่อง)
        document.addEventListener('DOMContentLoaded', () => {
            
            function adjustTextScale(displayId, circleId) {
                const displayEl = document.getElementById(displayId);
                const circleEl = document.getElementById(circleId);
                if (!displayEl || !circleEl) return;

                let circleWidth = 70;
                if (circleEl.style.width) {
                    circleWidth = parseInt(circleEl.style.width, 10);
                }

                const maxSafeWidth = circleWidth * 0.75; 

                displayEl.style.transform = 'none';
                displayEl.style.letterSpacing = 'normal';

                const actualWidth = displayEl.scrollWidth;
                
                if (actualWidth > maxSafeWidth && actualWidth > 0) {
                    const scaleRatio = maxSafeWidth / actualWidth;
                    displayEl.style.letterSpacing = '-0.5px'; 
                    displayEl.style.transform = `scaleX(${scaleRatio})`;
                }
            }

            function updateStampName(inputId, targetDisplayId, targetCircleId) {
                const inputElement = document.getElementById(inputId);
                const displayElement = document.getElementById(targetDisplayId);
                
                if (inputElement && displayElement) {
                    inputElement.addEventListener('input', function() {
                        let fullName = this.value.trim();
                        let firstName = fullName.split(/\s+/)[0]; 
                        displayElement.textContent = firstName ? firstName.toUpperCase() : 'NAME';
                        adjustTextScale(targetDisplayId, targetCircleId);
                    });
                }
            }

            updateStampName('nameInput1', 'name', 'stampCircle1');
            updateStampName('nameInput2', 'name2', 'stampCircle2');

            

            const stampConfig = {
                'chkP': { size: 88, target: 'stampCircle1' }, 
                'chkGM': { size: 84, target: 'stampCircle1' }, 
                'chkDIM': { size: 84, target: 'stampCircle1' }, 
                'chkDDIM': { size: 84, target: 'stampCircle1' },
                'chkDEM': { size: 76, target: 'stampCircle1' }, 
                'chkDDEM': { size: 76, target: 'stampCircle1' },
                'chkADV': { size: 76, target: 'stampCircle1' }, 
                'chkSSPE': { size: 76, target: 'stampCircle1' },
                'chkSEM': { size: 68, target: 'stampCircle1' }, 
                'chkSPE': { size: 68, target: 'stampCircle1' }, 
                'chkASM': { size: 60, target: 'stampCircle2' }, 
                'chkSUP': { size: 60, target: 'stampCircle2' }, 
                'chkFO': { size: 60, target: 'stampCircle2' }, 
                'chkLEA': { size: 60, target: 'stampCircle2' }, 
                'chkENG': { size: 60, target: 'stampCircle2' }, 
                'chkSTAFF': { size: 60, target: 'stampCircle2' } 
            };

            const formatCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="chk"]');
            
            // ดึง Element ของ Input ทั้งสองแถวมาเตรียมไว้
            const inputRow1 = document.getElementById('nameInput1');
            const inputRow2Name = document.getElementById('nameInput2');

            formatCheckboxes.forEach(cb => {
                cb.addEventListener('change', function() {
                    if (this.checked) {
                        formatCheckboxes.forEach(otherCb => {
                            if (otherCb !== this) otherCb.checked = false;
                        });

                        const settings = stampConfig[this.id];
                        if (settings) {
                            const targetCircle = document.getElementById(settings.target);
                            if (targetCircle) {
                                targetCircle.style.width = settings.size + 'px';
                                targetCircle.style.height = settings.size + 'px';

                                // 🔥 ไฮไลท์ตรายาง พร้อมปิดช่อง Input ที่ไม่ได้ใช้ (Disable)
                                if (settings.target === 'stampCircle1') {
                                    document.getElementById('rowStamp1').style.opacity = '1';
                                    document.getElementById('rowStamp2').style.opacity = '0.3';
                                    document.getElementById('stampCircle2').style.width = '70px';
                                    document.getElementById('stampCircle2').style.height = '70px';
                                    
                                    // เปิดแถว 1, ปิดแถว 2
                                    if(inputRow1) inputRow1.disabled = false;
                                    if(inputRow2Name) inputRow2Name.disabled = true;

                                } else {
                                    document.getElementById('rowStamp1').style.opacity = '0.3';
                                    document.getElementById('rowStamp2').style.opacity = '1';
                                    document.getElementById('stampCircle1').style.width = '70px';
                                    document.getElementById('stampCircle1').style.height = '70px';
                                    
                                    // ปิดแถว 1, เปิดแถว 2
                                    if(inputRow1) inputRow1.disabled = true;
                                    if(inputRow2Name) inputRow2Name.disabled = false;
                                }
                                
                                setTimeout(() => {
                                    adjustTextScale('name', 'stampCircle1');
                                    adjustTextScale('name2', 'stampCircle2');
                                    adjustTextScale('divText', 'stampCircle2');
                                }, 10);
                            }
                        }
                    } else {
                        document.getElementById('rowStamp1').style.opacity = '1';
                        document.getElementById('rowStamp2').style.opacity = '1';
                        
                        document.getElementById('stampCircle1').style.width = '';
                        document.getElementById('stampCircle1').style.height = '';
                        document.getElementById('stampCircle2').style.width = '';
                        document.getElementById('stampCircle2').style.height = '';

                        // เมื่อยกเลิกการเลือก ให้เปิดคืนทุกช่อง
                        if(inputRow1) inputRow1.disabled = false;
                        if(inputRow2Name) inputRow2Name.disabled = false;

                        setTimeout(() => {
                            adjustTextScale('name', 'stampCircle1');
                            adjustTextScale('name2', 'stampCircle2');
                            adjustTextScale('divText', 'stampCircle2');
                        }, 10);
                    }
                });
            });
        });


        // ✅ 3. ฟังก์ชันจับคู่ Position เข้ากับ Checkbox อัตโนมัติ
        document.addEventListener('DOMContentLoaded', () => {
            const positionMapping = {
                'PRESIDENT': 'chkP',
                'GENERAL MANAGER': 'chkGM',
                'DIVISION MANAGER': 'chkDIM', 
                'DEPUTY DIVISION MANAGER': 'chkDDIM',
                'DEPARTMENT MANAGER': 'chkDEM', 
                'DEPUTY DEPARTMENT MANAGER': 'chkDDEM',
                'ADVISOR': 'chkADV',
                'SENIOR SPECIALIST': 'chkSSPE',
                'SECTION MANAGER': 'chkSEM', 
                'SPECIALIST': 'chkSPE',
                'ASSISTANT MANAGER': 'chkASM', 
                'SUPERVISOR': 'chkSUP',
                'FOREMAN': 'chkFO',
                'LEADER': 'chkLEA', 
                'ENGINEER': 'chkENG',
                'STAFF': 'chkSTAFF'
            };

            const empPosInput = document.getElementById('empPos');

            function triggerPositionMap() {
                if (!empPosInput) return;
                const typedPosition = empPosInput.value.trim().toUpperCase();

                if (positionMapping[typedPosition]) {
                    const targetCheckboxId = positionMapping[typedPosition];
                    const targetCheckbox = document.getElementById(targetCheckboxId);

                    if (targetCheckbox && !targetCheckbox.checked) {
                        targetCheckbox.click();
                    }
                }
            }

            if (empPosInput) {
                ['input', 'change'].forEach(evt => {
                    empPosInput.addEventListener(evt, triggerPositionMap);
                });
            }

            if (empPosInput) {
                const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
                Object.defineProperty(empPosInput, 'value', {
                    set: function(v) {
                        descriptor.set.call(this, v); 
                        triggerPositionMap(); 
                    },
                    get: function() {
                        return descriptor.get.call(this);
                    }
                });
            }
        });
  