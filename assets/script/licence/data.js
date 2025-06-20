export const getCategory = () => {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      dataType: "json",
      url: `${process.env.APP_ENV}/licence/template/getDocCategory`,
      success: function (response) {
        resolve(response);
      },
    });
  });
};

//Template properties
export function setProp(val = {}, opt = "") {
  return `
    <div class="flex flex-col gap-2 mb-2 prop-row">
        <div class="flex items-center gap-2">
            <input type="text" name="prop[]" class="input input-bordered w-full max-w-xs req" placeholder="Property Name" value="${
              val.COLNAME == undefined ? "" : val.COLNAME
            }">
            <input type="hidden" name="propid[]" value="${
              val.COLID == undefined ? "" : val.COLID
            }">
            <select name="proptype[]" class="select select-bordered w-full max-w-xs proptype req">
                <option value="text" ${
                  val.COLTYPE == "text" ? "selected" : ""
                }>Text</option>
                <option value="date" ${
                  val.COLTYPE == "date" ? "selected" : ""
                }>Date</option>
                <option value="list" ${
                  val.COLTYPE == "list" ? "selected" : ""
                }>List</option>
            </select>
            <button class="btn btn-ghost btn-circle btn-sm remove-prop" type="button"><i class="icofont-ui-close text-red-400"></i></button>
        </div>
        ${opt}
    </div>`;
}

export function setOption(uniq, val = {}) {
  return `<div class="flex w-full prop-option" data-id="${uniq}">
    <input type="hidden" name="optid[${uniq}][]" value="${
    val.OPTID == undefined ? "" : val.OPTID
  }" />
    <input type="text" placeholder="Type select option" class="input input-bordered input-sm w-full req" name="opt[${uniq}][]" value="${
    val.OPTVALUE == undefined ? "" : val.OPTVALUE
  }" />
    <button class="btn btn-ghost btn-circle btn-sm add-option" type="button"><i class="icofont-ui-add text-gray-400"></i></button>
    <button class="btn btn-ghost btn-circle btn-sm remove-option" type="button"><i class="icofont-ui-close text-gray-400"></i></button>
  </div>`;
}

export function removeOption(obj) {
  const row = obj.closest(".prop-row");
  obj.closest(".prop-option").remove();
  if (row.find(".prop-option").length == 0) {
    row.find(".proptype").val("text");
  }
}
