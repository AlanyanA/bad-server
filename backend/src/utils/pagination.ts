export const normalizePage = (value: unknown, fallback = 1) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return Math.floor(value)
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        if (Number.isFinite(parsed) && parsed > 0) {
            return Math.floor(parsed)
        }
    }

    return fallback
}

export const normalizeLimit = (
    value: unknown,
    fallback = 10,
    max = 10
) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return Math.min(Math.floor(value), max)
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        if (Number.isFinite(parsed) && parsed > 0) {
            return Math.min(Math.floor(parsed), max)
        }
    }

    return fallback
}
