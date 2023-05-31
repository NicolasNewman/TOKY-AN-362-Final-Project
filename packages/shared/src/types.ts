import { MovieId } from './data';

export interface Review {
	movieId: number;
	publishDate: string;
	helpful: string;
	reviewer: string;
	rating: number;
	title?: string;
	review?: string;
	reviewEN?: string;
	reviewENClean?: string;
	source?: string;
}

export type RawData = Review[];

export interface NGram {
	ngram: string;
	occurence: number;
	// relativeOccurence: number;
	// absoluteOccurence: number;
}

export interface Stats {
	avg: number;
	avgStrong: number;
	n: number;
	nPositive: number;
	nNegative: number;
	nStrong: number;
	nMixed: number;
	references: { [key in MovieId]: number };
}

export interface BaseMovie {
	movieId: MovieId;
	dor: number;
	reviews: Review[];
	stats: Stats;
	positiveNGrams: {
		'1': NGram[];
		'2': NGram[];
		'3': NGram[];
	};
	negativeNGrams: {
		'1': NGram[];
		'2': NGram[];
		'3': NGram[];
	};
}

export const isBaseMovie = (d: unknown): d is BaseMovie => {
	const temp = d as BaseMovie;
	return temp.movieId && temp.dor !== null && temp.reviews && temp.stats !== null;
};

export interface Movie extends BaseMovie {
	positive: Review[];
	negative: Review[];
	reviewByYears: { [key in string]: Review[] };
}

export const isMovie = (d: unknown): d is Movie => {
	const temp = d as Movie;
	return isBaseMovie(temp) && temp.positive && temp.negative && temp.reviewByYears !== null;
};

export type BaseData = { [key in MovieId]: BaseMovie };
export const isBaseData = (d: unknown): d is BaseData => {
	const temp = d as Data;
	return isBaseMovie(temp['148901']);
};
export type Data = { [key in MovieId]: Movie };
export const isData = (d: unknown): d is Data => {
	const temp = d as Data;
	return isMovie(temp['148901']);
};

export type NGramId = keyof Movie['positiveNGrams'];
