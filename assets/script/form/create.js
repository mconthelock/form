import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { initApp, tableOption } from '../utils';
import { getFormMaster, getFormDept } from '../formmst/data';

$(document).ready(async function () {
    showLoader();
    const app = await initApp({ submenu: '.document' });
    if (!app) return;

    try {
        if ($('#deptid').length > 0) {
            await createFormList();
        }
        await createRecent();
    } catch (error) {
        console.log(error);
        await showMessage(error.responseJSON?.message || 'Error fetching data');
    } finally {
        await showLoader({ show: false });
    }
});

async function createRecent(id = '') {}

async function createFormList() {
    const formMaster = await getFormMaster();
    const formdept = await getFormDept();
    const id = $('#deptid').val();
    const selectdDept = formdept.find((d) => d.id == id);
    let result = [];
    //console.log(selectdDept.link);
    for (const value of selectdDept.link) {
        const matched = formMaster.filter(
            (f) => f.VORGNO === value && f.CSTATUS === '1',
        );
        result.push(...matched);
    }

    const list = $('#formlist');
    const seenGroups = new Set();
    list.empty();

    // const filtered = result.filter(
    //     (item) => item.VORGNO === id && item.CSTATUS === '1',
    // );

    //get distinct group
    const distinctGroups = [
        ...new Set(
            result.map((item) =>
                item.formmstGroup == null ? null : item.formmstGroup.VGROUP,
            ),
        ),
    ].sort((a, b) => (a === null ? -1 : b === null ? 1 : 0));
    distinctGroups.forEach((group) => {
        setFormList(result, group);
    });
}

async function setFormList(data, group) {
    const filtered =
        group == null
            ? data.filter((item) => item.formmstGroup == null)
            : data.filter((item) => item.formmstGroup?.VGROUP === group);
    let str = `<ul class="list bg-base-100 rounded-box shadow-md border border-slate-300 mb-8 p-6 pb-5 gap-2">
        <li class="p-4 pb-2 text-xl text-primary font-black tracking-wide">${filtered[0].formmstGroup?.VGROUPNAME || 'General'}</li>`;
    filtered.forEach((item) => {
        str += `<li class="list-row border border-white cursor-pointer hover:bg-base-300 hover:border-slate-300 create-form-detail" data-url="${item.VFORMPAGE}">
            <div class="text-4xl font-thin opacity-30 tabular-nums min-w-37">${item.VANAME}</div>
            <div class="list-col-grow">
                <div>${item.VNAME}</div>
                <div class="text-xs font-semibold opacity-60">${item.VDESC == null ? '' : item.VDESC}</div>
            </div>
            <button class="btn btn-circle btn-ghost flex justify-center items-center">
                <i class="fi fi-rr-play text-xl"></i>
            </button>
        </li>`;
    });
    str += '</ul>';
    $('#formlist').append(str);
}

$(document).on('click', '.create-form-detail', async function (e) {
    e.preventDefault();
    try {
        await showLoader();
        //แยกประเภท URL คือตอนนี้มี 3 แบบคือ
        //1. URL ที่เรียกจากภายใน project
        //2. URL ที่เรียกจาก project webflow
        //3. URL ที่เรียกจาก ASP
        let url = $(this).attr('data-url');
        if (url.includes('index.asp')) {
            url = `http://webflow/${url}`;
        }
        window.location.href = `${process.env.APP_ENV}/webform/form/detail?data=${url}`;
    } catch (error) {
        console.log(error);
        await showMessage(
            error.responseJSON?.message || 'Error navigating to form detail',
        );
    } finally {
        await showLoader({ show: false });
    }
});
