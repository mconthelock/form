<div class="side-wrap flex flex-col w-full h-full">
    <label for="mastermenu" aria-label="close sidebar" class="drawer-overlay bg-transparent!"></label>
    <div class="banner w-full h-16 flex items-center md:justify-center pt-3">
        <a href="{{ base_url() }}" class="flex-1 ps-3">
            <img src="{{ $_ENV['APP_IMG'] }}/sidebar/brand_text_w.svg">
        </a>
        <div class="flex-none p-3 md:hidden" id="mastermenu-close">
            <i class="icofont-circled-left text-white text-2xl"></i>
        </div>
    </div>

    <div class="flex-1 w-full" id="mastermenu-list">
        <ul
            class="menu bg-primary gap-3 w-full pt-4 px-8 md:w-64 lg:w-80 min-h-full text-base-100 text-base flex-nowrap">
            <li class="nav-home">
                <a href="{{ base_url() }}">
                    <img src="{{ $_ENV['APP_IMG'] }}/sidebar/home.svg" alt="" class="text-white filter invert">
                    <span class="font-semibold">Home</span>
                </a>
            </li>
            <li class="nav-star">
                <a href="{{ base_url() }}webform/form/index/1/">
                    <img src="{{ $_ENV['APP_IMG'] }}/sidebar/star.svg" alt="" class="text-white filter invert">
                    <span class="font-semibold">Wait for approval</span>
                    <div class="badge badge-sm badge-secondary">+99</div>
                </a>
            </li>
            <li class="mainmenu nav-form">
                <details>
                    <summary class="font-semibold text-base !bg-none active:bg-none active:!bg-transparent">
                        <img src="{{ $_ENV['APP_IMG'] }}/sidebar/layer.svg" class="text-white filter invert">
                        <span>Electronic Form</span>
                    </summary>
                    <ul class="text-sm list-disc">
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/form/create/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/create.svg" class="text-white filter invert">
                                <span>Create</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/form/index/1/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/waiting.svg" class="text-white filter invert">
                                <span>Wait for approve</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/form/index/0/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/draft.svg" class="text-white filter invert">
                                <span>Under Preparation</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/form/index/2/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/comming.svg" class="text-white filter invert">
                                <span>Comming Soon</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/form/index/3/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/mine.svg" class="text-white filter invert">
                                <span>Mine</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/form/index/4/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/approved.svg"
                                    class="text-white filter invert">
                                <span>Approved/Rejected</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/form/index/5/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/represent.svg"
                                    class="text-white filter invert">
                                <span>Representative</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/form/index/6/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/finish.svg" class="text-white filter invert">
                                <span>Finish</span>
                            </a>
                        </li>
                    </ul>
                </details>
            </li>
            <li class="nav-home">
                <a href="{{ base_url() }}webform/report/">
                    <img src="{{ $_ENV['APP_IMG'] }}/sidebar/report.svg" alt=""
                        class="text-white filter invert">
                    <span class="font-semibold">Report</span>
                </a>
            </li>

            <li class="mainmenu nav-admin">
                <details>
                    <summary class="font-semibold text-base !bg-none active:bg-none active:!bg-transparent">
                        <img src="{{ $_ENV['APP_IMG'] }}/sidebar/admin.svg" class="text-white filter invert">
                        <span>Data Manager</span>
                    </summary>
                    <ul class="text-sm list-disc">
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/formmst/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/formmst.svg" class="text-white filter invert">
                                <span>Form Master</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}webform/organize">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/organize.svg"
                                    class="text-white filter invert">
                                <span>Organize</span>
                            </a>
                        </li>
                        <li class="py-1">
                            <a href="{{ base_url() }}licence/documents/">
                                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/id-card.svg" class="text-white filter invert">
                                <span>Licence Control</span>
                            </a>
                        </li>
                    </ul>
                </details>
            </li>
        </ul>
    </div>

    <ul class="px-6 py-8 mb-5 mx-3 flex-none flex flex-col gap-3 border-y  border-white">
        <li class="nav-doc">
            <a href="{{ base_url() }}docs" target="_blank" class="flex gap-3">
                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/help.svg" alt="" class="text-white filter invert">
                <span class="text-white">Manual</span>
            </a>
        </li>
        <li class="nav-setting">
            <a href="{{ base_url() }}setting" class="flex gap-3">
                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/setting.svg" alt=""
                    class="text-white filter invert">
                <span class="text-white">Settings</span>
            </a>
        </li>
    </ul>

    <ul class="px-4 pb-4 flex-none">
        <li class="">
            <div class="flex gap-3">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                    <div class="w-10 rounded-full">
                        <img alt="" id="login-profile" src="{{ base_url() }}/assets/images/Avatar.png" />
                    </div>
                </div>
                <div class="block">
                    <div class="text-md font-bold text-white" id="login-name">
                        <div class="skeleton h-8 w-40"></div>
                    </div>
                    <div class="text-xs text-gray-300" id="login-section">
                        <div class="skeleton h-4 w-20 mt-3"></div>
                    </div>
                    <input type="hidden" id="login-id">
                </div>
                <div class="ms-auto flex">
                    <a tabindex="1" role="button" class="btn btn-ghost btn-circle" href="#"
                        id="signout">
                        <i class="icofont-logout text-2xl text-white"></i>
                    </a>
                </div>
            </div>
        </li>
    </ul>
</div>
