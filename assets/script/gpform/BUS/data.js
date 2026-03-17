
export const getLine   = (data) => callAPI("/bus/line/search", "POST", data);
export const getRoute  = (data) => callAPI("/bus/route/search", "POST", data);
export const getStop   = (data) => callAPI("/bus/stop/search", "POST", data);
export const getPassenger   = (data) => callAPI("/bus/passenger/search", "POST", data);
export const getPassengerAllDetail   = (data) => callAPI("/bus/passenger/findAllWithRelations", "POST", data);
export const getAllEmp   = (data) => callAPI("/bus/passenger/getAllTransport", "POST", data);

export const insertLine  = (data) => callAPI("/bus/line/create", "POST", data);
export const updateLine  = (data) => callAPI("/bus/line/update", "POST", data);
export const deleteLine  = (data) => callAPI("/bus/line/delete", "POST", data);
export const searchBusLine = (data) =>callAPI("/bus/line/search", "POST", data);
export const deleteLineCascade  = (data) => callAPI("/bus/line/deleteCascade", "POST", data);

export const insertStop  = (data) => callAPI("/bus/stop/create", "POST", data);
export const updateStop  = (data) => callAPI("/bus/stop/update", "POST", data);
export const deleteStop  = (data) => callAPI("/bus/stop/delete", "POST", data);
export const deleteStopandPassenger  = (data) => callAPI("/bus/stop/deleteStop", "POST", data);
export const getStopRoutes  = (data) => callAPI("/bus/stop/getStopRoutes", "POST", data);

export const insertRoute  = (data) => callAPI("/bus/route/create", "POST", data);
export const updateRoute  = (data) => callAPI("/bus/route/update", "POST", data);
export const deleteRoute  = (data) => callAPI("/bus/route/delete", "POST", data);

export const insertPassenger  = (data) => callAPI("/bus/passenger/create", "POST", data);
export const updatePassenger  = (data) => callAPI("/bus/passenger/update", "POST", data);
export const deletePassenger  = (data) => callAPI("/bus/passenger/delete", "POST", data);

// ===== DISPATCH =====
export const dispatchGetOrInit = (data) => callAPI("/bus/dispatch/get-or-init", "POST", data);
export const dispatchGetDispatch = (data) => callAPI("/bus/dispatch/get-dispatch", "POST", data);
export const dispatchBuildDailyFirst = (data) => callAPI("/bus/dispatch/build-daily-first", "POST", data);
export const dispatchSaveOverwrite = (data) => callAPI("/bus/dispatch/save-overwrite", "POST", data);
export const dispatchMoveStop = (data) => callAPI("/bus/dispatch/move-stop", "POST", data);
export const disableDispatchPassenger  = (data) => callAPI("/bus/dispatch/disable-passenger", "POST", data);
export const deleteLineDispatch  = (data) => callAPI("/bus/dispatch/delete-linedispatch", "POST", data);
export const saveAddPassenger  = (data) => callAPI("/bus/dispatch/save-add-passenger", "POST", data);
export const updateStatusHead  = (data) => callAPI("/bus/dispatch/update-status", "POST", data);

// ===== REPORT =====
export const reportBusDaily = (data) => callAPI("/bus/dispatch/report-bus-daily", "POST", data);
export const reportDisabledPassengerDaily = (data) => callAPI("/bus/dispatch/report-disabled-passenger-daily", "POST", data);

export const updatePassengerStatus = (data) => callAPI("/bus/dispatch/update-passenger-status", "POST", data);


// ===== GET ===========
export const getUserbyemp = (empno) => callAPI(`/users/${encodeURIComponent(empno)}`, "GET");

const callAPI = async (endpoint, method = "POST", data = null) => {
	try {
		const response = await $.ajax({
			url: `${process.env.APP_API}${endpoint}`,
			type: method,
			dataType: "json",
			contentType: "application/json",
			data: data ? JSON.stringify(data) : null,
		});
		return response;
	} catch (error) {
		console.error("API ERROR:", error);
		throw error.responseJSON || error;
	}
};




