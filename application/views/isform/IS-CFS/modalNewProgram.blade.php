<input type="checkbox" id="newProgram" class="modal-toggle" />


<div class="modal" role="dialog" id="newprogram_module">
    <div class="modal-box">
        <h3 class="text-lg font-bold">New Program List</h3>

        <fieldset class="fieldset w-full">  
            <label class="fieldset-label">Owner</label>
            {{-- <input type="text" class="input w-full req" name="program_owner" id="program_owner" placeholder="e.g. PUR" required /> --}}
            <select class="select validator req w-full" name="program_owner" id="program_owner" placeholder="Select owner">
                <option value=''></option>
                @foreach ($division as $d)
                    <option value='{{$d->DIVCODE}}' data-name='{{$d->DIVNAME}}'>{{$d->DIVCODE}}</option>
                @endforeach
            </select>
        </fieldset>

        <fieldset class="fieldset w-full">  
            <label class="fieldset-label">Program Type</label>
            {{-- <input type="text" class="input w-full req" name="program_type" id="program_type" placeholder="e.g. P" required /> --}}
            <select class="select validator req w-full" name="program_type" id="program_type" placeholder="Select Program Type">
                <option value=''></option>
                @foreach ($programType as $t)
                    <option value='{{$t->PROTCODE}}' data-name='{{$t->PROTDESC}}'>{{$t->PROTCODE}} : {{$t->PROTDESC}}</option>
                @endforeach
            </select>
        </fieldset>

        <fieldset class="fieldset w-full">  
            {{-- <label class="fieldset-label">Program type</label> --}}
            <div class="join">
                <input class="join-item btn" type="radio" name="programType" value="1" aria-label="New program"/>
                <input class="join-item btn" type="radio" name="programType" value="2" aria-label="Old program"/>
            </div>
        </fieldset>

        <fieldset class="fieldset w-full">  
            <label class="fieldset-label">Program Name</label>
            {{-- <input type="text" class="input w-full req" name="program_name" id="program_name" placeholder="e.g. SCM" required /> --}}
            <select class="select validator req w-full" name="program_name" id="program_name" placeholder="Select Program Name">
                <option value=''></option>
            </select>
            {{-- <input type="hidden" name="program_id" id="program_id" value=""> --}}
        </fieldset>

        {{-- <fieldset class="fieldset w-full">  
            <label class="fieldset-label">Module type</label>
            <div class="join">
                <input class="join-item btn" type="radio" name="moduleType" value="1" aria-label="New module"/>
                <input class="join-item btn" type="radio" name="moduleType" value="2" aria-label="Old module"/>
            </div>
        </fieldset> --}}

        <fieldset class="fieldset w-full">  
            <label class="fieldset-label">Program Module</label>
            <input type="text" class="input w-full req" name="program_module" id="program_module" placeholder="e.g. Purchase order for Buyer" required />
            {{-- <select class="select validator req w-full" name="program_module" id="program_module" placeholder="Select Program Module">
                <option value=''></option>
            </select> --}}
        </fieldset>

        <fieldset class="fieldset w-full">  
            <label class="fieldset-label">Releaser</label>
            <select class="select validator req w-full" name="select-developer" id="select-developer" placeholder="Select Releaser">
                <option value=''></option>
            </select>
            {{-- <input type="text" class="input w-full req" name="select-developer" id="select-developer" placeholder="e.g. 12069" required /> --}}
        </fieldset>

        <div class="modal-action">
            <form method="dialog">
                <button class="btn btn-primary savedata" id="savenewprogram">
                    <span class="loading loading-spinner hidden"></span>
                    <span>Create Program</span>
                </button>
                <label for="newProgram" class="btn">Close!</label>
            </form>
        </div>
    </div>
</div>
