import assert from "assert";

import { ndtr } from "../src/ndtr.mjs";

const c = (x, y) => Math.abs(x - y) < 1e-15;

assert(c(ndtr(0), 0.5));
