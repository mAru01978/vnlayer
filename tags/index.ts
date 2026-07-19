// 全タグ定義(tags/defs/*.ts)をここでside-effect importして登録し、
// dispatchTag()一本を外部(core/useStoryEngine.ts)に公開する。
// 新しいタグを追加するときは、tags/defs/に1ファイル足してここに1行importするだけでよい
// (scripts/new-tag.js もこの形でひな形を生成する想定)。

import './defs/bg';
import './defs/c';
import './defs/anim';
import './defs/anim_loop';
import './defs/anim_stop';
import './defs/anim_speed';
import './defs/anim_reverse';
import './defs/s';
import './defs/goto';
import './defs/hide';
import './defs/choices';
import './defs/msg_window';
import './defs/clear';
import './defs/msg_fade';
import './defs/wait';
import './defs/shake';
import './defs/cam';
import './defs/pos';
import './defs/gaze';
import './defs/msg';
import './defs/flash';
import './defs/type';
import './defs/type_wait';

import { runTag } from './registry';
import type { SceneHandlers } from './sceneHandlers';

function parseTag(tag: string): { key: string; args: string[] } {
  const [key, ...args] = tag.split(':').map((s) => s.trim());
  return { key, args };
}

export async function dispatchTag(tag: string, handlers: SceneHandlers): Promise<void> {
  const { key, args } = parseTag(tag);
  await runTag(key, args, handlers);
}

export { setTagConfig, getTagConfig, registerTag } from './registry';
export type { SceneHandlers } from './sceneHandlers';
export { setCharacterSlots, getCharacterSlot, getAllCharacterSlots } from './characterSlots';
