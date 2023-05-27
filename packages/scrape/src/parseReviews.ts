import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';
import { Review } from '@ghibli-analysis/shared';

const increment = (url: string, amnt: number) => {
	const str = url.match(/(.*offset=)([0-9]*)/);
	return `${str?.[1]}${parseInt(str?.[2] ?? '0') + amnt}`;
};

const parseReviews = async (id: string) => {
	const reviewList: Review[] = [];
	const crawler = new PuppeteerCrawler({
		async requestHandler({ request, page, enqueueLinks, crawler }) {
			console.log(`Processing ${page.url()}`);
			const dlog = (msg: any) => console.log(msg.toString());

			await page.exposeFunction('dlog', dlog);
			await new Promise((r) => setTimeout(r, 100));
			if ((await page.content()).includes('まだレビューは投稿されていません')) {
				return;
			}
			await page.waitForSelector('section.riff-mr-3.riff-ml-3 ul');

			const buttons = await page.$$(
				'section.riff-mr-3.riff-ml-3 ul div.riff-flex > div.riff-flex > button.riff-Clickable__root',
			);
			for (const button of buttons) {
				const btnText = await (await button.getProperty('innerText')).jsonValue();
				if (btnText.includes('表示する')) {
					await button.click();
				}
			}

			await new Promise((r) => setTimeout(r, 1000));
			await page.waitForSelector('section.riff-mr-3.riff-ml-3 ul');
			const reviews = await page.$$eval(
				'section.riff-mr-3.riff-ml-3 ul li',
				($$elems, movieId) => {
					const reviews: Review[] = [];

					for (const $elem of $$elems) {
						const $rating = $elem.children.item(0);
						const $title = $elem.children.item(1);
						const $body = $elem.children.item(2);
						const $extra = $elem.children.item(3);
						if (!$rating || !$title || !$body) {
							dlog('MALFORMED REVIEW');
							return;
						}

						if ($body.textContent?.replace(/\n/g, '')?.includes('表示する')) {
							dlog('SPOILER IN REVIEW!');
							continue;
						}
						reviews.push({
							title: $title.lastChild?.textContent || '',
							review: $body.textContent?.replace(/\n/g, '') || '',
							rating: parseFloat(
								$rating.querySelector('span.riff-text-medium.riff-font-bold.riff-leading-none')
									?.textContent || '',
							),
							reviewer:
								$rating.querySelector(
									'span.riff-Text__root--lineClamp1.riff-flex.riff-items-center.riff-text-small',
								)?.textContent || '',
							helpful: $extra?.querySelector('button span')?.textContent || '',
							publishDate: $rating.querySelector('time')?.getAttribute('datetime') || '',
							movieId: parseInt(movieId),
						});
					}
					return reviews;
				},
				id,
			);

			if (reviews) {
				reviewList.push(...reviews);
				console.log(`${reviews.length} new reviews processed`);
				await new Promise((r) => setTimeout(r, 100));
				await enqueueLinks({ urls: [increment(page.url(), 20)] });
			} else {
				console.log('SOMETHING VERY WRONG');
			}
		},
		// maxConcurrency: 4,
		requestHandlerTimeoutSecs: 600,
		navigationTimeoutSecs: 600,
		maxRequestRetries: 10,
	});

	try {
		await crawler.run([`https://movies.yahoo.co.jp/movie/${id}/review/?movieId=${id}&offset=0`]);
		return reviewList;
	} catch (e) {
		console.error(e);
		return false;
	}
};

export { parseReviews };
