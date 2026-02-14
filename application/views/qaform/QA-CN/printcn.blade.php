<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Changing Notice</title>

<style>
body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    margin: 20px;
}

h2, h3 {
    text-align: center;
    margin: 2px 0;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
}

td, th {
    border: 1px solid #000;
    padding: 4px;
    vertical-align: top;
}

th {
    background: #e6f2ff;
}

.no-border td {
    border: none;
}

.print-btn {
    text-align: right;
    margin-bottom: 10px;
}

/* ===== Print Setting ===== */
@media print {
    @page {
        size: A4 portrait;
        margin: 10mm;
    }

    .no-print {
        display: none !important;
    }
}
</style>

<script>
window.onload = function () {
    window.print();
};

window.onafterprint = function () {
    window.close();
};
</script>

</head>
<body>

<h2>MITSUBISHI ELEVATOR ASIA CO., LTD.</h2>
<h3>Changing Notice</h3>

 <table width="100%" border="1" cellpadding="1" cellspacing="0" bordercolor="#000000">
    <tr> <td bgcolor="#99CCFF">Form No.</td><td colspan="2">{{ $formno }}</td></tr>
    <tr> <td bgcolor="#99CCFF">Input by</td><td colspan=2>{{ "(".$cnData[0]->VINPUTER.")".$cnData[0]->INPNAME }}</td></tr> 
    <tr> <td bgcolor="#99CCFF">Request by</td><td colspan=2>{{ "(".$cnData[0]->VREQNO.")".$cnData[0]->REQNAME }}</td></tr> 
	<tr> <td bgcolor="#99CCFF">Title.</td><td  colspan=2>{{ $cnData[0]->TITLE }}</td></tr> 
	<tr> <td bgcolor="#99CCFF">Item No.</td><td colspan=2>{{ $cnData[0]->ITEMNO }}</td></tr> 
    <tr> <td valign=top bgcolor="#99CCFF">Drawing No.</td><td  colspan=2> 
        <table border="1" cellpadding="1" cellspacing="0" bordercolor="#000000" width='100%'> 
	        <tr bgcolor='#009999' align=center> <td>DWG No.</td><td>OK</td><td>NG</td><td>Remark</td></tr> 
            @foreach ($drawings as $d)
             <tr><td width='15%'>{{ $d->DWGNO.(!is_null($d->REVNO)? "(".$d->REVNO.")":"") }}</td><td><input type='radio'></td><td><input type='radio'></td><td>{{ $d->REMARK}}</td></tr>
            @endforeach
        </table>
	  </td>
    </tr>
    <tr><td bgcolor="#99CCFF">Part Name</td><td colspan=2>{{ $cnData[0]->PRTNAME }}</td></tr>
	<tr> <td bgcolor="#99CCFF">Pur Item No.</td><td colspan=2>{{ $cnData[0]->PURITEM }}</td></tr>
	<tr> <td bgcolor="#99CCFF">PO. or Invoice no.</td><td colspan=2> {{ $cnData[0]->INVNO }}</td></tr>
	<tr> <td bgcolor="#99CCFF">Order Quantity</td><td colspan=2>{{ $cnData[0]->ORDQ }}</td></tr>
	<tr> <td bgcolor="#99CCFF">Supplier or Subcontractor Name</td><td colspan=2>{{ $cnData[0]->SVENDNAME }}</td></tr>
	<tr> <td valign="top" bgcolor="#99CCFF">Classification of changing.</td><td colspan=2>{{ $cnData[0]->CLSCHANGE }}</td></tr>
    <tr> <td valign="top" bgcolor="#99CCFF">Reason</td><td colspan=2>{{ ($cnData[0]->RSNNO == "5"? $cnData[0]->REASON." ".$cnData[0]->RSNOTHER:$cnData[0]->REASON ) }}</td></tr>
    <tr> <td bgcolor="#99CCFF">Sample transaction</td><td colspan=2>{{ ($cnData[0]->TRANSNO == 1 ? "Scrap":($cnData[0]->TRANSNO == 2 ? "Return":($cnData[0]->TRANSNO == 3 ? "Other":"")))." ".$cnData[0]->DETTRANS }}</td></tr>
    <tr> <td bgcolor="#99CCFF">RQ or CN No. for reference</td><td colspan=2>{{ $cnData[0]->RQCNREF }}</td></tr>
    <tr> <td bgcolor="#99CCFF">Before Changing</td><td colspan=2>{{ $cnData[0]->BEFCHANGE }}</td></tr>
    <tr> <td bgcolor="#99CCFF">After Changing</td><td colspan=2>{{ $cnData[0]->AFTCHANGE }}</td></tr>
    <tr><td colspan=3 bgcolor="#99CCFF">QE Inspection Detail</td></tr>
    <tr bgcolor="#99CCFF"><td nowrap width="1%">Receive Part Date</td><td nowrap width="1%"><input type="text" name="textfield" class="box"></td><td width="1%">&nbsp;</td></tr>	
	<tr bgcolor="#99CCFF"> <td nowrap width="1%">Inspection Point</td><td nowrap width="1%"><input type="text" name="textfield" class="box"></td><td width="1%">Point.</td></tr>	
	<tr bgcolor="#99CCFF"> <td nowrap width="1%">No. Samples</td><td nowrap width="1%"><input type="text" name="textfield" class="box"></td><td width="1%">Pcs</td></tr>	
	<tr bgcolor="#99CCFF"> <td nowrap width="1%">Inspection Person</td><td nowrap width="1%" colspan=2><input type="text" name="textfield" class="box" size="50"></td></tr>	
	<tr bgcolor="#99CCFF"> <td>&nbsp;</td><td align="center">Name</td><td>Point</td></tr> 
	<tr bgcolor="#99CCFF"> <td nowrap width="1%">Measure Tool1</td><td nowrap width="1%"><input type="text" name="textfield" class="box"></td><td><input type="text" name="textfield" class="box"></td></tr> 
	<tr bgcolor="#99CCFF"> <td nowrap width="1%">Measure Tool2</td><td nowrap width="1%"><input type="text" name="textfield" class="box"></td><td><input type="text" name="textfield" class="box"></td></tr> 
	<tr bgcolor="#99CCFF"> <td nowrap width="1%">Measure Tool3</td><td nowrap width="1%"><input type="text" name="textfield" class="box"></td><td><input type="text" name="textfield" class="box"></td></tr> 
	<tr bgcolor="#99CCFF"> <td nowrap width="1%">Measure Tool4</td><td nowrap width="1%"><input type="text" name="textfield" class="box"></td><td><input type="text" name="textfield" class="box"></td></tr> 
	<tr bgcolor="#99CCFF"> <td nowrap width="1%">Measure Tool5</td><td nowrap width="1%"><input type="text" name="textfield" class="box"></td><td><input type="text" name="textfield" class="box"></td></tr> 


</table>
</body>
</html>
