import express from 'express';
import { scrapeSubredditPosts } from './reddit/subreddit.js';
import { scrapeUserActivity } from './reddit/user.js';

const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Route to display the home page with form
app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle scraping request and display results
app.post('/scrape', async (req, res) => {
    const { inputType, subreddit, postUrl, username } = req.body;

    try {
        let results;
        if (inputType === 'subreddit') {
            results = await scrapeSubredditPosts(subreddit);
        }  else if (inputType === 'user') {
            results = await scrapeUserActivity(username);
        }
        // console.log(results);
        res.render('results', { results, inputType });
    } catch (error) {
        res.status(500).send(`Error scraping: ${error.message}`);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
