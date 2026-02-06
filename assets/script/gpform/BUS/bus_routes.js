import { showLoader } from "@amec/webasset/preloader";
import { showMessage } from "@amec/webasset/utils";

/* ================= GLOBAL ================= */

const API_BASE = window.API_BASE || "";

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
    console.log("BUS ROUTES JS LOADED");
    console.log("API_BASE:", API_BASE);

    if (!API_BASE) {
        console.error("API_BASE is missing");
        showMessage("API base URL not configured", "error");
        return;
    }

    bindEvents();
    loadRoutes();
});

/* ================= API HELPER ================= */

async function callAPI(endpoint, payload = {}) {
    showLoader({ show: true });
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        return result;

    } catch (error) {
        console.error(error);
        return null;

    } finally {
        setTimeout(() => {
            showLoader({ show: false });
        }, 300);
    }
}




/* ================= LOAD ROUTES ================= */

async function loadRoutes() {
    const table = document.getElementById("routeTable");
    if (!table) return;
    table.innerHTML = `
        <tr>
            <td colspan="4" class="p-6 text-center text-gray-400">
                Loading...
            </td>
        </tr>
    `;

    const data = await callAPI("/bus/line/search", {
       // BUSTYPE: "1"
    });

    table.innerHTML = "";

    if (!data || !data.length) {
        table.innerHTML = `
            <tr>
                <td colspan="4" class="p-6 text-center text-gray-400">
                    No routes found
                </td>
            </tr>
        `;
        return;
    }

    let rows = "";

    data.forEach(route => {

        const statusBadge =
            route.BUSSTATUS === "1"
                ? `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Active</span>`
                : `<span class="bg-gray-200 text-gray-600 px-2 py-1 rounded text-sm">Inactive</span>`;

        rows += `
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="p-4 font-medium">${route.BUSNAME}</td>
                <td class="p-4 text-center">${route.BUSSEAT ?? '-'}</td>
                <td class="p-4 text-center">${statusBadge}</td>
                <td class="p-4 text-right space-x-3">
                    <button 
                        data-id="${route.BUSID}" 
                        data-action="detail"
                        class="text-blue-600 hover:underline">
                        Detail
                    </button>

                    <button 
                        data-id="${route.BUSID}" 
                        data-action="edit"
                        class="text-yellow-600 hover:underline">
                        Edit
                    </button>

                    <button 
                        data-id="${route.BUSID}" 
                        data-action="delete"
                        class="text-red-600 hover:underline">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    table.innerHTML = rows;
}

/* ================= EVENTS ================= */

function bindEvents() {

    // Add Route
    const addBtn = document.getElementById("btnAddRoute");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            window.location.href = "/gpform/bus/routes/create";
        });
    }

    // Event Delegation
    document.addEventListener("click", async (event) => {

        const button = event.target.closest("[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const id     = button.dataset.id;

        if (!action || !id) return;

        switch (action) {

            case "detail":
                window.location.href = `/gpform/bus/routes/detail/${id}`;
                break;

            case "edit":
                window.location.href = `/gpform/bus/routes/edit/${id}`;
                break;

            case "delete":

                if (!confirm("ยืนยันการลบสายรถ?")) return;

                const result = await callAPI("/bus/line/delete", {
                    BUSID: id
                });

                if (result !== null) {
                    showMessage("ลบข้อมูลสำเร็จ", "success");
                    loadRoutes();
                }

                break;
        }
    });
}
