import { chromium } from 'playwright';
import cheerio from 'cheerio';

export async function scrapeSubredditPosts(subreddit) {
    const baseUrl = 'https://old.reddit.com';
    const url = `${baseUrl}/r/${subreddit}/`;
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'reddit_penateam_service'
    });
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        const content = await page.content();
        const $ = cheerio.load(content);
        const posts = [];

        $('div.thing').each((index, element) => {
            if (!$(element).find('span.promoted-tag').length) {
                const title = $(element).find('a.title').text();

                const author = $(element).find('a.author').text();
                const timestamp = $(element).find('time').attr('datetime');
                const postUrl = baseUrl + $(element).attr('data-permalink');
                posts.push({title, author, timestamp, postUrl});
            }
        });

        return posts;
    } catch (error) {
        console.error(`Error scraping subreddit: ${error.message}`);
        throw error;
    } finally {
        await browser.close();
    }
}
