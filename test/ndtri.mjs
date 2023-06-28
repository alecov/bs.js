import assert from "assert";

import { ndtr } from "../src/ndtr.mjs";
import { ndtri } from "../src/ndtri.mjs";

const c = (x, y) => Math.abs(x - y) < 1e-12;

for (let p = -4; p <= +4; p += 0.001) assert(c(ndtri(ndtr(p)), p), p);
for (let p = +0; p <= 1; p += 0.001) assert(c(ndtr(ndtri(p)), p), p);
