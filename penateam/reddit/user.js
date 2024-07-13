import { chromium } from 'playwright';
import cheerio from 'cheerio';

export async function scrapeUserActivity(username) {
    const url = `https://old.reddit.com/user/${username}/`;
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'basic reddit'
    });
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        const content = await page.content();
        const $ = cheerio.load(content);

        const activities = [];
        console.log($.html());
        $('div.thing').each((index, element) => {
            const title = $(element).find('a.title').text();
            const timestamp = $(element).find('time').attr('datetime');
            const postUrl = $(element).find('a.title').attr('href');
            const commentText = $(element).find('div.md').text();

            if (title) {
                // This is a post
                activities.push({ type: 'post', title, timestamp, postUrl, author: username });
            } else if (commentText) {
                // This is a comment
                activities.push({ type: 'comment', commentText, timestamp, author: username });
            }
        });

        // Log the extracted activities for debugging
        console.log('Extracted Activities:', activities);

        return activities;
    } catch (error) {
        console.error(`Error scraping user activity: ${error.message}`);
        throw error;
    } finally {
        await browser.close();
    }
}
