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
            for (const key of Object.keys(source)) {
                if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
                    continue;
                }
                if (isObject(source[key])) {
                    if (!target[key]) {
                        Object.assign(target, { [key]: {} });
                    } else {
                        Object.assign(target, { [key]: Object.assign({}, target[key]) });
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
