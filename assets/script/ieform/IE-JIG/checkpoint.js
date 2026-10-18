export function evaluateCheckpoint(min, max, measured) {
    const empty = (value) => value == null || String(value).trim() === '';
    if (empty(min) || empty(max)) return 'missing';
    if (!Number.isFinite(Number(min)) || !Number.isFinite(Number(max)) || Number(min) > Number(max)) return 'invalid';
    if (empty(measured)) return '';
    if (!Number.isFinite(Number(measured))) return 'invalid';
    return Number(measured) >= Number(min) && Number(measured) <= Number(max) ? 'OK' : 'NG';
}
