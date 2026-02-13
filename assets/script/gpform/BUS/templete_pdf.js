export function buildBusRouteHtml(busData = [], vanData = []) {
	function buildRows(data) {
		let html = "";
		data.forEach((item, index) => {
			const stops = (item.stops || []).filter(Boolean);
			const chunkSize = 7;
			const totalRows = Math.max(1, Math.ceil(stops.length / chunkSize));
			for (let i = 0; i < totalRows; i++) {
				const start = i * chunkSize;
				const stopChunk = stops.slice(start, start + chunkSize);
				const paddedStops = [
					...stopChunk,
					...Array(7 - stopChunk.length).fill("")
				];
				html += `
					<tr>
					${i === 0 ? `<td rowspan="${totalRows}">${index + 1}</td>` : ""}
					${i === 0 ? `<td rowspan="${totalRows}">${item.line}</td>` : ""}
					${paddedStops.map(s => `<td>${s}</td>`).join("")}
					</tr>
				`;
			}
		});
		return html;
	}


  	return `
		<!DOCTYPE html>
		<html>
		<head>
		<meta charset="UTF-8" />
		<style>
		@page {
			size: A3 landscape;
			margin: 15mm;
		}

		body {
			font-family: Arial, sans-serif;
			font-size: 11px;
		}

		.page-header {
			position: relative;
			margin-bottom: 55px;   /* เพิ่มระยะห่างลงอีก */
			min-height: 140px;     /* กันกล่องทับตาราง */
		}

		.header-center {
			text-align: center;
		}

		.company-title {
			font-size: 28px;
			font-weight: bold;
			margin-bottom: 20px;
			text-decoration: underline;
		}

		.main-title {
			margin-top: 20px;
			font-size: 20px;
			font-weight: bold;
		}

		.header-right-group {
			position: absolute;
			right: 0;
			top: 0;
			text-align: right;
		}

		.start-date {
			font-size: 12px;
			margin-bottom: 5px;
		}

		.top-box {
			width: 155px;
			height: 145px; 
			border: 2px solid #000;
			text-align: center;
			padding-top: 4px;
		}

		.top-box-title {
			font-size: 12px;
			padding-bottom: 4px;
			border-bottom: 1px solid #000;
			margin-bottom: 6px;
		}

		.circle {
			position: relative;
			margin: 0 auto;
			width: 100px;
			height: 100px;
			border: 3px solid red;
			border-radius: 50%;
			color: red;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			overflow: hidden;
			text-align: center;
		}

		/* เส้นคั่นบน */
		.circle::before,
		.circle::after {
			content: "";
			position: absolute;
			left: -3px;   /* ยืดเลยขอบ */
			right: -3px;  /* ยืดเลยขอบ */
			height: 1px;
			background: red;
		}

		/* เส้นบน (ระหว่าง AMEC กับ วันที่) */
		.circle::before {
			top: 40px;
		}

		/* เส้นล่าง (ระหว่าง วันที่ กับ RAWEEPONG) */
		.circle::after {
			top: 60px;
		}

		.stamp-top {
			position: absolute;
			top: 18px;
			font-weight: bold;
			font-size: 14px;
		}

		.stamp-date {
			position: absolute;
			top: 45px;
			font-size: 10px;
			font-weight: normal;
		}

		.stamp-bottom {
			margin-bottom: 1px;
			position: absolute;
			bottom: 15px;
			font-weight: bold;
			font-size: 12px;
		}

		.section-title {
			background: #b8cde0;
			padding: 6px;
			font-weight: bold;
			margin-top: 20px;
		}

		table {
			width: 100%;
			border-collapse: collapse;
			table-layout: fixed;
		}

		th, td {
			border: 1px solid #000;
			padding: 4px;
			text-align: center;
			word-wrap: break-word;
		}

		th {
			background: #d9d9d9;
		}

		.col-run { width: 4%; font-weight: bold; }
		.col-line { width: 10%; font-weight: bold; }
		.col-stop { width: 12%; }

		</style>
		</head>
		<body>

		<div class="page-header">
			<div class="header-center">
				<div class="company-title">
					ตารางจอดรถรับ-ส่งพนักงาน บริษัท มิตซูบิชิ เอลเลเวเตอร์ เอเชีย จำกัด
				</div>

				<div class="main-title">
					วันจันทร์ - วันศุกร์ (รับเข้าเช้า)
				</div>
			</div>

			<div class="header-right-group">

				<div class="start-date">
				เริ่มตั้งแต่วันที่ 5 มกราคม 2559
				</div>

				<div class="top-box">
					<div class="top-box-title">GA DDEM</div>

					<div class="circle">
						<div class="stamp-top">AMEC</div>
						<div class="stamp-date">${formatToday()}</div>
						<div class="stamp-bottom">RAWEEPONG</div>
					</div>
				</div>
			</div>
		</div>



		<div class="section-title">BUS</div>
		<table>
		<thead>
			<tr>
			<th class="col-run">ลำดับ</th>
			<th class="col-line">สายรถ</th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			</tr>
		</thead>
		<tbody>
			${buildRows(busData)}
		</tbody>
		</table>

		<div class="section-title">VAN</div>
		<table>
		<thead>
			<tr>
			<th class="col-run">ลำดับ</th>
			<th class="col-line">สายรถ</th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			<th class="col-stop"></th>
			</tr>
		</thead>
		<tbody>
			${buildRows(vanData)}
		</tbody>
		</table>

		</body>
		</html>
	`;
}

function formatToday() {
  const today = new Date();
  return today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}