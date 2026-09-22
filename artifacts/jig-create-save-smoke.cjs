const fs=require('fs'),assert=require('assert/strict');const {chromium}=require('D:/for_dev/src/api/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true});try{for(const ng of [false,true]){
const page=await browser.newPage();const errors=[],calls=[];page.on('pageerror',e=>errors.push(e.message));const html=fs.readFileSync('artifacts/jig-create-rendered.html','utf8');
const key={NFRMNO:31,VORGNO:'051401',CYEAR:'26',CYEAR2:'2026',NRUNNO:4};
await page.route('**/*',async route=>{const req=route.request(),url=req.url();let body=[];if(url==='http://jig.test/form/')return route.fulfill({contentType:'text/html',body:html});
if(url.startsWith('http://jig.test/form/?'))return route.fulfill({contentType:'text/html',body:'Saved view'});
if(url.includes('/assets/dist/js/iejig.js'))return route.fulfill({contentType:'application/javascript',body:fs.readFileSync('assets/dist/js/iejig.js','utf8')});
if(url.endsWith('/mfg-processes'))body=[{PROCESS:'A'}];else if(url.endsWith('/locations'))body=[{SHOPCODE:'K4',SHOPDESC:'Assembly'}];else if(url.endsWith('/ie-pics'))body=[{SEMPNO:'15199',SNAME:'PIC'}];else if(url.includes('/users/search/'))body=[{SEMPNO:'15199',SNAME:'Test',CSTATUS:'1'}];
else if(url.endsWith('/form/createForm')){calls.push({step:'create',data:req.postDataJSON()});body={status:true,data:key};}
else if(url.endsWith('/form/getFormDetail')){calls.push({step:'getForm'});body={...key,VINPUTER:'15199',VREQNO:'15199',DREQDATE:'2026-05-22',CST:'0'};}
else if(url.endsWith('/jig/uploadfile')){calls.push({step:'upload',data:req.postData()});body={status:true,files:[{FILE_NAME:'drawing.pdf',FILE_PATH:'test/drawing.pdf',FILE_TYPE:'application/pdf',FILE_SIZE:12}]};}
else if(url.endsWith('/iedoc/jig')){calls.push({step:'insert',data:req.postDataJSON()});body={...key,JIG_NO:'JIG26-004'};}
return route.fulfill({contentType:'application/json',body:JSON.stringify(body)});});
await page.goto('http://jig.test/form/');await page.waitForFunction(()=>document.querySelector('#checkpoint-rows')?.children.length===1);
await page.locator('#validate-jig').click();await page.locator('.swal2-confirm').click();assert.equal(calls.length,0,'empty input must not create');
await page.locator('[name=requested_by]').fill('15199');await page.waitForFunction(()=>document.querySelector('[name=requested_by]').dataset.verified==='15199');
await page.locator('[name=jig_name]').fill('Test jig');await page.locator('[name=process_code]').selectOption('A');await page.locator('[name=location]').selectOption('K4');await page.locator('[name=period]').selectOption('6');
for(const [field,value] of Object.entries({point:'Diameter',min:'1',max:'2',measured:ng?'3':'1.5'}))await page.locator('[data-field='+field+']').fill(value);
await page.locator('#validate-jig').click();await page.locator('.swal2-confirm').click();assert.equal(calls.length,0,'no file must not create');
await page.locator('#jig-files').setInputFiles({name:'drawing.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 test')});
if(ng){await page.locator('#validate-jig').click();await page.locator('.swal2-confirm').click();assert.equal(calls.length,0,'NG details required');await page.locator('[name=ng_defect_detail]').fill('Oversize');await page.locator('[name=ng_corrective_action]').fill('Repair');for(const action of ['Adjust','Modify','Replace'])await page.locator('[value='+action+']').check();await page.locator('[name=ng_plan_date]').evaluate(el=>el._flatpickr.setDate('2026-06-01',true,'Y-m-d'));await page.locator('[name=ng_location]').selectOption('K4');}
await page.locator('#validate-jig').click();await page.waitForURL('**/*runNo=4*');assert.deepEqual(calls.map(x=>x.step),['create','getForm','upload','insert']);assert.equal(calls[0].data.DRAFT,'0');const payload=calls[3].data;assert.equal(payload.FILES.length,1);assert.equal(payload.DETAILS.length,1);assert.equal(payload.VORGNO,'051401');assert.equal(payload.FORM_TYPE,'CREATE');assert.equal(payload.JIG_NO,undefined);if(ng){assert.equal(payload.NG.ACTION,'Adjust,Modify,Replace');assert.equal(payload.NG.CORRECTIVE,'Repair');}else assert.equal(payload.NG,null);assert.deepEqual(errors,[]);console.log('PASS create '+(ng?'NG':'OK')+': validation, Webflow, upload, JIG payload, redirect');await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
