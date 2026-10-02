{{-- filepath: d:\Docker_mark\src\form\application\views\gpform\GP-TPH\addarea.blade.php --}}
@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        /* Hallmark · macrostructure: Workbench · genre: modern-minimal · tone: official · anchor hue: navy-blue
         * states: default · hover · focus · active · disabled · loading · error · success
         * contrast: pass (40–41) · pre-emit critique: P5 H5 E5 S5 R5 V5
         */
        :root {
            --gp-tph-dialog-paper: var(--photo-surface);
            --gp-tph-dialog-ink: var(--photo-ink);
            --gp-tph-dialog-muted: var(--photo-ink-soft);
            --gp-tph-dialog-rule: var(--photo-rule);
            --gp-tph-dialog-danger: var(--photo-danger);
            --gp-tph-dialog-danger-ink: var(--photo-accent-ink);
            --gp-tph-dialog-focus: var(--photo-focus);
            --gp-tph-dialog-backdrop: var(--photo-backdrop);
            --gp-tph-dialog-shadow: var(--photo-shadow);
            --gp-tph-space-xs: 0.5rem;
            --gp-tph-space-sm: 0.75rem;
            --gp-tph-space-md: 1rem;
            --gp-tph-space-lg: 1.5rem;
            --gp-tph-space-xl: 2.5rem;
            --gp-tph-dialog-radius: 0.5rem;
            --gp-tph-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
            --gp-tph-dur-short: 220ms;
            --gp-tph-dur-long: 300ms;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background: #e6e7ea;
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
        }

        .page-wrapper {
            min-height: 100vh;
            border-top: 2px solid #222;
            padding: 22px 19px;
        }

        .page-title {
            margin: 0 0 11px 13px;
            color: #0754b8;
            font-size: 36px;
            font-weight: 700;
        }

        .page-subtitle {
            display: block;
            margin-top: 3px;
            font-size: 26px;
            color: #0754b8;
        }

        .content-card {
            width: 100%;
            min-height: 344px;
            padding: 31px 32px;
            background: #fff;
            border-radius: 4px;
        }

        .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .area-form {
            display: none;
            margin-bottom: 20px;
            padding: 20px;
            border: 1px solid #c6d2e1;
            border-radius: 8px;
            background: #f8fafc;
        }

        .area-form.is-visible {
            display: block;
        }

        .area-form-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
        }

        .area-form label {
            display: block;
            margin-bottom: 5px;
            color: #4a596d;
            font-size: 13px;
            font-weight: 600;
        }

        .area-form input,
        .area-form select {
            width: 100%;
            height: 34px;
            padding: 0 10px;
            border: 1px solid #c8c8c8;
            border-radius: 3px;
            outline: none;
            font-size: 15px;
        }

        .area-form input:focus {
            border-color: #0754b8;
        }

        .area-form .select2-container {
            width: 100% !important;
        }

        .area-form .select2-container .select2-selection--single {
            height: 34px;
            padding: 0 10px;
            border: 1px solid #c8c8c8;
            border-radius: 3px;
            font-size: 15px;
        }

        .area-form .select2-container .select2-selection__rendered {
            padding: 0;
            line-height: 32px;
        }

        .area-form .select2-container .select2-selection__arrow {
            height: 32px;
        }

        .area-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
        }

        .area-form-actions button {
            min-width: 80px;
            height: 33px;
            padding: 0 14px;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
        }

        .search-input {
            width: 185px;
            height: 32px;
            padding: 0 12px;
            border: 1px solid #c8c8c8;
            border-radius: 3px;
            outline: none;
            font-size: 13px;
        }

        .search-input:focus {
            border-color: #0754b8;
        }

        .add-button {
            min-width: 98px;
            height: 45px;
            padding: 0 14px;
            border: 0;
            border-radius: 9px;
            background: #0754b8;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .add-button:hover {
            background: #06449a;
        }

        .table-wrapper {
            overflow-x: auto;
        }

        .area-table {
            width: 100%;
            border: 1px solid #c6d2e1;
            border-radius: 8px;
            border-spacing: 0;
            border-collapse: separate;
            overflow: hidden;
            font-size: 15px;
        }

        .area-table th {
            height: 37px;
            padding: 0 10px;
            background: #fff;
            color: #4a596d;
            text-align: left;
            font-weight: 600;
            white-space: nowrap;
            border-bottom: 1px solid #c6d2e1;
        }

        .area-table td {
            height: 49px;
            padding: 0 10px;
            border-bottom: 1px solid #c6d2e1;
            white-space: nowrap;
        }

        .area-table th:not(:last-child),
        .area-table td:not(:last-child) {
            border-right: 1px solid #c6d2e1;
        }

        .area-table tbody tr:last-child td {
            border-bottom: 0;
        }

        .area-table tbody tr:nth-child(even) {
            background: #e9e9e9;
        }

        .area-table th:nth-child(1),
        .area-table td:nth-child(1) {
            width: 8%;
        }

        .area-table th:nth-child(2),
        .area-table td:nth-child(2) {
            width: 23%;
        }

        .area-table th:nth-child(3),
        .area-table td:nth-child(3) {
            width: 22%;
        }

        .area-table th:nth-child(4),
        .area-table td:nth-child(4) {
            width: 12%;
        }

        .area-table th:nth-child(5),
        .area-table td:nth-child(5) {
            width: 25%;
        }

        .area-table th:last-child,
        .area-table td:last-child {
            width: 120px;
            text-align: center;
        }

        .sort-icon {
            float: right;
            color: #e5e5e5;
            font-size: 13px;
            line-height: 12px;
        }

        .action-link {
            display: inline-flex;
            width: 27px;
            height: 30px;
            align-items: center;
            justify-content: center;
            margin: 0 3px;
            text-decoration: none;
            cursor: pointer;

        }

        .table-action-button {
            width: 36px;
            height: 36px;
            border: 2px solid #e5e5e5;
            border-radius: 4px;
            background: #fff;
            font: inherit;
        }

        .edit-icon {
            color: #facc15;
            font-size: 21px;
            border-block: black;
        }

        .delete-icon {
            color: #d30b17;
            font-size: 21px;
            border-block: black;
        }

        .empty-row {
            height: 80px !important;
            text-align: center;
            color: #777;
        }

        .table-summary {
            margin-top: 25px;
            text-align: right;
            font-size: 14px;
        }

        .search-input {
            width: 300px;
            height: 42px;
            padding: 0 14px;
            font-size: 16px;
        }

        .search-input:focus {
            border-color: #0754b8;
        }

        .search-input {
            width: 20%;
        }

        .area-delete-dialog {
            width: min(calc(100% - 2rem), 30rem);
            margin: auto;
            padding: 0;
            border: 1px solid var(--gp-tph-dialog-rule);
            border-radius: var(--gp-tph-dialog-radius);
            background: var(--gp-tph-dialog-paper);
            color: var(--gp-tph-dialog-ink);
            box-shadow: 0 1.25rem 3.5rem var(--gp-tph-dialog-shadow);
        }

        .area-delete-dialog::backdrop {
            background: var(--gp-tph-dialog-backdrop);
            animation: area-delete-backdrop-in var(--gp-tph-dur-long) var(--gp-tph-ease-out);
        }

        .area-delete-dialog[open] {
            animation: area-delete-dialog-in var(--gp-tph-dur-long) var(--gp-tph-ease-out);
        }

        .area-delete-dialog__content {
            padding: var(--gp-tph-space-xl);
        }

        .area-delete-dialog__mark {
            display: grid;
            width: 3rem;
            height: 3rem;
            place-items: center;
            margin-bottom: var(--gp-tph-space-lg);
            border: 1px solid var(--gp-tph-dialog-danger);
            border-radius: 50%;
            color: var(--gp-tph-dialog-danger);
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1;
        }

        .area-delete-dialog__title {
            margin: 0;
            color: var(--gp-tph-dialog-ink);
            font-family: 'Kanit', sans-serif;
            font-size: 1.5rem;
            font-style: normal;
            font-weight: 700;
            line-height: 1.2;
        }

        .area-delete-dialog__text {
            max-width: 38ch;
            margin: var(--gp-tph-space-sm) 0 0;
            color: var(--gp-tph-dialog-muted);
            font-family: 'Kanit', sans-serif;
            font-size: 1rem;
            line-height: 1.6;
        }

        .area-delete-dialog__actions {
            display: flex;
            flex-wrap: wrap-reverse;
            align-items: center;
            justify-content: flex-end;
            gap: var(--gp-tph-space-sm);
            margin-top: var(--gp-tph-space-xl);
        }

        .area-delete-dialog__button {
            min-width: 7rem;
            min-height: 2.75rem;
            padding: 0 var(--gp-tph-space-md);
            border: 1px solid var(--gp-tph-dialog-rule);
            border-radius: 0.375rem;
            background: var(--gp-tph-dialog-paper);
            color: var(--gp-tph-dialog-ink);
            cursor: pointer;
            font-family: 'Kanit', sans-serif;
            font-size: 1rem;
            font-weight: 600;
            line-height: 1;
            white-space: nowrap;
            transition: background-color var(--gp-tph-dur-short) var(--gp-tph-ease-out), transform 120ms var(--gp-tph-ease-out);
        }

        .area-delete-dialog__button--danger {
            border-color: var(--gp-tph-dialog-danger);
            background: var(--gp-tph-dialog-danger);
            color: var(--gp-tph-dialog-danger-ink);
        }

        @media (hover: hover) and (pointer: fine) {
            .area-delete-dialog__button:hover {
                background: var(--gp-tph-dialog-rule);
            }

            .area-delete-dialog__button--danger:hover {
                background: var(--gp-tph-dialog-ink);
                color: var(--gp-tph-dialog-danger-ink);
            }
        }

        .area-delete-dialog__button:focus-visible {
            outline: 3px solid var(--gp-tph-dialog-focus);
            outline-offset: 3px;
        }

        .area-delete-dialog__button:active {
            transform: translateY(1px);
        }

        .area-delete-dialog__button:disabled {
            cursor: not-allowed;
            opacity: 0.55;
        }

        .area-delete-dialog[data-state='loading'] .area-delete-dialog__button--danger::after {
            content: 'กำลังลบ';
        }

        .area-delete-dialog[data-state='error'] .area-delete-dialog__mark,
        .area-delete-dialog[data-state='error'] .area-delete-dialog__title {
            color: var(--gp-tph-dialog-danger);
        }

        .area-delete-dialog[data-state='success'] .area-delete-dialog__mark {
            border-color: var(--gp-tph-dialog-focus);
            color: var(--gp-tph-dialog-focus);
        }

        @keyframes area-delete-dialog-in {
            from {
                opacity: 0;
                transform: scale(0.96);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes area-delete-backdrop-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
            .area-delete-dialog[open],
            .area-delete-dialog::backdrop {
                animation-duration: 150ms;
            }
        }

        @media (max-width: 768px) {
            .content-card {
                padding: 20px 14px;
            }

            .page-title {
                margin-left: 0;
                font-size: 25px;
            }

            .toolbar {
                gap: 12px;
                align-items: stretch;
                flex-direction: column;
            }

            .search-input {
                width: 100%;
            }

            .add-button {
                align-self: flex-end;
            }

            .area-form-grid {
                grid-template-columns: 1fr;
            }

            .area-table {
                min-width: 850px;
            }

            .area-delete-dialog__content {
                padding: var(--gp-tph-space-lg);
            }

            .area-delete-dialog__actions {
                align-items: stretch;
                flex-direction: column-reverse;
            }

            .area-delete-dialog__button {
                width: 100%;
            }
        }

        :root {
            --photo-paper: oklch(97% 0.008 250);
            --photo-surface: oklch(100% 0.003 250);
            --photo-surface-muted: oklch(94% 0.014 250);
            --photo-ink: oklch(21% 0.045 258);
            --photo-ink-soft: oklch(39% 0.034 255);
            --photo-rule: oklch(81% 0.02 250);
            --photo-accent: oklch(48% 0.17 250);
            --photo-accent-ink: oklch(98% 0.004 250);
            --photo-focus: oklch(55% 0.17 245);
            --photo-danger: oklch(52% 0.19 27);
            --photo-warning: oklch(75% 0.16 85);
            --photo-shadow: oklch(35% 0.1 250 / 0.16);
            --photo-backdrop: oklch(21% 0.045 258 / 0.58);
            --photo-font: 'Kanit', sans-serif;
            --photo-space-xs: 0.5rem;
            --photo-space-sm: 0.75rem;
            --photo-space-md: 1rem;
            --photo-space-lg: 1.5rem;
            --photo-space-xl: 2.5rem;
            --photo-space-2xl: 4rem;
            --photo-radius: 0.5rem;
            --photo-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
            --photo-dur-short: 220ms;
        }

        body {
            background-color: var(--photo-paper);
            color: var(--photo-ink);
            font-family: var(--photo-font);
        }

        .photo-permission-shell {
            width: min(100%, 72rem);
            min-height: 100dvh;
            margin: 0 auto;
            padding: var(--photo-space-lg);
        }

        .permission-masthead {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: var(--photo-space-lg);
            margin: calc(var(--photo-space-xl) * -1) calc(var(--photo-space-xl) * -1) var(--photo-space-xl);
            padding: var(--photo-space-xl);
            background: var(--photo-accent);
            color: var(--photo-accent-ink);
        }

        .permission-kicker {
            display: block;
            margin-bottom: var(--photo-space-xs);
            color: var(--photo-accent-ink);
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.08em;
        }

        .permission-title {
            margin: 0;
            color: var(--photo-accent-ink);
            font-family: var(--photo-font);
            font-size: clamp(1.875rem, 4vw, 3.25rem);
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0;
            line-height: 1.1;
            overflow-wrap: anywhere;
        }

        .permission-subtitle {
            margin: var(--photo-space-sm) 0 0;
            color: var(--photo-accent-ink);
            font-size: 0.9375rem;
            line-height: 1.5;
        }

        .permission-code {
            display: grid;
            gap: 0.125rem;
            padding: var(--photo-space-sm) var(--photo-space-md);
            border: 1px solid var(--photo-accent-ink);
            color: var(--photo-accent-ink);
            font-size: 0.8125rem;
            font-weight: 700;
            line-height: 1.2;
            text-align: right;
        }

        .permission-code strong {
            font-size: 1.125rem;
        }

        .permission-workspace {
            width: 100%;
            min-height: 100dvh;
            padding: var(--photo-space-xl);
            border: 1px solid var(--photo-rule);
            border-radius: 0;
            background: var(--photo-surface);
            box-shadow: 0 1rem 2.5rem var(--photo-shadow);
        }

        .workspace-intro {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: var(--photo-space-lg);
            padding-bottom: var(--photo-space-lg);
            border-bottom: 1px solid var(--photo-rule);
        }

        .workspace-title {
            margin: 0;
            color: var(--photo-ink);
            font-family: var(--photo-font);
            font-size: 1.5rem;
            font-style: normal;
            font-weight: 700;
            line-height: 1.2;
        }

        .workspace-copy {
            margin: var(--photo-space-xs) 0 0;
            color: var(--photo-ink-soft);
            font-size: 0.9375rem;
            line-height: 1.5;
        }

        .permission-workspace .toolbar {
            margin: var(--photo-space-lg) 0;
        }

        .permission-workspace .search-input {
            width: min(100%, 22rem);
            height: 2.75rem;
            border: 1px solid var(--photo-rule);
            border-radius: 0;
            background: var(--photo-surface);
            color: var(--photo-ink);
            font-family: var(--photo-font);
            font-size: 1rem;
            outline: 2px solid transparent;
            outline-offset: 1px;
        }

        .permission-workspace .search-input:focus-visible,
        .permission-workspace .area-form input:focus-visible,
        .permission-workspace .area-form select:focus-visible {
            border-color: var(--photo-accent);
            outline-color: var(--photo-focus);
        }

        .permission-workspace .add-button {
            min-height: 2.75rem;
            border: 1px solid var(--photo-accent);
            border-radius: 0.25rem;
            background: var(--photo-accent);
            color: var(--photo-accent-ink);
            font-family: var(--photo-font);
            font-weight: 700;
            letter-spacing: 0;
            white-space: nowrap;
            transition: background-color var(--photo-dur-short) var(--photo-ease-out), transform 120ms var(--photo-ease-out);
        }

        @media (hover: hover) and (pointer: fine) {
            .permission-workspace .add-button:hover {
                background: var(--photo-ink);
            }
        }

        .permission-workspace .add-button:focus-visible {
            outline: 3px solid var(--photo-focus);
            outline-offset: 3px;
        }

        .permission-workspace .add-button:active {
            transform: translateY(1px);
        }

        .permission-workspace .area-form-actions .btn-primary {
            border-color: var(--photo-accent);
            background: var(--photo-accent);
            color: var(--photo-accent-ink);
        }

        .permission-workspace .area-form-actions .btn-error {
            border-color: var(--photo-danger);
            background: var(--photo-danger);
            color: var(--photo-accent-ink);
        }

        .permission-workspace .area-form {
            margin-bottom: var(--photo-space-lg);
            padding: var(--photo-space-lg);
            border: 1px solid var(--photo-rule);
            border-left: 0;
            border-right: 0;
            border-radius: 0;
            background: var(--photo-surface-muted);
        }

        .permission-workspace .area-form label,
        .permission-workspace .area-table th {
            color: var(--photo-ink-soft);
            font-family: var(--photo-font);
            font-weight: 700;
        }

        .permission-workspace .area-form input,
        .permission-workspace .area-form select,
        .permission-workspace .area-form .select2-container .select2-selection--single {
            height: 2.75rem;
            border: 1px solid var(--photo-rule);
            border-radius: 0.25rem;
            background: var(--photo-surface);
            color: var(--photo-ink);
            font-family: var(--photo-font);
            outline: 2px solid transparent;
            outline-offset: 1px;
        }

        .permission-workspace .area-table {
            border: 1px solid var(--photo-rule);
            border-radius: 0;
            font-family: var(--photo-font);
        }

        .permission-workspace .area-table th {
            height: 3.25rem;
            background: var(--photo-accent);
            color: var(--photo-accent-ink);
            border-bottom-color: var(--photo-accent);
        }

        .permission-workspace .area-table td {
            height: 3.5rem;
            color: var(--photo-ink);
            border-bottom-color: var(--photo-rule);
        }

        .permission-workspace .area-table th:not(:last-child),
        .permission-workspace .area-table td:not(:last-child) {
            border-right-color: var(--photo-rule);
        }

        .permission-workspace .area-table tbody tr:nth-child(even) {
            background: var(--photo-surface-muted);
        }

        .permission-workspace .sort-icon {
            color: var(--photo-accent-ink);
            opacity: 0.7;
        }

        .permission-workspace .table-action-button {
            width: 2.75rem;
            height: 2.75rem;
            border: 1px solid var(--photo-rule);
            border-radius: 50%;
            background: var(--photo-surface);
            transition: background-color var(--photo-dur-short) var(--photo-ease-out), transform 120ms var(--photo-ease-out);
        }

        @media (hover: hover) and (pointer: fine) {
            .permission-workspace .table-action-button:hover {
                background: var(--photo-surface-muted);
            }
        }

        .permission-workspace .table-action-button:focus-visible {
            outline: 3px solid var(--photo-focus);
            outline-offset: 2px;
        }

        .permission-workspace .table-action-button:active {
            transform: translateY(1px);
        }

        .permission-workspace .table-summary {
            margin-top: var(--photo-space-lg);
            color: var(--photo-ink-soft);
            font-family: var(--photo-font);
            font-variant-numeric: tabular-nums;
        }

        .permission-workspace .edit-icon {
            color: var(--photo-warning);
        }

        .permission-workspace .delete-icon {
            color: var(--photo-danger);
        }

        @media (max-width: 48rem) {
            .photo-permission-shell {
                padding: var(--photo-space-sm);
            }

            .permission-masthead,
            .permission-workspace {
                padding: var(--photo-space-lg);
            }

            .permission-masthead,
            .workspace-intro,
            .permission-workspace .toolbar {
                align-items: stretch;
                flex-direction: column;
            }

            .permission-masthead {
                margin: calc(var(--photo-space-lg) * -1) calc(var(--photo-space-lg) * -1) var(--photo-space-lg);
            }

            .permission-code {
                width: fit-content;
                text-align: left;
            }

            .permission-workspace .add-button {
                align-self: flex-start;
            }
        }

        :root {
            --area-surface: #ffffff;
            --area-surface-muted: #f8fafc;
            --area-border: #e2e8f0;
            --area-ink: #0f172a;
            --area-muted: #475569;
            --area-primary: #1e40af;
            --area-primary-hover: #1e3a8a;
            --area-primary-ink: #ffffff;
            --area-focus: #2563eb;
            --area-header-rule: rgba(255, 255, 255, 0.15);
            --area-shadow: rgb(15 23 42 / 0.12);
            --area-danger: #dc2626;
            --area-danger-hover: #b91c1c;
            --area-danger-surface: #fef2f2;
            --area-backdrop: rgb(15 23 42 / 0.35);
        }

        .area-data-shell {
            min-height: 100dvh;
            padding: 1rem;
            background: var(--area-surface-muted);
            color: var(--area-ink);
        }

        .area-data-card {
            width: min(100%, 72rem);
            margin: 0 auto;
            padding: 1.5rem;
            border: 1px solid var(--area-border);
            border-radius: 1.5rem;
            background: var(--area-surface);
            box-shadow: 0 1.25rem 2.5rem var(--area-shadow);
        }

        .area-data-title {
            margin: 0;
            color: var(--area-primary);
            font-size: 1.875rem;
            font-weight: 700;
            line-height: 1.2;
            overflow-wrap: anywhere;
        }

        .area-data-subtitle {
            margin: 0.25rem 0 0;
            color: var(--area-muted);
            font-size: 1.125rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .area-data-card .toolbar {
            margin: 1.5rem 0;
        }

        .area-data-card .search-input {
            width: min(100%, 20rem);
            height: 2.75rem;
            border: 1px solid var(--area-border);
            border-radius: 0.5rem;
            background: var(--area-surface);
            color: var(--area-ink);
            font-size: 0.875rem;
        }

        .area-data-card .search-input:focus-visible,
        .area-data-card .area-form input:focus-visible,
        .area-data-card .area-form select:focus-visible,
        .area-delete-dialog__button:focus-visible {
            outline: 3px solid var(--area-focus);
            outline-offset: 2px;
        }

        .area-data-card .add-button {
            min-height: 2.75rem;
            border-color: var(--area-primary);
            border-radius: 0.5rem;
            background: var(--area-primary);
            color: var(--area-primary-ink);
            font-weight: 700;
        }

        .area-data-card .add-button:hover {
            background: var(--area-primary-hover);
        }

        .area-data-card .area-form {
            margin-bottom: 1.5rem;
            padding: 1.25rem;
            border: 1px solid var(--area-border);
            border-radius: 1rem;
            background: var(--area-surface-muted);
        }

        .area-data-card .area-form label {
            color: var(--area-ink);
        }

        .area-data-card .area-form input,
        .area-data-card .area-form select,
        .area-data-card .area-form .select2-container .select2-selection--single {
            height: 2.5rem;
            border-color: var(--area-border);
            border-radius: 0.5rem;
            background: var(--area-surface);
            color: var(--area-ink);
        }

        .area-data-card .area-table {
            border-color: var(--area-border);
            border-radius: 1rem;
        }

        .area-data-card .area-table th {
            height: 3rem;
            background: var(--area-primary);
            color: var(--area-primary-ink);
            border-bottom-color: var(--area-header-rule);
        }

        .area-data-card .area-table td {
            height: 3.25rem;
            border-bottom-color: var(--area-border);
            color: var(--area-ink);
        }

        .area-data-card .area-table th:not(:last-child),
        .area-data-card .area-table td:not(:last-child) {
            border-right-color: var(--area-border);
        }

        .area-data-card .area-table tbody tr:nth-child(even) {
            background: var(--area-surface-muted);
        }

        .area-data-card .table-action-button {
            border-color: var(--area-border);
            border-radius: 0.5rem;
        }

        .area-data-card .table-summary {
            color: var(--area-muted);
        }

        .area-delete-dialog {
            width: min(calc(100% - 2rem), 30rem);
            max-height: calc(100dvh - 2rem);
            padding: 0;
            border-color: var(--area-border);
            border-radius: 1.5rem;
            background: var(--area-surface);
            color: var(--area-ink);
            cursor: default;
            box-shadow: 0 1.25rem 2.5rem var(--area-shadow);
        }

        .area-delete-dialog::backdrop {
            background: var(--area-backdrop);
        }

        .area-delete-dialog__content {
            padding: 1.5rem;
            cursor: default;
        }

        .area-delete-dialog__mark {
            width: 2.75rem;
            height: 2.75rem;
            margin-bottom: 1rem;
            border-color: var(--area-danger);
            border-radius: 0.75rem;
            background: var(--area-danger-surface);
            color: var(--area-danger);
        }

        .area-delete-dialog__title {
            color: var(--area-ink);
            font-family: inherit;
        }

        .area-delete-dialog__text {
            color: var(--area-muted);
            font-family: inherit;
        }

        .area-delete-dialog__button {
            min-width: 6.5rem;
            min-height: 2.5rem;
            border-color: var(--area-border);
            border-radius: 0.5rem;
            background: var(--area-surface);
            color: var(--area-ink);
            cursor: pointer;
            font-family: inherit;
        }

        .area-delete-dialog__button--danger {
            border-color: var(--area-danger);
            background: var(--area-danger);
            color: var(--area-primary-ink);
        }

        .area-delete-dialog__button--danger:hover {
            background: var(--area-danger-hover);
            color: var(--area-primary-ink);
        }

        @media (min-width: 48rem) {
            .area-data-shell {
                padding: 2rem;
            }
        }

        @media (max-width: 48rem) {
            .area-data-card {
                padding: 1rem;
                border-radius: 1rem;
            }

            .area-data-card .toolbar {
                align-items: stretch;
                flex-direction: column;
            }

            .area-data-card .search-input,
            .area-data-card .add-button {
                width: 100%;
            }
        }
    </style>
@endsection

@section('contents')
    <div class="area-data-shell bg-base-200 flex justify-center text-[13px] leading-relaxed font-sans text-base-content">
        <div class="area-data-card">
            <header class="text-center">
                <h1 class="area-data-title">พื้นที่ขออนุญาตถ่ายภาพ</h1>
                <p class="area-data-subtitle">Photo Permission Area Data</p>
            </header>
            <div class="toolbar">
                <input type="text" id="searchArea" class="input search-input" placeholder="Search record" autocomplete="off">
                <button type="button" id="newAreaButton" class="btn add-button">
                    + NEW AREA
                </button>
            </div>

            <form id="areaForm" class="area-form">
                <div class="area-form-grid">
                    <div>
                        <label for="LOCATION_ID">Location</label>
                        <select id="LOCATION_ID" name="LOCATION_ID" required>
                            <option value="">Select location</option>
                        </select>
                    </div>
                    <div>
                        <label for="AREA_NAME">Area</label>
                        <input type="text" id="AREA_NAME" name="AREA_NAME" required>
                    </div>
                    <div>
                        <label for="AREA_LEVEL">Level</label>
                        <input type="number" id="AREA_LEVEL" name="AREA_LEVEL" inputmode="numeric" min="0" step="1" required>
                    </div>
                    <div>
                        <label for="AREA_OWNER">Area Owner</label>
                        <select id="AREA_OWNER" name="AREA_OWNER" required>
                            <option value="">Select area owner</option>
                        </select>
                    </div>
                </div>
                <div class="area-form-actions">
                    <button type="button" id="cancelAreaButton" class="btn btn-sm btn-error gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-sm btn-primary gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 4h11l3 3v13H5V4Zm3 0v6h8V4m-8 16v-6h8v6" />
                        </svg>
                        Save
                    </button>
                </div>
            </form>

            <div class="table-wrapper border-slate-200">
                <table class="area-table">
                    <thead>
                        <tr>
                            <th class ="border p-2 bg-blue-500 text-white">
                                NO
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Location
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Area
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Level
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Area Owner
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody id="areaTableBody">
                        @forelse ([] as $index => $area)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td>{{ $area->location ?? '-' }}</td>
                                <td>{{ $area->area ?? '-' }}</td>
                                <td>{{ $area->level ?? '-' }}</td>
                                <td>{{ $area->area_owner ?? '-' }}</td>
                                <td>
                                    <a href="{{ url('/photo-permission-area/' . $area->id . '/edit') }}" class="action-link"
                                        title="แก้ไขข้อมูล" style="border-block-end-color: gold">
                                        <span class="edit-icon">✎</span>
                                    </a>

                                    <form action="{{ url('/photo-permission-area/' . $area->id) }}" method="POST"
                                        style="display: inline;" onsubmit="return confirm('ยืนยันการลบข้อมูลนี้หรือไม่?');">
                                        @csrf
                                        @method('DELETE')

                                        <button type="submit" class="action-link" title="ลบข้อมูล"
                                            style="border: 0; background: transparent;">
                                            <span class="delete-icon">🗑</span>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="empty-row">
                                    ไม่พบข้อมูล
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div id="areaTableSummary" class="table-summary">
                0 row(s)
            </div>
        </div>
    </div>

    <dialog id="deleteAreaDialog" class="area-delete-dialog" aria-labelledby="deleteAreaDialogTitle" aria-describedby="deleteAreaDialogText">
        <div class="area-delete-dialog__content">
            <div class="area-delete-dialog__mark" aria-hidden="true">!</div>
            <h2 id="deleteAreaDialogTitle" class="area-delete-dialog__title">ยืนยันการลบ Area</h2>
            <p id="deleteAreaDialogText" class="area-delete-dialog__text">
                ต้องการลบข้อมูล Area นี้ใช่หรือไม่? ข้อมูลที่ลบแล้วไม่สามารถกู้คืนได้
            </p>
            <div class="area-delete-dialog__actions">
                <button type="button" class="btn area-delete-dialog__button" data-delete-area-cancel>ยกเลิก</button>
                <button type="button" class="btn area-delete-dialog__button area-delete-dialog__button--danger" data-delete-area-confirm>ลบ Area</button>
            </div>
        </div>
    </dialog>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpTPHArea.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
