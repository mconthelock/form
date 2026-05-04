export const getcause   = (data) => callAPI("/mfg-edr/cause", "POST", data);
export const getworktype   = (data) => callAPI("/mfg-edr/worktype", "POST", data);


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




