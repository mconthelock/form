import { checkFileFormat, fileFormats } from '@amec/webasset/file';
import { showErrorMessage } from '@amec/webasset/utils';

export class FileUpload {
    constructor({
        inputId = null,
        selectFileNameId = null,
        containerId = null,
        type = 'all',
        icon = null,
        iconColor = null,
        iconBackground = null,
        acceptType = '*/*',
        resetText = 'Please select a file',
        buttons = [],
        onChange = null,
        onError = null,
    } = {}) {
        this.inputId = inputId;
        this.selectFileNameId = selectFileNameId;
        this.containerId = containerId;
        this.type = type;
        this.icon = icon;
        this.iconColor = iconColor;
        this.iconBackground = iconBackground;
        this.resetText = resetText;
        this.buttons = buttons;
        this.onChange = onChange;
        this.onError = onError;

        const format = fileFormats[this.type];
        this.acceptType = format?.extension.join(',') ?? acceptType;

        this.render();

        this.bindEvents();
    }
    get input() {
        return document.getElementById(this.inputId);
    }

    get selectFileName() {
        return document.getElementById(this.selectFileNameId);
    }

    get container() {
        return document.getElementById(this.containerId);
    }

    render() {
        const format = fileFormats[this.type];
        this.container.innerHTML = `
            <div class="flex flex-wrap items-center gap-4 p-5 rounded-xl bg-base-200/50 border border-base-300">
                <div class="flex items-center justify-center w-12 h-12 rounded-lg shrink-0" style="background-color: ${this.iconBackground ?? format?.background ?? ''};">
                    <i class="${this.icon ?? format?.flatIcon ?? ''} text-2xl " style="color: ${this.iconColor ?? format?.color ?? ''};"></i>
                </div>
                <div class="flex-1 min-w-40">
                    <div class="font-semibold">${this.type != 'all' ? this.type.toUpperCase() : ''} File</div>
                    <div id="${this.selectFileNameId}" class="text-sm text-base-content/60 truncate">
                        Please select a ${this.type != 'all' ? this.type.toUpperCase() : ''} file
                    </div>
                </div>
                <div class="flex items-center gap-3 ms-auto">
                    <label for="${this.inputId}" class="btn btn-outline btn-sm cursor-pointer">
                        <i class="fi fi-sr-folder-open"></i>
                        Choose File
                    </label>
                    <div class="flex items-center gap-3 ms-auto" data-role="actions"></div>
                </div>
                <input type="file" id="${this.inputId}" class="hidden" accept="${this.acceptType}" />
            </div>
        `;
        const actionsContainer = this.container.querySelector(
            '[data-role="actions"]',
        );
        this.buttons.map((btn) => {
            const el = document.createElement('button');
            el.type = 'button';
            if (btn.id) el.id = btn.id;
            el.className = btn.className || 'btn btn-outline btn-sm';
            el.innerHTML = `${btn.icon ? `<i class="${btn.icon}"></i> ` : ''}${btn.label || ''}`;
            el.addEventListener('click', (event) => {
                if (typeof btn.onClick === 'function') {
                    btn.onClick(this.input.files[0], this, event);
                }
            });
            actionsContainer.appendChild(el);
            return el;
        });
    }

    bindEvents() {
        this.input.addEventListener('change', (event) => {
            try {
                const file = event.target.files[0];
                if (
                    !file ||
                    (this.type !== 'all' &&
                        fileFormats[this.type] !== undefined &&
                        !checkFileFormat(
                            this.input,
                            fileFormats[this.type].extension,
                            fileFormats[this.type].msgEn,
                        ))
                ) {
                    this.reset();
                    if (typeof this.onError === 'function') {
                        this.onError(file, this);
                    }
                    return;
                }
                const size = (file.size / 1024 / 1024).toFixed(2);
                this.selectFileName.innerHTML = `${file.name} (${size} MB)`;
                if (typeof this.onChange === 'function') {
                    this.onChange(file, this);
                }
            } catch (error) {
                console.error(error);
                this.reset();
                if (typeof this.onError === 'function') {
                    this.onError(event.target.files[0], this);
                }
                showErrorMessage(error.message);
                return;
            }
        });
    }
    reset() {
        this.input.value = '';
        this.selectFileName.innerHTML = this.resetText;
    }
}
