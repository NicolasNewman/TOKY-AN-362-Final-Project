import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';
import { Review } from '@ghibli-analysis/shared';
import { download } from './lib';

const parsePoster = async (id: string) => {
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

			const img = (
				await page.$eval('div.lazyImage img', ($elem) => {
					return $elem.src;
				})
			).replace(/\?w=.*/g, '?w=512&fmt=jpg&q=100');
			await download(img, `../site/src/assets/${id}.jpg`);
			console.log(img);
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

export { parsePoster };
