import { actionForm, formManager } from "./function";

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
