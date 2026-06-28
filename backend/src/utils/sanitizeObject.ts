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
