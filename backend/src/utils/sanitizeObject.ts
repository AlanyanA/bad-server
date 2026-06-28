export function sanitizeObject<T extends Record<string, unknown>>(value: T): T {
    const result = {} as T

    Object.entries(value).forEach(([key, item]) => {
        if (key.startsWith('$') || key.includes('.')) {
            return
        }

        if (Array.isArray(item)) {
            result[key as keyof T] = item.map((entry) => {
                if (entry && typeof entry === 'object') {
                    return sanitizeObject(entry as Record<string, unknown>)
                }
                return entry
            }) as unknown as T[keyof T]
            return
        }

        if (item && typeof item === 'object') {
            result[key as keyof T] = sanitizeObject(item as Record<string, unknown>) as unknown as T[keyof T]
            return
        }

        result[key as keyof T] = item as T[keyof T]
    })

    return result
}

export function hasForbiddenKeys<T extends Record<string, unknown>>(value: T): boolean {
    let found = false
    const check = (obj: any) => {
        if (!obj || typeof obj !== 'object') return
        for (const [k, v] of Object.entries(obj)) {
            if (k.startsWith('$') || k.includes('.')) {
                found = true
                return
            }
            if (Array.isArray(v)) {
                for (const entry of v) {
                    if (entry && typeof entry === 'object') check(entry)
                    if (found) return
                }
            } else if (v && typeof v === 'object') {
                check(v)
                if (found) return
            }
        }
    }
    check(value)
    return found
}
