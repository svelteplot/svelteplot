type ObjectType = { [key: string]: any };

function isObject(item: any): item is ObjectType {
    return item && typeof item === 'object' && !Array.isArray(item);
}

export default function mergeDeep<T extends ObjectType>(
    target: Partial<T>,
    ...sources: Partial<T>[]
): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                } else {
                    target[key] = Object.assign({}, target[key]);
                }
                mergeDeep(target[key], source[key]);
            } else if (source[key] !== null) {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}
