import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { Innertube } from "youtubei.js";

// ES Modules環境で __dirname を再現するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// youtubei.js の初期化
const yt = await Innertube.create();

import { router as apiModuleRouter } from "./routes/api.js";
import videoModule from "./routes/video.js";
import eduModule from "./routes/edu.js";

app.use("/api", apiModuleRouter);
app.use("/", videoModule);
app.use("/", eduModule);

// コメント取得用エンドポイント（統合版）
app.get("/api/comments/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const comments = await yt.getComments(videoId);

    const result = comments.contents.map((thread) => {
      const comment = thread.comment;
      return {
        comment: comment?.content?.toString() ?? '',
        authorName: comment?.author?.name ?? '',
        authorChannelId:
          comment?.author?.channel_id ??
          comment?.author?.id ??
          null,
        authorThumbnail:
          comment?.author?.thumbnails?.[0]?.url ??
          null
      };
    });

    res.json({
      success: true,
      count: result.length,
      comments: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error)
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/nothing/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
