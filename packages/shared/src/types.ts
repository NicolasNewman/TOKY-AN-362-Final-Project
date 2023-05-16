export interface Review {
	movieId: string;
	publishDate: string;
	helpful: string;
	reviewer: string;
	rating: string;
	title: string;
	review: string;
	reviewEN?: string;
	reviewENClean?: string;
	source?: string;
}

export type RawData = Review[];

export interface NGram {
	ngram: string;
	occurence: number;
	relativeOccurence: number;
	absoluteOccurence: number;
}

export interface Stats {
	avg: number;
	avgStrong: number;
	n: number;
	nPositive: number;
	nNegative: number;
	nStrong: number;
	nMixed: number;
}

export interface Data {
	movieId: string;
	reviews: Review[];
	positive: Review[];
	negative: Review[];
	stats: Stats;
	positiveNGrams: {
		n: number;
		data: NGram[];
	}[];
	negativeNGrams: {
		n: number;
		data: NGram[];
	}[];
}
