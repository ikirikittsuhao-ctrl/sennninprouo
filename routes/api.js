import express from "express";
const router = express.Router();
import yts from "youtube-search-api";
import fetch from "node-fetch";

const API_HEALTH_CHECKER =
  "https://raw.githubusercontent.com/Minotaur-ZAOU/test/refs/heads/main/min-tube-api.json";
let apiListCache = [];

async function updateApiListCache() {
  try {
    const response = await fetch(API_HEALTH_CHECKER);
    if (response.ok) {
      const mainApiList = await response.json();
      if (Array.isArray(mainApiList) && mainApiList.length > 0) {
        apiListCache = mainApiList;
      }
    }
  } catch (err) {}
}
updateApiListCache();
setInterval(updateApiListCache, 1000 * 60 * 10);

function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
    ),
  ]);
}

router.get("/trending", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  try {
    const trendingSeeds = [
      "人気急上昇",
      "最新 ニュース",
      "Music Video Official",
      "ゲーム実況 人気",
      "話題の動画",
      "トレンド",
      "Breaking News Japan",
      "Top Hits",
      "いま話題",
    ];
    const seed1 = trendingSeeds[(page * 2) % trendingSeeds.length];
    const seed2 = trendingSeeds[(page * 2 + 1) % trendingSeeds.length];

    const [res1, res2] = await Promise.all([
      yts.GetListByKeyword(seed1, false, 25),
      yts.GetListByKeyword(seed2, false, 25),
    ]);

    let combined = [...(res1.items || []), ...(res2.items || [])];
    const finalItems = [];
    const seenIdsServer = new Set();

    for (const item of combined) {
      if (item.type === "video" && !seenIdsServer.has(item.id)) {
        if (item.viewCountText) {
          seenIdsServer.add(item.id);
          finalItems.push(item);
        }
      }
    }
    res.json({ items: finalItems.sort(() => 0.5 - Math.random()) });
  } catch (err) {
    res.json({ items: [] });
  }
});

router.get("/search", async (req, res, next) => {
  const query = req.query.q;
  const page = req.query.page || 0;
  if (!query) return res.status(400).json({ error: "Query required" });
  try {
    const results = await yts.GetListByKeyword(query, false, 20, page);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/recommendations", async (req, res) => {
  const { title, channel, id } = req.query;
  try {
    const cleanKwd = title
      .replace(/[【】「」()!！?？\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = cleanKwd.split(" ").filter((w) => w.length >= 2);
    const mainTopic = words.length > 0 ? words.slice(0, 2).join(" ") : cleanKwd;

    const [topicRes, channelRes, relatedRes] = await Promise.all([
      yts.GetListByKeyword(`${mainTopic}`, false, 12),
      yts.GetListByKeyword(`${channel}`, false, 8),
      yts.GetListByKeyword(`${mainTopic} 関連`, false, 8),
    ]);

    let rawList = [
      ...(topicRes.items || []),
      ...(channelRes.items || []),
      ...(relatedRes.items || []),
    ];
    const seenIds = new Set([id]);
    const seenNormalizedTitles = new Set();
    const finalItems = [];

    for (const item of rawList) {
      if (!item.id || item.type !== "video") continue;
      if (seenIds.has(item.id)) continue;

      const normalized = item.title
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/official|lyrics|mv|musicvideo|video|公式|実況|解説/g, "");
      const titleSig = normalized.substring(0, 12);
      if (seenNormalizedTitles.has(titleSig)) continue;

      seenIds.add(item.id);
      seenNormalizedTitles.add(titleSig);
      finalItems.push(item);
      if (finalItems.length >= 24) break;
    }
    res.json({ items: finalItems.sort(() => 0.5 - Math.random()) });
  } catch (err) {
    res.json({ items: [] });
  }
});

router.get("/comments/:videoId", async (req, res) => {
  const videoId = req.params.videoId;
  const continuation = req.query.continuation || "";
  for (const apiBase of apiListCache) {
    try {
      const url = `${apiBase}/api/comments/${videoId}${
        continuation ? "?continuation=" + continuation : ""
      }`;
      const cRes = await fetchWithTimeout(url, {}, 3000);
      if (cRes.ok) {
        return res.json(await cRes.json());
      }
    } catch (e) {
      continue;
    }
  }
  res.status(500).json({ error: "Failed to fetch comments" });
});

router.get("/channel", async (req, res) => {
  const channelName = req.query.name || req.query.id;
  const page = parseInt(req.query.page) || 0;
  if (!channelName) return res.status(400).json({ error: "name required" });
  try {
    const results = await yts.GetListByKeyword(channelName, false, 20);
    const videos = (results.items || []).filter(
      (item) => item.type === "video"
    );
    res.json({ channelName, videos, nextPage: page + 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/save-history", express.json(), (req, res) => {
  res.json({ success: true });
});

export { router, apiListCache, fetchWithTimeout };
