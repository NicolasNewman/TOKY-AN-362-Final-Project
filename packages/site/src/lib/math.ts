export const round = (n: number, sigfig: number = 2) => {
	const d = 10 * sigfig;
	return Math.round(n * d) / d;
};
