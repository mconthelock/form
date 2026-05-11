export const getcause   = (data) => callAPI("/mfg-edr/cause", "POST", data);
export const getworktype   = (data) => callAPI("/mfg-edr/worktype", "POST", data);
export const getprocess   = (data) => callAPI("/mfg-edr/process", "POST", data);
export const getline   = (data) => callAPI("/mfg-edr/line", "POST", data);
export const getamecorderdetail   = (data) => callAPI("/mfg-edr/amec-order-detail", "POST", data);

// ===== FORM ===========
export const createMfgEdr = (data) => callAPI("/mfg-edr", "POST", data);
export const updateMfgEdrDetail = (data) => callAPI("/mfg-edr/update-detail", "POST", data);


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




