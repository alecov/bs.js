import { ndtr } from "./ndtr.js";

const N = ndtr;
const P = (x) => Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);

export default function bs(T, U, R, s) {
    if (T == 0)
        T = Number.MIN_VALUE;
    if (s == 0)
        s = Number.MIN_VALUE;

    const t = Math.sqrt(T);
    const S = s*t;

    if (t == 0)
        t = Number.MIN_VALUE;
    if (S == 0)
        S = Number.MIN_VALUE;

    const D = 1/(1 + R);
    const X = (U + 1)/(R + 1);
    const logX = Math.log(X);

    const m = -logX/S;
    const d1 = m + S/2;
    const d2 = m - S/2;

    const Nd1p = N(d1);
    const Nd2p = N(d2);
    const Nd1m = 1 - Nd1p;
    const Nd2m = 1 - Nd2p;
    const Pd1 = P(d1);

    const Pc = +(Nd1p - X*Nd2p);
    const Pp = -(Nd1m - X*Nd2m);

    const Dc = +Nd1p;
    const Dp = -Nd1m;

    const T1 = -Pd1*S/(2*T);
    const T2 = Math.log(D)*X/T;
    const Tc = T1 + T2*Nd2p;
    const Tp = T1 - T2*Nd2m;

    const R0 = X*T;
    const Rc = R0*Nd2p;
    const Rp = R0*Nd2m;

    const G = Pd1/S;
    const V = Pd1*t;

    let sr, srt, mr, d1r, d2r;
    if (logX >= 0) {
        sr = Math.sqrt(2*logX/T);
        srt = sr*t;
        if (srt == 0)
            srt = Number.MIN_VALUE;
        mr = -logX/srt;
        d1r = mr + srt/2;
        d2r = mr - srt/2;
    }
    else {
        sr = NaN;
        mr = Infinity;
        d1r = Infinity;
        d2r = Infinity;
    }

    return [
        [s, m, d1, d2],
        [sr, mr, d1r, d2r],
        [Pc, Pp],
        [Dc, Dp],
        [Tc, Tp],
        [Rc, Rp],
        G, V
    ];
}
