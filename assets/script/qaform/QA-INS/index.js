import { getAllImage, getInfo } from "../../indexDB/employee";
import { displayEmpImage, displayEmpInfo, setAvatarSelect } from "../../indexDB/setIndexDB";
import { dragDropInit } from "../../public/v1.0.2/_dragdrop";
import { formatAvatar, s2disableSearch, setSelect2 } from "../../public/v1.0.2/_select2";
import { select } from "../../public/v1.0.2/component/form";
import { fieldAddInit } from "../../public/v1.0.2/fieldAdd";
import { ajaxOptions, getAllAttr, getData, host, showMessage } from "../../public/v1.0.2/jFuntion";

var formInfo, users, items, qcsection, empImage;

$(async function(){
    $('body').addClass('bg-blue-100');
    $('.attach').append(dragDropInit({width: 'w-1/2'}));
    formInfo = getAllAttr(document.querySelector('.form-info'));

    if(formInfo.mode == 1){
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
        setCreate(
            items.map(item => {
                return {
                    value: item.IT_NO,
                    text: item.IT_NO,
                }
            }),
            users.map(user => {
                return {
                    value: user.SEMPNO,
                    text: `(${user.SEMPNO})${user.SNAME}`,
                }
            }),
            qcsection.map(user => {
                return {
                    value: user.SEMPNO,
                    text: `(${user.SEMPNO})${user.SNAME}`,
                }
            })
        );
        // setAvatar();
        setAvatarSelect(users.map(user => user.SEMPNO), '.operator');
    }
});

$(document).on('click', '#addOperator', async function(){
    const operator = $('#operator').val();
    const info = await displayEmpInfo(operator);
    
    if(operator){
        let list = `<div class="flex gap-6">
            <span>${info.data.SEMPNO}</span>
            <span>${info.data.SNAME}</span>
            <span>${info.data.SSEC}</span>
            <span>${info.data.SDEPT}</span>
            <span>${info.data.SDIV}</span>
        </div>`
        $('.operatorList').append(fieldAddInit({element: list}));

    }else{
        showMessage('Please select an operator', 'warning');
    }
});

$(document).on('change', '#incharge', async function(){
    const incharge = $(this).val();
    if(incharge != ''){
        const user = await getData({
            ...ajaxOptions,
            type: 'GET',
            url: `${host}/qaform/QA-INS/form/getUserBySection/${incharge}`,
        });

        
    }
});

function setCreate(item, user, section) {
    $('.item').html(select({data: item, id: 'item', class: 'select select-sm s2 max-w-xs', placeholder: 'Select Item'}));
    $('.operator').append(select({data: user, id: 'operator', class: 'select select-sm max-w-xs', placeholder: 'Select Operator'}));
    $('.incharge').append(select({data: section, id: 'incharge', class: 'select select-sm max-w-xs', placeholder: 'Select In-Charge'}));
    setSelect2();
    setSelect2({element: '#operator', templateSelection: formatAvatar, templateResult: formatAvatar});
    setSelect2({...s2disableSearch, element: '#incharge'});
}
