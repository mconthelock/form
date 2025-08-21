<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

<?php
$persons    = ['Suwanna', 'Benchamas', 'Nantanat', 'Methiya', 'Worarat', 'Bhakamol', 'Thanwara', 'Anothai', 'Pattareeya', 'Sawitree', 'Jirapan', 'Nutthaya', 'Worapawns', 'Surachet', 'Sonthaya', 'Sunanthorn'];
$rows       = [
    ['system' => 'Thai Localization', 'module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-Journal Voucher'],
    ['system' => 'Thai Localization', 'module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-Journal Voucher (1)'],
    ['system' => 'Thai Localization', 'module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-GL Data Import from Excel'],
    ['system' => 'Thai Localization', 'module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-Upload GL'],
    ['system' => 'Thai Localization', 'module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-Transaction List'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Define Journal Vouchers'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Define Journal Vouchers (1)'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Journal Voucher Types'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Transaction Codes'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Logging Codes'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Business Partners'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Business Partner Groups'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Business Partner Sets'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Easy Entry Business Partner'],
    ['system' => 'Thai Localization', 'module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Invoice-to Bsuiness Partner Balances'],
    ['system' => 'Thai Localization', 'module' => 'Financials', 'category' => 'General Ledger', 'function' => '-Post to GL'],
    ['system' => 'Thai Localization', 'module' => 'Financials', 'category' => 'General Ledger', 'function' => '-Cancel GL Posting'],
    ['system' => 'Thai Localization', 'module' => 'Financials', 'category' => 'AP', 'function' => '-AP Invoice'],
    ['system' => 'Thai Localization', 'module' => 'Financials', 'category' => 'AR', 'function' => '-AR Invoice'],
    ['system' => 'Thai Localization', 'module' => 'Tax System', 'category' => 'Input Tax', 'function' => '-Transfer Input Tax'],
];
$modules    = array_values(array_unique(array_map(function ($r) {
    return $r['module'];
}, $rows)));
$categories = array_values(array_unique(array_map(function ($r) {
    return $r['category'];
}, $rows)));
$permitted  = [];
foreach ($rows as $r) {
    foreach ($persons as $p) {
        $permitted[$r['module'] . '|' . $r['category'] . '|' . $r['function']][$p] = in_array($p, ['Suwanna', 'Benchamas']) ? 1 : 0;
    }
}
$save_url  = base_url('authorize/save_matrix');
$csrf_name = isset($this) && isset($this->security) ? $this->security->get_csrf_token_name() : '';
$csrf_hash = isset($this) && isset($this->security) ? $this->security->get_csrf_hash() : '';
?>
<div class="w-full mx-auto max-w-[120rem] p-6 space-y-4">
    <div class="flex items-center justify-between">
        <div class="text-2xl font-bold">Authorize Matrix</div>
        <div class="flex items-center gap-2">
            <div class="badge" id="changeCount">0 changes</div>
            <button id="saveBtn" class="btn btn-primary btn-sm">บันทึก</button>
        </div>
    </div>
    <div class="grid lg:grid-cols-6 gap-3">
        <select id="module" class="select select-bordered w-full">
            <option value="">ทุกโมดูล</option>
            <?php foreach ($modules as $m): ?>
            <option value="<?php    echo htmlspecialchars($m, ENT_QUOTES, 'UTF-8'); ?>"><?php    echo htmlspecialchars($m, ENT_QUOTES, 'UTF-8'); ?></option><?php endforeach; ?>
        </select>
        <select id="category" class="select select-bordered w-full">
            <option value="">ทุกหมวด</option>
            <?php foreach ($categories as $c): ?>
            <option value="<?php    echo htmlspecialchars($c, ENT_QUOTES, 'UTF-8'); ?>"><?php    echo htmlspecialchars($c, ENT_QUOTES, 'UTF-8'); ?></option><?php endforeach; ?>
        </select>
        <input id="q" type="text" placeholder="ค้นหา Function" class="input input-bordered w-full" />
        <div class="col-span-3 flex flex-wrap gap-2">
            <?php foreach ($persons as $p): ?>
            <label class="cursor-pointer flex items-center gap-2">
                <input type="checkbox" class="checkbox checkbox-sm person-toggle" data-col="<?php    echo htmlspecialchars($p, ENT_QUOTES, 'UTF-8'); ?>" checked>
                <span class="text-sm"><?php    echo htmlspecialchars($p, ENT_QUOTES, 'UTF-8'); ?></span>
            </label>
            <?php endforeach; ?>
        </div>
    </div>
    <div class="overflow-x-auto bg-base-100 rounded-2xl shadow">
        <table class="table table-xs">
            <thead class="sticky top-0 z-10 bg-base-100">
                <tr>
                    <th class="w-44">Module</th>
                    <th class="w-56">Category</th>
                    <th class="min-w-[18rem]">Function</th>
                    <?php foreach ($persons as $p): ?>
                    <th class="text-center person-col" data-col="<?php    echo htmlspecialchars($p, ENT_QUOTES, 'UTF-8'); ?>">
                        <div class="flex flex-col items-center">
                            <span class="truncate max-w-[8rem]"><?php    echo htmlspecialchars($p, ENT_QUOTES, 'UTF-8'); ?></span>
                            <input type="checkbox" class="checkbox checkbox-xs col-master" data-col="<?php    echo htmlspecialchars($p, ENT_QUOTES, 'UTF-8'); ?>">
                        </div>
                    </th>
                    <?php endforeach; ?>
                    <th class="w-24 text-center">แถว</th>
                </tr>
            </thead>
            <tbody id="tbody">
                <?php foreach ($rows as $r):
    $k = $r['module'] . '|' . $r['category'] . '|' . $r['function']; ?>
                <tr class="data-row" data-module="<?php    echo htmlspecialchars($r['module'], ENT_QUOTES, 'UTF-8'); ?>" data-category="<?php    echo htmlspecialchars($r['category'], ENT_QUOTES, 'UTF-8'); ?>" data-function="<?php    echo htmlspecialchars($r['function'], ENT_QUOTES, 'UTF-8'); ?>">
                    <td><?php    echo htmlspecialchars($r['module'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php    echo htmlspecialchars($r['category'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php    echo htmlspecialchars($r['function'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <?php    foreach ($persons as $p):
        $chk = isset($permitted[$k][$p]) ? (int) $permitted[$k][$p] : 0; ?>
                    <td class="text-center person-col" data-col="<?php        echo htmlspecialchars($p, ENT_QUOTES, 'UTF-8'); ?>">
                        <input type="checkbox" class="checkbox checkbox-sm cell" data-person="<?php        echo htmlspecialchars($p, ENT_QUOTES, 'UTF-8'); ?>" <?php        echo $chk ? 'checked' : ''; ?>>
                    </td>
                    <?php    endforeach; ?>
                    <td class="text-center">
                        <input type="checkbox" class="checkbox checkbox-xs row-master">
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
<script>
var tbody=document.getElementById('tbody');
var moduleSel=document.getElementById('module');
var categorySel=document.getElementById('category');
var q=document.getElementById('q');
var changeBadge=document.getElementById('changeCount');
var saveBtn=document.getElementById('saveBtn');
var changes={};
var original={};

document.querySelectorAll('.data-row').forEach(function(tr){
  var mod=tr.getAttribute('data-module');
  var cat=tr.getAttribute('data-category');
  var fn =tr.getAttribute('data-function');
  original[mod+'|'+cat+'|'+fn]={};
  tr.querySelectorAll('.cell').forEach(function(cb){
    var person=cb.dataset.person;
    original[mod+'|'+cat+'|'+fn][person]=cb.checked?1:0;
  });
});

function key(mod,cat,fn,person){ return [mod,cat,fn,person].join('||'); }
function updateChangeBadge(){ changeBadge.textContent=Object.keys(changes).length+' changes'; }

tbody.addEventListener('change',function(e){
  if(!e.target.classList.contains('cell')) return;
  var tr=e.target.closest('tr');
  var mod=tr.getAttribute('data-module');
  var cat=tr.getAttribute('data-category');
  var fn =tr.getAttribute('data-function');
  var person=e.target.dataset.person;
  var ori=original[mod+'|'+cat+'|'+fn][person];
  var now=e.target.checked?1:0;
  var k=key(mod,cat,fn,person);
  if(now===ori){ delete changes[k]; }
  else { changes[k]={action:'upsert',system:'Thai Localization',module:mod,category:cat,function:fn,person:person,permitted:now}; }
  updateChangeBadge();
});

document.querySelectorAll('.row-master').forEach(function(rm){
  rm.addEventListener('change',function(){
    var tr=this.closest('tr');
    tr.querySelectorAll('.cell').forEach(function(cb){
      if(cb.offsetParent===null) return;
      if(cb.checked!==rm.checked){ cb.checked=rm.checked; cb.dispatchEvent(new Event('change')); }
    });
  });
});

document.querySelectorAll('.col-master').forEach(function(cm){
  cm.addEventListener('change',function(){
    var person=this.dataset.col;
    tbody.querySelectorAll('.data-row').forEach(function(tr){
      var cell=tr.querySelector('.cell[data-person="'+person+'"]');
      if(cell&&cell.offsetParent!==null&&cell.checked!==cm.checked){
        cell.checked=cm.checked; cell.dispatchEvent(new Event('change'));
      }
    });
  });
});

document.querySelectorAll('.person-toggle').forEach(function(tg){
  tg.addEventListener('change',function(){
    var col=this.dataset.col;
    document.querySelectorAll('.person-col[data-col="'+col+'"]').forEach(function(td){
      td.style.display = tg.checked ? '' : 'none';
    });
  });
});

function filt(){
  var m=moduleSel.value.trim().toLowerCase();
  var c=categorySel.value.trim().toLowerCase();
  var text=q.value.trim().toLowerCase();
  tbody.querySelectorAll('.data-row').forEach(function(tr){
    var tm=tr.getAttribute('data-module').toLowerCase();
    var tc=tr.getAttribute('data-category').toLowerCase();
    var tf=tr.getAttribute('data-function').toLowerCase();
    var show=(!m||tm===m)&&(!c||tc===c)&&(!text||tf.indexOf(text)>-1);
    tr.style.display=show?'':'none';
  });
}

moduleSel.addEventListener('change',filt);
categorySel.addEventListener('change',filt);
q.addEventListener('input',filt);

saveBtn.addEventListener('click',function(){
  if(Object.keys(changes).length===0) return;
  var payload={changes:Object.values(changes)};
  var headers={'Content-Type':'application/json'};
  fetch('<?php echo $save_url; ?>',{method:'POST',headers:headers,body:JSON.stringify(payload)})
    .then(function(r){return r.json();})
    .then(function(res){
      if(res&&res.status==='ok'){
        Object.keys(changes).forEach(function(k){
          var parts=k.split('||');
          var mod=parts[0],cat=parts[1],fn=parts[2],person=parts[3];
          original[mod+'|'+cat+'|'+fn][person]=payload.changes.find(function(x){
            return x.module===mod&&x.category===cat&&x.function===fn&&x.person===person;
          }).permitted;
        });
        changes={}; updateChangeBadge();
      } else { alert('บันทึกไม่สำเร็จ'); }
    }).catch(function(){ alert('บันทึกไม่สำเร็จ'); });
});
</script>
