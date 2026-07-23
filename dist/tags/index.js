// 全タグ定義(tags/defs/*.ts)をここでside-effect importして登録し、
// dispatchTag()一本を外部(core/useStoryEngine.ts)に公開する。
// 新しいタグを追加するときは、tags/defs/に1ファイル足してここに1行importするだけでよい
// (scripts/new-tag.js もこの形でひな形を生成する想定)。
import './defs/bg';
import './defs/s';
import './defs/anim';
import './defs/cam';
import './defs/gaze';
import './defs/wait';
import './defs/flash';
import './defs/shake';
import './defs/type';
import './defs/ui';
import './defs/web';
import { runTag } from './registry';
function parseTag(tag) {
    const [key, ...args] = tag.split(':').map((s) => s.trim());
    return { key, args };
}
export async function dispatchTag(tag, handlers) {
    const { key, args } = parseTag(tag);
    await runTag(key, args, handlers);
}
export { setTagConfig, getTagConfig, registerTag, registerAlias } from './registry';
export { setCharacterSlots, getCharacterSlot, getAllCharacterSlots } from './characterSlots';
export { setUiConfig, getUiConfig } from './uiConfig';
export { setWebLinks, getWebLink } from './webLinks';
//# sourceMappingURL=index.js.map