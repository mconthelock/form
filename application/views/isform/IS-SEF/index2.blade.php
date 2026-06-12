@extends('layouts/webflowTemplate')
@section('contents')
    <div style="background:#f1f5f9; min-height:100vh; padding:1.5rem 0;">
        <div style=" margin:0 auto; padding:0 1rem;">

            <div style="background:white; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,0.08); overflow:hidden; margin-bottom:1rem;">
                <div style="background:linear-gradient(90deg,#1e3a5f,#2563eb); padding:1.25rem 1.5rem; text-align:center;">
                    <h1 style="color:white; font-size:1.3rem; font-weight:700; margin:0 0 0.25rem;">แบบประเมินความพึงพอใจในการพัฒนาโปรแกรม</h1>
                    <p style="color:#bfdbfe; font-size:0.9rem; margin:0; font-style:italic;">Satisfaction Evaluation Form</p>
                </div>
                <div style="padding:1rem 1.5rem; background:#eff6ff; border-bottom:1px solid #dbeafe;">
                    <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
                        <label style="font-weight:600; color:#1e3a5f; font-size:0.9rem; white-space:nowrap;">ชื่อโปรเจกต์ (Project):</label>
                        {{-- <input id="projectName" type="text" placeholder="กรุณาระบุชื่อโปรเจกต์..." style="flex:1; min-width:200px; padding:0.5rem 0.75rem; border:1px solid #93c5fd; border-radius:8px; font-size:0.9rem; outline:none; background:white;" /> --}}
                        <label id="projectName" style="flex:1; min-width:200px; padding:0.5rem 0.75rem; border:1px solid #93c5fd; border-radius:8px; font-size:0.9rem; outline:none; background:white;">Satisfaction Evaluation Form</label>
                    </div>
                </div>
                <div class="bg-amber-50" style="padding:0.75rem 1.5rem; background:#fefce8; border-bottom:1px solid #fef08a;">
                    <p style="margin:0; font-size:0.82rem; color:#713f12;">
                        <strong>เกณฑ์การให้คะแนน:</strong>&nbsp;
                        <span class="bg-green-600 text-white py-0.5 px-2 rounded-md text-sm">5 = มากที่สุด (Excellent)</span>&nbsp;
                        <span class="bg-lime-600 text-white py-0.5 px-2 rounded-md text-sm">4 = มาก (Good)</span>&nbsp;
                        <span class="bg-yellow-600 text-white py-0.5 px-2 rounded-md text-sm">3 = ปานกลาง (Fair)</span>&nbsp;
                        <span class="bg-orange-600 text-white py-0.5 px-2 rounded-md text-sm">2 = น้อย (Poor)</span>&nbsp;
                        <span class="bg-red-600 text-white py-0.5 px-2 rounded-md text-sm">1 = น้อยที่สุด (Very Poor)</span>
                    </p>
                </div>
            </div>

            <div style="background:white; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,0.08); overflow:hidden; margin-bottom:1rem;">
                <div style="background:linear-gradient(90deg,#1e3a5f,#2563eb); padding:0.75rem 1.25rem;">
                    <h2 style="color:white; font-size:1rem; font-weight:700; margin:0;">1. Programmer — ทีมพัฒนา</h2>
                </div>
                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
                                <th style="padding:0.6rem 0.75rem; text-align:center; color:#64748b; width:36px;">#</th>
                                <th style="padding:0.6rem 0.75rem; text-align:left; color:#1e3a5f; width:300px;">หัวข้อการประเมิน</th>
                                <th style="padding:0.6rem 0.75rem; text-align:left; color:#1e3a5f; width:300px;">Thai</th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#16a34a; width:44px; font-size:0.8rem;">5<br /><span style="font-weight:400;font-size:0.72rem;">มากที่สุด</span></th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#65a30d; width:44px; font-size:0.8rem;">4<br /><span style="font-weight:400;font-size:0.72rem;">มาก</span></th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#ca8a04; width:44px; font-size:0.8rem;">3<br /><span style="font-weight:400;font-size:0.72rem;">ปานกลาง</span></th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#ea580c; width:44px; font-size:0.8rem;">2<br /><span style="font-weight:400;font-size:0.72rem;">น้อย</span></th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#dc2626; width:44px; font-size:0.8rem;">1<br /><span style="font-weight:400;font-size:0.72rem;">น้อยที่สุด</span></th>
                                <th style="padding:0.6rem 0.75rem; text-align:center; color:#1e3a5f; width:56px;">คะแนน</th>
                            </tr>
                        </thead>
                        <tbody id="progBody"></tbody>
                    </table>
                </div>
                <div style="padding:0.6rem 1.25rem; background:#f0f9ff; border-top:2px solid #bae6fd; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:700; color:#1e3a5f; font-size:0.9rem;">คะแนนเฉลี่ยหมวด Programmer</span>
                    <span id="progAvg" style="background:#1e3a5f; color:white; padding:0.3rem 1rem; border-radius:8px; font-weight:700; font-size:1rem; min-width:56px; text-align:center;">—</span>
                </div>
            </div>

            <div style="background:white; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,0.08); overflow:hidden; margin-bottom:1rem;">
                <div style="background:linear-gradient(90deg,#1e3a5f,#2563eb); padding:0.75rem 1.25rem;">
                    <h2 style="color:white; font-size:1rem; font-weight:700; margin:0;">2. Application — ระบบงาน</h2>
                </div>
                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
                                <th style="padding:0.6rem 0.75rem; text-align:center; color:#64748b; width:36px;">#</th>
                                <th style="padding:0.6rem 0.75rem; text-align:left; color:#1e3a5f; width:300px;">หัวข้อการประเมิน</th>
                                <th style="padding:0.6rem 0.75rem; text-align:left; color:#1e3a5f; width:300px;">Thai</th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#16a34a; width:44px; font-size:0.8rem;">5<br /><span style="font-weight:400;font-size:0.72rem;">มากที่สุด</span></th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#65a30d; width:44px; font-size:0.8rem;">4<br /><span style="font-weight:400;font-size:0.72rem;">มาก</span></th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#ca8a04; width:44px; font-size:0.8rem;">3<br /><span style="font-weight:400;font-size:0.72rem;">ปานกลาง</span></th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#ea580c; width:44px; font-size:0.8rem;">2<br /><span style="font-weight:400;font-size:0.72rem;">น้อย</span></th>
                                <th style="padding:0.6rem 0.5rem; text-align:center; color:#dc2626; width:44px; font-size:0.8rem;">1<br /><span style="font-weight:400;font-size:0.72rem;">น้อยที่สุด</span></th>
                                <th style="padding:0.6rem 0.75rem; text-align:center; color:#1e3a5f; width:56px;">คะแนน</th>
                            </tr>
                        </thead>
                        <tbody id="appBody"></tbody>
                    </table>
                </div>
                <div style="padding:0.6rem 1.25rem; background:#f0f9ff; border-top:2px solid #bae6fd; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:700; color:#1e3a5f; font-size:0.9rem;">คะแนนเฉลี่ยหมวด Application</span>
                    <span id="appAvg" style="background:#1e3a5f; color:white; padding:0.3rem 1rem; border-radius:8px; font-weight:700; font-size:1rem; min-width:56px; text-align:center;">—</span>
                </div>
            </div>

            <div style="background:white; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,0.08); overflow:hidden; margin-bottom:1rem;">
                <div style="padding:1rem 1.5rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; border-bottom:1px solid #e2e8f0;">
                    <div>
                        <p style="margin:0; font-size:0.82rem; color:#64748b;">คะแนนเฉลี่ยรวมทั้งหมด (Overall Average)</p>
                        <div style="display:flex; align-items:baseline; gap:0.5rem; margin-top:0.25rem;">
                            <span id="overallAvg" style="font-size:2rem; font-weight:700; color:#1e3a5f;">—</span>
                            <span style="color:#64748b; font-size:0.85rem;">/ 5.00</span>
                        </div>
                    </div>
                    <div id="levelBadge" style="text-align:center; padding:0.75rem 1.5rem; border-radius:10px; background:#f1f5f9; border:1px solid #e2e8f0;">
                        <p style="margin:0; font-size:0.75rem; color:#64748b;">ระดับความพึงพอใจ</p>
                        <p id="levelText" style="margin:0.25rem 0 0; font-size:1.1rem; font-weight:700; color:#64748b;">—</p>
                    </div>
                </div>
                <div style="padding:1rem 1.5rem;">
                    <label style="font-weight:600; color:#1e3a5f; font-size:0.9rem; display:block; margin-bottom:0.5rem;">ข้อเสนอแนะ / ความคิดเห็นเพิ่มเติม (Comments &amp; Suggestions)</label>
                    <textarea id="comments" rows="3" placeholder="กรุณาระบุข้อเสนอแนะหรือความคิดเห็นเพิ่มเติม..." style="width:100%; padding:0.6rem 0.75rem; border:1px solid #cbd5e1; border-radius:8px; font-size:0.88rem; resize:vertical; outline:none; box-sizing:border-box; font-family:inherit;"></textarea>
                </div>
                <div style="padding:0.75rem 1.5rem 1.25rem; display:flex; gap:0.75rem; justify-content:flex-end; flex-wrap:wrap;">
                    <button id="resetBtn" style="padding:0.55rem 1.25rem; border:1px solid #e2e8f0; border-radius:8px; background:white; color:#64748b; font-size:0.88rem; cursor:pointer; font-family:inherit;">รีเซ็ตแบบฟอร์ม</button>
                    <button id="submitBtn" style="padding:0.55rem 1.5rem; border:none; border-radius:8px; background:#2563eb; color:white; font-size:0.88rem; font-weight:600; cursor:pointer; font-family:inherit;">บันทึกการประเมิน ✓</button>
                </div>
            </div>

        </div>
    </div>
    <script src="{{ $_ENV['APP_JS'] }}/isSef.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
