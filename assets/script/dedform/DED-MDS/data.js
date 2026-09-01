import { fetchMsgErr } from '@amec/webasset/api/fetch-utils';
import { host } from '../../utils';

export async function getDesTypeMaster() {
    return $.ajax({
        url: host + 'dedform/DED-MDS/form/GetDesTypeMaster',
        type: 'GET',
        dataType: 'json',
    });
}

export async function getOrInitDraftPlan(payload) {
    return $.ajax({
        url: host + 'dedform/DED-MDS/form/GetOrInitDraftPlan',
        type: 'POST',
        data: payload,
        dataType: 'json',
    });
}
export async function processPlanCalculation(payload) {
    return $.ajax({
        url: host + 'dedform/DED-MDS/form/ProcessPlan',
        type: 'POST',
        data: payload,
        dataType: 'json',
    });
}

export async function savePlanMaster(payload) {
    return $.ajax({
        url: host + 'dedform/DED-MDS/form/SavePlanMaster',
        type: 'POST',
        data: payload,
        dataType: 'json',
    });
}

export async function deleteDraftPlan(payload) {
    return $.ajax({
        url: host + 'dedform/DED-MDS/form/DeleteDraftPlan',
        type: 'POST',
        data: payload,
        dataType: 'json',
    });
}

export async function updateInlineDetail(data) {
    return $.ajax({
        url: host + 'dedform/DED-MDS/form/UpdateInlineDetail',
        type: 'POST',
        data: data,
        dataType: 'json',
    });
}
