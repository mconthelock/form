<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<?php
$person     = isset($person) ? $person : 'Me';
$rows       = isset($rows) ? $rows : [
    ['module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-Journal Voucher', 'permitted' => 1],
    ['module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-Journal Voucher (1)', 'permitted' => 1],
    ['module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-GL Data Import from Excel', 'permitted' => 1],
    ['module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-Upload GL', 'permitted' => 1],
    ['module' => 'Add-On Program', 'category' => 'General Ladger', 'function' => '-Transaction List', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Define Journal Vouchers', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Define Journal Vouchers (1)', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Journal Voucher Types', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Transaction Codes', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Code Definitions', 'function' => '-Logging Codes', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Business Partners', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Business Partner Groups', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Business Partner Sets', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Easy Entry Business Partner', 'permitted' => 1],
    ['module' => 'Master Data', 'category' => 'Business Partners', 'function' => 'Invoice-to Bsuiness Partner Balances', 'permitted' => 1],
    ['module' => 'Financials', 'category' => 'General Ledger', 'function' => '-Post to GL', 'permitted' => 0],
    ['module' => 'Financials', 'category' => 'General Ledger', 'function' => '-Cancel GL Posting', 'permitted' => 0],
    ['module' => 'Financials', 'category' => 'AP', 'function' => '-AP Invoice', 'permitted' => 0],
    ['module' => 'Financials', 'category' => 'AR', 'function' => '-AR Invoice', 'permitted' => 0],
    ['module' => 'Tax System', 'category' => 'Input Tax', 'function' => '-Transfer Input Tax', 'permitted' => 0],
];
$modules    = array_values(array_unique(array_map(function ($r) {
    return $r['module']; }, $rows)));
$categories = array_values(array_unique(array_map(function ($r) {
    return $r['category']; }, $rows)));
$save_url   = base_url('authorize/save_mine');
$csrf_name  = isset($this) && isset($this->security) ? $this->security->get_csrf_token_name() : '';
$csrf_hash  = isset($this) && isset($this->security) ? $this->security->get_csrf_hash() : '';
?>
<div class="w-full mx-auto max-w-7xl p-6 space-y-4">
    <div class="flex items-center justify-between">
        <div class="text-2xl font-bold">My Permissions</div>
        <div class="flex items-center gap-2">
            <div class="badge" id="summary">0 on • 0 off</div>
            <div class="badge" id="changeCount">0 changes</div>
            <button id="saveBtn" class="btn btn-primary btn-sm">บันทึก</button>
        </div>
    </div>
    <div class="grid md:grid-cols-5 gap-3">
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
        <button id="selectAll" class="btn btn-outline">ติ๊กทั้งหมด(ผลลัพธ์)</button>
        <button id="unselectAll" class="btn btn-outline">เอาออกทั้งหมด(ผลลัพธ์)</button>
    </div>
    <div class="overflow-x-auto bg-base-100 rounded-2xl shadow">
        <table class="table table-sm">
            <thead class="sticky top-0 z-10 bg-base-100">
                <tr>
                    <th class="w-44">Module</th>
                    <th class="w-56">Category</th>
                    <th>Function</th>
                    <th class="w-36 text-center"><?php echo htmlspecialchars($person, ENT_QUOTES, 'UTF-8'); ?></th>
                    <!-- <th class="w-24 text-center">แถว</th> -->
                </tr>
            </thead>
            <tbody id="tbody">
                <?php foreach ($rows as $r): ?>
                <tr class="data-row" data-module="<?php    echo htmlspecialchars($r['module'], ENT_QUOTES, 'UTF-8'); ?>" data-category="<?php    echo htmlspecialchars($r['category'], ENT_QUOTES, 'UTF-8'); ?>" data-function="<?php    echo htmlspecialchars($r['function'], ENT_QUOTES, 'UTF-8'); ?>">
                    <td><?php    echo htmlspecialchars($r['module'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php    echo htmlspecialchars($r['category'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td><?php    echo htmlspecialchars($r['function'], ENT_QUOTES, 'UTF-8'); ?></td>
                    <td class="text-center">
                        <input type="checkbox" class="checkbox checkbox-sm cell" data-person="<?php    echo htmlspecialchars($person, ENT_QUOTES, 'UTF-8'); ?>" <?php    echo !empty($r['permitted']) ? 'checked' : ''; ?>>
                    </td>
                    <!-- <td class="text-center">
                        <input type="checkbox" class="checkbox checkbox-xs row-master">
                    </td> -->
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <div id="saveBar" class="fixed bottom-4 left-1/2 -translate-x-1/2 hidden">
        <div class="join shadow-lg">
            <button id="saveBarBtn" class="btn btn-primary join-item">บันทึกการเปลี่ยนแปลง</button>
            <span class="badge join-item" id="saveBarCount">0</span>
        </div>
    </div>
</div>
<script>
    var tbody = document.getElementById('tbody');
    var moduleSel = document.getElementById('module');
    var categorySel = document.getElementById('category');
    var q = document.getElementById('q');
    var selectAllBtn = document.getElementById('selectAll');
    var unselectAllBtn = document.getElementById('unselectAll');
    var changeBadge = document.getElementById('changeCount');
    var summary = document.getElementById('summary');
    var saveBtn = document.getElementById('saveBtn');
    var saveBar = document.getElementById('saveBar');
    var saveBarBtn = document.getElementById('saveBarBtn');
    var saveBarCount = document.getElementById('saveBarCount');
    var personName = "<?php echo htmlspecialchars($person, ENT_QUOTES, 'UTF-8'); ?>";
    var changes = {};
    var original = {};
    function baseKey(tr) { return [tr.getAttribute('data-module'), tr.getAttribute('data-category'), tr.getAttribute('data-function')].join('|'); }
    function changeKey(mod, cat, fn, person) { return [mod, cat, fn, person].join('||'); }
    function updateBadges() {
        changeBadge.textContent = Object.keys(changes).length + ' changes';
        saveBarCount.textContent = Object.keys(changes).length;
        saveBar.classList.toggle('hidden', Object.keys(changes).length === 0);
        var on = 0, off = 0;
        tbody.querySelectorAll('.cell').forEach(function (cb) { if (cb.checked) on++; else off++; });
        summary.textContent = on + ' on • ' + off + ' off';
    }
    document.querySelectorAll('#tbody tr').forEach(function (tr) {
        var k = baseKey(tr);
        var cb = tr.querySelector('.cell');
        original[k] = cb.checked ? 1 : 0;
    });
    tbody.addEventListener('change', function (e) {
        if (e.target.classList.contains('cell')) {
            var tr = e.target.closest('tr');
            var mod = tr.getAttribute('data-module');
            var cat = tr.getAttribute('data-category');
            var fn = tr.getAttribute('data-function');
            var now = e.target.checked ? 1 : 0;
            var base = baseKey(tr);
            var ck = changeKey(mod, cat, fn, personName);
            if (now === original[base]) delete changes[ck];
            else changes[ck] = { action: 'upsert', system: 'Thai Localization', module: mod, category: cat, function: fn, person: personName, permitted: now };
            updateBadges();
        }
        if (e.target.classList.contains('row-master')) {
            var tr = e.target.closest('tr');
            var cb = tr.querySelector('.cell');
            if (cb.checked !== e.target.checked) { cb.checked = e.target.checked; cb.dispatchEvent(new Event('change')); }
        }
    });
    function filt() {
        var m = moduleSel.value.trim().toLowerCase();
        var c = categorySel.value.trim().toLowerCase();
        var text = q.value.trim().toLowerCase();
        tbody.querySelectorAll('.data-row').forEach(function (tr) {
            var tm = tr.getAttribute('data-module').toLowerCase();
            var tc = tr.getAttribute('data-category').toLowerCase();
            var tf = tr.getAttribute('data-function').toLowerCase();
            var show = (!m || tm === m) && (!c || tc === c) && (!text || tf.indexOf(text) > -1);
            tr.style.display = show ? '' : 'none';
        });
    }
    moduleSel.addEventListener('change', filt);
    categorySel.addEventListener('change', filt);
    q.addEventListener('input', filt);
    selectAllBtn.addEventListener('click', function () {
        tbody.querySelectorAll('.data-row').forEach(function (tr) {
            if (tr.style.display === 'none') return;
            var cb = tr.querySelector('.cell');
            if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change')); }
        });
    });
    unselectAllBtn.addEventListener('click', function () {
        tbody.querySelectorAll('.data-row').forEach(function (tr) {
            if (tr.style.display === 'none') return;
            var cb = tr.querySelector('.cell');
            if (cb.checked) { cb.checked = false; cb.dispatchEvent(new Event('change')); }
        });
    });
    function save(payload, cb) {
        var headers = { 'Content-Type': 'application/json' };
        <?php if ($csrf_name && $csrf_hash): ?>
        headers['X-CSRF-TOKEN'] = '<?php    echo $csrf_hash; ?>';
        payload['<?php    echo $csrf_name; ?>'] = '<?php    echo $csrf_hash; ?>';
        <?php endif; ?>
        fetch('<?php echo $save_url; ?>', { method: 'POST', headers: headers, body: JSON.stringify(payload) }).then(function (r) { return r.json(); }).then(function (res) { cb(res); }).catch(function () { cb({}); });
    }
    function doSave() {
        if (Object.keys(changes).length === 0) return;
        var payload = { changes: Object.values(changes) };
        save(payload, function (res) {
            if (res && res.status === 'ok') {
                Object.keys(changes).forEach(function (ck) {
                    var parts = ck.split('||'); var mod = parts[0], cat = parts[1], fn = parts[2];
                    original[[mod, cat, fn].join('|')] = changes[ck].permitted;
                });
                changes = {}; updateBadges();
            } else { alert('บันทึกไม่สำเร็จ'); }
        });
    }
    saveBtn.addEventListener('click', doSave);
    saveBarBtn.addEventListener('click', doSave);
    updateBadges();
</script>