# 使えるタグ一覧

このファイルは `node VNLayer/scripts/list-tags.js` で自動生成されています。手で編集しても次回実行時に上書きされるので、内容を直したい場合は `VNLayer/tags/defs/<タグ名>.ts` 側の(registerTagの直前の)コメントを直してから再生成してください。

## `anim`

## `anim_loop`

# anim_loop:名前:モーション → そのモーションをループ再生させる

## `anim_reverse`

# anim_reverse:名前:モーション → そのモーションを逆再生させる

## `anim_stop`

# anim_stop:名前 → 再生中のモーションを止める(表情expressionはそのまま維持)

## `bg`

## `c`

## `choices`

## `clear`

## `goto`

## `hide`

## `msg_fade`

# msg_fade:in

## `msg_window`

# msg_window:hide / # msg_window:show / choices:hide/showと同じ考え方で、メッセージウィンドウ(吹き出し・ナレーション / キャプション)自体をこのシーンでは出さない、という「箱ごと消す」タグ。 / msg:hide/transient/persist は個々のメッセージの残り方の制御なので、役割が異なる。

## `s`

