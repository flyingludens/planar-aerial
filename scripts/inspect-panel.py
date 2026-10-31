"""用 Playwright 打开正在运行的 DSH 面板，读它的真实渲染。

为什么要脚本：面板的问题里有一类只有浏览器答得上来——元素在树里存在但根本没被画出来。
单元测试遍历的是虚拟树，一条 <line> 的节点在那里永远"存在"，所以连线坏了也全绿。

用法：
    PLAYWRIGHT_BROWSERS_PATH=.pw-browsers .venv-goldbook/bin/python scripts/inspect-panel.py

它做三件事：
1. 连上 DSH 的 Chromium（读它自己 user-data-dir 里的 DevToolsActivePort），不动你正在用的窗口
2. 在面板里点到 关系网 页，把线层、线条、卡片的几何与计算样式读回来
3. 截图到 scripts/out/，并打印一份可以贴回来的摘要
"""

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

WORK = Path(__file__).resolve().parent.parent
OUT = WORK / "scripts" / "out"
# DSH 桌面端自己的用户目录：这里能找到它监听的 DevTools 端口。
# 端口写在 user-data-dir 的 DevToolsActivePort 里，第一行是端口，第二行是浏览器路径。
USER_DATA_DIR = Path.home() / "Library" / "Application Support" / "DeepSeek Harness"


def devtools_endpoint() -> tuple[str, str]:
    port_file = USER_DATA_DIR / "DevToolsActivePort"
    if not port_file.exists():
        sys.exit(f"没找到 {port_file}：DSH 可能不是以调试端口启动的。")
    port, path = port_file.read_text().split("\n")[:2]
    return f"http://127.0.0.1:{port}", path.strip()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    http_endpoint, ws_path = devtools_endpoint()
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(f"{http_endpoint}{ws_path}")
        # 面板在哪个页面里：找到带插件根节点的那个 context/page，不新开标签
        page = None
        for context in browser.contexts:
            for candidate in context.pages:
                if "ds" in candidate.url or "59258" in candidate.url or candidate.url.startswith("http"):
                    if candidate.locator(".st-shell").count() > 0:
                        page = candidate
                        break
            if page is not None:
                break
        if page is None:
            sys.exit("连上了 DSH，但没有哪个页面里能找到 .st-shell。先把写作面板打开。")

        print("页面:", page.url)

        # 打开关系网。页签在抽屉里，按文案点；找不到就把当前 DOM 里的按钮名打出来。
        opened = page.evaluate(
            """() => {
              const tab = [...document.querySelectorAll('button')]
                .find((b) => (b.textContent || '').trim() === '关系网' || (b.getAttribute('data-testid') || '').includes('relations'));
              if (tab) { tab.click(); return true; }
              return false;
            }"""
        )
        if not opened:
            print("没找到关系网入口，当前页签：", page.evaluate(
                "() => [...document.querySelectorAll('button')].map((b) => (b.textContent||'').trim()).filter(Boolean).slice(0, 40)"))
        page.wait_for_timeout(600)

        report = page.evaluate(
            """() => {
              const svg = document.querySelector('.st-mosaic-wires');
              const lines = [...document.querySelectorAll('.st-mosaic-edge')];
              const hits = [...document.querySelectorAll('.st-mosaic-edge-hit')];
              const cards = [...document.querySelectorAll('.st-mosaic-card')];
              const box = (el) => { const r = el.getBoundingClientRect();
                return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
              const style = (el) => { const s = getComputedStyle(el);
                return { stroke: s.stroke, width: s.strokeWidth, display: s.display, opacity: s.opacity,
                         visibility: s.visibility, position: s.position, pointerEvents: s.pointerEvents }; };
              return {
                svg: svg && { tag: svg.tagName, ns: svg.namespaceURI, box: box(svg), style: style(svg) },
                lineCount: lines.length,
                hitCount: hits.length,
                lines: lines.slice(0, 4).map((l) => ({ box: box(l), style: style(l),
                  attrs: { x1: l.getAttribute('x1'), y1: l.getAttribute('y1'), x2: l.getAttribute('x2'), y2: l.getAttribute('y2') },
                  parentTag: l.parentElement && l.parentElement.tagName,
                  parentNs: l.parentElement && l.parentElement.namespaceURI })),
                cards: cards.map((c) => ({ id: c.getAttribute('data-entity'), box: box(c), text: (c.textContent || '').trim().slice(0, 12) })),
                canvas: (() => { const c = document.querySelector('.st-mosaic-canvas'); return c && box(c); })(),
                selects: [...document.querySelectorAll('.st-mosaic-focus select')].map((s) => ({ value: s.value, box: box(s) })),
              };
            }"""
        )
        print(json.dumps(report, ensure_ascii=False, indent=2))
        page.screenshot(path=str(OUT / "panel-relations.png"))
        print("截图:", OUT / "panel-relations.png")
    # 不关浏览器：这是你正在用的窗口。


if __name__ == "__main__":
    main()
