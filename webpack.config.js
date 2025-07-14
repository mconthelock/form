const path = require("path");
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

    // varied off
    variedOff: "./assets/script/isform/IS-OFF/view.js", //Varied Off AS400 display

    // result confirmation
    resultConf: "./assets/script/isform/IS-JDR/view.js", //Job result confirmation

    //Licence Control
    licence: "./assets/script/licence/index.js", //License page
    licencemaster: "./assets/script/licence/master.js", //License master page
    licencemasterdetail: "./assets/script/licence/masterdetail.js", //License master page

    // Requesting Approval Entertainment
    requestEntertain: "./assets/script/gpform/GP-ENT/index.js", //Requesting Approval Entertainment page
    requestEntertainView: "./assets/script/gpform/GP-ENT/view.js", //Requesting Approval Entertainment view page

    // clearance Entertainment
    clearance: "./assets/script/gpform/GP-CLER/index.js", //Clearance page
    clearanceNoAdv: "./assets/script/gpform/GP-CLER/noAdv.js", //Clearance page
    clearanceView: "./assets/script/gpform/GP-CLER/view.js", //Clearance page

    //manage schedule QOI
    manage: "./assets/script/qaform/QA-QOI/manage.js", //manage page
    qoiview: "./assets/script/qaform/QA-QOI/qoiview.js", //Qoi page

    // QA-INS : E-Self Inspection and Authorize
    eSelf: "./assets/script/qaform/QA-INS/index.js", //E-Self Inspection page
    eSelfView: "./assets/script/qaform/QA-INS/view.js", //E-Self Inspection page
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "assets/dist/js"),
  },
  mode: process.env.STATE,
  optimization: {
    concatenateModules: true,
    minimize: true,
    minimizer: [new TerserPlugin()],
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
    ],
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
  ],
  externals: {
    jquery: "jQuery",
    datatables: "DataTables",
  },
  cache: false,
};
