<div class="drawer drawer-end">
    <input id="drawer-master" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
    </div>
    <div class="drawer-side z-[100]">    
        <label for="drawer-master" aria-label="sidebar" class="drawer-overlay"></label>
        <div class="min-h-full w-full px-5 pt-5 md:w-96 bg-base-100 text-base-content">
            <h2 class="mb-4 text-2xl font-bold text-blue-500" id="headeritem">Add Drawing</h2>
            <form id="drawing-form" method="post" enctype="multipart/form-data">
                <div class="mb-4 flex flex-col gap-3">
                    <input type="text" name="MID" data-map="MID" id="MID" value="" class="hidden"/>
                    <input type="text" name="FYEAR" id="FYEAR" value="{{$year}}" class="hidden"/>
                   
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">*Item No.</span>
                        </div>
                        <input type="text" placeholder="e.g. 651" id="ITMNO" name="ITMNO" data-map="ITMNO" class="input input-bordered border-blue-200 w-full max-w-sm req">
                    </label>
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">Drawing</span>
                        </div>
                        <input type="text" placeholder="e.g. YA175D037 -01, YA175D037 -02" id="DWGNO" name="DWGNO" data-map="DWGNO" class="input input-bordered border-blue-200  w-full max-w-sm">
                    </label>
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">Pur. Spec.</span>
                        </div>
                        <input class="input input-bordered border-blue-200  w-full max-w-sm" id="SPEC" name="SPEC" data-map="SPEC" placeholder="e.g. Spot welding">
                    </label>
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">*Part Name</span>
                        </div>
                        <input class="input input-bordered border-blue-200  w-full max-w-sm req" id="PARTNAME" name="PARTNAME" data-map="PARTNAME" placeholder="e.g. SPCC 1.2t + SPCC 1.6t (Floor Plate)">
                    </label>
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">*Supplier or Subcontrector name</span>
                        </div>
                        <input class="input input-bordered border-blue-200  w-full max-w-sm req" id="SUBCONNAME" name="SUBCONNAME" data-map="SUBCONNAME" placeholder="e.g. JSV Spring">
                    </label>
                    <!--
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">Path Dwg.</span>
                        </div>
                        <input class="input input-bordered border-blue-200  w-full max-w-sm" id="PATHDWG" name="PATHDWG" data-map="PATHDWG" placeholder="e.g.">
                    </label> -->

                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">Path Spec.</span>
                        </div>
                        <input class="input input-bordered border-blue-200  w-full max-w-sm" id="PATHSPEC" name="PATHSPEC" data-map="PATHSPEC" placeholder="e.g. O:\DED_Div\CONFIDENTIAL\Centralized_Manual\Design_Purchasing_Specification\INASAYO\1_Translated\INASAYO-76-45-0104">
                    </label>
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">Attach Dwg File</span>
                        </div>
                        <input type="file" class="file-input file-input-bordered border-blue-200   w-full " accept="*" name="DWGFILE[]" id="DWGFILE" data-map="DWGFILE" multiple />
                    </label>
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">Attach Spec File</span>
                        </div>
                        <input type="file" class="file-input file-input-bordered border-blue-200   w-full " accept="*" name="SPECFILE[]" id="SPECFILE" data-map="SPECFILE" multiple />
                    </label>
                    <div data-map="ATTFILE" class="file-list"></div>
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">Remark</span>
                        </div>
                        <textarea name="REMARK" id="REMARK" class="border-2 textarea  textarea-bordered border-blue-200  rounded-lg h-10 w-full" data-map="REMARK" placeholder=""></textarea>
      
                    </label>
                    <label class="form-control w-full max-w-sm">
                        <div class="label">
                            <span class="block tracking-wide text-primary text-md font-bold mb-2">Schedule</span>
                        </div>
                    </label>
                    <label class="form-control w-full max-w-sm">
                         <input type="checkbox"  class="w-5 h-5 rounded-sm checkbox checkbox-primary" name="chkall" id="chkall"/>
                         <span> All</span>
                    </label>
                    <div class="grid grid-cols-4 gap-4">
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="04" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch4" data-map="SCH"/>
                            <span>Apr</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="05" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch5" data-map="SCH" />
                            <span>May</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="06" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch6" data-map="SCH"/>
                            <span>Jun</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="07" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch7" data-map="SCH"/>
                            <span>Jul</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="08" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch8" data-map="SCH" />
                            <span>Aug</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="09" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch9" data-map="SCH" />
                            <span>Sep</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="10" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch10" data-map="SCH" />
                            <span>Oct</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="11" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch11" data-map="SCH" />
                            <span>Nov</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="12" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch12" data-map="SCH" />
                            <span>Dec</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="01" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req"  name="sch[]" id="sch1" data-map="SCH" />
                            <span>Jan</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="02" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req" name="sch[]" id="sch2" data-map="SCH"/>
                            <span>Feb</span>
                        </label>

                        <label class="flex items-center space-x-2">
                            <input type="checkbox" value="03" class="w-5 h-5 rounded-sm checkbox checkbox-primary sch req"  name="sch[]" id="sch3" data-map="SCH" />
                            <span>Mar</span>
                        </label>

                        </div>
                    <div class="btn btn-primary" type="button" id="save-dwg">
                        <span class="loading loading-spinner hidden"></span>
                        <span class="btn-text">Save</span>
                    </div>
                    <label class="btn btn-error text-white" id="cancle">Cancel</label>
                </div>
            </form>
        </div>
    </div>
</div>