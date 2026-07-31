# VNLayer開発/ビルド/CI共通コンテナ。
#
# 想定用途:
#   1. 開発時(WSL2/Linux等): このイメージに入り、npm run menu 等の
#      scripts/以下のCLI一式(list-tags, compile-story, watch-ink, new-tag等)を
#      vendor/inkjs(file:依存)込みで動かす。
#        docker build -t vnlayer-dev .
#        docker run -it --rm -v "$(pwd):/app" vnlayer-dev npm run menu
#   2. CI(GitHub Actions)/リリースビルド時: 既定CMDの `node scripts/build.js` を
#      実行し、dist/(tscの型定義+JS出力 と esbuildの単体バンドル
#      dist/vnlayer.js)を生成する。
#
# ベースイメージにbookworm-slim(Debian系glibc)を選んでいるのは、esbuildが
# プラットフォーム別のネイティブバイナリを使うため、alpine(musl libc)より
# 互換性の相性が良いため。
FROM node:20-bookworm-slim

WORKDIR /app

# 依存解決に必要な最小限のファイルだけ先にコピーし、Dockerのレイヤーキャッシュを
# 効かせる(ソース本体だけ変更した場合にnpm installを再実行させないため)。
# vendor/inkjs は package.json の "inkjs": "file:./vendor/inkjs" 依存の実体
# そのものなので、npm install より前に存在している必要がある。
COPY package.json package-lock.json* ./
COPY vendor ./vendor

RUN npm install

# 残りのソース一式をコピー(.dockerignoreでnode_modules/dist/.git等は除外済み)。
COPY . .

# 既定はCI向けのフルビルド。開発時はCMDを上書きして
# (例: docker run -it --rm -v "$(pwd):/app" vnlayer-dev npm run menu や
#      docker run -it --rm -v "$(pwd):/app" vnlayer-dev bash)、
# 対話式メニュー・watch-ink・シェル等を使う想定。
CMD ["node", "scripts/build.js"]

