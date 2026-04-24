type ObjectType = Record<string, unknown>;

function isObject(item: unknown): item is ObjectType {
    return item != null && typeof item === 'object' && !Array.isArray(item);
}

export default function mergeDeep<T extends ObjectType>(
    target: Partial<T>,
    ...sources: Partial<T>[]
): T {
    for (const source of sources) {
        if (isObject(target) && isObject(source)) {
            for (const key in source) {
                if (isObject(source[key])) {
                    if (!target[key]) {
                        Object.assign(target, { [key]: {} });
                    } else {
                        target[key] = Object.assign({}, target[key]) as T[Extract<keyof T, string>];
                    }
                    mergeDeep(target[key] as T, source[key] as Partial<T>);
                } else if (source[key] !== null) {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
    }
    return target as T;
}
