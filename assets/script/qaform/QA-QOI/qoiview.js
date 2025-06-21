import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
$(async function(){
    const formData = $(".form-data").data();
    const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
    const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
    $(".flow").html(flow.html);
  
});