import { Data, Movie, isBaseData } from '@ghibli-analysis/shared/dist/web';
import data from '@ghibli-analysis/shared/dist/data.json';
import { getEntries } from '../object';

const Movies = () => {
	console.log(data);
	if (isBaseData(data)) {
		console.log('TRUE');
		return getEntries(data)
			.map(([key, movie]) => {
				const temp: Movie = {
					...movie,
					positive: movie.reviews.filter((m) => m.rating > 3),
					// positiveHotwords: reduceHotWords(movie.positiveHotwords),
					negative: movie.reviews.filter((m) => m.rating < 3),
					// negativeHotwords: reduceHotWords(movie.negativeHotwords),
					reviewByYears: movie.reviews.reduce((prev, curr) => {
						const year = new Date(curr.publishDate).getFullYear().toString();
						prev[year]?.push(curr) || (prev[year] = [curr]);
						return prev;
					}, {} as Movie['reviewByYears']),
				};
				return temp;
			})
			.reduce((prev, curr, i) => {
				prev[curr.movieId] = curr;
				return prev;
			}, {} as Data);
	} else {
		console.log('FALSE');
		return {} as Data;
	}
};

export default Movies;
