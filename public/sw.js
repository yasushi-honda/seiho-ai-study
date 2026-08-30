// PWA撤回に伴うキルスイッチ（2026-08-30）。
//
// 旧@vite-pwa/astroが登録したWorkbox service workerは、既にインストール
// 済みの端末では"/seiho-ai-study/"へのnavigationを引き続き横取りし、
// 古いprecache済みHTMLを返し続ける。単純にPWA統合を取り除いただけでは、
// 新しいページ（クリーンアップscript入り）自体が届かず、旧SWが永久に
// 居座ってしまう。
//
// この対策として、旧SWと同じスコープ・同じファイル名(sw.js)にこの
// 自己破壊用SWを配置する。Workboxのregistration（autoUpdate設定）が
// 定期的にこのファイルをバイト比較し、内容が変わっていることを検知すると
// このSWとしてインストール・有効化され、有効化と同時に本サイトの
// precacheキャッシュのみを削除して自分自身を登録解除、開いている
// 全タブをリロードする。
//
// 新規訪問者（旧SW未登録）にとってはこのファイルが読み込まれることは
// なく、影響はない。
//
// キャッシュ名の絞り込みについて: GitHub Pages上の同一オリジン
// （yasushi-honda.github.io）は複数プロジェクトサイトで共有されており、
// Cache Storageもオリジン単位で共有される。Workboxのprecacheキャッシュ名
// はデフォルトでスコープURLを含む形式（例:
// workbox-precache-v2-https://yasushi-honda.github.io/seiho-ai-study/）
// のため、本サイトのscope文字列を含むキャッシュのみを対象にする。
// google-fonts系キャッシュ（cacheNameを固定文字列で指定していたため
// 他プロジェクトと衝突しうる）は削除対象から除外する。放置しても
// 実害は次回フォント取得時の再フェッチのみで、他プロジェクトの
// オフラインキャッシュを壊すリスクの方が大きいため。
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const scopeUrl = self.registration.scope;
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('workbox-precache') && key.includes(scopeUrl))
          .map((key) => caches.delete(key))
      );
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsList) {
        client.navigate(client.url);
      }
    })()
  );
});
