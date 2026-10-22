import { showLoader } from '@amec/webasset/preloader';
import { renderLoadError, showErrorMessage } from '@amec/webasset/utils';
import { getListComparison } from './data';
import { tableDraft } from './table/table-draft';
import { setSelect2 } from '@amec/webasset/select2';

$(async function () {
    try {
        showLoader();
        tableDraft.init([], '#table', false);
        await setSelect2({
            element: 'select[name="VSTATUS"]',
            data: [
                {
                    id: 'DRAFT',
                    text: 'Draft',
                },
                {
                    id: 'CREATED',
                    text: 'Created',
                },
                {
                    id: 'USED',
                    text: 'Used',
                },
            ],
        });
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    } finally {
        showLoader({ show: false });
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-22
 * @description ค้นหา Price Comparison Form
 */
$(document).on('click', '#search', async function (e) {
    try {
        e.preventDefault();
        showLoader();
        const formData = new FormData($('#form-search')[0]);
        const searchParams = {};
        for (const [name, value] of formData.entries()) {
            if (value) {
                searchParams[name] = value;
            }
        }
        const lists = await getListComparison(searchParams);
        if (!lists.status) {
            throw new Error(lists.message);
        }
        tableDraft.init(lists.data, '#table', false);
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    } finally {
        showLoader({ show: false });
    }
});
