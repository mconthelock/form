import { getAllAttr, logFormData, requiredForm, showMessage } from "../../public/v1.0.3/jFuntion";
import { showLoader } from "../../public/v1.0.3/preloader";
import { createTable, destroyTable} from "../../public/v1.0.3/_dataTable";

var formInfo, userIncharge, users, items, qcsection, division, department, section, tablesch;

$(async function(){
tablesch = await createTable({
  //data:data,
    // columns: [
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    // ],
  ordering: false,
  paging: false,
  searching: false,
  info: false
},{
  id: '#tablesch',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});
});

$(document).on('click', '#addRowBtn', function () {
  const newRow = `
    <tr class="bg-white">
      <td class="px-2 py-2 sticky-column bg-blue-50">
        <input type="time" name="starttime" class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2 sticky-column bg-blue-50">
        <input type="time" name="endtime" class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2">
        <input type="text" name="duration" placeholder="e.g. 60" class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2">
        <input type="text" name="place" class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2">
        <input type="text" name="content" class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2">
        <input type="text" name="participants" class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2">
        <input type="text" name="note" class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2">
        <select name="activity" class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm">
          <option value="P1">Preparation & Coordination</option>
          <option value="P2">Presentation</option>
          <option value="F">Factory Tour</option>
          <option value="Q">Q&A</option>
          <option value="L">Lunch Hosting</option>
        </select>
      </td>
    </tr>
  `;

  tablesch.row.add($(newRow)[0]).draw(false); // ใช้ [0] เพื่อใส่ element raw HTML
});


