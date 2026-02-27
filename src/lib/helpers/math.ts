import { sum } from 'd3-array';

/** 
Returns the normal deviate Z corresponding to a given lower tail area of P; Z is accurate to about 1 part in 10**16.

Wichura, M. J. (1988) Algorithm AS 241: The percentage points of the normal distribution. Applied Statistics, 37, 477–484.

extension of:
Beasley, J. D./ Springer, S. G. (1977), The percentage points of the NormalDistribution, Applied Statistics. 26, 118–121.

Excel: STANDNORMINV(); R: qnorm()
**/

export function normdev(p: number) {
    if (p < 0 || p > 1) return false;
    if (p == 0) return -Infinity;
    if (p == 1) return Infinity;

    const a0 = 3.3871328727963665,
        a1 = 133.14166789178438,
        a2 = 1971.5909503065513,
        a3 = 13731.69376550946,
        a4 = 45921.95393154987,
        a5 = 67265.7709270087,
        a6 = 33430.57558358813,
        a7 = 2509.0809287301227,
        b1 = 42.31333070160091,
        b2 = 687.1870074920579,
        b3 = 5394.196021424751,
        b4 = 21213.794301586597,
        b5 = 39307.89580009271,
        b6 = 28729.085735721943,
        b7 = 5226.495278852854,
        c0 = 1.4234371107496835,
        c1 = 4.630337846156546,
        c2 = 5.769497221460691,
        c3 = 3.6478483247632045,
        c4 = 1.2704582524523684,
        c5 = 0.2417807251774506,
        c6 = 0.022723844989269184,
        c7 = 0.0007745450142783414,
        d1 = 2.053191626637759,
        d2 = 1.6763848301838038,
        d3 = 0.6897673349851,
        d4 = 0.14810397642748008,
        d5 = 0.015198666563616457,
        d6 = 0.0005475938084995345,
        d7 = 1.0507500716444169e-9,
        e0 = 6.657904643501103,
        e1 = 5.463784911164114,
        e2 = 1.7848265399172913,
        e3 = 0.29656057182850487,
        e4 = 0.026532189526576124,
        e5 = 0.0012426609473880784,
        e6 = 0.000027115555687434876,
        e7 = 2.0103343992922881e-7,
        f1 = 0.599832206555888,
        f2 = 0.1369298809227358,
        f3 = 0.014875361290850615,
        f4 = 0.0007868691311456133,
        f5 = 0.000018463183175100548,
        f6 = 1.421511758316446e-7,
        f7 = 2.0442631033899397e-15;

    const q = p - 0.5;
    let r, z;

    // p close to 0.5
    if (Math.abs(q) <= 0.425) {
        r = 0.180625 - q * q;
        z =
            (q * (((((((a7 * r + a6) * r + a5) * r + a4) * r + a3) * r + a2) * r + a1) * r + a0)) /
            (((((((b7 * r + b6) * r + b5) * r + b4) * r + b3) * r + b2) * r + b1) * r + 1);
        return z;
    }

    if (q > 0) r = 1 - p;
    else r = p;
    r = Math.sqrt(-Math.log(r));

    // p neither close to 0.5 nor 0 or 1
    if (r <= 5) {
        r += -1.6;
        z =
            (((((((c7 * r + c6) * r + c5) * r + c4) * r + c3) * r + c2) * r + c1) * r + c0) /
            (((((((d7 * r + d6) * r + d5) * r + d4) * r + d3) * r + d2) * r + d1) * r + 1);
    }
    // p near 0 or 1
    else {
        r += -5;
        z =
            (((((((e7 * r + e6) * r + e5) * r + e4) * r + e3) * r + e2) * r + e1) * r + e0) /
            (((((((f7 * r + f6) * r + f5) * r + f4) * r + f3) * r + f2) * r + f1) * r + 1);
    }

    if (q < 0.0) z = -z;
    return z;
}

/*
Hill's approximated inverse t-distribution calculates t given df and two-tail probability:
Hill, G. W. (1970), Algorithm 396: Student's t-quantiles. Communications of the ACM, 13(10), 619–620.

Result should be "correct to at least 6 significant digits even for the analytic continuation through noninteger values of n > 5". For higher precision (used in R, ...) see:
Hill, G. W. (1981) Remark on Algorithm 396, ACM Transactions on Mathematical Software, 7, 250–1.

Excel: TINV(); R: qt()
*/
function inverseT(p: number, df: number) {
    const { sin, cos, sqrt, pow, exp, PI } = Math;
    //   let a, b, c, d, t, x, y;

    if (df == 1) return cos((p * PI) / 2) / sin((p * PI) / 2);
    if (df == 2) return sqrt(2 / (p * (2 - p)) - 2);

    const a = 1 / (df - 0.5);
    const b = 48 / (a * a);
    let c = (((20700 * a) / b - 98) * a - 16) * a + 96.36;
    const d = ((94.5 / (b + c) - 3) / b + 1) * sqrt(a * PI * 0.5) * df;
    let x: number = d * p;
    let y = pow(x, 2 / df);

    if (y > 0.05 + a) {
        // The procedure normdev(p) is assumed to return a negative normal
        // deviate at the lower tail probability level p, e.g. -2.32 for p = 0.01.
        const _x = normdev(p / 2);
        if (_x === false) {
            throw new Error('normdev returned false for p/2 in inverseT');
        } else {
            x = _x;
        }
        y = x * x;
        if (df < 5) c = c + 0.3 * (df - 4.5) * (x + 0.6);
        c = (((0.05 * d * x - 5) * x - 7) * x - 2) * x + b + c;
        y = (((((0.4 * y + 6.3) * y + 36) * y + 94.5) / c - y - 3) / b + 1) * x;
        y = a * y * y;
        if (y > 0.002) y = exp(y) - 1;
        else y = 0.5 * y * y + y;
    } else {
        y =
            (((1 / (((df + 6) / (df * y) - 0.089 * d - 0.822) * (df + 2) * 3) + 0.5 / (df + 4)) *
                y -
                1) *
                (df + 1)) /
                (df + 2) +
            1 / y;
    }

    return sqrt(df * y);
}

// https://stats.stackexchange.com/questions/101318/understanding-shape-and-calculation-of-confidence-bands-in-linear-regression
export function confidenceInterval(
    data: { x: number; y: number }[],
    predict: (x: number) => number,
    confidenceLevel: number
) {
    const mean = sum(data, (d) => d.x) / data.length;
    let a = 0,
        b = 0;
    for (let i = 0; i < data.length; ++i) {
        a += Math.pow(data[i].x - mean, 2);
        b += Math.pow(data[i].y - predict(data[i].x), 2);
    }
    const sy = Math.sqrt(b / (data.length - 2));
    const t = inverseT(+confidenceLevel, data.length - 2);

    return function (x: number) {
        const Y = predict(x);
        const se = sy * Math.sqrt(1 / data.length + Math.pow(x - mean, 2) / a);
        return { x, left: Y - t * se, right: Y + t * se };
    };
}
