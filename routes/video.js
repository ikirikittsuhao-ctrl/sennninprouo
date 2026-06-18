import express from "express";
const router = express.Router();
import fetch from "node-fetch";
import yts from "youtube-search-api";
import { apiListCache, fetchWithTimeout } from "./api.js";

const videoCache = new Map();
const RAPID_API_HOST = 'ytstream-download-youtube-videos.p.rapidapi.com';
const keys = [
  process.env.RAPIDAPI_KEY_1 || '69e2995a79mshcb657184ba6731cp16f684jsn32054a070ba5',
  process.env.RAPIDAPI_KEY_2 || 'ece95806fdmshe322f47bce30060p1c3411jsn41a3d4820039',
  process.env.RAPIDAPI_KEY_3 || '41c9265bc6msha0fa7dfc1a63eabp18bf7cjsne6ef10b79b38'
];

setInterval(() => {
  const now = Date.now();
  for (const [videoId, cachedItem] of videoCache.entries()) {
    if (cachedItem.expiry < now) videoCache.delete(videoId);
  }
}, 300000);

router.get("/video/:id", async (req, res, next) => {
  const videoId = req.params.id;
  try {
    let videoData = null;
    let commentsData = { commentCount: 0, comments: [] };
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;

    for (const apiBase of apiListCache) {
      try {
        videoData = await Promise.any([
          fetchWithTimeout(`${apiBase}/api/video/${videoId}`, {}, 5000)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => data.stream_url ? data : Promise.reject()),
          fetchWithTimeout(`${protocol}://${host}/sia-dl/${videoId}`, {}, 5000)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => data.stream_url ? data : Promise.reject()),
          new Promise((resolve, reject) => {
            setTimeout(() => {
              fetchWithTimeout(`${protocol}://${host}/ai-fetch/${videoId}`, {}, 5000)
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => data.stream_url ? resolve(data) : reject())
                .catch(reject);
            }, 2000);
          })
        ]);
        try {
          const cRes = await fetchWithTimeout(`${apiBase}/api/comments/${videoId}`, {}, 3000);
          if (cRes.ok) commentsData = await cRes.json();
        } catch (e) {}
        break;
      } catch (e) {
        try {
          const rapidRes = await fetchWithTimeout(`${protocol}://${host}/rapid/${videoId}`, {}, 5000);
          if (rapidRes.ok) {
            const rapidData = await rapidRes.json();
            if (rapidData.stream_url) {
              videoData = rapidData;
              try {
                const cRes = await fetchWithTimeout(`${apiBase}/api/comments/${videoId}`, {}, 3000);
                if (cRes.ok) commentsData = await cRes.json();
              } catch (e) {}
              break; 
            }
          }
        } catch (rapidErr) {}
        continue;
      }
    }

    if (!videoData) {
      videoData = { videoTitle: "再生できない動画", stream_url: "youtube-nocookie" };
    }
    res.json({ videoData, commentsData });
  } catch (err) { next(err); }
});

router.get('/rapid/:id', async (req, res) => {
  const videoId = req.params.id;
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];
  const url = `https://${RAPID_API_HOST}/dl?id=${videoId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': selectedKey,
        'x-rapidapi-host': RAPID_API_HOST,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data.status !== "OK") return res.status(400).json({ error: "Failed" });

    let channelImageUrl = data.channelThumbnail?.[0]?.url || data.author?.thumbnails?.[0]?.url;
    if (!channelImageUrl) {
      channelImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.channelTitle || 'Youtube Channel')}&background=random&color=fff&size=128`;
    }

    const highResStream = data.adaptiveFormats?.find(f => f.qualityLabel === '1080p') || data.adaptiveFormats?.[0];
    const audioStream = data.adaptiveFormats?.find(f => f.mimeType.includes('audio')) || data.adaptiveFormats?.[data.adaptiveFormats?.length - 1];

    res.json({
      stream_url: data.formats?.[0]?.url || "",
      highstreamUrl: highResStream?.url || "",
      audioUrl: audioStream?.url || "",
      videoId: data.id,
      channelId: data.channelId,
      channelName: data.channelTitle,
      channelImage: channelImageUrl, 
      videoTitle: data.title,
      videoDes: data.description,
      videoViews: parseInt(data.viewCount) || 0,
      likeCount: data.likeCount || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Error" });
  }
});

router.get('/streams', (req, res) => {
  res.json(Object.fromEntries(videoCache));
});

router.get('/360/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  const now = Date.now();
  const cachedItem = videoCache.get(videoId);
  if (cachedItem && cachedItem.expiry > now) {
    return res.type('text/plain').send(cachedItem.url);
  }
  const _0x1a=[0x79,0x85,0x85,0x81,0x84,0x4b,0x40,0x40,0x78,0x76,0x85,0x7d,0x72,0x85,0x76,0x3f,0x75,0x76,0x87,0x40,0x72,0x81,0x7a,0x40,0x85,0x80,0x80,0x7d,0x84,0x40,0x8a,0x80,0x86,0x85,0x86,0x73,0x76,0x3e,0x7d,0x7a,0x87,0x76,0x3e,0x75,0x80,0x88,0x7f,0x7d,0x80,0x72,0x75,0x76,0x83,0x50,0x86,0x83,0x7d,0x4e,0x79,0x85,0x85,0x81,0x84,0x36,0x44,0x52,0x36,0x43,0x57,0x36,0x43,0x57,0x88,0x88,0x88,0x3f,0x8a,0x80,0x86,0x85,0x86,0x73,0x76,0x3f,0x74,0x80,0x7e,0x36,0x43,0x57,0x88,0x72,0x85,0x74,0x79,0x36,0x44,0x57,0x07,0x36,0x44,0x55];
  const _0x2b=[0x37,0x77,0x80,0x83,0x7e,0x72,0x85,0x5a,0x75,0x4e,0x43];
  const _0x11=['\x6d\x61\x70','\x66\x72\x6f\x6d\x43\x68\x61\x72\x43\x6f\x64\x65','\x6a\x6f\x69\x6e'];
  const _0x4d=_0x1a[_0x11[0]](_0x5e=>String[_0x11[1]](_0x5e-0x11))[_0x11[2]]('');
  const _0x5e=_0x2b[_0x11[0]](_0x6f=>String[_0x11[1]](_0x6f-0x11))[_0x11[2]]('');
  const targetUrl=_0x4d+videoId+_0x5e;
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"},
      redirect: 'follow'
    });
    const finalUrl = response.url;
    videoCache.set(videoId, {url: finalUrl, expiry: now+60000});
    res.type('text/plain').send(finalUrl);
  } catch(error) {
    res.status(500).send('Internal Server Error');
  }
});

router.get('/sia-dl/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  const protocol = req.protocol;
  const host = req.get('host');
  try {
    const metadataUrl = `https://siawaseok.duckdns.org/api/video2/${videoId}?depth=1`;
    const metaResponse = await fetch(metadataUrl);
    if (!metaResponse.ok) throw new Error('Metadata error');
    const data = await metaResponse.json();

    const streamResponse = await fetch(`${protocol}://${host}/360/${videoId}`);
    const rawStreamUrl = streamResponse.ok ? await streamResponse.text() : "";
    const parseCount = (str) => (!str ? 0 : parseInt(str.replace(/[^0-9]/g, '')) || 0);

    res.json({
      stream_url: rawStreamUrl.trim(),
      highstreamUrl: rawStreamUrl.trim(), 
      audioUrl: "", 
      videoId: data.id,
      channelId: data.author?.id || "",
      channelName: data.author?.name || "",
      channelImage: data.author?.thumbnail || "",
      videoTitle: data.title,
      videoDes: data.description?.text || "",
      videoViews: parseCount(data.views || data.extended_stats?.views_original),
      likeCount: parseCount(data.likes)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/ai-fetch/:videoId', async (req, res) => {
  const _0x5a1e = ['\x6c\x69\x6b\x65\x43\x6f\x75\x6e\x74', '\x76\x69\x64\x65\x6f\x44\x65\x73', '\x67\x65\x74', '\x68\x6f\x73\x74', '\x61\x62\x6f\x72\x74', '\x74\x65\x78\x74', '\x70\x72\x6f\x74\x6f\x63\x6f\x6c', '\x6a\x73\x6f\x6e', '\x76\x69\x64\x65\x6f\x49\x64', '\x65\x72\x72\x6f\x72', '\x61\x69\x2d\x66\x65\x74\x63\x68', 'https://api.aijimy.com/get?code=get-youtube-videodata&text=', '\x73\x74\x61\x74\x75\x73'];
  const _0x42f1 = function(a, b) { return _0x5a1e[a - 0x0]; };
  const videoId = req.params[_0x42f1('0x8')];
  const _0x1f22a1 = (function(a) { return a.split('').reverse().join(''); })('\x3d\x74\x78\x65\x74\x26\x61\x74\x61\x64\x6f\x65\x64\x69\x76\x2d\x65\x62\x75\x74\x75\x6f\x79\x2d\x74\x65\x67\x3d\x65\x64\x6f\x63\x3f\x74\x65\x67\x2f\x6d\x6f\x63\x2e\x79\x6d\x69\x6a\x69\x61\x2e\x69\x70\x61\x2f\x2f\x3a\x73\x70\x74\x74\x68');
  
  try {
    const response = await fetch(_0x1f22a1 + videoId);
    const textData = await response[_0x42f1('0x5')]();
    const descriptionMatch = textData.match(/概要欄:\s*([\s\S]*?)\s*公開日:/);
    const viewsMatch = textData.match(/再生回数:\s*(\d+)/);
    const likesMatch = textData.match(/高評価数:\s*(\d+)/);

    const videoDes = descriptionMatch ? descriptionMatch[1].trim() : "";
    const videoViews = viewsMatch ? parseInt(viewsMatch[1]) : 0;
    const likeCount = likesMatch ? parseInt(likesMatch[1]) : 0;

    let videoTitle = videoId, channelName = videoId, found = false;

    try {
      const noEmbedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (noEmbedRes.ok) {
        const noEmbedData = await noEmbedRes.json();
        if (noEmbedData && !noEmbedData.error) {
          videoTitle = noEmbedData.title || videoId;
          channelName = noEmbedData.author_name || videoId;
          found = true;
        }
      }
    } catch (e) {}

    if (!found) {
      try {
        let page = 0;
        while (page < 10 && !found) {
          const searchResults = await yts.GetListByKeyword(videoId, false, 20, page);
          if (searchResults && searchResults.items && searchResults.items.length > 0) {
            const matchedVideo = searchResults.items.find(item => item.id === videoId);
            if (matchedVideo) {
              videoTitle = matchedVideo.title || videoId;
              channelName = matchedVideo.author?.name || videoId;
              found = true;
            }
          } else { break; }
          page++;
        }
      } catch (e) {}
    }

    const protocol = req[_0x42f1('0x6')];
    const host = req[_0x42f1('0x2')](_0x42f1('0x3'));
    let finalStreamUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller[_0x42f1('0x4')](), 3000); 
      const internalRes = await fetch(`${protocol}://${host}/360/${videoId}`, { signal: controller.signal });
      if (internalRes.ok) {
        const rawText = await internalRes[_0x42f1('0x5')]();
        if (rawText && rawText.trim() !== "") finalStreamUrl = rawText.trim();
      }
      clearTimeout(timeoutId);
    } catch (err) {}

    res[_0x42f1('0x7')]({
      stream_url: finalStreamUrl,
      highstreamUrl: finalStreamUrl,
      audioUrl: finalStreamUrl,
      videoId: videoId,
      channelId: "", 
      channelName: channelName, 
      channelImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=random&color=fff&size=128`,
      videoTitle: videoTitle, 
      videoDes: videoDes,
      videoViews: videoViews,
      likeCount: likeCount
    });
  } catch (error) {
    res[_0x42f1('0xc')](500)[_0x42f1('0x7')]({ error: "Failed" });
  }
});

export default router;
