<div class="loginform" id="frm-password">
    <form action="#" method="POST" class="mt-4" autocomplete="off" id="passwordLogin">
        <div class="form-control">
            <label class="label">
                <span class="label-text font-bold">Username</span>
            </label>
            <input type="text" name="username" placeholder="Username" class="input input-bordered username text-sm"
                autocomplete="new-password" required>
        </div>
        <div class="form-control mt-4">
            <label class="label">
                <span class="label-text font-bold">Password</span>
            </label>
            <label class="input input-bordered flex items-center gap-2">
                <input type="password" class="grow password" autocomplete="new-password" required
                    placeholder="Password" />
                <a href="#" id="show-password" class="text-primary h-6 w-6 flex items-center show-password">
                    <span class="eye-close">
                        <i class="fi fi-rs-crossed-eye text-2xl text-gray-600"></i>
                    </span>
                    <span class="eye-open hidden">
                        <i class="fi fi-sr-eye text-2xl text-gray-600"></i>
                    </span>

                    <i class="fi fi-sr-eye eye-open text-2xl text-gray-600 hidden!"></i>
                </a>
            </label>
        </div>
        <div class="mt-4">
            <button type="submit" class="btn btn-primary text-white w-full">
                <span class="loading loading-spinner hidden"></span>
                <span>Sign in</span>
            </button>
        </div>
    </form>
</div>
