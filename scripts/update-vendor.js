#!/usr/bin/env node
// vendor/ 以下に固定しているInk関連パッケージ(inkjs, inkjs-compiler)を、
// npmレジストリの最新版で更新するスクリプト。
//
// 狙い: 普段のビルドは vendor/ 以下を直接参照する(package.jsonの
// "file:vendor/..." 依存)。これにより、将来npmレジストリやGitHub側で
// パッケージが消えたり壊れたりしても、このリポジトリの中だけで
// ビルドが完結する(このプロジェクトのgit履歴さえ残っていれば良い)。
//
// 「たまに更新する」運用を想定し、更新は明示的にこのスクリプトを
// 実行した時だけ行われる(npm installのたびに勝手に最新版が
// 入ってくることはない)。
//
// 使い方:
//   node VNLayer/scripts/update-vendor.js              → inkjs, inkjs-compiler 両方を更新
//   node VNLayer/scripts/update-vendor.js inkjs        → inkjsだけ更新
//   node VNLayer/scripts/update-vendor.js inkjs-compiler → inkjs-compilerだけ更新
//
// 更新後は必ず:
//   1. npm install(package.jsonのfile:参照を読み直させる)
//   2. npm run compile-story / npm run dev で問題なく動くか確認
//   3. 問題無ければ git add vendor/ package.json package-lock.json && git commit
// までやってから確定させること。

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

// 移動メモ(フェーズ2): scripts/ が VNLayer/scripts/ に1階層移動したので、
// __dirnameからリポジトリルートまでの相対距離が1つ増えている。
// 修正メモ: vendor/inkjsは「VNLayer自身が実行時に必要とする依存」なので、
// website側のvendor/ではなく、VNLayer/vendor/ に持つよう変更した
// (以前は path.join(__dirname, '..', '..') でwebsiteリポジトリのルートを見ていたが、
// それだとVNLayerを別リポジトリに切り出した瞬間に外部の「website」フォルダを
// 探しに行ってしまい、VNLayer単体では動かなくなる)。
// data/(シナリオ・Ink本文)は逆にVNLayerを埋め込む側のプロジェクトが持つべき
// コンテンツなので、compile-story.js等はこれまで通り埋め込み先のdata/を見に行く
// (vendor/inkjsだけがVNLayer自身のエンジン側の依存、という区別)。
const root = path.join(__dirname, "..");
const vendorDir = path.join(root, "vendor");

// vendorで管理するパッケージ一覧。
// 注意: "inkjs-compiler" という独立したnpmパッケージは存在しない。
// inkjsパッケージ自体が package.json の bin フィールドで
// "inkjs" と "inkjs-compiler" という2つのコマンド別名を登録しているだけで、
// 実体は同じ1つのパッケージ(inkjs)。なのでvendor対象は inkjs だけでよい。
const VENDORED_PACKAGES = ["inkjs"];

const requested = process.argv.slice(2);
const targets = requested.length > 0 ? requested : VENDORED_PACKAGES;

fs.mkdirSync(vendorDir, { recursive: true });

let hadError = false;

for (const pkgName of targets) {
  if (!VENDORED_PACKAGES.includes(pkgName)) {
    console.error(
      `"${pkgName}" はvendor管理対象ではありません(対象: ${VENDORED_PACKAGES.join(", ")})`,
    );
    hadError = true;
    continue;
  }

  console.log(`\n[update-vendor] ${pkgName} の最新版を取得しています...`);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vendor-update-"));

  try {
    // 本体のnode_modules/package-lock.jsonには一切触れず、
    // 一時ディレクトリに単独でインストールして取得する。
    execSync(
      `npm install ${pkgName}@latest --prefix "${tempDir}" --no-save --no-package-lock`,
      {
        stdio: "inherit",
      },
    );

    const src = path.join(tempDir, "node_modules", pkgName);
    if (!fs.existsSync(src)) {
      console.error(
        `[update-vendor] ${pkgName} の取得に失敗しました(${src} が見つかりません)`,
      );
      hadError = true;
      continue;
    }

    const dest = path.join(vendorDir, pkgName);
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(src, dest, { recursive: true });

    // inkjs(および将来vendorする他のパッケージ)が「zero dependency」を謳っていても、
    // 取得時に開発用ツール(TypeScript/ESLint/Babel等)一式が node_modules として
    // 紛れ込んでくることがある。これは実行時には一切使わない開発時専用のコードで、
    // 古いバージョン特有の脆弱性(npm audit で警告される類)の温床にしかならないので、
    // vendorに固定する時点で削除しておく。
    // (inkjs自体は "zero dependency" でランタイムに外部パッケージを必要としないため、
    //  安全に削除できる。他のパッケージをvendor対象に増やす場合は、本当に
    //  ランタイム依存が無いか確認してから同じ扱いにすること)
    const nestedNodeModules = path.join(dest, "node_modules");
    if (fs.existsSync(nestedNodeModules)) {
      fs.rmSync(nestedNodeModules, { recursive: true, force: true });
      console.log(
        `[update-vendor] ${pkgName} 内の不要な node_modules(開発用ツール)を削除しました。`,
      );
    }

    const pkgJsonPath = path.join(dest, "package.json");
    const version = fs.existsSync(pkgJsonPath)
      ? JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")).version
      : "(不明)";
    console.log(
      `[update-vendor] ${pkgName}@${version} を vendor/${pkgName} に反映しました。`,
    );
  } catch (e) {
    console.error(
      `[update-vendor] ${pkgName} の更新中にエラーが発生しました:`,
      e.message,
    );
    hadError = true;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

console.log("\n[update-vendor] 完了。");
console.log("次の手順で反映を確定させてください:");
console.log("  1. npm install");
console.log("  2. npm run compile-story / npm run dev で問題なく動くか確認");
console.log(
  "  3. 問題無ければ: git add vendor/ package.json package-lock.json && git commit",
);

if (hadError) process.exit(1);
