<div class="bg-base-200 p-7 rounded-md shadow-md">
    <form action="#" class="flex flex-col gap-5">
        <h1 class="text-lg font-bold ">Employee Search</h1>
        <label class="input input-bordered input-sm flex items-center gap-2">
            <span class="font-bold">Tel.No.</span>
            <input type="text" class="grow" placeholder="" />
        </label>

        <label class="input input-bordered input-sm flex items-center gap-2">
            <span class="font-bold">Emp.No.</span>
            <input type="text" class="grow" placeholder="" />
        </label>

        <label class="input input-bordered input-sm flex items-center gap-2">
            <span class="font-bold">Name.</span>
            <input type="text" class="grow" placeholder="" />
        </label>

        <label class="input input-bordered input-sm flex items-center gap-2">
            <span class="font-bold">Th Name.</span>
            <input type="text" class="grow" placeholder="" />
        </label>

        <label class="input input-bordered input-sm flex items-center gap-2">
            <span class="font-bold">Email</span>
            <input type="text" class="grow" placeholder="" />
        </label>

        <select class="select select-bordered select-sm w-full max-w-xs" id="position">
            <option disabled selected class="font-bold">Position</option>
        </select>

        <select class="select select-bordered select-sm w-full max-w-xs" id="division">
            <option disabled selected class="font-bold">Division</option>
        </select>

        <select class="select select-bordered select-sm w-full max-w-xs" id="department">
            <option disabled selected class="font-bold">Department</option>
        </select>

        <select class="select select-bordered select-sm w-full max-w-xs" id="section">
            <option disabled selected class="font-bold">Section</option>
        </select>

        <button class="btn btn-secondary" type="reset">Reset</button>

        <div class="divider">OR</div>

        <a class="btn btn-secondary">Company Telephone</a>
        <a class="btn btn-outline btn-secondary">Outsource</a>
        <a class="btn btn-outline btn-secondary">Other</a>
    </form>
</div>
