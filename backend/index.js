function extractQueryType(input) {
  if (!input) return null;

  // Channel ID (starts with UC)
  if (input.startsWith('UC')) return { type: 'channelId', value: input };

  // YouTube URL
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(channel|c|user|@)([^/?]+)/;
  const match = input.match(urlRegex);
  if (match) {
    const type = match[1];
    const value = match[2];
    if (type === 'channel') return { type: 'channelId', value };
    if (type === '@') return { type: 'handle', value };
    return { type: 'name', value };
  }

  // Handle with @
  if (input.startsWith('@')) return { type: 'handle', value: input.substring(1) };

  // Fallback to search
  return { type: 'name', value: input };
}

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// console.log('Loaded YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? process.env.YOUTUBE_API_KEY.slice(0, 4) + '...' : 'NOT FOUND');

const app = express();
app.use(cors());
const PORT = 5000;

app.get('/api/channel', async (req, res) => {
  const query = req.query.query;

  if (!query) return res.status(400).json({ error: 'Missing channel query' });

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const searchRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          q: query,
          part: 'snippet',
          type: 'channel',
          maxResults: 1,
          key: apiKey,
        },
      }
    );

    const items = searchRes.data.items;
    if (!items.length) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channelId = items[0].snippet.channelId;

    const channelRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels`,
      {
        params: {
          id: channelId,
          part: 'snippet,statistics,brandingSettings,contentDetails,topicDetails',
          key: apiKey,
        },
      }
    );

    res.json({
      data: channelRes.data.items[0],
    });
  } catch (err) {
    console.error('YouTube API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

app.get('/api/videos', async (req, res) => {
  const { channelId, pageToken } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!channelId) {
    return res.status(400).json({ error: 'Missing channelId' });
  }

  try {
    const apiURL = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10${pageToken ? `&pageToken=${pageToken}` : ''}`;

    const response = await axios.get(apiURL);
    res.json(response.data);
  } catch (err) {
    console.error('Failed to fetch videos:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch videos', details: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
