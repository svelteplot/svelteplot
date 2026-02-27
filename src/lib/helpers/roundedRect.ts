/**
 *
 */
export function roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    borderRadius:
        | number
        | { topLeft?: number; topRight?: number; bottomLeft?: number; bottomRight?: number } = {
        topLeft: 0,
        topRight: 0,
        bottomLeft: 0,
        bottomRight: 0
    }
) {
    const maxRadius = Math.min(width, height) / 2;
    const [tl, tr, bl, br] = (
        typeof borderRadius === 'number'
            ? Array.from({ length: 4 }, () => borderRadius)
            : [
                  borderRadius?.topLeft || 0,
                  borderRadius?.topRight || 0,
                  borderRadius?.bottomLeft || 0,
                  borderRadius?.bottomRight || 0
              ]
    ).map((r) => Math.min(r, maxRadius));

    return `
    M ${x + tl} ${y}
    H ${x + width - tr}
    ${tr ? `A ${tr} ${tr} 0 0 1 ${x + width} ${y + tr}` : ''}
    V ${y + height - br}
    ${br ? `A ${br} ${br} 0 0 1 ${x + width - br} ${y + height}` : ''}
    H ${x + bl}
    ${bl ? `A ${bl} ${bl} 0 0 1 ${x} ${y + height - bl}` : ''}
    V ${y + tl}
    ${tl ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : ''}
    Z
  `;
}
