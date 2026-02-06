# Get Start

## Update 2026-01-16

- Change Build Tools from <mark>webpack</mark> to be <mark>Rspack</mark>

    > ### Rspack
    >
    > เป็น Build tool ตัวใหม่จากทีม ByteDance (TikTok) ที่สร้างมาเพื่อเป็น Drop-in replacement ของ Webpack
    >
    > - ทำไมถึงเร็ว: เขียนด้วยภาษา Rust และออกแบบมาให้ทำงานแบบ Parallel ได้เต็มประสิทธิภาพ
    > - เหมาะกับ: โปรเจกต์ที่ใช้ Webpack อยู่แล้วและมี Config ที่ซับซ้อน แต่อยากได้ความเร็วเพิ่มขึ้นโดยไม่ต้องย้ายไป Vite (ซึ่งต้องแก้เยอะกว่า)

- Revise database.php
  การ Config database จะเปลี่ยนไปกำหนดค่าที่ .env ไฟล์แทน ซึ่งถ้ามีการแก้ไขจะได้ไปแก้ที่ env ที่เดียว

```php
<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$active_group = 'DEFAULT';
$query_builder = TRUE;
$list = $_ENV['DBLIST'];
foreach (explode(',', $list) as $db_name) {
    $db_name = trim($db_name);
    if (!empty($db_name)) {
        $db[$db_name] = array(
            'dsn'	=> '',
            'hostname' => $_ENV[strtoupper($db_name) . '_HOST'],
            'username' => $_ENV[strtoupper($db_name) . '_USER'],
            'password' => $_ENV[strtoupper($db_name) . '_PASS'],
            'database' => $_ENV[strtoupper($db_name) . '_NAME'],
            'dbdriver' => $_ENV[strtoupper($db_name) . '_DRIVER'],
            'dbprefix' => '',
            'pconnect' => FALSE,
            'db_debug' => (ENVIRONMENT !== 'production'),
            'cache_on' => FALSE,
            'cachedir' => '',
            'char_set' => 'utf8',
            'dbcollat' => 'utf8_general_ci',
            'swap_pre' => '',
            'encrypt' => FALSE,
            'compress' => FALSE,
            'stricton' => FALSE,
            'failover' => array(),
            'save_queries' => TRUE
        );
    }
}
```

# Backup Code

```json
//package.json
{
	"devDependencies": {
		"@tailwindcss/cli": "^4.1.1",
		"compression-webpack-plugin": "^11.1.0",
		"css-loader": "^7.1.2",
		"daisyui": "^5.0.9",
		"dotenv-webpack": "^8.1.0",
		"style-loader": "^4.0.0",
		"tailwindcss": "^4.1.12",
		"ts-loader": "^9.5.4",
		"ts-node": "^10.9.2",
		"typescript": "^5.9.2",
		"vitepress": "^2.0.0-alpha.12",
		"vue": "^3.5.22",
		"webpack": "^5.95.0",
		"webpack-cli": "^5.1.4"
	},
	"dependencies": {
		"@fancyapps/ui": "^5.0.36",
		"@flaticon/flaticon-uicons": "^3.3.1",
		"@fontsource/kanit": "^5.1.0",
		"@fontsource/roboto": "^5.1.0",
		"@fortawesome/fontawesome-free": "^6.7.2",
		"@tailwindcss/postcss": "^4.1.12",
		"@zxing/browser": "^0.1.5",
		"@zxing/library": "^0.21.3",
		"autoprefixer": "^10.4.21",
		"copy-webpack-plugin": "^12.0.2",
		"crypto": "^1.0.1",
		"crypto-js": "^4.2.0",
		"datatables.net-buttons-dt": "^3.2.5",
		"datatables.net-dt": "^2.1.8",
		"datatables.net-responsive-dt": "^3.0.3",
		"dayjs": "^1.11.13",
		"exceljs": "^4.4.0",
		"flatpickr": "^4.6.13",
		"jquery": "^3.7.1",
		"js-cookie": "^3.0.5",
		"jssha": "^3.3.1",
		"jszip": "^3.10.1",
		"litepicker": "^2.0.12",
		"moment": "^2.30.1",
		"nodemon": "^3.1.9",
		"npm-run-all": "^4.1.5",
		"postcss": "^8.5.6",
		"select2": "^4.1.0-rc.0",
		"socket.io-client": "^4.8.1",
		"sortablejs": "^1.15.6",
		"sweetalert2": "^11.6.13",
		"tailwindcss-animate": "^1.0.7",
		"tailwindcss-bg-patterns": "^0.3.0"
	},
	"scripts": {
		"webpack:watch": "webpack --watch --mode development",
		"tailwind:watch": "tailwindcss -i ./assets/style/tailwind.css -o ./assets/dist/css/tailwind.css --watch ",
		"tailwind:nodemon": "nodemon --watch assets/style/tailwind.css --exec \"npx tailwindcss -i ./assets/style/tailwind.css -o ./assets/dist/css/tailwind.css\"",
		"sass:watch": "sass --watch assets/style/custom/:assets/dist/css/ --style=compressed",
		"tailwindOld": "tailwindcss -i ./assets/style/--tailwind.css -o ./assets/dist/css/tailwindOld.css",
		"component": "tailwindcss -i ./assets/style/custom/v1.0.1/component.css -o ./assets/dist/css/component.min.css --minify",
		"dataTables": "tailwindcss -i ./assets/style/custom/v1.0.1/dataTable.css -o ./assets/dist/css/dataTable.min.css --minify",
		"fancyBox": "tailwindcss -i ./assets/style/custom/v1.0.1/fancyBox.css -o ./assets/dist/css/fancyBox.min.css --minify",
		"flatpickr": "tailwindcss -i ./assets/style/custom/v1.0.1/flatpickr.css -o ./assets/dist/css/flatpickr.min.css --minify",
		"select2": "tailwindcss -i ./assets/style/custom/v1.0.1/select2.css -o ./assets/dist/css/select2.min.css --minify",
		"sidebar": "tailwindcss -i ./assets/style/custom/v1.0.1/sidebar.css -o ./assets/dist/css/sidebar.min.css --minify",
		"navbar": "tailwindcss -i ./assets/style/custom/v1.0.1/navbar.css -o ./assets/dist/css/navbar.min.css --minify",
		"minifyCss": "npm-run-all --parallel component dataTables fancyBox flatpickr select2 sidebar navbar v1.0.1",
		"v1.0.1:watch": "tailwindcss -i ./assets/style/custom/v1.0.1.css -o ./assets/dist/css/v1.0.1.min.css --watch",
		"watch": "npm-run-all --parallel tailwind:watch v1.0.1:watch webpack:watch",
		"v1.0.1": "tailwindcss -i ./assets/style/custom/v1.0.1.css -o ./assets/dist/css/v1.0.1.min.css --minify",
		"tailwind:build": "tailwindcss -i ./assets/style/tailwind.css -o ./assets/dist/css/tailwind.css --minify",
		"webpack:build": "webpack --mode production",
		"build": "npm-run-all --serial tailwind:build  minifyCss v1.0.1 webpack:build",
		"docs:dev": "vitepress dev docs",
		"docs:build": "vitepress build docs",
		"docs:preview": "vitepress preview docs"
	}
}
```

```js
//webpack.config.js
const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
	entry: {
		apps: "./assets/script/apps.js", //general function
		login: "./assets/script/login.js", //Login page
		home: "./assets/script/home/index.js", //Home page
		redirect: "./assets/script/home/redirect.js", //Redirect page
		form: "./assets/script/form/index.js", //Form page

		//IS FORM
		// user environment IS-TID
		userEnv: "./assets/script/isform/IS-TID/index.js", //user environment page
		userEnvView: "./assets/script/isform/IS-TID/view.js",

		// confirm sheet IS-CFS
		confirmSheet: "./assets/script/isform/IS-CFS/index.js", //confirm sheet page
		confirmSheetView: "./assets/script/isform/IS-CFS/view.js", //confirm sheet page

		// Special Authorization ID
		specialAuth: "./assets/script/isform/IS-SPC/index.js", //Special Authorization ID page
		specialAuthView: "./assets/script/isform/IS-SPC/view.js", //Special Authorization ID page

		// IS Trouble Report
		troubleReport: "./assets/script/isform/IS-TRB/index.js", //IS Trouble Report page
		troubleReportView: "./assets/script/isform/IS-TRB/view.js", //IS Trouble Report page

		// Daily Log Checksheet
		DailyLogView: "./assets/script/isform/IS-DLC/view.js",

		// Regular review
		RgvView: "./assets/script/isform/IS-RGV/view.js", //Regular review page
		RgvIncharge: "./assets/script/isform/IS-RGV/incharge.js", //Regular review page

		// User ID and Authorization regular review result
		RgrSummary: "./assets/script/isform/IS-RGR/summary.js", //Regular review page
		RgrSummaryReport: "./assets/script/isform/IS-RGR/RgrSummaryReport.js", //Regular review page

		// varied off
		variedOff: "./assets/script/isform/IS-OFF/view.js", //Varied Off AS400 display

		// result confirmation
		resultConf: "./assets/script/isform/IS-JDR/view.js", //Job result confirmation

		// LN User Registration
		lnUserReg: "./assets/script/isform/IS-LN/index.js", //LN User Registration page
		lnUserRegView: "./assets/script/isform/IS-LN/view.js", //LN User Registration view page

		// Annual development
		"form-1": "./assets/script/isform/FORM-1/index.js",
		"form-1-ui": "./assets/script/isform/FORM-1/ui.js",
		"is-dev": "./assets/script/isform/IS-DEV/index.js",

		//Licence Control
		licence: "./assets/script/licence/index.js", //License page
		licencemaster: "./assets/script/licence/master.js", //License master page
		licencemasterdetail: "./assets/script/licence/masterdetail.js", //License master page

		// Requesting Approval Entertainment
		requestEntertain: "./assets/script/gpform/GP-ENT/index.js", //Requesting Approval Entertainment page
		requestEntertainView: "./assets/script/gpform/GP-ENT/view.js", //Requesting Approval Entertainment view page
		entertainReport: "./assets/script/gpform/GP-ENT/report.js", //Requesting Approval Entertainment report page",

		// clearance Entertainment
		clearance: "./assets/script/gpform/GP-CLER/index.js", //Clearance page
		clearanceNoAdv: "./assets/script/gpform/GP-CLER/noAdv.js", //Clearance page
		clearanceView: "./assets/script/gpform/GP-CLER/view.js", //Clearance page

		//manage schedule QOI
		manage: "./assets/script/qaform/QA-QOI/manage.js", //manage page
		qoiview: "./assets/script/qaform/QA-QOI/qoiview.js", //Qoi page

		// QA-INS : E-Self Inspection and Authorize
		eSelf: "./assets/script/qaform/QA-INS/index.js", //E-Self Inspection page
		eSelfView: "./assets/script/qaform/QA-INS/view.js", //E-Self view page
		eSelfAuditMaster: "./assets/script/qaform/QA-INS/auditMaster.js", //E-Self Audit Master page
		eSelfPreview: "./assets/script/qaform/QA-INS/preview.js", //E-Self Preview page
		eSelfAudit: "./assets/script/qaform/QA-INS/audit.js", //E-Self Audit page
		eSelfAuthorizeReportList:
			"./assets/script/qaform/QA-INS/authorizeReportList.js", //E-Self Authorize Report List page

		//VMS
		vms: "./assets/script/marform/MAR-VMS/index.js", //create page
		vmsmst: "./assets/script/marform/MAR-VMS/master.js", //manage page
		vmsview: "./assets/script/marform/MAR-VMS/view.js", //view page
		vmsreport: "./assets/script/marform/MAR-VMS/report.js", //view page

		// PS-SAR
		psSar: "./assets/script/psform/PS-SAR/index.js", //Sar page


		//GP-TRN
		alert: "./assets/script/gpform/GP-TRN/alert.js",
		formUtils: "./assets/script/gpform/GP-TRN/formUtils.js",
		validators: "./assets/script/gpform/GP-TRN/validators.js",
		view_train: "./assets/script/gpform/GP-TRN/view_train.js",
		manage_data: "./assets/script/gpform/GP-TRN/manage_data.js",
		emp_lookup: "./assets/script/gpform/GP-TRN/emp_lookup.js",
		training_select: "./assets/script/gpform/GP-TRN/training_select.js",
		training_functional:
			"./assets/script/gpform/GP-TRN/training_functional.js",
		training_legal: "./assets/script/gpform/GP-TRN/training_legal.js",
		training_meth: "./assets/script/gpform/GP-TRN/training_meth.js",
		training_pos: "./assets/script/gpform/GP-TRN/training_pos.js",
		training_out: "./assets/script/gpform/GP-TRN/training_out.js",
		form_client: "./assets/script/gpform/GP-TRN/form_client.js",
		training_main: "./assets/script/gpform/GP-TRN/training_main.js",
		view_train_report: "./assets/script/gpform/GP-TRN/view_train_report.js",
		manage_group: "./assets/script/gpform/GP-TRN/manage_group.js",
		show_sum_report: "./assets/script/gpform/GP-TRN/show_sum_report.js",

		// IS-ADP: Annual Development Plan
		isAdp: "./assets/script/isform/IS-ADP/index.js", //IS-ADP page
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "assets/dist/js"),
	},
	mode: process.env.STATE,
	optimization: {
		concatenateModules: true,
		minimize: true,
		minimizer: [
			new TerserPlugin({
				parallel: true, // ✅ เปิด multi-core minify
				terserOptions: {
					format: {
						comments: false, // ลบคอมเมนต์ทิ้ง
					},
				},
				extractComments: false, // ไม่แยก LICENSE ออกมาเป็นไฟล์ .txt
			}),
		],
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.md$/,
				use: "raw-loader",
			},
			{
				test: /\.tsx?$/, // ให้ webpack build ts/tsx
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
		alias: {
			"@public": path.resolve(__dirname, "assets/script/public/v1.0.3"),
		},
	},
	plugins: [
		new Dotenv({
			path: path.resolve(__dirname, "./.env"),
		}),
		new CompressionPlugin({
			algorithm: "gzip", // หรือใช้ "brotliCompress" ก็ได้
			test: /\.(js|css|html|svg)$/,
			threshold: 10240,
			minRatio: 0.8,
		}),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
		}),
	],
	cache:
		process.env.STATE === "production"
			? false
			: {
					type: "filesystem",
					//   cacheDirectory: path.resolve(__dirname, '.cache/webpack'),
					buildDependencies: {
						config: [__filename],
					},
				},
};
```
