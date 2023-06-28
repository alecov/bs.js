import { ndtr } from "./ndtr.mjs";
import { ndtri } from "./ndtri.mjs";
import bisect from "./bisect.mjs";
import calc from "./calc.mjs";

const N = ndtr;
const invN = ndtri;
const P = (x) => Math.exp((-x * x) / 2) / (2 * Math.PI) ** 0.5;
const e = (x) => (isNaN(x) ? NaN : x >= 0 ? x : Number.POSITIVE_INFINITY);

const eat = (f) => {
  try {
    return f();
  } catch {}
};

// Some relations:
// m = (d1 + d2)/2 = -ln X/S
// d1 = +-sqrt(d2^2 - 2 ln X)
// d2 = +-sqrt(d1^2 + 2 ln X)
// S = +-sqrt(d1^2 + 2 ln X) + d1  [note: can have two roots]
// S = +-sqrt(d2^2 - 2 ln X) - d2  [note: can have two roots]
// Pc = Pp - (X - 1)
// Pp = Pc + (X - 1)

export default function (
  { T = 1, Nm, Nd1, Nd2, U, R = 0, s, Pc, Pp, Yc, Yp },
  flags
) {
  if (T instanceof Date) T = (T - new Date()) / (365 * 24 * 3600 * 1000);
  return calc(
    { T, Nm, Nd1, Nd2, U, R, s, Pc, Pp, Yc, Yp },
    {
      // Period.
      T: [(c) => c.t ** 2], // Period
      t: [(c) => c.T ** 0.5],

      // Volatility.
      s: [(c) => c.S / c.t], // Volatility
      S: [
        (c) => c.s * c.t,
        // Choose smallest positive solution for the quadratics:
        (c) => Math.min(e(+(c.S1 ** 0.5) + c.d1), e(-(c.S1 ** 0.5) + c.d1)),
        (c) => Math.min(e(+(c.S2 ** 0.5) - c.d2), e(-(c.S2 ** 0.5) - c.d2)),
        (c) => -c.lnX / c.m,
        (c) =>
          eat(
            // Bisect for S from the call price equation.
            bisect.bind(null, {
              func: (S) =>
                // N(-ln X/S + S/2) - X N(-ln X/S - S/2) - Pc = 0
                N(-c.lnX / S + S / 2) - c.X * N(-c.lnX / S - S / 2) - c.Pc,
              a: 0,
              b: 10,
            })
          ),
      ],
      S1: [(c) => c.d1 ** 2 + 2 * c.lnX],
      S2: [(c) => c.d2 ** 2 - 2 * c.lnX],

      // Rates.
      U: [(c) => c.X * (c.R + 1) - 1], // Upward rate
      R: [(c) => (c.U + 1) / c.X - 1], // Interest rate
      X: [
        // Upward-to-interest ratio
        (c) => (c.U + 1) / (c.R + 1),
        (c) => c.Pp - c.Pc + 1,
        (c) => (c.Nd1 - c.Pc) / c.Nd2,
        (c) => (c.Nd1m + c.Pp) / c.Nd2m,
        (c) => Math.exp(c.lnX),
        (c) =>
          eat(
            // Bisect for X from the call price equation.
            bisect.bind(null, {
              // N(-ln X/S + S/2) - X N(-ln X/S - S/2) - Pc = 0
              func: (X) =>
                N(-Math.log(X) / c.S + c.S / 2) -
                X * N(-Math.log(X) / c.S - c.S / 2) -
                c.Pc,
              a: 0,
              b: 10,
            })
          ),
      ],
      lnX: [(c) => -c.m * c.S, (c) => Math.log(c.X)],

      // Moneynesses.
      m: [
        // Moneyness
        (c) => -c.lnX / c.S,
        (c) => (c.d1 + c.d2) / 2,
        (c) => invN(c.Nm),
      ],
      d1: [
        // D1
        (c) => c.m + c.S / 2,
        (c) => 2 * c.m - c.d2,
        (c) => c.d2 + c.S,
        (c) => invN(c.Nd1),
      ],
      d2: [
        // D2
        (c) => c.m - c.S / 2,
        (c) => 2 * c.m - c.d1,
        (c) => c.d1 - c.S,
        (c) => invN(c.Nd2),
      ],
      Nm: [(c) => N(c.m)],
      Nd1: [
        (c) => 1 - c.Nd1m,
        (c) => c.X * c.Nd2 + c.Pc,
        (c) => N(c.d1), //
      ],
      Nd2: [
        (c) => 1 - c.Nd2m,
        (c) => (c.Nd1 - c.Pc) / c.X,
        (c) => N(c.d2), //
      ],
      Nd1m: [
        (c) => 1 - c.Nd1,
        (c) => c.X * c.Nd2m - c.Pp, //
      ],
      Nd2m: [
        (c) => 1 - c.Nd2,
        (c) => (c.Nd1m + c.Pp) / c.X, //
      ],
      Pd1: [(c) => P(c.d1)],
      Pd2: [(c) => P(c.d2)],

      // Prices.
      Pc: [
        (c) => c.Pp - (c.X - 1), // Put-call parity
        (c) => c.Nd1 - c.X * c.Nd2,
        (c) => (1 + c.Yc) ** c.T - 1,
      ],
      Pp: [
        (c) => c.Pc + (c.X - 1), // Put-call parity
        (c) => c.X * c.Nd2m - c.Nd1m,
        (c) => (1 + c.Yp) ** c.T - 1,
      ],

      // Yields.
      Yc: [(c) => (1 + c.Pc) ** (1 / c.T) - 1], // Yield call
      Yp: [(c) => (1 + c.Pp) ** (1 / c.T) - 1], // Yield put

      // Greeks.
      Dc: [(c) => c.Nd1], // Delta call
      Dp: [(c) => c.Nd1m], // Delta put
      T1: [(c) => (-c.Pd1 * c.S) / (2 * c.T)], // Theta aux variable
      T2: [(c) => (Math.log(c.D) * c.X) / c.T], // Theta aux variable
      Tc: [(c) => c.T1 + c.T2 * c.Nd2], // Theta call
      Tp: [(c) => c.T1 - c.T2 * c.Nd2m], // Theta put
      Rc: [(c) => c.X * c.T * c.Nd2], // Rho call
      Rp: [(c) => c.X * c.T * c.Nd2m], // Rho put
      G: [(c) => c.Pd1 / c.S], // Gamma
      V: [(c) => c.Pd1 * c.t], // Vega

      // Others.
      D: [(c) => 1 / (1 + c.R)], // Discount factor

      // Inflection point.
      sr: [(c) => ((2 * c.lnX) / c.T) ** 0.5], // Volatility
      srt: [(c) => c.sr * c.t],
      mr: [(c) => -c.lnX / c.srt], // Moneyness
      d1r: [(c) => c.mr + c.srt / 2], // D1
      d2r: [(c) => c.mr - c.srt / 2], // D2
      Nmr: [(c) => N(c.mr)],
      Nd1r: [(c) => N(c.d1r)],
      Nd2r: [(c) => N(c.d2r)],
    },
    // This should be optimized in calc.mjs.
    [
      ["Pc", "Yc"],
      ["Pp", "Yp"],
      ["Pc", "Nd1", "s"],
      ["Pc", "Nd2", "s"],
      ["Yc", "Nd1", "s"],
      ["Yc", "Nd2", "s"],
      ["Pp", "Nd1", "s"],
      ["Pp", "Nd2", "s"],
      ["Yp", "Nd1", "s"],
      ["Yp", "Nd2", "s"],
      ["Nm", "Nd1", "Nd2"],
      ["s", "U", "R", "Nd1"],
      ["s", "U", "R", "Nd2"],
      ["Pc", "Pp", "U", "R"],
      ["Pc", "Nd1", "Nd2", "U", "R"],
      ["Pp", "Nd1", "Nd2", "U", "R"],
    ],
    flags
  );
}
