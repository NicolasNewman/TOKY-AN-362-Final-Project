import { Actor } from 'apify';
import { parseReviews } from './parseReviews';
import { Review, writeJSON, raw } from '@ghibli-analysis/shared';
import { translateText } from './translateReviews';

const reviews: Review[] = raw as Review[];

const parseMovie = async (id: string) => {
	let parsedReviews: false | Review[] = false;
	while (!parsedReviews) {
		parsedReviews = await parseReviews(id);
	}
	reviews.push(...parsedReviews);
};

(async () => {
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
	await translateText();
	await Actor.exit();
})();
