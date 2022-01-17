# bs.js

This is a small ES6 library for calculating the Black & Scholes formula for
European options. This library adapts some code from [Cephes](https://github.com/jeremybarnes/cephes).

## The calculations

Define:

	S                               spot price;
	F                               future price;
	K                               strike price;
	s                               continuous volatility;
	T                               time to maturity (period);

	N(x)                            standard cumulative normal distribution;
	D = S/F                         the discount factor;
	R = F/S - 1                     the interest rate (spot-future parity);
	U = K/S - 1                     the upward rate (strike-to-spot rate);
	X = (U + 1)/(R + 1)             upward-to-interest ratio;

Also define:

	L = s sqrtT
	m = -log X/L                    standardized log-moneyness;
	d1 = m + L/2                    D1 moneyness (numéraire asset);
	d2 = m - L/2                    D2 moneyness (numéraire cash);

From Black & Scholes Equation:

	C = D(N(+d1)F - N(+d2)K)        the call price.
	P = D(N(-d2)K - N(-d1)F)        the put price.

Hence:

	(call price ratio)
	C/S = N(+d1) - DK/S N(+d2)
	    = N(+d1) - (U + 1)/(R + 1)N(+d2)
	    = N(+d1) - XN(+d2)

	(put price ratio)
	P/S = DK/S N(-d2) - N(-d1)
	    = (U + 1)/(R + 1)N(-d2) - N(-d1)
	    = XN(-d2) - N(-d1)

This calculation method yields unitless rates which are independent from nominal
spot prices. The greeks and other values can also be calculated in a similar
way.

This library provides the `bs(T, U, R, s)` function which returns several
variables calculated using this method.
