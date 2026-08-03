// 全タグ定義(tags/defs/basic/*.ts, tags/defs/special/*.ts)をここでside-effect
// importして登録し、dispatchTag()一本を外部(core/useStoryEngine.ts)に公開する。
//
// 設計方針(タグシステム大改修フェーズ3): 以前あったtags/sceneHandlers.ts
// (25個のメソッドを持つ巨大なSceneHandlers型)は廃止した。各タグ定義
// ファイルは、状態を変更したければcore/managers/以下の該当マネージャーを
// 直接importして呼ぶ(basic/specialどちらの分類でも同じ)。dispatchTagが
// 各タグに渡すのは、どのVNインスタンス向けかを示す`{ instanceId }`
// (TagHandlers、tags/registry.ts参照)だけになった。
//
// basic/special分離: 「1つのatomへの書き込みだけで完結するか」を基準に、
// tags/defs/を2つのフォルダに分けている。
//   tags/defs/basic/   … registerBasicTag()で書くタグ(#shake/#cam/#flash/#gaze)。
//   tags/defs/special/ … 複数の分岐/副作用先を持つタグ(#s/#anim/#ui/#web/
//                        #emit/#bg/#wait/#type)。registerTag({run:...})で
//                        書くが、実装自体はcore/managers/の関数呼び出しに
//                        終始し、core/useStoryEngine.tsは経由しない。
// 新しいタグを追加するときは、まず「1つのatomへの書き込みだけで済むか」を
// 考え、済むならbasic/に1ファイル足すだけでよい。複雑ならspecial/に置き、
// 必要に応じてcore/managers/に新しいマネージャーを追加する
// (どちらのケースでもcore/useStoryEngine.tsは触らない)。
import "./defs/special/bg";
import "./defs/special/sprite";
import "./defs/special/anim";
import "./defs/basic/cam";
import "./defs/basic/gaze";
import "./defs/special/wait";
import "./defs/basic/flash";
import "./defs/basic/shake";
import "./defs/special/type";
import "./defs/special/ui";
import "./defs/special/web";
import "./defs/special/emit";
import { runTag } from "./registry";
function parseTag(tag) {
  const [key, ...args] = tag.split(":").map((s) => s.trim());
  return { key, args };
}
export async function dispatchTag(tag, handlers) {
  const { key, args } = parseTag(tag);
  await runTag(key, args, handlers);
}
export {
  setTagConfig,
  getTagConfig,
  registerTag,
  registerAlias,
  registerBasicTag,
  warnUnknownTag,
} from "./registry";
export {
  setCharacterSlots,
  getCharacterSlot,
  getAllCharacterSlots,
} from "./characterSlots";
export {
  setBackgroundSlots,
  getBackgroundSlot,
  getAllBackgroundSlots,
} from "./backgroundSlots";
export { setUiConfig, getUiConfig } from "./uiConfig";
export { setWebLinks, getWebLink } from "./webLinks";
//# sourceMappingURL=index.js.map
