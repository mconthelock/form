// IS-LN View Page Script
import { showFlow, doaction, redirectWebflow } from "@public/_form.js";
import { host, showLoader } from "../../utils.js";
import Swal from "sweetalert2";

$(document).ready(async function () {
  console.log("IS-LN View page loaded");

  // Get form data from hidden div
  const formData = $("#form-data").data();

  if (!formData || !formData.nfrmno) {
    console.error("Form data not found");
    return;
  }

  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

  console.log("Form data:", { nfrmno, vorgno, cyear, cyear2, nrunno });

  // Load workflow/flow
  try {
    const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
    if (flow && flow.html) {
      $(".flow").html(flow.html);
    }
  } catch (error) {
    console.error("Error loading flow:", error);
  }

  /**
   * Show approval/rejection modal
   */
  //   function showApprovalModal(action) {
  //     const actionText = action === "approve" ? "Approve" : "Reject";
  //     const actionColor = action === "approve" ? "#10b981" : "#ef4444";

  //     Swal.fire({
  //       title: `${actionText} Form?`,
  //       text: `Are you sure you want to ${action} this form?`,
  //       icon: "question",
  //       input: "textarea",
  //       inputLabel: "Comment (Optional)",
  //       inputPlaceholder: "Enter your comment here...",
  //       showCancelButton: true,
  //       confirmButtonText: actionText,
  //       cancelButtonText: "Cancel",
  //       confirmButtonColor: actionColor,
  //       showLoaderOnConfirm: true,
  //       preConfirm: async (comment) => {
  //         try {
  //           showLoader({ show: true });
  //           const result = await submitApproval(action, comment);
  //           showLoader({ show: false });
  //           return result;
  //         } catch (error) {
  //           showLoader({ show: false });
  //           Swal.showValidationMessage(`Request failed: ${error.message}`);
  //         }
  //       },
  //       allowOutsideClick: () => !Swal.isLoading(),
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         if (result.value && result.value.status) {
  //           Swal.fire({
  //             title: "Success!",
  //             text: result.value.message || "Form processed successfully",
  //             icon: "success",
  //             confirmButtonText: "OK",
  //           }).then(() => {
  //             redirectWebflow();
  //           });
  //         } else {
  //           Swal.fire({
  //             title: "Error!",
  //             text: result.value?.message || "Failed to process form",
  //             icon: "error",
  //             confirmButtonText: "OK",
  //           });
  //         }
  //       }
  //     });
  //   }

  /**
   * Submit approval or rejection
   */
  //   async function submitApproval(action, comment) {
  //     try {
  //       const response = await fetch(`${host}isform/IS-LN/main/submitApproval`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           nfrmno: nfrmno,
  //           vorgno: vorgno,
  //           cyear: cyear,
  //           cyear2: cyear2,
  //           nrunno: nrunno,
  //           action: action,
  //           comment: comment || "",
  //         }),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }

  //       const data = await response.json();
  //       return data;
  //     } catch (error) {
  //       console.error("Error submitting approval:", error);
  //       throw error;
  //     }
  //   }

  $(".btn-submit").click(async function () {
    const action = $(this).data("action");
    const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, "");
    if (confirm.status) redirectWebflow();
  });
});
