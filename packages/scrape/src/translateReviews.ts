import { v2 } from '@google-cloud/translate';
import { raw, Review, writeJSON } from '@ghibli-analysis/shared';

const TARGET = 'en';
const translate = new v2.Translate();
const data: Review[] = raw as Review[];

export async function translateText() {
	const nReviews = data.length;
	let i = 0;
	for (const review of data) {
		i++;
		if (!review.reviewEN) {
			const [translations] = await translate.translate(review.review, TARGET);
			review.reviewEN = translations;
		}
		if (i % 100 === 0) {
			console.log(`${i}/${nReviews} (${((i / nReviews) * 100).toFixed(2)}%)`);
			await writeJSON(data);
		}
	}
	await writeJSON(data);
}
