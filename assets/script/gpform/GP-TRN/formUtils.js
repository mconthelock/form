/* =====================================================
   🔹 Enable / Disable Submit Button
   ===================================================== */
export function toggleSubmit($type, $btn) {
  if (!$type?.length || !$btn?.length) return;
  const isEmpty = !$type.val();

  $btn.prop("disabled", isEmpty)
      .toggleClass("bg-indigo-600 hover:bg-indigo-700 cursor-pointer", !isEmpty)
      .toggleClass("bg-indigo-400 cursor-not-allowed", isEmpty);
}

/* =====================================================
   🔹 Populate <select> options
   ===================================================== */
export function populateSelect($select, start, end) {
  if (!$select?.length) return;
  const opts = [];
  for (let i = start; i <= end; i++) {
    const val = i.toString().padStart(2, "0");
    opts.push(`<option value="${val}">${val}</option>`);
  }
  $select.html(opts.join(""));
}

/* =====================================================
   🔹 Show Alert Modal (ใช้ <dialog> หรือ alert fallback)
   ===================================================== */
export function showAlert(title, message) {
  const $modal = $("#alertModal");
  const $title = $("#alertTitle").text(title);
  const $msg   = $("#alertMessage").text(message);

  if ($modal[0] && typeof $modal[0].showModal === "function") {
    $modal[0].showModal();
  } else {
    alert(`${title}\n\n${message}`);
  }
}

