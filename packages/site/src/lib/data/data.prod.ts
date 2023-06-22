import { Data, Movie, isBaseData } from '@ghibli-analysis/shared/dist/web';
import { getEntries } from '../object';

const Movies = await (async () => {
	const data = await (await fetch(`https://nicolasnewman.github.io/${window.PUBLIC_URL}/data.json`)).json();
	if (isBaseData(data)) {
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
		return {} as Data;
	}
});

export default Movies;
