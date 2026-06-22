import { searchMfgOrCenter } from "./data.js";
import { createTable } from "@amec/webasset/dataTable";
import Swal from "sweetalert2";

$(document).ready(function () {
    const OR_CENTER = {
        allData: [],
        currentData: [],
        table: null,

        init() {
            this.bindEvents();
            this.loadData();
        },

        bindEvents() {
            $("#btn_search").on("click", () => {
                this.searchFromLoadedData();
            });

            $("#btn_export_excel").on("click", () => {
                this.exportExcel();
            });

            $(".or-center-input, .or-center-select").on("keypress", (e) => {
                if (e.which === 13) {
                    this.searchFromLoadedData();
                }
            });
        },

        async loadData() {
            try {
                const res = await searchMfgOrCenter({});
                const rows = Array.isArray(res?.data) ? res.data : [];

                console.log("OR CENTER ROWS =", rows);
                onsole.log("FIRST ROW =", rows[0]);

                this.allData = rows;
                this.currentData = [...rows];

                this.renderTable(this.currentData);
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: "error",
                    title: "Load data failed",
                    text: "Cannot load OR CENTER data.",
                });
            }
        },

        searchFromLoadedData() {
            const orno = this.getValue("#search_orno").toUpperCase();
            const topic = this.getValue("#search_topic").toUpperCase();
            const classValue = this.getValue("#search_class").toUpperCase();
            const year = this.getValue("#search_year");

            this.currentData = this.allData.filter((row) => {
                const rowOrno = String(row.ORNO || "").toUpperCase();
                const rowTopic = String(row.TOPIC || "").toUpperCase();
                const rowClass = String(row.CLASS || "").toUpperCase();
                const rowYear = this.getFullYear(row.CYEAR);

                if (orno && !rowOrno.includes(orno)) return false;
                if (topic && !rowTopic.includes(topic)) return false;
                if (classValue && !rowClass.includes(classValue)) return false;
                if (year && rowYear !== year) return false;

                return true;
            });

            this.renderTable(this.currentData);
        },

        renderTable(data) {
            $("#or_center_count").text(`Total: ${data.length}`);

            if (this.table) {
                this.table.clear();
                this.table.rows.add(data);
                this.table.draw();
                return;
            }

            this.table = $("#or_center_table").DataTable({
                data,
                destroy: true,
                paging: false,
                searching: false,
                info: false,
                ordering: true,
                autoWidth: false,
                order: [[1, "desc"]],
                columns: [
                    {
                        data: null,
                        className: "text-center",
                        orderable: false,
                        render: (data, type, row) => this.renderFile(row),
                    },
                    {
                        data: "ORNO",
                        className: "text-center font-black text-indigo-700",
                        render: (data) => this.escape(data),
                    },
                    {
                        data: "REVNO",
                        className: "text-center",
                        render: (data) => this.escape(data),
                    },
                    {
                        data: "TOPIC",
                        render: (data) => this.escape(data),
                    },
                    {
                        data: "CLASS",
                        render: (data) => this.escape(data),
                    },
                    {
                        data: "ISSUE_DATE",
                        className: "text-center",
                        render: (data, type) => {
                            if (type === "sort") return this.getDateSortValue(data);
                            return this.formatDate(data);
                        },
                    },
                    {
                        data: "REVISE_DATE",
                        className: "text-center",
                        render: (data, type) => {
                            if (type === "sort") return this.getDateSortValue(data);
                            return this.formatDate(data);
                        },
                    },
                    {
                        data: "FORMNO",
                        className: "text-center",
                        render: (data) => this.escape(data),
                    },
                ],
            });
        },

        exportExcel() {
            if (!this.table) return;

            const rows = this.table
                .rows({ search: "applied", order: "applied" })
                .data()
                .toArray();

            if (!rows.length) {
                Swal.fire({
                    icon: "warning",
                    title: "No data",
                    text: "No data to export.",
                });
                return;
            }

            const exportRows = rows.map((row) => ({
                "OR No.": row.ORNO || "",
                "Rev": row.REVNO || "",
                "Topic": row.TOPIC || "",
                "Classification": row.CLASS || "",
                "Issue Date": this.formatDate(row.ISSUE_DATE),
                "Revise Date": this.formatDate(row.REVISE_DATE),
                "Form no": row.FORMNO || "",
            }));

            const html = `
                <table border="1">
                    <thead>
                        <tr>
                            ${Object.keys(exportRows[0]).map(h => `<th>${h}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${exportRows.map(r => `
                            <tr>
                                ${Object.values(r).map(v => `<td>${this.escape(v)}</td>`).join("")}
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;

            const blob = new Blob(
                [`\ufeff${html}`],
                { type: "application/vnd.ms-excel;charset=utf-8;" }
            );

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `OR_CENTER_${this.getTodayText()}.xls`;
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        renderFile(row) {
            const formno = String(row.FORMNO || "").trim();
            if (!formno) { return "";}
            const pdfName = `${formno}_stamp.pdf`;
            const excelName = `${formno}.xlsx`;
            const baseUrl = `${window.location.origin}/form/mfgform/MFG-OR/main_or/preview_file`;
            const pdfUrl = `${baseUrl}/${encodeURIComponent(formno)}/${encodeURIComponent(pdfName)}`;
            const excelUrl = `${baseUrl}/${encodeURIComponent(formno)}/${encodeURIComponent(excelName)}`;

            return `
                <div class="or-file-links">
                    <a href="${pdfUrl}" target="_blank" class="or-file-icon or-file-pdf" title="Open PDF">
                        <i class="fa-solid fa-file-pdf"></i>
                    </a>
                    <a href="${excelUrl}" target="_blank" class="or-file-icon or-file-excel" title="Open Excel">
                        <i class="fa-solid fa-file-excel"></i>
                    </a>
                </div>
            `;
        },

        getFullYear(cyear) {
            const y = String(cyear || "").trim();
            if (!y) return "";
            if (y.length === 4) return y;
            return `20${y.slice(-2)}`;
        },

        formatDate(value) {
            if (!value) return "";

            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "";

            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }).replace(",", "");
        },

        getDateSortValue(value) {
            if (!value) return 0;

            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return 0;

            return date.getTime();
        },

        getTodayText() {
            const d = new Date();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");

            return `${yyyy}${mm}${dd}`;
        },

        getValue(selector) {
            return String($(selector).val() || "").trim();
        },

        escape(value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },
    };

    OR_CENTER.init();
});