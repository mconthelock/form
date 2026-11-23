export function evaluateCheckpoint(min, max, measured) {
    const empty = (value) => value == null || String(value).trim() === '';
    if (empty(min) || empty(max)) return 'missing';
    if (
        !Number.isFinite(Number(min)) ||
        !Number.isFinite(Number(max)) ||
        Number(min) > Number(max)
    )
        return 'invalid';
    if (empty(measured)) return '';
    if (!Number.isFinite(Number(measured))) return 'invalid';
    return Number(measured) >= Number(min) && Number(measured) <= Number(max)
        ? 'OK'
        : 'NG';
}

export function evaluateConfirmation(min, max, confirmValue) {
    return evaluateCheckpoint(min, max, confirmValue);
}

export function buildConfirmPayload(details) {
    return details
        .filter((detail) => detail.RESULT === 'NG')
        .map((detail) => {
            const value = detail.CONFIRM_VALUE;
            if (value == null || String(value).trim() === '')
                throw new Error(
                    `กรุณากรอก Confirm Measured ของ Check Point ${detail.CHECK_SEQ}`,
                );
            const number = Number(value);
            if (!Number.isFinite(number))
                throw new Error(
                    `Confirm Measured ของ Check Point ${detail.CHECK_SEQ} ต้องเป็นตัวเลข`,
                );
            return { CHECK_SEQ: detail.CHECK_SEQ, CONFIRM_VALUE: number };
        });
}
