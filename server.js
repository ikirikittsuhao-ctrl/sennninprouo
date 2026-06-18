const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use(async (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/video") || req.path === "/") {
    if (!req.cookies || req.cookies.humanVerified !== "true") {
      const pages = [
        'https://raw.githubusercontent.com/mino-hobby-pro/memo/refs/heads/main/min-tube-pro-main-loading.txt',
        'https://raw.githubusercontent.com/mino-hobby-pro/memo/refs/heads/main/min-tube-pro-sub-roading-like-command-loader-local.txt',
        'https://raw.githubusercontent.com/mino-hobby-pro/memo/refs/heads/main/google.txt',
        'https://raw.githubusercontent.com/mino-hobby-pro/memo/refs/heads/main/history.html.txt',
        'https://raw.githubusercontent.com/mino-hobby-pro/memo/refs/heads/main/gisou/chapcha.html',
        'https://raw.githubusercontent.com/mino-hobby-pro/memo/refs/heads/main/gisou/easy.html',
        'https://raw.githubusercontent.com/mino-hobby-pro/MIN-Tube-Pro/refs/heads/main/gizo/Login.html',
        'https://github.com/mino-hobby-pro/MIN-Tube-Pro/raw/refs/heads/main/gizo/TU.html',
        'https://github.com/mino-hobby-pro/MIN-Tube-Pro/raw/refs/heads/main/gizo/classroom.html',
        'https://github.com/mino-hobby-pro/MIN-Tube-Pro/raw/refs/heads/main/gizo/kensaku.html',
        'https://github.com/mino-hobby-pro/MIN-Tube-Pro/raw/refs/heads/main/gizo/wikipedia.html'
      ];
      const randomPage = pages[Math.floor(Math.random() * pages.length)];
      try {
        const response = await fetch(randomPage);
        const htmlContent = await response.text();
        return res.render("robots", { content: htmlContent });
      } catch (err) {
        return res.render("robots", { content: "<p>Verification Required</p>" });
      }
    }
  }
  next();
});

const apiModule = require("./routes/api");
const videoModule = require("./routes/video");
const eduModule = require("./routes/edu");

app.use("/api", apiModule.router);
app.use("/", videoModule);
app.use("/", eduModule);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/nothing/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
