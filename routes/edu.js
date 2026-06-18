import express from "express";
const router = express.Router();
import fetch from "node-fetch";

router.get('/scratch-edu/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const configUrl = 'https://raw.githubusercontent.com/siawaseok3/wakame/master/video_config.json';
    const configRes = await fetch(configUrl);
    const configJson = await configRes.json();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`https://www.youtubeeducation.com/embed/${id}${configJson.params}`);
  } catch (e) { res.status(500).send("Error"); }
});

router.get('/kahoot-edu/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const paramUrl = 'https://raw.githubusercontent.com/wista-api-project/auto/refs/heads/main/edu/1.txt';
    const response = await fetch(paramUrl);
    const params = await response.text(); 
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`https://www.youtubeeducation.com/embed/${id}${params}`);
  } catch (e) { res.status(500).send("Error"); }
});

router.get('/nocookie/:id', (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(`https://www.youtube-nocookie.com/embed/${req.params.id}?autoplay=1`);
});

export default router;
