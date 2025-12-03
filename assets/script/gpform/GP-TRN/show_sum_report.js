console.log("✅ show_sum_report.js loaded (OMG V1)");

window.initFormReport = function () {
    console.log("📊 initFormReport() started");

    var table = new Tabulator("#report_table", {
        height: "calc(100vh - 250px)",        // สูงตามหน้าจอแบบพอดี
        layout: "fitDataStretch",
        placeholder: "ไม่มีข้อมูล",
        pagination: "local",
        paginationSize: 20,

        rowFormatter: function (row) {
            const data = row.getData();
            if (data.CST == 2) {
                row.getElement().style.backgroundColor = "#e6ffe6";  // เขียวอ่อน
            } else if (data.CST == 1) {
                row.getElement().style.backgroundColor = "#e6f2ff";  // ฟ้าอ่อน
            } else if (data.CST == 3) {
                row.getElement().style.backgroundColor = "#ffe6e6";  // แดงอ่อน
            }
        },

        columns: [
            { title: "No", formatter: "rownum", width: 65, hozAlign: "center", headerHozAlign: "center"  },

            { title: "Category", field: "FORM_NAME_EN", width: 220 , headerHozAlign: "center"  },
            { title: "Code", field: "SEMPNO", width: 90, hozAlign: "center", headerHozAlign: "center"  },
            { title: "Name", field: "STNAME", width: 220 , headerHozAlign: "center" },
            { title: "Position", field: "SPOSITION", width: 140 , headerHozAlign: "center" },
            { title: "Sect.", field: "SSEC", width: 100, hozAlign: "center" , headerHozAlign: "center" },
            { title: "Dept.", field: "SDEPT", width: 100, hozAlign: "center" , headerHozAlign: "center" },
            { title: "Div.", field: "SDIV", width: 100, hozAlign: "center" , headerHozAlign: "center" },
            { title: "Subject", field: "SUBJECT", width: 350 , headerHozAlign: "center" },

            {
                title: "From",
                field: "DATE_FROM",
                width: 100,
                formatter: cell => {
                    let v = cell.getValue();
                    if (!v || v.length !== 8) return v;
                    return v.substring(6,8) + "/" + v.substring(4,6) + "/" + v.substring(0,4);
                }, hozAlign: "center", headerHozAlign: "center" 
            },

            {
                title: "To",
                field: "DATE_TO",
                width: 100,
                formatter: cell => {
                    let v = cell.getValue();
                    if (!v || v.length !== 8) return v;
                    return v.substring(6,8) + "/" + v.substring(4,6) + "/" + v.substring(0,4);
                }, hozAlign: "center", headerHozAlign: "center" 
            },

            {
                title: "Status",
                field: "CST",
                width: 100,
                formatter: function (cell) {
                    let v = cell.getValue();
                    if (v == 2) return "<span style='color:green;font-weight:bold;'>Approve</span>";
                    if (v == 1) return "<span style='color:blue;font-weight:bold;'>Running</span>";
                    if (v == 3) return "<span style='color:red;font-weight:bold;'>Reject</span>";
                    return "-";
                },
                hozAlign: "center", headerHozAlign: "center" 
            },

            { title: "Amount", field: "COST", hozAlign: "right", width: 120,
                formatter: "money", formatterParams: { thousand: ",", precision: 0 } , headerHozAlign: "center" },

            { title: "Vat7%", field: "VAT", hozAlign: "right", width: 100,
                formatter: "money", formatterParams: { thousand: ",", precision: 0 } , headerHozAlign: "center" },

            { title: "Total Amount", field: "TOTAL", hozAlign: "right", width: 140,
                formatter: "money", formatterParams: { thousand: ",", precision: 0 } , headerHozAlign: "center" }
        ]
    });

    $("#report_search").on("click", function () {
        table.setData(window.baseUrl + "gpform/GP-TRN/training/load_data", {
            from: $("#report_from").val(),
            to: $("#report_to").val(),
            type: $("#report_type").val()
        });
    });

    $("#report_excel").on("click", function () {
        table.download("xlsx", "Training_Summary.xlsx");
    });
};
