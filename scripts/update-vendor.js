#!/usr/bin/env node
// vendor/ 以下に固定管理している依存パッケージを、
// npmレジストリの最新版で更新するスクリプト。
//
// 対象:
//   - inkjs
//   - jotai
//   - jotai-family
//   - gsap
//   - @gsap/react
//
// 狙い:
// 普段のビルドは vendor/ 以下を直接参照する(package.jsonの
// "file:./vendor/..." 依存)。
// これにより、将来npmレジストリやGitHub側でパッケージが消えたり
// 壊れたりしても、このリポジトリの中だけでビルドが完結する。
//
// 更新は明示的にこのスクリプトを実行した時だけ行われる。
// npm installのたびに勝手に最新版へ更新されることはない。
//
// 使い方:
//
//   node scripts/update-vendor.js
//       → vendor管理対象を全部更新
//
//   node scripts/update-vendor.js inkjs
//       → inkjsだけ更新
//
//   node scripts/update-vendor.js jotai
//       → jotaiだけ更新
//
//   node scripts/update-vendor.js jotai-family
//       → jotai-familyだけ更新
//
//   node scripts/update-vendor.js gsap
//       → gsapだけ更新
//
//   node scripts/update-vendor.js @gsap/react
//       → @gsap/reactだけ更新
//
// 更新後は必ず:
//
//   1. npm install(package.jsonのfile:参照を読み直させる)
//   2. npm run compile-story / npm run dev で問題なく動くか確認
//   3. git add vendor/ package.json package-lock.json && git commit
//
// までやってから確定させること。

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const vendorDir = path.join(root, "vendor");


// vendorで固定管理するパッケージ一覧。
//
// inkjs-compilerという独立したnpmパッケージは存在しない。
// inkjs packageのbin aliasとして提供されているだけなので、
// vendor対象はinkjsのみ。
//
// @gsap/react はスコープ付きパッケージなので、
// vendor/@gsap/react として配置される。
const VENDORED_PACKAGES = [
  "inkjs",
  "jotai",
  "jotai-family",
  "gsap",
  "@gsap/react",
];


// npm取得時に混入する不要なnode_modulesを削除する対象。
// inkjsはzero dependencyであり、実行時依存を持たないため削除可能。
// その他は将来的なランタイム依存追加を考慮して保持する。
const REMOVE_NESTED_NODE_MODULES = [
  "inkjs",
];


const requested = process.argv.slice(2);
const targets = requested.length > 0
  ? requested
  : VENDORED_PACKAGES;


fs.mkdirSync(vendorDir, {
  recursive: true,
});


let hadError = false;


for (const pkgName of targets) {

  if (!VENDORED_PACKAGES.includes(pkgName)) {
    console.error(
      `"${pkgName}" はvendor管理対象ではありません(対象: ${VENDORED_PACKAGES.join(", ")})`,
    );

    hadError = true;
    continue;
  }


  console.log(
    `\n[update-vendor] ${pkgName} の最新版を取得しています...`,
  );


  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "vendor-update-"),
  );


  try {

    // 本体のnode_modules/package-lock.jsonには触れず、
    // 一時ディレクトリへ単独インストールして取得する。
    execSync(
      `npm install "${pkgName}@latest" --prefix "${tempDir}" --no-save --no-package-lock`,
      {
        stdio: "inherit",
      },
    );


    const src = path.join(
      tempDir,
      "node_modules",
      pkgName,
    );


    if (!fs.existsSync(src)) {
      console.error(
        `[update-vendor] ${pkgName} の取得に失敗しました(${src} が見つかりません)`,
      );

      hadError = true;
      continue;
    }


    // @scope/package の場合:
    // vendor/@scope/package
    // になる。
    const dest = path.join(
      vendorDir,
      pkgName,
    );


    fs.rmSync(dest, {
      recursive: true,
      force: true,
    });


    fs.cpSync(src, dest, {
      recursive: true,
    });

    const nestedNodeModules = path.join(
      dest,
      "node_modules",
    );


    if (
      REMOVE_NESTED_NODE_MODULES.includes(pkgName) &&
      fs.existsSync(nestedNodeModules)
    ) {

      fs.rmSync(nestedNodeModules, {
        recursive: true,
        force: true,
      });


      console.log(
        `[update-vendor] ${pkgName} 内の不要な node_modules を削除しました。`,
      );
    }


    const pkgJsonPath = path.join(
      dest,
      "package.json",
    );
if (fs.existsSync(pkgJsonPath)) {
  const pkgJson = JSON.parse(
    fs.readFileSync(pkgJsonPath, "utf8"),
  );

  let changed = false;

  for (const field of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    if (
      pkgJson[field] &&
      pkgJson[field]["jotai-family"] === "link:"
    ) {
      delete pkgJson[field]["jotai-family"];
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(
      pkgJsonPath,
      JSON.stringify(pkgJson, null, 2) + "\n",
    );

    console.log(
      `[update-vendor] ${pkgName} 内の不要な link dependency を削除しました。`,
    );
  }
}
    

    const version = fs.existsSync(pkgJsonPath)
      ? JSON.parse(
          fs.readFileSync(pkgJsonPath, "utf8"),
        ).version
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

    fs.rmSync(tempDir, {
      recursive: true,
      force: true,
    });

  }
}


console.log("\n[update-vendor] 完了。");

console.log("次の手順で反映を確認してください:");

console.log("  1. npm install");

console.log("  2. npm run compile-story / npm run dev で確認");

console.log(
  "  3. 問題なければ: git add vendor/ package.json package-lock.json && git commit",
);


if (hadError) {
  process.exit(1);
}
