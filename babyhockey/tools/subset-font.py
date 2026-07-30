#!/usr/bin/env python3
"""把辰宇落雁體完整字型裁成本遊戲實際用到的字。

為什麼需要這支工具：字型子集是「照著文案裁的」，所以**只要改了畫面上的文字，
就必須重新跑一次**，否則新字會掉回系統字型（PingFang），畫面上就會看到
一段手寫、一段黑體的混搭。這個坑踩過一次了 —— 初版直接沿用 babyballrace2 的
子集，結果連標題的「冰」「鬥」都缺。

用法：
    # 1. 取得完整字型（9.5MB，OFL 1.1，不進版控）
    curl -sLO https://raw.githubusercontent.com/Chenyu-otf/chenyuluoyan_thin/main/ChenYuluoyan-2.0-Thin.ttf

    # 2. 重建子集（就地覆蓋 fonts/chenyuluoyan-sub.woff2）
    python3 tools/subset-font.py ChenYuluoyan-2.0-Thin.ttf

需要 fontTools 與 brotli：
    pip3 install "fonttools[woff]" brotli

字型來源：https://github.com/Chenyu-otf/chenyuluoyan_thin （辰宇落雁體 2.0，SIL OFL 1.1）
"""
import re
import sys
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
GAME = HERE.parent
OUT = GAME / "fonts" / "chenyuluoyan-sub.woff2"

# 一定要收的基本字元：ASCII（P1／數字／AIR HOCKEY 這類）＋常用全角標點
BASE = "".join(chr(c) for c in range(0x20, 0x7F))
PUNCT = "　、。，；：？！…—－～「」『』（）〈〉《》‧’“”–‘"


def visible_html_text(path: pathlib.Path) -> str:
    """抽出 HTML 裡玩家看得到的文字（去掉標籤、註解、script、svg）。"""
    s = path.read_text(encoding="utf-8")
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"<script.*?</script>", "", s, flags=re.S)
    s = re.sub(r"<svg.*?</svg>", "", s, flags=re.S)
    return re.sub(r"<[^>]+>", "\n", s)


def js_string_literals(path: pathlib.Path) -> str:
    """抽出 JS 裡的字串字面值（含樣板字串），涵蓋動態組出來的文案。"""
    s = path.read_text(encoding="utf-8")
    lits = re.findall(r"\"([^\"\\\n]*)\"|'([^'\\\n]*)'|`([^`\\]*)`", s)
    return "\n".join(x for tup in lits for x in tup if x)


def wanted_chars() -> set:
    text = [BASE, PUNCT, visible_html_text(GAME / "index.html")]
    for js in sorted(GAME.glob("*.js")):
        text.append(js_string_literals(js))
    chars = set("".join(text))
    # emoji 由系統字型負責，不需要收進中文字型
    chars = {c for c in chars if c.strip() and not (0x1F000 <= ord(c) <= 0x1FAFF)
             and not (0x2600 <= ord(c) <= 0x27BF)
             and not (0x23E9 <= ord(c) <= 0x23FA)      # ⏰⏱ 這類時鐘符號也是 emoji
             and ord(c) not in (0xFE0F, 0x20E3)}
    return chars


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    src = pathlib.Path(sys.argv[1])
    if not src.exists():
        print(f"找不到完整字型：{src}", file=sys.stderr)
        return 1

    from fontTools.ttLib import TTFont
    from fontTools import subset

    chars = wanted_chars()

    # 先確認完整字型真的有這些字，缺的要當成錯誤講清楚（而不是默默產出缺字的子集）
    full = TTFont(src)
    covered = set()
    for t in full["cmap"].tables:
        covered |= set(t.cmap.keys())
    missing = sorted(c for c in chars if ord(c) not in covered)
    if missing:
        print("⚠️  連完整字型都沒有這些字，請改文案或換字型：", "".join(missing), file=sys.stderr)
        chars -= set(missing)

    opts = subset.Options()
    opts.flavor = "woff2"
    opts.with_zopfli = False
    opts.desubroutinize = True
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]          # 保留字型名稱與授權宣告
    opts.notdef_outline = True

    font = subset.load_font(str(src), opts)
    subsetter = subset.Subsetter(options=opts)
    subsetter.populate(text="".join(sorted(chars)))
    subsetter.subset(font)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(font, str(OUT), opts)

    size = OUT.stat().st_size
    print(f"收錄 {len(chars)} 個字元 → {OUT.relative_to(GAME)}（{size / 1024:.0f} KB）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
