<div {{-- class="navbar bg-base-100 shadow-xs z-10 fixed top-0 left-0 w-full lg:static lg:shadow-none lg:bg-transparent lg:backdrop-blur-sm"> --}} class="navbar bg-base-100 shadow-xs z-10 fixed top-0 left-0 w-full lg:hidden">
    <div class="flex-1 flex">
        <label class="btn btn-circle swap swap-rotate lg:hidden" id="mastermenu-toggle" for="mastermenu">
            <!-- this hidden checkbox controls the state -->
            <input type="checkbox" id="mastermenu-icon" />
            <!-- hamburger icon -->
            <svg class="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                viewBox="0 0 512 512">
                <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
            </svg>

            <!-- close icon -->
            <svg class="swap-on fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                viewBox="0 0 512 512">
                <polygon
                    points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
            </svg>
        </label>
        <h1 class="lg:hidden" id="brand">
            <a href="{{ base_url() }}">
                <img src="{{ $_ENV['APP_IMG'] }}/sidebar/brand_text_b.svg">
            </a>
        </h1>
    </div>

    {{-- Logged in --}}
    @isset($_SESSION['user'])
        <div class="flex-none">
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                    <div class="indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span class="badge badge-sm indicator-item">8</span>
                    </div>
                </div>
                <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow-sm">
                    <div class="card-body">
                        <span class="text-lg font-bold">8 Items</span>
                        <span class="text-info">Subtotal: $999</span>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-block">View cart</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                    <div class="w-10 rounded-full">
                        <img alt="{{ $_SESSION['user']->SNAME }}" src="{{ $_SESSION['profile-img'] }}" />
                    </div>
                </div>
                <ul tabindex="0"
                    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow-sm">
                    <li>
                        <a class="justify-between">
                            Profile
                            <span class="badge">New</span>
                        </a>
                    </li>
                    <li>
                        <a tabindex="1" role="button" class="" href="{{ base_url() }}docs"
                            target="_blank">Manual</a>
                    </li>
                    <li><a>Settings</a></li>
                    <li><a href="{{ base_url() }}authen/logout">Logout</a></li>
                </ul>
            </div>
        </div>
        <input type="hidden" name="loginuser" id="loginuser" value="{{ $_SESSION['user']->SEMPNO }}">
    @endisset
</div>
