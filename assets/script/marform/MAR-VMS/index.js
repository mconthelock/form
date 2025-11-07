import { getAllAttr, logFormData, requiredForm, showMessage } from "@public/jFuntion";
import { showLoader } from "@public/preloader";
import { host } from "../../utils";
import { createTable, destroyTable} from "@public/_dataTable";
import { setSelect2 , destroySelect2 } from "@public/_select2";
//import "select2";
//import "select2/dist/css/select2.min.css";
import { redirectWebflow } from "@public/_form.js";
import { createForm } from "../../api/webform/form";
import { setDatePicker } from "@public/_flatpickr";
//import { createForm, redirectWebflow } from "../../inc/_form.js";
import { readInput } from "@public/_excel";
import Swal from "sweetalert2";
import { ElementFlags } from "typescript";

var formInfo, userIncharge, users, items, qcsection, division, department, section, tablesch , tablevisitor , tableemp , tablesec , tablepro , tablepst , tableist;

$(async function () {

  setDatePicker({ element: '.datesel', dateFormat: "Y-m-d" });
  const $modal = $('#modal');
  const $versionInput = $('#formVersion');
  const $newVersionInput = $('#newVersion');
    //$("#salecom").select2();
    await setSelect2({ element: '#salecom',  selectionCssClass: "w-72", width: '280px'});
    await setSelect2({ element: '#receptionRoom',  selectionCssClass: "w-72", width: '280px'});
    await setSelect2({ element: '#lunchPlaceSelect',  selectionCssClass: "w-72", width: '280px'});
    await setSelect2({ element: '.pst-select' , selectionCssClass: "w-96", width: '384px'});
    await setSelect2({ element: '.ist-select' , selectionCssClass: "w-96", width: '384px'});
    await setSelect2({ element: '.emp-select' , selectionCssClass: "w-96", width: '384px'});
    // --- Tab control ---
    const $tabButtons = $('#tabs button');
    const $tabPanes = $('.tab-pane');

    $tabButtons.on('click', function() {
        $tabButtons.removeClass('active-tab');
        $tabPanes.addClass('hidden');

        $(this).addClass('active-tab');
        const tab = $(this).data('tab');
        $('#' + tab).removeClass('hidden');
    });

    // --- Lunch toggle ---
    $('#hasLunch').on('change', function() {
        $('#lunchDetails').toggleClass('hidden', !$(this).is(':checked'));
    });

    // --- Dinner toggle ---
    $('#hasDinner').on('change', function() {
        $('#dinnerDetails').toggleClass('hidden', !$(this).is(':checked'));
    });
    /*
    $(".pst-select").select2(
      {
       multiple:false,
       placeholder:'',
       allowClear: true,
       matcher:customMatcher,
       templateResult:function(data)
       {
          if(!data.id) return data.text;
          let div = $(data.element).data('div');
          let dep = $(data.element).data('dep');
          let sec = $(data.element).data('sec');
          let pos = $(data.element).data('pos');
          return $('<span>' + data.text + '</span>');
       },
       templateSelection: function(data) {
        return data.text; // แสดงเฉพาะชื่อหลังเลือก
      }
  
      });
    
      $(".ist-select").select2(
        {
         multiple:false,
         placeholder:'',
         allowClear: true,
         matcher:customMatcher,
         templateResult:function(data)
         {
            if(!data.id) return data.text;
            let div = $(data.element).data('div');
            let dep = $(data.element).data('dep');
            let sec = $(data.element).data('sec');
            let pos = $(data.element).data('pos');
            return $('<span>' + data.text + '</span>');
         },
         templateSelection: function(data) {
          return data.text; // แสดงเฉพาะชื่อหลังเลือก
        }
    
        }); */
         

        /*
        $(".emp-select").select2(
          {
          width: 'style',          // ใช้ style ของ select เดิม
           dropdownParent: $('#tableemp'), // บังคับ dropdown อยู่ใน table
           multiple:false,
           placeholder:'',
           allowClear: true,
           matcher:customMatcher,
           templateResult:function(data)
           {
              if(!data.id) return data.text;
              let div = $(data.element).data('div');
              let dep = $(data.element).data('dep');
              let sec = $(data.element).data('sec');
              let pos = $(data.element).data('pos');
              return $('<span>' + data.text + '</span>');
           },
           templateSelection: function(data) {
            return data.text; // แสดงเฉพาะชื่อหลังเลือก
          }
      
          });*/

        /*  $('#dietary_require').select2({
            tags: true,               // เปิดให้พิมพ์ค่าใหม่เอง
            placeholder: "",
            allowClear: true
          });
          */


          const $tableBody = $('#tablevisitor tbody');
          const $table = $('#tablevisitor');
          // init แถวแรก
          //$tableBody.find('.dietary_require').select2({ width: '100%' });
          const iddietary  = $tableBody.find('.dietary_require');
          await setSelect2({ element: iddietary , selectionCssClass: "w-40", width: '100%'});
          
          // Event Delegation: ตรวจสอบเมื่อค่าเปลี่ยนแล้ว
          $tableBody.on("change", ".dietary_require", function () {
            const $select = $(this);
            const val = $select.val();
          
            // เฉพาะ Food Allergies / Other
            if (val === "Food Allergies" || val === "Other") {
              const customText = prompt("Please specify:");
              if (customText) {
                const newVal = val + " – " + customText;
          
                // เพิ่ม option ใหม่และเลือกมัน
                if ($select.find("option[value='" + newVal + "']").length === 0) {
                  const newOption = new Option(newVal, newVal, true, true);
                  $select.append(newOption);
                }
                $select.val(newVal).trigger("change.select2");
              } else {
                // ถ้า cancel ให้รีเซ็ต select
                $select.val(null).trigger("change.select2");
              }
            }
          });

          $(document).on('click', '#addVisitorBtn', async function () {
            const $firstRow = $tableBody.find('tr:first');
            const $newRow = $('<tr/>');
            const countryVal = $firstRow.find('[name="country[]"]').val();
            const companyVal = $firstRow.find('[name="company[]"]').val();
        
            const selectPromises = []; // เก็บ promise ของ setSelect2
        
            $firstRow.children('td').each(function () {
                const $td = $('<td/>').html($(this).html());
        
                // -------------------------- dietary_require
                $td.find('.dietary_require').remove();
                const $origSelect = $(this).find('.dietary_require');
                if ($origSelect.length) {
                    const $freshSelect = $('<select/>', {
                        name: $origSelect.attr('name'),
                        class: $origSelect.attr('class'),
                        id: 'dietary_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
                    });
        
                    // copy options ปกติเท่านั้น
                    $origSelect.find('option').each(function () {
                        const val = $(this).val();
                        const text = $(this).text();
        
                        if (val === "Food Allergies" || val === "Other" || !val.includes("–")) {
                            $freshSelect.append($('<option/>', { value: val, text: text }));
                        }
                    });
        
                    $td.empty().append($freshSelect);
        
                    // ใช้ setSelect2 และเก็บ promise
                    selectPromises.push(setSelect2({
                        element: $freshSelect,
                        size: 'base',
                        placeholder: 'Select Dietary Requirements',
                        width: '100%'

                    }));
                }
        
                $newRow.append($td);
            });
        
            // append แถวก่อน เพื่อให้ dropdownParent ทำงานถูกต้อง
            $tableBody.append($newRow);
        
            // รอให้ทุก select2 ทำงานเสร็จแบบ parallel
            await Promise.all(selectPromises);
        
            // -------------------------- ใส่ค่าที่เก็บไว้กลับไป
            $newRow.find('[name="country[]"]').val(countryVal);
            $newRow.find('[name="company[]"]').val(companyVal);
        
            // -------------------------- reset input, textarea
            $newRow.find('input[type="text"], textarea').each(function () {
                const name = $(this).attr('name');
                if (name !== 'country[]' && name !== 'company[]') {
                    $(this).val('');
                }
            });
        
            // -------------------------- reset checkbox, radio, select อื่น ๆ
            $newRow.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
        
            $newRow.find('select').each(function () {
                if ($(this).hasClass('dietary_require')) {
                    $(this).val(null).trigger('change'); // reset select2
                } else {
                    $(this).val(''); // reset ค่า default
                }
            });
        
            // -------------------------- update ลำดับ
            const rowCount = $tableBody.find('tr').length;
            $newRow.find('td:first').text(rowCount);
        
            // -------------------------- แสดง/ซ่อน column ตาม header
            const $thead = $table.find('thead tr th');
            $thead.each(function (i) {
                const isVisible = $(this).is(':visible');
                if (!isVisible) $newRow.find('td').eq(i).hide();
                else $newRow.find('td').eq(i).show();
            });
        
            $newRow.find('td:first').addClass($firstRow.find('td:first').attr('class'))
                .attr('tabindex', 0)
                .css('left', '0px');
        });
        
          

          

           // --- Table emp / employee -> pos-col ---
          const tableEmpBody = $('#tableemp tbody');
          const tableemp = $('#tableemp');
         // tableEmpBody.find('.dietary_require').select2({ width: '100%' });
         await setSelect2({ element: tableEmpBody.find('.dietary_require') , selectionCssClass: "w-40", width: '100%'});


          // Employee select change -> update pos-col
          tableEmpBody.on('change', '.emp-select', function() {
            const select = $(this);
            const row = select.closest('tr');
            const pos = select.find('option:selected').data('pos') || '';
            row.find('.pos-col').text(pos);
          });

          // Dietary_require prompt (Other/Food Allergies) for #tableemp
          tableEmpBody.on("change", ".dietary_require", function () {
            const select = $(this);
            const val = select.val();
            if (val === "Food Allergies" || val === "Other") {
              const customText = prompt("Please specify:");
              if (customText) {
                const newVal = val + " – " + customText;
                if (select.find("option[value='" + newVal + "']").length === 0) {
                  const newOption = new Option(newVal, newVal, true, true);
                  select.append(newOption);
                }
                select.val(newVal).trigger("change.select2");
              } else {
                select.val(null).trigger("change.select2");
              }
            }
          });





          $(document).on('click', '#addEmpBtn', async function () {
            const firstRow = tableEmpBody.find('tr:first');
            const newRow = $('<tr/>');
        
            const tds = firstRow.children('td').toArray();
            const selectPromises = []; // เก็บ promise ของ setSelect2
        
            for (let i = 0; i < tds.length; i++) {
                const tdElem = tds[i];
                const td = $('<td/>').html($(tdElem).html());
        
                // -------------------------- emp-select
                td.find('.emp-select').remove();
                const empSelect = $(tdElem).find('.emp-select');
                if (empSelect.length) {
                    const freshEmp = $('<select/>', {
                        name: empSelect.attr('name'),
                        class: empSelect.attr('class'),
                        style: 'width:100%',
                        id: 'emp_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
                    });
        
                    empSelect.find('option').each(function () {
                        const val = $(this).val();
                        const text = $(this).text();
                        freshEmp.append(
                            $('<option/>', { value: val, text: text })
                                .attr('data-pos', $(this).data('pos'))
                                .attr('data-div', $(this).data('div'))
                                .attr('data-dep', $(this).data('dep'))
                                .attr('data-sec', $(this).data('sec'))
                        );
                    });
        
                    td.empty().append(freshEmp);
        
                    // เก็บ promise ของ setSelect2
                    selectPromises.push(setSelect2({
                        element: freshEmp,
                        size: 'base',
                        placeholder: 'Select Name',
                        dropdownParent: $('#tableemp'),
                        selectionCssClass: "w-96",
                        width: '384px',
                        matcher: customMatcher
                    }));
                }
        
                // -------------------------- dietary_require
                td.find('.dietary_require').remove();
                const origSelect = $(tdElem).find('.dietary_require');
                if (origSelect.length) {
                    const freshSelect = $('<select/>', {
                        name: origSelect.attr('name'),
                        class: origSelect.attr('class'),
                        id: 'dietary_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
                    });
        
                    origSelect.find('option').each(function () {
                        const val = $(this).val();
                        const text = $(this).text();
                        if (val === "Food Allergies" || val === "Other" || !val.includes("–")) {
                            freshSelect.append($('<option/>', { value: val, text: text }));
                        }
                    });
        
                    td.empty().append(freshSelect);
        
                    selectPromises.push(setSelect2({
                        element: freshSelect,
                        size: 'base',
                        placeholder: 'Select Dietary Requirements',
                        width: '100%'
                    }));
                }
        
                // -------------------------- คอลัมน์ที่ 3 (index 2)
                if (i === 2) {
                    td.addClass('pos-col').text('');
                }
        
                newRow.append(td);
            }
        
            // append แถวก่อน เพื่อให้ dropdownParent ทำงานได้ถูกต้อง
            tableEmpBody.append(newRow);
        
            // รอให้ setSelect2 ของทุก select ทำงานแบบ parallel
            await Promise.all(selectPromises);
        
            // -------------------------- reset select value
            newRow.find('select').each(function () {
                if ($(this).hasClass('dietary_require')) {
                    $(this).val(null).trigger('change');
                } else {
                    $(this).val('Y');
                }
            });
        
            // -------------------------- update ลำดับ
            const rowCount = tableEmpBody.find('tr').length;
            newRow.find('td:first').text(rowCount);
        
            // -------------------------- แสดง/ซ่อน column ตาม header
            const thead = tableemp.find('thead tr th');
            thead.each(function (i) {
                const isVisible = $(this).is(':visible');
                if (!isVisible) newRow.find('td').eq(i).hide();
                else newRow.find('td').eq(i).show();
            });
        
            newRow.find('td:first').addClass(firstRow.find('td:first').attr('class'))
                .attr('tabindex', 0)
                .css('left', '0px');
        });

        
          $(".emp-select").each(function() {
            var pos = $(this).find("option:selected").data("pos") || "";
            $(this).closest("tr").find(".pos-col").text(pos);
        });

         /* $('#dietary_require').on('select2:select', function(e) {
            var data = e.params.data;
            var selected = data.text;
        
            // ถ้าเลือก Food Allergies หรือ Other แล้ว user พิมพ์เพิ่ม
            if (selected !== "Food Allergies" && selected !== "Other") return;
        
            // prompt ให้ user กรอกเพิ่ม
            var extra = prompt("Please specify:"); 
            if (extra) {
              var finalText = selected + " – " + extra;
        
              // เอาค่าใหม่ใส่แทน
              var newOption = new Option(finalText, finalText, true, true);
              $('#dietary_require').append(newOption).trigger('change');
        
              // ลบ option เดิมออก (กันไม่ให้มี "Food Allergies" ลอยๆ)
              $('#dietary_require').find("option[value='" + selected + "']").prop("selected", false);
              $('#dietary_require').trigger('change');
            }
          });*/

        $(document).on('click', '#updateBtn', function() {
            $('#newVersion').val($('#formVersion').val());
            $('#modal').removeClass('hidden').addClass('flex');
        });
        
        $(document).on('click', '#cancelBtn', function() {
            $('#modal').removeClass('flex').addClass('hidden');
        });
        
        $(document).on('click', '#saveBtn', function() {
            const newVersion = $('#newVersion').val();
            $.ajax({
                url: host + "marform/MAR-VMS/form/update_form_version",
                type: "post",
                dataType: "json",
                data: {formVersion:newVersion},
                success: function(data) {
                
                      if(data.status) {
                        $('#formVersion').val(newVersion); // อัปเดต input เฉพาะเมื่อ save สำเร็จ
                        $('#modal').removeClass('flex').addClass('hidden');
                    } else {
                          Swal.fire({
                            icon: "error",
                            title: "Failed to update form version",
                            text: "Please try again",
                          });
                    }
        
                },
                error: function(err) { 
              
                  console.error(err); 
                
                }
            });
        
            $('#modal').removeClass('flex').addClass('hidden');
        });
        
      
        $(document).on('change', '#visitor_file', async function(e)  {
          const file = e.target.files[0];
          if (!file) return;
      
          const data = await readInput(file, { startRow: 2, maxReadRow: 500 });
      
          const $tbody = $('#tablevisitor tbody');
          $tbody.empty();
      
         // const dietaryOptions = ['Vegetarian','Vegan','Halal','Kosher']; // ใส่ list จริงของคุณแทน

     
      
          $.each(data, function(index, row) {
              const tr = $('<tr class="bg-white"></tr>');
      
              // No.
              tr.append(`<td class="px-2 py-2 sticky left-0 bg-white z-15">${index+1}</td>`);
      
              // Country, Company, Name, Position
              tr.append(`<td class="px-2 py-2"><input type="text" name="country[]" value="${row[0]||''}" class="input input-bordered rounded-xl w-full"/></td>`);
              tr.append(`<td class="px-2 py-2"><input type="text" name="company[]" value="${row[1]||''}" class="input input-bordered rounded-xl w-full"/></td>`);
              tr.append(`<td class="px-2 py-2"><input type="text" name="name[]" value="${row[2]||''}" class="input input-bordered rounded-xl w-full"/></td>`);
              tr.append(`<td class="px-2 py-2"><input type="text" name="pos[]" value="${row[3]||''}" class="input input-bordered rounded-xl w-full"/></td>`);
      
              // Previous Visit Experience (select)
              const expSelect = $('<select name="exp[]" class="input input-bordered rounded-xl w-full"></select>');
              expSelect.append('<option value=""></option>');
              expSelect.append('<option value="Y">Yes</option>');
              expSelect.append('<option value="N">No</option>');
              if(row[4]) {
                expSelect.find('option').filter(function() {
                    return $(this).text() === row[4]; // row[4] = "Yes" หรือ "No" จาก Excel
                }).prop('selected', true);
            }
              tr.append($('<td class="px-2 py-2"></td>').append(expSelect));
      
              // Lunch Provided (select)
              const lunchSelect = $('<select name="lunch_provided[]" class="input input-bordered rounded-xl w-full"></select>');
              lunchSelect.append('<option value=""></option>');
              lunchSelect.append('<option value="Y">Yes</option>');
              lunchSelect.append('<option value="N">No</option>');
              if(row[5]) {
                lunchSelect.find('option').filter(function() {
                    return $(this).text() === row[5]; // row[5] = "Yes" หรือ "No"
                }).prop('selected', true);
              }
              tr.append($('<td class="px-2 py-2"></td>').append(lunchSelect));
      
              // Dinner Provided (select)
              const dinnerSelect = $('<select name="dinner_provided[]" class="input input-bordered rounded-xl w-full"></select>');
              dinnerSelect.append('<option value=""></option>');
              dinnerSelect.append('<option value="Y">Yes</option>');
              dinnerSelect.append('<option value="N">No</option>');
              if(row[6]) {
                dinnerSelect.find('option').filter(function() {
                    return $(this).text() === row[6]; // row[6] = "Yes" หรือ "No" จาก Excel
                }).prop('selected', true);
            }
              tr.append($('<td class="px-2 py-2"></td>').append(dinnerSelect));
      
              // Dietary Requirements (select)
              const dietarySelect = $('<select name="dietary_require[]"  class="dietary_require input input-bordered rounded-xl w-full"></select>');
              dietarySelect.append('<option value=""></option>');
              dietaryOptions.forEach(opt => dietarySelect.append(`<option value="${opt}">${opt}</option>`));
              if(row[7]) dietarySelect.val(row[7]);
              tr.append($('<td class="px-2 py-2"></td>').append(dietarySelect));
      
              $tbody.append(tr);
          });
      });


});

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

tablevisitor = await createTable({
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
  id: '#tablevisitor',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

tableemp = await createTable({
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
  id: '#tableemp',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});



// --- สร้าง DataTable ---
const tablesec = await createTable({
  ordering: false,
  paging: false,
  searching: false,
  info: false,
  createdRow: function (row, data, dataIndex) {
      $('td:eq(0)', row)
          .addClass('px-2 py-2 sticky-column text-gray-500')
          .css({
              left: 0,
              position: 'sticky',
              background: 'white',
              'z-index': 10
          });
  }  
},{
  id: '#tablesec',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

const table = $('#tablesec').DataTable(); // แทน tablesec

// สร้าง main-row + detail-row
let rowIndex = 1;
Object.entries(sproj).forEach(([projno, items]) => {

    const mappedItems = items.map(it => ({
        PRJ_NO: projno,
        PRJ_NAME: it.PROJNAME,
        MODEL: it.MODEL,
        SPEC: it.SPEC,
        TOTUNIT: it.QTY,
        EXPPLAN: it.STATUS
    }));

    // --- Add Main Row ผ่าน DataTable API ---
    const mainRowNode = table.row.add([
        `<td class="px-2 py-2 sticky-column text-gray-500" style="left:0;position:sticky;background:white;z-index:10">${rowIndex}</td>`,
        `<td><input type="text" name="secured_project_no[]" value="${projno}" class="w-full border border-blue-200 rounded-lg px-2 py-1 sproj"></td>`,
        '', '', '', '', ''
    ]).draw(false).node();
   
    $(mainRowNode)
        .addClass('main-row')
        .attr('data-rowid', rowIndex)
        .data('details', mappedItems);

    // --- Add Detail Rows ด้วย jQuery หลัง mainRowNode ---
    mappedItems.forEach(item => {
        const expDate = item.EXPPLAN ? new Date(item.EXPPLAN).toLocaleDateString('en-GB') : '';
        console.log("xxxxxx");
        const detailHtml = `
            <tr class="detail-row bg-gray-50 text-gray-700">
                <td class="px-2 py-2 sticky-column" style="left:0;"></td>
                <td></td>
                <td>${item.PRJ_NAME}<input type="hidden" name="sprojname_${item.PRJ_NO}[]" value="${item.PRJ_NAME}"></td>
                <td>${item.MODEL}<input type="hidden" name="sprojmodel_${item.PRJ_NO}[]" value="${item.MODEL}"></td>
                <td>${item.SPEC}<input type="hidden" name="sprojspec_${item.PRJ_NO}[]" value="${item.SPEC}"></td>
                <td>${item.TOTUNIT}<input type="hidden" name="sprojqty_${item.PRJ_NO}[]" value="${item.TOTUNIT}"></td>
                <td>${expDate}<input type="hidden" name="sprojsta_${item.PRJ_NO}[]" value="${expDate}"></td>
            </tr>
        `;
        $(mainRowNode).after(detailHtml); // แทรกหลัง main-row
    });

    rowIndex++;
});

// --- redraw DataTable เพื่อให้ sticky column และ scroll ถูกต้อง ---
table.rows().invalidate().draw(false);




tablepro = await createTable({
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
  id: '#tablepro',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

tablepst = await createTable({
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
  id: '#tablepst',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

tableist = await createTable({
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
  id: '#tableist',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});
toggleAmecTab();
toggleColumnByHeader('tablevisitor','Lunch Provided', $('#hasLunch').is(':checked'));
toggleColumnByHeader('tablevisitor','Dinner Provided', $('#hasDinner').is(':checked'));
toggleColumnByHeader('tableemp','Lunch Provided', $('#hasLunch').is(':checked'));
toggleColumnByHeader('tableemp','Dinner Provided', $('#hasDinner').is(':checked'));
toggleColumnByHeader('tablevisitor', 'Dietary Requirements',  $('#hasLunch').is(':checked') || $('#hasDinner').is(':checked'));
toggleColumnByHeader('tableemp', 'Dietary Requirements',  $('#hasLunch').is(':checked') || $('#hasDinner').is(':checked'));

});
/*
const bookRoomBtn = document.getElementById('bookRoomBtn');
const bookRoomModal = document.getElementById('bookRoomModal');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmModalBtn = document.getElementById('confirmModalBtn');

bookRoomBtn.addEventListener('click', () => bookRoomModal.classList.remove('hidden'));
cancelModalBtn.addEventListener('click', () => bookRoomModal.classList.add('hidden'));
confirmModalBtn.addEventListener('click', async () => {
  bookRoomModal.classList.add('hidden');
  try {
    const password = $("#passwordInput").val().trim();
    const email = await getEmail(); // รอให้ได้ email จริงๆ
    const subject = $('span[data-field="purpose"]').text();
    const stdate = $("#visitDate").val();
    const selectedOption = $("#bookingTime option:selected");
    let startTime = selectedOption.attr("data-start");
    let endTime = selectedOption.attr("data-end");
    let room = $('span[data-field="receptroom"]').text();

    const data = {
      email: email,
      password: password,
      subject: subject,
      message: "",
      startdate: stdate,
      starttime: startTime,
      enddate: stdate,
      endtime: endTime,
      room: room,
      attendees: [email],
    };
    // เรียก bookingroom
    console.log(room);
    await bookingroom(data);
    room = $('span[data-field="roomlunch"]').text();
    if(room != "")
    {   
      console.log(room);
      const lunchData = {
        ...data,
        starttime: "12:00 PM",
        endtime: "01:00 PM",
        room: room,
      };
      await bookingroom(lunchData);
    }

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err,
    });
  }
});

bookRoomModal.addEventListener('click', (e) => {
  if (e.target === bookRoomModal) bookRoomModal.classList.add('hidden');
});
*/

$(document).on('click', '#addRowBtn', function () {
  const $tableBody = $('#tablesch tbody');
  const $firstRow = $tableBody.find('tr:first');

 // $firstRow.find('.participants-select').select2('destroy');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });


  //initSelect2(".participants-select",$firstRow);
  //initSelect2(".participants-select",$newRow);

    // เพิ่มแถวใหม่ลงใน tbody
    $tableBody.append($newRow);
  //tablesch.row.add($(newRow)[0]).draw(false); // ใช้ [0] เพื่อใส่ element raw HTML
});

$(document).on('click', '#addPstBtn', function () {
  const $tableBody = $('#tablepst tbody');
  const $firstRow = $tableBody.find('tr:first');

  //$firstRow.find('.pst-select').select2('destroy');
  destroySelect2($firstRow.find('.pst-select'));
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });
  $newRow.find('.grp-col').text("");
  initSelect2(".pst-select",$firstRow);
  initSelect2(".pst-select",$newRow);

  const rowCount = $tableBody.find('tr').length + 1;
  $newRow.find('td:first').text(rowCount);

    // เพิ่มแถวใหม่ลงใน tbody
    $tableBody.append($newRow);
  //tablesch.row.add($(newRow)[0]).draw(false); // ใช้ [0] เพื่อใส่ element raw HTML
});


$(document).on('click', '#addIstBtn', function () {
  const $tableBody = $('#tableist tbody');
  const $firstRow = $tableBody.find('tr:first');

  //$firstRow.find('.ist-select').select2('destroy');
  destroySelect2($firstRow.find('.ist-select'));
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });
  $newRow.find('.grp-col').text("");
  initSelect2(".ist-select",$firstRow);
  initSelect2(".ist-select",$newRow);

  const rowCount = $tableBody.find('tr').length + 1;
  $newRow.find('td:first').text(rowCount);

    // เพิ่มแถวใหม่ลงใน tbody
    $tableBody.append($newRow);
  //tablesch.row.add($(newRow)[0]).draw(false); // ใช้ [0] เพื่อใส่ element raw HTML
});



async function initSelect2($cls, $context) {
  await setSelect2({
    element: $context.find($cls),
    selectionCssClass: "w-96", width: '384px'
  });
}



// --- Add Main Row ---
$(document).on('click', '#addSecBtn', function () {
  const table = $('#tablesec').DataTable();
  const mainRowCount = $('#tablesec tbody tr.main-row').length + 1;

  const $firstRow = $('#tablesec tbody tr.main-row:first');
  const tdClasses = [];
  $firstRow.find('td').each(function(){
      tdClasses.push($(this).attr('class') || '');
  });

  const $tr = $('<tr class="main-row" data-rowid="' + mainRowCount + '" data-details="[]"></tr>');

  tdClasses.forEach((cls, idx) => {
      let $td;
      if(idx === 0) $td = $('<td></td>').addClass(cls).text(mainRowCount);
      else if(idx === 1){
          $td = $('<td></td>').addClass(cls);
          const $input = $('<input>',{
              type:'text',
              name:'secured_project_no[]',
              class:'w-full border border-blue-200 rounded-lg px-2 py-1 sproj',
              placeholder:'Enter Project No.'
          });
          $td.append($input);
      } else $td = $('<td></td>').addClass(cls);
      $tr.append($td);
  });

  table.row.add($tr).draw(false);
});

// --- Show Detail Row ---
$(document).on('change', '.sproj', async function(){
  const data = await getPrj({ PRJ_NO: $(this).val() });
  const table = $('#tablesec').DataTable();
  const $mainRow = $(this).closest('tr');

  // ลบ detail-row เก่า
  $mainRow.nextUntil('tr.main-row').remove();

  // เก็บ detail data ไว้ใน main-row
  $mainRow.data('details', data);


  // สร้าง detail-row ใหม่
  if(data && data.length > 0){
      let detailRows = '';
      data.forEach((item, idx) => {
            let expDate = parseEXPPLAN(item.EXPPLAN);


          detailRows += `
              <tr class="detail-row bg-gray-50 text-gray-700">
                  <td class="px-2 py-2 sticky-column text-gray-500" style="left:0;"></td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2">${item.PRJ_NAME || ''}<input type="hidden" name="sprojname_${item.PRJ_NO}[]" value="${item.PRJ_NAME}"></td>
                  <td class="px-2 py-2">${item.MODEL || ''}<input type="hidden" name="sprojmodel_${item.PRJ_NO}[]" value="${item.MODEL}"></td>
                  <td class="px-2 py-2">${item.SPEC || ''}<input type="hidden" name="sprojspec_${item.PRJ_NO}[]" value="${item.SPEC}"></td>
                  <td class="px-2 py-2">${item.TOTUNIT || ''}<input type="hidden" name="sprojqty_${item.PRJ_NO}[]" value="${item.TOTUNIT}"></td>
                  <td class="px-2 py-2">${expDate}<input type="hidden" name="sprojsta_${item.PRJ_NO}[]" value="${expDate}"></td>
              </tr>
          `;
      });

      $(detailRows).insertAfter($mainRow);
  }
});

// --- เมื่อ DataTable redraw ---
// render detail-row ใหม่จาก data ที่เก็บ
$('#tablesec').on('draw.dt', function(){

  $('#tablesec tbody tr.main-row').each(function(){
      const $mainRow = $(this);
      const data = $mainRow.data('details') || [];
      $mainRow.nextUntil('tr.main-row').remove();
      if(data.length > 0){
          let detailRows = '';
          data.forEach((item, idx) => {
              let expDate = parseEXPPLAN(item.EXPPLAN);
              detailRows += `
                  <tr class="detail-row bg-gray-50 text-gray-700">
                      <td class="px-2 py-2 sticky-column text-gray-500" style="left:0;" ></td>
                      <td class="px-2 py-2"></td>
                      <td class="px-2 py-2">${item.PRJ_NAME || ''}<input type="hidden" name="sprojname_${item.PRJ_NO}[]" value="${item.PRJ_NAME}"></td>
                      <td class="px-2 py-2">${item.MODEL || ''}<input type="hidden" name="sprojmodel_${item.PRJ_NO}[]" value="${item.MODEL}"></td>
                      <td class="px-2 py-2">${item.SPEC || ''}<input type="hidden" name="sprojspec_${item.PRJ_NO}[]" value="${item.SPEC}"></td>
                      <td class="px-2 py-2">${item.TOTUNIT || ''}<input type="hidden" name="sprojqty_${item.PRJ_NO}[]" value="${item.TOTUNIT}"></td>
                      <td class="px-2 py-2">${expDate}<input type="hidden" name="sprojsta_${item.PRJ_NO}[]" value="${expDate}"></td>
                  </tr>
              `;
          });
          $(detailRows).insertAfter($mainRow);
      }
  });
});


$(document).on('click', '#addProBtn', function () {

  const $tableBody = $('#tablepro tbody');
  const $firstRow = $tableBody.find('tr:first');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });

    // นับจำนวนแถวเพื่อกำหนดหมายเลข No.
    const rowCount = $tableBody.find('tr').length + 1;
    $newRow.find('td:first').text(rowCount);

  // เพิ่มแถวใหม่ลงใน tbody
  $tableBody.append($newRow);

});

$(document).on("change", "input[name='guestDetail']", function() {
  if ($("#gov").is(":checked")) {
      $("#govTooltip").removeClass("hidden");

      // ให้ tooltip หายไปเองหลัง 3 วินาที
      setTimeout(function() {
          $("#govTooltip").addClass("hidden");
      }, 3000); // 3000 = 3 วินาที
  } else {
      $("#govTooltip").addClass("hidden");
  }
});

$(document).on('change', '.emp-select', function() {
  const $select = $(this);
  const $row = $select.closest('tr'); // หาแถวของ select ที่เปลี่ยน
  const pos = $select.find('option:selected').data('pos') || ''; // ดึง data-pos ของ option ที่เลือก

  $row.find('.pos-col').text(pos); // แสดงใน td.pos-col
});

$(document).on('click', '#btn-submit-form', function() {
  const cyear2 = $("#cyear2").val();
  const nrunno = $("#nrunno").val();
    // ตรวจสอบว่ามีค่า
    if (cyear2 && nrunno) {
        loaddata(cyear2, nrunno);
    } 
    if($("#mode").val() == "1")
    {
       $('.confirm-btn').removeClass('hidden');
       $('.export-btn').removeClass('hidden');
    }
  //loaddata($("#cyear2").val(),$("#nrunno").val());
});



/*

$(document).on('change', '.sproj', async function() {
  const data = await getPrj({PRJ_NO: $(this).val()});
  const $row = $(this).closest('tr');
  const table = $row.closest('table').DataTable();   // ใช้ DataTable instance
  const rowIdx = table.row($row).index();

  // ลบ detail เดิม
  while ($row.next().hasClass('detail-row')) {
    table.row($row.next()).remove().draw(false);
  }
   console.log("xxxxxxxxxxx");
  if (data && data.length > 0) {
    console.log("else");
    let insertPos = rowIdx;
    data.forEach(item => {
      let expDate = '';
      if (item.EXPPLAN) {
        const d = new Date(item.EXPPLAN);
        const dd = String(d.getDate()).padStart(2,'0');
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const yyyy = d.getFullYear();
        expDate = `${dd}/${mm}/${yyyy}`;
      }
      insertPos++;
      const newRow = table.row.add([
        '',
        '',
        item.PRJ_NAME,
        item.MODEL,
        item.SPEC,
        item.TOTUNIT,
        expDate
      ]).draw(false).node();
     
      // ใส่ class .detail-row
      $(newRow).addClass('detail-row');
      $(newRow).find('td:first').addClass('px-2 py-2 sticky-column dt-type-numeric dtr-control');

    });
  }
  //https://amecwebtest.mitsubishielevatorasia.co.th/api/mkt/orders/sproj
});

*/






export const getPrj = async (data) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${process.env.APP_API}/mkt/orders/sproj/`,
      type: "POST",
      dataType: "json",
      data: data,
      success: function (response) {
        resolve(response);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
};



function toggleColumnByHeader(tableId, headerText, isVisible) {
  const $table = $('#' + tableId);
  const $thead = $table.find('thead tr th');
  const $rows = $table.find('tbody tr');

  // หาดัชนีของคอลัมน์โดยใช้ชื่อหัวตาราง
  const index = $thead.filter(function () {
    return $(this).text().trim() === headerText;
  }).index();

  if (index === -1) return;

  // ซ่อน/แสดงหัวตาราง
  $thead.eq(index).toggle(isVisible);

  // ซ่อน/แสดง td ในแต่ละแถว
  $rows.each(function () {
    $(this).find('td').eq(index).toggle(isVisible);
  });
}

function toggleAmecTab() {
 // console.log("TTTTTTTTTTTTT");
  const hasLunch = $('#hasLunch').is(':checked');
  const hasDinner = $('#hasDinner').is(':checked');

  if (hasLunch || hasDinner) {
   // console.log("Iffffffffffffffff");
    $('button[data-tab="tab-meal"]').removeClass('hidden');
  } else {
    //console.log("Elseeeeeeeeeeeeeee");
    $('button[data-tab="tab-meal"]').addClass('hidden');
    //$('#tab4-btn').addClass('hidden');
   // $('#tab4').addClass('hidden');
  }
}


function customMatcher(params, data) {
  if ($.trim(params.term) === '') return data;

  let searchTerms = params.term.toLowerCase().split(/\s+/);

  // ดึงค่าจาก option
  let name = (data.text || '').toLowerCase();
  let div = ($(data.element).data('div') || '').toLowerCase();
  let dep = ($(data.element).data('dep') || '').toLowerCase();
  let sec = ($(data.element).data('sec') || '').toLowerCase();
  let pos = ($(data.element).data('pos') || '').toLowerCase();

  let isMatch = searchTerms.every(term => {
    return name.includes(term) || div.includes(term) || dep.includes(term) || sec.includes(term) || pos.includes(term);
  });

  return isMatch ? data : null;
}

/*
function initSelect2($cls,$context) {
  $context.find($cls).select2({
    placeholder: "",
    allowClear: true, 
    matcher: customMatcher, // ใช้ฟังก์ชัน matcher ที่เขียนไว้
    width: '100%'
  });
}*/
/*
function initSelect2($cls, $context) {
  $context.find($cls).each(function() {
    let $el = $(this);
    
    $el.select2({
      placeholder: "",
      allowClear: true,
      matcher: customMatcher,
      width: '100%'
    });

    // ถ้าเป็น dietary_require ให้ bind event พิเศษ
    if ($el.hasClass("dietary_require")) {
      $el.on("select2:selecting", function (e) {
        let data = e.params.args.data;
        let $select = $(this);

        if (data.id === "Food Allergies") {
          e.preventDefault();
          let customText = prompt("Please specify your food allergy:");
          if (customText) {
            let newVal = "Food Allergies – " + customText;
            let newOption = new Option(newVal, newVal, true, true);
            $select.append(newOption).trigger("change");
          }
        }

        if (data.id === "Other") {
          e.preventDefault();
          let customText = prompt("Please specify:");
          if (customText) {
            let newVal = "Other – " + customText;
            let newOption = new Option(newVal, newVal, true, true);
            $select.append(newOption).trigger("change");
          }
        }
      });
    }
  });
}
*/

// init select2 ธรรมดา
/*
function initSelect2($cls, $context) {
  $context.find($cls).select2({
    placeholder: "",
    allowClear: true,
    matcher: customMatcher,
    width: '100%'
  });
}
*/






$(document).on('change', '#hasLunch', function () {
  const showLunch = $('#hasLunch').is(':checked');
  const showDinner = $('#hasDinner').is(':checked');
  toggleAmecTab();
  toggleColumnByHeader('tablevisitor', 'Lunch Provided', showLunch);
  toggleColumnByHeader('tablevisitor', 'Dietary Requirements', showLunch || showDinner);
  toggleColumnByHeader('tableemp', 'Lunch Provided', showLunch);
  toggleColumnByHeader('tableemp', 'Dietary Requirements', showLunch || showDinner);

 
});

$(document).on('change', '#hasDinner', function () {

  const showLunch = $('#hasLunch').is(':checked');
  const showDinner = $('#hasDinner').is(':checked');
  toggleAmecTab();
  toggleColumnByHeader('tablevisitor', 'Dinner Provided', showDinner);
  toggleColumnByHeader('tableemp', 'Dinner Provided', showDinner);
  toggleColumnByHeader('tablevisitor', 'Dietary Requirements', showLunch || showDinner);
  toggleColumnByHeader('tableemp', 'Dietary Requirements', showLunch || showDinner);

  
});

$(document).on("change", ".lunchSelect", function () {
  const value = $(this).val();
  const lunchPlaceSelectDiv = $("#lunchPlaceSelectDiv");
  const lunchPlaceInputDiv = $("#lunchPlaceInputDiv");
  if (value === "I") {
    lunchPlaceSelectDiv.removeClass('hidden');
    lunchPlaceInputDiv.addClass('hidden');
} else if (value === "O") {
    lunchPlaceInputDiv.removeClass('hidden');
    lunchPlaceSelectDiv.addClass('hidden');
} else {
    lunchPlaceSelectDiv.addClass('hidden');
    lunchPlaceInputDiv.addClass('hidden');
}
});

/**
 * Save
 */

 $(document).on("click", ".save-btn", async function () {
const tab = $(this).data("tab");
const formId = "form-" + tab;   // form ไหนที่ถูกกด
const form = $("#" + formId); // อ้างอิง form
const nfrmno = $("#nfrmno").val();
const vorgno = $("#vorgno").val();
const cyear = $("#cyear").val();
let nrunno =  $("#nrunno").val(); 
let cyear2 =  $("#cyear2").val();
let isValid = (tab === "visitarg") ? validateVisitTab(form)
              : (tab === "req") ? validateReqItemTab(form)
              : (tab === "stk" || tab === "sch" || tab === "inf" || tab === "meal"|| tab === "proj") ? validate(form)
              : true;
if (!isValid) return;

if(nrunno =="")
{
  const preform = {
    NFRMNO: nfrmno,                 // ตัวเลขตัวอย่าง
    VORGNO: vorgno,                // รหัสตัวอย่าง
    CYEAR: cyear ,                 // ปีปัจจุบัน
    REQBY: $("#empno").val(),      // ดึงจาก input
    INPUTBY: $("#empno").val(),    // ดึงจาก input
    REMARK: "",                     // remark ว่าง
    DRAFT: "0"                        // 0 = under preparation, 1 = wait for approval
  };
  console.log("create form");
  const vmsform = await createForm(preform);
  console.log(vmsform);
  const { NRUNNO,  CYEAR2 } = vmsform.data;
  $("#nrunno").val(NRUNNO);
  $("#cyear2").val(CYEAR2);
  nrunno = NRUNNO;
  cyear2 = CYEAR2;
}

const formData = buildFormData(form, {
  "nfrmno": nfrmno,
  "vorgno": vorgno,
  "cyear": cyear,
  "cyear2": cyear2,
  "nrunno":nrunno,
  "tab": tab 
});

try {
  const rssave = await save(formData);
  if (rssave.status == true) { 
    Swal.fire({
      icon: "success",
      title: "Data saved successfully",
      showConfirmButton: false,
      timer: 2000,
    });
    
  } else {
  
    Swal.fire({
      icon: "error",
      title: "Failed to save data",
      text: rssave.message || "Please try again",
    });
  }
}catch (err) {
  const con = {condition : {
      NFRMNO: nfrmno,                 
      VORGNO: vorgno,               
      CYEAR: cyear ,
      CYEAR2: cyear2,
      NRUNNO:nrunno
  }};
  const delform = await deleteFlowandForm(con);
  Swal.fire({
    icon: "error",
    title: "Error",
    text: err.message,
  });
}

});

$(document).on("click", ".confirm-btn", async function () {
  if(validate($("#form-submit")))
  {
    $(this).prop('disabled', true);
    createGPENT();
    updateform();
  }
});
$(document).on("click", ".send-btn", async function () {
  // $(this).prop('disabled', true);
  if(validate($("#form-submit")))
  {
      sendmailpic(); 
  }
});

/*$(document).on("click", ".bookroom-btn", async function () {
    console.log("xxxxxxxx");
  
});*/

$(document).on("click", ".export-btn", async function () {
  if(validate($("#form-submit")))
  {
    const vmscyear2 = $("#cyear2").val();
    const vmsnrunno = $("#nrunno").val();
    $.ajax({
      type: "POST",
      url: host + "marform/MAR-VMS/form/exportexcel",
      data: {vmscyear2: vmscyear2, vmsnrunno:vmsnrunno},
      dataType: 'json',
      beforeSend: function () {
        showLoader({ show: true });
      },
      success: function (res) {
              openExcel(res.filename, res.content);
      },
      complete: function (xhr, status) {
        showLoader({ show: false });
      },
      error: function (xhr) {
        Swal.fire({
          icon: "error",
          title: "Failed to export file.",
          text: xhr.responseText || "Failed to export file.",
        });
        
      },
    });

  }
});

$(document).on('change', '.pst-select', function() {
  let selected = $(this).find(":selected");
  let detail  = selected.data("detail");
  let row = $(this).closest("tr");
  if($(this).val()=="")
  {
    row.find(".grp-col").text("");
  }else
  {
    row.find(".grp-col").text(detail);
 
  }

});


$(document).on('change', '.ist-select', function() {
  let selected = $(this).find(":selected");
  let detail  = selected.data("detail");
  let row = $(this).closest("tr");
  if($(this).val()=="")
  {
    row.find(".grp-col").text("");
  }else
  {
    row.find(".grp-col").text(detail);
 
  }
});


/**
 * Delete file
 */
 $(document).on("click", ".delete-file", async function () {
  $(this).closest('.file-item').remove();
  var fid = $(this).closest('.file-item').attr("data-id");
  var nfile =  $(this).closest('.file-item').attr("data-filename");
  var fd =  $(this).closest('.file-item').attr("data-folder");
  const data = { fid: fid, nfile: nfile , fd:fd };
  const resdel =  await deletefile(data);
});



$(document).on("input", 'input[name="starttime[]"], input[name="endtime[]"]', function() {
  const parentRow = $(this).closest("td").parent();  // ดึง parent ของ td (จะได้ <tr> หรือ <div> ขึ้นกับ DataTables)
  
  const start = parentRow.find('input[name="starttime[]"]').val();
  const end   = parentRow.find('input[name="endtime[]"]').val();
  const diffInput = parentRow.find('input[name="diffmin[]"]'); // หาในแถวเดียวกัน

  if (start && end && diffInput.length) {
    const startTime = new Date("1970-01-01T" + start + ":00");
    const endTime   = new Date("1970-01-01T" + end + ":00");
    let diff = (endTime - startTime) / 60000;
    if (diff < 0) diff += 24 * 60;
    diffInput.val(diff);
  } else if (diffInput.length) {
    diffInput.val("");
  }
});

$(document).on("click", ".edit-btn", function() {
 
  const tab = $(this).data("tab"); // ดึงค่า data-tab ของปุ่มนั้น
  // ซ่อนทุก tab
  $(".tab-pane").addClass("hidden");
  // แสดง tab ที่ต้องการ
  $("#tab-" + tab).removeClass("hidden");
     // reset active menu
     $("li button[data-tab]").removeClass("active-tab border-blue-600 bg-white/30");

     // set active ให้ menu ที่ตรงกับ tab
     $("li button[data-tab='tab-" + tab + "']").addClass("active-tab border-blue-600 bg-white/30");
});


function buildFormData(form, extraData = {}) {
  const formData = new FormData(form[0]);
  
  if (form.attr("id") === "form-sch") {
 
    formData.append("visitDate", $("#visitDate").val());
  }
  if(form.attr("id") === "form-inf")
  {
    formData.append("hasLunch", $("#hasLunch").is(":checked") ? "Y" : "N");
    formData.append("hasDinner", $("#hasDinner").is(":checked") ? "Y" : "N");
  }

  for (const key in extraData) {
    if (extraData.hasOwnProperty(key)) {
      formData.append(key, extraData[key]);
    }
  }
  return formData;
}

function validateVisitTab(form) {
  let isValid = true;
  const shoptour = $("#shoptour").val();
  const newFiles = $("#specificAttachment")[0].files; // FileList ของไฟล์ใหม่
  const existingFiles = $("#attachmentDisplay .file-item"); // element ของไฟล์เดิม
  const newFilesG = $("#fileAttachment")[0].files; // FileList ของไฟล์ใหม่
  const existingFilesG = $("#attachmentfileDisplay .file-item"); // element ของไฟล์เดิม
  if (!form.find("[name='formVersion']").val()) {
    Swal.fire({
      icon: "warning",
      title: "Please enter Form Version",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    isValid = false;
  }
  if (!form.find("[name='salecom']").val()) {
    Swal.fire({
      icon: "warning",
      title: "Please enter Sale company",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    isValid = false;
  }
  if ($('#gov').is(':checked') &&  (newFilesG.length === 0) && (existingFilesG.length === 0)) 
  {
       
        Swal.fire({
          icon: "warning",
          title: "Please attach at least one file for Details of Guest case Government",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
          background: "#FBF6D9",
        });
        isValid = false;
  }
 
  if (shoptour === "S" && newFiles.length === 0 && existingFiles.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Please attach at least one file for Specific shop tour",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    isValid = false;
  }
  if(($("#carHotel").val()=="Y")&&($("#carHotelNote").val()==""))
  {
    Swal.fire({
      icon: "warning",
      title: "Please enter Additional Notes (Car Reservation Hotel)",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    isValid = false;
  }

  if($("#hasLunch").is(":checked")) 
  {
    if($("#lunch").val()=="")
    {
        Swal.fire({
          icon: "warning",
          title: "Please enter Lunch Location",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
          background: "#FBF6D9",
        });
        isValid = false;
    }else
    {
      if($("#lunch").val() == "I")
      {
        var place = $("#lunchPlaceSelect").val();
        $("#lunchPlace").val(place);

      }else if($("#lunch").val() == "O")
      {
        var place = $("#lunchPlaceInput").val();
        $("#lunchPlace").val(place);

      }
       if($("#lunchPlace").val()=="")
       {
          Swal.fire({
            icon: "warning",
            title: "Please enter Place(for Lunch)",
            toast: true,
            position: "top-end",
            timer: 3000,
            showConfirmButton: false,
            background: "#FBF6D9",
          });
          isValid = false;
       }
    }
  }
  if($("#hasDinner").is(":checked")) 
  {
    if($("#dinnerPlace").val()=="")
    {
       Swal.fire({
         icon: "warning",
         title: "Please enter Place (for Dinner)",
         toast: true,
         position: "top-end",
         timer: 3000,
         showConfirmButton: false,
         background: "#FBF6D9",
       });
       isValid = false;
    }
 }
  
  return isValid;
  }
  
  function openExcel(fileName, dataBase64){
		var fileType = fileName.split('.').pop();
		fileType = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
		var $a = $("<a>");
		$a.attr("href", fileType + dataBase64);
		$("body").append($a);
		$a.attr("download", fileName);
		$a[0].click();
		$a.remove();
		
   }

  function validateReqItemTab(form) {
    let isValid = true;
    const reqitm = $("#requireWelcomeBoard").val();
    const newFiles = $("#welcomeBoardFile")[0].files; // FileList ของไฟล์ใหม่
    const existingFiles = $("#attachmentreqDisplay .file-item"); // element ของไฟล์เดิม
    if ($("#nrunno").val() =="")
    {
      Swal.fire({
        icon: "warning",
        title: "Please complete and save the information in the Visit Arrangement section first.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      isValid = false;

    }
    if (reqitm === "Y" && newFiles.length === 0 && existingFiles.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Please attach at least one file for Welcome Board",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      isValid = false;
    }
    return isValid;
  }

  function validate(form)
  {
    let isValid = true;
    if ($("#nrunno").val() =="")
    {
      Swal.fire({
        icon: "warning",
        title: "Please complete and save the information in the Visit Arrangement section first.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      isValid = false;

    }
    return isValid;
  }

/**
 * Save Dwg
 * @param {array} data
 * @returns
 */
 function save(data) {
return new Promise((resolve) => {
  $.ajax({
    url: host + "marform/MAR-VMS/form/save",
    type: "post",
    dataType: "json",
    processData: false,
    contentType: false,
    data: data,
    beforeSend: function () {
      showLoader({ show: true });
    },
    success: function (res) {
      resolve(res);
    },
    complete: function (xhr, status) {
      showLoader({ show: false });
    },
  });
});
}

/**
 * Delete file
 * @param {array} data
 * @returns
 */
 function deletefile(data) {
  return new Promise((resolve) => {
    $.ajax({
      url: host + "marform/MAR-VMS/form/delfile",
      type: "post",
      dataType: "json",
      data: data,
      beforeSend: function () {
        showLoader({ show: true });
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        showLoader({ show: false });
      },
    });
  });
}

function getEmail() {
  return new Promise((resolve, reject) => {
    const empno = $("#empno").val();
    $.ajax({
      url: host + "marform/MAR-VMS/form/getEmail",
      type: "POST",
      dataType: "json",
      data: { empno: empno },
      success: function (response) {
        if (response && response.length > 0) {
          resolve(response[0].SRECMAIL); // คืนค่า email
        } else {
          reject("No email found");
        }
      },
      error: function (xhr) {
        reject(xhr.responseText || "Error while getting email");
      },
    });
  });
}

async function createGPENT() {
 
  if (!$("#hasLunch").is(":checked") && !$("#hasDinner").is(":checked")) return;

  const eno = "9";
  const evorgno = "030101";
  const ecyear = "25";
  const preform = {
      NFRMNO: eno,
      VORGNO: evorgno,
      CYEAR: ecyear,
      REQBY: $("#empno").val(),
      INPUTBY: $("#empno").val(),
      REMARK: ""
  };

  const orgType = $("input[name='guestDetail']:checked").val();
  const inputFiles = $("#fileAttachment")[0].files;
  const fname = inputFiles.length > 0
      ? inputFiles[0].name
      : ($("#attachmentfileDisplay .file-item").first().data("filename") || null);

// ฟังก์ชันช่วยประมวลผล table visitor/employee
const processTable = (tableSelector, mealType) => {
  const list = [];
  let qty = 0;

  $(`${tableSelector} tr.bg-white`).each(function (_, el) {
      const tr = $(el);
      const selName = mealType + "_provided[]";
      const val = tr.find(`select[name='${selName}']`).val();

      if (val === "Y") {
          const personName = tableSelector === "#tablevisitor"
              ? tr.find("input[name='name[]']").val()
              : tr.find("select[name='employee[]']").val();

          list.push(personName);
          qty++;
          
      }
  });

  return { list, qty };
};


  // ฟังก์ชันสร้าง FormData ของแต่ละมื้อ
  const buildFormDataEnt = async (mealType) => {
      const GPENTform = await createForm(preform);
      const { NRUNNO, CYEAR2 } = GPENTform.data;

      const formData = new FormData();
      formData.append("nfrmno", eno);
      formData.append("vorgno", evorgno);
      formData.append("cyear", ecyear);
      formData.append("cyear2", CYEAR2);
      formData.append("nrunno", NRUNNO);
      formData.append("other_details", "");
      formData.append("remark", "");
      formData.append("input_by", $("#empno").val());
      formData.append("requested_by", $("#empno").val());
      formData.append("entertain_date", $("#visitDate").val());

      const $selectPurpose = $("#purposevisit");
      const purposeText = $selectPurpose.find("option:selected").text();
      const purpose = $("#detail").val() !== "" ? $("#detail").val() : purposeText;
      formData.append("purpose", purpose);
      formData.append("time", mealType.charAt(0).toUpperCase() + mealType.slice(1)); // Lunch/Dinner

      let location = mealType === "lunch" ? $("#lunch").find("option:selected").text() : "Outside";
      formData.append("location", location);

      let location_detail = "";
      let cost = 0;
      let detail = "";

      if (mealType === "lunch") {
          if (location === "Inside") {
              location_detail = $("#lunchPlaceSelect").val();
              cost = costMap["Lunch->Inside"];
              detail = "Lunch->Inside";
          } else if (location === "Outside") {
              location_detail = $("#lunchPlaceInput").val();
              cost = costMap["Lunch->Outside"];
              detail = "Lunch->Outside";
          }
      } else { // dinner
          location_detail = $("#dinnerPlace").val();
          cost = costMap["Dinner->Outside"];
          detail = "Dinner->Outside";
      }

      formData.append("location_detail", location_detail);
      formData.append("guest_type", $("#guestType").val());
      formData.append("cash_adv", "1");

      // process tables
      const visitorResult = processTable("#tablevisitor", mealType);
      const empResult = processTable("#tableemp", mealType);
  
      const guestlist = visitorResult.list;
      const gqty = visitorResult.qty;
      const ameclist = empResult.list;
      const aqty = empResult.qty;


      const totalQty = gqty + aqty;

      // estimate items
      const estimateItems = [{
          details: detail,
          qty: totalQty,
          cost: parseFloat(cost),
          total: totalQty * parseFloat(cost),
          remark: ""
      }];

      // company
      const firstCompany = $("#tablevisitor input[name='company[]']").first().val();
      const companies = [{
          name: firstCompany,
          orgType: orgType,
          fileName: fname
      }];

      formData.append("companies", JSON.stringify(companies));
      formData.append("estimate_items", JSON.stringify(estimateItems));
      formData.append("guest_list", JSON.stringify(guestlist));
      formData.append("amec_list", JSON.stringify(ameclist));
      formData.append("total_amount", totalQty * parseFloat(cost));

     
      //for (let pair of formData.entries()) {
      //    console.log(pair[0], pair[1]);
      //}

      return formData;
  };

  // สร้างและส่ง FormData สำหรับ Lunch
  let field = $('[data-field="formreqent"]');
  let links = []; 
  if ($("#hasLunch").is(":checked")) {
      console.log("lunch");
      const lunchFormData = await buildFormDataEnt("lunch");
      const eno = lunchFormData.get("nfrmno");
      const evorgno = lunchFormData.get("vorgno");
      const ecyear = lunchFormData.get("cyear");
      const ecyear2 = lunchFormData.get("cyear2");
      const enrunno = lunchFormData.get("nrunno");
      links.push({
        url: host +`gpform/GP-ENT/main?sr=4&no=${eno}&orgNo=${evorgno}&y=${ecyear}&y2=${ecyear2}&runNo=${enrunno}`,
        text: `GP-ENT${ecyear2.slice(-2)}-${enrunno.padStart(6, "0")}`
      });
      const companiesStr = lunchFormData.get("companies");
      const companiesArr = JSON.parse(companiesStr);
      InsertGPENT(lunchFormData);
      SaveVMSENT($("#cyear2").val(),$("#nrunno").val(),lunchFormData.get("cyear2"),lunchFormData.get("nrunno"));
      if(companiesArr[0].fileName)
      {
        saveENTfile($("#nfrmno").val(),$("#vorgno").val(),$("#cyear").val(),$("#cyear2").val(),$("#nrunno").val(),lunchFormData.get("cyear2"),lunchFormData.get("nrunno"),companiesArr[0].fileName);
      }
     
  }

  // สร้างและส่ง FormData สำหรับ Dinner
  if ($("#hasDinner").is(":checked")) {
      console.log("dinner");
      const dinnerFormData = await buildFormDataEnt("dinner");
      const eno = dinnerFormData.get("nfrmno");
      const evorgno = dinnerFormData.get("vorgno");
      const ecyear = dinnerFormData.get("cyear");
      const ecyear2 = dinnerFormData.get("cyear2");
      const enrunno = dinnerFormData.get("nrunno");
      links.push({
        url: host +`gpform/GP-ENT/main?sr=4&no=${eno}&orgNo=${evorgno}&y=${ecyear}&y2=${ecyear2}&runNo=${enrunno}`,
        text: `GP-ENT${ecyear2.slice(-2)}-${enrunno.padStart(6, "0")}`
      });
      const companiesStr = dinnerFormData.get("companies");
      const companiesArr = JSON.parse(companiesStr);
      InsertGPENT(dinnerFormData);
      SaveVMSENT($("#cyear2").val(),$("#nrunno").val(),dinnerFormData.get("cyear2"),dinnerFormData.get("nrunno"));
      if(companiesArr[0].fileName)
      {
        saveENTfile($("#nfrmno").val(),$("#vorgno").val(),$("#cyear").val(),$("#cyear2").val(),$("#nrunno").val(),dinnerFormData.get("cyear2"),dinnerFormData.get("nrunno"),companiesArr[0].fileName);
      }
  }
  field.html(''); // เคลียร์ก่อน
  links.forEach((link, index) => {
      field.append(`<a href="${link.url}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">${link.text}</a>`);
      if (index < links.length - 1) field.append(' | ');
  });
}

function sendmailpic()
{
  const vmscyear2 = $("#cyear2").val();
  const vmsnrunno = $("#nrunno").val();
  let attn = $('[data-field="attn"]').text().trim();
  let visitdate = $('[data-field="visitdate"]').text().trim();
  let purpose = $('[data-field="purpose"]').text().trim();
  
  if(attn=="")
  {
    Swal.fire({
      icon: "warning",
      title: "Please enter Primary Stakeholders",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    return false;
  }
  if(visitdate=="")
  {
      Swal.fire({
        icon: "warning",
        title: "Please enter Visit Date",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      return false;
  }
  if(purpose=="")
  {
      Swal.fire({
        icon: "warning",
        title: "Please enter Purpose",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      return false;
  }

  $.ajax({
    type: "POST",
    url: host + "marform/MAR-VMS/form/sendmailpic",
    data: {vmscyear2: vmscyear2, vmsnrunno:vmsnrunno},
    beforeSend: function () {
      showLoader({ show: true });
    },
    success: function (res) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Success to sent mail PIC.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        // didClose: () => redirectWebflow(),
      });
    },
    complete: function (xhr, status) {
      showLoader({ show: false });
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: "Failed to sent mail PIC.",
        text: xhr.responseText || "Failed to sent mail PIC.",
      });
      
    },
  });

}

function updateform()
{
  const vmscyear2 = $("#cyear2").val();
  const vmsnrunno = $("#nrunno").val();
  $.ajax({
    type: "POST",
    url: host + "marform/MAR-VMS/form/updateform",
    data: {vmscyear2: vmscyear2, vmsnrunno:vmsnrunno},
    beforeSend: function () {
      showLoader({ show: true });
    },
    success: function (res) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Success to update form status.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        // didClose: () => redirectWebflow(),
      });
    },
    complete: function (xhr, status) {
      showLoader({ show: false });
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: "Failed to update form status.",
        text: xhr.responseText || "Failed to update form status.",
      });
      $(".confirm-btn").prop("disabled", false);
    },
  });
}

function InsertGPENT(formData)
{
  $.ajax({
    type: "POST",
    url: host + "gpform/GP-ENT/main/InsertForm",
    data: formData,
    processData: false,
    contentType: false,
    beforeSend: function () {
      showLoader({ show: true });
    },
    success: function (res) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Success to create Entertainment Approval Request Form",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        // didClose: () => redirectWebflow(),
      });
    },
    complete: function (xhr, status) {
      showLoader({ show: false });
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: "Failed to save data",
        text: xhr.responseText || "Failed to create Entertainment Approval Request Form",
      });
      
    },
  });
  
}

function SaveVMSENT(vmscyear2,vmsnrunno,entcyear2,entnrunno)
{
  $.ajax({
    url:  host + "marform/MAR-VMS/form/save_vms_gpent",
    type: "POST",
    dataType: "json",
    data: {vmscyear2:vmscyear2,vmsnrunno:vmsnrunno,entcyear2:entcyear2,entnrunno:entnrunno},
    success: function (response) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Success save data",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        // didClose: () => redirectWebflow(),
      });
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: "Failed to save data",
        text: xhr.responseText,
      });
      
    },
  });

}

function saveENTfile(vmsnfrmno,vmsvorgno,vmscyear,vmscyear2,vmsnrunno,entcyear2,entnrunno,filename)
{

    $.ajax({
      url:  host + "marform/MAR-VMS/form/saveENTfile",
      type: "POST",
      dataType: "json",
      data: {vmsnfrmno:vmsnfrmno,vmsvorgno:vmsvorgno,vmscyear:vmscyear,vmscyear2:vmscyear2,vmsnrunno:vmsnrunno,entcyear2:entcyear2,entnrunno:entnrunno,filename:filename},
      success: function (response) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Success to save file",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          // didClose: () => redirectWebflow(),
        });
      },
      error: function (xhr) {
        Swal.fire({
          icon: "error",
          title: "Failed to save file",
          text: xhr.responseText,
        });
        
      },
    });
}

function loaddata(vmscyear2,vmsnrunno)
{

  const NFRMNO = $("#nfrmno").val();
  const VORGNO = $("#vorgno").val();
  const CYEAR  = $("#cyear").val();
  $.ajax({
    url:  host + "marform/MAR-VMS/form/showFormData",
    type: "POST",
    dataType: "json",
    data: {vmscyear2:vmscyear2,vmsnrunno:vmsnrunno},
    beforeSend: function () {
      showLoader({ show: true });
    },
    success: function (response) {
       $('[data-field="attn"]').text(response.head.ATT);
       $('[data-field="cc"]').text(response.head.CC);
       if((response.head.PURPOSEVISIT == null) && (response.head.PURPOSEDETAIL == null))
       {
          $('[data-field="purpose"]').text('');
       }else{
          $('[data-field="purpose"]').text(response.head.PURPOSEVISIT+" "+response.head.PURPOSEDETAIL);
       }
      

       $('[data-field="issueDate"]').text(response.head.ISSUEDATE);
       $('[data-field="refno"]').text(response.head.REFNO);
       let issueby = response.head.ISSUEBY;
      
       let parts = issueby.trim().split(/\s+/);
       let title = parts[0] ||"";
       let fname = parts[1] ||"";
       let lname = parts[2] || "";
       let nameshort = title+" "+ fname + " " + lname.charAt(0).toUpperCase() + ".";
       
       $('[data-field="issueby"]').text(nameshort);
       $('[data-field="visitdate"]').text(response.head.VISITDATE);
       $('[data-field="receptroom"]').text(response.head.RECEPTROOM);
       $('[data-field="visitor"]').text(response.head.VISITOR_COUNT);
       const item = response.item[0]; 
       const boardVal = item.BOARD === 'Y' ? 'Yes' : 'No';
       $('[data-field="board"]').text(boardVal);
       if (item.SFILE && typeof item.SFILE === "string" && item.SFILE.trim() !== "") {
        $('[data-field="filename"]').html(`
          <a href="${host}marform/MAR-VMS/form/mdownload/${NFRMNO}_${VORGNO}_${CYEAR}_${vmscyear2}_${vmsnrunno}/${item.SFILE.substring(13)}/${item.SFILE}" 
            target="_blank" 
            class="file-list">
            ${item.SFILE.substring(13)}
          </a>
        `);
      } else {
        $('[data-field="filename"]').html(""); 
      }

       $('[data-field="roomlunch"]').text(item.ROOMLUNCH);
       if(item.ROOMLUNCH && item.ROOMLUNCH.trim() !== "")
       {
        $('[data-field="roomdate"]').text(response.head.VISITDATE);
        $('[data-field="roomtime"]').text("12:00 - 01:00 PM.");
       }
      
       $('[data-field="visitlunch"]').text(item.VISITORS);
       $('[data-field="ameclunch"]').text(item.AMEC);
       $('[data-field="totlunch"]').text((+item.VISITORS) + (+item.AMEC));
       $('[data-field="hotelname"]').text(item.HOTELNAME);
       const shopVal = item.SHOPTOUR === 'G' 
       ? 'General' 
       : item.SHOPTOUR === 'I' 
         ? 'Inspection' 
         : 'Specific';
       $('[data-field="shoptour"]').text(shopVal);
       const formc1Val = item.FORMC1_1 === 'Y' ? 'Yes (only visit Test Tower)' : 'No';
       $('[data-field="formc1_1"]').text(formc1Val);
       const carVal = item.CARHOTEL === 'Y' ? 'Yes' : 'No';
       $('[data-field="car"]').text(carVal);
       $('[data-field="cardetail"]').text(item.CARHOTELNOTE);
       
       const tbody = document.getElementById("visitor-body");
       tbody.innerHTML = ""; 
       let i = 1;
       response.visitint.forEach(v => {
       
        const row = `
          <tr>
            <td class="border px-2">${i}</td>
            <td class="border px-2">${v.COUNTRY}</td>
            <td class="border px-2">${v.COMPANY}</td>
            <td class="border px-2">${v.NAME}</td>
            <td class="border px-2">${v.POSITION}</td>
            <td class="border px-2">${v.VISITEXP === "Y" ? "Yes" : "No"}</td>
          </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
        i++;
      });
      i=1;
      const stbody = document.getElementById("schedule-body");
      stbody.innerHTML = ""; 
      response.schedule.forEach(v => {
      const row = `
          <tr>
            <td class="border px-2">${v.SCHSTIME && v.SCHETIME ? v.SCHSTIME + ' - ' + v.SCHETIME : '-'}</td>
            <td class="border px-2">${v.PLACE}</td>
            <td class="border px-2">${v.CONTENT}</td>
            <td class="border px-2">${v.AMECP}</td>
            <td class="border px-2">${v.NOTE ? v.NOTE : '-'}</td>
          </tr>
        `;
        stbody.insertAdjacentHTML("beforeend", row);
        i++;
      });


      i=1;
      const sptbody = document.getElementById("sproject-body");
      sptbody.innerHTML = ""; 
      if (response.sproj && response.sproj.length > 0) {
         let totalQty = 0;
          response.sproj.forEach(v => {
            const row = `
              <tr>
              <td class="border px-2">${v.PROJNO ? v.PROJNO : ''}</td>
              <td class="border px-2">${v.PROJNAME ? v.PROJNAME : ''}</td>
              <td class="border px-2">${v.MODEL ? v.MODEL : ''}</td>
              <td class="border px-2">${v.SPEC ? v.SPEC : ''}</td>
              <td class="border px-2 text-center">${v.QTY ? v.QTY : ''}</td>
              <td class="border px-2 text-center">${v.STATUS ? v.STATUS : ''}</td>
            </tr>
            `;
            sptbody.insertAdjacentHTML("beforeend", row);
            totalQty += Number(v.QTY) || 0;
            i++;
          });
          const summaryRow = `
          <tr class="font-bold bg-blue-50">
            <td class="border px-2 text-center" colspan="4">Total</td>
            <td class="border px-2 text-center">${totalQty}</td>
            <td class="border px-2"></td>
          </tr>
        `;
        sptbody.insertAdjacentHTML("beforeend", summaryRow);
      }else{
            const noDataRow = `
            <tr>
              <td class="border px-2 text-center" colspan="6">No Data</td>
            </tr>
          `;
          sptbody.insertAdjacentHTML("beforeend", noDataRow);
      }

      i=1;
      const pptbody = document.getElementById("pproject-body");
      pptbody.innerHTML = ""; 
      if (response.pproj && response.pproj.length > 0) {
      let totalQty = 0;
      response.pproj.forEach(v => {
        const row = `
          <tr>
            <td class="border px-2">${v.PROJNO ? v.PROJNO : ''}</td>
            <td class="border px-2">${v.PROJNAME ? v.PROJNAME : ''}</td>
            <td class="border px-2">${v.MODEL ? v.MODEL : ''}</td>
            <td class="border px-2">${v.SPEC ? v.SPEC : ''}</td>
            <td class="border px-2 text-center">${v.QTY ? v.QTY : ''}</td>
            <td class="border px-2 text-center">${v.STATUS ? v.STATUS : ''}</td>
          </tr>
        `;
        pptbody.insertAdjacentHTML("beforeend", row);
        totalQty += Number(v.QTY) || 0;
        i++;
      });
       const summaryRow = `
        <tr class="font-bold bg-blue-50">
          <td class="border px-2 text-center" colspan="4">Total</td>
          <td class="border px-2 text-center">${totalQty}</td>
          <td class="border px-2"></td>
        </tr>
      `;
        pptbody.insertAdjacentHTML("beforeend", summaryRow);
    }else{
          const noDataRow = `
          <tr>
            <td class="border px-2 text-center" colspan="6">No Data</td>
          </tr>
        `;
        pptbody.insertAdjacentHTML("beforeend", noDataRow);

    }
    const dietList = response.dietary
    .filter(item => item.DIETREQ) 
    .map(item => `${item.DIETREQ} (${item.CNT})`);
  
  // join เป็น string
  const dietText = dietList.join(", ");
  
  $('[data-field="roomdietary"]').text(dietText || "-");
  if(response.ent && response.ent.length > 0){
    // สร้างลิงก์แต่ละตัวพร้อมคล่อม [ ]
    let html = response.ent.map(e => {
        return `<a href="`+host +`gpform/GP-ENT/main?sr=4&no=9&orgNo=030101&y=25&y2=${e.ENTCYEAR2}&runNo=${e.ENTNRUNNO}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">[${e.REQENT}]</a>`;
    }).join(', ');
    // ใส่ใน span
    document.querySelector('[data-field="formreqent"]').innerHTML = html;
}

       
    },
    complete: function (xhr, status) {
      showLoader({ show: false });
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: "Failed to save file",
        text: xhr.responseText,
      });
      
    },
  });



}

function parseEXPPLAN(expPlan) {
  if(!expPlan) return "";

  const str = String(expPlan).trim();

  // Regex ครอบคลุม ISO แบบ Z / offset / space
  const isoRegex   = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|([+-]\d{2}:\d{2}))?$/i;
  const spaceRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,3})?$/;

  let d;

  if(isoRegex.test(str)){
      d = new Date(str); // รองรับ UTC / offset
  } else if(spaceRegex.test(str)){
      d = new Date(str.replace(' ', 'T')); // แปลง space → T
  } else {
      return str; // ไม่ match regex → คืนค่าเดิม
  }

  if(d && !isNaN(d.getTime())){
      let day, month, year;

      // ใช้ UTC ถ้าเป็น ISO หรือมี offset
      if(str.includes('Z') || str.match(/[+-]\d{2}:\d{2}$/)){
          day   = d.getUTCDate();
          month = d.getUTCMonth() + 1;
          year  = d.getUTCFullYear();
      } else {
          day   = d.getDate();
          month = d.getMonth() + 1;
          year  = d.getFullYear();
      }

      return `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`;
  }

  // Invalid date → คืนค่าเดิม
  return str;
}


function bookingroom(data) {
  return $.ajax({
    url: "https://amecwebtest.mitsubishielevatorasia.co.th/api/automate/meeting/create",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    beforeSend: function () {
      showLoader({ show: true });
    },
    success: function (res) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Booking Room success.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    },
    complete: function () {
      showLoader({ show: false });
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: "Failed to Booking Room",
        text: xhr.responseText || "Failed to Booking Room",
      });
    },
  });
}









