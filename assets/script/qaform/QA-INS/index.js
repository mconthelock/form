

import { displayEmpImage, setAvatarSelect } from "../../indexDB/setIndexDB";
import { createTable} from "../../public/v1.0.2/_dataTable";
import { dragDropInit, elementDragDrop, handleFiles } from "../../public/v1.0.2/_dragdrop";
import { formatAvatar, s2disableSearch, setSelect2 } from "../../public/v1.0.2/_select2";
import { select, webflowSubmit } from "../../public/v1.0.2/component/form";
import { dataTableSkeleton } from "../../public/v1.0.2/component/skeleton";
import { checkEmployeeOrFocus } from "../../public/v1.0.2/employee";
import { ajaxOptions, getAllAttr, getData, host, showMessage } from "../../public/v1.0.2/jFuntion";
import { getDepartment, getDivision, getSection } from "../../webservice";
// import "../../../dist/css/v1.0.1.min.css";
import "../../../dist/css/dataTable.min.css";

var formInfo, userIncharge, users, items, qcsection, division, department, section, tableOperator;

// document.querySelectorAll('link[href="https://amecwebtest.mitsubishielevatorasia.co.th/cdn/datatable/v2.2.2/datatables.min.css"]').forEach(link => link.remove());
$(async function(){
    $('body').addClass('bg-blue-100');
    // $('.attach').html(dragDropInit({width: 'w-1/2'}));
    $('.attach').html(dragDropInit({format: 'excel'}));
    formInfo = await getAllAttr(document.querySelector('.form-info'));
    // await directlogin(formInfo.empno, 1);
    
    if(formInfo.mode == 1){
        $('#actionWebflow').html(webflowSubmit({
            actionsForm: true,
            remark: true,
            request: true,
        }));
        
    }else if(formInfo.mode == 2){
        $('#actionWebflow').html(webflowSubmit({
            actionsForm: true,
            remark: true,
            approve: true,
            reject: true,
            return: true,
            returnb: true,
            returnp: true,
        }));
    }
    
    await setCreate();
});


$(document).on('change', '#requester', async function(e){
    const empno = $(this).val().trim();
    console.log(`empno: ${empno}`, empno.length);
    if(empno.length < 5) return;
    await checkEmployeeOrFocus($(this));
});

$(document).on('change', '#qcsection', async function(){
    $('#incharge').empty();
    const secId = $(this).val();
    const incharge = qcsection.find(sec => sec.SEC_ID == secId);
    if(secId != ''){
        const user = userIncharge.filter(u => u.SEC_ID == secId);
        $('#incharge').removeAttr('disabled');
        await setIncharge(user);
        if(incharge.INCHARGE){
            $('#incharge').val(incharge.INCHARGE).trigger('change');
        }
    }
});

$(document).on('change', '#division', async function(){
    const divCode = $(this).val();
    console.log(divCode);
    if(divCode == '') {
        await createTableOperator([]);
        $('#department').empty().prop('disabled', true);
        $('#section').empty().prop('disabled', true);
        return;
    }
    $('#department').empty().prop('disabled', false);
    $('#section').empty().prop('disabled', true);
    setSelect2({
        element: '#department', 
        data: department.filter(dept => dept.SDIVCODE == divCode).map(dept => {
            return {
                value: dept.SDEPCODE,
                text: dept.SDEPT,
            };
        })
    });
});

$(document).on('change', '#department', async function(){
    const deptCode = $(this).val();
    console.log(deptCode);
    if(deptCode == '') {
        await createTableOperator([]);
        $('#section').empty().prop('disabled', true);
        return;
    }
    $('#section').empty().prop('disabled', false);
    setSelect2({
        element: '#section', 
        data: section.filter(sec => sec.SDEPCODE == deptCode).map(sec => {
            return {
                value: sec.SSECCODE,
                text: sec.SSEC,
            };
        })
    });
});

$(document).on('change', '#section', async function(){
    const secCode = $(this).val();
    console.log(secCode);
    if(secCode == '') {
        await createTableOperator([]);
    }
});

$(document).on('click', '#searchOperator', async function(e){

    if(!$('#tableLoading .dataTableSkeleton').hasClass('hidden')) return;
    const div = $('#division').val();
    const dept = $('#department').val();
    const sec = $('#section').val();
    let user = [];

    console.log(`div: ${div}, dept: ${dept}, sec: ${sec}`);
    if(!sec || !dept || !div) {
        showMessage('Please select filter', 'warning');
        return;
    }
    // if(!sec && !dept && !div) {
    //     showMessage('Please select at least one filter', 'warning');
    //     // return;
    // } else if (!sec && !dept) {
    //     user = users.filter(u => u.SDIVCODE == div);
    // } else if (!sec) {
    //     user = users.filter(u => u.SDIVCODE == div && u.SDEPCODE == dept);
    // } else {
    //     user = users.filter(u => u.SDIVCODE == div && u.SDEPCODE == dept && u.SSECCODE == sec);
    // }

    user = users.filter(u => u.SDIVCODE == div && u.SDEPCODE == dept && u.SSECCODE == sec);

    if(user.length == 0) {
        showMessage('No operator found', 'warning');
    }
    await createTableOperator(user);
});

$(document).on('change', 'input[name="files[]"]', async function(e){
    handleFiles($(this)[0].files, elementDragDrop($(this)));
});

async function setCreate() {
    dataTableSkeleton({
        height : 'h-[27rem]'
    });
    items = await getData({
        ...ajaxOptions,
        url: `${host}/qaform/QA-INS/form/getItem`,
    });
    users = await getData({
        ...ajaxOptions,
        url: `${host}/qaform/QA-INS/form/getUser`,
    });
    qcsection = await getData({
        ...ajaxOptions,
        url: `${host}/qaform/QA-INS/form/getSection`,
    });
    userIncharge = await getData({
        ...ajaxOptions,
        type: 'GET',
        url: `${host}/qaform/QA-INS/form/getUserBySection/`,
    });

    // item
    $('.item').html(select({
        data: items.map(item => {
            return {
                value: item.IT_NO,
                text: item.IT_NO,
            }
        }), id: 'item', class: 'select select-sm s2 max-w-40 req', placeholder: 'Select Item'}));
    await setSelect2();

    // incharge
    $('.incharge').html(
        select({
            data: qcsection.map(sec => {
                return {
                    value: sec.SEC_ID,
                    text: sec.SEC_NAME,
                }
            }), id: 'qcsection', class: 'select select-sm max-w-40', placeholder: 'Select Section'})+
        select({id:'incharge', class: 'select select-sm req', placeholder: 'Select In-Charge', disabled: true})
    );
    await setSelect2({...s2disableSearch, element: '#qcsection'});
    await setIncharge(userIncharge);

    await createTableOperator([]);
    dataTableSkeleton({ show: false});
   // operator
    // $('.operator').html(select({id: 'operator', class: 'select select-sm', placeholder: 'Select Operator',disabled: true}));
    // await setOperator();
    // setSelect2({element: '#operator', templateSelection: formatAvatar, templateResult: formatAvatar});
    // setAvatarSelect(users.map(user => user.SEMPNO), '.operator');

    
    
    
    // organize
    // กรองแสดงเฉพาะที่มีในระบบ
    division   = await getDivision().then(div => div.filter(div => users.map(u => u.SDIVCODE).includes(div.SDIVCODE)));
    department = await getDepartment().then(dept => dept.filter(dept => users.map(u => u.SDEPCODE).includes(dept.SDEPCODE)));
    section    = await getSection().then(sec => sec.filter(sec => users.map(u => u.SSECCODE).includes(sec.SSECCODE)));
    $('.organize').html(
        select({
            data: await division.map(div => {
                return {
                    value: div.SDIVCODE,
                    text: div.SDIV,
                }
            }),
            id: 'division', 
            class: 'select select-sm max-w-40 req', 
            placeholder: 'Select Division',
        })+
        select({
            data: department.map(dept => {
                return {
                    value: dept.SDEPCODE,
                    text: dept.SDEPT,
                }
            }),
            id: 'department', 
            class: 'select select-sm max-w-40 req', 
            placeholder: 'Select Department', 
            disabled: true,
        })+
        select({
            data: section.map(sec => {
                return {
                    value: sec.SSECCODE,
                    text: sec.SSEC,
                }
            }),
            id: 'section', 
            class: 'select select-sm max-w-40 req', 
            placeholder: 'Select Section', 
            disabled: true,
        })
    );
    setSelect2({element: '#division', width: '10rem'});
    setSelect2({element: '#department', width: '10rem'});
    setSelect2({element: '#section', width: '10rem'});

}


async function setIncharge(data = ''){
    if(data == '') {
        await setSelect2({element: '#incharge', templateSelection: formatAvatar, templateResult: formatAvatar, width: '100%'});
        return;
    }
    await setSelect2({
        data: data.map(u => {
            return {
                value: u.USR_NO,
                text: `(${u.USR_NO})${u.USR_NAME}`,
            }
        }),
        element: '#incharge',
        templateSelection: formatAvatar, 
        templateResult: formatAvatar,
        width: '100%',
        avatar: true,
        avatarData: data.map(u => u.USR_NO),
    });
    // await setAvatarSelect(data.map(user => user.USR_NO), '#incharge');
}

// $(document).on('change', '#operator', async function(){
//     if($(this).val() == '') return;
//     const operator = $(this).val();
//     const info = await displayEmpInfo(operator);
//     if(operator){
//         let list = `<div class="flex items-center gap-6">
//             <div class="avatar"><div class="w-10 rounded-full border"><img src="${await displayEmpImage(info.SEMPNO)}" class=""></div></div>
//             <span class="operator-selected">${info.SEMPNO}</span>
//             <span>${info.SNAME}</span>
//         </div>`
        
//         if ($('.operator-selected').filter(function() { return $(this).text() == info.SEMPNO; }).length === 0) {
//             $('.operatorList').append(listInit({element: list}));
//         }else {
//             showMessage('This operator has already been selected', 'warning');
//         }

//     }else{
//         showMessage('Please select an operator', 'warning');
//     }
// });

// async function setOperator(data = ''){
//     if(data == '') {
//         await setSelect2({element: '#operator', templateSelection: formatAvatar, templateResult: formatAvatar});
//         return;
//     }
//     await setSelect2({
//         data: data.map(u => {
//             return {
//                 value: u.SEMPNO,
//                 text: `(${u.SEMPNO})${u.SNAME}`,
//             }
//         }),
//         element: '#operator',
//         templateSelection: formatAvatar, templateResult: formatAvatar
//     });
//     await setAvatarSelect(data.map(user => user.SEMPNO), '.operator');
// }

async function createTableOperator(data) {
    const image = await Promise.all(data.map(async user => {
        return {src: await displayEmpImage(user.SEMPNO), empno: user.SEMPNO}
    }));
    

    const column = [
        { data: null, title: "Image", width: '10%',
            render: (data, type, row) => {
                return `<div class="avatar">
                            <div class="w-10 rounded-full border">
                                <img src="${image.find(img => img.empno == row.SEMPNO).src || `${process.env.APP_IMG}/Avatar.png`}">
                            </div>
                        </div>`;
                
            }
        },
        { data: "SEMPNO", title: "Emp. No.", width: '10%', className: 'text-center',},
        { data: "SNAME", title: "Name" },
    ];
    tableOperator = await createTable({
        data:data,
        columns: column,
    },{
        id: '#tableOperator',
        columnSelect:{status: true},
        domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
        join: true
    });

    console.log('data',tableOperator.rows().data().toArray());

}
