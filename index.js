const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/react', async (req, res) => {
  const { post_link, reaction_type, fb_cookie } = req.body;

  try {
    const response = await axios.get('https://flikers.onrender.com/api/react', {
      params: {
        link: post_link,
        type: reaction_type,
        cookie: fb_cookie,
      },
    });

    const responseData = response.data;

    if (responseData.status === 200) {
      res.json({ message: "Reaction sent successfully!" });
    } else {
      res.json({ error: "Failed to send reaction. Response: " + JSON.stringify(responseData) });
    }
  } catch (error) {
    res.json({ error: "Error: " + error.message });
  }
});

app.get('/link-preview', async (req, res) => {
  const { url } = req.query;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const getMetaTag = (name) => $(`meta[property='${name}']`).attr('content') || $(`meta[name='${name}']`).attr('content');

    const previewData = {
      title: getMetaTag('og:title') || $('title').text(),
      description: getMetaTag('og:description') || '',
      image: getMetaTag('og:image') || '',
    };

    res.json(previewData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch link preview' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
