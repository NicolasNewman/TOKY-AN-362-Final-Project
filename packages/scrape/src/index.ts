import { Actor } from 'apify';
import { parseReviews, EXPORT } from './parseReviews';
import { Review, writeJSON } from '@ghibli-analysis/shared';
import { translateText } from './translateReviews';

const reviews: Review[] = [];

const parseMovie = async (id: string) => {
	await parseReviews(id);
	reviews.push(...EXPORT);
};

(async () => {
	// await writeCSV('w', 'movieId,publishDate,helpful,reviewer,rating,title,review\n');
	await Actor.init();
	await parseMovie('163027'); // Spirited Away
	await writeJSON(reviews);
	await parseMovie('159561'); // Mononoke
	await writeJSON(reviews);
	await parseMovie('327529'); // Ponyo
	await writeJSON(reviews);
	await parseMovie('335800'); // Arriety
	await writeJSON(reviews);
	await parseMovie('240799'); // Howl
	await writeJSON(reviews);
	await Actor.exit();
	await translateText();
})();
