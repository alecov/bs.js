export default function ({
  func,
  a = Number.MIN_SAFE_INTEGER,
  b = Number.MAX_SAFE_INTEGER,
  epsilon = Number.EPSILON,
  maxSteps = Number.MAX_VALUE,
  flags,
}) {
  const funcA = func(a);
  const funcB = func(b);
  if (isNaN(funcA)) throw new Error(`Invalid parameter: a=${a} f(a) is NaN`);
  if (isNaN(funcB)) throw new Error(`Invalid parameter: b=${b} f(b) is NaN`);
  if (funcA > 0 && funcB < 0) [a, b] = [b, a];

  let count, root, previous;
  for (count = 0; count < maxSteps; ++count) {
    root = (a + b) / 2;
    if (isNaN(root)) throw new Error(`NaN root: a=${a} b=${b}`);
    if (root === a || root === b) break;
    const result = func(root);
    if (result === previous)
      throw new Error(
        `Fixed point: a=${root} b=${root} root=${root} f(root)=${result}`
      );
    if (isNaN(result)) throw new Error(`NaN at root=${root}: f(root) is NaN`);
    if (flags?.debug)
      console.debug(`Bisecting a=${a} b=${b} root=${root} f(root)=${result}`);
    previous = result;
    if (Math.abs(result) < epsilon) return root;
    if (result < 0) a = root;
    else b = root;
  }
  throw new Error(`Cannot find root after ${count} steps`);
}
