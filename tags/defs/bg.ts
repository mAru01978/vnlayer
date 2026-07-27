import { registerTag } from '../registry';
import { setBackgroundSlots } from '../backgroundSlots';

// # bg:name              → 背景をnameに切り替える(既定)
// # bg:name:color:#f3e3c8 → 「name」という背景の見た目(色)自体を定義/上書きする
//                            (backgroundSlots.json相当をink側からも書ける。
//                             JS(VNLayer.configure({backgroundSlots}))と同じ
//                             共有ストアを使うので、後から書いた方が勝つ)。
//                             定義すると同時にその背景へ切り替えもする。
registerTag({
  key: 'bg',
  run: ({ args, handlers }) => {
    const [name, mode, value] = args;
    if (mode === 'color' && value) {
      setBackgroundSlots({ [name]: { color: value } });
    }
    handlers.setBg(name);
  },
});
