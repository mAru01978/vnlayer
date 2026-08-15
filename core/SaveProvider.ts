import type {
  VisualState,
  PositionOverrides,
  ActiveMessage,
  LineEntry,
} from "./types";
import type { UiConfigPatch } from "../tags/uiConfig";

// 素材統合(2026-08-09)により characterSlots.ts / backgroundSlots.ts は
// tags/spriteAssets.tsへ統合された。SaveDataの保存形式自体は変更せず
// (getAllCharacterSlots()/getAllBackgroundSlots()が引き続き同じ形の
// フラットなRecordを返す)、型だけここでローカルに定義しておく。
type SavedCharacterSlot = { originX: number; originY: number };
type SavedBackgroundSlot = { color?: string; image?: string };

// 簡易セーブ機能(core/useStoryEngine.ts + core/StepProvider.ts連携)用の型。
//
// inkStateJson: inkjsの story.state.ToJson() の出力そのもの(ink実行状態の
// フルシリアライズ — 変数・訪問済みノット・現在位置・選択肢待ち状態などを
// 全部含む)。story.state.LoadJson(inkStateJson) で復元できる。
//
// 修正メモ(2026-08-08、復元後にフォント/選択肢位置が壊れる不具合の修正):
// inkStateJsonが正確に復元するのは「ink自身の実行状態」だけで、タグの
// 累積的な副作用として書き変わる「VNLayer側の見た目設定」は一切含まれない。
// 保存時点までにストーリーが辿った#ui:.../#s:...:pos:.../#s:...:initPos:.../
// #s:bg:...:color:...等のタグは、復元時には再実行されない(本文を最初から
// 再生し直すわけではないため)ため、以下のフィールドを別枠で保存/復元する
// 必要がある:
//   visual          … bg/characters/speakerの見た目スナップショット
//   contextVars      … setContext()でexposeされた値の写し
//   positionOverrides … # s:name:pos:...による一時的な立ち位置上書き
//                        (atomKeyスコープなので、この1インスタンスの分だけ)
//   uiConfigPatches  … #ui:.../VNLayer.configure({ui})が積み上げてきた設定
//                        (全スコープぶん。グローバル+この後述のcharacterSlots/
//                        backgroundSlotsと同じく、現状はページ内で共有される
//                        レジストリのため、複数VNインスタンスを同時に
//                        mountしている場合はセーブ/ロードのタイミングに
//                        よって他インスタンスの表示にも影響しうる点に注意)
//   characterSlots   … # s:name:initPos:...で書き換わる立ち位置プリセット
//   backgroundSlots  … # s:bg:name:color:...で書き換わる背景の色/画像定義
//   activeMessage    … 保存時点で表示中だったメッセージ(吹き出し)。
//                        startRevealedがtrueなら復元時に即座に全文表示、
//                        falseなら最初からタイプライターアニメーションを
//                        やり直す(#type:wait:onで表示完了を待っていたか
//                        どうかで判定。core/useStoryEngine.ts参照)。
//   backlogLines     … 保存時点までの会話ログ。復元しないと「戻ったら
//                        バックログが空/直前の発言も無言に見える」という
//                        不自然な状態になっていた。
export type SaveData = {
  clip: string;
  inkStateJson: string;
  visual: VisualState;
  contextVars: Record<string, unknown>;
  positionOverrides: PositionOverrides;
  uiConfigPatches: Record<string, UiConfigPatch>;
  characterSlots: Record<string, SavedCharacterSlot>;
  backgroundSlots: Record<string, SavedBackgroundSlot>;
  activeMessage: ActiveMessage;
  backlogLines: LineEntry[];
  savedAt: number;
};

// StepProvider.getSaveData()の戻り値。SaveDataのうち「Storyそのものに
// 関する部分」だけを持つ(それ以外のフィールドはcore/useStoryEngine.ts側で
// 補って完全なSaveDataに組み立てる。StepProvider自体はcore/managers/の
// ようなReact層の状態やtags/のレジストリを知らなくてよい、という関心の分離)。
export type StorySaveData = {
  inkStateJson: string;
  visual: VisualState;
};

// key … 通常は clip(1クリップにつき1セーブスロットという「簡易」な設計。
// 複数スロットのセーブ/ロードUIが必要になったら、呼び出し側で
// `${clip}:slot1` のようなキーを自前で組み立てて渡す形で拡張できる)。
export interface SaveProvider {
  save(key: string, data: SaveData): Promise<void>;
  load(key: string): Promise<SaveData | null>;
  clear(key: string): Promise<void>;
}
