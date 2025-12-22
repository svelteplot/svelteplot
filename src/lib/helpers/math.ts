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

    const a0 = 3.387132872796366608,
        a1 = 1.3314166789178437745e2,
        a2 = 1.9715909503065514427e3,
        a3 = 1.3731693765509461125e4,
        a4 = 4.5921953931549871457e4,
        a5 = 6.7265770927008700853e4,
        a6 = 3.3430575583588128105e4,
        a7 = 2.5090809287301226727e3,
        b1 = 4.2313330701600911252e1,
        b2 = 6.871870074920579083e2,
        b3 = 5.3941960214247511077e3,
        b4 = 2.1213794301586595867e4,
        b5 = 3.930789580009271061e4,
        b6 = 2.8729085735721942674e4,
        b7 = 5.226495278852854561e3,
        c0 = 1.42343711074968357734,
        c1 = 4.6303378461565452959,
        c2 = 5.7694972214606914055,
        c3 = 3.64784832476320460504,
        c4 = 1.27045825245236838258,
        c5 = 2.4178072517745061177e-1,
        c6 = 2.27238449892691845833e-2,
        c7 = 7.7454501427834140764e-4,
        d1 = 2.05319162663775882187,
        d2 = 1.6763848301838038494,
        d3 = 6.8976733498510000455e-1,
        d4 = 1.4810397642748007459e-1,
        d5 = 1.51986665636164571966e-2,
        d6 = 5.475938084995344946e-4,
        d7 = 1.05075007164441684324e-9,
        e0 = 6.6579046435011037772,
        e1 = 5.4637849111641143699,
        e2 = 1.7848265399172913358,
        e3 = 2.9656057182850489123e-1,
        e4 = 2.6532189526576123093e-2,
        e5 = 1.2426609473880784386e-3,
        e6 = 2.71155556874348757815e-5,
        e7 = 2.01033439929228813265e-7,
        f1 = 5.9983220655588793769e-1,
        f2 = 1.3692988092273580531e-1,
        f3 = 1.48753612908506148525e-2,
        f4 = 7.868691311456132591e-4,
        f5 = 1.8463183175100546818e-5,
        f6 = 1.4215117583164458887e-7,
        f7 = 2.04426310338993978564e-15;

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
