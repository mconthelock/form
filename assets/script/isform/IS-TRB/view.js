import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
$(document).ready(async function () {
  const formData = $(".form-data").data();
  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

  const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
  $(".showflow").html(flow.html);

  $(".btn-submit").click(async function () {
    const action = $(this).data("action");
    const confirm = await doaction(
      nfrmno,
      vorgno,
      cyear,
      cyear2,
      nrunno,
      action,
      empno,
      ""
    );
    if (confirm.status) redirectWebflow();
  });
});
