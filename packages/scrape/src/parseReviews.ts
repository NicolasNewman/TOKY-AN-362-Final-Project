import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';
import { Review } from '@ghibli-analysis/shared';

const increment = (url: string, amnt: number) => {
	const str = url.match(/(.*offset=)([0-9]*)/);
	return `${str?.[1]}${parseInt(str?.[2] ?? '0') + amnt}`;
};

let EXPORT: Review[] = [];
const parseReviews = async (id: string) => {
	const prevRead: number[] = [];
	EXPORT = [];
	const crawler = new PuppeteerCrawler({
		async requestHandler({ request, page, enqueueLinks, crawler }) {
			console.log(`Processing ${page.url()}`);
			const dlog = (msg: any) => console.log(msg.toString());

			if (prevRead.length >= 2 && prevRead[0] !== prevRead[1]) {
				return;
			}

			await page.exposeFunction('dlog', dlog);
			await page.exposeFunction('increment', increment);
			await page.waitForSelector('section.riff-mr-3.riff-ml-3 ul');

			let i = 1;
			// Note: while loop with querySelect instead of querySelectAll
			// to prevent future handles from becoming invalid after clicking.
			let button = await page.$(
				`section.riff-mr-3.riff-ml-3 ul li button.riff-Clickable__root:nth-of-type(${i++})`,
			);
			while (button) {
				const btnText = await (await button.getProperty('innerText')).jsonValue();
				if (btnText.includes('表示する')) {
					await button.click();
					await page.waitForNetworkIdle();
				}
				button = await page.$(
					`section.riff-mr-3.riff-ml-3 ul li button.riff-Clickable__root:nth-of-type(${i})`,
				);
			}

			await page.waitForNetworkIdle();

			const reviews = await page.$$eval(
				'section.riff-mr-3.riff-ml-3 ul li',
				($$elems, movieId) => {
					const reviews: Review[] = [];

					$$elems.forEach(($elem) => {
						const $rating = $elem.children.item(0);
						const $title = $elem.children.item(1);
						const $body = $elem.children.item(2);
						const $extra = $elem.children.item(3);
						if (!$rating || !$title || !$body) {
							dlog('MALFORMED REVIEW');
							return;
						}

						reviews.push({
							title: $title.lastChild?.textContent || '',
							review: $body.textContent?.replace(/\n/g, '') || '',
							rating:
								$rating.querySelector('span.riff-text-medium.riff-font-bold.riff-leading-none')
									?.textContent || '',
							reviewer:
								$rating.querySelector(
									'span.riff-Text__root--lineClamp1.riff-flex.riff-items-center.riff-text-small',
								)?.textContent || '',
							helpful: $extra?.querySelector('button span')?.textContent || '',
							publishDate: $rating.querySelector('time')?.getAttribute('datetime') || '',
							movieId,
						});
					});

					return reviews;
				},
				id,
			);

			EXPORT.push(...reviews);
			prevRead.push(reviews.length);
			if (prevRead.length >= 3) prevRead.shift();
			console.log(`${reviews.length} new reviews processed`);
			await new Promise((r) => setTimeout(r, 100));
			await enqueueLinks({ urls: [increment(page.url(), reviews.length)] });
		},
		// maxConcurrency: 4,
		requestHandlerTimeoutSecs: 600,
		navigationTimeoutSecs: 600,
		maxRequestRetries: 10,
	});

	await crawler.run([`https://movies.yahoo.co.jp/movie/${id}/review/?movieId=${id}&offset=0`]);
};

export { parseReviews, EXPORT };
