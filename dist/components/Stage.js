"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import StageView from "./StageView";
// 「常に同じシナリオを、ページを跨いでも一切再読み込みなしで継続したい」場合向け。
// StoryProviderをlayout.tsxに1つだけ置く方式と組み合わせて使う
// (このコンポーネント自体はProviderを持たず、上位のcontextを見るだけ)。
export default function Stage() {
  return _jsx(StageView, { mode: "full" });
}
//# sourceMappingURL=Stage.js.map
