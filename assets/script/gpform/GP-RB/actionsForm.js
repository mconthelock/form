import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { webflowSubmit } from "@amec/webasset/components/form";
import { requiredForm, showMessage } from "@amec/webasset/utils";


$(async function ()  {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const empno =  urlParams.get("empno");
    $('#empCode').val(empno);
    
    const empData = await getEmpData(empno);
    $("#empName").val(empData.STNAME);
    $("#empDept").val(empData.SSEC + '/'  + empData.SDEPT + '/' + empData.SDIV);
    $("#empPos").val(empData.SPOSITION);

    const purpose = await getData();
    console.log(purpose);
    const data = purpose.map((a) => {
        return `<label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="purpose" value="replace"
                                    class="radio radio-xs rounded border-base-content [--chkbg:var(--bc)] [--chkfg:var(--b1)]" value=""${a.PURPOSE_ID}>
                                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                            </label>`
        }).join("");
    console.log(data);
    $('#purposeList').html(data);

    const action = webflowSubmit({request:true});
    console.log(action);
    $("#sentRequest").html(action);
});

$(document).on("click", "#btnRequest", async function () {
    try {
        const empName = $('#empName').val();
        const empCode = $('#empCode').val();
        const empDept = $('#empDept').val();
        const empPos = $('#empPos').val();
        const purpose = $("input[name='purpose']:checked").val();
        const requiredMessage = [{element: $('#empName'), message: 'Please fill the Name'}, {element: $('#empCode'), message: 'Please fill the Emp Code'}, 
            {element: $('#empDept'), message: 'Please fill the SECT/DEPT/DIV'}, {element: $('#empPos'), message: 'Please fill the Position'}];
        if(!(await requiredForm(`#form`, requiredMessage))) 
            return;
    }catch (error) {
        console.log(error);
        showMessage(error.message);
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