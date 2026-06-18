📁 your-project-root/
│
├── 📁 public/                  # 静的フロントエンドファイル
│   │
│   ├── 📁 css/
│   │   └── 📄 style.css        # YouTube公式風デザイン ＆ アニメーション ＆ フォント設定
│   │
│   ├── 📁 js/
│   │   ├── 📄 storage.js      # 履歴、お気に入り、後で見る、プレイリストのローカルストレージ操作ロジック
│   │   └── 📄 layout.js       # header/sidebarの非同期fetch読み込み ＆ サイドバー開閉トグル制御
│   │
│   ├── 📁 components/          # jsからfetchして埋め込まれる共通パーツ
│   │   ├── 📄 header.html     # ロゴ、検索バー、メニューボタン（開閉用トリガー）
│   │   └── 📄 sidebar.html    # ホーム、ライブラリ、各種リスト切り替えボタン
│   │
│   ├── 📄 home.html            # メイン画面（トレンド動画一覧、検索結果、各種プレイリスト一覧表示を兼用）
│   └── 📄 watch.html           # 再生画面（複数ストリーム切り替えプルダウン、各種保存機能、関連動画、コメント）
│
├── 📄 server.js (または main.py) # サーバー側メイン処理（/video/:id, /api/trending などのAPIエンドポイント）
└── 📄 package.json             # 依存ライブラリ管理（Node.jsの場合）
