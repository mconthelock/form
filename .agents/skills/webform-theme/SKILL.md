---
name: webform-theme
description: >-
  Guidelines and reusable patterns for building and styling AMEC Webflow forms
  using the scoped .webform-theme corporate theme (create, edit, and view-only
  show pages), shared CSS in assets/style/webform.css, and DB-driven grid tables
  (.table-edit). Use when creating or updating webform Blade views, migrating
  inline styles into Tailwind/webform.css, or implementing view-only show pages.
---

# AMEC Webform Theme & View-Only Pattern

## 1. Scoped Styling (`assets/style/webform.css`)

All reusable form styles live in `assets/style/webform.css` (imported by `assets/style/tailwind.css` and compiled to `assets/dist/css/tailwind.css`).

- **Never leak styles globally**: Every rule must be scoped under `.webform-theme` so legacy forms outside the theme (e.g., `FORM-1`) are unaffected.
- **Avoid inline `@section('styles')` in Blade** when a style can be reused across forms.
- **Opt-in modifiers** (safe for existing `.webform-theme` pages like admin/report):
  - `.webform-theme.text-base`: Enables `1rem` / `2.5rem`-tall Select2 inputs without altering the default `0.75rem` Select2 size on other `.webform-theme` pages.
  - `.webform-theme .table-edit`: Spreadsheet-style bordered grid table with full-cell numeric inputs, primary focus highlight, and `.cell-text` for static text cells.
  - `.webform-theme.webform-view`: View-only modifier for `show.blade.php` — renders `.table-edit` readonly cells with `bg-gray-50`, `color: gray-800`, and `cursor: default`.

## 2. Page Layout (Create / Edit vs. View-Only Show)

Both `create.blade.php` and `show.blade.php` share the same visual layout:

```blade
@extends('layouts/webflowTemplate')

@section('contents')
    {{-- Create/Edit: <main class="webform-theme flex flex-col gap-4 pb-8 text-base"> --}}
    {{-- View-Only:   <main class="webform-theme webform-view flex flex-col gap-4 pb-8 text-base" id="form-data"> --}}
    <main class="webform-theme webform-view flex flex-col gap-4 pb-8 text-base" id="form-data">
        @include('layouts/form-header')
        @include('layouts/form-header-info')

        {{-- Numbered sections (01, 02, ...) --}}
        <section class="bg-gray-200 border border-gray-300">
            <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
                <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">01</span>
                <div>
                    <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Section Title</h2>
                    <div class="text-sm text-gray-500">คำอธิบายหัวข้อ</div>
                </div>
            </header>
            <div class="bg-white p-5 flex flex-col gap-5">
                ...
            </div>
        </section>

        @include('layouts/form-action')

        {{-- Show page only: Approval Workflow & Audit Trail --}}
        <div id="form-flow-wrap" class="hidden">
            @include('layouts/form-flow')
        </div>
    </main>
@endsection
```

### Important View-Only Rules (`show.blade.php` + `view.js`)
- **Do not duplicate hidden key inputs**: `layouts/form-header` already renders `#NFRMNO`, `#VORGNO`, `#CYEAR`, `#CYEAR2`, `#NRUNNO`, and `#EMPNO`.
- **Read-only display fields**: Replace `<input>` / `<textarea>` with styled `<div>` boxes (`bg-gray-50 border border-gray-300 px-3 py-2 min-h-10 text-base text-gray-800 map-data`). Escape text and convert `\n` to `<br>`.
- **Header & Action initialization**:
  - `await formHeader(form)`
  - `await formHeaderInfo(form)` — omit `editableReq: true` so requester and remark stay read-only.
  - `await formApprovalBtn(form, { print: true })` — view/print only.
  - If `form.flow?.length > 0`, unhide `#form-flow-wrap` and call `await formFlowApproval(form)`.
- **Table partials**: Pass `['view' => true]` to hide add-row buttons, checkboxes, and delete-action columns.

## 3. DB-Driven Grid Tables with `rowspan` / `colspan`

For compact fixed-group tables (like Benefit tables with `rowspan`/`colspan`), prefer a **DB Master endpoint + Shared JS Renderer** over DataTables (DataTables does not natively support `rowspan` in `<tbody>`):

1. Keep the Blade partial minimal (`<thead>`, `<tbody></tbody>`, `<tfoot>`).
2. Load master items from the API (e.g., `GET ${APP_API}/form/is/is-dev/benefit/all`) with a `DEFAULT_*_MASTER` fallback config if the endpoint is not yet available.
3. Render rows with one shared function (`renderBenefitTable({ readonly, values, master })`) used by Create, Edit, and Show pages.
4. Store the master primary key on `tr[data-benefit-id]` and use it when filling or serializing `FormData` (never rely on `$(row).index()`).

## 4. Build & Verification

After editing CSS, JS, or Blade views:

```bash
npm run build:css   # CSS-only changes
npm run build       # CSS + JS bundle changes
npx playwright test tests/isform/IS-DEV/form.spec.js --grep "IS-DEV Form Controller"
```
