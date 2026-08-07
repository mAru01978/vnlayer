// VNLayer.setContext()/getContext() (core/useStoryEngine.tsのsetContextVars/
// getContextVars)が書き込む値のローカルの写しと、notify:true時の
// "${key}_seq"自動採番・wake(interrupt)処理、およびネストしたオブジェクトの
// フラット化(下記)をまとめたマネージャー。
//
// 実際にink変数へ反映する処理(stepProvider.idle(scenario, varName, value)の
// 呼び出しループ)は、そのVNインスタンスが使っているStepProvider/scenarioに
// 依存するため、こちらには持たせず core/useStoryEngine.ts 側に残している
// (prepareWrite()が返す「書き込むべきvars」を使って、呼び出し側がidle()
// ループを回す、という役割分担)。
//
// オブジェクトのフラット化: ink変数はJSのオブジェクトを直接保持できない
// ため、setContext({ weather: { temp: 22.2, text: "晴れ" } }) のような
// ネストしたオブジェクトは、既定で "weather_temp" / "weather_text" の
// ようにキーを"_"で連結してフラット化してから書き込む。単に読みやすさの
// ための糖衣構文で、結局「ink側にweather_temp/weather_textという変数を
// 自分で定義するのと同じこと」をしているだけなので、名前の衝突チェックは
// 行わない(呼び出し側の責任)。options.keyNamesで個別に変数名を上書き
// できる(core/types.tsのSetContextOptionsコメント参照)。配列はinkが
// 扱える値ではないため、フラット化の対象にはせず、そのまま1つの値として
// 渡す(呼び出し側で意図的にJSON文字列化する等は別途行う必要がある)。
import * as waitManager from './waitManager';
import type { SetContextKeyNames, SetContextOptions } from '../types';

const contextStore = new Map<string, Record<string, unknown>>();
const contextSeq = new Map<string, Record<string, number>>();
const lastWakeAt = new Map<string, number>();
const WAKE_THROTTLE_MS = 50;

function getStoreRecord(atomKey: string): Record<string, unknown> {
  let record = contextStore.get(atomKey);
  if (!record) {
    record = {};
    contextStore.set(atomKey, record);
  }
  return record;
}

function getSeqRecord(atomKey: string): Record<string, number> {
  let record = contextSeq.get(atomKey);
  if (!record) {
    record = {};
    contextSeq.set(atomKey, record);
  }
  return record;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// varsを「ink変数名 → 値」の1階層フラットな形に変換する。
//   flattenVars({ weather: { temp: 22.2, text: "晴れ" } })
//     → { weather_temp: 22.2, weather_text: "晴れ" }
//   flattenVars({ hp: 100 })
//     → { hp: 100 } (元々フラットな値はそのまま)
// keyNamesで個別の変数名を上書きできる(vars/keyNamesは同じ構造で辿る)。
export function flattenVars(
  vars: Record<string, unknown>,
  keyNames?: SetContextKeyNames,
  prefix?: string
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(vars)) {
    const override = keyNames?.[key];

    if (isPlainObject(value)) {
      const nestedKeyNames = isPlainObject(override) ? (override as SetContextKeyNames) : undefined;
      // overrideが文字列の場合、その値をこのネストしたオブジェクト全体の
      // 新しいprefixとして使う("weather"→"w"のように途中の階層名だけ
      // 差し替えたいケース向け)。無ければ既定通りprefix_keyを積み重ねる。
      const nestedPrefix = typeof override === 'string' ? override : prefix ? `${prefix}_${key}` : key;
      Object.assign(result, flattenVars(value, nestedKeyNames, nestedPrefix));
      continue;
    }

    const flatKey = typeof override === 'string' ? override : prefix ? `${prefix}_${key}` : key;
    result[flatKey] = value;
  }

  return result;
}

// notify()が短時間(mousemove等)に大量連続で呼ばれた場合の保険。値の
// 書き込み自体は毎回やる(データとしては欠けない)が、「実行中のwait/
// type_wait待ちを打ち切る」効果の方は一定間隔に間引く。単発の本来の
// 使い方(クリック等)ではこの間隔より間が空くのが普通なので体感には
// 影響しない。
function wake(atomKey: string): void {
  const now = Date.now();
  const last = lastWakeAt.get(atomKey) ?? 0;
  if (now - last < WAKE_THROTTLE_MS) return;
  lastWakeAt.set(atomKey, now);
  waitManager.interrupt(atomKey);
}

// setContextVars(vars, options?)の下ごしらえ。
//   1. varsをkeyNamesに従ってフラット化する(上記flattenVars参照)。
//   2. options.notify: true → 各キーに"${key}_seq"を自動生成・
//      インクリメントして一緒に書き込み、wake()する。
//   3. options.expose: false → ローカルストア(getContextVars()から
//      見える値)への反映をスキップする。
// 戻り値は「実際にink変数へ書き込むべき(フラット化・_seq込みの)vars」。
export function prepareWrite(
  atomKey: string,
  vars: Record<string, unknown>,
  options?: SetContextOptions
): Record<string, unknown> {
  let toWrite = flattenVars(vars, options?.keyNames);

  if (options?.notify) {
    wake(atomKey);
    const seqRecord = getSeqRecord(atomKey);
    const withSeq: Record<string, unknown> = { ...toWrite };
    for (const key of Object.keys(toWrite)) {
      const nextSeq = (seqRecord[key] ?? 0) + 1;
      seqRecord[key] = nextSeq;
      withSeq[`${key}_seq`] = nextSeq;
    }
    toWrite = withSeq;
  }

  if (options?.expose !== false) {
    const store = getStoreRecord(atomKey);
    Object.assign(store, toWrite);
  }

  return toWrite;
}

export function getContextVars(atomKey: string, varNames?: string[]): Record<string, unknown> {
  const store = getStoreRecord(atomKey);
  if (!varNames || varNames.length === 0) {
    return { ...store };
  }
  const result: Record<string, unknown> = {};
  for (const name of varNames) {
    result[name] = store[name];
  }
  return result;
}

export function reset(atomKey: string): void {
  contextStore.set(atomKey, {});
}

export function dispose(atomKey: string): void {
  contextStore.delete(atomKey);
  contextSeq.delete(atomKey);
  lastWakeAt.delete(atomKey);
}
