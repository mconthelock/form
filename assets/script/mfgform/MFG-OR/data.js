// ===== FORM ===========
export const createMfgOr = (data) => callAPI("/mfg-or/create", "POST", data);
export const getMfgOrDetail = (data) => callAPI("/mfg-or/getdetail-mfg-or", "POST", data);
export const generateMfgOrNo = (data) => callAPI("/mfg-or/generate-or-no", "POST", data);

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




