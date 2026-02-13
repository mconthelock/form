export const somefunction = async (data) => {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${process.env.APP_API}/bus/***/`,
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

export const getLine   = (data) => callAPI("/bus/line/search", "POST", data);
export const getRoute  = (data) => callAPI("/bus/route/search", "POST", data);
export const getStop   = (data) => callAPI("/bus/stop/search", "POST", data);

export const insertLine  = (data) => callAPI("/bus/line/create", "POST", data);
export const updateLine  = (data) => callAPI("/bus/line/update", "POST", data);
export const deleteLine  = (data) => callAPI("/bus/line/delete", "POST", data);

export const insertStop  = (data) => callAPI("/bus/stop/create", "POST", data);
export const updateStop  = (data) => callAPI("/bus/stop/update", "POST", data);
export const deleteStop  = (data) => callAPI("/bus/stop/delete", "POST", data);

export const insertRoute  = (data) => callAPI("/bus/route/create", "POST", data);
export const updateRoute  = (data) => callAPI("/bus/route/update", "POST", data);
export const deleteRoute  = (data) => callAPI("/bus/route/delete", "POST", data);

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



