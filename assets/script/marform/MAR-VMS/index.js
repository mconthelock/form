import {
  ajaxOptions,
  getData,
  showMessage,
  requiredForm,
} from "../../jFuntion";
import { host, showLoader } from "../../utils";
import { createTable } from "../../inc/_dataTable";
import { createColumnFilters } from "../../inc/_filter.js";
import { excelOptions, exportExcel, defaultExcel } from "../../inc/_excel.js";

var table;