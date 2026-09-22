const fs=require('fs'),assert=require('assert/strict');
(async()=>{
const payload=await import('data:text/javascript;base64,'+fs.readFileSync('assets/script/ieform/IE-JIG/payload.js').toString('base64'));
const source=fs.readFileSync('assets/script/ieform/IE-JIG/workflow.js','utf8').replace(/^import .*;\r?\n/gm,'').replace('export function initializeJigWorkflow','function initializeJigWorkflow');
for(const ng of [false,true]){
const calls=[],storage=new Map(),controls=[{disabled:false}],approval={},buttons={};let valid=false,redirect;
const key={NFRMNO:31,VORGNO:'051401',CYEAR:'26',CYEAR2:'2026',NRUNNO:4};
const fields=Object.fromEntries(Object.keys(payload.headerFields).map(name=>[name,{value:''}]));
for(const [name,value] of Object.entries({jig_name:'Test',revision:'0',start_use_date:'2026-09-01',period:'6',location:'K4',process_code:'A',input_by:'15199',requested_by:'15199',ng_defect_detail:'Oversize',ng_corrective_action:'Repair',ng_plan_date:'2026-10-01',ng_location:'K4'}))fields[name]={value};
fields.reg_date={_flatpickr:{setDate:date=>assert.equal(date,'2026-05-01')}};
const form={elements:fields,querySelectorAll:()=>ng?['Adjust','Modify','Replace'].map(value=>({value})):[]};
const row={querySelector:s=>({value:({point:'Diameter',tool:'CMM',min:'1',max:'2',measured:ng?'3':'1.5',unit:'mm'})[s.match(/data-field="([^"]+)"/)[1]]})};
const rows={children:[row],querySelectorAll:()=>[{textContent:ng?'NG':'OK'}]};
const document={querySelector:s=>s==='.form-data'?{dataset:{nfrmno:'31',vorgno:'051401',cyear:'26',cyear2:'',nrunno:'',empno:'15199',mode:'1'}}:s==='#jig-approval'?approval:(buttons[s]??={}),querySelectorAll:()=>controls};
const deps={Swal:{fire:async arg=>{throw Error('Unexpected alert '+arg.text);}},createForm:async data=>{calls.push(['create',data]);return {status:true,data:key};},getFormDetail:async()=>{calls.push(['get']);return {VINPUTER:'15199',VREQNO:'15199',DREQDATE:'2026-05-22'};},showflow:async()=>{throw Error('Unexpected flow load');},doaction:async()=>{throw Error('Unexpected approval');},insertJigForm:async data=>{calls.push(['insert',data]);return {JIG_NO:'JIG26-004'};},saveJigForm:async()=>{throw Error('Unexpected patch');},loadJigForm:async()=>null,uploadJigFiles:async()=>{calls.push(['upload']);return [{FILE_NAME:'drawing.pdf',FILE_PATH:'test.pdf'}];},finishJigForm:async()=>{throw Error('Unexpected finish');},...payload,document,sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},window:{location:{href:'http://jig.test/form/?no=31&orgNo=051401&y=26&empno=15199',assign:url=>{redirect=url;}}}};
const init=Function(...Object.keys(deps),source+';return initializeJigWorkflow;')(...Object.values(deps));
const workflow=init({form,rows,pageMode:'create',validate:async()=>valid,files:()=>({stored:[],incoming:[{}]}),ready:Promise.resolve()});
await workflow.save();assert.equal(calls.length,0);valid=true;await workflow.save();assert.deepEqual(calls.map(x=>x[0]),['create','get','upload','insert']);const data=calls[3][1];assert.equal(data.FILES.length,1);assert.equal(data.DETAILS.length,1);assert.equal(data.VORGNO,'051401');assert.equal(data.FORM_TYPE,'CREATE');assert.equal(data.JIG_NO,undefined);assert.equal(data.NG?.ACTION,ng?'Adjust,Modify,Replace':undefined);assert.equal(calls[0][1].DRAFT,'0');assert.equal(new URL(redirect).searchParams.get('runNo'),'4');assert.equal(storage.size,0);assert.equal(controls[0].disabled,false);console.log('PASS '+(ng?'NG':'OK')+': validation gate, create, upload, insert, redirect, recovery cleanup.');
}
})().catch(e=>{console.error(e);process.exitCode=1;});
