import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { webflowSubmit } from "@amec/webasset/components/form";
import { logFormData, requiredForm, showMessage } from "@amec/webasset/utils";


$(async function ()  {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const empno =  urlParams.get("empno");
    /*$('#inputBy').val(empno);*/
    
    const empData = await getEmpData(empno);
    $('#inputBy').val(empno +'_'+ empData.SNAME);
    /*$("#empDept").val(empData.SSEC + '/'  + empData.SDEPT + '/' + empData.SDIV);
    $("#empPos").val(empData.SPOSITION);*/
    

    const purpose = await getData();
    console.log(purpose);
    const Purposedata = purpose.map((a) => {
        return `<label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="purpose" value="replace"
                                    class="radio radio-xs rounded border-base-content [--chkbg:var(--bc)] [--chkfg:var(--b1)] req" value=""${a.PURPOSE_ID}
                                    id="purpose_${a.PURPOSE_ID}">
                                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                            </label>`
        }).join("");
    console.log(Purposedata);
    $('#purposeList').html(Purposedata);

    const action = webflowSubmit({request:true});
    console.log(action);
    $("#sentRequest").html(action);
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

$(document).on("change", "#reqCode", async function () {
    const reqCode = $(this).val();  
    const empData = await getEmpData(reqCode);
    $("#empName").val(empData.STNAME);
    $("#empDept").val(empData.SSEC + '/'  + empData.SDEPT + '/' + empData.SDIV);
    $("#empPos").val(empData.SPOSITION);

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