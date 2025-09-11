
import { radio } from "./component";
import { handleClassList } from "./function";


async function createTableAuditMaster(data){ 
    let html = `<div class="overflow-y-auto w-full  max-h-[80vh] rounded-lg shadow">
        <table class="table w-full">
            <colgroup>
                <col class="w-fit border">
                <col class="w-full border">
                <col class="w-fit border">
                <col class="w-fit border">
                <col class="w-fit border">
                <col class="w-fit border">
            </colgroup>
            <thead>
                <tr class="bg-[#3c8dbc] font-bold text-white">
                    <th>No.</th>
                    <th>Topic</th>
                    <th>Factor</th>
                    <th>Audit</th>
                    <th>Result</th>
                    <th class="flex flex-col justify-center">
                        <span>Suggestion/</span>
                        <span>Comment</span>
                    </th>
                </tr>
            </thead>
            <tbody>`;
    data.forEach((item, index) => {
        console.log(item);
        
        if(item.ARM_TYPE == 'H'){
            html += `<tr class="bg-gray-300">
                <td colspan="6" class="font-bold">${item.ARM_NO}. ${item.ARM_DETAIL}</td>
            </tr>`;
        }else{
            html += `<tr class=" ${handleClassList(item.ARM_SEQ)}">
                <td></td>
                <td>${item.ARM_DETAIL}</td>
                <td class="flex justify-center text-white font-bold">
                    <span class="px-4 py-2 right-8 border shadow-lg rounded bg-neutral">
                        ${item.ARM_FACTOR}
                    </span>
                </td>
                <td></td>
                <td></td>
                <td class="flex justify-center join">
                    ${radio({name: `list-${item.ARM_NO}-${item.ARM_SEQ}`, val: 'S', cls:'join-item [&:not(:checked)]:bg-white btn-lg'})}
                    ${radio({name: `list-${item.ARM_NO}-${item.ARM_SEQ}`, val: 'C', cls:'join-item [&:not(:checked)]:bg-white btn-lg'})}
                </td>
            </tr>`;
        }
    });

    html += `</tbody>
        </table>
    </div>`;
    return html;
}

export { createTableAuditMaster };