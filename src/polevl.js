// https://github.com/jeremybarnes/cephes/blob/master/misc/polevl.c

export function polevl(x, c) { return c.reduce((r, c) => r*x + c, 0); }
export function p1evl(x, c) { return c.reduce((r, c) => r*x + c, 1); }
