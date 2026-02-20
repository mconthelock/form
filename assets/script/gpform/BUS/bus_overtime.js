import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import {
  getLine,
  getRoute,
  getStop
} from "./data.js";
import { createTable } from "@amec/webasset/dataTable";
import { initApp, tableOption } from "../../utils.js";
import { generatePdf } from "@amec/webasset/api/pdf";
import { buildBusRouteHtml } from "./templete_pdf.js";
import { downloadOrOpenFile } from "@amec/webasset/api/file";

var tableLine;
var tableStop;
let selectedBusId = null;
