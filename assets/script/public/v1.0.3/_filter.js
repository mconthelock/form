/**
 * Filter dataTable
 * @module _filter
 * @description This file is used to manage filtering functionality for data tables.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @note This file includes functions to handle filtering operations for data tables.
 * @requires jQuery npm install jquery
 * @version 1.0.2
 * @note 2025-07-02 แก้ไขให้ appendTo .dt-column-header แทน header และซ่อน .dt-column-order ทุกคอลัมน์
 */

/**
 * filter table columns
 * @param {object} table 
 * @param {string} columnsToFilter e.g. 1 1,3 1-3 1-3,5 1,3-5
 */
export function createColumnFilters(table, columnsToFilter) {
    const tableId = table.table().node().id;
    // Parse column ranges
    const columns = parseColumns(columnsToFilter, table.columns().count());

    /**
     * Create filter menu
     */
    if($('#filter-menu').length == 0){
        $('body').append(`<div class="filter-menu absolute bg-white border border-solid border-[#ddd] hidden z-[1000] p-2.5" id="filter-menu">
            <div class="filter-header" id="filter-header"></div>
            <div id="filter-options" class="h-[400px] w-[200px] overflow-scroll"></div>
            <div class="buttons join w-full">
                <button id="filter-ok" class="btn btn-sm btn-primary round-full join-item w-1/2">OK</button>
                <button id="filter-cancel" class="btn btn-sm btn-neutral round-full join-item w-1/2">Cancel</button>
            </div>
        </div>`);
    }  
    /* css
      .filter-menu {
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        padding: 10px;
        display: none;
        z-index: 1000;
      }
      #filter-options{
        height: 300px;
        width: 200px;
        overflow: scroll;
      }
      .filter-menu label {
        display: block;
        margin-bottom: 5px;
      }
      .buttons {
        margin-top: 10px;
      }
      .filter-icon {
        cursor: pointer;
      } */

    // Add filter menus
    columns.forEach(columnIndex => {
        const column  = table.column(columnIndex);
        const header  = $(column.header());
        const options = $('#filter-options');
        const columnName    = `filterHeader-${tableId}-${columnIndex}`;
        const filterOptions = $(`#filter-options .${columnName}`);
        // console.log(filterOptions);
        $('.dt-column-order').addClass('hidden'); // ซ่อนปุ่มเรียงลำดับ
        // Add filter icon
        $('<span class="filter-icon ml-1 cursor-pointer"><i class="icofont-filter text-gray-300 "></i></span>').appendTo(header.find('.dt-column-header'));
        
        if(filterOptions.length == 0){
            options.append(`<div class="${columnName}">
                                <ui class="filter-menu-option menu sticky top-0 bg-white pb-2 pl-1 border-b"></ui>
                                <div class="filter-menu-data border p-2"></div>
                            </div>`);
        }

        const container = $(`.${columnName} .filter-menu-option`);
        // Search
        if(container.find('.filter-search').length == 0){
            container.prepend(`<div class="!flex justify-center">
                                    <input type="text" name="filter-search" class="input input-xs input-bordered w-full pl-2 mx-1 filter-search" placeholder="Search here">
                                </div>`);
        }
        // Select all
        if(container.find('.filter-select-all').length == 0){
            container.prepend(`<div class="cursor-pointer block  ">
                                    <label class="text-sm cursor-pointer block mb-[5px]">
                                        <input type="checkbox" name="filter-select-all" class="filter-select-all" checked> 
                                        Select All
                                    </label>
                                </div>`);
        }
        // Clear
        if(container.find('.filter-clear').length == 0){
            container.prepend(`<li class="filter-clear block  cursor-pointer ">
                                    <span class="!pl-0">
                                        <i class="icofont-ui-close text-sm text-red-500"></i> 
                                        Clear
                                    </span>
                                </li>`);
        }
        // Sort z-a
        if(container.find('.filter-sortZA').length == 0){
            container.prepend(`<li class="filter-sortZA cursor-pointer  block ">
                                    <span class="!pl-0">
                                        <i class="icofont-sort-alt "></i> 
                                        Sort Z to A
                                    </span>
                                </li>`);
        }
        // Sort a-z
        if(container.find('.filter-sortAZ').length == 0){
            container.prepend(`<li class="filter-sortAZ cursor-pointer  block ">
                                    <span class="!pl-0">
                                        <i class="icofont-sort-alt "></i> 
                                        Sort A to Z
                                    </span>
                                </li>`);
        }
    });

    /**
     * Open filter menu
     */
    $(`#${tableId}`).on('click', '.filter-icon', async   function (e) {
        hide();
        const menu = $('#filter-menu');
        const columnIndex = table.column($(this).closest('th')).index();
        const column      = table.column(columnIndex);
        const columnName  = `filterHeader-${tableId}-${columnIndex}`;
        const filterOptions = $(`#filter-options .${columnName} .filter-menu-data`);
        
        // console.log('filtername',columnName);
        
        $(`.${columnName}`).removeClass('hidden');
        $('#filter-menu').attr('current-column', columnIndex);
                
        const columnData = column.data().unique().sort((a, b) => {
            const columnName = column.dataSrc(); // ดึงชื่อ column จาก data attribute
            // console.log('Column Data Name:', columnName, 'header name : ',column.header().textContent.trim(),'a : ', a,'b : ', b);
        
            if (columnName === 'CST') {
                // console.log(true);
                
                // Map CST values
                const mapCST = {
                    1: 'Running',
                    2: 'Approve',
                    3: 'Reject'
                };
                a = mapCST[a] || a;
                b = mapCST[b] || b;
            }
            if (!isNaN(a) && !isNaN(b)) {
                return a - b; // Sort numerically if both are numbers
            }
            // if (a === null || b === null) {
            //     return 0; // Handle null values
            // }
            if (a === null || a === undefined || a === '') return -1;
            if (b === null || b === undefined || b === '') return 1;
            return a.localeCompare(b); // Sort lexicographically if both are strings
        });
        // console.log(columnData);

        columnData.each(function (value) {
             
            const columnName = column.dataSrc(); // ดึงชื่อ column จาก data attribute
            // console.log('Column Data Name:', columnName, 'header name : ',column.header().textContent.trim(),'a : ', a,'b : ', b);
        
            var val = value === null ? '' : value;
            if (columnName === 'CST') {
                // console.log(true);
                
                // Map CST values
                const mapCST = {
                    1: 'Running',
                    2: 'Approve',
                    3: 'Reject'
                };
                val = mapCST[val] || val;
            }
            // console.log(val);
            
            const displayValue = val? val : '(Blank)'; 
            if (filterOptions.find(`input[value="${val}"]`).length === 0) {
                filterOptions.append(
                    `<label class="text-sm cursor-pointer filter-list block mb-[5px]"><input type="checkbox" value="${val}" checked> ${displayValue}</label>`
                );
            }
        });
        

        menu.css({ 
            // top: e.pageY + 5, 
            // left: e.pageX 
            top : Math.min(e.pageY + 5, window.innerHeight - menu.outerHeight() - 10),
            left : Math.min(e.pageX, window.innerWidth - menu.outerWidth() - 10)
        }).fadeIn();

    });

    /**
     * Filter Search
     */
    $(document).on('keyup', '.filter-search', function () {
        const columnIndex = parseInt($('#filter-menu').attr('current-column'));
        const searchTerm = $(this).val().toLowerCase();
        const columnName = `filterHeader-${tableId}-${columnIndex}`;
        const filterOptions = $(`#filter-options .${columnName} .filter-menu-data label`);
        const selectAll = $(this).closest('.filter-menu-option').find('.filter-select-all');
        if(selectAll.is(':checked')){
            selectAll.trigger('click');
            // selectAll.prop('checked', false);

        }
        // $('.filter-select-all').trigger('click');

        filterOptions.each(function () {
            const label = $(this);
            const input = $(this).find('input');
            
            const text = input.val().toLowerCase();
            // console.log(input, text);
            if (text.includes(searchTerm)) {
                label.show();
            } else {
                label.hide();
            }
        });

    });

    /**
     * Sort A-Z
     */
    $(document).on('click', '.filter-sortAZ', function () {
        const columnIndex = parseInt($('#filter-menu').attr('current-column'));
        table.settings()[0].aoColumns[columnIndex].bSortable = true; 
        // console.log('sort AZ',columnIndex, table, table.settings()[0].aoColumns[columnIndex]);

        table.order([columnIndex, 'asc']).draw(); // A-Z
        table.settings()[0].aoColumns[columnIndex].bSortable = false; 
        $('.dt-column-order').addClass('hidden'); // ซ่อนปุ่มเรียงลำดับs
        $('.dt-orderable-asc.dt-orderable-desc.dt-ordering-desc').addClass('!pr-2.5'); // ซ่อนปุ่มเรียงลำดับs

    });

    /**
     * Sort Z-A
     */
    $(document).on('click', '.filter-sortZA', function () {
        const columnIndex = parseInt($('#filter-menu').attr('current-column'));
        table.settings()[0].aoColumns[columnIndex].bSortable = true; 
        table.order([columnIndex, 'desc']).draw(); // A-Z
        table.settings()[0].aoColumns[columnIndex].bSortable = false; 
        
        $('.dt-column-order').addClass('hidden'); // ซ่อนปุ่มเรียงลำดับs
        $('.dt-orderable-asc.dt-orderable-desc.dt-ordering-desc').addClass('!pr-2.5'); // ซ่อนปุ่มเรียงลำดับs
    // }
    });
    
    /**
     * Clear filter
     */
    $(document).on('click', '.filter-clear', function () {
        // console.log('clear');
        
        const columnIndex = $('#filter-menu').attr('current-column');
        const menuOption = $(this).closest('.filter-menu-option');
        const ok = menuOption.closest('#filter-options').siblings('.buttons').find('#filter-ok');
        const selectAll  = menuOption.find('.filter-select-all');
        if(!selectAll.is(':checked')){
            selectAll.trigger('click');
            ok.trigger('click');
        }
        $(`th[data-dt-column="${columnIndex}"]`).find('.icofont-filter').removeClass('text-black').addClass('text-gray-300');
    });
    
    // Apply filter
    $(document).on('click', '#filter-ok', function () {
        // console.log('filter ok');
        
        const columnIndex = $('#filter-menu').attr('current-column');
        
        const selectedValues = $(`.filterHeader-${tableId}-${columnIndex} input[type="checkbox"]:checked`)
            .not('.filter-select-all')
            .map(function () {
                return `^${$.fn.dataTable.util.escapeRegex($(this).val())}$`;
            })
            .get()
            .join('|');
        // console.log(columnIndex, selectedValues);
        table.column(columnIndex).search(selectedValues, true, false).draw();
        $('#filter-menu').fadeOut();
        $(`th[data-dt-column="${columnIndex}"]`).find('.icofont-filter').removeClass('text-gray-300').addClass('text-black');
    });

    /**
     * Select all filter
     */
    $(document).on('click', '.filter-select-all', function () {
        // console.log('select all');
        
        const columnIndex = $('#filter-menu').attr('current-column');
        const filterData = `.filterHeader-${tableId}-${columnIndex}`;
        const filter = $(this).closest(`${filterData}`);
        // console.log('select all', columnIndex, filter);
        // console.log('filter',`filterHeader-${tableId}-${columnIndex}`);
        
        const isChecked = filter.find(this).is(':checked');
        if(isChecked){
            filter.find('.filter-menu-data label').show();
            filter.find('.filter-search').val('');
            $(`th[data-dt-column="${columnIndex}"]`).find('.icofont-filter').removeClass('text-black').addClass('text-gray-300');
        }
        $(`${filterData} input[type="checkbox"]`).prop('checked', isChecked);
    });

    // Uncheck select all when any checkbox is unchecked
    $(document).on('click', '.filter-list input[type="checkbox"]', function () {
        if($('.filter-select-all').is(':checked')){
            $('.filter-select-all').prop('checked', false);
        }
    });

    // Cancel filter
    $(document).on('click', '#filter-cancel', function () {
        $('#filter-menu').fadeOut();
        hide();
    });

    // Hide filter menu when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#filter-menu, .filter-icon').length) {
            $('#filter-menu').fadeOut();
            hide();
        }
    });

    /**
     * Hide filter menu
     */
    function hide(){
        columns.forEach(columnIndex => {
            // console.log(columnIndex);
            if($(`.filterHeader-${tableId}-${columnIndex}`)){
                $(`.filterHeader-${tableId}-${columnIndex}`).addClass('hidden');
            }
        });

    }

    /**
     * Helper function to parse column ranges
     * @param {string} columnsToFilter 
     * @param {number} totalColumns 10
     * @returns 
     */
    function parseColumns(columnsToFilter, totalColumns) {
        const columnSet = new Set();
        const parts = columnsToFilter.split(',');
        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                for (let i = start; i <= end; i++) {
                    if (i >= 0 && i < totalColumns) {
                        columnSet.add(i);
                    }
                }
            } else {
                const index = parseInt(part, 10);
                if (index >= 0 && index < totalColumns) {
                    columnSet.add(index);
                }
            }
        });
        return [...columnSet];
    }
}