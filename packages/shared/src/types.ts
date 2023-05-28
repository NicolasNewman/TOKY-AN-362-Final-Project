import { MovieId } from './data';

export interface Review {
	movieId: number;
	publishDate: string;
	helpful: string;
	reviewer: string;
	rating: number;
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

export interface Data {
	movieId: MovieId;
	dor: number;
	reviews: Review[];
	positive: Review[];
	negative: Review[];
	reviewByYears: { [key in string]: Review[] };
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

export type NGramId = keyof Data['positiveNGrams'];
