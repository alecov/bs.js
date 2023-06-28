import assert from "assert";

import bisect from "../src/bisect.mjs";

const c = (x, y) => Math.abs(x - y) < 1e-15;
const t = (f) => {
  try {
    f();
  } catch {
    return true;
  }
  throw Error(`${f} did not throw`);
};

assert(c(bisect({ func: (x) => 10 * x }), 0));
assert(c(bisect({ func: (x) => 10 * x + 10 }), -1));
assert(c(bisect({ func: (x) => 10 * x - 10 }), +1));
assert(c(bisect({ func: (x) => x ** 2 - 2, a: 0, epsilon: 1e-15 }), 2 ** 0.5));
assert(
  t(
    bisect.bind(null, { func: (x) => x ** 2 - 2, a: 10, epsilon: 1e-15 }),
    2 ** 0.5
  )
);
