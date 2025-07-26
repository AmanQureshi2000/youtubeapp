import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchChannelInfo = async () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    setChannelData(null);
    setVideos([]);
    setNextPageToken(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/channel?query=${searchInput}`);
      const data = res.data.data;
      setChannelData(data);
      fetchVideos(data.id);
    } catch (err) {
      console.error('Error fetching channel info:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (channelId, pageToken = null) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/videos`, {
        params: { channelId, pageToken },
      });
      setVideos(prev => [...prev, ...res.data.items]);
      setNextPageToken(res.data.nextPageToken);
    } catch (err) {
      console.error('Error fetching videos:', err.response?.data || err.message);
    }
  };

  return (
    <div style={{
      fontFamily: 'Segoe UI, sans-serif',
      padding: '30px 20px',
      maxWidth: '1100px',
      margin: 'auto',
      backgroundColor: '#f9f9f9',
      // minHeight: '100vh',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        🎬 YouTube Channel Info Finder
      </h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Enter channel name, @handle, ID, or URL"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            padding: '12px 16px',
            width: '60%',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginRight: '10px',
            fontSize: '16px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }}
        />
        <button
          onClick={fetchChannelInfo}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '6px',
            backgroundColor: '#ff0000',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255,0,0,0.3)',
            transition: 'background 0.3s ease',
          }}
        >
          🔍 Search
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading...</p>}

      {channelData && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img
              src={channelData.snippet.thumbnails.default.url}
              alt="Channel thumbnail"
              style={{ borderRadius: '50%', width: '80px', height: '80px' }}
            />
            <div>
              <h2 style={{ margin: 0 }}>{channelData.snippet.title}</h2>
              <p style={{ margin: '5px 0', color: '#666' }}>{channelData.snippet.description}</p>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
          }}>
            <p><strong>👥 Subscribers:</strong> {Number(channelData.statistics.subscriberCount).toLocaleString()}</p>
            <p><strong>📺 Videos:</strong> {Number(channelData.statistics.videoCount).toLocaleString()}</p>
            <p><strong>👁️ Total Views:</strong> {Number(channelData.statistics.viewCount).toLocaleString()}</p>
            <p><strong>🌍 Country:</strong> {channelData.snippet.country || 'N/A'}</p>
            {channelData.brandingSettings?.channel?.keywords && (
              <p><strong>🏷️ Keywords:</strong> {channelData.brandingSettings.channel.keywords}</p>
            )}
          </div>

          {channelData.brandingSettings?.image?.bannerExternalUrl && (
            <div style={{ marginTop: '20px' }}>
              <strong>🎨 Banner:</strong>
              <img
                src={channelData.brandingSettings.image.bannerExternalUrl}
                alt="Channel banner"
                style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }}
              />
            </div>
          )}

          {channelData.topicDetails?.topicCategories?.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <strong>📚 Topics:</strong>
              <ul style={{ paddingLeft: '20px' }}>
                {channelData.topicDetails.topicCategories.map((topic, i) => (
                  <li key={i}>
                    <a href={topic} target="_blank" rel="noreferrer">{topic}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {videos.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>📹 Recent Videos</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {videos.map(video => (
              <div
                key={video.id.videoId}
                style={{
                  borderRadius: '8px',
                  background: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                }}
              >
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id.videoId}`}
                    title={video.snippet.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  ></iframe>
                </div>
                <div style={{ padding: '10px 15px' }}>
                  <h4 style={{ margin: '10px 0', fontSize: '16px' }}>{video.snippet.title}</h4>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    {new Date(video.snippet.publishedAt).toLocaleDateString()}&nbsp;&nbsp;&nbsp;&nbsp;
                    {Math.floor((new Date()-new Date(video.snippet.publishedAt))/ (1000 * 60 * 60 * 24)) + ' days ago'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {nextPageToken && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                onClick={() => fetchVideos(channelData.id, nextPageToken)}
                style={{
                  padding: '12px 30px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,123,255,0.3)',
                }}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
