import { showLoader } from '@amec/webasset/preloader';
import { renderLoadError } from '@amec/webasset/utils';
import { getListComparison } from './data';
import { tableDraft } from './table/table-draft';

$(async function () {
    try {
        showLoader();
        const lists = await getListComparison();
        if (!lists.status) {
            throw new Error(lists.message);
        }
        tableDraft.init(lists.data, '#table', false);
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    } finally {
        showLoader({ show: false });
    }
});
