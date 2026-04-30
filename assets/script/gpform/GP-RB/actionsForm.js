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
            }  else {
                console.log("1");
                $('#otherSelect').attr("disabled", true);

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
    $("#divText").val(empData.SDIV);

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