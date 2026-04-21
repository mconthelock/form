import { actionForm, formManager, workCompleteManager } from "./function";

$(async function () {
    formManager.views();
});

/**
 * action form  approve, reject form
 */
$(document).on("click", "button[name='btnAction']", async function () {
    const action = $(this).val();
    actionForm.approveForm(action);
});

// $(document).on('change', '#compDate', function(){
//     const date = $(this).val();
//     const time = $('#compTime').val();  
//     workCompleteManager.change(date, time);
// });

// $(document).on('change', '#compTime', function(){
//     const time = $(this).val();
//     const date = $('#compDate').val();  
//     workCompleteManager.change(date, time);
// });
