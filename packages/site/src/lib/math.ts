export const round = (n: number, sigfig: number = 2) => {
	const d = 10 * sigfig;
	return Math.round(n * d) / d;
};

export const shiftRange = (
	t: number,
	from: [number, number],
	to: [number, number],
	round: (n: number) => number = (n) => n,
) => {
	return round(to[0] + ((to[1] - to[0]) / (from[1] - from[0])) * (t - from[0]));
};
