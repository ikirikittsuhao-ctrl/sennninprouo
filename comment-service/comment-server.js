import express from 'express';
import { Innertube } from 'youtubei.js';

const app = express();

const yt = await Innertube.create();

app.get('/api/comments/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const comments = await yt.getComments(videoId);

    const result = comments.contents.map((thread) => {
      const comment = thread.comment;

      return {
        comment: comment?.content?.toString() ?? '',
        authorName: comment?.author?.name ?? '',

        // コメント投稿者のチャンネルID
        authorChannelId:
          comment?.author?.channel_id ??
          comment?.author?.id ??
          null,

        // チャンネルアイコン
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

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
