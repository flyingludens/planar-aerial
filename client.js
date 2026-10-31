window.__ModuleLoader__.load({
  id: "@local/dsh-plugin-storywriting",
  factory(require) {
    var module = { exports: {} };
    var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.js
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/client/shared/locale.js
var NS = "storywriting";
var ZH = {
  panel: "\u4F4D\u9762\u98DE\u884C",
  "brand.full": "\u4F4D\u9762\u98DE\u884C",
  "brand.lead": "\u4F4D\u9762",
  "brand.accent": "\u98DE\u884C",
  "brand.latin": "Planar Aerial",
  "tab.chapters": "\u76EE\u5F55",
  "tab.settings": "\u80CC\u666F\u8BBE\u5B9A",
  "tab.characters": "\u4EBA\u7269",
  "tab.relationships": "\u4EBA\u7269\u5173\u7CFB",
  "tab.versions": "\u7248\u672C",
  "tab.overview": "\u6982\u89C8",
  "tab.writingStyles": "\u6D41\u6D3E",
  "action.accept": "\u91C7\u7EB3",
  "action.retry": "\u91CD\u8BD5",
  "action.reject": "\u653E\u5F03",
  "action.addUnder": "\u65B0\u5EFA\u7AE0\u8282",
  "action.rename": "\u4FDD\u5B58",
  "action.renameNode": "\u91CD\u547D\u540D",
  "label.removeNodeConfirm": "\u5220\u9664\u300C{title}\u300D\uFF1F",
  "label.removeNodeChildren": "\u5B83\u4F1A\u4E00\u5E76\u5220\u9664 {c} \u4E2A\u5C42\u7EA7\u5BB9\u5668\u548C {n} \u8282\u6B63\u6587\u3002",
  "label.removeNodeChars": "\u4E00\u5171 {n} \u5B57\u3002",
  "label.removeNodeWarn": "\u5220\u9664\u540E\u65E0\u6CD5\u64A4\u9500\u3002\u9700\u8981\u4FDD\u7559\u7684\u8BDD\uFF0C\u5148\u5B58\u4E00\u4E2A\u5FEB\u7167\u3002",
  "label.renameBookHint": "\u65B0\u7684\u4E66\u540D\uFF08\u4F1A\u540C\u65F6\u6539\u76EE\u5F55\u540D\uFF09",
  "action.delete": "\u5220\u9664",
  "label.deleteBookConfirm": "\u5220\u9664\u300A{title}\u300B\uFF1F",
  "label.deleteFilesToo": "\u540C\u65F6\u5220\u9664\u4E66\u7684\u5DE5\u4F5C\u76EE\u5F55\u548C\u91CC\u9762\u7684\u6587\u4EF6",
  "label.deleteFilesWarn": "\u6574\u4E2A\u76EE\u5F55\u4F1A\u88AB\u5220\u9664\uFF0C\u5305\u62EC\u624B\u7A3F\u548C\u5FEB\u7167\uFF0C\u65E0\u6CD5\u6062\u590D\u3002",
  "label.deleteManifestOnly": "\u53EA\u4ECE\u4E66\u5E93\u79FB\u9664\uFF0C\u76EE\u5F55\u548C\u6587\u4EF6\u4FDD\u7559\u5728\u78C1\u76D8\u4E0A\u3002",
  "label.emptyNode": "\u7A7A",
  "label.charCount": "{n} \u5B57",
  "action.ok": "\u786E\u5B9A",
  "label.writeBeforeContinue": "\u5148\u5199\u4E00\u70B9\u5185\u5BB9\uFF0CAI \u624D\u80FD\u63A5\u7740\u5F80\u4E0B\u5199\u3002",
  "label.noRelationships": "\u8FD8\u6CA1\u6709\u4EBA\u7269\u5173\u7CFB\u3002",
  "action.close": "\u5173\u95ED",
  "label.workspaceLeftBehind": "\u4E66\u5DF2\u5220\u9664\uFF0C\u4F46\u5B83\u7684\u5DE5\u4F5C\u533A\u6CA1\u80FD\u79FB\u9664\uFF0C\u8BF7\u5728\u5DE6\u4FA7\u680F\u624B\u52A8\u5220\u9664\u3002",
  "action.snapshot": "\u5B58\u5FEB\u7167",
  "action.restore": "\u56DE\u6EDA",
  "action.refresh": "\u5237\u65B0",
  "label.emptyChapters": "\u8FD8\u6CA1\u6709\u7AE0\u8282\uFF0C\u5148\u65B0\u5EFA\u4E00\u7AE0\u3002",
  "label.loading": "\u6B63\u5728\u8BFB\u53D6\u2026",
  "label.loadFailed": "\u6CA1\u80FD\u8BFB\u5230\u8FD9\u672C\u4E66\u7684 book.json\uFF0C\u8BF7\u68C0\u67E5\u6587\u4EF6\u662F\u5426\u8FD8\u5728\u539F\u5904\u3002",
  "label.recovered": "book.json \u635F\u574F\uFF0C\u5DF2\u5907\u4EFD\u4E3A book.json.bak \u5E76\u91CD\u5EFA\u7A7A\u7A3F\u3002",
  "label.overviewGlobal": "\u5168\u4E66",
  "label.overviewProgress": "\u7AE0\u8282 {c} \xB7 \u5B9A\u7A3F\u6BB5 {f}/{t} \xB7 \u4EBA\u7269 {p}",
  "action.expand": "\u5C55\u5F00",
  "action.collapse": "\u6298\u53E0",
  "action.removeNode": "\u5220\u9664",
  "label.untitledVolume": "\u672A\u547D\u540D\u5377",
  "label.untitledSection": "\u672A\u547D\u540D\u8282",
  "action.aiTrigger": "\u6DA6\u8272",
  "label.aiTriggerHint": "\u9009\u4E2D\u6539\u5199\uFF0C\u672A\u9009\u4E2D\u7EED\u5199",
  "label.nothingToSuggest": "\u8FD9\u4E00\u6BB5\u6CA1\u6709\u53EF\u7EED\u5199\u7684\u5185\u5BB9\u3002",
  "label.workspacePrefix": "writer",
  "action.openChat": "Harness",
  "label.noLayout": "\u9762\u677F\u5207\u6362\u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u8BF7\u6539\u7528\u5DE6\u4FA7\u680F\u7684\u5BF9\u8BDD\u56FE\u6807\u5207\u6362\u3002",
  "label.noWorkspaceService": "\u5DE5\u4F5C\u533A\u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u65E0\u6CD5\u6253\u5F00\u4F1A\u8BDD\u3002",
  "label.noWorkspaceForBook": "\u65E0\u6CD5\u628A\u8FD9\u672C\u4E66\u7684\u76EE\u5F55\u767B\u8BB0\u4E3A\u5DE5\u4F5C\u533A\uFF0C\u56E0\u6B64\u4E0D\u80FD\u5728\u91CC\u9762\u5F00\u542F\u5BF9\u8BDD\u3002\u8BF7\u786E\u8BA4\u76EE\u5F55\u4ECD\u7136\u5B58\u5728\u4E14\u53EF\u5199\u3002",
  "label.library": "\u6211\u7684\u4E66\u5E93",
  "label.bookCount": "\u5171 {n} \u672C",
  "label.bookMeta": "{c} \u8282 \xB7 \u5DF2\u5199 {f} \u8282",
  "label.newBookTitle": "\u4E66\u540D",
  "action.create": "\u521B\u5EFA",
  "action.cancel": "\u53D6\u6D88",
  "action.open": "\u6253\u5F00",
  "action.choose": "\u9009\u62E9\u76EE\u5F55",
  "action.newBook": "\u65B0\u5EFA\u4E00\u672C\u4E66",
  "label.backToBook": "\u56DE\u5230\u300A{title}\u300B",
  "level.volume": "\u672A\u547D\u540D\u5377",
  "level.chapter": "\u672A\u547D\u540D\u7AE0",
  "level.section": "\u672A\u547D\u540D\u8282",
  // The preview's own button hides the preview, so it says 收起 rather than 关闭. It shared
  // `action.close` with the ✕ buttons, and a duplicate key silently overwrites the earlier
  // one: every close button in the panel ended up saying 收起.
  "action.manuscript": "\u67E5\u770B\u5408\u5E76\u7A3F",
  "label.emptyManuscript": "\u8FD8\u6CA1\u6709\u5B9A\u7A3F\u7684\u6B63\u6587\u3002",
  "action.consistency": "\u68C0\u67E5\u4E00\u81F4\u6027",
  "label.consistencyReport": "\u4E00\u81F4\u6027\u68C0\u67E5",
  "label.noIssues": "\u6CA1\u6709\u53D1\u73B0\u77DB\u76FE\u3002",
  "consistency.kind.name": "\u540D\u79F0",
  "consistency.kind.detail": "\u7EC6\u8282",
  "consistency.kind.timeline": "\u65F6\u95F4\u7EBF",
  "consistency.kind.fact": "\u4E8B\u5B9E",
  "action.showRail": "\u76EE\u5F55",
  "action.hideRail": "\u6536\u8D77\u76EE\u5F55",
  // The rail's function row. Four destinations, one word each: the row is narrow, and a sentence
  // in a 264px card wraps into two lines that make the other three buttons sit at a different
  // height.
  // The card's ⋯ menu. Two actions and the menu's own name for a screen reader.
  "action.cardActions": "\u66F4\u591A\u64CD\u4F5C",
  "action.editCard": "\u7F16\u8F91",
  "action.deleteCard": "\u5220\u9664",
  "welcome.begin": "\u5F00\u59CB\u4F60\u7684\u65C5\u7A0B",
  "welcome.lede": "\u4EE5\u5B57\u4E3A\u7FFC\uFF0C\u4ECE\u6B64\u95F4\u98DE\u5F80\u5F7C\u754C\u3002",
  "welcome.newBook": "\u65B0\u5EFA\u4E00\u672C\u4E66",
  "welcome.library": "\u8FDB\u5165\u4E66\u67B6",
  "welcome.back": "\u8FD4\u56DE\u5F53\u524D\u4E66",
  "rail.start": "\u5F00\u59CB\u9875\u9762",
  "rail.shelf": "\u4E66\u67B6",
  "rail.open": "\u6253\u5F00\u76EE\u5F55",
  "rail.save": "\u4FDD\u5B58",
  "rail.export": "\u5BFC\u51FA",
  "rail.about": "\u5173\u4E8E",
  // The About card's three facts. The name and the author are proper nouns and are NOT
  // translated; only the labels beside them are, which is why the values come from the build and
  // these two keys only name them.
  "about.name": "\u4EA7\u54C1",
  "about.version": "\u7248\u672C",
  "about.author": "\u4F5C\u8005",
  // The menu rows need no title at all except where it carries something the label cannot: the
  // save row is the only one whose shortcut is invisible, so it is the only one that keeps a hint.
  // The other three said what their own labels already said — "导出" titled "把这本作品导出成
  // Markdown 文件" is a sentence that teaches nothing the word did not.
  "rail.saveHint": "\u2318/Ctrl + S",
  "rail.exportEmpty": "\u8FD9\u90E8\u4F5C\u54C1\u8FD8\u6CA1\u6709\u4EFB\u4F55\u6B63\u6587\uFF0C\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u5185\u5BB9\u3002",
  "rail.exportDone": "\u5DF2\u5BFC\u51FA {name}",
  "rail.savedNow": "\u5DF2\u4FDD\u5B58",
  "action.send": "\u53D1\u9001",
  "label.snapshotLabel": "\u624B\u52A8\u5FEB\u7167",
  "chapter.defaultTitle": "\u7B2C{n}\u7AE0",
  "tab.typography": "\u8BBE\u7F6E",
  "action.find": "\u67E5\u627E",
  "label.findHint": "Ctrl / \u2318 + F",
  "label.findPlaceholder": "\u67E5\u627E\u2026",
  "label.findPrev": "\u4E0A\u4E00\u4E2A",
  "label.findNext": "\u4E0B\u4E00\u4E2A",
  "label.matchCount": "{i} / {n}",
  "label.noMatches": "\u6CA1\u6709\u5339\u914D",
  "label.thinking": "\u5728\u60F3\u4E0B\u4E00\u53E5",
  "action.insert": "\u63D2\u5165\u6B63\u6587",
  // The chord on macOS is a single Command; Alt on Windows and Linux.
  "action.ask": "\u95EE\u7B54",
  "action.answers": "\u5386\u53F2",
  "action.copy": "\u590D\u5236",
  "mcp.title": "MCP",
  "mcp.endpoint": "\u7AEF\u70B9",
  "mcp.config": "\u914D\u7F6E",
  "mcp.connected": "\u5DF2\u8FDE\u63A5",
  "mcp.waiting": "\u7B49\u5F85\u8FDE\u63A5",
  "mcp.launch": "\u6253\u5F00 Harness",
  "label.noAnswers": "\u8FD8\u6CA1\u6709\u56DE\u7B54\u3002",
  "log.empty": "\u8FD8\u6CA1\u6709\u8BB0\u5F55\u3002",
  "log.time": "\u65F6\u95F4",
  "log.name": "\u4E8B\u4EF6",
  "log.detail": "\u7ED3\u679C",
  "log.page.answers": "\u56DE\u7B54\u5386\u53F2",
  "log.page.events": "\u8FD0\u884C\u65E5\u5FD7",
  "log.filter.all": "\u5168\u90E8\u7C7B\u578B",
  "log.filter.byType": "\u6309\u4E8B\u4EF6\u7C7B\u578B\u7B5B\u9009",
  "notes.title": "\u968F\u7B14",
  "notes.placeholder": "\u8BB0\u4E0B\u8FD9\u4E00\u523B\u7684\u7075\u611F\u2026",
  "notes.untitled": "\u7A7A\u767D\u968F\u7B14",
  "notes.pick": "\u9009\u62E9\u5DE6\u4FA7\u7684\u4E00\u6761\u968F\u7B14\u3002",
  "log.refresh": "\u5237\u65B0",
  "log.op.save": "\u4FDD\u5B58",
  "log.op.book.create": "\u65B0\u5EFA\u4E66",
  "log.op.book.delete": "\u5220\u9664\u4E66",
  "log.op.book.rename": "\u91CD\u547D\u540D",
  "log.op.snapshot": "\u5B58\u5FEB\u7167",
  "log.op.restore": "\u56DE\u6EDA",
  "log.op.answer": "\u56DE\u7B54\u5165\u5E93",
  "log.op.route.error": "\u5F02\u5E38",
  "log.op.continue": "\u7EED\u5199",
  "log.op.rewrite": "\u6DA6\u8272",
  "log.op.chat": "\u95EE\u7B54",
  "log.op.style": "\u98CE\u683C\u6863\u6848",
  "log.op.review": "\u5BA1\u9605",
  "log.op.critique": "\u8BED\u6CD5\u68C0\u67E5",
  "log.op.portrait": "\u751F\u6210\u5361\u56FE",
  "log.op.board.check": "\u677F\u68C0\u67E5",
  "log.op.board.ask": "\u677F\u95EE\u7B54",
  "log.op.board.relate": "\u68B3\u7406",
  "log.op.manuscript": "\u67E5\u770B\u5408\u5E76\u7A3F",
  "log.op.consistency": "\u68C0\u67E5\u4E00\u81F4\u6027",
  "log.op.overview": "\u5237\u65B0\u6982\u89C8",
  "log.op.model": "\u6A21\u578B\u8C03\u7528",
  // Two presses of Tab: a copy-edit of the section. Two presses of Command: a grammar critique.
  "scan.reviewTitle": "\u8FD9\u4E00\u8282\u7684\u95EE\u9898",
  "scan.issueCount": "{n} \u5904",
  "scan.noIssues": "\u8FD9\u4E00\u8282\u6CA1\u6311\u51FA\u95EE\u9898\u3002",
  "scan.truncated": "\u56DE\u7B54\u8D85\u51FA\u4E86\u957F\u5EA6\u4E0A\u9650\uFF0C\u4E0B\u9762\u7684\u6E05\u5355\u53EF\u80FD\u4E0D\u5B8C\u6574\u3002\u53EF\u4EE5\u628A\u8FD9\u4E00\u8282\u5206\u6210\u4E24\u534A\u518D\u5BA1\u4E00\u6B21",
  "scan.reviewThinking": "\u5728\u8FD9\u4E00\u8282\u91CC\u627E\u95EE\u9898",
  "scan.reviewThinking.1": "\u770B\u6807\u70B9\u548C\u65AD\u53E5",
  "scan.reviewThinking.2": "\u5FEB\u770B\u5B8C\u4E86",
  // Two presses of Command: a blunt grammar critique. The steer narrows what the next pass
  // judges; without one the prose is judged as it stands.
  "scan.critiqueTitle": "\u6587\u6CD5\u9510\u8BC4",
  "scan.pointCount": "{n} \u5904",
  "scan.noPoints": "\u8FD9\u4E00\u8282\u6CA1\u6311\u51FA\u6BDB\u75C5\u3002",
  "scan.critiqueThinking": "\u5728\u6311\u8FD9\u4E00\u8282\u7684\u6587\u6CD5\u6BDB\u75C5",
  "scan.critiqueThinking.1": "\u770B\u53E5\u5B50\u65AD\u5F97\u5BF9\u4E0D\u5BF9",
  "scan.critiqueThinking.2": "\u5728\u5199\u603B\u8BC4",
  "scan.steer": "\u6539\u8FDB\u65B9\u5411",
  "scan.steerHint": "\u7ED9\u4E0B\u4E00\u904D\u9510\u8BC4\u4E00\u4E2A\u91CD\u70B9\uFF0C\u6BD4\u5982\uFF1A\u628A\u5BF9\u8BDD\u5199\u5F97\u66F4\u53E3\u8BED",
  "scan.steerPlaceholder": "\u8FD9\u6B21\u91CD\u70B9\u770B\u4EC0\u4E48\uFF08\u53EF\u9009\uFF0CEnter \u8FD0\u884C\uFF09",
  // The rewrite dock's retry direction: what the next attempt should do differently.
  "rewrite.steer": "\u6539\u8FDB\u65B9\u5411",
  "rewrite.steerHint": "\u544A\u8BC9\u4E0B\u4E00\u6B21\u91CD\u5199\u8981\u600E\u4E48\u6539\uFF0C\u6BD4\u5982\uFF1A\u628A\u7ED3\u5C3E\u6536\u5F97\u66F4\u5FEB",
  "rewrite.steerPlaceholder": "\u8FD9\u6B21\u600E\u4E48\u6539\uFF08Enter \u91CD\u5199\uFF09",
  "scan.again": "\u91CD\u8BD5",
  // A change the chat proposed to the cast or the settings.
  "cast.add": "\u65B0\u589E",
  "cast.update": "\u66F4\u65B0",
  "tab.models": "\u6A21\u578B",
  // The model page: what each role does, and that leaving it alone follows dsh.
  "model.builtin": "\u5185\u7F6E\u6A21\u578B",
  "model.role.continue": "\u7EED\u5199",
  "model.role.suggest": "\u6DA6\u8272",
  "model.role.chat": "\u5BF9\u8BDD",
  "model.role.mosaic": "\u8C03\u67E5\u677F",
  "model.storedAt": "\u914D\u7F6E\u4FDD\u5B58\u5728 {file}",
  "model.saved": "\u2713 \u5DF2\u751F\u6548",
  "label.back": "\u8FD4\u56DE",
  "model.routeMissing": "\u4E3B\u673A\u91CC\u7684\u63D2\u4EF6\u8FD8\u662F\u65E7\u7248\u672C\uFF0C\u6CA1\u6709\u8FD9\u4E2A\u63A5\u53E3\u3002\u91CD\u542F dsh \u540E\u518D\u6253\u5F00\u8FD9\u4E00\u9875\u3002",
  "cast.target.character": "\u4EBA\u7269",
  "cast.target.setting": "\u8BBE\u5B9A",
  "cast.target.relationship": "\u5173\u7CFB",
  "action.applyCast": "\u5199\u5165\u4E66\u4E2D",
  "scan.kind.punctuation": "\u6807\u70B9",
  "scan.kind.grammar": "\u8BED\u6CD5",
  "scan.kind.wording": "\u7528\u8BCD",
  "scan.kind.repeat": "\u91CD\u590D",
  "scan.kind.consistency": "\u524D\u540E\u4E0D\u4E00",
  "label.chatButtonHint": "{critique} \u8BED\u6CD5\u68C0\u67E5 \xB7 {review} \u884C\u6587\u5BA1\u9605",
  // The field has no visible placeholder; this names it for a screen reader.
  "label.chatTitle": "\u5411 AI \u63D0\u95EE\u6216\u8BA9\u5B83\u63A5\u7740\u5199",
  "label.noModels": "\u6CA1\u6709\u53EF\u7528\u7684\u6A21\u578B",
  "label.effort": "\u5F3A\u5EA6",
  "label.model": "\u6A21\u578B",
  "label.dockExpand": "\u4E0A\u4E00\u6B21\u7684\u7ED3\u679C",
  "status.effortDefault": "\u9ED8\u8BA4",
  "label.thinking.1": "\u6B63\u5728\u8BFB\u4F60\u5199\u5230\u8FD9\u91CC\u7684\u5730\u65B9",
  "label.thinking.2": "\u627E\u4E0B\u4E00\u53E5\u7684\u8BED\u6C14",
  "label.thinking.3": "\u5FEB\u597D\u4E86",
  "label.saveNowHint": "\u4FDD\u5B58\uFF08\u2318/Ctrl + S\uFF09",
  "status.position": "\u7B2C {i} / {n} \u8282",
  "status.modelLabel": "\u6A21\u578B",
  "status.modelUnknown": "\u8DDF\u968F\u4F1A\u8BDD",
  "status.modelUnknownHint": "\u6CA1\u6709\u53D6\u5230\u89D2\u8272\u6A21\u578B\uFF0C\u4E24\u4E2A\u5199\u4F5C\u52A8\u4F5C\u90FD\u8DDF\u968F\u4F1A\u8BDD\u5F53\u524D\u6A21\u578B",
  "status.modelDetail": "\u5404\u89D2\u8272\u6A21\u578B",
  "role.continue": "\u7EED\u5199",
  "role.suggest": "\u4FEE\u6539",
  "role.mosaic": "\u8C03\u67E5\u677F",
  "role.chat": "\u5BF9\u8BDD",
  "status.noChapter": "\u672A\u9009\u62E9\u7AE0\u8282",
  "status.words": "{n} \u5B57",
  "status.saved": "{time} \u4FDD\u5B58",
  "status.unsaved": "\u672A\u4FDD\u5B58",
  "status.saveFailed": "\u6CA1\u80FD\u4FDD\u5B58",
  "label.fontSize": "\u5B57\u53F7",
  "label.lineHeight": "\u884C\u9AD8",
  "label.measure": "\u7248\u5FC3",
  // The steps the typography page offers, in words a writer would use.
  "type.size.small": "\u5C0F",
  "type.size.normal": "\u6807\u51C6",
  "type.size.large": "\u5927",
  "type.size.huge": "\u7279\u5927",
  "type.leading.tight": "\u7D27",
  "type.leading.normal": "\u6807\u51C6",
  "type.leading.loose": "\u677E",
  "type.measure.narrow": "\u7A84",
  "type.measure.normal": "\u6807\u51C6",
  "type.measure.wide": "\u5BBD",
  "action.resetTypography": "\u6062\u590D\u9ED8\u8BA4",
  "settings.library": "\u9ED8\u8BA4\u5B58\u4E66\u76EE\u5F55",
  "settings.libraryEmpty": "\u672A\u9009\u62E9\u76EE\u5F55",
  "settings.typography": "\u7248\u5F0F",
  "settings.keys": "\u5FEB\u6377\u952E",
  "keys.ask": "\u7EED\u5199",
  "keys.critique": "\u8BED\u6CD5\u68C0\u67E5",
  "keys.review": "\u884C\u6587\u5BA1\u9605",
  "keys.chat": "\u5BF9\u8BDD\u8F93\u5165\u6846",
  "keys.recording": "\u8BF7\u6309\u4E0B\u7EC4\u5408\u952E\u2026",
  "keys.recordHint": "\u70B9\u51FB\u540E\u6309\u4E0B\u65B0\u7684\u7EC4\u5408\u952E",
  "keys.reset": "\u6062\u590D\u9ED8\u8BA4",
  "keys.resetOne": "\u6062\u590D",
  "keys.resetHint": "\u628A\u8FD9\u4E00\u9879\u6062\u590D\u6210\u9ED8\u8BA4\u6309\u952E",
  "settings.saving": "\u4FDD\u5B58",
  "label.autoSave": "\u81EA\u52A8\u4FDD\u5B58",
  "autoSave.30s": "30 \u79D2",
  "autoSave.1m": "1 \u5206\u949F",
  "autoSave.5m": "5 \u5206\u949F",
  "autoSave.10m": "10 \u5206\u949F",
  "label.typePreview": "\u96E8\u843D\u5728\u7A97\u4E0A\uFF0C\u5979\u7B49\u4E0B\u4E00\u53E5\u8BDD\u81EA\u5DF1\u8D70\u8FC7\u6765\u3002",
  // The mosaic sheet: its own name, the way in, and the five right-edge bookmarks. One label
  // names both the feature and the button that opens it — the button sits in the title row
  // beside the drawers, and a second word for the same thing reads as two features. There is
  // no close label: Escape and a click on the dimmed area both dismiss it, and the sheet has
  // no chrome of its own to title.
  "mosaic.title": "\u8C03\u67E5\u677F",
  "mosaic.open": "\u8C03\u67E5\u677F",
  "mosaic.tab.relations": "\u5173\u7CFB\u7F51",
  "mosaic.deleteCardTitle": "\u5220\u9664\u300C{name}\u300D\uFF1F",
  "mosaic.tab.world": "\u4E16\u754C\u89C2",
  "mosaic.tab.cast": "\u89D2\u8272",
  "mosaic.tab.items": "\u7269\u54C1",
  "mosaic.tab.proposals": "\u63D0\u6848",
  // 流派: saved style prompts the writer can apply to generated prose.
  "mosaic.writingStyle.new": "\u65B0\u5EFA\u6D41\u6D3E",
  "mosaic.writingStyle.thinking": "\u751F\u6210\u98CE\u683C\u63CF\u8FF0",
  "mosaic.thinking.check": "\u68C0\u67E5\u672C\u7AE0",
  "mosaic.thinking.relate": "\u68B3\u7406\u5173\u7CFB",
  "mosaic.thinking.apply": "\u5199\u5165\u63D0\u6848",
  "mosaic.writingStyle.empty": "\u8FD8\u6CA1\u6709\u6D41\u6D3E\u3002",
  "mosaic.writingStyle.active": "\u4F7F\u7528\u4E2D",
  "mosaic.writingStyle.use": "\u8BBE\u4E3A\u5F53\u524D",
  "mosaic.writingStyle.name": "\u98CE\u683C\u540D\u79F0",
  "mosaic.writingStyle.prompt": "\u98CE\u683C\u63CF\u8FF0",
  "mosaic.writingStyle.source": "\u98CE\u683C\u6765\u6E90",
  "mosaic.writingStyle.generate": "\u751F\u6210",
  "mosaic.writingStyle.file": "\u4ECE\u6587\u4EF6\u8BFB\u53D6",
  "mosaic.writingStyle.save": "\u4FDD\u5B58",
  "mosaic.writingStyle.needName": "\u5148\u5199\u98CE\u683C\u540D\u79F0\u3002",
  "mosaic.writingStyle.needPrompt": "\u5148\u5199\u98CE\u683C\u63CF\u8FF0\u3002",
  "mosaic.writingStyle.needSource": "\u5148\u7ED9\u4E00\u6BB5\u7528\u6765\u63D0\u53D6\u98CE\u683C\u7684\u6587\u672C\u3002",
  "log.op.writingStyle.generate": "\u751F\u6210\u6D41\u6D3E",
  "mosaic.proposalsEmpty": "\u8FD8\u6CA1\u6709\u5F85\u5904\u7406\u7684\u63D0\u6848\u3002",
  "mosaic.proposalsPending": "\u5F85\u5904\u7406",
  "mosaic.proposalsAccepted": "\u5DF2\u63A5\u53D7",
  "mosaic.proposalsRejected": "\u5DF2\u62D2\u7EDD",
  "mosaic.proposalAccept": "\u63A5\u53D7",
  "mosaic.proposalReject": "\u62D2\u7EDD",
  "mosaic.proposalDelete": "\u5220\u9664",
  "mosaic.proposalFromCheck": "\u6765\u81EA\u68C0\u67E5\u672C\u7AE0",
  "mosaic.proposalFromRelate": "\u6765\u81EA\u68B3\u7406",
  "mosaic.proposalFromChat": "\u6765\u81EA\u5BF9\u8BDD",
  "mosaic.proposalChanges": "\u5904\u6539\u52A8",
  // 新建卡牌：标题行右侧的按钮，以及它的弹窗。
  "mosaic.new": "\u65B0\u5EFA",
  "mosaic.newTitle": "\u65B0\u5EFA\u5361\u724C",
  "mosaic.newKind": "\u7C7B\u578B",
  "mosaic.newKindRole": "\u89D2\u8272",
  "mosaic.newKindPlace": "\u5730\u70B9",
  "mosaic.newKindFaction": "\u7EC4\u7EC7",
  "mosaic.newKindItem": "\u7269\u54C1",
  "mosaic.newKindEvent": "\u4E8B\u4EF6",
  "mosaic.newSummary": "\u7B80\u4ECB",
  "mosaic.newDescription": "\u63CF\u8FF0",
  "mosaic.newName": "\u540D\u79F0",
  "mosaic.newRole": "\u8EAB\u4EFD",
  "mosaic.newRolePlaceholder": "\u4F8B\u5982\uFF1A\u4E3B\u89D2 \xB7 \u4FEE\u8868\u5320",
  "mosaic.newSubmit": "\u521B\u5EFA",
  "mosaic.newNeedName": "\u5148\u7ED9\u5B83\u8D77\u4E2A\u540D\u5B57\u3002",
  // The relations canvas: an entity the writer never named, the popover's section labels, and
  // the badge that marks an edge as history rather than present state.
  "mosaic.untitled": "\u672A\u547D\u540D",
  "mosaic.retired": "\u5DF2\u9690\u53BB",
  "mosaic.beliefs": "\u4EBA\u7269\u8BA4\u77E5",
  "mosaic.log": "\u53D8\u66F4\u8BB0\u5F55",
  "mosaic.statuses": "\u72B6\u6001",
  "mosaic.tags": "\u6807\u7B7E",
  // The static pages: the placeholders a page shows when it has nothing to list or an item has
  // no live holder.
  "mosaic.summaryPlaceholder": "\u672C\u7AE0\u6897\u6982\u2026",
  "mosaic.statusAddPlaceholder": "\u52A0\u4E00\u4E2A\u72B6\u6001\uFF0C\u56DE\u8F66\u786E\u8BA4",
  "mosaic.removeHint": "\u70B9\u51FB\u79FB\u9664",
  // The card panel: its own fields, and the portrait button.
  "mosaic.name": "\u540D\u5B57",
  "mosaic.role": "\u8EAB\u4EFD",
  "mosaic.rolePlaceholder": "\u8EAB\u4EFD\uFF0C\u4F8B\u5982 \u4E3B\u89D2 \xB7 \u4FEE\u8868\u5320",
  "mosaic.tagAddPlaceholder": "\u52A0\u4E00\u4E2A\u6807\u7B7E\uFF0C\u56DE\u8F66\u786E\u8BA4",
  "mosaic.generatePortrait": "\u751F\u6210\u914D\u56FE",
  "mosaic.regeneratePortrait": "\u91CD\u65B0\u751F\u6210\u914D\u56FE",
  "mosaic.portraitFailed": "\u751F\u56FE\u5931\u8D25",
  // The portrait settings, in the model drawer.
  "model.imageRole": "\u56FE\u50CF\u751F\u6210",
  "model.imageProvider": "\u670D\u52A1",
  "model.imageCustom": "\u81EA\u5B9A\u4E49\u63A5\u53E3",
  "model.test": "\u6D4B\u8BD5\u8FDE\u901A\u6027",
  "model.testing": "\u6D4B\u8BD5\u4E2D\u2026",
  "model.testOk": "\u8FDE\u63A5\u6B63\u5E38\uFF0C{n} \u4E2A\u6A21\u578B",
  "model.testNeedURL": "\u5148\u586B\u5199\u63A5\u53E3\u5730\u5740\u3002",
  "model.kind": "\u7528\u9014",
  "model.kindChat": "\u5BF9\u8BDD\u6A21\u578B",
  "model.kindImage": "\u751F\u56FE\u6A21\u578B",
  "model.custom": "\u81EA\u5B9A\u4E49\u6A21\u578B",
  "model.customAdd": "\u6DFB\u52A0\u6A21\u578B",
  "model.customEdit": "\u7F16\u8F91\u81EA\u5B9A\u4E49\u6A21\u578B",
  "model.customName": "\u540D\u79F0",
  "model.customBaseURL": "\u63A5\u53E3\u5730\u5740",
  "model.customKey": "API Key",
  "model.customKeyKeep": "\u7559\u7A7A\u5219\u4FDD\u7559\u5DF2\u4FDD\u5B58\u7684 Key",
  "model.customKeyStored": "Key \u5DF2\u4FDD\u5B58",
  "model.customKeyMissing": "\u672A\u586B Key",
  "model.customModels": "\u6A21\u578B",
  "model.customModelsLoading": "\u6B63\u5728\u8BFB\u53D6\u6A21\u578B\u2026",
  "model.customModelsHint": "\u586B\u5199\u63A5\u53E3\u5730\u5740\u540E\u81EA\u52A8\u8BFB\u53D6\u6A21\u578B\u3002",
  "model.customEmpty": "\u8FD8\u6CA1\u6709\u81EA\u5B9A\u4E49\u6A21\u578B\u3002",
  "model.customNeedFields": "\u540D\u79F0\u3001\u63A5\u53E3\u5730\u5740\u548C\u81F3\u5C11\u4E00\u4E2A\u6A21\u578B ID \u5FC5\u586B\u3002",
  "action.save": "\u4FDD\u5B58",
  "action.edit": "\u7F16\u8F91",
  "model.imageModel": "\u751F\u56FE\u6A21\u578B",
  "model.imageStyle": "\u98CE\u683C",
  "model.style.realistic": "\u771F\u5B9E",
  "model.style.anime": "\u52A8\u6F2B",
  "model.style.pixel": "\u50CF\u7D20",
  "model.style.sketch": "\u7D20\u63CF",
  "mosaic.empty": "\u6682\u65E0\u5185\u5BB9",
  "mosaic.noHolder": "\u65E0\u4EBA\u6301\u6709",
  "mosaic.editEntry": "\u7F16\u8F91",
  "action.done": "\u5B8C\u6210",
  "mosaic.field.kind": "\u5206\u7C7B",
  "mosaic.field.role": "\u8EAB\u4EFD",
  "mosaic.field.gender": "\u6027\u522B",
  "mosaic.field.age": "\u5E74\u9F84",
  "mosaic.field.nationality": "\u56FD\u7C4D",
  "mosaic.field.appearance": "\u5916\u8C8C",
  "mosaic.field.personality": "\u6027\u683C",
  "mosaic.field.motivation": "\u52A8\u673A",
  "mosaic.field.arc": "\u6210\u957F\u7EBF",
  "mosaic.field.location": "\u4F4D\u7F6E",
  "mosaic.field.atmosphere": "\u6C1B\u56F4",
  "mosaic.field.controlledBy": "\u63A7\u5236\u8005",
  "mosaic.field.purpose": "\u5B97\u65E8",
  "mosaic.field.base": "\u9A7B\u5730",
  "mosaic.field.leader": "\u9996\u9886",
  "mosaic.field.members": "\u6210\u5458",
  "mosaic.field.origin": "\u6765\u6E90",
  "mosaic.field.holder": "\u6301\u6709\u8005",
  "mosaic.field.significance": "\u610F\u4E49",
  "mosaic.field.when": "\u65F6\u95F4",
  "mosaic.field.where": "\u5730\u70B9",
  "mosaic.field.participants": "\u53C2\u4E0E\u8005",
  "mosaic.field.consequence": "\u540E\u679C",
  "mosaic.custom": "\u81EA\u5B9A\u4E49",
  "mosaic.customLabelPlaceholder": "\u5B57\u6BB5\u540D",
  "mosaic.customValuePlaceholder": "\u5185\u5BB9",
  "mosaic.field.tags": "\u6807\u7B7E",
  "mosaic.field.relations": "\u5173\u7CFB",
  "mosaic.field.retired": "\u5DF2\u7ED3\u675F",
  "mosaic.summaryLabel": "\u624B\u5199\u6897\u6982",
  "mosaic.overviewLabel": "\u751F\u6210\u6982\u89C8",
  "mosaic.overviewEmpty": "\u8FD8\u6CA1\u6709\u751F\u6210\u8FD9\u4E00\u7AE0\u7684\u6982\u89C8\u3002",
  "mosaic.bodyLabel": "\u6B63\u6587",
  "mosaic.bodyEmpty": "\u8FD9\u4E00\u7AE0\u8FD8\u6CA1\u6709\u6B63\u6587\u3002",
  "mosaic.chapterEmpty": "\u8FD9\u672C\u4E66\u8FD8\u6CA1\u6709\u7AE0\u8282\u3002",
  "mosaic.beliefCount": "\u53E6\u6709 {n} \u6761\u4E0E\u4E8B\u5B9E\u4E0D\u540C\u7684\u8BA4\u77E5",
  "mosaic.focusOn": "\u805A\u7126",
  "mosaic.focusNone": "\u5168\u90E8",
  "mosaic.view": "\u89C6\u89D2",
  "mosaic.viewAll": "\u5168\u90E8",
  "mosaic.viewCharacter": "\u4EBA\u7269",
  "mosaic.viewCard": "\u7269\u54C1\u4E0E\u8BBE\u5B9A",
  "mosaic.focusClear": "\u53D6\u6D88\u805A\u7126",
  // The review flow on the relations page: the check and ask entries, the review card's
  // verbs, and the one op name per change kind the model can propose. Only the ops the
  // board actually executes get a name — the dead-key test keeps the rest out.
  "mosaic.check": "\u68C0\u67E5\u672C\u7AE0",
  "mosaic.relate": "\u68B3\u7406",
  "mosaic.relateEmpty": "\u5361\u7247\u7B80\u4ECB\u91CC\u6CA1\u6709\u8BFB\u51FA\u65B0\u7684\u5173\u7CFB\u3002",
  "mosaic.relateFound": "\u68B3\u7406\u51FA {n} \u6761\u5173\u7CFB\uFF0C\u91C7\u7EB3\u540E\u5199\u5165\u3002",
  "mosaic.checkEmpty": "\u6CA1\u6709\u53D1\u73B0\u9700\u8981\u8BB0\u5F55\u7684\u53D8\u5316\u3002",
  "mosaic.proposalTitle": "\u672C\u7AE0\u63D0\u6848",
  "mosaic.accept": "\u91C7\u7EB3",
  "mosaic.acceptAll": "\u5168\u90E8\u91C7\u7EB3",
  "mosaic.reject": "\u9A73\u56DE",
  "mosaic.apply": "\u5199\u5165",
  "mosaic.applied": "\u5DF2\u5199\u5165 {applied} \u6761\uFF0C\u8DF3\u8FC7 {skipped} \u6761\u3002",
  "mosaic.op.entity.upsert": "\u65B0\u589E\u6216\u66F4\u65B0",
  "mosaic.op.edge.upsert": "\u65B0\u589E\u6216\u66F4\u65B0\u5173\u7CFB",
  "mosaic.op.belief.add": "\u8865\u5145\u4EBA\u7269\u8BA4\u77E5",
  "mosaic.op.status.add": "\u65B0\u589E\u72B6\u6001",
  "mosaic.op.status.remove": "\u79FB\u9664\u72B6\u6001",
  "mosaic.op.edge.retire": "\u9690\u53BB\u5173\u7CFB"
};
var EN = {
  "action.expand": "Expand",
  "action.collapse": "Collapse",
  "action.removeNode": "Delete",
  "label.untitledVolume": "Untitled volume",
  "label.untitledSection": "Untitled section",
  "action.aiTrigger": "Polish",
  "label.aiTriggerHint": "Select to revise, leave empty to continue",
  "label.nothingToSuggest": "Nothing to continue from here.",
  "label.workspacePrefix": "writer",
  "action.openChat": "Harness",
  "label.noLayout": "Panel switching is unavailable; use the conversation icon in the sidebar.",
  "label.noWorkspaceService": "Workspace service unavailable; cannot open a session.",
  "label.noWorkspaceForBook": "Could not register this book folder as a workspace, so no conversation can start in it. Check that the folder still exists and is writable.",
  "label.library": "Library",
  "label.bookCount": "{n} books",
  "label.bookMeta": "{c} sections \xB7 {f} written",
  "label.newBookTitle": "Book title",
  "action.create": "Create",
  "action.cancel": "Cancel",
  "action.open": "Open",
  "action.choose": "Choose folder",
  "action.newBook": "New book",
  "label.backToBook": "Back to \u201C{title}\u201D",
  "level.volume": "Untitled volume",
  "level.chapter": "Untitled chapter",
  "level.section": "Untitled section",
  "action.manuscript": "View manuscript",
  "label.emptyManuscript": "No finalized text yet.",
  "action.consistency": "Check continuity",
  "label.consistencyReport": "Continuity check",
  "label.noIssues": "No contradictions found.",
  "consistency.kind.name": "Name",
  "consistency.kind.detail": "Detail",
  "consistency.kind.timeline": "Timeline",
  "consistency.kind.fact": "Fact",
  "action.showRail": "Contents",
  "action.hideRail": "Hide contents",
  "action.cardActions": "More actions",
  "action.editCard": "Edit",
  "action.deleteCard": "Delete",
  "welcome.begin": "BEGIN YOUR JOURNEY",
  "welcome.lede": "On wings of words, from this world to the next.",
  "welcome.newBook": "New book",
  "welcome.library": "Open library",
  "welcome.back": "Back to book",
  "rail.start": "Start",
  "rail.shelf": "Shelf",
  "rail.open": "Open folder",
  "rail.save": "Save",
  "rail.export": "Export",
  "rail.about": "About",
  "about.name": "Product",
  "about.version": "Version",
  "about.author": "Author",
  "rail.saveHint": "\u2318/Ctrl + S",
  "rail.exportEmpty": "This book has no prose yet, so there is nothing to export.",
  "rail.exportDone": "Exported {name}",
  "rail.savedNow": "Saved",
  "action.send": "Send",
  panel: "Planar Aerial",
  "brand.full": "Planar Aerial",
  "brand.lead": "Planar ",
  "brand.accent": "Aerial",
  "brand.latin": "Planar Aerial",
  "tab.chapters": "Chapters",
  "tab.settings": "Setting",
  "tab.characters": "Characters",
  "tab.relationships": "Relationships",
  "tab.versions": "Versions",
  "tab.overview": "Overview",
  "tab.writingStyles": "Writing styles",
  "action.accept": "Accept",
  "action.retry": "Retry",
  "action.reject": "Discard",
  "action.addUnder": "New section",
  "action.rename": "Save",
  "action.renameNode": "Rename",
  "label.removeNodeConfirm": 'Delete "{title}"?',
  "label.removeNodeChildren": "It also removes {c} containers and {n} sections.",
  "label.removeNodeChars": "{n} characters in total.",
  "label.removeNodeWarn": "This cannot be undone. Take a snapshot first if you want it back.",
  "label.renameBookHint": "New title (also renames the folder)",
  "action.delete": "Delete",
  "label.deleteBookConfirm": "Delete \u201C{title}\u201D?",
  "label.deleteFilesToo": "Also delete the book folder and its files",
  "label.deleteFilesWarn": "The whole folder goes, manuscript and snapshots included. This cannot be undone.",
  "label.deleteManifestOnly": "Remove it from the shelf only; the folder and files stay on disk.",
  "label.emptyNode": "empty",
  "label.charCount": "{n} chars",
  "action.ok": "OK",
  "label.writeBeforeContinue": "Write something first so the AI has somewhere to continue from.",
  "label.noRelationships": "No relationships yet.",
  "action.close": "Close",
  "label.workspaceLeftBehind": "The book was deleted but its workspace could not be removed; delete it from the sidebar.",
  "action.snapshot": "Snapshot",
  "action.restore": "Restore",
  "action.refresh": "Refresh",
  "label.emptyChapters": "No chapters yet. Create one to start.",
  "label.loading": "Loading\u2026",
  "label.loadFailed": "Could not read this book's book.json. Check that the file is still there.",
  "label.recovered": "book.json was damaged; it was backed up as book.json.bak and replaced with an empty draft.",
  "label.overviewGlobal": "Whole book",
  "label.overviewProgress": "Sections {c} \xB7 Written {f}/{t} \xB7 Characters {p}",
  "label.snapshotLabel": "Manual snapshot",
  "chapter.defaultTitle": "Chapter {n}",
  "tab.typography": "Settings",
  "action.find": "Find",
  "label.findHint": "Ctrl / \u2318 + F",
  "label.findPlaceholder": "Find\u2026",
  "label.findPrev": "Previous",
  "label.findNext": "Next",
  "label.matchCount": "{i} / {n}",
  "label.noMatches": "No matches",
  "label.thinking": "Thinking of the next line",
  "action.insert": "Insert",
  "action.ask": "Q&A",
  "action.answers": "History",
  "action.copy": "Copy",
  "mcp.title": "MCP",
  "mcp.endpoint": "Endpoint",
  "mcp.config": "Config",
  "mcp.connected": "Connected",
  "mcp.waiting": "Waiting",
  "mcp.launch": "Open Harness",
  "label.noAnswers": "No answers yet.",
  "log.empty": "No events yet.",
  "log.time": "Time",
  "log.name": "Event",
  "log.detail": "Result",
  "log.page.answers": "Answer history",
  "log.page.events": "Activity log",
  "log.filter.all": "All types",
  "log.filter.byType": "Filter by event type",
  "notes.title": "Notes",
  "notes.placeholder": "Capture the idea before it goes\u2026",
  "notes.untitled": "Blank note",
  "notes.pick": "Pick a note on the left.",
  "log.refresh": "Refresh",
  "log.op.save": "Save",
  "log.op.book.create": "New book",
  "log.op.book.delete": "Delete book",
  "log.op.book.rename": "Rename",
  "log.op.snapshot": "Snapshot",
  "log.op.restore": "Restore",
  "log.op.answer": "Answer stored",
  "log.op.route.error": "Error",
  "log.op.continue": "Continue",
  "log.op.rewrite": "Rewrite",
  "log.op.chat": "Chat",
  "log.op.style": "Style profile",
  "log.op.review": "Review",
  "log.op.critique": "Critique",
  "log.op.portrait": "Portrait",
  "log.op.board.check": "Board check",
  "log.op.board.ask": "Board Q&A",
  "log.op.board.relate": "Sort relations",
  "log.op.manuscript": "View manuscript",
  "log.op.consistency": "Continuity check",
  "log.op.overview": "Refresh overview",
  "log.op.model": "Model call",
  "scan.reviewTitle": "Problems in this section",
  "scan.issueCount": "{n} found",
  "scan.noIssues": "Nothing to fix in this section.",
  "scan.truncated": "The answer hit its length limit, so this list may be incomplete. Try the other half of the section",
  "scan.reviewThinking": "Reading this section for problems",
  "scan.reviewThinking.1": "Checking punctuation and sentence breaks",
  "scan.reviewThinking.2": "Nearly done",
  "scan.critiqueTitle": "Grammar critique",
  "scan.pointCount": "{n} points",
  "scan.noPoints": "No grammar problems in this section.",
  "scan.critiqueThinking": "Judging the grammar of this section",
  "scan.critiqueThinking.1": "Checking how the sentences break",
  "scan.critiqueThinking.2": "Writing the verdict",
  "scan.steer": "Steer",
  "scan.steerHint": "Give the next pass a focus, e.g. make the dialogue more colloquial",
  "scan.steerPlaceholder": "What should this pass focus on? (optional, Enter to run)",
  "rewrite.steer": "Steer",
  "rewrite.steerHint": "Tell the next rewrite what to change, e.g. end the scene sooner",
  "rewrite.steerPlaceholder": "How should it change? (Enter to rewrite)",
  "scan.again": "Retry",
  "cast.add": "Add",
  "cast.update": "Update",
  "tab.models": "Models",
  "model.builtin": "Built-in model",
  "model.role.continue": "Continuation",
  "model.role.suggest": "Rewrite",
  "model.role.chat": "Chat",
  "model.role.mosaic": "Mosaic board",
  "model.storedAt": "Kept in {file}",
  "model.saved": "\u2713 Saved",
  "label.back": "Back",
  "model.routeMissing": "The host is running an older copy of the plugin and has no such route. Restart dsh and reopen this page.",
  "cast.target.character": "Character",
  "cast.target.setting": "Setting",
  "cast.target.relationship": "Relationship",
  "action.applyCast": "Write into the book",
  "scan.kind.punctuation": "Punctuation",
  "scan.kind.grammar": "Grammar",
  "scan.kind.wording": "Wording",
  "scan.kind.repeat": "Repeat",
  "scan.kind.consistency": "Inconsistent",
  "label.chatButtonHint": "{critique} grammar \xB7 {review} prose",
  "label.chatTitle": "Ask the AI, or have it write from here",
  "label.noModels": "No models available",
  "label.effort": "Effort",
  // The composer's menu labels its first row 模型/Model. Only the Chinese dictionary had this
  // key, so the English panel showed the raw key name in that row.
  "label.model": "Model",
  "label.dockExpand": "Last result",
  "status.effortDefault": "default",
  "label.thinking.1": "Reading where you stopped",
  "label.thinking.2": "Finding the voice",
  "label.thinking.3": "Almost there",
  "label.saveNowHint": "Save (\u2318/Ctrl + S)",
  "status.position": "Section {i} of {n}",
  "status.modelLabel": "Model",
  "status.modelUnknown": "session default",
  "status.modelUnknownHint": "No role models were reported; both writing actions use the session model",
  "status.modelDetail": "Models by role",
  "role.continue": "Continue",
  "role.suggest": "Revise",
  "role.mosaic": "Board",
  "role.chat": "Chat",
  "status.noChapter": "No section selected",
  "status.words": "{n} words",
  "status.saved": "saved {time}",
  "status.unsaved": "unsaved",
  "status.saveFailed": "not saved",
  "label.fontSize": "Size",
  "label.lineHeight": "Line height",
  "label.measure": "Measure",
  "type.size.small": "S",
  "type.size.normal": "M",
  "type.size.large": "L",
  "type.size.huge": "XL",
  "type.leading.tight": "Tight",
  "type.leading.normal": "Normal",
  "type.leading.loose": "Loose",
  "type.measure.narrow": "Narrow",
  "type.measure.normal": "Normal",
  "type.measure.wide": "Wide",
  "action.resetTypography": "Reset to defaults",
  "settings.library": "Library folder",
  "settings.libraryEmpty": "No folder selected",
  "settings.typography": "Page",
  "settings.keys": "Shortcuts",
  "keys.ask": "Continue",
  "keys.critique": "Grammar",
  "keys.review": "Read as prose",
  "keys.chat": "Composer",
  "keys.recording": "Press the chord\u2026",
  "keys.recordHint": "Click, then press the new chord",
  "keys.reset": "Restore defaults",
  "keys.resetOne": "Reset",
  "keys.resetHint": "Put this one back on its default key",
  "settings.saving": "Saving",
  "label.autoSave": "Auto-save",
  "autoSave.30s": "30s",
  "autoSave.1m": "1 min",
  "autoSave.5m": "5 min",
  "autoSave.10m": "10 min",
  "label.typePreview": "Rain worked down the window; she waited for the next sentence.",
  // The mosaic sheet: same keys as the Chinese block. The open button and the sheet title
  // share one word for the same reason as above.
  "mosaic.title": "Mosaic board",
  "mosaic.open": "Mosaic board",
  "mosaic.tab.relations": "Relations",
  "mosaic.deleteCardTitle": 'Delete "{name}"?',
  "mosaic.tab.world": "World",
  "mosaic.tab.cast": "Cast",
  "mosaic.tab.items": "Items",
  "mosaic.tab.proposals": "Proposals",
  // 流派: saved style prompts the writer can apply to generated prose.
  "mosaic.writingStyle.new": "New writing style",
  "mosaic.writingStyle.thinking": "Generating style prompt",
  "mosaic.thinking.check": "Checking this chapter",
  "mosaic.thinking.relate": "Sorting relations",
  "mosaic.thinking.apply": "Writing the changes",
  "mosaic.writingStyle.empty": "No writing styles yet.",
  "mosaic.writingStyle.active": "In use",
  "mosaic.writingStyle.use": "Use this one",
  "mosaic.writingStyle.name": "Name",
  "mosaic.writingStyle.prompt": "Style prompt",
  "mosaic.writingStyle.source": "Source text",
  "mosaic.writingStyle.generate": "Generate",
  "mosaic.writingStyle.file": "Read from file",
  "mosaic.writingStyle.save": "Save",
  "mosaic.writingStyle.needName": "Give the writing style a name.",
  "mosaic.writingStyle.needPrompt": "Write the style prompt first.",
  "mosaic.writingStyle.needSource": "Paste some text to extract a style from.",
  "log.op.writingStyle.generate": "Generate writing style",
  "mosaic.proposalsEmpty": "No proposals waiting.",
  "mosaic.proposalsPending": "Pending",
  "mosaic.proposalsAccepted": "Accepted",
  "mosaic.proposalsRejected": "Rejected",
  "mosaic.proposalAccept": "Accept",
  "mosaic.proposalReject": "Reject",
  "mosaic.proposalDelete": "Delete",
  "mosaic.proposalFromCheck": "From checking a chapter",
  "mosaic.proposalFromRelate": "From sorting relations",
  "mosaic.proposalFromChat": "From the conversation",
  "mosaic.proposalChanges": "changes",
  // Creating a card: the button at the title row's trailing edge, and its dialog.
  "mosaic.new": "New",
  "mosaic.newTitle": "New card",
  "mosaic.newKind": "Kind",
  "mosaic.newKindRole": "Character",
  "mosaic.newKindPlace": "Place",
  "mosaic.newKindFaction": "Faction",
  "mosaic.newKindItem": "Item",
  "mosaic.newKindEvent": "Event",
  "mosaic.newSummary": "Summary",
  "mosaic.newDescription": "Description",
  "mosaic.newName": "Name",
  "mosaic.newRole": "Role",
  "mosaic.newRolePlaceholder": "e.g. the protagonist",
  "mosaic.newSubmit": "Create",
  "mosaic.newNeedName": "It needs a name first.",
  // Same keys as the Chinese block: the canvas labels and the retired badge.
  "mosaic.untitled": "Untitled",
  "mosaic.retired": "Retired",
  "mosaic.beliefs": "Beliefs",
  "mosaic.log": "Change log",
  "mosaic.statuses": "Statuses",
  "mosaic.tags": "Tags",
  // Same keys as the Chinese block: the four static pages' copy.
  "mosaic.summaryPlaceholder": "Chapter summary\u2026",
  "mosaic.statusAddPlaceholder": "Add a status, Enter to confirm",
  "mosaic.removeHint": "Click to remove",
  "mosaic.name": "Name",
  "mosaic.role": "Role",
  "mosaic.rolePlaceholder": "Role, e.g. protagonist \xB7 watchmaker",
  "mosaic.tagAddPlaceholder": "Add a tag, Enter to confirm",
  "mosaic.generatePortrait": "Generate an image",
  "mosaic.regeneratePortrait": "Generate the image again",
  "mosaic.portraitFailed": "The image could not be generated",
  "model.imageRole": "Image generation",
  "model.imageProvider": "Provider",
  "model.imageCustom": "Custom endpoint",
  "model.test": "Test connection",
  "model.testing": "Testing\u2026",
  "model.testOk": "Connected, {n} models",
  "model.testNeedURL": "Enter an endpoint first.",
  "model.kind": "Use",
  "model.kindChat": "Chat model",
  "model.kindImage": "Image model",
  "model.custom": "Custom models",
  "model.customAdd": "Add model",
  "model.customEdit": "Edit custom model",
  "model.customName": "Name",
  "model.customBaseURL": "Endpoint",
  "model.customKey": "API key",
  "model.customKeyKeep": "Leave blank to keep the saved key",
  "model.customKeyStored": "Key saved",
  "model.customKeyMissing": "No key",
  "model.customModels": "Models",
  "model.customModelsLoading": "Loading models\u2026",
  "model.customModelsHint": "Enter an endpoint to load its models.",
  "model.customEmpty": "No custom models yet.",
  "model.customNeedFields": "Name, endpoint and at least one model ID are required.",
  "action.save": "Save",
  "action.edit": "Edit",
  "model.imageModel": "Image model",
  "model.imageStyle": "Style",
  "model.style.realistic": "Realistic",
  "model.style.anime": "Anime",
  "model.style.pixel": "Pixel",
  "model.style.sketch": "Sketch",
  "mosaic.empty": "Nothing here yet",
  "mosaic.noHolder": "No holder",
  "mosaic.editEntry": "Edit",
  "action.done": "Done",
  "mosaic.field.kind": "Category",
  "mosaic.field.role": "Role",
  "mosaic.field.gender": "Gender",
  "mosaic.field.age": "Age",
  "mosaic.field.nationality": "Nationality",
  "mosaic.field.appearance": "Appearance",
  "mosaic.field.personality": "Personality",
  "mosaic.field.motivation": "Motivation",
  "mosaic.field.arc": "Arc",
  "mosaic.field.location": "Location",
  "mosaic.field.atmosphere": "Atmosphere",
  "mosaic.field.controlledBy": "Controlled by",
  "mosaic.field.purpose": "Purpose",
  "mosaic.field.base": "Base",
  "mosaic.field.leader": "Leader",
  "mosaic.field.members": "Members",
  "mosaic.field.origin": "Origin",
  "mosaic.field.holder": "Holder",
  "mosaic.field.significance": "Significance",
  "mosaic.field.when": "When",
  "mosaic.field.where": "Where",
  "mosaic.field.participants": "Participants",
  "mosaic.field.consequence": "Consequence",
  "mosaic.custom": "Custom fields",
  "mosaic.customLabelPlaceholder": "Field",
  "mosaic.customValuePlaceholder": "Value",
  "mosaic.field.tags": "Tags",
  "mosaic.field.relations": "Relations",
  "mosaic.field.retired": "Ended",
  "mosaic.summaryLabel": "Your summary",
  "mosaic.overviewLabel": "Generated overview",
  "mosaic.overviewEmpty": "No overview for this chapter yet.",
  "mosaic.bodyLabel": "Text",
  "mosaic.bodyEmpty": "This chapter has no text yet.",
  "mosaic.chapterEmpty": "This book has no chapters yet.",
  "mosaic.beliefCount": "{n} belief(s) differ from the truth",
  "mosaic.focusOn": "Focus",
  "mosaic.focusNone": "Everything",
  "mosaic.view": "Show",
  "mosaic.viewAll": "All",
  "mosaic.viewCharacter": "People",
  "mosaic.viewCard": "Things and places",
  "mosaic.focusClear": "Clear centre",
  "mosaic.check": "Check this chapter",
  "mosaic.relate": "Sort relations",
  "mosaic.relateEmpty": "The card descriptions do not describe any new relation.",
  "mosaic.relateFound": "Found {n} relation(s); accept them to draw the lines.",
  "mosaic.checkEmpty": "No changes worth recording.",
  "mosaic.proposalTitle": "Chapter proposal",
  "mosaic.accept": "Accept",
  "mosaic.acceptAll": "Accept all",
  "mosaic.reject": "Reject",
  "mosaic.apply": "Apply",
  "mosaic.applied": "{applied} change(s) written, {skipped} skipped.",
  "mosaic.op.entity.upsert": "Add or update",
  "mosaic.op.edge.upsert": "Add or update relation",
  "mosaic.op.belief.add": "Add belief",
  "mosaic.op.status.add": "Add status",
  "mosaic.op.status.remove": "Remove status",
  "mosaic.op.edge.retire": "Retire relation"
};

// src/client/shared/storage.js
var STORAGE_KEYS = {
  lastError: "dsh.storywriting.lastError",
  lastBook: "dsh.storywriting.lastBook",
  welcomeSeen: "dsh.storywriting.welcomeSeen",
  mosaicOpen: "dsh.storywriting.mosaicOpen",
  mosaicTab: "dsh.storywriting.mosaicTab",
  chords: "dsh.storywriting.chords",
  typography: "dsh.storywriting.typography",
  autoSaveMs: "dsh.storywriting.autoSaveMs"
};
function storageAvailable() {
  try {
    return typeof window !== "undefined" && window.localStorage !== void 0 && window.localStorage !== null;
  } catch {
    return false;
  }
}
function readStored(key) {
  try {
    if (typeof window === "undefined" || window.localStorage === void 0) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStored(key, value) {
  try {
    if (typeof window === "undefined" || window.localStorage === void 0) return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

// src/client/shared/react.js
var React = require("react");
var h = React.createElement;

// src/client/shared/logic.js
function diffWords(before, after) {
  const a = Array.from(before ?? "");
  const b = Array.from(after ?? "");
  if (a.length === 0) return b.length === 0 ? [] : [{ type: "add", text: b.join("") }];
  if (b.length === 0) return [{ type: "del", text: a.join("") }];
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1;
  const left = a.slice(prefix);
  const right = b.slice(prefix);
  const n = left.length, m = right.length;
  const out = [];
  if (prefix > 0) out.push({ type: "same", text: a.slice(0, prefix).join("") });
  if (n === 0 && m === 0) return out;
  if (n === 0) out.push({ type: "add", text: right.join("") });
  else if (m === 0) out.push({ type: "del", text: left.join("") });
  else {
    const width = m + 1;
    const lcs = new Uint32Array((n + 1) * width);
    for (let i2 = n - 1; i2 >= 0; i2 -= 1) {
      const row = i2 * width;
      const below = row + width;
      for (let j2 = m - 1; j2 >= 0; j2 -= 1) {
        lcs[row + j2] = left[i2] === right[j2] ? lcs[below + j2 + 1] + 1 : Math.max(lcs[below + j2], lcs[row + j2 + 1]);
      }
    }
    const raw = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (left[i] === right[j]) {
        raw.push({ type: "same", text: left[i] });
        i += 1;
        j += 1;
      } else if (lcs[(i + 1) * width + j] >= lcs[i * width + j + 1]) {
        raw.push({ type: "del", text: left[i] });
        i += 1;
      } else {
        raw.push({ type: "add", text: right[j] });
        j += 1;
      }
    }
    for (; i < n; i += 1) raw.push({ type: "del", text: left[i] });
    for (; j < m; j += 1) raw.push({ type: "add", text: right[j] });
    for (const seg of raw) {
      const last = out[out.length - 1];
      if (last && last.type === seg.type) last.text += seg.text;
      else out.push({ ...seg });
    }
  }
  return out;
}
function patchRow(list, id, key, value) {
  return (list ?? []).map((row) => row.id === id ? { ...row, [key]: value } : row);
}
function appendRow(list, row) {
  return [...list ?? [], row];
}
function removeRow(list, id) {
  return (list ?? []).filter((row) => row.id !== id);
}
function rowId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10).padEnd(8, "0")}`;
}
function clockTime(at) {
  const value = Number(at);
  if (!Number.isFinite(value) || value <= 0) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function findMatches(text, query, caseSensitive = false) {
  if (typeof text !== "string" || typeof query !== "string" || query === "") return [];
  const haystack = caseSensitive ? text : text.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  const hits = [];
  let from = 0;
  for (; ; ) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) break;
    hits.push({ start: at, end: at + needle.length });
    from = at + needle.length;
    if (hits.length > 2e3) break;
  }
  return hits;
}
function paintRuns(text, options = {}) {
  const source = text ?? "";
  if (source === "") return [{ text: "", hit: false, active: false, selected: false }];
  const selection = options.selection;
  const selFrom = selection !== void 0 && selection !== null && Number.isInteger(selection.start) ? selection.start : -1;
  const selTo = selection !== void 0 && selection !== null && Number.isInteger(selection.end) ? selection.end : -1;
  const hasSelection = selFrom >= 0 && selTo > selFrom;
  const hits = Array.isArray(options.hits) ? options.hits : [];
  const activeIndex = Number.isInteger(options.activeIndex) ? options.activeIndex : -1;
  const cuts = /* @__PURE__ */ new Set([0, source.length]);
  if (hasSelection) {
    cuts.add(Math.max(0, Math.min(source.length, selFrom)));
    cuts.add(Math.max(0, Math.min(source.length, selTo)));
  }
  const marks = hits.filter((hit) => hit.start >= 0 && hit.end <= source.length && hit.start < hit.end);
  for (const hit of marks) {
    cuts.add(hit.start);
    cuts.add(hit.end);
  }
  const points = [...cuts].sort((a, b) => a - b);
  const runs = [];
  let cursor = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    if (from === to) continue;
    while (cursor < marks.length && marks[cursor].end <= from) cursor += 1;
    const on = cursor < marks.length && marks[cursor].start <= from && marks[cursor].end >= to;
    runs.push({
      text: source.slice(from, to),
      hit: on,
      active: on && cursor === activeIndex,
      selected: hasSelection && from >= selFrom && to <= selTo
    });
  }
  return runs.length === 0 ? [{ text: source, hit: false, active: false, selected: false }] : runs;
}
function createHistory(initial = "", options = {}) {
  const limit = options.limit ?? 200;
  const mergeWindow = options.mergeWindow ?? 700;
  const now = options.now ?? (() => Date.now());
  const entries = [{ text: initial, start: 0, end: 0, at: now() }];
  let cursor = 0;
  let typing = false;
  const current = () => entries[cursor];
  return {
    /** The text to show. */
    text() {
      return current().text;
    },
    /** The caret that belonged to that text. */
    caret() {
      return { start: current().start, end: current().end };
    },
    /**
     * Record an edit.
     *
     * @param next - the text after the edit
     * @param caret - `{ start, end }` of the caret after the edit
     * @param kind - `'type'` merges with the previous typing entry inside the merge window;
     *               `'replace'` (an AI rewrite, a paste over a selection) always starts a new one
     * @returns false when the text did not actually change
     */
    record(next, caret, kind = "type") {
      const top = current();
      if (next === top.text) return false;
      const at = { start: caret?.start ?? next.length, end: caret?.end ?? caret?.start ?? next.length };
      const mergeable = kind === "type" && typing && cursor === entries.length - 1 && now() - top.at <= mergeWindow;
      if (mergeable) {
        entries[cursor] = { text: next, start: at.start, end: at.end, at: now() };
      } else {
        entries.splice(cursor + 1);
        entries.push({ text: next, start: at.start, end: at.end, at: now() });
        if (entries.length > limit) entries.shift();
        cursor = entries.length - 1;
      }
      typing = kind === "type";
      return true;
    },
    /** Step back. Answers the state to restore, or undefined when already at the oldest entry. */
    undo() {
      if (cursor === 0) return void 0;
      cursor -= 1;
      typing = false;
      return current();
    },
    /** Step forward. Answers the state to restore, or undefined when at the newest entry. */
    redo() {
      if (cursor >= entries.length - 1) return void 0;
      cursor += 1;
      typing = false;
      return current();
    },
    /** Drop everything and start again from `text`, e.g. when another chapter is opened. */
    reset(text = "") {
      entries.length = 0;
      entries.push({ text, start: 0, end: 0, at: now() });
      cursor = 0;
      typing = false;
    },
    canUndo() {
      return cursor > 0;
    },
    canRedo() {
      return cursor < entries.length - 1;
    },
    size() {
      return entries.length;
    }
  };
}
function renderMarkdownBlocks(markdown) {
  const lines = String(markdown ?? "").split("\n");
  const blocks = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "p", spans: inlineSpans(paragraph.join(" ")) });
    paragraph = [];
  };
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading !== null) {
      flush();
      blocks.push({ type: "h", level: heading[1].length, spans: inlineSpans(heading[2]) });
      continue;
    }
    if (line.trim() === "") {
      flush();
      continue;
    }
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      flush();
      blocks.push({ type: "hr" });
      continue;
    }
    paragraph.push(line.trim());
  }
  flush();
  return blocks;
}
function inlineSpans(text) {
  const chars = String(text ?? "");
  const spans = [];
  let at = 0;
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let match;
  while ((match = pattern.exec(chars)) !== null) {
    if (match.index > at) spans.push({ text: chars.slice(at, match.index), style: "" });
    if (match[1] !== void 0) spans.push({ text: match[1], style: "bold" });
    else spans.push({ text: match[2], style: "italic" });
    at = match.index + match[0].length;
  }
  if (at < chars.length) spans.push({ text: chars.slice(at), style: "" });
  return spans.length === 0 ? [{ text: "", style: "" }] : spans;
}
function routeChatQuestion(selection) {
  const passage = typeof selection === "string" ? selection : "";
  return passage.trim() === "" ? "chat" : "rewrite";
}
var TYPOGRAPHY_DEFAULT = { fontSize: 16, lineHeight: 1.9, width: 760 };
var TYPOGRAPHY_BOUNDS = { fontSize: [12, 22], lineHeight: [1.5, 2.2], width: [600, 1100] };
var TYPE_PRESETS = {
  // Evenly spaced, so an integer stored by an older build is never exactly between two steps.
  fontSize: [
    { value: 14, key: "type.size.small" },
    { value: 16, key: "type.size.normal" },
    { value: 18, key: "type.size.large" },
    { value: 20, key: "type.size.huge" }
  ],
  lineHeight: [
    { value: 1.7, key: "type.leading.tight" },
    { value: 1.9, key: "type.leading.normal" },
    { value: 2.1, key: "type.leading.loose" }
  ],
  width: [
    { value: 640, key: "type.measure.narrow" },
    { value: 760, key: "type.measure.normal" },
    { value: 900, key: "type.measure.wide" }
  ]
};
function normalizeTypography(raw) {
  const read = (key) => {
    const value = Number(raw?.[key]);
    const [min, max] = TYPOGRAPHY_BOUNDS[key];
    if (!Number.isFinite(value)) return TYPOGRAPHY_DEFAULT[key];
    return Math.round(Math.min(max, Math.max(min, value)) * 100) / 100;
  };
  return { fontSize: read("fontSize"), lineHeight: read("lineHeight"), width: read("width") };
}
var UI_FONT_SIZE = 16;
var UI_LINE_HEIGHT = 24;
function proseLineBudget(typography) {
  const size = Number(typography?.fontSize);
  const width = Number(typography?.width);
  const fontSize = Number.isFinite(size) && size > 0 ? size : TYPOGRAPHY_DEFAULT.fontSize;
  const measure = Number.isFinite(width) && width > 0 ? width : TYPOGRAPHY_DEFAULT.width;
  const perLine = measure / fontSize;
  return Math.round(perLine * 4.5);
}
var SCAN_EMPTY = { kind: null, busy: false, error: "", issues: [], critique: null, truncated: false };
var CHAT_EMPTY = { open: false, question: "", busy: false, reply: "", history: [] };
var emptyBookState = () => ({ status: "idle", book: null, token: "", error: "", saveError: "", recovered: false });

// src/client/shared/save-queue.js
var AUTO_SAVE_DEFAULT = 5 * 60 * 1e3;
var AUTO_SAVE_PRESETS = [
  { value: 30 * 1e3, key: "autoSave.30s" },
  { value: 60 * 1e3, key: "autoSave.1m" },
  { value: 5 * 60 * 1e3, key: "autoSave.5m" },
  { value: 10 * 60 * 1e3, key: "autoSave.10m" }
];
function normalizeAutoSave(raw) {
  if (raw === null || raw === void 0 || raw === "") return AUTO_SAVE_DEFAULT;
  const value = Number(raw);
  if (!Number.isFinite(value)) return AUTO_SAVE_DEFAULT;
  return Math.max(0, Math.round(value));
}
function sameBooks(left, right) {
  if (left.length !== right.length) return false;
  return left.every((book, index) => book.folder === right[index].folder && book.workspace === right[index].workspace && book.updatedAt === right[index].updatedAt);
}
var stateMemory = /* @__PURE__ */ new Map();
function createSaveQueue(send, getToken, options = {}) {
  let interval = options.interval ?? AUTO_SAVE_DEFAULT;
  const memoryKey = options.memoryKey;
  const state = memoryKey !== void 0 && stateMemory.has(memoryKey) ? { ...stateMemory.get(memoryKey) } : { status: "idle", savedAt: 0, error: "" };
  const now = options.now ?? (() => Date.now());
  const timers = globalThis;
  const schedule = options.setTimer ?? ((fn, ms) => timers.setTimeout(fn, ms));
  const cancel = options.clearTimer ?? ((id) => timers.clearTimeout(id));
  let pending = null;
  let timer = null;
  let disposed = false;
  const listeners = /* @__PURE__ */ new Set();
  const publish = () => {
    if (memoryKey !== void 0) stateMemory.set(memoryKey, { ...state });
    for (const listener of listeners) listener({ ...state });
  };
  const move = (status, error = "") => {
    if (state.status === status && state.error === error) return;
    state.status = status;
    state.error = error;
    publish();
  };
  let running = null;
  const run = () => {
    if (running !== null || disposed || pending === null) return running;
    running = (async () => {
      move("saving");
      try {
        while (pending !== null && !disposed) {
          const book = pending;
          pending = null;
          try {
            const answer = await send(book, getToken());
            if (disposed) return;
            state.savedAt = answer?.savedAt ?? now();
            if (pending === null) move("saved");
          } catch (error) {
            if (disposed) return;
            pending = null;
            move("error", error?.message ?? String(error));
          }
        }
      } finally {
        running = null;
      }
    })();
    return running;
  };
  const arm = () => {
    if (disposed || timer !== null || pending === null) return;
    timer = schedule(() => {
      timer = null;
      const done = run();
      const again = () => {
        if (!disposed && pending !== null) arm();
      };
      if (done === void 0) again();
      else Promise.resolve(done).then(again, again);
    }, interval);
  };
  return {
    /** Queue a book. The interval is absolute: later edits do not push the next write back. */
    push(book) {
      if (disposed) return;
      pending = book;
      move("pending");
      if (interval <= 0) {
        if (timer !== null) cancel(timer);
        timer = null;
        run();
        return;
      }
      arm();
    },
    /**
     * Queue a book that must reach the disk now.
     *
     * Typing can wait for the interval; creating, renaming or deleting a node cannot. Those are
     * discrete actions the writer expects to have happened, and a delay would also let a
     * subsequent action be built on a tree that is not yet on disk.
     */
    pushNow(book) {
      if (disposed) return Promise.resolve();
      pending = book;
      if (timer !== null) {
        cancel(timer);
        timer = null;
      }
      return (async () => {
        do {
          await run();
        } while (!disposed && (running !== null || pending !== null));
      })();
    },
    /** Write whatever is pending right now, e.g. before the editor goes away. */
    async flush() {
      if (timer !== null) {
        cancel(timer);
        timer = null;
      }
      await run();
    },
    /**
     * Write on the writer's explicit command.
     *
     * `flush` is silent when nothing is pending, which is correct for a chapter switch but wrong
     * for a keystroke: pressing Cmd+S and seeing nothing at all is indistinguishable from a
     * shortcut that does not work. This always performs a write, so the status bar has something
     * to report — and asks for the last book even when the queue is empty.
     */
    async saveNow(book) {
      if (disposed) return void 0;
      if (timer !== null) {
        cancel(timer);
        timer = null;
      }
      if (pending === null && book !== void 0 && book !== null) pending = book;
      if (pending === null) {
        move("saved");
        return state.savedAt;
      }
      await run();
      return state.savedAt;
    },
    /** Read the last status. */
    getState() {
      return { ...state };
    },
    /**
     * Adopt a save that happened outside this queue instance: the file's own modification time,
     * learned when the book is loaded. Only an IDLE queue takes it — a queue that is saving or
     * reporting an error is telling the truth about right now, and disk metadata must not
     * override it.
     */
    markSaved(at) {
      if (disposed || state.status !== "idle" || !Number.isFinite(at) || at <= 0) return;
      state.savedAt = at;
      move("saved");
    },
    /** Subscribe to status changes; returns the unsubscribe function. */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Stop accepting work. A request already in flight is allowed to finish. */
    dispose() {
      disposed = true;
      if (timer !== null) {
        cancel(timer);
        timer = null;
      }
      listeners.clear();
    },
    /**
     * Change how long the queue waits before writing.
     *
     * A timer already armed was armed for the OLD interval, and leaving it alone would mean the
     * new setting only took effect after one more write — the writer changes the number, watches
     * nothing happen, and concludes it did not work. So a pending write is re-armed under the new
     * value; the clock restarts, which is the honest reading of "from now on, wait this long".
     */
    setIntervalMs(ms) {
      const next = Number(ms);
      const value = Number.isFinite(next) && next >= 0 ? next : AUTO_SAVE_DEFAULT;
      if (value === interval) return;
      interval = value;
      if (disposed) return;
      if (timer !== null) {
        cancel(timer);
        timer = null;
      }
      if (pending !== null) arm();
    },
    /** The interval in force, for the settings page to show what is actually happening. */
    getIntervalMs() {
      return interval;
    }
  };
}

// src/client/shared/hooks.js
function useBookData({ api: api2, library, bookFolder, t, autoSaveMs, onLoaded }) {
  const [state, setState] = React.useState(emptyBookState());
  const [books, setBooks] = React.useState([]);
  const afterLoadRef = React.useRef(null);
  afterLoadRef.current = onLoaded ?? null;
  const saveTargetRef = React.useRef({ library: "", folder: void 0 });
  saveTargetRef.current = { library, folder: bookFolder };
  const tokenRef = React.useRef("");
  tokenRef.current = state?.token ?? "";
  const withSideFields = (next, prevBook) => {
    if (next === null || next === void 0) return next;
    const sameBook = next.id !== void 0 && prevBook?.id !== void 0 && next.id === prevBook.id;
    if (!sameBook) return next;
    const merged = { ...next };
    for (const key of ["writingStyles", "activeWritingStyleId", "activeWritingStyle", "notes"]) {
      if (merged[key] === void 0 && prevBook[key] !== void 0) merged[key] = prevBook[key];
    }
    return merged;
  };
  const bookVersionRef = React.useRef(0);
  const externalWriteRef = React.useRef(0);
  const queueRef = React.useRef(null);
  if (queueRef.current === null) {
    queueRef.current = createSaveQueue(async (next, token) => {
      const { folder } = saveTargetRef.current;
      const version = bookVersionRef.current;
      const externalWrites = externalWriteRef.current;
      try {
        const data = await api2.save(next, token, folder);
        const externalMoved = externalWriteRef.current !== externalWrites;
        const keepToken = externalMoved ? tokenRef.current : data.token ?? tokenRef.current;
        if (data.book !== void 0 && data.book !== null && bookVersionRef.current === version) {
          bookVersionRef.current += 1;
          setState((prev) => ({ ...prev, book: withSideFields(data.book, prev.book), token: keepToken, saveError: "" }));
        } else {
          setState((prev) => ({ ...prev, token: keepToken, saveError: "" }));
        }
        return data;
      } catch (error) {
        const message = error?.message ?? String(error);
        if (!message.startsWith("stale book")) {
          setState((prev) => ({ ...prev, saveError: message }));
          throw error;
        }
        try {
          const data = await api2.load(folder);
          bookVersionRef.current += 1;
          externalWriteRef.current += 1;
          setState((prev) => ({ ...prev, status: "ready", book: data.book, token: data.token ?? "", saveError: message, recovered: data.recovered }));
        } catch {
          setState((prev) => ({ ...prev, saveError: message }));
        }
        throw error;
      }
    }, () => tokenRef.current, { interval: autoSaveMs, memoryKey: bookFolder });
  }
  const queue = queueRef.current;
  const [saveStatus, setSaveStatus] = React.useState(() => queue.getState());
  React.useEffect(() => queue.subscribe(setSaveStatus), []);
  React.useEffect(() => () => {
    queue.flush().catch(() => {
    });
    queue.dispose();
  }, []);
  React.useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return void 0;
    if (typeof document.addEventListener !== "function" || typeof window.addEventListener !== "function") return void 0;
    const flush = () => {
      queue.flush().catch(() => {
      });
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", flush);
    };
  }, [queue]);
  const refreshShelf = () => {
    if (!library) return;
    api2.books().then((data) => {
      const next = data.books ?? [];
      setBooks((prev) => sameBooks(prev, next) ? prev : next);
    }, () => {
    });
  };
  React.useEffect(() => {
    bookVersionRef.current += 1;
    externalWriteRef.current += 1;
    if (!library) {
      setState(emptyBookState());
      return void 0;
    }
    let cancelled = false;
    api2.books().then((data) => {
      if (cancelled) return;
      const next = data.books ?? [];
      setBooks((prev) => sameBooks(prev, next) ? prev : next);
    }, () => {
    });
    if (bookFolder === void 0) {
      setState(emptyBookState());
      return () => {
        cancelled = true;
      };
    }
    setState((prev) => ({ ...prev, status: "loading", book: null, token: "", error: "", saveError: "", recovered: false }));
    api2.load(bookFolder).then((data) => {
      if (cancelled) return;
      if (data?.book === void 0 || data.book === null) {
        setState({ status: "error", book: null, token: "", error: t("label.loadFailed"), saveError: "", recovered: false });
        return;
      }
      setState({ status: "ready", book: data.book, token: data.token ?? "", error: "", saveError: "", recovered: data.recovered });
      queue.markSaved(data.savedAt);
      if (typeof afterLoadRef.current === "function") afterLoadRef.current(data.book);
    }).catch((error) => {
      if (!cancelled) setState({ status: "error", book: null, token: "", error: error.message, saveError: "", recovered: false });
    });
    return () => {
      cancelled = true;
    };
  }, [library, bookFolder, api2, t]);
  const flushSave = () => queue.flush().catch(() => {
  });
  const adoptWritten = ({ book, merge, token, savedAt } = {}) => {
    bookVersionRef.current += 1;
    externalWriteRef.current += 1;
    if (typeof token === "string" && token !== "") tokenRef.current = token;
    setState((prev) => {
      const next = typeof merge === "function" ? merge(prev.book) : book ?? prev.book;
      if (next === void 0 || next === null) return prev;
      const withExtras = withSideFields(next, prev.book);
      return {
        ...prev,
        book: withExtras,
        token: typeof token === "string" && token !== "" ? token : prev.token,
        saveError: ""
      };
    });
    queue.markSaved(Number.isFinite(savedAt) ? savedAt : Date.now());
  };
  const saveNow = () => {
    queue.saveNow(state.book).then(() => {
    }, () => {
    });
  };
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.addEventListener !== "function") return void 0;
    const onHide = () => {
      queue.flush().catch(() => {
      });
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [queue]);
  const updateBook = (next, options = {}) => {
    bookVersionRef.current += 1;
    setState((prev) => ({ ...prev, book: next, saveError: "" }));
    if (options.immediate === true) queue.pushNow(next).catch(() => {
    });
    else queue.push(next);
  };
  return {
    state,
    book: state.book,
    // `setBooks` is exposed because creating a book hands back a fresh listing: the route that
    // creates it already knows the new shelf, and asking for it again would be a second read of
    // something the caller was just told.
    books,
    setBooks,
    refreshShelf,
    queue,
    saveStatus,
    flushSave,
    adoptWritten,
    saveNow,
    updateBook
  };
}
function createStateStore() {
  const values = /* @__PURE__ */ new Map();
  const listeners = /* @__PURE__ */ new Map();
  return {
    read(key, initial) {
      return values.has(key) ? values.get(key) : initial;
    },
    write(key, value) {
      if (Object.is(values.get(key), value)) return;
      values.set(key, value);
      for (const listener of [...listeners.get(key) ?? []]) listener(value);
    },
    subscribe(key, listener) {
      if (!listeners.has(key)) listeners.set(key, /* @__PURE__ */ new Set());
      listeners.get(key).add(listener);
      return () => {
        listeners.get(key)?.delete(listener);
      };
    }
  };
}
var DOCK_STORE = createStateStore();
function useDockState(scope, key, initial) {
  const storeKey = `${scope}::${key}`;
  const [, forceRender] = React.useState(0);
  React.useEffect(() => DOCK_STORE.subscribe(storeKey, () => forceRender((n) => n + 1)), [storeKey]);
  const value = DOCK_STORE.read(storeKey, initial);
  const set = (next) => {
    const current = DOCK_STORE.read(storeKey, initial);
    const resolved = typeof next === "function" ? next(current) : next;
    DOCK_STORE.write(storeKey, resolved);
  };
  return [value, set];
}
function usePersisted(key, decode, encode, forced) {
  const locked = forced !== void 0;
  const [value, setValue] = React.useState(() => {
    if (locked) return forced;
    try {
      return decode(readStored(key));
    } catch {
      return decode(null);
    }
  });
  const update = (next) => {
    const resolved = typeof next === "function" ? next(value) : next;
    setValue(resolved);
    if (locked) return;
    writeStored(key, encode(resolved));
  };
  return [value, update];
}
function useClosingAnimation(value, durationMs = 140) {
  const open = value !== null && value !== void 0 && value !== false;
  const animated = typeof window !== "undefined";
  const [mounted, setMounted] = React.useState(open === true);
  const [closing, setClosing] = React.useState(false);
  React.useEffect(() => {
    if (open === true) {
      setClosing(false);
      setMounted(true);
      return void 0;
    }
    if (!mounted) return void 0;
    if (!animated) {
      setMounted(false);
      return void 0;
    }
    setClosing(true);
    const timer = globalThis.setTimeout(() => {
      setClosing(false);
      setMounted(false);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [open, mounted, durationMs, animated]);
  const shown = React.useRef(open ? value : null);
  if (open) shown.current = value;
  return { mounted, closing, shown: shown.current };
}
function useNotice(onNotice, text) {
  React.useEffect(() => {
    if (typeof onNotice !== "function") return void 0;
    onNotice(typeof text === "string" ? text : "");
    return () => onNotice("");
  }, [onNotice, text]);
}
function useDismiss(rootRef, open, onClose) {
  React.useEffect(() => {
    if (!open) return void 0;
    if (typeof document === "undefined" || typeof document.addEventListener !== "function") return void 0;
    const onDown = (event) => {
      const root = rootRef?.current;
      if (root !== null && root !== void 0 && typeof root.contains === "function" && root.contains(event.target)) return;
      onClose();
    };
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [rootRef, open]);
}

// src/client/shared/ui.js
function Chevron({ open, direction }) {
  const down = direction !== "right";
  return h("svg", {
    className: down ? "st-seat-chevron" : "st-seat-cell-chevron",
    viewBox: "0 0 16 16",
    width: 12,
    height: 12,
    "aria-hidden": true,
    ...down ? { "data-open": open === true ? "true" : "false" } : {},
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, h("path", { d: down ? "M4 6.5 8 10.5 12 6.5" : "M6.5 4 10.5 8 6.5 12" }));
}
function Dropdown({ label, value, options, onChange, testId, className }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  useDismiss(rootRef, open, () => setOpen(false));
  const rows = Array.isArray(options) ? options : [];
  const current = rows.find((option) => option.value === value) ?? rows[0];
  const pick = (next) => {
    setOpen(false);
    onChange(next);
  };
  return h(
    "div",
    {
      className: `st-dropdown${className === void 0 ? "" : ` ${className}`}`,
      ref: rootRef,
      "data-testid": testId
    },
    h(
      "button",
      {
        type: "button",
        className: "st-dropdown-button",
        "aria-haspopup": "listbox",
        "aria-expanded": open ? "true" : "false",
        "aria-label": label,
        onClick: () => setOpen((was) => !was),
        onKeyDown: (event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          const at = rows.findIndex((option) => option.value === value);
          const step = event.key === "ArrowDown" ? 1 : -1;
          const next = rows[Math.min(rows.length - 1, Math.max(0, (at < 0 ? 0 : at) + step))];
          if (next !== void 0) pick(next.value);
        }
      },
      h("span", { className: "st-dropdown-value" }, current === void 0 ? "" : current.label),
      h(Chevron, { open })
    ),
    open ? h(
      "div",
      { className: "st-dropdown-list", role: "listbox", "aria-label": label },
      rows.map((option) => h("button", {
        key: option.value,
        type: "button",
        className: "st-dropdown-option",
        role: "option",
        "aria-selected": option.value === value ? "true" : "false",
        onClick: () => pick(option.value)
      }, option.label))
    ) : null
  );
}
function FileButton({ label, accept, onFile, className, testId }) {
  const inputRef = React.useRef(null);
  return h(
    "span",
    { className: `st-file-button${className === void 0 ? "" : ` ${className}`}` },
    h("button", {
      type: "button",
      className: "st-btn",
      onClick: () => {
        if (inputRef.current !== null && typeof inputRef.current.click === "function") inputRef.current.click();
      }
    }, label),
    h("input", {
      ref: inputRef,
      type: "file",
      className: "st-file-input",
      accept,
      tabIndex: -1,
      "aria-hidden": "true",
      "data-testid": testId,
      onChange: (event) => {
        const file = event?.target?.files?.[0];
        if (file !== void 0 && typeof onFile === "function") onFile(file);
        if (event?.target !== void 0) event.target.value = "";
      }
    })
  );
}
function Drawer({ t, title, children, onClose, size, bodyClassName, closing = false }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return h(
    "div",
    {
      className: `st-sheet-backdrop${closing ? " st-closing" : ""}`,
      role: "presentation",
      onMouseDown: (e) => {
        if (e.target === e.currentTarget) onClose();
      }
    },
    h(
      "div",
      {
        className: "st-sheet",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title,
        // A named tier, not a pixel count: a page that needs room for a diagram asks for a rung on
        // the width ladder, and the stylesheet turns that rung into a fixed width. Without one the
        // panel sizes to its content, which is right for a two-item list.
        "data-size": size,
        style: size === void 0 ? void 0 : { "--st-sheet-max": `var(--st-w-${size})` }
      },
      h(
        "div",
        { className: "st-sheet-head" },
        h("h2", { className: "st-sheet-title" }, title),
        h("span", { className: "st-spacer" }),
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost",
          title: t("action.close"),
          onClick: onClose
        }, "\u2715")
      ),
      h("div", { className: `st-sheet-body${bodyClassName === void 0 ? "" : ` ${bodyClassName}`}` }, children)
    )
  );
}
function ConfirmDialog({ t, title, children, confirmLabel, cancelLabel, onConfirm, onCancel, busy, danger = true }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return h(
    "div",
    {
      className: "st-backdrop",
      role: "presentation",
      onMouseDown: (e) => {
        if (e.target === e.currentTarget) onCancel();
      }
    },
    h(
      "div",
      {
        className: "st-dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title
      },
      h("div", { className: "st-dialog-title" }, title),
      h("div", { className: "st-dialog-body" }, ...children ?? []),
      h(
        "div",
        { className: "st-dialog-actions" },
        h("button", { type: "button", className: "st-btn", onClick: onCancel }, cancelLabel ?? t("action.cancel")),
        h("button", {
          type: "button",
          className: `st-btn st-btn-primary${danger ? " st-danger" : ""}`,
          disabled: busy === true,
          onClick: onConfirm
        }, confirmLabel ?? t("action.ok"))
      )
    )
  );
}
function PanelIcon(props) {
  const size = props?.size ?? 16;
  return h(
    "svg",
    {
      viewBox: "0 0 64 64",
      width: size,
      height: size,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 5
    },
    h("rect", { x: 8, y: 10, width: 48, height: 44, rx: 6 }),
    h("path", { d: "M20 24h24M20 34h24M20 44h14", strokeLinecap: "round" })
  );
}
function RailIcon() {
  return h(
    "svg",
    {
      className: "st-icon-lg",
      viewBox: "0 0 16 16",
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      // Same weight in both states. The dimming was how the host marks an inactive toggle, but here
      // the toggle is the way IN to the contents — dimming it made the one control a writer needs
      // first look like the least available thing in the row.
      opacity: 1
    },
    h("path", { d: "M2.5 4h11" }),
    h("path", { d: "M2.5 8h8" }),
    h("path", { d: "M2.5 12h9" })
  );
}
function BoardIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    // A square puzzle piece: a full-height body, a tab on the top edge and a notch on the right.
    // The old piece was wide and shallow, so at the same 18px box it looked a size smaller than
    // the page and layer glyphs. This one is drawn on the full 16-unit grid with no transform.
    h("path", { d: "M3 13V4h2.4a1.6 1.6 0 1 1 3.2 0H13v2.4a1.6 1.6 0 1 0 0 3.2V13z" })
  );
}
function NotebookIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    h("path", { d: "M3.2 2.8h6.2l3.4 3.4v7H3.2z" }),
    h("path", { d: "M9.4 2.8v3.4h3.4" }),
    h("path", { d: "m5.2 10.8 3.9-3.9 1.4 1.4-3.9 3.9-1.8.4z" })
  );
}
function ModelIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    h("path", { d: "M2.5 5.5 8 2.5l5.5 3-5.5 3z" }),
    h("path", { d: "M2.5 10.5 8 13.5l5.5-3" })
  );
}
function SlidersIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round"
    },
    h("path", { d: "M2.5 5h11M2.5 11h11" }),
    h("circle", { cx: 5.5, cy: 5, r: 1.6 }),
    h("circle", { cx: 10.5, cy: 11, r: 1.6 })
  );
}
function BackIcon() {
  return h("svg", {
    className: "st-icon-md",
    viewBox: "0 0 16 16",
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, h("path", { d: "M9.5 4 5.5 8 9.5 12" }));
}
function ShelfIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    h("path", { d: "M2.5 3.5h4v9h-4zM9 3.5h4.5v9H9z" }),
    h("path", { d: "M2.5 12.5h11" })
  );
}
function McpIcon() {
  return h(
    "svg",
    { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": true, fill: "none", stroke: "currentColor", "stroke-width": 1.3 },
    h("circle", { cx: 3.2, cy: 8, r: 1.6 }),
    h("circle", { cx: 12.8, cy: 3.6, r: 1.6 }),
    h("circle", { cx: 12.8, cy: 12.4, r: 1.6 }),
    h("path", { d: "M4.7 7.2l6.5-2.8M4.7 8.8l6.5 2.8" })
  );
}
function FolderIcon() {
  return h(
    "svg",
    { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": true, fill: "none", stroke: "currentColor", "stroke-width": 1.4 },
    h("path", { d: "M2.5 4.5h4l1.2 1.5h5.8v6.5h-11z", "stroke-linejoin": "round" })
  );
}
function StartIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    h("path", { d: "M8 2.5v3.2M8 10.3v3.2M2.5 8h3.2M10.3 8h3.2" }),
    h("path", { d: "m4.1 4.1 2.2 2.2M9.7 9.7l2.2 2.2M11.9 4.1 9.7 6.3M6.3 9.7l-2.2 2.2" })
  );
}
function SaveIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    h("path", { d: "M3 3.5h7.5L13 6v6.5H3z" }),
    h("path", { d: "M5.5 3.5v3h4v-3M5.5 9.5h5v3h-5z" })
  );
}
function ExportIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    h("path", { d: "M8 2.5v7.5M8 10 5 7M8 10l3-3" }),
    h("path", { d: "M2.5 11v2.5h11V11" })
  );
}
function InfoIcon() {
  return h(
    "svg",
    {
      className: "st-bar-icon",
      viewBox: "0 0 16 16",
      width: 18,
      height: 18,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    h("circle", { cx: 8, cy: 8, r: 5.5 }),
    h("path", { d: "M8 7.2v3.6" }),
    h("path", { d: "M8 5.1h.01" })
  );
}
function TooltipLayer({ rootRef }) {
  const [tip, setTip] = React.useState(null);
  const held = React.useRef(null);
  React.useEffect(() => {
    const root = rootRef?.current;
    if (root === null || root === void 0) return void 0;
    let timer = null;
    const hide = () => {
      if (timer !== null) {
        globalThis.clearTimeout(timer);
        timer = null;
      }
      const heldTip = held.current;
      if (heldTip !== null) {
        heldTip.el.setAttribute("title", heldTip.title);
        held.current = null;
      }
      setTip(null);
    };
    const show = (el) => {
      const text = el.getAttribute("title");
      if (text === null || text === "") return;
      held.current = { el, title: text };
      el.removeAttribute("title");
      timer = globalThis.setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const shellRect = root.getBoundingClientRect();
        setTip({
          text,
          left: Math.max(8, Math.min(rect.left + rect.width / 2 - shellRect.left, shellRect.width - 8)),
          top: rect.bottom - shellRect.top + 6
        });
      }, 400);
    };
    const onOver = (e) => {
      const el = e.target?.closest?.("[title]");
      if (el === null || el === void 0 || el === held.current?.el) return;
      hide();
      show(el);
    };
    const onOut = (e) => {
      const heldTip = held.current;
      if (heldTip === null) return;
      const to = e.relatedTarget;
      if (to !== null && to !== void 0 && heldTip.el.contains(to)) return;
      hide();
    };
    root.addEventListener("pointerover", onOver, true);
    root.addEventListener("pointerout", onOut, true);
    root.addEventListener("pointerdown", hide, true);
    return () => {
      root.removeEventListener("pointerover", onOver, true);
      root.removeEventListener("pointerout", onOut, true);
      root.removeEventListener("pointerdown", hide, true);
      hide();
    };
  }, [rootRef]);
  if (tip === null) return null;
  return h("div", { className: "st-tip", role: "tooltip", style: { left: tip.left, top: tip.top } }, tip.text);
}
function SegGroup({ label, options, value, onChange, testId, disabled = false }) {
  return h(
    "div",
    { className: "st-seg", role: "group", "aria-label": label },
    options.map((option) => h("button", {
      key: option.value,
      type: "button",
      className: "st-seg-item",
      "data-testid": testId === void 0 ? void 0 : `${testId}-${option.value}`,
      "aria-pressed": option.value === value ? "true" : "false",
      disabled: disabled === true,
      onClick: () => onChange(option.value)
    }, option.label))
  );
}
function SplitPane({ list, detail, listProps, detailProps }) {
  const rows = Array.isArray(list) ? list : list === void 0 ? [] : [list];
  const body = Array.isArray(detail) ? detail : detail === void 0 ? [] : [detail];
  return h(
    "div",
    { className: "st-split" },
    h("div", { className: "st-split-list", ...listProps ?? {} }, ...rows),
    h("section", { className: "st-split-detail", ...detailProps ?? {} }, ...body)
  );
}
function List({ className, children, ...rest }) {
  const rows = Array.isArray(children) ? children : children === void 0 ? [] : [children];
  return h("div", {
    className: `st-list${className === void 0 ? "" : ` ${className}`}`,
    ...rest
  }, ...rows);
}
function ListRow({ className, active, onActivate, children, ...rest }) {
  const rows = Array.isArray(children) ? children : children === void 0 ? [] : [children];
  const interactive = typeof onActivate === "function";
  return h(interactive ? "button" : "div", {
    ...interactive ? { type: "button", onClick: onActivate } : {},
    ...rest,
    className: `st-list-row${className === void 0 ? "" : ` ${className}`}`,
    "data-active": active === true ? "true" : void 0
  }, ...rows);
}
function Dialog({ t, title, children, onClose, size, bodyClassName, panelClassName, backdropClassName }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const body = Array.isArray(children) ? children : children === void 0 ? [] : [children];
  return h(
    "div",
    {
      className: `st-backdrop${backdropClassName === void 0 ? "" : ` ${backdropClassName}`}`,
      role: "presentation",
      onMouseDown: (e) => {
        if (e.target === e.currentTarget) onClose();
      }
    },
    h(
      "div",
      {
        className: `st-dialog st-dialog-panel${panelClassName === void 0 ? "" : ` ${panelClassName}`}`,
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title,
        style: size === void 0 ? void 0 : { "--st-dialog-w": `var(--st-w-${size})` }
      },
      h(
        "div",
        { className: "st-dialog-head" },
        h("h2", { className: "st-dialog-title" }, title),
        h("span", { className: "st-spacer" }),
        h("button", { type: "button", className: "st-btn st-btn-ghost", title: t("action.close"), onClick: onClose }, "\u2715")
      ),
      h("div", { className: `st-dialog-body st-dialog-scroll${bodyClassName === void 0 ? "" : ` ${bodyClassName}`}` }, ...body)
    )
  );
}

// domain/ids.js
function newId(prefix = "") {
  const crypto2 = globalThis.crypto;
  const uuid = typeof crypto2?.randomUUID === "function" ? crypto2.randomUUID() : "";
  const body = uuid !== "" ? uuid : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10).padEnd(8, "0")}`;
  return prefix === "" ? body : `${prefix}-${body}`;
}

// domain/schema.js
var BOARD_SCHEMA_VERSION = 4;
var NODE_STATUSES = ["todo", "writing", "done"];
var ENTITY_KINDS = ["character", "place", "faction", "item", "event"];
var SHARED_FIELDS = ["summary", "description", "notes"];
var KIND_FIELDS = {
  character: ["role", "gender", "age", "nationality", "appearance", "personality", "motivation", "arc"],
  place: ["location", "atmosphere", "controlledBy"],
  faction: ["purpose", "base", "leader", "members"],
  item: ["origin", "holder", "significance"],
  event: ["when", "where", "participants", "consequence"]
};
var REFERENCE_FIELDS = ["controlledBy", "base", "leader", "holder", "where"];
var REFERENCE_LIST_FIELDS = ["members", "participants"];
var emptyBoard = () => ({ schemaVersion: BOARD_SCHEMA_VERSION, entities: [], edges: [] });

// domain/board.js
var str = (v) => typeof v === "string" ? v : "";
var arr = (v) => Array.isArray(v) ? v : [];
function provenanceOf(raw) {
  const evidence = arr(raw.evidence).map(str).filter((s) => s !== "");
  const basedOn = raw.basedOn && typeof raw.basedOn === "object" ? { chapter: str(raw.basedOn.chapter), hash: str(raw.basedOn.hash) } : null;
  const usable = basedOn !== null && basedOn.chapter !== "";
  if (!usable && evidence.length === 0) return {};
  return {
    ...evidence.length > 0 ? { evidence } : {},
    ...usable ? { basedOn } : {}
  };
}
function normalizeEntity(raw, idSet) {
  if (!raw || typeof raw !== "object") return null;
  const kind = ENTITY_KINDS.includes(raw.kind) ? raw.kind : null;
  if (kind === null) return null;
  const name = str(raw.name).trim();
  if (name === "") return null;
  const entity = {
    id: str(raw.id),
    kind,
    name,
    // Aliases, translations and former names: what the writer calls this card in another scene.
    // They matter to search and to the check prompt ("is 阿九 the same person as 九爷?").
    aliases: arr(raw.aliases).map(str).map((s) => s.trim()).filter((s) => s !== ""),
    tags: arr(raw.tags).map(str).filter((s) => s !== ""),
    layout: raw.layout && Number.isFinite(raw.layout.x) && Number.isFinite(raw.layout.y) ? { x: raw.layout.x, y: raw.layout.y } : null,
    // The portrait is a PATH into the book's own portraits directory, never the bytes: the file
    // already lives beside the book, and inlining a megabyte of base64 here would be rewritten on
    // every save. It used to be missing from this whitelist, so a generated picture appeared and
    // then vanished on the next reload — the file was still on disk, nothing pointed at it.
    portrait: str(raw.portrait),
    /**
     * Where this card's facts claim to come from. 'board' is the author's own word (a card made by
     * hand, which the prose owes nothing to); 'chapter' claims the PROSE states it, and that claim
     * is checkable — see factStatus in lib/facts.js. Absent stays 'board': every card that predates
     * provenance was written by hand.
     */
    source: raw.source === "chapter" ? "chapter" : "board",
    ...provenanceOf(raw)
  };
  for (const field of SHARED_FIELDS) entity[field] = str(raw[field]);
  entity.statuses = arr(raw.statuses).filter((s) => s && typeof s === "object" && str(s.label).trim() !== "").map((s) => ({ id: str(s.id), label: str(s.label).trim() }));
  for (const field of KIND_FIELDS[kind]) entity[field] = str(raw[field]);
  for (const field of REFERENCE_FIELDS) {
    if (KIND_FIELDS[kind].includes(field)) {
      const target = str(raw[field]);
      entity[field] = idSet !== void 0 && target !== "" && !idSet.has(target) ? "" : target;
    }
  }
  for (const field of REFERENCE_LIST_FIELDS) {
    if (!KIND_FIELDS[kind].includes(field)) continue;
    const ids = arr(raw[field]).map(str).filter((id) => id !== "");
    entity[field] = idSet === void 0 ? ids : ids.filter((id) => idSet.has(id));
  }
  entity.custom = arr(raw.custom).filter((row) => row && typeof row === "object" && str(row.label).trim() !== "").map((row) => ({ id: str(row.id), label: str(row.label).trim(), value: str(row.value) }));
  return entity;
}
function createEntity(kind, name, fields = {}) {
  if (!ENTITY_KINDS.includes(kind)) throw new Error(`unknown entity kind: ${String(kind)}`);
  const entity = {
    id: newId(),
    kind,
    name: str(name).trim(),
    aliases: [],
    tags: [],
    layout: null,
    portrait: "",
    summary: "",
    description: "",
    notes: "",
    statuses: [],
    custom: []
  };
  for (const field of KIND_FIELDS[kind]) entity[field] = "";
  for (const field of REFERENCE_LIST_FIELDS) {
    if (KIND_FIELDS[kind].includes(field)) entity[field] = [];
  }
  for (const field of SHARED_FIELDS) {
    if (typeof fields[field] === "string") entity[field] = fields[field];
  }
  for (const field of KIND_FIELDS[kind]) {
    if (typeof fields[field] === "string") entity[field] = fields[field];
  }
  if (Array.isArray(fields.aliases)) {
    entity.aliases = fields.aliases.map(str).map((s) => s.trim()).filter((s) => s !== "");
  }
  if (Array.isArray(fields.tags)) entity.tags = fields.tags.map(str).filter((s) => s !== "");
  if (Array.isArray(fields.statuses)) {
    entity.statuses = fields.statuses.filter((s) => s && typeof s === "object" && str(s.label).trim() !== "").map((s) => ({ id: str(s.id) || newId("s"), label: str(s.label).trim() }));
  }
  if (Array.isArray(fields.custom)) {
    entity.custom = fields.custom.filter((row) => row && typeof row === "object" && str(row.label).trim() !== "").map((row) => ({ id: str(row.id) || newId("c"), label: str(row.label).trim(), value: str(row.value) }));
  }
  if (fields.layout && Number.isFinite(fields.layout.x) && Number.isFinite(fields.layout.y)) {
    entity.layout = { x: fields.layout.x, y: fields.layout.y };
  }
  if (typeof fields.portrait === "string") entity.portrait = fields.portrait;
  return entity;
}
function patchEntity(board, entityId, fields) {
  const current = board ?? emptyBoard();
  const ids = new Set(current.entities.map((entity) => entity.id));
  return {
    ...current,
    entities: current.entities.map((entity) => {
      if (entity.id !== entityId) return entity;
      return normalizeEntity({ ...entity, ...fields }, ids) ?? entity;
    })
  };
}
function removeEntity(board, entityId) {
  const current = board ?? emptyBoard();
  return {
    ...current,
    entities: current.entities.filter((entity) => entity.id !== entityId),
    edges: current.edges.filter((edge) => edge.from !== entityId && edge.to !== entityId)
  };
}

// src/client/mosaic/board-state.js
function useBoardActions({ api: api2, bookFolder, book, updateBook, adoptWritten, flushSave, onNotice, t }) {
  const mosaic = book?.mosaic;
  const patchCard = (entityId, fields) => {
    if (mosaic === void 0 || mosaic === null) return;
    updateBook({ ...book, mosaic: patchEntity(mosaic, entityId, fields) });
  };
  const createCard = (kind, fields = {}) => {
    const current = mosaic ?? emptyBoard();
    const { name = "", ...rest } = fields;
    const entity = createEntity(kind, name, rest);
    updateBook({ ...book, mosaic: { ...current, entities: (current.entities ?? []).concat([entity]) } });
    return entity;
  };
  const removeCard = (entityId) => {
    if (mosaic === void 0 || mosaic === null) return;
    updateBook({ ...book, mosaic: removeEntity(mosaic, entityId) });
  };
  const applyChanges = async (changes, options = {}) => {
    if (!Array.isArray(changes) || changes.length === 0) return void 0;
    if (typeof flushSave === "function") await flushSave();
    const data = await api2.mosaicApply(bookFolder, changes, options.proposalId, options.provenance);
    if (typeof adoptWritten === "function") {
      adoptWritten({
        merge: (prevBook) => prevBook === null || prevBook === void 0 ? prevBook : {
          ...prevBook,
          mosaic: data.book?.mosaic ?? prevBook.mosaic
        },
        token: data.token,
        savedAt: data.savedAt
      });
    }
    if (typeof onNotice === "function") {
      onNotice(t("mosaic.applied", { applied: (data.applied ?? []).length, skipped: data.skipped ?? 0 }));
    }
    if (typeof options.after === "function") options.after(data);
    return data;
  };
  const [portraitBusyId, setPortraitBusyId] = React.useState(null);
  const [portraitError, setPortraitError] = React.useState("");
  const [portraits, setPortraits] = React.useState({});
  const portraitRequests = React.useRef(/* @__PURE__ */ new Set());
  const loadPortrait = React.useCallback(async (path) => {
    if (typeof path !== "string" || path === "") return;
    if (portraitRequests.current.has(path)) return;
    portraitRequests.current.add(path);
    try {
      const data = await api2.mosaicPortraitRead(bookFolder, path);
      setPortraits((current) => ({ ...current, [path]: data?.ok === true ? data.dataUri : null }));
    } catch {
      setPortraits((current) => ({ ...current, [path]: null }));
    }
  }, [api2, bookFolder]);
  const promptLanguage = /[\u4e00-\u9fff]/.test(t("mosaic.generatePortrait")) ? "zh" : "en";
  const boardPortraitPaths = React.useMemo(() => {
    const list = [];
    for (const entity of mosaic?.entities ?? []) {
      if (typeof entity.portrait === "string" && entity.portrait !== "") list.push(entity.portrait);
    }
    return list.join("\n");
  }, [mosaic?.entities]);
  React.useEffect(() => {
    if (boardPortraitPaths === "") return;
    for (const path of boardPortraitPaths.split("\n")) loadPortrait(path);
  }, [boardPortraitPaths, loadPortrait]);
  const portraitOf = (entity) => {
    const path = entity?.portrait;
    if (typeof path !== "string" || path === "") return null;
    return Object.prototype.hasOwnProperty.call(portraits, path) ? portraits[path] : null;
  };
  const pictureOf = portraitOf;
  const generatePortrait = async (entity) => {
    if (portraitBusyId !== null) return;
    setPortraitBusyId(entity.id);
    setPortraitError("");
    try {
      const data = await api2.mosaicPortrait(bookFolder, entity, promptLanguage);
      if (data?.ok !== true) throw new Error(data?.error ?? t("mosaic.portraitFailed"));
      patchCard(entity.id, { portrait: data.path });
      setPortraits((current) => ({ ...current, [data.path]: data.dataUri ?? null }));
    } catch (error) {
      setPortraitError(error?.message ?? String(error));
    } finally {
      setPortraitBusyId(null);
    }
  };
  return {
    patchCard,
    createCard,
    removeCard,
    applyChanges,
    portraits,
    portraitBusyId,
    portraitError,
    portraitOf,
    pictureOf,
    generatePortrait
  };
}

// src/client/shared/gestures.js
var REBINDABLE_GESTURES = ["ask", "critique", "review", "chat"];
function isModifierOnly(chord) {
  return chord === null || chord === void 0 || typeof chord !== "object" ? false : chord.key === "";
}
function normalizeChord(raw) {
  const source = raw !== null && typeof raw === "object" ? raw : {};
  const key = typeof source.key === "string" && source.key !== "" ? source.key : "Tab";
  return {
    key: key.length === 1 ? key.toUpperCase() : key,
    alt: source.alt === true,
    mod: source.mod === true,
    shift: source.shift === true
  };
}
function applyChordOverrides(base, overrides) {
  const source = overrides !== null && typeof overrides === "object" ? overrides : {};
  const next = { ...base };
  for (const gesture of REBINDABLE_GESTURES) {
    const stored = source[gesture];
    if (stored === void 0 || stored === null || typeof stored !== "object") continue;
    next[gesture] = normalizeChord(stored);
  }
  return next;
}
function chordLabel(chord, mac) {
  const parts = [];
  if (mac) {
    if (chord.alt === true) parts.push("\u2325");
    if (chord.mod === true) parts.push("\u2318");
    if (chord.shift === true) parts.push("\u21E7");
  } else {
    if (chord.mod === true) parts.push("Ctrl+");
    if (chord.alt === true) parts.push("Alt+");
    if (chord.shift === true) parts.push("Shift+");
  }
  if (typeof chord.key === "string" && chord.key !== "") parts.push(chord.key === "Tab" ? "Tab" : chord.key);
  return parts.join("");
}
function gestureKeys(platform) {
  const mac = String(platform ?? "") === "macos";
  if (mac) {
    return {
      ask: { alt: false, mod: false, shift: false, key: "Tab" },
      // ⌥Tab asks for a GRAMMAR critique; ⌥⌘ asks for a full read of the section. The two used to
      // be the other way round, which is not what the writer asked for and not what the dock's own
      // titles say: 文法锐评 is the narrow pass, 这一节的问题 is the broad one, and the narrower one
      // gets the shorter chord.
      //
      // The read is ⌥⌘ with NO letter under it. A modifier-only gesture is what the writer asked
      // for, and it has its own matcher (`isModifierChord`): the chord table cannot express a press
      // whose "key" is one of the modifiers that is also part of it.
      critique: { alt: true, mod: false, shift: false, key: "Tab" },
      review: { alt: true, mod: true, shift: false, key: "" },
      // The composer's default, as a chord: nothing but Command held down.
      chat: { alt: false, mod: true, shift: false, key: "" },
      // What a keycap says. `⌥` is the symbol printed on an Apple keyboard for Option.
      askLabel: "Tab",
      // A lone Command press: there is no second key, so the keycap is the modifier alone.
      chatLabel: "\u2318",
      critiqueLabel: "\u2325Tab",
      reviewLabel: "\u2325\u2318",
      askHint: "Tab",
      critiqueHint: "Option+Tab",
      reviewHint: "Option+Command"
    };
  }
  return {
    ask: { alt: false, mod: false, shift: false, key: "Tab" },
    // Same order as macOS: the grammar pass takes the shorter chord. Windows has no ⌥Tab to lose —
    // Alt+Tab is the system's task switcher and a page never receives it — so the base chord is
    // Ctrl+Alt+Tab and the broader read adds Shift.
    critique: { alt: true, mod: true, shift: false, key: "Tab" },
    // Not a modifier-only gesture here: Ctrl+Alt with no key is not a press Windows reports
    // usefully, so the read keeps a letter under it.
    review: { alt: true, mod: true, shift: true, key: "Tab" },
    // Alt on Windows: the platform's own gesture for the composer. Not Ctrl — a lone Ctrl press
    // is not an event Windows sends usefully either, and Alt alone is, because only Alt+TAB is
    // taken by the shell. Not Win either: the Win key is the system's and never reaches a page.
    chat: { alt: true, mod: false, shift: false, key: "" },
    askLabel: "Tab",
    chatLabel: "Alt",
    critiqueLabel: "Ctrl+Alt+Tab",
    reviewLabel: "Ctrl+Alt+Shift+Tab",
    askHint: "Tab",
    critiqueHint: "Ctrl+Alt+Tab",
    reviewHint: "Ctrl+Alt+Shift+Tab"
  };
}
function defaultChord(platform, gesture) {
  return gestureKeys(platform)[gesture];
}
function resolveGestures(platform, overrides) {
  const mac = String(platform ?? "") === "macos";
  const base = gestureKeys(platform);
  const gestures = applyChordOverrides(base, overrides);
  const next = { ...gestures };
  for (const gesture of REBINDABLE_GESTURES) {
    next[`${gesture}Label`] = chordLabel(gestures[gesture], mac);
    const words = [
      gestures[gesture].alt === true ? "Option" : "",
      gestures[gesture].mod === true ? "Command" : "",
      gestures[gesture].shift === true ? "Shift" : ""
    ].filter((part) => part !== "");
    const key = typeof gestures[gesture].key === "string" && gestures[gesture].key !== "" ? `+${gestures[gesture].key}` : "";
    next[`${gesture}Hint`] = mac ? `${words.join("+")}${key}` : next[`${gesture}Label`];
  }
  next.chatLabel = chordLabel(gestures.chat, mac);
  return next;
}
function currentPlatform() {
  if (typeof navigator === "undefined") return "unknown";
  const platform = String(navigator.platform ?? "");
  const agent = String(navigator.userAgent ?? "");
  if (/mac/i.test(platform) || /Mac OS X/i.test(agent)) return "macos";
  if (/win/i.test(platform) || /Windows/i.test(agent)) return "windows";
  return "linux";
}
function chordMatches(event, chord, mac) {
  if (event === null || event === void 0 || chord === null || chord === void 0) return false;
  if (typeof event.key !== "string") return false;
  if (event.key.toLowerCase() !== String(chord.key).toLowerCase()) return false;
  const wants = (flag) => flag === true;
  if (event.altKey === true !== wants(chord.alt)) return false;
  if (event.shiftKey === true !== wants(chord.shift)) return false;
  if (event.metaKey === true !== wants(chord.mod && mac === true)) return false;
  if (event.ctrlKey === true !== wants(chord.mod && mac !== true)) return false;
  return true;
}
function isModifierChord(event, chord, mac) {
  if (event === null || event === void 0 || chord === null || chord === void 0) return false;
  if (typeof event.key !== "string" || event.key === "") return false;
  if (chord.key !== "" && chord.key !== void 0) return false;
  const modifierKeys = mac === true ? ["Meta", "Alt", "Shift", "Control"] : ["Control", "Alt", "Shift", "Meta"];
  if (!modifierKeys.includes(event.key)) return false;
  const wants = (flag) => flag === true;
  const down = (name) => {
    if (event.key === name) return true;
    if (name === "Meta") return event.metaKey === true;
    if (name === "Alt") return event.altKey === true;
    if (name === "Shift") return event.shiftKey === true;
    return event.ctrlKey === true;
  };
  if (down("Alt") !== wants(chord.alt)) return false;
  if (down("Shift") !== wants(chord.shift)) return false;
  if (down("Meta") !== wants(chord.mod && mac === true)) return false;
  if (down("Control") !== wants(chord.mod && mac !== true)) return false;
  return true;
}
function loneModifierKey(chord, mac) {
  if (chord !== null && typeof chord === "object" && chord.key !== "") return "";
  const source = chord !== null && typeof chord === "object" ? chord : {};
  if (source.mod === true) return mac === true ? "Meta" : "Control";
  if (source.alt === true) return "Alt";
  if (source.shift === true) return "Shift";
  return mac === true ? "Meta" : "Alt";
}
function createLoneModifierWatcher(onOpen, mac, trigger = "") {
  let chordUsed = false;
  let down = false;
  const triggerKey = trigger !== "" ? trigger : mac === true ? "Meta" : "Alt";
  const isModifier = (event) => event !== null && event !== void 0 && event.key === triggerKey;
  const withState = {
    // The read gesture needs to know whether this press is still "just modifiers so far": a bare
    // modifier keydown that comes AFTER something else was typed is half of a chord such as ⌘C,
    // and must not read the section on its way up.
    typedSince: () => chordUsed,
    // The read gesture fired on this press, so the modifier coming back up is not also the
    // composer's lone-press gesture.
    markUsed: () => {
      chordUsed = true;
    },
    keydown(event) {
      if (!isModifier(event)) {
        if (down) chordUsed = true;
        return;
      }
      down = true;
      chordUsed = event.repeat === true ? true : chordUsed;
    },
    keyup(event) {
      if (!isModifier(event)) return;
      const trigger2 = down && !chordUsed;
      down = false;
      chordUsed = false;
      if (trigger2) onOpen();
    }
  };
  return withState;
}

// domain/tree.js
function flattenLeaves(nodes) {
  const out = [];
  const walk = (list) => {
    for (const node of list ?? []) {
      if (node.children.length > 0) walk(node.children);
      else out.push(node);
    }
  };
  walk(nodes);
  return out;
}
function findNode(nodes, id) {
  for (const node of nodes ?? []) {
    if (node.id === id) return node;
    const hit = findNode(node.children, id);
    if (hit !== void 0) return hit;
  }
  return void 0;
}
function pathToNode(nodes, id) {
  const walk = (list, trail) => {
    for (const node of list ?? []) {
      if (node.id === id) return trail;
      const hit = walk(node.children, [...trail, node]);
      if (hit !== void 0) return hit;
    }
    return void 0;
  };
  return walk(nodes, []) ?? [];
}
function mapNode(nodes, id, mutate) {
  return (nodes ?? []).map((node) => {
    if (node.id === id) return mutate(node);
    return node.children.length === 0 ? node : { ...node, children: mapNode(node.children, id, mutate) };
  });
}
function removeNode(nodes, id) {
  return (nodes ?? []).filter((node) => node.id !== id).map((node) => node.children.length === 0 ? node : { ...node, children: removeNode(node.children, id) });
}

// domain/book.js
function statusAfterText(text, status) {
  if (typeof text !== "string" || text === "") return "todo";
  const current = NODE_STATUSES.includes(status) ? status : "todo";
  return current === "todo" ? "writing" : current;
}

// src/client/panel/new-book-dialog.js
function NewBookDialog({ t, draft, busy, error, onDraft, onCancel, onCreate, onOpen }) {
  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };
    if (typeof document === "undefined" || typeof document.addEventListener !== "function") return void 0;
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return h(
    "div",
    {
      className: "st-newbook-backdrop",
      role: "presentation",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onCancel();
      }
    },
    h(
      "div",
      {
        className: "st-newbook",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "st-newbook-title"
      },
      h("h2", { className: "st-newbook-title", id: "st-newbook-title" }, t("welcome.newBook")),
      h("input", {
        className: "st-newbook-input",
        autoFocus: true,
        value: draft,
        placeholder: t("label.newBookTitle"),
        "aria-label": t("label.newBookTitle"),
        onChange: (e) => onDraft(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCreate();
          }
        }
      }),
      error === "" ? null : h("p", { className: "st-newbook-error" }, error),
      h(
        "div",
        { className: "st-newbook-actions" },
        typeof onOpen === "function" ? h("button", { type: "button", className: "st-btn st-btn-ghost st-newbook-open", onClick: onOpen }, t("action.open")) : null,
        h("button", { type: "button", className: "st-btn st-btn-ghost", onClick: onCancel }, t("action.cancel")),
        h("button", {
          type: "button",
          className: "st-btn st-btn-primary",
          disabled: busy || draft.trim() === "",
          onClick: onCreate
        }, busy ? "\u2026" : t("action.create"))
      )
    )
  );
}

// src/client/mosaic/cards.js
function MosaicPortrait({ label, picture }) {
  const initial = String(label ?? "").trim().slice(0, 1);
  return h(
    "div",
    { className: "st-mosaic-portrait", "data-testid": "mosaic-portrait" },
    h(
      "div",
      { className: "st-mosaic-portrait-frame" },
      picture !== null && picture !== void 0 ? h("img", { src: picture, alt: label ?? "", draggable: false }) : initial === "" ? null : h("span", { className: "st-mosaic-portrait-initial" }, initial)
    )
  );
}
function MosaicCardTitle({ label, role }) {
  return h(
    "div",
    { className: "st-mosaic-portrait-hint" },
    h("span", { className: "st-mosaic-portrait-name" }, label),
    role !== "" && role !== void 0 && role !== null ? h("span", { className: "st-mosaic-portrait-role" }, role) : null
  );
}
function MosaicGalleryCard({ id, kind, label, role, picture, onActivate, children }) {
  const body = Array.isArray(children) ? children : children === void 0 ? [] : [children];
  const interactive = typeof onActivate === "function";
  return h(
    "article",
    {
      key: id,
      className: "st-mosaic-page-card",
      "data-kind": kind,
      ...interactive ? {
        role: "button",
        tabIndex: 0,
        onClick: () => onActivate(),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        }
      } : { "data-testid": "mosaic-gallery-card" }
    },
    // No picture means no portrait band: a card without a picture is a text-only entry.
    picture === void 0 ? null : h(MosaicPortrait, { label, picture }),
    h(
      "div",
      { className: "st-mosaic-card-text" },
      picture === void 0 ? null : h(MosaicCardTitle, { label, role }),
      h("div", { className: "st-mosaic-card-body" }, ...body)
    )
  );
}
function MosaicCardMenu({ t, onEdit, onDelete }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  useDismiss(rootRef, open, () => setOpen(false));
  if (typeof onEdit !== "function" && typeof onDelete !== "function") return null;
  return h(
    "div",
    { className: "st-card-menu", ref: rootRef },
    h("button", {
      type: "button",
      className: "st-card-menu-trigger",
      "aria-label": t("action.cardActions"),
      "aria-haspopup": "menu",
      "aria-expanded": open ? "true" : "false",
      // The card underneath opens on click; a control inside it must not also do that.
      onClick: (e) => {
        e.stopPropagation?.();
        setOpen((was) => !was);
      }
      // Three dots STACKED, drawn rather than typed: a glyph's dots sit on the text baseline and
      // space themselves by the font. Three spans are the same size everywhere.
    }, h(
      "span",
      { className: "st-card-menu-dots", "aria-hidden": true },
      h("i", null),
      h("i", null),
      h("i", null)
    )),
    open ? h(
      "div",
      { className: "st-card-menu-list", role: "menu" },
      typeof onEdit === "function" ? h("button", {
        type: "button",
        className: "st-card-menu-item",
        role: "menuitem",
        onClick: (e) => {
          e.stopPropagation?.();
          setOpen(false);
          onEdit();
        }
      }, t("action.editCard")) : null,
      typeof onDelete === "function" ? h("button", {
        type: "button",
        className: "st-card-menu-item st-danger",
        role: "menuitem",
        onClick: (e) => {
          e.stopPropagation?.();
          setOpen(false);
          onDelete();
        }
      }, t("action.deleteCard")) : null
    ) : null
  );
}
function MosaicGallery({ t, rows, children }) {
  const cards = Array.isArray(children) ? children : children === void 0 ? [] : [children];
  if (rows !== void 0 && rows.length === 0) return h("p", { className: "st-mosaic-empty" }, t("mosaic.empty"));
  return h("div", { className: "st-mosaic-gallery" }, ...cards);
}
function MosaicCards({ t, mosaic, itemsOnly = false, onInspect, onEdit, onDelete, pictureOf }) {
  const entities = Array.isArray(mosaic.entities) ? mosaic.entities : [];
  const cards = entities.filter((e) => itemsOnly ? e.kind === "item" : e.kind !== "character" && e.kind !== "item");
  const holdersOf = (cardId) => (Array.isArray(mosaic.edges) ? mosaic.edges : []).filter((edge) => edge.retired !== true && edge.from === cardId && edge.truth?.kind === "\u6301\u6709").map((edge) => entities.find((e) => e.id === edge.to)?.name).filter((name) => name !== void 0);
  return h(
    MosaicGallery,
    { t, rows: cards },
    cards.map((card) => h(
      MosaicGalleryCard,
      {
        key: card.id,
        id: card.id,
        kind: card.kind,
        label: card.name,
        role: card.summary,
        picture: pictureOf(card),
        // The whole card is the hit target: a card that only opened from its title would make
        // the writer aim at text they cannot see the edges of.
        onActivate: () => onInspect(card)
      },
      // The holder line belongs to items: who owns it is the fact checked most often, and it
      // sits above the prose so a long body does not bury it.
      itemsOnly ? h(
        "p",
        { className: "st-mosaic-page-holder" },
        holdersOf(card.id).join("\u3001") || t("mosaic.noHolder")
      ) : null,
      card.description !== "" ? h("p", { className: "st-mosaic-card-summary" }, card.description) : null,
      h(MosaicCardMenu, {
        t,
        onEdit: typeof onEdit === "function" ? () => onEdit(card) : void 0,
        onDelete: typeof onDelete === "function" ? () => onDelete(card) : void 0
      })
    ))
  );
}
function MosaicCast({ t, mosaic, onInspect, onEdit, onDelete, pictureOf }) {
  const cast = (Array.isArray(mosaic.entities) ? mosaic.entities : []).filter((e) => e.kind === "character");
  return h(
    MosaicGallery,
    { t, rows: cast },
    cast.map((c) => h(
      MosaicGalleryCard,
      {
        key: c.id,
        id: c.id,
        kind: "character",
        label: c.name,
        role: c.role,
        picture: pictureOf(c),
        onActivate: () => onInspect(c)
      },
      // No heading here: the caption already names the character next to their role, and a
      // second copy of the name would be the card's most prominent text twice over.
      c.summary !== "" ? h("p", { className: "st-mosaic-card-summary" }, c.summary) : null,
      (c.statuses ?? []).length > 0 ? h(
        "div",
        { className: "st-mosaic-chips" },
        c.statuses.map((s) => h("span", { key: s.id, className: "st-mosaic-chip" }, s.label))
      ) : null,
      h(MosaicCardMenu, {
        t,
        onEdit: typeof onEdit === "function" ? () => onEdit(c) : void 0,
        onDelete: typeof onDelete === "function" ? () => onDelete(c) : void 0
      })
    ))
  );
}

// src/client/panel/library.js
function BookLibrary({ t, api: api2, books, workspaces, workspaceSnapshot, onOpen, onCreated, onRenamed, onDeleted, onBack, backTitle, onNotice, onOpenDirectory }) {
  const [creating, setCreating] = React.useState(false);
  const [renaming, setRenaming] = React.useState(null);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [confirming, setConfirming] = React.useState(null);
  const [removeFiles, setRemoveFiles] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  useNotice(onNotice, error);
  const beginRename = (entry) => {
    setRenaming(entry);
    setDraftTitle(entry.title);
    setError("");
  };
  const commitRename = async () => {
    const entry = renaming;
    const title = draftTitle.trim();
    if (entry === null || title === "" || title === entry.title) {
      setRenaming(null);
      return;
    }
    setBusy(true);
    try {
      const data = await api2.renameBook(entry.folder, title);
      setRenaming(null);
      onRenamed(entry, data);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };
  const beginDelete = (entry) => {
    setConfirming(entry);
    setRemoveFiles(false);
    setError("");
  };
  const commitDelete = async () => {
    const entry = confirming;
    if (entry === null) return;
    setBusy(true);
    try {
      await api2.deleteBook(entry.folder, removeFiles);
      const owned = (workspaceSnapshot?.items ?? []).find((row) => row.path === entry.absolutePath);
      if (owned !== void 0 && workspaces?.delete !== void 0) {
        try {
          await workspaces.delete(owned.workspaceId);
        } catch (failure) {
          setError(failure.message);
        }
      } else if (owned !== void 0) {
        setError(t("label.workspaceLeftBehind"));
      }
      setConfirming(null);
      onDeleted();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };
  const create = async () => {
    const title = draft.trim();
    if (title === "" || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await api2.createBook(title);
      setDraft("");
      setCreating(false);
      onCreated(data.folder, data.books ?? [], data.absolutePath);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };
  return h(
    "div",
    {
      className: "st-library st-canvas",
      // The bright dot layer is masked to a position carried in CSS variables. Writing them
      // straight onto the element (never through state) keeps the follow at pointer-move speed
      // with no re-render per move. Y adds scrollTop because the layer scrolls with the content
      // while the pointer coordinates do not.
      onPointerMove: (e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--st-pointer-x", `${Math.round(e.clientX - rect.left)}px`);
        el.style.setProperty("--st-pointer-y", `${Math.round(e.clientY - rect.top + el.scrollTop)}px`);
      },
      onPointerLeave: (e) => {
        e.currentTarget.style.setProperty("--st-pointer-x", "-999px");
      }
    },
    // The head row IS the titlebar (same class): one recipe for the divider, the padding and
    // the leading clearance, so the shelf title sits on the same line the book title occupies.
    h(
      "div",
      { className: "st-titlebar st-library-head" },
      // Back to the book that was open. Only offered when there is one: on a first visit the
      // library IS the panel, and a back arrow pointing nowhere would be a dead control.
      typeof onBack === "function" && backTitle ? h("button", {
        type: "button",
        className: "st-btn st-btn-ghost st-btn-icon st-library-back",
        title: t("label.backToBook", { title: backTitle }),
        "aria-label": t("label.backToBook", { title: backTitle }),
        onClick: onBack
      }, h(BackIcon)) : null,
      h("h2", { className: "st-library-title" }, t("label.library")),
      h("span", { className: "st-spacer" }),
      h("span", { className: "st-caption" }, t("label.bookCount", { n: books.length }))
    ),
    // The shelf is the SAME card as the board's gallery — one component, one size, one set of
    // shadows. It used to be a private 220px text box with its own border, which read as a row
    // of list items rather than as the covers of books.
    h(
      MosaicGallery,
      { t, rows: books },
      books.map((entry) => h(
        MosaicGalleryCard,
        {
          key: `${entry.workspace}/${entry.folder}`,
          id: entry.folder,
          kind: "book",
          // The identity line under the cover: the title, and only the title.
          label: entry.title,
          // No role line. `role` renders beside the title on the cover strip, and for a book it was
          // the FOLDER NAME — which is the title again, because the folder is derived from it. The
          // card read "漫长的旅行 · 漫长的旅行". A character's role says something the name does not;
          // a book has no such second line, so it gets none.
          // `null`, not `undefined`: a book has no portrait, but it does have a FACE — the same
          // square cover area every board card has, with the title's first character standing in.
          // `undefined` would drop the whole band and leave a flat text box, which is what the
          // shelf used to be and what the writer asked to stop being.
          picture: null,
          onActivate: () => onOpen(entry.folder, entry.absolutePath)
        },
        // `st-book-open` stays as the card's own click target: it is what the tests drive and
        // what a keyboard reaches. Its handler stops the event so the card's own activate does
        // not fire a second time in the browser.
        h(
          "div",
          {
            className: "st-book-open",
            "data-testid": "book-open",
            onClick: (e) => {
              if (e !== void 0 && e !== null) e.stopPropagation?.();
              onOpen(entry.folder, entry.absolutePath);
            }
          },
          h("div", { className: "st-book-meta" }, t("label.bookMeta", { c: entry.chapters, f: entry.finals }))
        ),
        // The card's ⋯ menu, the same control every other card carries. It replaces the two
        // buttons that used to sit under the cover: they did not fit the card's width, so the
        // delete label was clipped, and a shelf of cards each wearing two buttons read as a
        // toolbar rather than as a shelf.
        h(MosaicCardMenu, {
          t,
          onEdit: () => beginRename(entry),
          onDelete: () => beginDelete(entry)
        })
      )),
      // The tile is a CARD, sized like the ones beside it, and it OPENS A DIALOG: creating a
      // book asks for a title in the same modal the delete confirmation uses, rather than
      // turning a grid cell into a form. A cell-sized input squeezed the field into 184px and
      // made the shelf jump as the row re-flowed around it.
      h(
        "button",
        {
          // `st-book-add` marks the one tile in the grid that is a BUTTON. It is what carries the
          // hover and press state: the shared `.st-book-new` class is also on the rename form,
          // hover and press state: the shared `.st-book-new` class is also on the rename form,
          // and a form that lifts under the pointer is a form you fight with while clicking.
          type: "button",
          className: "st-book-card st-book-new st-book-add",
          // The tile is what opened the dialog, so it stays marked while the dialog is up: an
          // accent ring and the lifted position, the same two cues a card uses for "this one".
          // Announced as a popup rather than a pressed toggle — it opens a question, it does not
          // switch something on.
          "aria-haspopup": "dialog",
          "aria-expanded": creating ? "true" : "false",
          onClick: () => {
            setDraft("");
            setError("");
            setCreating(true);
          }
        },
        h("span", { className: "st-book-plus" }, "+"),
        h("span", null, t("action.newBook"))
      ),
      // One inline editor at a time: a rename in place reads better than a modal over a shelf.
      renaming === null ? null : h(
        "div",
        { className: "st-book-card st-book-new st-book-form" },
        h("div", { className: "st-muted st-gap-under-hint" }, t("label.renameBookHint")),
        h("input", {
          className: "st-input",
          autoFocus: true,
          value: draftTitle,
          onChange: (e) => setDraftTitle(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitRename();
            }
            if (e.key === "Escape") {
              setRenaming(null);
            }
          }
        }),
        h(
          "div",
          { className: "st-row st-gap-over-row" },
          h("button", { type: "button", className: "st-btn st-btn-primary", disabled: busy || draftTitle.trim() === "", onClick: commitRename }, t("action.rename")),
          h("button", { type: "button", className: "st-btn", onClick: () => setRenaming(null) }, t("action.cancel"))
        )
      )
    ),
    // Creating a book asks in a modal too. The shelf is a grid of cards; a card that turns into
    // a form re-flows the row and gives the title field 184px, which is narrower than a title.
    creating ? h(NewBookDialog, {
      t,
      draft,
      busy,
      error,
      onDraft: setDraft,
      onCancel: () => {
        setCreating(false);
        setDraft("");
      },
      onCreate: create,
      onOpen: typeof onOpenDirectory === "function" ? () => {
        setCreating(false);
        setDraft("");
        onOpenDirectory();
      } : void 0
    }) : null,
    // Rename is inline because it is reversible and quick. DELETING is not: it asks in a
    // modal, over the shelf, with the destructive choice spelled out and the reversible one
    // preselected. A second question buried in the card was too easy to hit by accident.
    // It sits OUTSIDE the gallery: a dialog is not a card and must not be laid out as one.
    confirming === null ? null : h(ConfirmDialog, {
      t,
      busy,
      title: t("label.deleteBookConfirm", { title: confirming.title }),
      children: [
        h(
          "label",
          { key: "check", className: "st-check" },
          h("input", { type: "checkbox", checked: removeFiles, onChange: (e) => setRemoveFiles(e.target.checked) }),
          h("span", null, t("label.deleteFilesToo"))
        ),
        h("div", { key: "hint", className: "st-dialog-hint" }, removeFiles ? t("label.deleteFilesWarn") : t("label.deleteManifestOnly"))
      ],
      confirmLabel: t("action.delete"),
      cancelLabel: t("action.cancel"),
      onConfirm: commitDelete,
      onCancel: () => setConfirming(null)
    })
  );
}

// src/client/panel/glyph-field.js
var GLYPHS = [
  "\u4F4D",
  "\u9762",
  "\u98DE",
  "\u884C",
  "\u5C71",
  "\u5DDD",
  "\u98CE",
  "\u6708",
  "\u4E91",
  "\u96E8",
  "\u706F",
  "\u4E66",
  "\u7EB8",
  "\u58A8",
  "\u591C",
  "\u661F",
  "\u6D77",
  "\u821F",
  "\u82B1",
  "\u6728",
  "\u5149",
  "\u5F71",
  "\u68A6",
  "\u8DEF",
  "\u95E8",
  "\u7A97",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "K",
  "M",
  "N",
  "R",
  "S",
  "T",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "k",
  "m",
  "n",
  "r",
  "s",
  "t",
  "w",
  "x",
  "y",
  "z"
];
var SLOT_COUNT = 220;
function hashCell(col, row) {
  let value = col * 73856093 ^ row * 19349663;
  value = Math.imul(value ^ value >>> 13, 1274126177);
  return value >>> 0;
}
function tokenNumber(styles, name, fallback) {
  const value = Number.parseFloat(styles.getPropertyValue(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
function GlyphField() {
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    const root = rootRef.current;
    if (root === null || root === void 0 || typeof document === "undefined" || typeof window === "undefined") return void 0;
    if (typeof window.getComputedStyle !== "function" || typeof document.createElement !== "function") return void 0;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void 0;
    const parent = root.parentElement;
    if (parent === null || parent === void 0) return void 0;
    const styles = window.getComputedStyle(root);
    const cell = tokenNumber(styles, "--st-canvas-grid", 24);
    const radius = tokenNumber(styles, "--st-glyph-radius", 150);
    const contentPad = tokenNumber(styles, "--st-glyph-content-pad", 6);
    const slots = [];
    for (let index = 0; index < SLOT_COUNT; index += 1) {
      const slot = document.createElement("div");
      slot.className = "st-glyph-slot";
      slot.dataset.on = "false";
      const face = document.createElement("span");
      face.className = "st-glyph-face";
      slot.appendChild(face);
      root.appendChild(slot);
      slots.push({ slot, face, used: false });
    }
    const active = /* @__PURE__ */ new Map();
    let frame = 0;
    let pointer = null;
    const free = () => slots.find((entry) => !entry.used);
    const draw = () => {
      frame = 0;
      if (pointer === null) return;
      const rect = root.getBoundingClientRect();
      const x = pointer.clientX - rect.left;
      const y = pointer.clientY - rect.top;
      const firstCol = Math.floor((x - radius) / cell);
      const lastCol = Math.floor((x + radius) / cell);
      const firstRow = Math.floor((y - radius) / cell);
      const lastRow = Math.floor((y + radius) / cell);
      const wanted = /* @__PURE__ */ new Set();
      const content = root.parentElement?.querySelector?.(".st-welcome-main");
      const zones = content === null || content === void 0 ? [] : [...content.querySelectorAll(".st-welcome-title, .st-welcome-latin, .st-welcome-lede, .st-welcome-actions")];
      const contentBoxes = zones.map((zone) => {
        const box = zone.getBoundingClientRect();
        return {
          left: box.left - rect.left - contentPad,
          right: box.right - rect.left + contentPad,
          top: box.top - rect.top - contentPad,
          bottom: box.bottom - rect.top + contentPad
        };
      });
      for (let row = firstRow; row <= lastRow; row += 1) {
        for (let col = firstCol; col <= lastCol; col += 1) {
          const cx = (col + 0.5) * cell;
          const cy = (row + 0.5) * cell;
          if ((cx - x) ** 2 + (cy - y) ** 2 > radius ** 2) continue;
          const key = `${col}:${row}`;
          const underContent = contentBoxes.some((box) => cx >= box.left && cx <= box.right && cy >= box.top && cy <= box.bottom);
          wanted.add(key);
          const n = hashCell(col, row);
          if (n % 3 === 0) continue;
          const char = GLYPHS[n % GLYPHS.length];
          let entry = active.get(key);
          if (entry === void 0) {
            entry = free();
            if (entry === void 0) continue;
            entry.used = true;
            active.set(key, entry);
            entry.slot.style.transform = `translate3d(${Math.round(col * cell)}px, ${Math.round(row * cell)}px, 0)`;
            entry.face.textContent = char;
            entry.slot.dataset.tone = n % 16 === 0 ? "accent" : n % 4 === 0 ? "primary" : "secondary";
            entry.face.style.setProperty("--st-glyph-ry", `${n % 20 - 10}deg`);
            entry.face.style.setProperty("--st-glyph-rx", `${(n >>> 4) % 10 - 5}deg`);
            entry.face.style.setProperty("--st-glyph-delay", `${n % 5 * 24}ms`);
          }
          entry.slot.dataset.on = "true";
          entry.slot.dataset.content = underContent ? "true" : "false";
        }
      }
      for (const [key, entry] of [...active]) {
        if (wanted.has(key)) continue;
        entry.slot.dataset.on = "false";
        entry.used = false;
        active.delete(key);
      }
    };
    const onMove = (event) => {
      pointer = { clientX: event.clientX, clientY: event.clientY };
      root.dataset.visible = "true";
      if (frame === 0) frame = (window.requestAnimationFrame ?? globalThis.requestAnimationFrame)(draw);
    };
    const onLeave = () => {
      pointer = null;
      root.dataset.visible = "false";
      for (const entry of active.values()) {
        entry.slot.dataset.on = "false";
        entry.used = false;
      }
      active.clear();
    };
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    parent.addEventListener("pointercancel", onLeave);
    return () => {
      if (frame !== 0) (window.cancelAnimationFrame ?? globalThis.cancelAnimationFrame)(frame);
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      parent.removeEventListener("pointercancel", onLeave);
      for (const entry of slots) entry.slot.remove();
    };
  }, []);
  return h("div", { className: "st-glyph-field", ref: rootRef, "aria-hidden": "true", "data-visible": "false" });
}

// src/client/panel/welcome.js
function WelcomePage({ t, api: api2, books, hasBook, onCreated, onLibrary, onBack, onSeen, onBegin, primary, onOpenDirectory }) {
  const [creating, setCreating] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const begin = () => {
    if (typeof onBegin === "function") {
      onBegin();
      return;
    }
    setDraft("");
    setError("");
    setCreating(true);
  };
  const create = async () => {
    const title = draft.trim();
    if (title === "" || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await api2.createBook(title);
      setBusy(false);
      setCreating(false);
      if (typeof onSeen === "function") onSeen();
      if (typeof onCreated === "function") onCreated(data.folder, data.books ?? [], data.absolutePath);
    } catch (failure) {
      setBusy(false);
      setError(String(failure?.message ?? failure));
    }
  };
  const enterShelf = () => {
    if (typeof onSeen === "function") onSeen();
    if (typeof onLibrary === "function") onLibrary();
  };
  return h(
    "div",
    {
      className: "st-welcome st-canvas",
      onPointerMove: (e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--st-pointer-x", `${Math.round(e.clientX - rect.left)}px`);
        el.style.setProperty("--st-pointer-y", `${Math.round(e.clientY - rect.top + el.scrollTop)}px`);
      },
      onPointerLeave: (e) => {
        e.currentTarget.style.setProperty("--st-pointer-x", "-999px");
      }
    },
    h(GlyphField),
    hasBook && typeof onBack === "function" ? h("button", {
      type: "button",
      className: "st-btn st-btn-ghost st-btn-icon st-welcome-back",
      title: t("welcome.back"),
      "aria-label": t("welcome.back"),
      onClick: onBack
    }, h(BackIcon)) : null,
    h(
      "div",
      { className: "st-welcome-main" },
      h(
        "div",
        { className: "st-welcome-copy" },
        h(
          "h1",
          { className: "st-welcome-title" },
          h("span", null, t("brand.lead")),
          h("span", { className: "st-welcome-accent" }, t("brand.accent"))
        ),
        h("p", { className: "st-welcome-latin" }, t("brand.latin")),
        h("p", { className: "st-welcome-lede" }, t("welcome.lede")),
        h(
          "div",
          { className: "st-welcome-cta" },
          h(
            "div",
            { className: "st-welcome-actions" },
            primary !== void 0 && primary !== null ? primary : h(
              "button",
              { type: "button", className: "st-btn st-btn-primary st-btn-xl", onClick: begin },
              t("welcome.begin")
            ),
            books.length > 0 && typeof onLibrary === "function" ? h(
              "button",
              { type: "button", className: "st-btn st-btn-ghost st-btn-flow", onClick: enterShelf },
              h("span", { className: "st-btn-flow-label" }, t("welcome.library"))
            ) : null
          ),
          error === "" ? null : h("p", { className: "st-welcome-error" }, error)
        )
      )
    ),
    creating ? h(NewBookDialog, {
      t,
      draft,
      busy,
      error,
      onDraft: setDraft,
      onCancel: () => {
        setCreating(false);
        setDraft("");
      },
      onCreate: create,
      onOpen: onOpenDirectory
    }) : null
  );
}

// src/client/panel/rail-tools.js
var PLUGIN = { name: "@local/dsh-plugin-storywriting", version: "0.1.0-beta.1", author: "flyingludens" };
function RailTool({ icon, label, hint, disabled, onClick, testId }) {
  return h(
    "button",
    {
      type: "button",
      className: "st-rail-tool",
      "data-testid": testId,
      title: hint,
      // The label is the accessible name. Naming it again with aria-label would only be a second
      // copy of the same string, and the two could drift.
      disabled: disabled === true,
      onClick
    },
    h("span", { className: "st-rail-tool-icon" }, icon),
    h("span", { className: "st-rail-tool-label" }, label)
  );
}
function exportFileName(title) {
  const base = String(title ?? "").trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-").replace(/\s+/g, " ").replace(/^\.+/, "").slice(0, 60).trim();
  return `${base === "" ? "manuscript" : base}.md`;
}
function downloadText(text, name) {
  if (typeof document === "undefined" || typeof URL === "undefined" || typeof Blob !== "function") return false;
  if (typeof document.createElement !== "function") return false;
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  if (typeof link.click !== "function") {
    URL.revokeObjectURL(href);
    return false;
  }
  link.click();
  globalThis.setTimeout(() => {
    URL.revokeObjectURL(href);
  }, 0);
  return true;
}
function RailTools({ t, book, onStart, onShelf, onOpen, onSave, onExport, onNotice, onAbout, saving }) {
  const [busy, setBusy] = React.useState(false);
  const hasBook = book !== null && book !== void 0;
  const exportNow = async () => {
    if (typeof onExport !== "function" || busy) return;
    setBusy(true);
    try {
      const markdown = await onExport();
      if (typeof markdown !== "string" || markdown.trim() === "") {
        if (typeof onNotice === "function") onNotice(t("rail.exportEmpty"), "info");
        return;
      }
      const name = exportFileName(book?.title);
      if (downloadText(markdown, name) !== true) {
        if (typeof onNotice === "function") onNotice(t("rail.exportEmpty"), "info");
        return;
      }
      if (typeof onNotice === "function") onNotice(t("rail.exportDone", { name }), "info");
    } catch (error) {
      if (typeof onNotice === "function") onNotice(String(error?.message ?? error), "error");
    } finally {
      setBusy(false);
    }
  };
  return h(
    React.Fragment,
    null,
    // The menu's own block: it takes the lower half of the card (see rail.css.js), so the
    // list sits at a fixed place in the panel rather than at the end of however long the tree is.
    h(
      "div",
      { className: "st-rail-menu" },
      h(
        "div",
        { className: "st-rail-tools", role: "group" },
        h(RailTool, {
          t,
          icon: h(StartIcon),
          label: t("rail.start"),
          testId: "rail-start",
          disabled: typeof onStart !== "function",
          onClick: () => {
            if (typeof onStart === "function") onStart();
          }
        }),
        h(RailTool, {
          t,
          icon: h(ShelfIcon),
          label: t("rail.shelf"),
          testId: "rail-shelf",
          // While the shelf is showing there is nowhere to go: the button is present so the row
          // does not change shape between screens, and disabled so it does not lie about it.
          disabled: typeof onShelf !== "function",
          onClick: () => {
            if (typeof onShelf === "function") onShelf();
          }
        }),
        h(RailTool, {
          t,
          icon: h(FolderIcon),
          label: t("rail.open"),
          testId: "rail-open",
          disabled: typeof onOpen !== "function",
          onClick: () => {
            if (typeof onOpen === "function") onOpen();
          }
        }),
        h(RailTool, {
          t,
          icon: h(SaveIcon),
          label: t("rail.save"),
          hint: t("rail.saveHint"),
          testId: "rail-save",
          disabled: !hasBook || typeof onSave !== "function" || saving === true,
          onClick: () => {
            if (typeof onSave !== "function") return;
            onSave();
            if (typeof onNotice === "function") onNotice(t("rail.savedNow"), "info");
          }
        }),
        h(RailTool, {
          t,
          icon: h(ExportIcon),
          label: t("rail.export"),
          testId: "rail-export",
          disabled: !hasBook || typeof onExport !== "function" || busy,
          onClick: exportNow
        }),
        h(RailTool, {
          t,
          icon: h(InfoIcon),
          label: t("rail.about"),
          testId: "rail-about",
          // The card is NOT rendered here. This component is mounted inside the rail, which is an
          // absolutely positioned card: a fixed or inset:0 layer inside it is clipped to the rail and
          // centres on 264px of column. The panel owns the open state and mounts the card at its own
          // level, where "centred" means the panel the writer is looking at.
          onClick: () => {
            if (typeof onAbout === "function") onAbout();
          }
        })
      )
    )
  );
}
function AboutBox({ t, onClose }) {
  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    if (typeof document === "undefined" || typeof document.addEventListener !== "function") return void 0;
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const rows = [
    { key: "name", name: t("about.name"), value: t("brand.full") },
    { key: "version", name: t("about.version"), value: PLUGIN.version },
    { key: "author", name: t("about.author"), value: PLUGIN.author }
  ];
  return h(
    "div",
    {
      className: "st-backdrop",
      role: "presentation",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose();
      }
    },
    h(
      "div",
      { className: "st-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("rail.about") },
      h("div", { className: "st-dialog-title" }, t("rail.about")),
      h(
        "div",
        { className: "st-dialog-body" },
        rows.map((row) => h(
          "div",
          { key: row.key, className: "st-row st-gap-under-hint" },
          h("span", { className: "st-muted" }, row.name),
          h("span", { className: "st-spacer" }),
          h("span", null, row.value)
        ))
      ),
      h(
        "div",
        { className: "st-dialog-actions" },
        h("button", { type: "button", className: "st-btn", onClick: onClose }, t("action.close"))
      )
    )
  );
}

// src/client/panel/composer.js
function ComposerModelSeat({ t, groups, value, efforts, onChange, onEffort }) {
  const [open, setOpen] = React.useState(false);
  const [pane, setPane] = React.useState("root");
  const [openToward, setOpenToward] = React.useState("down");
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) {
      setPane("root");
      return void 0;
    }
    if (typeof document === "undefined" || typeof document.addEventListener !== "function") return void 0;
    const onDown = (event) => {
      const root = rootRef.current;
      if (root !== null && root !== void 0 && typeof root.contains === "function" && root.contains(event.target)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setPane((current) => {
        if (current !== "root") return "root";
        setOpen(false);
        return "root";
      });
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const levels = Array.isArray(efforts) ? efforts : [];
  const modelName = value === null || value === void 0 || typeof value.model !== "string" ? t("status.modelUnknown") : value.model;
  const effortId = value?.reasoningEffort ?? "";
  const effortName = effortId === "" ? "" : levels.find((level) => level.id === effortId)?.name ?? effortId;
  const close = () => {
    setOpen(false);
    setPane("root");
  };
  const pickLevel = (id) => {
    close();
    if (typeof onEffort === "function") onEffort(id);
  };
  const pickModel = (provider, model) => {
    close();
    if (typeof onChange === "function") onChange({ provider, model });
  };
  const modelRows = [];
  for (const group of groups ?? []) {
    modelRows.push(h("div", { key: `g:${group.id}`, className: "st-seat-group" }, group.name ?? group.id));
    for (const model of group.models ?? []) {
      const current = value !== null && value !== void 0 && value.provider === group.id && value.model === model.model;
      modelRows.push(h(
        "button",
        {
          key: `${group.id}:${model.model}`,
          type: "button",
          className: "st-seat-option",
          role: "menuitemradio",
          "aria-checked": current ? "true" : "false",
          onClick: () => pickModel(group.id, model.model)
        },
        h("span", { className: "st-seat-option-name" }, model.name ?? model.model),
        current ? h("span", { className: "st-seat-check" }, h("svg", {
          className: "st-icon-sm",
          viewBox: "0 0 16 16",
          "aria-hidden": true,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.8,
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, h("path", { d: "M3 8.5 6.2 11.6 13 4.6" }))) : null
      ));
    }
  }
  if (modelRows.length === 0) modelRows.push(h("div", { key: "none", className: "st-seat-empty" }, t("label.noModels")));
  const rootRows = [
    h(
      "button",
      {
        key: "model",
        type: "button",
        className: "st-seat-cell",
        role: "menuitem",
        onClick: () => setPane("models")
      },
      h("span", { className: "st-seat-cell-label" }, t("label.model")),
      h("span", { className: "st-seat-cell-value" }, modelName),
      h(Chevron, { direction: openToward })
    ),
    // The effort row only exists when the model has levels, for the reason the axis does: a
    // level is a property of the route, not a vocabulary the panel invents.
    levels.length === 0 ? null : h(
      "button",
      {
        key: "effort",
        type: "button",
        className: "st-seat-cell",
        role: "menuitem",
        onClick: () => setPane("efforts")
      },
      h("span", { className: "st-seat-cell-label" }, t("label.effort")),
      h("span", { className: "st-seat-cell-value" }, effortName === "" ? t("status.effortDefault") : effortName),
      h(Chevron, { direction: openToward })
    )
  ].filter(Boolean);
  const effortRows = [{ id: "", name: t("status.effortDefault") }, ...levels].map((level) => h(
    "button",
    {
      key: level.id || "default",
      type: "button",
      className: "st-seat-option",
      role: "menuitemradio",
      "aria-checked": level.id === effortId ? "true" : "false",
      onClick: () => pickLevel(level.id)
    },
    h("span", { className: "st-seat-option-name" }, level.name ?? level.id),
    level.id === effortId ? h("span", { className: "st-seat-check" }, h("svg", {
      className: "st-icon-sm",
      viewBox: "0 0 16 16",
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, h("path", { d: "M3 8.5 6.2 11.6 13 4.6" }))) : null
  ));
  const back = h("button", {
    key: "back",
    type: "button",
    className: "st-seat-back",
    role: "menuitem",
    onClick: () => setPane("root")
  }, h(Chevron, { direction: "right" }), t("label.back"));
  return h(
    "div",
    { className: "st-seat", ref: rootRef },
    h(
      "button",
      {
        type: "button",
        className: "st-seat-trigger",
        "aria-haspopup": "menu",
        "aria-expanded": open ? "true" : "false",
        onClick: (event) => {
          const next = !open;
          if (next) {
            const rect = event?.currentTarget?.getBoundingClientRect?.();
            const room = typeof window !== "undefined" && typeof window.innerHeight === "number" ? window.innerHeight : 0;
            setOpenToward(rect !== void 0 && rect !== null && room > 0 && rect.top > room - rect.bottom ? "up" : "down");
          }
          setOpen((open_) => !open_);
        }
      },
      h(ModelIcon),
      h("span", { className: "st-seat-label" }, modelName),
      effortName === "" ? null : h("span", { className: "st-seat-effort" }, effortName),
      // Closed: down, which is what "there is a menu here" looks like. Open: the way the card
      // actually went — not a flip, which would point up over a card that opened downward.
      h(Chevron, { direction: openToward === "up" && open ? void 0 : openToward === "up" ? "up" : open ? "down" : void 0 })
    ),
    open ? h(
      "div",
      { className: "st-seat-menu", "data-side": openToward, role: "menu" },
      pane === "root" ? rootRows : h(
        React.Fragment,
        null,
        back,
        h(
          "div",
          { className: "st-seat-groups" },
          pane === "models" ? modelRows : effortRows
        )
      )
    ) : null
  );
}
function ChatComposer({ t, busy, catalog, modelCurrent, efforts, onModelChange, onEffortChange, draft, onDraft, onSend, onClose }) {
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    const node = inputRef.current;
    if (node !== null && node !== void 0 && typeof node.focus === "function") node.focus();
  }, []);
  const send = () => {
    const text = String(draft ?? "").trim();
    if (text === "" || busy === true) return;
    onDraft("");
    onSend(text);
  };
  return h(
    "div",
    { className: "st-chat-composer", "data-composer-card": "true" },
    h("textarea", {
      ref: inputRef,
      className: "st-chat-input",
      value: draft,
      rows: 1,
      // No placeholder: an empty field with a caret in it already means "type", and a sample
      // question under a one-line input was the loudest thing in the quietest control.
      "aria-label": t("label.chatTitle"),
      "data-composer-input": "true",
      onChange: (e) => onDraft(e.target.value),
      onKeyDown: (e) => {
        if (e.isComposing === true || e.nativeEvent?.isComposing === true || e.keyCode === 229) return;
        if (e.key === "Enter" && e.shiftKey !== true) {
          e.preventDefault();
          send();
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }
    }),
    // The control row under the input, the shape the host's composer uses: hint on the left,
    // the model chip and the send button on the right.
    h(
      "div",
      { className: "st-chat-row" },
      h("span", { className: "st-spacer" }),
      h(
        "div",
        { className: "st-chat-trailing" },
        // The model chip opens the host's directory: the same catalogue its own composer uses,
        // with effort levels when the model offers them.
        // The host's own shape: model and effort as two rows that drill into their lists.
        h(ComposerModelSeat, {
          t,
          groups: catalog ?? [],
          value: modelCurrent,
          efforts: efforts ?? [],
          onEffort: onEffortChange,
          onChange: onModelChange
        }),
        // The send control is the round icon button the host uses: a pill labelled "发送" is a
        // form button, and this is a composer.
        h("button", {
          type: "button",
          className: "st-chat-send",
          "aria-label": t("action.send"),
          title: t("action.send"),
          disabled: busy === true || draft.trim() === "",
          onClick: send
        }, h("svg", {
          className: "st-icon-md",
          viewBox: "0 0 16 16",
          "aria-hidden": true,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.8,
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, h("path", { d: "M8 13V3.5M8 3.5 4 7.5M8 3.5l4 4" })))
      )
    )
  );
}
function ContextEdge({ text, side }) {
  if (typeof text !== "string" || text === "") return null;
  return h("span", { className: `st-ctx st-ctx-${side}`, "aria-hidden": true }, text);
}
function SteerBox({ t, copy: copy2, showLabel, autoFocus, onRun }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const input = h("input", {
    className: "st-scan-steer-input",
    value,
    placeholder: t(copy2.placeholder),
    "aria-label": t(copy2.label),
    autoFocus: autoFocus === true,
    onChange: (e) => setValue(e.target.value),
    onKeyDown: (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onRun(value.trim());
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
  });
  return h(
    React.Fragment,
    null,
    h(
      "div",
      { className: "st-scan-steer" },
      h(
        "button",
        {
          type: "button",
          className: "st-scan-steer-toggle",
          "aria-expanded": open ? "true" : "false",
          title: t(copy2.hint),
          onClick: () => setOpen((current) => !current)
        },
        h("svg", {
          className: "st-icon-xs",
          viewBox: "0 0 16 16",
          "aria-hidden": true,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.6,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          // Down when collapsed (the expand convention), rotated to point RIGHT when open — at
          // the input, which appears beside the control.
          style: { transform: open ? "rotate(-90deg)" : "none", transition: "transform .12s" }
        }, h("path", { d: "M3.5 6 8 10.5 12.5 6" })),
        showLabel === true ? t(copy2.label) : null
      )
    ),
    open ? input : null
  );
}
function AiDock({ t, proposal, before, after, onAccept, onReject, onRetry }) {
  if (proposal.kind === "cast") {
    return h(
      React.Fragment,
      null,
      h("div", { className: "st-ai-question" }, proposal.question),
      proposal.reply === "" ? null : h("div", { className: "st-ai-dock-text" }, proposal.reply),
      h(
        "div",
        { className: "st-cast" },
        (proposal.marks ?? []).map((mark, index) => h(
          "div",
          { key: index, className: "st-cast-row" },
          // "add" and "update" are the two things the writer needs to tell apart before
          // pressing: one extends the book, the other rewrites something already in it.
          h(
            "span",
            { className: "st-cast-tag", "data-verb": mark.verb },
            t(mark.verb === "update" ? "cast.update" : "cast.add")
          ),
          h("span", { className: "st-cast-target" }, t(`cast.target.${mark.target}`)),
          h("span", { className: "st-cast-name" }, mark.label),
          mark.detail === "" ? null : h("span", { className: "st-cast-detail" }, mark.detail)
        ))
      ),
      h(
        "div",
        { className: "st-ai-dock-actions" },
        h(
          "button",
          { type: "button", className: "st-dock-act st-dock-act-primary", onClick: onAccept },
          t("action.applyCast"),
          h("span", { className: "st-kbd" }, "\u2318\u23CE")
        ),
        h("button", { type: "button", className: "st-dock-act st-dock-act-quiet", onClick: onReject }, t("action.reject"))
      )
    );
  }
  const isContinuation = proposal.kind === "continue";
  const isChat = proposal.kind === "chat";
  const isInsert = isContinuation || isChat;
  return h(
    React.Fragment,
    null,
    isChat ? h("div", { className: "st-ai-question" }, proposal.question) : null,
    h(
      "div",
      { className: "st-ai-dock-text" },
      // An insertion is shown IN CONTEXT: a little of what precedes and follows it, faintly,
      // so the writer can see where the sentence lands and whether it joins up. Without them
      // the dock showed a detached sentence and the only way to judge it was to accept it and
      // read the result.
      isInsert ? h(ContextEdge, { text: before, side: "before" }) : null,
      isInsert ? h("span", { className: "st-insert" }, proposal.proposedText) : diffWords(proposal.baseText, proposal.proposedText).map((seg, i) => h("span", { key: i, className: seg.type === "add" ? "st-add" : seg.type === "del" ? "st-del" : void 0 }, seg.text)),
      isInsert ? h(ContextEdge, { text: after, side: "after" }) : null
    ),
    h(
      "div",
      { className: "st-ai-dock-actions" },
      h(
        "button",
        { type: "button", className: "st-dock-act st-dock-act-primary", onClick: onAccept },
        isChat ? t("action.insert") : t("action.accept"),
        h("span", { className: "st-kbd" }, isContinuation ? "Enter" : "\u2318\u23CE")
      ),
      // Retry, plus the chevron that gives the retry a direction: the pair reads as one
      // control, and only the chevron opens the input.
      h(
        "div",
        { className: "st-retry-group" },
        h("button", { type: "button", className: "st-dock-act", onClick: () => onRetry("") }, t("action.retry")),
        h(SteerBox, {
          t,
          copy: { placeholder: "rewrite.steerPlaceholder", label: "rewrite.steer", hint: "rewrite.steerHint" },
          // The rewrite's chevron is part of a joined retry pill, so it carries no label of
          // its own; the critique's sits in a row of buttons and needs one.
          showLabel: false,
          autoFocus: true,
          onRun: (direction) => onRetry(direction)
        })
      ),
      // The retry/accept pair is the whole interaction, so reject sits at the far end to keep
      // it away from the one the writer presses by reflex.
      h("button", { type: "button", className: "st-dock-act st-dock-act-quiet", onClick: onReject }, t("action.reject"))
    )
  );
}
function DockHairline({ t, state, onClick, question }) {
  const clickable = typeof onClick === "function";
  const working = state === "working";
  return h(
    "button",
    {
      type: "button",
      className: "st-hairline",
      "data-state": state,
      // Only a line that opens something is a button in fact; the idle glow is decoration.
      disabled: !clickable,
      "aria-label": working ? t("label.thinking") : clickable ? t("label.dockExpand") : void 0,
      title: working ? void 0 : clickable ? t("label.dockExpand") : void 0,
      onClick: clickable ? onClick : void 0
    },
    // The copy row comes FIRST in the DOM: the hint text sits ABOVE the line, the line is
    // the bottom row. The copy span always exists so the layout does not shift when the
    // beats appear; it is simply empty outside the working state.
    h(
      "span",
      { className: "st-hairline-copy" },
      working ? h(AiThinking, { t, question, beats: [t("label.thinking"), t("label.thinking.1"), t("label.thinking.2"), t("label.thinking.3")] }) : null
    ),
    h("span", { className: "st-hairline-glow", "aria-hidden": true })
  );
}
function AiThinking({ t, question, beats: given }) {
  const beats = Array.isArray(given) && given.length > 0 ? given : [t("label.thinking"), t("label.thinking.1"), t("label.thinking.2"), t("label.thinking.3")];
  const asked = question === void 0 || question === "" ? null : question;
  const labels = h(
    "span",
    { className: "st-ai-thinking-labels" },
    beats.map((label, i) => h("span", {
      key: i,
      className: "st-ai-thinking-label",
      // Staggered phase: each label takes its turn in a single looping animation.
      style: beats.length > 1 ? { animationDelay: `${i * 7.2 / beats.length}s` } : void 0
    }, label))
  );
  return h(
    "div",
    { className: "st-ai-thinking", role: "status", "aria-live": "polite" },
    h(
      "div",
      { className: "st-ai-thinking-row" },
      h("span", { className: "st-ai-thinking-mark", "aria-hidden": true }),
      // With a question, the row reads "这里该怎么收？ · 在想下一句" instead of stacking two lines
      // that both describe the same moment. The question is static: it is the subject, not the
      // state, so it does not fade or rotate with the copy beside it.
      asked === null ? labels : h(
        React.Fragment,
        null,
        h("span", { className: "st-ai-thinking-ask", title: asked }, asked),
        h("span", { className: "st-ai-thinking-sep", "aria-hidden": true }, "\xB7"),
        labels
      )
    )
  );
}
function AnswerLog({ t, answers, onInsert }) {
  if (answers.length === 0) return h("div", { className: "st-muted" }, t("label.noAnswers"));
  return h(
    "div",
    { className: "st-answers" },
    answers.map((entry, index) => h(
      "div",
      { key: `${entry.at}-${index}`, className: "st-answer" },
      h(
        "div",
        { className: "st-answer-head" },
        h("span", { className: "st-answer-question" }, entry.question),
        h("span", { className: "st-spacer" }),
        h(
          "span",
          { className: "st-caption" },
          clockTime(entry.at)
        ),
        typeof onInsert === "function" ? h("button", {
          type: "button",
          className: "st-dock-act st-dock-act-primary",
          // Inserted at the caret, exactly as accepting the dock's own suggestion would.
          onClick: () => onInsert(entry)
        }, t("action.insert")) : null,
        h("button", {
          type: "button",
          className: "st-dock-act",
          onClick: () => {
            try {
              navigator.clipboard?.writeText(entry.reply);
            } catch {
            }
          }
        }, t("action.copy"))
      ),
      h("div", { className: "st-answer-body" }, entry.reply)
    ))
  );
}

// src/client/panel/scan.js
function ScanDock({ t, scan, onClose, onAgain, onCritique }) {
  const busy = scan.busy === true;
  const isCritique = scan.kind === "critique";
  const critique = isCritique && scan.critique !== null && scan.critique !== void 0 ? { verdict: "", points: [], ...scan.critique } : null;
  const rows = isCritique ? critique?.points ?? [] : scan.issues ?? [];
  const failed = typeof scan.error === "string" && scan.error !== "";
  const runCritique = (direction) => {
    if (typeof onCritique === "function") onCritique(direction);
  };
  return h(
    "div",
    { className: "st-scan" },
    h(
      "div",
      { className: "st-scan-head" },
      h(
        "span",
        { className: "st-scan-title" },
        isCritique ? t("scan.critiqueTitle") : t("scan.reviewTitle")
      ),
      // The count is the answer to "how bad is it" at a glance, so it sits beside the title
      // and is not repeated anywhere else. The critique's count is its points; the verdict is
      // prose and not counted.
      busy || failed ? null : h(
        "span",
        { className: "st-scan-count" },
        isCritique ? t("scan.pointCount", { n: rows.length }) : t("scan.issueCount", { n: rows.length })
      ),
      h("span", { className: "st-spacer" }),
      h("button", {
        type: "button",
        className: "st-btn st-btn-ghost",
        title: t("action.close"),
        "aria-label": t("action.close"),
        onClick: onClose
      }, "\u2715")
    ),
    busy ? h(AiThinking, {
      t,
      // Different work, different words: a copy-edit is reading for mistakes, a critique is
      // judging the prose, and saying so is the difference between a wait that is explained
      // and one that looks like the wrong button was pressed.
      beats: isCritique ? [t("scan.critiqueThinking"), t("scan.critiqueThinking.1"), t("scan.critiqueThinking.2")] : [t("scan.reviewThinking"), t("scan.reviewThinking.1"), t("scan.reviewThinking.2")]
    }) : null,
    // A truncated answer is neither a failure nor a clean result, and it is the one case where
    // the list below is misleading on its own: the issues that arrived are real, but the model
    // was cut off mid-answer, so more may have been on the way. Saying so is the difference
    // between "this section has three problems" and "I have read three problems so far".
    // Nothing found is a result, not an absence: a clean section said nothing at all used to
    // look like the request had failed silently.
    busy || failed ? null : isCritique ? h(
      React.Fragment,
      null,
      // The verdict first: one short paragraph on the prose as a whole. The points then
      // itemise it, but the writer asked for a judgement and that comes before the list.
      critique?.verdict !== "" && critique !== null ? h("div", { className: "st-critique-verdict" }, critique.verdict) : null,
      rows.length === 0 ? h("div", { className: "st-scan-empty" }, t("scan.noPoints")) : h(
        "div",
        { className: "st-scan-list" },
        rows.map((row, index) => h(
          "div",
          { key: index, className: "st-scan-row", "data-kind": row.kind ?? "wording" },
          h(
            "div",
            { className: "st-scan-row-head" },
            h("span", { className: "st-scan-tag" }, t(`scan.kind.${row.kind ?? "wording"}`)),
            row.where === "" ? null : h("span", { className: "st-scan-where", title: row.where }, row.where)
          ),
          h("div", { className: "st-scan-what" }, row.problem),
          row.advice === "" ? null : h(
            "div",
            { className: "st-scan-fix" },
            h("span", { className: "st-scan-arrow", "aria-hidden": true }, "\u2192"),
            h("span", null, row.advice)
          )
        ))
      )
    ) : rows.length === 0 ? h("div", { className: "st-scan-empty" }, t("scan.noIssues")) : h(
      "div",
      { className: "st-scan-list" },
      rows.map((row, index) => h(
        "div",
        { key: index, className: "st-scan-row", "data-kind": row.kind ?? "wording" },
        h(
          "div",
          { className: "st-scan-row-head" },
          h("span", { className: "st-scan-tag" }, t(`scan.kind.${row.kind ?? "wording"}`)),
          row.where === "" ? null : h("span", { className: "st-scan-where", title: row.where }, row.where)
        ),
        h("div", { className: "st-scan-what" }, row.problem),
        // The correction is the useful half: "逗号粘连" is a diagnosis, "拆成两句" is an
        // edit. Shown under the problem, marked with an arrow so the two are not confused.
        row.suggestion === "" ? null : h(
          "div",
          { className: "st-scan-fix" },
          h("span", { className: "st-scan-arrow", "aria-hidden": true }, "\u2192"),
          h("span", null, row.suggestion)
        )
      ))
    ),
    // Reading the findings and fixing them is one loop: the writer closes the dock, edits, and
    // wants the same pass again. The chord that opens this does that too, but a button makes
    // the loop visible without having to remember it. Below the list, so a long scan never
    // buries it under a scroll. The critique's copy carries a steer: a chevron that opens a
    // one-line box, and the direction rides with the next pass.
    busy || failed ? null : h(
      "div",
      { className: "st-scan-foot" },
      h("button", {
        type: "button",
        className: "st-dock-act st-dock-act-primary",
        onClick: () => {
          if (typeof onAgain === "function") onAgain();
        }
      }, t("scan.again")),
      isCritique ? h(SteerBox, {
        t,
        copy: { placeholder: "scan.steerPlaceholder", label: "scan.steer", hint: "scan.steerHint" },
        // In the critique's foot row the chevron sits beside 重试 as its own button, so it
        // says what it is instead of relying on a tooltip.
        showLabel: true,
        autoFocus: false,
        onRun: runCritique
      }) : null,
      h("button", {
        type: "button",
        className: "st-dock-act st-dock-act-quiet",
        onClick: onClose
      }, t("action.close"))
    )
  );
}

// src/client/panel/outline.js
function TreeNav({ t, book, activeId, onSelect, onToggle, collapsed, onRename, onRemove }) {
  const [editingId, setEditingId] = React.useState(null);
  const [draft, setDraft] = React.useState("");
  const rows = [];
  const walk = (nodes, depth) => {
    for (const node of nodes ?? []) {
      const isContainer = node.children.length > 0;
      const folded = collapsed.has(node.id);
      const chars = (node.text ?? "").length;
      rows.push(h(
        "div",
        {
          key: node.id,
          className: "st-node",
          "data-depth": depth,
          "data-current": node.id === activeId ? "true" : "false",
          "data-level": node.level,
          role: "button",
          tabIndex: 0,
          // A click SELECTS at every level. Folding is the caret's own control, because a
          // container that could only be folded could never be selected — and selection is what
          // decides where the next chapter or section is created.
          onClick: () => onSelect(node.id),
          onKeyDown: (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            onSelect(node.id);
          }
        },
        // Indentation encodes depth; a container also shows a fold caret.
        h("span", { style: { width: depth * 12 } }),
        isContainer ? h("span", {
          className: "st-node-caret",
          role: "button",
          tabIndex: 0,
          title: folded ? t("action.expand") : t("action.collapse"),
          "aria-expanded": folded ? "false" : "true",
          onClick: (e) => {
            e.stopPropagation();
            onToggle(node.id);
          },
          onKeyDown: (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            e.stopPropagation();
            onToggle(node.id);
          }
        }, folded ? "\u25B8" : "\u25BE") : h("span", { className: "st-node-dot" }),
        editingId === node.id ? h("input", {
          className: "st-input st-node-input",
          autoFocus: true,
          value: draft,
          onChange: (e) => setDraft(e.target.value),
          onClick: (e) => e.stopPropagation(),
          onBlur: () => {
            onRename(node.id, draft.trim());
            setEditingId(null);
          },
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onRename(node.id, draft.trim());
              setEditingId(null);
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setEditingId(null);
            }
          }
        }) : h("span", {
          className: "st-node-name",
          title: node.title,
          onDoubleClick: (e) => {
            e.stopPropagation();
            setDraft(node.title || "");
            setEditingId(node.id);
          }
        }, node.title || t(`level.${node.level}`)),
        // Rename and delete sit together and appear on the same hover. The rename was only
        // reachable by double-clicking the name, which nothing announced — while delete had a
        // visible button. A destructive action should not be the discoverable one.
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost st-node-rename",
          title: t("action.renameNode"),
          "aria-label": t("action.renameNode"),
          onClick: (e) => {
            e.stopPropagation();
            setDraft(node.title || "");
            setEditingId(node.id);
          }
        }, "\u270E"),
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost st-node-remove",
          title: t("action.removeNode"),
          onClick: (e) => {
            e.stopPropagation();
            onRemove(node.id);
          }
        }, "\xD7"),
        isContainer ? h("span", { className: "st-muted", style: { flex: "none" } }, String(node.children.length)) : h("span", { className: "st-muted", style: { flex: "none" } }, chars === 0 ? t("label.emptyNode") : t("label.charCount", { n: chars }))
      ));
      if (isContainer && !folded) walk(node.children, depth + 1);
    }
  };
  walk(book?.nodes ?? [], 0);
  if (rows.length === 0) return h("div", { className: "st-muted" }, t("label.emptyChapters"));
  return h("div", { className: "st-tree" }, rows);
}
function ChapterEditor(props) {
  const {
    t,
    chapter,
    onText,
    onAskSelection,
    onContinue,
    suggestion,
    onAccept,
    onReject,
    onRetry,
    busy,
    aiNote,
    typography,
    onFlush,
    onSaveNow,
    chat,
    chatModels,
    chatCatalog,
    chatEfforts,
    onChatOpen,
    onChatClose,
    onChatSend,
    onChatModelChange,
    onChatEffortChange,
    answerCount,
    onAnswersToggle,
    onAnswersOpen,
    scan,
    onReview,
    onCritique,
    onScanClose
  } = props;
  const textareaRef = React.useRef(null);
  const paintRef = React.useRef(null);
  const [chatDraft, setChatDraft] = React.useState("");
  const [selection, setSelection] = React.useState({ start: 0, end: 0, text: "" });
  const historyRef = React.useRef(null);
  if (historyRef.current === null) historyRef.current = createHistory(chapter.text ?? "");
  const [finding, setFinding] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hitIndex, setHitIndex] = React.useState(0);
  const [scrollbarWidth, setScrollbarWidth] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => {
    setSelection({ start: 0, end: 0, text: "" });
    setFinding(false);
    setQuery("");
    setHitIndex(0);
    historyRef.current.reset(chapter.text ?? "");
  }, [chapter.id]);
  React.useEffect(() => {
    const node = textareaRef.current;
    if (node === null || node === void 0) return;
    const measure = () => setScrollbarWidth(Math.max(0, node.offsetWidth - node.clientWidth));
    measure();
  }, [chapter.id, typography?.fontSize, typography?.lineHeight, typography?.width, finding]);
  const readSelection = () => {
    const node = textareaRef.current;
    if (node === null) return { start: 0, end: 0, text: "" };
    const start = node.selectionStart ?? 0;
    const end = node.selectionEnd ?? 0;
    return { start, end, text: node.value.slice(start, end) };
  };
  const syncScroll = (event) => {
    const node = event?.currentTarget ?? textareaRef.current;
    const paint = paintRef.current;
    if (node === null || paint === null || paint === void 0) return;
    paint.scrollTop = node.scrollTop;
    paint.scrollLeft = node.scrollLeft;
  };
  const focusHit = (hit) => {
    const node = textareaRef.current;
    if (node === null || hit === void 0) return;
    node.focus();
    node.setSelectionRange(hit.start, hit.end);
    setSelection({ start: hit.start, end: hit.end, text: node.value.slice(hit.start, hit.end) });
  };
  const splice = (start, end, replacement, kind = "replace") => {
    const current = chapter.text ?? "";
    const next = current.slice(0, start) + replacement + current.slice(end);
    historyRef.current.record(next, { start: start + replacement.length, end: start + replacement.length }, kind);
    onText(next);
    return next;
  };
  const editorContext = (windows = {}) => {
    const live = liveSelectionRange();
    const source = chapter.text ?? "";
    const start = Number.isInteger(live.start) ? Math.max(0, Math.min(source.length, live.start)) : source.length;
    const end = Number.isInteger(live.end) ? Math.max(start, Math.min(source.length, live.end)) : start;
    const leadChars = Number.isFinite(windows.lead) ? windows.lead : 600;
    const trailChars = Number.isFinite(windows.trail) ? windows.trail : 300;
    return {
      // The selection, both as offsets and as text: the rewrite replaces by range, the chat
      // describes it, and the continuation ignores it.
      start,
      end,
      selection: source.slice(start, end),
      // Around the caret, for anything that has to read on from here.
      before: leadChars <= 0 ? "" : source.slice(Math.max(0, start - leadChars), start),
      after: trailChars <= 0 ? "" : source.slice(end, end + trailChars),
      // The whole chapter, for callers that need to search or split it.
      text: source
    };
  };
  const liveSelectionRange = () => {
    const node = textareaRef.current;
    if (node !== null && node !== void 0 && Number.isInteger(node.selectionStart) && Number.isInteger(node.selectionEnd)) {
      const start = node.selectionStart;
      const end = node.selectionEnd;
      return { start, end, text: node.value.slice(start, end) };
    }
    return { start: selection.start, end: selection.end, text: selection.text ?? "" };
  };
  const caretForInsert = () => {
    const node = textareaRef.current;
    if (node !== null && node !== void 0 && Number.isInteger(node.selectionStart)) return node.selectionStart;
    return (chapter.text ?? "").length;
  };
  const proposalRange = () => {
    const own = openProposal !== null && openProposal !== void 0;
    if (own && Number.isInteger(openProposal.from) && Number.isInteger(openProposal.to)) {
      return { start: openProposal.from, end: openProposal.to };
    }
    const node = textareaRef.current;
    if (node !== null && node !== void 0 && Number.isInteger(node.selectionStart) && Number.isInteger(node.selectionEnd) && node.selectionEnd !== node.selectionStart) {
      return { start: node.selectionStart, end: node.selectionEnd };
    }
    return { start: selection.start, end: selection.end };
  };
  const acceptProposal = (proposal) => {
    if (proposal === null || proposal === void 0) return;
    if (proposal.kind === "cast") {
      onAccept(proposal.id);
      return;
    }
    const current = chapter.text ?? "";
    if (proposal.kind === "continue" || proposal.kind === "chat") {
      const at = Number.isInteger(proposal.at) ? proposal.at : caretForInsert();
      splice(at, at, proposal.proposedText);
    } else {
      const range = proposalRange();
      splice(range.start, range.end, proposal.proposedText);
    }
    onAccept(proposal.id);
    const node = textareaRef.current;
    if (node !== null && node !== void 0) {
      const at = proposal.kind === "continue" || proposal.kind === "chat" ? (Number.isInteger(proposal.at) ? proposal.at : current.length) + proposal.proposedText.length : void 0;
      if (at !== void 0) {
        node.focus();
        node.setSelectionRange(at, at);
      }
    }
  };
  const applyHistory = (entry) => {
    if (entry === void 0) return false;
    onText(entry.text);
    const node = textareaRef.current;
    if (node !== null && node !== void 0) {
      node.value = entry.text;
      node.setSelectionRange(entry.start, entry.end);
    }
    setSelection({ start: entry.start, end: entry.end, text: entry.text.slice(entry.start, entry.end) });
    return true;
  };
  const undo = () => applyHistory(historyRef.current.undo());
  const redo = () => applyHistory(historyRef.current.redo());
  const platform = props.platform ?? currentPlatform();
  const keys = props.keys ?? resolveGestures(platform, props.chordOverrides);
  const mac = platform === "macos";
  const critiqueCaret = React.useRef(null);
  React.useEffect(() => {
    if (typeof document === "undefined" || typeof document.addEventListener !== "function") return void 0;
    const ours = (event) => {
      const target = event?.target;
      if (target === null || target === void 0) return true;
      if (typeof target.closest === "function" && target.closest(".st-shell") !== null) return true;
      const tag = String(target.tagName ?? "").toUpperCase();
      return tag === "BODY" || tag === "HTML";
    };
    const openChat = () => {
      if (typeof onChatOpen !== "function") return;
      setSelection(readSelection());
      onChatOpen();
    };
    const chatTrigger = loneModifierKey(keys.chat, mac);
    const press = createLoneModifierWatcher(openChat, mac, chatTrigger === "" ? "\xB7" : chatTrigger);
    const onKeyDown = (event) => {
      if (!ours(event)) return;
      if (isModifierOnly(keys.chat) !== true && chordMatches(event, keys.chat, mac)) {
        event.preventDefault();
        openChat();
        return;
      }
      if (isModifierChord(event, keys.review, mac) && press.typedSince() !== true) {
        event.preventDefault();
        press.markUsed();
        if (typeof onReview === "function") onReview();
        return;
      }
      if (chordMatches(event, keys.critique, mac)) {
        event.preventDefault();
        if (typeof onCritique !== "function") return;
        const caret = editorContext({ lead: 1200, trail: 400 });
        critiqueCaret.current = caret;
        onCritique(caret, "");
        return;
      }
      press.keydown(event);
    };
    const onKeyUp = (event) => {
      if (ours(event)) press.keyup(event);
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
    };
  }, []);
  const trigger = async () => {
    const current = readSelection();
    setSelection(current);
    if (current.text.trim() !== "") {
      const context = editorContext({ lead: 400, trail: 200 });
      await onAskSelection(current.text, chapter.text ?? "", { start: context.start, end: context.end }, context);
      return;
    }
    const at = current.start;
    await onContinue(chapter.text ?? "", at, editorContext({ lead: 400, trail: 200 }));
  };
  const text = chapter.text ?? "";
  const openProposal = suggestion ?? null;
  const hits = finding ? findMatches(text, query) : [];
  const activeHit = hits.length === 0 ? -1 : Math.min(hitIndex, hits.length - 1);
  const runs = paintRuns(text, {
    hits,
    activeIndex: activeHit,
    // Only while the editor is NOT focused: when it is, the browser draws the real selection
    // on top and two washes would stack into a muddy block.
    selection: focused ? void 0 : { start: selection.start, end: selection.end }
  });
  const step = (delta) => {
    if (hits.length === 0) return;
    const next = (activeHit + delta + hits.length) % hits.length;
    setHitIndex(next);
    focusHit(hits[next]);
  };
  const closeFind = () => {
    setFinding(false);
    setQuery("");
    setHitIndex(0);
    const node = textareaRef.current;
    if (node !== null && node !== void 0) node.focus();
  };
  const style = typography === null || typography === void 0 ? void 0 : {
    "--st-font-size": `${typography.fontSize}px`,
    "--st-line-height": String(typography.lineHeight),
    "--st-width": `${typography.width}px`,
    // Fixed, deliberately: the dock's chrome is not part of the manuscript, so a change to how
    // the BOOK reads must not resize the input box.
    "--st-font-ui": `${UI_FONT_SIZE}px`,
    "--st-leading-ui": `${UI_LINE_HEIGHT}px`
  };
  const insertionContext = (() => {
    if (openProposal === null) return { before: "", after: "" };
    const isInsert = openProposal.kind === "continue" || openProposal.kind === "chat";
    if (!isInsert) return { before: "", after: "" };
    const at = Number.isInteger(openProposal.at) ? openProposal.at : caretForInsert();
    const source = chapter.text ?? "";
    const clamp = Math.max(0, Math.min(source.length, at));
    const limit = 4;
    const trim = (raw, keepTail) => raw.length <= limit ? raw : (keepTail ? raw.slice(-limit) : raw.slice(0, limit)).replace(/^\s+|\s+$/g, "");
    return {
      before: trim(source.slice(0, clamp), true),
      after: trim(source.slice(clamp), false)
    };
  })();
  const chatCurrent = (() => {
    const role = chatModels === null || chatModels === void 0 ? void 0 : chatModels.chat;
    return role !== null && typeof role === "object" && typeof role.model === "string" && role.model !== "" ? role : void 0;
  })();
  const composerOpen = chat !== void 0 && chat !== null && chat.open === true;
  const [dockOpen, setDockOpen] = React.useState(false);
  const chatWaiting = chat !== void 0 && chat !== null && chat.busy === true;
  const working = busy === true || chatWaiting;
  const proseBudget = React.useMemo(
    () => proseLineBudget(typography),
    [typography?.fontSize, typography?.width]
  );
  const dockProse = (() => {
    if (openProposal === null || openProposal === void 0) return "short";
    const kind = openProposal.kind;
    if (kind !== "rewrite" && kind !== "continue") return "short";
    const text2 = typeof openProposal.proposedText === "string" ? openProposal.proposedText : "";
    const visible = text2.replace(/\s/g, "").length;
    return visible <= proseBudget ? "short" : "long";
  })();
  const scanOpen = scan !== void 0 && scan !== null && scan.kind !== null;
  const dockMode = working && (openProposal === null || chatWaiting) ? "working" : scanOpen ? "scan" : composerOpen ? "composer" : openProposal !== null ? "proposal" : null;
  React.useEffect(() => {
    if (dockMode === "scan" || dockMode === "proposal" || dockMode === "composer") setDockOpen(true);
  }, [dockMode, scan?.kind, openProposal?.id]);
  const hasContent = dockMode !== null;
  const expanded = dockMode !== "working" && hasContent && dockOpen;
  const showBox = expanded || dockMode === "composer";
  return h(
    "div",
    { className: "st-desk", style, "data-docked": showBox ? "true" : "false" },
    h(
      "div",
      { className: "st-desk-head" },
      h("h2", { className: "st-desk-title" }, chapter.title || t(`level.${chapter.level}`)),
      // Nothing else on this line. The chapter's word count and the save state both already have
      // a home in the status bar, and repeating them under the title made the header a read-out —
      // two places reporting the same number, which is two places that can disagree.
      h("span", { className: "st-spacer" }),
      // The find bar is IN the header, not above the page: a row of its own pushed the manuscript
      // down every time it opened, and the writer lost their place in the text for a search.
      finding ? h(
        "div",
        { className: "st-find" },
        h("input", {
          className: "st-find-input",
          value: query,
          autoFocus: true,
          placeholder: t("label.findPlaceholder"),
          // The bar owns Enter/Escape while it is open, so a query never reaches the editor's
          // AI shortcuts.
          onChange: (e) => {
            setQuery(e.target.value);
            setHitIndex(0);
          },
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              step(e.shiftKey ? -1 : 1);
              return;
            }
            if (e.key === "Escape") {
              e.preventDefault();
              closeFind();
            }
            if ((e.metaKey === true || e.ctrlKey === true) && (e.key === "f" || e.key === "F")) {
              e.preventDefault();
              closeFind();
            }
          }
        }),
        h("span", { className: "st-find-count" }, query === "" ? "" : hits.length === 0 ? t("label.noMatches") : t("label.matchCount", { i: activeHit + 1, n: hits.length })),
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost",
          disabled: hits.length === 0,
          title: t("label.findPrev"),
          "aria-label": t("label.findPrev"),
          onClick: () => step(-1)
        }, "\u2191"),
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost",
          disabled: hits.length === 0,
          title: t("label.findNext"),
          "aria-label": t("label.findNext"),
          onClick: () => step(1)
        }, "\u2193"),
        h("button", { type: "button", className: "st-btn st-btn-ghost", title: t("action.close"), onClick: closeFind }, "\u2715")
      ) : h(
        React.Fragment,
        null,
        // The find entry is an icon, not a word: the row it sits in is a row of controls, and the
        // magnifier reads at the same size the keycaps beside it do. Its title carries the one
        // thing the glyph cannot show — the chord.
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost",
          title: t("label.findHint"),
          "aria-label": t("action.find"),
          "aria-pressed": "false",
          onClick: () => {
            setFinding(true);
            setHitIndex(0);
          }
        }, h("svg", {
          className: "st-icon-xs",
          viewBox: "0 0 16 16",
          "aria-hidden": true,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.8,
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, h("circle", { cx: "7", cy: "7", r: "4.5" }), h("path", { d: "M10.5 10.5 14 14" }))),
        // The three AI controls together, because they are the same kind of thing: what the
        // panel can do to this chapter. Putting the question box in the window title instead
        // separated it from the button it belongs beside.
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost st-ai-trigger",
          disabled: busy === true,
          title: t("label.aiTriggerHint", { keys: keys.askHint }),
          onClick: trigger
        }, busy === true ? "\u2026" : t("action.aiTrigger"), h("span", { className: "st-kbd" }, keys.askLabel)),
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost st-ai-trigger",
          "aria-pressed": chat !== void 0 && chat !== null && chat.open === true ? "true" : "false",
          title: t("label.chatButtonHint", { critique: keys.critiqueHint, review: keys.reviewHint }),
          onClick: () => {
            if (typeof onChatOpen === "function") onChatOpen();
          }
          // The composer's own gesture, not a chord: it opens on a LONE modifier press, so the
          // keycap shows that modifier and nothing else. It used to show the review chord, which
          // was left over from when the two were the same key.
        }, t("action.ask"), h("span", { className: "st-kbd" }, keys.chatLabel)),
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost st-ai-trigger",
          "aria-pressed": typeof onAnswersOpen === "function" && onAnswersOpen() === true ? "true" : "false",
          onClick: () => {
            if (typeof onAnswersToggle === "function") onAnswersToggle();
          }
        }, t("action.answers"), typeof answerCount === "number" && answerCount > 0 ? h("span", { className: "st-count" }, String(answerCount)) : null)
      )
    ),
    h(
      "div",
      { className: "st-editor-wrap" },
      h(
        "div",
        { className: "st-editor-stack" },
        // The painted layer. `aria-hidden` keeps screen readers on the real textarea, and
        // whitespace is preserved so the continuation lands right after the last character.
        // The right padding is the scrollbar the textarea reserves, so both wrap identically.
        h(
          "div",
          {
            className: "st-editor-paint",
            "aria-hidden": true,
            ref: paintRef,
            style: scrollbarWidth === 0 ? void 0 : { paddingRight: `${scrollbarWidth}px` }
          },
          ...runs.map((run, i) => {
            if (!run.hit && !run.selected) return run.text;
            const className = [run.hit ? "st-hit" : "", run.selected ? "st-selected" : ""].filter(Boolean).join(" ");
            return h("span", {
              key: i,
              className,
              ...run.hit ? { "data-active": run.active ? "true" : "false" } : {}
            }, run.text);
          })
        ),
        h("textarea", {
          className: "st-editor st-editor-full st-editor-over",
          ref: textareaRef,
          value: text,
          onChange: (e) => {
            const caret = e.target.selectionStart ?? e.target.value.length;
            historyRef.current.record(e.target.value, { start: caret, end: caret });
            onText(e.target.value);
          },
          onFocus: () => setFocused(true),
          onBlur: () => {
            setFocused(false);
            setSelection(readSelection());
            if (typeof onFlush === "function") onFlush();
          },
          onScroll: syncScroll,
          onSelect: () => setSelection(readSelection()),
          onMouseUp: () => setSelection(readSelection()),
          onKeyUp: (e) => {
            if (e.shiftKey) setSelection(readSelection());
          },
          onKeyDown: (e) => {
            if (e.isComposing === true || e.nativeEvent?.isComposing === true || e.keyCode === 229) return;
            const mod = e.metaKey === true || e.ctrlKey === true;
            if (mod && (e.key === "s" || e.key === "S")) {
              e.preventDefault();
              if (typeof onSaveNow === "function") onSaveNow();
              return;
            }
            if (mod && (e.key === "f" || e.key === "F")) {
              e.preventDefault();
              if (finding) closeFind();
              else {
                setFinding(true);
                setHitIndex(0);
              }
              return;
            }
            if (mod && (e.key === "z" || e.key === "Z")) {
              e.preventDefault();
              if (e.shiftKey === true) redo();
              else undo();
              return;
            }
            if (mod && (e.key === "y" || e.key === "Y")) {
              e.preventDefault();
              redo();
              return;
            }
            if (mod && e.key === "Enter" && openProposal !== null) {
              e.preventDefault();
              acceptProposal(openProposal);
              return;
            }
            if (e.key === "Enter" && openProposal !== null && openProposal.kind === "continue" && !e.shiftKey) {
              e.preventDefault();
              acceptProposal(openProposal);
              return;
            }
            if (chordMatches(e, keys.critique, mac)) {
              e.preventDefault();
              if (e.repeat === true) return;
              if (typeof onCritique === "function") {
                const caret = editorContext({ lead: 1200, trail: 400 });
                critiqueCaret.current = caret;
                onCritique(caret, "");
              }
              return;
            }
            if (isModifierChord(e, keys.review, mac)) {
              e.preventDefault();
              if (e.repeat === true) return;
              if (typeof onReview === "function") onReview();
              return;
            }
            if (chordMatches(e, keys.ask, mac)) {
              if (e.repeat === true) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              trigger();
              return;
            }
            if (e.key === "Escape" && scanOpen) {
              e.preventDefault();
              setDockOpen(false);
              return;
            }
            if (e.key === "Escape" && openProposal !== null) {
              e.preventDefault();
              setDockOpen(false);
            }
          }
        })
      )
    ),
    // The dock under the page: the working state, the suggestion, or the question box.
    //
    // The composer yields to the other two. Opening it and then asking for a rewrite or a
    // continuation used to leave the box on screen where it covered the thinking row and the
    // answer — the writer could not see what they had just asked for. It is hidden while
    // something else owns the dock, and comes back on its own once that is done, because
    // `chat.open` is kept: the hide is a display decision, not a dismissal.
    //
    // The dock is persistent, and ONE container holds both faces: the box when it is open,
    // the hairline pressed against the box's bottom edge when it is not. The line never
    // floats away from where the box would pop out of — it IS the box's closed edge. The
    // idle line (nothing kept) and the kept line look the same and both open the shell.
    h(
      "div",
      { className: "st-dock-slot" },
      showBox ? h(
        "div",
        {
          className: `st-ai-dock${dockMode === "working" ? " st-ai-dock-busy" : ""}`,
          // What kind of thing is in here. A rewrite or a continuation is a piece of the
          // manuscript and is set in the manuscript's own type; a chat reply is a remark about
          // the writing and is set compactly, like conversation.
          "data-kind": dockMode === "proposal" && openProposal !== null ? openProposal.kind : dockMode,
          // Whether the passage is short enough to be set in the book's type. Four or five lines
          // read as part of the page; a longer one turned into a wall inside a card, so it drops
          // to interface type. The suffix is the SHELL's size, which makes it the natural key
          // for the stylesheet below; the budget itself is recomputed only when the page
          // settings change, and derived from them rather than from a literal.
          "data-prose": dockProse
        },
        // The writer's own words travel with the wait: a composer question, or the direction a
        // retry or steered critique was given. Both read as the SUBJECT of the working line.
        dockMode === "working" ? h(AiThinking, { t, question: chatWaiting ? chat.question : aiNote }) : null,
        dockMode === "scan" ? h(ScanDock, {
          t,
          scan,
          onClose: () => {
            if (typeof onScanClose === "function") onScanClose();
          },
          // The same two entry points the chords use, so "again" cannot drift from what the
          // gesture does. The critique's steer box runs its own pass with a direction.
          onAgain: () => {
            if (scan.kind === "critique") {
              if (typeof onCritique === "function") onCritique("");
            } else if (typeof onReview === "function") onReview();
          },
          onCritique: (direction) => {
            if (typeof onCritique === "function") onCritique(critiqueCaret.current, direction);
          }
        }) : null,
        dockMode === "proposal" ? h(AiDock, {
          t,
          proposal: openProposal,
          before: insertionContext.before,
          after: insertionContext.after,
          onAccept: () => acceptProposal(openProposal),
          onReject: () => {
            onReject(openProposal.id);
          },
          onRetry
        }) : null,
        dockMode === "composer" ? h(ChatComposer, {
          t,
          busy: chat.busy === true,
          // Owned here so the box can lose the dock and come back with what was typed in it.
          draft: chatDraft,
          onDraft: setChatDraft,
          catalog: chatCatalog,
          modelCurrent: chatCurrent,
          efforts: chatEfforts,
          onModelChange: (selection2) => {
            if (typeof onChatModelChange === "function") onChatModelChange(selection2);
          },
          onEffortChange: (id) => {
            if (typeof onChatEffortChange === "function") onChatEffortChange(id);
          },
          // The live selection travels with the question: with a passage highlighted the
          // question is an instruction about it, without one it is a question about the work.
          onSend: (text2) => {
            if (typeof onChatSend !== "function") return;
            const context = editorContext();
            onChatSend(text2, context.selection, context);
          },
          onClose: () => {
            if (typeof onChatClose === "function") onChatClose();
          }
        }) : null
      ) : null,
      // The line: pressed against the box's bottom edge when the box is closed, always
      // clickable. Working state carries the rotating copy ON A ROW ABOVE the line — the
      // hint text sits over the line, never beside it. When the box IS open the line hides:
      // the box's own bottom edge takes over, and a glowing line under an open result read
      // as a second, conflicting affordance.
      showBox ? null : h(DockHairline, {
        t,
        state: dockMode === "working" ? "working" : hasContent ? "kept" : "idle",
        question: dockMode === "working" ? chatWaiting ? chat.question : aiNote : "",
        // Only a KEPT line opens something — the stored result. Idle has nothing to open
        // (the box must not pop empty), so it is not clickable.
        onClick: hasContent ? () => setDockOpen(true) : null
      })
    )
  );
}

// src/client/shared/model-display.js
function presetLabel(t, selection) {
  if (selection !== null && selection !== void 0 && selection.provider === "agnes" && typeof selection.model === "string") {
    return `preset-${selection.model.replace(/^agnes-/, "")}`;
  }
  return modelLabel(t, selection);
}
function modelLabel(t, selection) {
  if (selection !== null && selection !== void 0 && selection.provider === "agnes") return t("model.builtin");
  if (selection !== null && selection !== void 0 && typeof selection.model === "string" && selection.model !== "") return selection.model;
  return t("status.modelUnknown");
}

// src/client/panel/status.js
function StatusBar({ t, book, chapter, saveStatus, model, notice, covered = false }) {
  const chapters = book?.chapters ?? [];
  const index = chapter === void 0 || chapter === null ? -1 : chapters.findIndex((row) => row.id === chapter.id);
  const chars = chapter === void 0 || chapter === null ? 0 : (chapter.text ?? "").length;
  const [flash, setFlash] = React.useState(false);
  const [modelOpen, setModelOpen] = React.useState(false);
  React.useEffect(() => {
    if (covered) setModelOpen(false);
  }, [covered]);
  React.useEffect(() => {
    if (!modelOpen) return void 0;
    if (typeof document === "undefined" || typeof document.addEventListener !== "function") return void 0;
    const onDown = (event) => {
      const target = event?.target;
      if (target === null || target === void 0) return;
      const mine = typeof target.closest === "function" ? target.closest(".st-status-model-slot") !== null : false;
      if (mine) return;
      setModelOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setModelOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [modelOpen]);
  const lastAt = saveStatus?.savedAt ?? 0;
  React.useEffect(() => {
    if (lastAt === 0) return void 0;
    setFlash(true);
    const timers = globalThis;
    const id = timers.setTimeout(() => setFlash(false), 1400);
    return () => timers.clearTimeout(id);
  }, [lastAt]);
  const lastSaved = (() => {
    const at = saveStatus?.savedAt ?? 0;
    if (saveStatus?.status === "error") return { text: t("status.saveFailed"), tone: "error" };
    if (at > 0) {
      return {
        text: t("status.saved", { time: clockTime(at) }),
        tone: saveStatus?.status === "saving" || saveStatus?.status === "pending" ? "busy" : "ok"
      };
    }
    return { text: t("status.unsaved"), tone: "idle" };
  })();
  const roles = model === null || model === void 0 ? null : model;
  const rows = roles === null ? [] : ["continue", "suggest", "mosaic", "chat"].map((role) => ({ role, ...roles[role] ?? {} })).filter((row) => typeof row.model === "string" && row.model !== "");
  const distinct = [...new Set(rows.map((row) => modelLabel(t, row)))];
  const modelText = rows.length === 0 ? t("status.modelUnknown") : distinct.length === 1 ? distinct[0] : `${distinct[0]} \u2026`;
  const title = chapter === void 0 || chapter === null ? "" : (chapter.title || "").trim() === "" ? t(`level.${chapter.level}`) : chapter.title.trim();
  const banner = notice === null || notice === void 0 || String(notice.text ?? "") === "" ? null : notice;
  const modelButton = h(
    "button",
    {
      type: "button",
      className: "st-status-item st-status-model",
      "data-open": modelOpen ? "true" : "false",
      "aria-expanded": modelOpen ? "true" : "false",
      "aria-haspopup": "dialog",
      title: rows.length === 0 ? t("status.modelUnknownHint") : void 0,
      onClick: () => setModelOpen((current) => !current)
    },
    h("span", { className: "st-status-key" }, t("status.modelLabel")),
    modelText
  );
  const modelSlot = h(
    "span",
    { className: "st-status-model-slot" },
    modelButton,
    modelOpen ? h(
      "div",
      {
        className: "st-status-pop",
        role: "dialog",
        "aria-label": t("status.modelDetail")
      },
      rows.length === 0 ? h("div", { className: "st-status-pop-empty" }, t("status.modelUnknown")) : rows.map((row) => h(
        "div",
        { key: row.role, className: "st-status-pop-row" },
        h("span", { className: "st-status-pop-role" }, t(`role.${row.role}`)),
        h("span", { className: "st-status-pop-model" }, presetLabel(t, row))
      ))
    ) : null
  );
  return h(
    "div",
    { className: "st-statusbar", role: "status" },
    // Announced politely: a save failure or a truncated answer is worth interrupting for only
    // in the sense that it must be readable, not that it must steal focus.
    banner === null ? null : h("span", {
      className: "st-status-notice",
      "data-tone": banner.tone ?? "info",
      role: "status",
      "aria-live": "polite",
      title: String(banner.text)
    }, String(banner.text)),
    // One cell, so the grid can centre the whole read-out between the notice and the balancing
    // empty column. As loose siblings they were the grid's own items and the centre was lost.
    h(
      "div",
      { className: "st-status-run" },
      h("span", { className: "st-status-item" }, chapter === void 0 || chapter === null ? t("status.noChapter") : h(
        React.Fragment,
        null,
        h("span", { className: "st-status-name", title }, title),
        h(
          "span",
          { className: "st-status-count" },
          t("status.position", { i: index < 0 ? 1 : index + 1, n: chapters.length })
        )
      )),
      h("span", { className: "st-status-sep", "aria-hidden": true }, "\xB7"),
      h("span", { className: "st-status-item" }, t("status.words", { n: chars })),
      h("span", { className: "st-status-spacer" }),
      // Plain text, not a button: this is the answer to "when was it saved", and a control here
      // competed with the shortcut it was duplicating.
      h("span", {
        className: `st-status-item${flash ? " st-status-flash" : ""}`,
        "data-tone": lastSaved.tone,
        // The title says which key refreshes this line; the line itself stays inert.
        title: t("label.saveNowHint")
      }, lastSaved.text),
      h("span", { className: "st-status-sep", "aria-hidden": true }, "\xB7"),
      // A button now, because there is something to open: the roles behind the one name. The
      // card is the only place a per-role answer fits — the tooltip it replaces needed a pointer
      // to hover with, which the desktop build does not reliably offer.
      modelSlot
    )
  );
}

// src/client/panel/models.js
function ProviderSection({ t, api: api2, providers, onChanged }) {
  const [editing, setEditing] = React.useState(null);
  const [draft, setDraft] = React.useState({ id: "", name: "", baseURL: "", apiKey: "", models: [], kind: "chat" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [modelsBusy, setModelsBusy] = React.useState(false);
  const [modelsError, setModelsError] = React.useState("");
  const [testing, setTesting] = React.useState(false);
  const [testText, setTestText] = React.useState("");
  React.useEffect(() => {
    if (editing === null) return void 0;
    const baseURL = draft.baseURL.trim();
    if (!/^https?:\/\//i.test(baseURL) || typeof api2?.providerModels !== "function") {
      setModelsBusy(false);
      return void 0;
    }
    let cancelled = false;
    const timer = globalThis.setTimeout(() => {
      setModelsBusy(true);
      setModelsError("");
      api2.providerModels({ id: draft.id, baseURL, apiKey: draft.apiKey }).then(
        (data) => {
          if (cancelled) return;
          setDraft((prev) => prev.baseURL.trim() === baseURL ? { ...prev, models: data?.models ?? [] } : prev);
          setModelsBusy(false);
        },
        (failure) => {
          if (cancelled) return;
          setModelsBusy(false);
          setModelsError(String(failure?.message ?? failure));
        }
      );
    }, 500);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timer);
    };
  }, [editing, draft.baseURL, draft.apiKey]);
  if (typeof api2?.providers !== "function" && typeof api2?.saveProvider !== "function") return null;
  const open = (provider) => {
    setError("");
    setModelsError("");
    setTestText("");
    setDraft(provider === void 0 ? { id: "", name: "", baseURL: "", apiKey: "", models: [], kind: "chat" } : { id: provider.id, name: provider.name, baseURL: provider.baseURL, apiKey: "", models: provider.models, kind: provider.kind ?? "chat" });
    setEditing(provider ?? {});
  };
  const test = () => {
    if (testing || typeof api2?.providerTest !== "function") return;
    if (draft.baseURL.trim() === "") {
      setTestText(t("model.testNeedURL"));
      return;
    }
    setTesting(true);
    setTestText("");
    api2.providerTest({ id: draft.id, baseURL: draft.baseURL, apiKey: draft.apiKey }).then(
      (data) => {
        setTesting(false);
        setTestText(t("model.testOk", { n: data?.count ?? 0 }));
      },
      (failure) => {
        setTesting(false);
        setTestText(String(failure?.message ?? failure));
      }
    );
  };
  const save = () => {
    if (busy || modelsBusy) return;
    if (draft.name.trim() === "" || draft.baseURL.trim() === "" || draft.models.length === 0) {
      setError(t("model.customNeedFields"));
      return;
    }
    setBusy(true);
    api2.saveProvider({ ...draft, models: draft.models }).then(
      () => {
        setBusy(false);
        setEditing(null);
        if (typeof onChanged === "function") onChanged();
      },
      (failure) => {
        setBusy(false);
        setError(String(failure?.message ?? failure));
      }
    );
  };
  const remove = (provider) => {
    if (typeof api2.deleteProvider !== "function") return;
    api2.deleteProvider(provider.id).then(
      () => {
        if (typeof onChanged === "function") onChanged();
      },
      (failure) => setError(String(failure?.message ?? failure))
    );
  };
  return h(
    "div",
    { className: "st-custom-models" },
    h(
      "div",
      { className: "st-custom-models-head" },
      h("span", { className: "st-model-role" }, t("model.custom")),
      h(
        "button",
        { type: "button", className: "st-btn st-custom-add", onClick: () => open(void 0) },
        t("model.customAdd")
      )
    ),
    providers.length === 0 ? h("div", { className: "st-model-follow-tag" }, t("model.customEmpty")) : providers.map((provider) => h(
      "div",
      { key: provider.id, className: "st-custom-provider" },
      h(
        "div",
        { className: "st-custom-provider-main" },
        h("div", { className: "st-custom-provider-name" }, provider.name),
        h("span", { className: "st-custom-provider-kind" }, provider.kind === "image" ? t("model.kindImage") : t("model.kindChat")),
        h("div", { className: "st-custom-provider-meta" }, provider.baseURL)
      ),
      h("div", { className: "st-custom-provider-meta" }, provider.models.map((model) => model.id).join(" \xB7 ")),
      h(
        "div",
        { className: "st-custom-provider-actions" },
        h("span", { className: "st-model-follow-tag" }, provider.hasKey ? t("model.customKeyStored") : t("model.customKeyMissing")),
        h("button", { type: "button", className: "st-btn st-btn-ghost", onClick: () => open(provider) }, t("action.edit")),
        h("button", { type: "button", className: "st-btn st-btn-ghost", onClick: () => remove(provider) }, t("action.delete"))
      )
    )),
    editing === null ? null : h(
      Dialog,
      {
        t,
        title: editing.id === void 0 || editing.id === "" ? t("model.customAdd") : t("model.customEdit"),
        onClose: () => setEditing(null),
        size: "medium"
      },
      h(
        "div",
        { className: "st-dialog-field" },
        h("span", { className: "st-dialog-label" }, t("model.kind")),
        SegGroup({
          label: t("model.kind"),
          options: [
            { value: "chat", label: t("model.kindChat") },
            { value: "image", label: t("model.kindImage") }
          ],
          value: draft.kind ?? "chat",
          onChange: (kind) => setDraft({ ...draft, kind }),
          testId: "model-provider-kind"
        })
      ),
      h(
        "div",
        { className: "st-dialog-field" },
        h("span", { className: "st-dialog-label" }, t("model.customName")),
        h("input", { className: "st-input", value: draft.name, onChange: (e) => setDraft({ ...draft, name: e.target.value }) })
      ),
      h(
        "div",
        { className: "st-dialog-field" },
        h("span", { className: "st-dialog-label" }, t("model.customBaseURL")),
        h("input", { className: "st-input", value: draft.baseURL, placeholder: "https://api.example.com/v1", onChange: (e) => setDraft({ ...draft, baseURL: e.target.value }) })
      ),
      h(
        "div",
        { className: "st-dialog-field" },
        h("span", { className: "st-dialog-label" }, t("model.customKey")),
        h("input", {
          className: "st-input",
          type: "password",
          value: draft.apiKey,
          placeholder: editing.id === void 0 || editing.id === "" ? "" : t("model.customKeyKeep"),
          onChange: (e) => setDraft({ ...draft, apiKey: e.target.value })
        })
      ),
      h(
        "div",
        { className: "st-dialog-field" },
        h("span", { className: "st-dialog-label" }, t("model.customModels")),
        modelsBusy ? h("div", { className: "st-model-follow-tag" }, t("model.customModelsLoading")) : modelsError !== "" ? h("p", { className: "st-dialog-error" }, modelsError) : draft.models.length === 0 ? h("div", { className: "st-model-follow-tag" }, t("model.customModelsHint")) : h(
          "div",
          { className: "st-custom-model-list" },
          draft.models.map((model) => h("span", { key: model.id, className: "st-custom-model-chip" }, model.name ?? model.id))
        )
      ),
      error === "" ? null : h("p", { className: "st-dialog-error" }, error),
      testText === "" ? null : h("p", { className: "st-dialog-hint" }, testText),
      h(
        "div",
        { className: "st-dialog-actions" },
        typeof api2?.providerTest === "function" ? h(
          "button",
          { type: "button", className: "st-btn", disabled: testing, onClick: test },
          testing ? t("model.testing") : t("model.test")
        ) : null,
        h("button", { type: "button", className: "st-btn", onClick: () => setEditing(null) }, t("action.cancel")),
        h(
          "button",
          { type: "button", className: "st-btn st-btn-primary", disabled: busy || modelsBusy, onClick: save },
          busy ? "\u2026" : t("action.save")
        )
      )
    )
  );
}
function ImageSettings({ t, api: api2, image, providers, flash, onPick }) {
  const [agnesModels, setAgnesModels] = React.useState([]);
  const provider = image.provider ?? "agnes";
  const custom = providers.find((row) => row.id === provider && row.kind === "image");
  const imageProviders = providers.filter((row) => row.kind === "image");
  React.useEffect(() => {
    if (provider !== "agnes" || typeof api2?.imageModels !== "function") return void 0;
    let alive = true;
    api2.imageModels({ provider: "agnes" }).then(
      (data) => {
        if (alive) setAgnesModels(data?.models ?? []);
      },
      () => {
        if (alive) setAgnesModels([]);
      }
    );
    return () => {
      alive = false;
    };
  }, [provider, api2]);
  const choices = provider === "agnes" ? agnesModels : custom?.models ?? [];
  const groups = [{
    id: provider,
    name: provider === "agnes" ? t("model.builtin") : custom?.name ?? t("model.imageCustom"),
    models: choices.map((model) => ({ model: model.id, name: model.name }))
  }];
  const chooseProvider = (next) => {
    const providerModels = imageProviders.find((row) => row.id === next)?.models ?? [];
    onPick({
      provider: next,
      model: next === "agnes" ? "agnes-image-2.1-flash" : providerModels[0]?.id ?? ""
    });
  };
  return h(
    "div",
    { className: "st-model-row" },
    h(
      "div",
      { className: "st-model-row-head" },
      h("span", { className: "st-model-role" }, t("model.imageRole")),
      flash ? h("span", { className: "st-model-flash" }, t("model.saved")) : null
    ),
    h(
      "div",
      { className: "st-model-row-head" },
      h("span", { className: "st-model-follow-tag" }, t("model.imageProvider")),
      SegGroup({
        label: t("model.imageProvider"),
        options: [
          { value: "agnes", label: t("model.builtin") },
          ...imageProviders.map((row) => ({ value: row.id, label: row.name }))
        ],
        value: provider,
        onChange: chooseProvider,
        testId: "model-image-provider"
      })
    ),
    h(
      "div",
      { className: "st-model-row-head" },
      h("span", { className: "st-model-follow-tag" }, t("model.imageModel"))
    ),
    h(ModelSelect, {
      t,
      groups,
      value: { provider, model: image.model },
      onChange: (selection) => onPick({ model: selection.model })
    }),
    h(
      "div",
      { className: "st-model-row-head" },
      h("span", { className: "st-model-follow-tag" }, t("model.imageStyle")),
      SegGroup({
        label: t("model.imageStyle"),
        options: IMAGE_STYLE_OPTIONS.map((option) => ({ value: option.id, label: t(option.label) })),
        value: image.style ?? "realistic",
        onChange: (style) => onPick({ style }),
        testId: "model-image-style"
      })
    )
  );
}
var IMAGE_STYLE_OPTIONS = [
  { id: "realistic", label: "model.style.realistic" },
  { id: "anime", label: "model.style.anime" },
  { id: "pixel", label: "model.style.pixel" },
  { id: "sketch", label: "model.style.sketch" }
];
function EffortAxis({ t, efforts, value, onPick }) {
  if (!Array.isArray(efforts) || efforts.length === 0) return null;
  const stops = [{ id: "", name: t("status.effortDefault") }, ...efforts];
  return h(
    "div",
    { className: "st-effort", role: "radiogroup", "aria-label": t("label.effort") },
    stops.map((effort) => h(
      "button",
      {
        key: effort.id || "default",
        type: "button",
        className: "st-effort-stop",
        role: "radio",
        "aria-checked": effort.id === value ? "true" : "false",
        "data-on": effort.id === value ? "true" : "false",
        onClick: () => {
          if (typeof onPick === "function") onPick(effort.id);
        }
      },
      h("span", { className: "st-effort-dot", "aria-hidden": true }),
      h("span", { className: "st-effort-name" }, effort.name ?? effort.id)
    ))
  );
}
function ModelSelect({ t, groups, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  useDismiss(rootRef, open, () => setOpen(false));
  const name = modelLabel(t, value);
  const rows = [];
  for (const group of groups ?? []) {
    const builtin = group.id === "agnes";
    rows.push(h(
      "div",
      { key: `g:${group.id}`, className: "st-model-group" },
      h("div", { className: "st-model-group-name" }, builtin ? t("model.builtin") : group.name ?? group.id)
    ));
    for (const model of group.models ?? []) {
      const current = value !== null && value !== void 0 && value.provider === group.id && value.model === model.model;
      rows.push(h(
        "button",
        {
          key: `${group.id}:${model.model}`,
          type: "button",
          className: "st-model-item",
          role: "menuitem",
          "data-current": current ? "true" : "false",
          // The model id, not the display name: the id is what the config file holds and what
          // the host routes on, and two providers may name the same model differently.
          onClick: () => {
            setOpen(false);
            if (typeof onChange === "function") onChange({ provider: group.id, model: model.model });
          }
        },
        h("span", { className: "st-model-item-name" }, builtin ? `preset-${String(model.model).replace(/^agnes-/, "")}` : model.name ?? model.model),
        builtin ? null : h("span", { className: "st-model-item-id" }, model.model)
      ));
    }
  }
  if (rows.length === 0) rows.push(h("div", { key: "none", className: "st-model-empty" }, t("label.noModels")));
  return h(
    "div",
    { className: "st-mselect", ref: rootRef },
    h(
      "button",
      {
        type: "button",
        className: "st-mselect-button",
        "aria-haspopup": "menu",
        "aria-expanded": open ? "true" : "false",
        onClick: () => setOpen((value_) => !value_)
      },
      h("span", { className: "st-mselect-name" }, name),
      h("span", { className: "st-mselect-caret", "aria-hidden": true }, "\u2304")
    ),
    open ? h("div", { className: "st-model-menu", role: "menu" }, rows) : null
  );
}
function ModelsPage({ t, api: api2, onChange, onNotice }) {
  const [state, setState] = React.useState({
    status: "loading",
    roles: {},
    overrides: {},
    inherited: null,
    file: "",
    groups: [],
    error: "",
    // Reasoning levels per job, and which job was just written, for the confirmation.
    efforts: {},
    flash: "",
    // The portrait settings: which image model, and in what style. Separate from the roles
    // above because an image model is not a chat model — different endpoint, different request.
    image: { provider: "agnes", baseURL: "", model: "agnes-image-2.1-flash", style: "realistic" },
    providers: []
  });
  useNotice(onNotice, state.error);
  const flashTimer = React.useRef(null);
  React.useEffect(() => () => {
    if (flashTimer.current !== null) globalThis.clearTimeout(flashTimer.current);
  }, []);
  const messageOf = (error) => {
    const text = String(error?.message ?? error ?? "");
    return /HTTP 404/.test(text) ? t("model.routeMissing") : text;
  };
  const load = () => {
    if (typeof api2?.models !== "function") {
      setState((prev) => ({ ...prev, status: "ready" }));
      return;
    }
    Promise.all([
      api2.models(),
      typeof api2.catalog === "function" ? api2.catalog() : Promise.resolve({ groups: [] }),
      // A host that predates the custom-provider route still gets a working model page.
      typeof api2.providers === "function" ? api2.providers().catch(() => ({ providers: [] })) : Promise.resolve({ providers: [] })
    ]).then(
      ([data, catalogue, custom]) => {
        setState((prev) => ({
          ...prev,
          status: "ready",
          roles: data.roles ?? {},
          overrides: data.overrides ?? {},
          inherited: data.inherited ?? null,
          file: data.file ?? "",
          groups: catalogue?.groups ?? [],
          providers: custom?.providers ?? [],
          error: "",
          ...data.image === void 0 || data.image === null ? {} : { image: data.image }
        }));
        for (const role of ["continue", "suggest", "chat", "mosaic"]) {
          fetchEfforts(role, data.roles?.[role] ?? data.inherited ?? null);
        }
      },
      (error) => setState((prev) => ({ ...prev, status: "ready", error: messageOf(error) }))
    );
  };
  const fetchEfforts = (role, selection) => {
    if (selection === null || selection === void 0 || typeof api2?.efforts !== "function") return;
    api2.efforts(selection.provider, selection.model).then(
      (data) => setState((prev) => ({
        ...prev,
        efforts: { ...prev.efforts, [role]: data?.efforts ?? [] }
      })),
      () => {
      }
    );
  };
  React.useEffect(load, []);
  const pick = (role, selection) => {
    if (typeof api2?.setModel !== "function") return;
    api2.setModel(role, selection).then(
      (data) => {
        setState((prev) => ({
          ...prev,
          roles: data.roles ?? prev.roles,
          overrides: data.overrides ?? prev.overrides,
          file: data.file ?? prev.file,
          error: "",
          flash: role
        }));
        fetchEfforts(role, data.roles?.[role] ?? null);
        if (flashTimer.current !== null) globalThis.clearTimeout(flashTimer.current);
        flashTimer.current = globalThis.setTimeout(() => {
          flashTimer.current = null;
          setState((prev) => ({ ...prev, flash: "" }));
        }, 2200);
        if (typeof onChange === "function") onChange();
      },
      (error) => setState((prev) => ({ ...prev, error: messageOf(error) }))
    );
  };
  const pickImage = (patch) => {
    const before = state.image;
    const next = { ...before, ...patch };
    setState((prev) => ({ ...prev, image: next, flash: "image", error: "" }));
    if (flashTimer.current !== null) globalThis.clearTimeout(flashTimer.current);
    flashTimer.current = globalThis.setTimeout(() => setState((prev) => ({ ...prev, flash: "" })), 1200);
    if (typeof api2?.setImage !== "function") return;
    api2.setImage(next).then(
      (data) => {
        if (data?.ok === true && data.image !== void 0) setState((prev) => ({ ...prev, image: data.image }));
      },
      (error) => setState((prev) => ({ ...prev, image: before, error: messageOf(error) }))
    );
  };
  const rows = [
    { role: "continue", label: t("model.role.continue") },
    { role: "suggest", label: t("model.role.suggest") },
    { role: "chat", label: t("model.role.chat") },
    { role: "mosaic", label: t("model.role.mosaic") }
  ];
  return h(
    "div",
    { className: "st-models" },
    rows.map((row) => {
      return h(
        "div",
        { key: row.role, className: "st-model-row" },
        h(
          "div",
          { className: "st-model-row-head" },
          h("span", { className: "st-model-role" }, row.label),
          state.flash === row.role ? h("span", { className: "st-model-flash" }, t("model.saved")) : null
        ),
        h(ModelSelect, {
          t,
          groups: state.groups,
          // The resolved model, so an inherited row names the model it is following.
          value: state.roles[row.role] ?? state.inherited,
          onChange: (selection) => pick(row.role, selection)
        }),
        // The levels of THAT model, as an axis: the setting is a direction, not a menu.
        h(EffortAxis, {
          t,
          efforts: state.efforts[row.role] ?? [],
          value: (state.roles[row.role] ?? state.inherited)?.reasoningEffort ?? "",
          onPick: (id) => {
            const current = state.roles[row.role] ?? state.inherited;
            if (current === null || current === void 0) return;
            pick(row.role, { provider: current.provider, model: current.model, reasoningEffort: id });
          }
        })
      );
    }),
    // ---- the portrait settings ----
    //
    // A section of its own: an image model is a different endpoint with a different request and
    // its own key, not a fifth chat role. It shares the dropdown component so the two pickers
    // read as one system.
    h(ImageSettings, {
      t,
      api: api2,
      image: state.image,
      providers: state.providers,
      flash: state.flash === "image",
      onPick: pickImage
    }),
    h(ProviderSection, {
      t,
      api: api2,
      providers: state.providers,
      onChanged: load
    }),
    // Where the choice is kept. A setting the writer can point at is a setting they can
    // back up, edit by hand, or copy to another machine.
    state.file === "" ? null : h(
      "div",
      { className: "st-model-file" },
      t("model.storedAt", { file: state.file })
    )
  );
}

// src/client/panel/settings.js
function TypeChoice({ t, label, options, value, onPick }) {
  const axis = options === TYPE_PRESETS.width ? "width" : options === TYPE_PRESETS.lineHeight ? "lineHeight" : "fontSize";
  const nearest = (target) => {
    let best = options[0].value;
    for (const option of options) {
      if (Math.abs(option.value - target) < Math.abs(best - target)) best = option.value;
    }
    return best;
  };
  const chosen = nearest(Number.isFinite(Number(value)) ? Number(value) : TYPOGRAPHY_DEFAULT[axis]);
  return h(
    "div",
    { className: "st-type-row" },
    h("span", { className: "st-type-label" }, label),
    SegGroup({ label, options: options.map((option) => ({ value: option.value, label: t(option.key) })), value: chosen, onChange: onPick })
  );
}
function ChordRecorder({ t, chord, onPick }) {
  const [recording, setRecording] = React.useState(false);
  const buttonRef = React.useRef(null);
  React.useEffect(() => {
    if (!recording) return void 0;
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setRecording(false);
        return;
      }
      if (event.key === "Meta" || event.key === "Alt" || event.key === "Shift" || event.key === "Control") return;
      event.preventDefault();
      event.stopPropagation();
      setRecording(false);
      onPick(normalizeChord({
        key: event.key,
        alt: event.altKey === true,
        mod: event.metaKey === true || event.ctrlKey === true,
        shift: event.shiftKey === true
      }));
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [recording, onPick]);
  return h("button", {
    type: "button",
    ref: buttonRef,
    className: "st-kbd st-kbd-record",
    "data-testid": "chord-recorder",
    "data-recording": recording ? "true" : "false",
    title: t("keys.recordHint"),
    onClick: () => setRecording((open) => !open)
  }, recording ? t("keys.recording") : chordLabel(chord, currentPlatform() === "macos"));
}
function SettingsPage({ t, typography, onChange, autoSaveMs, onAutoSave, autoSaveLocked, keys, onRebind, onResetChords, platform, library, onLibrary, onPickDirectory }) {
  const gestures = keys ?? resolveGestures(currentPlatform(), {});
  const keyPlatform = platform ?? currentPlatform();
  const chooseLibrary = async () => {
    if (typeof onPickDirectory !== "function") return;
    const path = await onPickDirectory();
    if (path === null || path === void 0 || path === "") return;
    if (typeof onLibrary === "function") onLibrary(path);
  };
  return h(
    "div",
    { className: "st-settings" },
    h(
      "div",
      { className: "st-settings-group" },
      h("div", { className: "st-settings-title" }, t("settings.library")),
      h(
        "div",
        { className: "st-library-picker" },
        h("button", {
          type: "button",
          className: "st-library-path",
          onClick: chooseLibrary,
          disabled: typeof onPickDirectory !== "function",
          title: library ?? ""
        }, library === void 0 || library === null || library === "" ? t("settings.libraryEmpty") : library),
        typeof onPickDirectory === "function" ? h("button", { type: "button", className: "st-btn st-btn-ghost", onClick: chooseLibrary }, t("action.choose")) : null
      )
    ),
    h(
      "div",
      { className: "st-settings-group" },
      h("div", { className: "st-settings-title" }, t("settings.typography")),
      h(
        "div",
        { className: "st-type" },
        ["fontSize", "lineHeight", "width"].map((key) => h(TypeChoice, {
          key,
          t,
          label: t(key === "width" ? "label.measure" : key === "fontSize" ? "label.fontSize" : "label.lineHeight"),
          options: TYPE_PRESETS[key],
          value: typography[key],
          // MERGED, not replaced. `onChange` stores whatever it is handed as the whole setting,
          // so passing `{ fontSize }` alone dropped `lineHeight` and `width`: the other two rows
          // then read `undefined`, found no nearest step, and showed their first one as chosen —
          // three rows that appeared to move each other. Spread the current value first.
          onPick: (value) => onChange({ ...typography, [key]: value })
        })),
        /**
         * A preview in the writer's own prose rather than lorem ipsum: the point of the setting
         * is how their sentences read at this size.
         *
         * The box is a FIXED height and clips. It has to be: with a box that grew with its
         * text, choosing a larger size made the panel taller, the row above moved, and
         * comparing two sizes meant watching the frame jump rather than the letters. Same
         * frame, different type is the only way the comparison means anything.
         */
        h(
          "div",
          { className: "st-type-preview" },
          h("div", {
            className: "st-type-preview-in",
            style: { fontSize: `${typography.fontSize}px`, lineHeight: String(typography.lineHeight) }
          }, t("label.typePreview"))
        ),
        h(
          "div",
          { className: "st-type-foot" },
          h("button", {
            type: "button",
            className: "st-btn st-btn-ghost",
            onClick: () => onChange(TYPOGRAPHY_DEFAULT)
          }, t("action.resetTypography"))
        )
      )
    ),
    h(
      "div",
      { className: "st-settings-group" },
      h("div", { className: "st-settings-title" }, t("settings.saving")),
      h(
        "div",
        { className: "st-type" },
        h(
          "div",
          { className: "st-type-row" },
          h("span", { className: "st-type-label" }, t("label.autoSave")),
          SegGroup({
            label: t("label.autoSave"),
            options: AUTO_SAVE_PRESETS.map((option) => ({ value: option.value, label: t(option.key) })),
            value: autoSaveMs,
            onChange: onAutoSave,
            // A profile-set interval is the deployment's decision, so the control reports
            // it rather than pretending it can be changed here.
            disabled: autoSaveLocked === true
          })
        )
      ),
      // (The auto-save group closed above; the chord group below is the second child of the
      // settings column, so the outer call is still open.)
      // The writer's own chords. All four gestures, the composer's included: its DEFAULT is a lone
      // modifier press, which a recorder cannot express, so the row starts by showing that press and
      // the writer replaces it with a chord. "This one is not configurable" was the wrong answer —
      // the composer key is the one most likely to collide with something else on the machine.
      h(
        "div",
        { className: "st-settings-group" },
        h("div", { className: "st-settings-title" }, t("settings.keys")),
        h(
          "div",
          { className: "st-type" },
          REBINDABLE_GESTURES.map((gesture) => h(
            "div",
            { key: gesture, className: "st-type-row" },
            h("span", { className: "st-type-label" }, t(`keys.${gesture}`)),
            h(ChordRecorder, {
              t,
              chord: gestures[gesture],
              onPick: (chord) => onRebind(gesture, chord)
            }),
            // One row per gesture, so a reset can be one row's, not the whole table's: a writer who
            // only wants their composer key back should not have to give up the chords they chose
            // for the other three.
            h("button", {
              type: "button",
              className: "st-btn st-btn-ghost",
              "data-testid": `chord-reset-${gesture}`,
              title: t("keys.resetHint"),
              onClick: () => onRebind(gesture, defaultChord(keyPlatform, gesture))
            }, t("keys.resetOne"))
          ))
        ),
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost",
          "data-testid": "chords-reset",
          onClick: onResetChords
        }, t("keys.reset"))
      )
    )
  );
}

// src/client/panel/mcp-panel.js
var copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
  }
};
function McpPanel({ t, info, error, loading, onClose, onLaunch }) {
  const [launchError, setLaunchError] = React.useState("");
  const config = info?.config ?? "";
  const launch = async () => {
    if (typeof onLaunch !== "function") return;
    setLaunchError("");
    try {
      const result = await onLaunch();
      if (result?.ok === false) setLaunchError(String(result.error ?? ""));
    } catch (failure) {
      setLaunchError(String(failure?.message ?? failure));
    }
  };
  return h(
    "div",
    {
      className: "st-mcp-backdrop",
      role: "presentation",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose();
      }
    },
    h(
      "div",
      { className: "st-mcp-panel", role: "dialog", "aria-modal": "true", "aria-label": t("mcp.title") },
      h(
        "div",
        { className: "st-mcp-head" },
        h("h2", { className: "st-mcp-title" }, t("mcp.title")),
        h("button", { type: "button", className: "st-btn st-btn-ghost", onClick: onClose }, t("action.close"))
      ),
      loading ? h("p", { className: "st-mcp-note" }, t("label.loading")) : null,
      error === "" ? null : h("p", { className: "st-mcp-error" }, error),
      info === null || info === void 0 ? null : h(
        React.Fragment,
        null,
        h(
          "div",
          { className: `st-mcp-status${info.connected === true ? " st-mcp-connected" : ""}` },
          h("span", { className: "st-mcp-dot" }),
          info.connected === true ? t("mcp.connected") : t("mcp.waiting")
        ),
        typeof onLaunch === "function" ? h("button", { type: "button", className: "st-btn st-btn-primary", onClick: launch }, t("mcp.launch")) : null,
        launchError === "" ? null : h("p", { className: "st-mcp-error" }, launchError),
        h(
          "div",
          { className: "st-mcp-row" },
          h("span", { className: "st-mcp-label" }, t("mcp.endpoint")),
          h("code", { className: "st-mcp-value" }, info.url),
          h("button", { type: "button", className: "st-btn st-btn-ghost", onClick: () => copy(info.url) }, t("action.copy"))
        ),
        h(
          "div",
          { className: "st-mcp-row st-mcp-row-config" },
          h("span", { className: "st-mcp-label" }, t("mcp.config")),
          h("button", { type: "button", className: "st-btn st-btn-ghost", onClick: () => copy(config) }, t("action.copy"))
        ),
        h("pre", { className: "st-mcp-config" }, config)
      )
    )
  );
}

// src/client/panel/models-state.js
function useModels({ api: api2, bookFolder, dockScope }) {
  const [, setAiError] = useDockState(dockScope, "aiError", "");
  const [roleModels, setRoleModels] = React.useState(null);
  const [modelEpoch, setModelEpoch] = React.useState(0);
  const refreshModels = () => setModelEpoch((epoch) => epoch + 1);
  React.useEffect(() => {
    if (bookFolder === void 0) {
      setRoleModels(null);
      return void 0;
    }
    if (typeof api2.meta !== "function") return void 0;
    let cancelled = false;
    api2.meta().then((data) => {
      if (!cancelled) setRoleModels(data?.roles ?? null);
    }, () => {
    });
    return () => {
      cancelled = true;
    };
  }, [bookFolder, modelEpoch]);
  const [catalog, setCatalog] = React.useState([]);
  const [chatEfforts, setChatEfforts] = React.useState([]);
  React.useEffect(() => {
    if (typeof api2.catalog !== "function") return void 0;
    let cancelled = false;
    api2.catalog().then((data) => {
      if (!cancelled) setCatalog(data?.groups ?? []);
    }, () => {
    });
    return () => {
      cancelled = true;
    };
  }, [modelEpoch]);
  const chatSelection = roleModels === null || roleModels === void 0 ? void 0 : roleModels.chat;
  React.useEffect(() => {
    if (typeof api2.efforts !== "function" || chatSelection === void 0 || chatSelection === null) {
      setChatEfforts([]);
      return void 0;
    }
    let cancelled = false;
    api2.efforts(chatSelection.provider, chatSelection.model).then(
      (data) => {
        if (!cancelled) setChatEfforts(data?.efforts ?? []);
      },
      () => {
        if (!cancelled) setChatEfforts([]);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [chatSelection === null || chatSelection === void 0 ? "" : `${chatSelection.provider}/${chatSelection.model}`, modelEpoch]);
  const changeChatModel = (selection) => {
    if (typeof api2.setModel !== "function") return;
    if (selection === null || typeof selection !== "object") return;
    api2.setModel("chat", selection).then(
      () => {
        refreshModels();
      },
      (error) => setAiError(error.message)
    );
  };
  const changeChatEffort = (id) => {
    const current = chatSelection;
    if (current === null || current === void 0) return;
    changeChatModel({ provider: current.provider, model: current.model, ...id === "" ? {} : { reasoningEffort: id } });
  };
  return {
    roleModels,
    roleModelsEpoch: modelEpoch,
    refreshModels,
    catalog,
    chatEfforts,
    chatSelection,
    setChatEffort: changeChatEffort,
    setChatModel: changeChatModel
  };
}

// src/client/panel/library-state.js
function useLibrary(api2) {
  const [library, setLibraryState] = React.useState(void 0);
  const [libraryEpoch, setLibraryEpoch] = React.useState(0);
  React.useEffect(() => {
    let cancelled = false;
    const settle = (value) => {
      if (!cancelled) setLibraryState(typeof value === "string" ? value : "");
    };
    if (typeof api2.models !== "function") {
      settle("");
      return () => {
        cancelled = true;
      };
    }
    api2.models().then((data) => settle(data?.library), () => settle(""));
    return () => {
      cancelled = true;
    };
  }, [api2, libraryEpoch]);
  const chooseLibrary = async (path) => {
    const data = await api2.setLibrary(path);
    setLibraryState(typeof data?.library === "string" ? data.library : "");
    setLibraryEpoch((n) => n + 1);
    return data;
  };
  return { library, chooseLibrary };
}

// src/client/panel/conversation-state.js
function useBookConversation({ layout, uiWorkspace, workspaces, items, useSessions, book, bookFolder, bookPath, t }) {
  const sessions = useSessions === void 0 ? void 0 : useSessions((snapshot) => snapshot);
  const [chatError, setChatError] = React.useState("");
  const workspaceNameFor = (title) => `${t("label.workspacePrefix")} \xB7 ${title}`;
  const ensureBookWorkspace = async (absolutePath) => {
    const title = String(book?.title || bookFolder || "").trim();
    const name = workspaceNameFor(title === "" ? String(bookFolder ?? "") : title);
    const existing = items.find((row) => row.path === absolutePath);
    if (existing !== void 0) {
      if (existing.title !== name) {
        try {
          await workspaces.rename(existing.workspaceId, name);
        } catch {
        }
      }
      return existing.workspaceId;
    }
    const view = await workspaces.create({ path: absolutePath });
    const created = view?.workspaceId ?? view?.id;
    if (created !== void 0 && (view?.title ?? name) !== name) {
      try {
        await workspaces.rename(created, name);
      } catch {
      }
    }
    return created;
  };
  const bookSessions = () => {
    const list = sessions?.byId === void 0 ? [] : Object.values(sessions.byId);
    return list.filter((row) => row.cwd === bookPath).sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
  };
  const openConversation = () => {
    if (layout === void 0) {
      setChatError(t("label.noLayout"));
      return;
    }
    if (uiWorkspace === void 0) {
      setChatError(t("label.noWorkspaceService"));
      return;
    }
    const rows = bookSessions();
    if (rows.length > 0) {
      uiWorkspace.openSession(rows[0].id);
      setChatError("");
      return;
    }
    setChatError("");
    ensureBookWorkspace(bookPath).then((workspaceId) => {
      if (workspaceId === void 0) {
        setChatError(t("label.noWorkspaceForBook"));
        return;
      }
      uiWorkspace.startSession(workspaceId);
    }).catch((error) => setChatError(error.message));
  };
  return { chatError, openConversation };
}

// src/client/mosaic/labels.js
var KIND_LABEL_KEYS = {
  character: "mosaic.newKindRole",
  place: "mosaic.newKindPlace",
  faction: "mosaic.newKindFaction",
  item: "mosaic.newKindItem",
  event: "mosaic.newKindEvent"
};
function kindLabel(kind, t) {
  const key = KIND_LABEL_KEYS[kind];
  return key === void 0 ? String(kind ?? "") : t(key);
}
var FIELD_LABEL_KEYS = {
  role: "mosaic.field.role",
  gender: "mosaic.field.gender",
  age: "mosaic.field.age",
  nationality: "mosaic.field.nationality",
  appearance: "mosaic.field.appearance",
  personality: "mosaic.field.personality",
  motivation: "mosaic.field.motivation",
  arc: "mosaic.field.arc",
  location: "mosaic.field.location",
  atmosphere: "mosaic.field.atmosphere",
  controlledBy: "mosaic.field.controlledBy",
  purpose: "mosaic.field.purpose",
  base: "mosaic.field.base",
  leader: "mosaic.field.leader",
  members: "mosaic.field.members",
  origin: "mosaic.field.origin",
  holder: "mosaic.field.holder",
  significance: "mosaic.field.significance",
  when: "mosaic.field.when",
  where: "mosaic.field.where",
  participants: "mosaic.field.participants",
  consequence: "mosaic.field.consequence"
};
function kindFields(kind) {
  return KIND_FIELDS[kind] ?? [];
}
function isReferenceField(field) {
  return REFERENCE_FIELDS.includes(field) || REFERENCE_LIST_FIELDS.includes(field);
}
function fieldLabel(field, t) {
  const key = FIELD_LABEL_KEYS[field];
  return key === void 0 ? String(field ?? "") : t(key);
}
function fieldValue(entity, field, nameOf) {
  const resolve = (id) => typeof nameOf === "function" ? nameOf(id) : String(id ?? "");
  if (REFERENCE_FIELDS.includes(field)) {
    const id = String(entity?.[field] ?? "").trim();
    return id === "" ? "" : resolve(id);
  }
  if (REFERENCE_LIST_FIELDS.includes(field)) {
    const ids = Array.isArray(entity?.[field]) ? entity[field] : [];
    return ids.map((id) => resolve(id)).filter((name) => name !== "").join("\u3001");
  }
  return String(entity?.[field] ?? "");
}
function describeChange(change, nameOf) {
  const op = String(change?.op ?? "");
  const resolve = (id) => typeof nameOf === "function" ? nameOf(id) : String(id ?? "");
  const name = change?.name ?? resolve(change?.from ?? change?.entityId ?? "");
  if (op === "entity.upsert") {
    const what = change?.kind === "character" ? change?.role ?? "" : change?.summary ?? "";
    return `${name} \u2192 ${what}`;
  }
  if (op === "edge.upsert") return `${resolve(change?.from) || "?"} \u2014${change?.kind ?? change?.truth?.kind ?? ""}\u2192 ${resolve(change?.to) || "?"}`;
  if (op === "edge.retire") return `${name} \u9000\u5F79`;
  if (op === "status.add") return `${name} +${change?.label ?? ""}`;
  if (op === "status.remove") return `${name} -${change?.label ?? ""}`;
  if (op === "belief.add") return `${resolve(change?.holderId)} \u8BA4\u4E3A ${change?.kind ?? ""}`;
  return op === "" ? "\uFF1F" : op;
}
function renderManuscript(markdown, t) {
  const blocks = renderMarkdownBlocks(markdown);
  if (blocks.length === 0) return [h("div", { className: "st-muted" }, t("label.emptyManuscript"))];
  return blocks.map((block, index) => {
    if (block.type === "hr") return h("hr", { key: index, className: "st-md-rule" });
    const spans = block.spans.map((span, i) => span.style === "bold" ? h("strong", { key: i }, span.text) : span.style === "italic" ? h("em", { key: i }, span.text) : span.text);
    if (block.type === "h") {
      const level = Math.min(6, Math.max(1, block.level));
      return h(`h${level}`, { key: index, className: `st-md-h st-md-h${level}` }, ...spans);
    }
    return h("p", { key: index, className: "st-md-p" }, ...spans);
  });
}

// src/client/mosaic/geometry.js
var CARD_W = 120;
var CARD_H = 168;
var CARD_GAP_X = 24;
var CARD_GAP_Y = 24;
var CARD_STEP_X = CARD_W + CARD_GAP_X;
var CARD_STEP_Y = CARD_H + CARD_GAP_Y;
var mosaicFreeSpot = (taken) => {
  const boxes = Array.isArray(taken) ? taken : [];
  const ORIGIN = 24;
  const overlaps = (x, y, box) => x < box.x + box.w && x + CARD_W > box.x && y < box.y + box.h && y + CARD_H > box.y;
  for (let row = 0; row < 40; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const x = ORIGIN + col * CARD_STEP_X;
      const y = ORIGIN + row * CARD_STEP_Y;
      if (!boxes.some((box) => overlaps(x, y, box))) return { x, y };
    }
  }
  return { x: ORIGIN, y: ORIGIN + 40 * CARD_STEP_Y };
};

// src/client/mosaic/write.js
function patchEntityOnBoard(book, updateBook, entityId, fields) {
  const current = book?.mosaic;
  if (current === void 0 || current === null) return;
  updateBook({ ...book, mosaic: patchEntity(current, entityId, fields) });
}

// src/client/mosaic/relations.js
function GenerateIcon() {
  return h(
    "svg",
    {
      className: "st-icon-md",
      viewBox: "0 0 16 16",
      "aria-hidden": true,
      fill: "currentColor"
    },
    h("path", { d: "M8 1.4 9.3 5.6 13.5 6.9 9.3 8.2 8 12.4 6.7 8.2 2.5 6.9 6.7 5.6Z" }),
    h("path", { d: "M12.6 10.4 13.2 12 14.8 12.6 13.2 13.2 12.6 14.8 12 13.2 10.4 12.6 12 12Z" })
  );
}
function DetailPortrait({ t, entity, picture, busy, onPortrait, editable }) {
  const hasPicture = picture !== null && picture !== void 0;
  const label = hasPicture ? t("mosaic.regeneratePortrait") : t("mosaic.generatePortrait");
  return h(
    "div",
    { className: "st-mosaic-detail-portrait" },
    h(
      "div",
      { className: "st-mosaic-detail-frame" },
      hasPicture ? h("img", { src: picture, alt: entity.name, draggable: false }) : h("span", { className: "st-mosaic-detail-initial" }, String(entity.name ?? "").trim().slice(0, 1))
    ),
    editable ? h("button", {
      type: "button",
      className: "st-mosaic-detail-generate",
      "data-testid": "mosaic-generate-portrait",
      "data-busy": busy ? "true" : "false",
      disabled: busy || typeof onPortrait !== "function",
      title: label,
      "aria-label": label,
      onClick: () => {
        if (typeof onPortrait === "function") onPortrait(entity);
      }
    }, h(GenerateIcon)) : null
  );
}
function MosaicPick({ label, testId, value, options, onPick }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  useDismiss(rootRef, open, () => setOpen(false));
  const current = options.find((option) => option.value === value) ?? options[0];
  const pick = (next) => {
    setOpen(false);
    onPick(next);
  };
  return h(
    "div",
    { className: "st-mosaic-pick", ref: rootRef },
    h("span", { className: "st-mosaic-focus-label" }, label),
    h(
      "button",
      {
        type: "button",
        className: "st-mosaic-pick-button",
        "data-testid": testId,
        "aria-haspopup": "listbox",
        "aria-expanded": open ? "true" : "false",
        "aria-label": label,
        onClick: () => setOpen((was) => !was),
        onKeyDown: (event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          const at = options.findIndex((option) => option.value === value);
          const step = event.key === "ArrowDown" ? 1 : -1;
          const next = options[Math.min(options.length - 1, Math.max(0, (at < 0 ? 0 : at) + step))];
          if (next !== void 0) pick(next.value);
        }
      },
      h("span", { className: "st-mosaic-pick-value" }, current === void 0 ? "" : current.label),
      h(Chevron, { open })
    ),
    open ? h(
      "div",
      { className: "st-mosaic-pick-list", role: "listbox", "aria-label": label },
      options.map((option) => h("button", {
        key: option.value === "" ? "__none" : option.value,
        type: "button",
        className: "st-mosaic-pick-option",
        role: "option",
        "aria-selected": option.value === value ? "true" : "false",
        "aria-checked": option.value === value ? "true" : "false",
        onClick: () => pick(option.value)
      }, option.label))
    ) : null
  );
}
function MosaicEdgeDetail({ t, picked, byId, onClose }) {
  const edge = picked.edge;
  const holderName = (id) => byId.get(id)?.name ?? t("mosaic.untitled");
  return h(
    "div",
    { className: "st-mosaic-detail" },
    h(
      "div",
      { className: "st-mosaic-detail-head" },
      h("span", { className: "st-mosaic-detail-title" }, edge.truth.kind || t("mosaic.untitled")),
      edge.retired === true ? h("span", { className: "st-mosaic-badge" }, t("mosaic.retired")) : null,
      h("button", { type: "button", className: "st-btn st-btn-ghost st-mosaic-detail-close", title: t("action.close"), onClick: onClose }, "\u2715")
    ),
    edge.truth.note !== "" ? h("p", { className: "st-mosaic-detail-note" }, edge.truth.note) : null,
    edge.beliefs.length > 0 ? h(
      "div",
      { className: "st-mosaic-detail-section" },
      h("div", { className: "st-mosaic-detail-label" }, t("mosaic.beliefs")),
      edge.beliefs.map((b, i) => h(
        "div",
        { key: b.holderId ?? i, className: "st-mosaic-detail-row" },
        h("span", { className: "st-mosaic-detail-holder" }, holderName(b.holderId)),
        h("span", { className: "st-mosaic-detail-kind" }, b.kind),
        b.note !== "" ? h("span", { className: "st-mosaic-detail-note" }, b.note) : null
      ))
    ) : null,
    edge.log.length > 0 ? h(
      "div",
      { className: "st-mosaic-detail-section" },
      h("div", { className: "st-mosaic-detail-label" }, t("mosaic.log")),
      edge.log.map((l, i) => h(
        "div",
        { key: i, className: "st-mosaic-detail-row" },
        h("span", { className: "st-mosaic-detail-holder" }, l.what),
        h("span", { className: "st-mosaic-detail-note" }, String(l.at))
      ))
    ) : null
  );
}
function MosaicEntityDetail({ t, picked, byId, onPatchEntity, onClose, onPortrait, portraitOf, portraitBusy, portraitError }) {
  const entity = byId.get(picked.entity.id) ?? picked.entity;
  const isCharacter = entity.kind === "character";
  const [statusDraft, setStatusDraft] = React.useState("");
  const [tagDraft, setTagDraft] = React.useState("");
  React.useEffect(() => {
    setStatusDraft("");
    setTagDraft("");
  }, [entity.id]);
  const patch = (fields) => onPatchEntity(entity.id, fields);
  const removeStatus = (label) => {
    patch({ statuses: (entity.statuses ?? []).filter((s) => s.label !== label) });
  };
  const addStatus = () => {
    const label = statusDraft.trim();
    if (label === "") return;
    setStatusDraft("");
    if ((entity.statuses ?? []).some((s) => s.label === label)) return;
    patch({ statuses: [...entity.statuses ?? [], { id: rowId("s"), label }] });
  };
  const removeTag = (tag) => patch({ tags: (entity.tags ?? []).filter((each) => each !== tag) });
  const addTag = () => {
    const tag = tagDraft.trim();
    if (tag === "") return;
    setTagDraft("");
    if ((entity.tags ?? []).includes(tag)) return;
    patch({ tags: [...entity.tags ?? [], tag] });
  };
  const picture = typeof portraitOf === "function" ? portraitOf(entity) : null;
  const busy = portraitBusy === true;
  return h(
    "div",
    { className: "st-mosaic-detail" },
    h(
      "div",
      { className: "st-mosaic-detail-head" },
      h(DetailPortrait, { t, entity, picture, busy, onPortrait, editable: true }),
      h(
        "div",
        { className: "st-mosaic-detail-identity" },
        h("input", {
          type: "text",
          className: "st-mosaic-field st-mosaic-field-title",
          "data-testid": "mosaic-name-edit",
          value: entity.name ?? "",
          "aria-label": t("mosaic.name"),
          onChange: (e) => patch({ name: e.target.value })
        }),
        h("input", {
          type: "text",
          className: "st-mosaic-field",
          "data-testid": isCharacter ? "mosaic-role-edit" : "mosaic-summary-edit",
          value: (isCharacter ? entity.role : entity.summary) ?? "",
          placeholder: isCharacter ? t("mosaic.rolePlaceholder") : void 0,
          "aria-label": isCharacter ? t("mosaic.role") : t("mosaic.newSummary"),
          onChange: (e) => patch(isCharacter ? { role: e.target.value } : { summary: e.target.value })
        })
      ),
      h("button", {
        type: "button",
        className: "st-btn st-btn-ghost st-mosaic-detail-close",
        title: t("action.close"),
        "aria-label": t("action.close"),
        onClick: onClose
      }, "\u2715")
    ),
    // The rest of the kind's schema fields. They are always listed, blank or not: hiding an empty
    // field is how a character's age and gender disappeared from this view entirely.
    h(
      "div",
      { className: "st-mosaic-detail-section" },
      kindFields(entity.kind).filter((field) => !(isCharacter && field === "role")).map((field) => h(
        "div",
        {
          key: field,
          className: "st-mosaic-detail-row"
        },
        h("span", { className: "st-mosaic-detail-field-label" }, fieldLabel(field, t)),
        h(
          "span",
          { className: "st-mosaic-detail-field-value" },
          fieldValue(entity, field, (id) => byId.get(id)?.name ?? t("mosaic.untitled"))
        )
      ))
    ),
    // A failed generation says why, where the button was pressed. Silence after a click reads
    // as a broken button.
    portraitError !== null && portraitError !== void 0 && portraitError !== "" ? h("p", { className: "st-mosaic-detail-error", role: "alert" }, String(portraitError)) : null,
    // A person's one-liner is the text this page is FOR; for every other kind the long
    // description is, and the one-liner already sits in the identity row above.
    h(
      "div",
      { className: "st-mosaic-detail-section" },
      h(
        "div",
        { className: "st-mosaic-detail-label" },
        isCharacter ? t("mosaic.newSummary") : t("mosaic.newDescription")
      ),
      h("textarea", {
        className: "st-mosaic-field st-mosaic-field-area",
        "data-testid": isCharacter ? "mosaic-summary-edit" : "mosaic-description-edit",
        value: (isCharacter ? entity.summary : entity.description) ?? "",
        rows: 4,
        onChange: (e) => patch(isCharacter ? { summary: e.target.value } : { description: e.target.value })
      })
    ),
    // Statuses belong to every kind, not only to people; the row stays even when it is empty.
    h(
      "div",
      { className: "st-mosaic-detail-section" },
      h("div", { className: "st-mosaic-detail-label" }, t("mosaic.statuses")),
      h(
        "div",
        { className: "st-mosaic-chip-row" },
        (entity.statuses ?? []).map((s) => h("span", {
          key: s.id,
          className: "st-mosaic-chip st-mosaic-chip-toggle",
          "data-testid": "mosaic-status-chip",
          title: t("mosaic.removeHint"),
          onClick: () => removeStatus(s.label)
        }, s.label)),
        h("input", {
          type: "text",
          className: "st-mosaic-status-add",
          "data-testid": "mosaic-status-add",
          value: statusDraft,
          placeholder: t("mosaic.statusAddPlaceholder"),
          onChange: (e) => setStatusDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addStatus();
            }
          }
        })
      )
    ),
    h(
      "div",
      { className: "st-mosaic-detail-section" },
      h("div", { className: "st-mosaic-detail-label" }, t("mosaic.tags")),
      h(
        "div",
        { className: "st-mosaic-chip-row" },
        (entity.tags ?? []).map((tag) => h("span", {
          key: tag,
          className: "st-mosaic-chip st-mosaic-chip-toggle",
          "data-testid": "mosaic-tag-chip",
          title: t("mosaic.removeHint"),
          onClick: () => removeTag(tag)
        }, tag)),
        h("input", {
          type: "text",
          className: "st-mosaic-status-add",
          "data-testid": "mosaic-tag-add",
          value: tagDraft,
          placeholder: t("mosaic.tagAddPlaceholder"),
          onChange: (e) => setTagDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }
        })
      )
    ),
    // The escape-hatch rows, read-only here; the page is where one is added or removed.
    h(
      "div",
      { className: "st-mosaic-detail-section" },
      h("div", { className: "st-mosaic-detail-label" }, t("mosaic.custom")),
      h(
        "div",
        { className: "st-mosaic-chip-row" },
        (entity.custom ?? []).map((row) => h(
          "span",
          { key: row.id, className: "st-mosaic-chip" },
          `${row.label}\uFF1A${row.value}`
        ))
      )
    )
  );
}
var edgeTitle = (edge, from, to, t) => {
  const kind = edge.truth.kind || t("mosaic.untitled");
  const note = edge.truth.note === "" ? "" : `\uFF08${edge.truth.note}\uFF09`;
  const line = `${from.name} \u2014${kind}${note}\u2192 ${to.name}`;
  const beliefs = (edge.beliefs ?? []).length;
  return beliefs === 0 ? line : `${line}
${t("mosaic.beliefCount", { n: beliefs })}`;
};
var cardIntro = (entity) => {
  const description = typeof entity.description === "string" ? entity.description.trim() : "";
  if (description !== "") return description;
  return entity.kind === "character" && typeof entity.summary === "string" ? entity.summary.trim() : "";
};
function MosaicRelations({ t, mosaic, book, updateBook, picked, onPick, onPortrait, portraitOf, portraitBusyId, portraitError }) {
  const allEntities = Array.isArray(mosaic.entities) ? mosaic.entities : [];
  const entities = allEntities.filter((e) => e.kind === "character");
  const [focusId, setFocusId] = React.useState(null);
  const [viewKind, setViewKind] = React.useState("character");
  const neighbourhood = (() => {
    if (focusId === null) return null;
    const ids = /* @__PURE__ */ new Set([focusId]);
    for (const edge of Array.isArray(mosaic.edges) ? mosaic.edges : []) {
      if (edge.retired === true) continue;
      if (edge.from === focusId) ids.add(edge.to);
      if (edge.to === focusId) ids.add(edge.from);
    }
    return ids;
  })();
  const byId = new Map(allEntities.map((e) => [e.id, e]));
  const canvasRef = React.useRef(null);
  const pendingSpots = (() => {
    const taken = entities.filter((entity) => entity.layout !== null && entity.layout !== void 0).map((entity) => ({ x: entity.layout.x, y: entity.layout.y, w: CARD_W, h: CARD_H }));
    const map = /* @__PURE__ */ new Map();
    for (const entity of entities) {
      if (entity.layout !== null && entity.layout !== void 0) continue;
      const spot = mosaicFreeSpot(taken);
      taken.push({ x: spot.x, y: spot.y, w: CARD_W, h: CARD_H });
      map.set(entity.id, spot);
    }
    return map;
  })();
  const pos = (entity) => {
    const layout = entity.layout;
    if (layout !== null && layout !== void 0 && Number.isFinite(layout.x) && Number.isFinite(layout.y)) {
      return { x: layout.x, y: layout.y };
    }
    const spot = pendingSpots.get(entity.id);
    if (spot !== null && spot !== void 0 && Number.isFinite(spot.x) && Number.isFinite(spot.y)) {
      return { x: spot.x, y: spot.y };
    }
    return { x: 24, y: 24 };
  };
  const [drag, setDrag] = React.useState(null);
  const placedRef = React.useRef(false);
  React.useEffect(() => {
    if (placedRef.current) return;
    const missing = entities.filter((entity) => entity.layout === null || entity.layout === void 0);
    if (missing.length === 0) {
      placedRef.current = true;
      return;
    }
    placedRef.current = true;
    const taken = entities.filter((entity) => entity.layout !== null && entity.layout !== void 0).map((entity) => ({ x: entity.layout.x, y: entity.layout.y, w: CARD_W, h: CARD_H }));
    const assigned = /* @__PURE__ */ new Map();
    for (const entity of missing) {
      const spot = mosaicFreeSpot(taken);
      taken.push({ x: spot.x, y: spot.y, w: CARD_W, h: CARD_H });
      assigned.set(entity.id, spot);
    }
    const current = book.mosaic;
    if (current === void 0 || current === null) return;
    updateBook({
      ...book,
      mosaic: {
        ...current,
        entities: current.entities.map((e) => assigned.has(e.id) ? { ...e, layout: assigned.get(e.id) } : e)
      }
    });
  }, [book, entities, updateBook]);
  const livePos = (entity) => {
    const base = pos(entity);
    if (drag === null || drag.id !== entity.id) return base;
    return { x: Math.max(0, base.x + drag.dx), y: Math.max(0, base.y + drag.dy) };
  };
  const drawn = entities.filter((entity) => {
    if (neighbourhood !== null && !neighbourhood.has(entity.id)) return false;
    if (viewKind === "character" && entity.kind !== "character") return false;
    if (viewKind === "card" && entity.kind === "character") return false;
    return true;
  });
  const drawnIds = new Set(drawn.map((e) => e.id));
  const live = (Array.isArray(mosaic.edges) ? mosaic.edges : []).filter((e) => e.retired !== true && drawnIds.has(e.from) && drawnIds.has(e.to));
  const onMove = (entityId, layout) => {
    onPick(null);
    patchEntityOnBoard(book, updateBook, entityId, { layout });
  };
  const cards = drawn.map((entity) => {
    const base = livePos(entity);
    return {
      entity,
      picture: typeof portraitOf === "function" ? portraitOf(entity) : null,
      // Numbers, always: undefined renders as `top: null`, which React drops, leaving the card
      // at the canvas origin.
      style: { left: Number.isFinite(base.x) ? base.x : 24, top: Number.isFinite(base.y) ? base.y : 24 }
    };
  });
  return h(
    "div",
    { className: "st-mosaic-board" },
    h(
      "div",
      {
        className: "st-mosaic-canvas",
        ref: canvasRef,
        // The one definition of the card's size, handed to the stylesheet: the wires end at a
        // card's centre and CSS draws the box, so both must read the same number.
        style: { "--st-card-w": `${CARD_W}px`, "--st-card-h": `${CARD_H}px` },
        onClick: (e) => {
          if (e.target === e.currentTarget) onPick(null);
        }
      },
      // The wire layer must be a NAMESPACED <svg>, not `h('svg')`: React only creates SVG-
      // namespace children when the parent itself is one. As an HTML element, the lines inside
      // rendered as unknown HTML children — which draw nothing — and no test noticed, because a
      // tree walk cannot tell a painted line from an unpainted one.
      h(
        "svg",
        {
          className: "st-mosaic-wires",
          // Explicit, so a stylesheet that fails to load still gives the layer a box to draw in.
          xmlns: "http://www.w3.org/2000/svg"
        },
        live.map((edge) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (from === void 0 || to === void 0) return null;
          const a = livePos(from);
          const b = livePos(to);
          const start = { x: a.x + CARD_W / 2, y: a.y + CARD_H / 2 };
          const end = { x: b.x + CARD_W / 2, y: b.y + CARD_H / 2 };
          const pickedEdge = picked?.kind === "edge" && picked.edge.id === edge.id;
          return h(
            "g",
            { key: edge.id },
            h("title", null, edgeTitle(edge, from, to, t)),
            h("line", {
              className: "st-mosaic-edge-hit",
              "data-entity": `${edge.id}-hit`,
              x1: start.x,
              y1: start.y,
              x2: end.x,
              y2: end.y
            }),
            h("line", {
              className: "st-mosaic-edge" + (pickedEdge ? " st-mosaic-edge-picked" : ""),
              x1: start.x,
              y1: start.y,
              x2: end.x,
              y2: end.y,
              // The visible line carries the click too: it is the element a reader means when
              // they point at a wire.
              onClick: (e) => {
                e.stopPropagation?.();
                onPick({ kind: "edge", edge });
              }
            })
          );
        })
      ),
      cards.map(({ entity, style, picture }) => h(
        "div",
        {
          key: entity.id,
          // `st-mosaic-card-plain`: no portrait yet. The caption's seam and the monogram read
          // differently on a card with no photograph, and the stylesheet needs to know which card
          // it is dressing.
          className: "st-mosaic-card" + (picture === null || picture === void 0 ? " st-mosaic-card-plain" : ""),
          "data-entity": entity.id,
          style,
          onPointerDown: (e) => {
            e.stopPropagation?.();
            e.currentTarget?.setPointerCapture?.(e.pointerId);
            setDrag({ id: entity.id, startX: e.clientX, startY: e.clientY, dx: 0, dy: 0, moved: false });
          },
          onPointerMove: (e) => {
            setDrag((prev) => {
              if (prev === null || prev.id !== entity.id) return prev;
              return { ...prev, dx: e.clientX - prev.startX, dy: e.clientY - prev.startY, moved: true };
            });
          },
          onPointerUp: (e) => {
            e.stopPropagation?.();
            if (drag === null || drag.id !== entity.id) return;
            setDrag(null);
            if (drag.moved !== true) {
              onPick({ kind: "entity", entity });
              return;
            }
            const base = pos(entity);
            onMove(entity.id, { x: Math.max(0, base.x + drag.dx), y: Math.max(0, base.y + drag.dy) });
          },
          // A cancelled gesture delivers no pointerup, so it unwinds itself — display-only reset.
          onPointerCancel: () => {
            setDrag(null);
          }
        },
        h(
          "div",
          { className: "st-mosaic-card-photo" },
          picture !== null && picture !== void 0 ? h("img", { src: picture, alt: entity.name, draggable: false }) : h(
            "span",
            { className: "st-mosaic-card-initial" },
            String(entity.name ?? "").trim().slice(0, 1)
          )
        ),
        h(
          "div",
          { className: "st-mosaic-card-caption" },
          h("span", { className: "st-mosaic-card-name" }, entity.name),
          entity.kind === "character" ? h("span", { className: "st-mosaic-card-sub" }, entity.role || t("mosaic.untitled")) : h("span", { className: "st-mosaic-card-sub" }, entity.summary || kindLabel(entity.kind, t)),
          cardIntro(entity) === "" ? null : h("span", { className: "st-mosaic-card-intro" }, cardIntro(entity))
        )
      )),
      // Two components, chosen by kind, so the popover's hook count is fixed per instance: one
      // component that early-returned around its useState would change hook count as the pick
      // moved from an edge to a card. Keying the entity variant by id also drops a half-typed
      // draft when the writer moves to another card.
      picked?.kind === "edge" ? h(MosaicEdgeDetail, { t, picked, byId, onClose: () => onPick(null) }) : picked ? h(MosaicEntityDetail, {
        t,
        picked,
        byId,
        key: picked.entity.id,
        onPatchEntity: (entityId, fields) => patchEntityOnBoard(book, updateBook, entityId, fields),
        onClose: () => onPick(null),
        // The portrait trio rides down rather than living here: the picture is written onto
        // the card through the ordinary patch — one write path for the whole board.
        onPortrait: typeof onPortrait === "function" ? onPortrait : void 0,
        portraitOf,
        portraitBusy: portraitBusyId !== null && portraitBusyId !== void 0 && picked.entity !== void 0 && portraitBusyId === picked.entity.id,
        portraitError
      }) : null
    ),
    // The two selectors sit UNDER the board in reading order; the view opens on 角色, so the
    // common case needs no pick. Every entry can be the centre — an item included, since its
    // neighbours are characters.
    h(
      "div",
      { className: "st-mosaic-focus" },
      h(MosaicPick, {
        label: t("mosaic.focusOn"),
        testId: "mosaic-focus-pick",
        value: focusId ?? "",
        options: [{ value: "", label: t("mosaic.focusNone") }].concat(
          allEntities.map((e) => ({
            value: e.id,
            // The kind is what tells two same-named entries apart in this list.
            label: `${e.name}${e.kind === "character" ? "" : ` \xB7 ${kindLabel(e.kind, t)}`}`
          }))
        ),
        onPick: (value) => setFocusId(value === "" ? null : value)
      }),
      h(MosaicPick, {
        label: t("mosaic.view"),
        testId: "mosaic-view-pick",
        value: viewKind,
        options: [
          { value: "all", label: t("mosaic.viewAll") },
          { value: "character", label: t("mosaic.viewCharacter") },
          { value: "card", label: t("mosaic.viewCard") }
        ],
        onPick: setViewKind
      }),
      focusId === null ? null : h("button", {
        type: "button",
        className: "st-btn st-btn-ghost",
        "data-testid": "mosaic-focus-clear",
        onClick: () => setFocusId(null)
      }, t("mosaic.focusClear"))
    )
  );
}

// src/client/mosaic/review.js
var chapterTextHash = async (chapter) => {
  const text = typeof chapter?.text === "string" ? chapter.text : "";
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
};
function MosaicNewCard({ t, onCreate, onCreated, defaultKind }) {
  const [open, setOpen] = React.useState(false);
  const [kind, setKind] = React.useState(defaultKind ?? "character");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");
  const reset = () => {
    setName("");
    setRole("");
    setSummary("");
    setDescription("");
    setError("");
  };
  const close = () => {
    setOpen(false);
    reset();
  };
  const submit = () => {
    const trimmed = name.trim();
    if (trimmed === "") {
      setError(t("mosaic.newNeedName"));
      return;
    }
    const entity = onCreate(kind, {
      name: trimmed,
      role: kind === "character" ? role.trim() : "",
      summary: summary.trim(),
      description: description.trim()
    });
    close();
    if (typeof onCreated === "function") onCreated(entity);
  };
  const field = (label, placeholder, value, onChange, multiline) => h(
    "label",
    { className: "st-dialog-field" },
    h("span", { className: "st-dialog-label" }, label),
    multiline ? h("textarea", {
      className: "st-input st-dialog-textarea",
      placeholder,
      value,
      onChange: (e) => onChange(e.target.value)
    }) : h("input", {
      className: "st-input",
      placeholder,
      value,
      onChange: (e) => onChange(e.target.value)
    })
  );
  return h(
    React.Fragment,
    null,
    h("button", {
      type: "button",
      className: "st-btn st-btn-primary",
      "data-testid": "mosaic-new",
      onClick: () => {
        reset();
        setOpen(true);
      }
    }, t("mosaic.new")),
    open ? h(
      "div",
      {
        className: "st-backdrop",
        role: "presentation",
        onMouseDown: (e) => {
          if (e.target === e.currentTarget) close();
        }
      },
      h(
        "div",
        { className: "st-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("mosaic.newTitle") },
        h("div", { className: "st-dialog-title" }, t("mosaic.newTitle")),
        h(
          "div",
          { className: "st-dialog-body" },
          h(
            "label",
            { className: "st-dialog-field" },
            h("span", { className: "st-dialog-label" }, t("mosaic.newKind")),
            h(Dropdown, {
              className: "st-new-kind",
              testId: "mosaic-new-kind",
              label: t("mosaic.newKind"),
              value: kind,
              onChange: setKind,
              options: ENTITY_KINDS.map((value) => ({ value, label: kindLabel(value, t) }))
            })
          ),
          field(t("mosaic.newName"), void 0, name, setName),
          // A character is asked for its role; the other four have no extra field at birth, so
          // the form stays two boxes instead of becoming a questionnaire.
          kind === "character" ? field(t("mosaic.newRole"), t("mosaic.newRolePlaceholder"), role, setRole) : null,
          // The one-line summary and the long description are two boxes: the first is what
          // every digest and the card front read, the second is the设定资料.
          field(t("mosaic.newSummary"), void 0, summary, setSummary),
          field(t("mosaic.newDescription"), void 0, description, setDescription, true),
          error === "" ? null : h("p", { className: "st-dialog-hint st-dialog-error" }, error)
        ),
        h(
          "div",
          { className: "st-dialog-actions" },
          h("button", { type: "button", className: "st-btn", onClick: close }, t("action.cancel")),
          h("button", {
            type: "button",
            className: "st-btn st-btn-primary",
            "data-testid": "mosaic-new-submit",
            onClick: submit
          }, t("mosaic.newSubmit"))
        )
      )
    ) : null
  );
}
function MosaicCheckHeader({ t, api: api2, bookFolder, book, chapter, mosaicProposal, onProposal, decisions, onDecide, onApplyChanges, busy, setBusy, setNotice, setNote, notice }) {
  const proposal = mosaicProposal;
  const nameOf = (id) => {
    const entity = (book.mosaic?.entities ?? []).find((e) => e.id === id);
    return entity === void 0 ? String(id ?? "") : entity.name;
  };
  const editChange = (index, patch) => {
    onProposal({
      ...proposal,
      changes: proposal.changes.map((change, i) => i === index ? { ...change, ...patch } : change)
    });
  };
  const check = async () => {
    if (busy || !chapter) return;
    setBusy(true);
    setNotice("");
    if (typeof setNote === "function") setNote(t("mosaic.thinking.check"));
    onDecide("reset");
    try {
      const data = await api2.mosaicCheck(bookFolder, chapter.id, chapter.text ?? "");
      if (data?.proposal) {
        onProposal(data.proposal);
        onDecide("reset");
        if ((data.proposal.changes ?? []).length === 0) setNotice(t("mosaic.checkEmpty"));
      } else if (data?.message) setNotice(data.message);
    } catch (error) {
      setNotice(error.message);
    } finally {
      if (typeof setNote === "function") setNote("");
      setBusy(false);
    }
  };
  const relate = async () => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    if (typeof setNote === "function") setNote(t("mosaic.thinking.relate"));
    onDecide("reset");
    try {
      const data = await api2.mosaicRelate(book.mosaic?.entities ?? [], book.mosaic?.edges ?? [], bookFolder);
      if (data?.proposal) {
        onProposal(data.proposal);
        onDecide("reset");
        const found = (data.proposal.changes ?? []).length;
        if (found > 0) setNotice(t("mosaic.relateFound", { n: found }));
      }
      if (!data?.proposal) setNotice(data?.message ?? t("mosaic.relateEmpty"));
    } catch (error) {
      setNotice(error.message);
    } finally {
      if (typeof setNote === "function") setNote("");
      setBusy(false);
    }
  };
  const runApply = async (changes, after, provenance, proposalId) => {
    if (changes.length === 0 || busy) return;
    setBusy(true);
    setNotice("");
    if (typeof setNote === "function") setNote(t("mosaic.thinking.apply"));
    try {
      let stamp;
      if (provenance !== void 0 && provenance !== null && typeof provenance.chapterId === "string" && provenance.chapterId !== "" && provenance.chapter !== null && provenance.chapter !== void 0) {
        stamp = { chapterId: provenance.chapterId, hash: await chapterTextHash(provenance.chapter) };
      }
      await onApplyChanges(changes, {
        proposalId,
        provenance: stamp,
        after: () => {
          onProposal(null);
          onDecide("reset");
          if (typeof after === "function") after();
        }
      });
    } catch (error) {
      setNotice(error.message);
    } finally {
      if (typeof setNote === "function") setNote("");
      setBusy(false);
    }
  };
  const apply = async () => {
    const changes = (proposal?.changes ?? []).filter((_, i) => decisions[i] === "accepted");
    const chapterId = typeof proposal?.sourceChapterId === "string" ? proposal.sourceChapterId : "";
    await runApply(changes, void 0, chapterId === "" ? void 0 : { chapterId, chapter }, proposal?.id);
  };
  const opName = (op) => t(`mosaic.op.${op}`);
  const acceptAll = () => {
    for (let i = 0; i < (proposal?.changes ?? []).length; i += 1) onDecide(i, "accepted");
  };
  const sourceLabel = proposal === null || proposal === void 0 ? "" : t(`mosaic.proposalFrom${proposal.source === "relate" ? "Relate" : proposal.source === "chat" ? "Chat" : "Check"}`);
  const proposalChapter = proposal === null || proposal === void 0 || proposal.sourceChapterId === null || proposal.sourceChapterId === void 0 ? "" : (book.chapters ?? []).find((chapter2) => chapter2.id === proposal.sourceChapterId)?.title ?? "";
  const proposalTime = proposal !== null && proposal !== void 0 && Number.isFinite(proposal.at) ? new Date(proposal.at).toLocaleString() : "";
  const proposalMeta = [sourceLabel, proposalChapter, proposalTime].filter((part) => part !== "").join(" \xB7 ");
  const hasChangeLeft = (proposal?.changes ?? []).some((_, i) => decisions[i] !== "accepted");
  const detailOf = (change) => {
    switch (change.op) {
      // The kind's own label first — that is what the writer is deciding ("is this a place?").
      case "entity.upsert":
        return [kindLabel(change.kind, t), change.summary, change.description].filter((part) => typeof part === "string" && part !== "").join("\uFF1A");
      case "edge.upsert": {
        const newKind = change.truth?.kind ?? "";
        const edge = (book.mosaic?.edges ?? []).find((e) => e.from === change.from && e.to === change.to) ?? (change.edgeId !== void 0 && change.edgeId !== null ? (book.mosaic?.edges ?? []).find((e) => e.id === change.edgeId) : void 0);
        return edge === void 0 ? `${nameOf(change.from)} \u2014 ${nameOf(change.to)}\uFF1A${newKind}` : `${nameOf(change.from)} \u2014 ${nameOf(change.to)}\uFF1A${edge.truth?.kind ?? ""} \u2192 ${newKind}`;
      }
      case "belief.add":
        return `${nameOf(change.holderId)}\uFF1A${change.kind}${change.note ? `\uFF08${change.note}\uFF09` : ""}`;
      case "status.add":
      case "status.remove":
        return `${nameOf(change.entityId)}\uFF1A${change.label}`;
      case "edge.retire":
        return change.reason ?? "";
      default:
        return JSON.stringify(change);
    }
  };
  return {
    actions: h(
      "div",
      { className: "st-mosaic-head" },
      // ONE row of controls, and nothing else in the operation band: the buttons belong to the
      // page, so they share the band with every other page's buttons.
      h(
        "div",
        { className: "st-mosaic-check-row" },
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost",
          "data-testid": "mosaic-check",
          disabled: busy,
          onClick: check
        }, t("mosaic.check")),
        h("button", {
          type: "button",
          className: "st-btn st-btn-ghost",
          "data-testid": "mosaic-relate",
          disabled: busy,
          onClick: relate
        }, t("mosaic.relate"))
      )
    ),
    content: h(
      "div",
      { className: "st-mosaic-body-block" },
      notice === "" || notice === void 0 ? null : h("div", { className: "st-mosaic-notice", role: "status" }, notice),
      proposal !== null && proposal !== void 0 ? h(
        "div",
        { className: "st-mosaic-proposal-wrap" },
        h("p", { className: "st-mosaic-proposal-title" }, t("mosaic.proposalTitle")),
        proposalMeta === "" ? null : h("div", { className: "st-mosaic-proposal-meta" }, proposalMeta),
        (Array.isArray(proposal.evidence) ? proposal.evidence : []).length > 0 ? h(
          "blockquote",
          { className: "st-mosaic-proposal-evidence" },
          (Array.isArray(proposal.evidence) ? proposal.evidence : []).map((quote, i) => h("div", { key: i }, quote))
        ) : null,
        (proposal.changes ?? []).map((change, i) => {
          const verdict = decisions[i] ?? "undecided";
          const quote = (Array.isArray(proposal.evidence) ? proposal.evidence : [])[change.evidenceIndex];
          const editableName = change.op === "entity.upsert";
          return h(
            "article",
            {
              key: i,
              className: "st-mosaic-proposal",
              "data-testid": "mosaic-proposal-card",
              "data-accepted": verdict === "accepted" ? "true" : void 0,
              "data-rejected": verdict === "rejected" ? "true" : void 0
            },
            h("div", { className: "st-mosaic-proposal-op" }, opName(change.op)),
            h("div", { className: "st-mosaic-proposal-detail" }, detailOf(change)),
            editableName ? h(
              "div",
              { className: "st-mosaic-fields" },
              h("input", {
                type: "text",
                className: "st-mosaic-name",
                value: change.name ?? "",
                onChange: (e) => editChange(i, { name: e.target.value })
              })
            ) : null,
            typeof quote === "string" && quote !== "" ? h("p", { className: "st-mosaic-quote" }, quote) : null,
            h(
              "div",
              { className: "st-mosaic-proposal-actions" },
              h("button", {
                type: "button",
                className: "st-btn st-btn-ghost",
                "data-testid": "proposal-accept",
                disabled: busy,
                onClick: () => onDecide(i, verdict === "accepted" ? "undecided" : "accepted")
              }, t("mosaic.accept")),
              h("button", {
                type: "button",
                className: "st-btn st-btn-ghost",
                "data-testid": "proposal-reject",
                disabled: busy,
                onClick: () => onDecide(i, verdict === "rejected" ? "undecided" : "rejected")
              }, t("mosaic.reject"))
            )
          );
        }),
        hasChangeLeft || (proposal.changes ?? []).some((_, i) => decisions[i] === "accepted") ? h(
          "div",
          { className: "st-mosaic-apply-row" },
          hasChangeLeft ? h("button", {
            type: "button",
            className: "st-btn st-btn-ghost",
            "data-testid": "proposal-accept-all",
            disabled: busy,
            onClick: acceptAll
          }, t("mosaic.acceptAll")) : null,
          (proposal.changes ?? []).some((_, i) => decisions[i] === "accepted") ? h("button", {
            type: "button",
            className: "st-btn st-btn-primary",
            "data-testid": "proposal-apply",
            disabled: busy,
            onClick: apply
          }, t("mosaic.apply")) : null
        ) : null
      ) : null,
      // The message is NOT drawn here: every failure is reported in the one status bar.
      null
    )
  };
}
function MosaicReviewPage({ t, mosaic, book, updateBook, picked, onPick, api: api2, bookFolder, chapter, mosaicProposal, onProposal, decisions, onDecide, onApplyChanges, onCreate, onInspect, onPortrait, portraitOf, portraitBusyId, portraitError, onNotice }) {
  const boardScope = `story:${book?.id ?? bookFolder ?? ""}`;
  const [busy, setBusy] = useDockState(boardScope, "mosaicBusy", false);
  const [, setNote] = useDockState(boardScope, "mosaicNote", "");
  const [notice, setNotice] = React.useState("");
  useNotice(onNotice, notice);
  const parts = MosaicCheckHeader({
    t,
    api: api2,
    bookFolder,
    book,
    chapter,
    mosaicProposal,
    onProposal,
    decisions,
    onDecide,
    onApplyChanges,
    busy,
    setBusy,
    setNotice,
    setNote,
    notice
  });
  return h(
    "div",
    { className: "st-mosaic-band" },
    h(
      "div",
      { className: "st-mosaic-band-head" },
      h("h2", { className: "st-mosaic-band-heading" }, t("mosaic.tab.relations")),
      h(
        "div",
        { className: "st-mosaic-band-tools" },
        parts.actions,
        h(MosaicNewCard, { t, onCreate, onCreated: onInspect, defaultKind: "character" })
      )
    ),
    h(
      "div",
      { className: "st-mosaic-band-content" },
      parts.content,
      h(MosaicRelations, {
        t,
        mosaic,
        book,
        updateBook,
        picked,
        onPick,
        onPortrait,
        portraitOf,
        portraitBusyId,
        portraitError
      })
    )
  );
}

// src/client/mosaic/tabs.js
var MOSAIC_TABS = [
  // The keys reuse the drawers' dictionary entries, so both languages are free. 提案 is a
  // decision waiting on the writer; 流派 is a reusable library, so it sits at the end.
  ["relations", "mosaic.tab.relations"],
  ["world", "mosaic.tab.world"],
  ["cast", "mosaic.tab.cast"],
  ["items", "mosaic.tab.items"],
  ["proposals", "mosaic.tab.proposals"],
  ["overview", "tab.overview"],
  ["versions", "tab.versions"],
  // 流派 last: it is a library of reusable writing styles, not a page about the current book.
  ["writingStyle", "tab.writingStyles"]
];
function MosaicPage({ title, actions, content }) {
  const body = Array.isArray(content) ? content : [content];
  return h(
    "div",
    { className: "st-mosaic-band" },
    h(
      "div",
      { className: "st-mosaic-band-head" },
      h("h2", { className: "st-mosaic-band-heading" }, title),
      h("div", { className: "st-mosaic-band-tools" }, actions)
    ),
    h("div", { className: "st-mosaic-band-content" }, ...body.filter((node) => node !== null && node !== void 0))
  );
}
function ProposalsPage({ t, api: api2, book, bookFolder, onApply, onNotice }) {
  const [rows, setRows] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  useNotice(onNotice, error);
  const [epoch, setEpoch] = React.useState(0);
  const [pickedId, setPickedId] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    api2.proposals(bookFolder).then((data) => {
      if (cancelled) return;
      setRows(Array.isArray(data?.proposals) ? data.proposals : []);
    }, (e) => {
      if (!cancelled) {
        setRows([]);
        setError(e?.message ?? String(e));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [api2, bookFolder, epoch]);
  const refresh = () => {
    setEpoch((n) => n + 1);
  };
  const answer = async (row, status) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (status === "accepted") {
        if ((row.changes ?? []).length === 0) await api2.setProposalStatus(bookFolder, row.id, "accepted");
        else await onApply(row.changes ?? [], { proposalId: row.id });
      } else {
        await api2.setProposalStatus(bookFolder, row.id, status);
      }
      refresh();
    } catch (e) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };
  const discard = async (row) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api2.deleteProposal(bookFolder, row.id);
      refresh();
    } catch (e) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };
  const STATUS_LABEL = {
    pending: t("mosaic.proposalsPending"),
    accepted: t("mosaic.proposalsAccepted"),
    rejected: t("mosaic.proposalsRejected")
  };
  const SOURCE_LABEL = {
    check: t("mosaic.proposalFromCheck"),
    relate: t("mosaic.proposalFromRelate"),
    chat: t("mosaic.proposalFromChat")
  };
  const chapterTitleOf = (id) => (book?.chapters ?? []).find((chapter) => chapter.id === id)?.title ?? "";
  const entityNameOf = (id) => (book?.mosaic?.entities ?? []).find((entity) => entity.id === id)?.name ?? String(id ?? "");
  const timeOf2 = (at) => Number.isFinite(at) ? new Date(at).toLocaleString() : "";
  if (rows === null) return h("div", { className: "st-mosaic-proposals-empty" }, t("label.loading"));
  if (rows.length === 0) return h("div", { className: "st-mosaic-proposals-empty" }, t("mosaic.proposalsEmpty"));
  const picked = rows.find((row) => row.id === pickedId) ?? rows[0];
  return SplitPane({
    listProps: { role: "tablist", "aria-label": t("mosaic.tab.proposals") },
    list: h(
      List,
      null,
      rows.map((row) => {
        const changes = Array.isArray(row.changes) ? row.changes : [];
        return h(
          ListRow,
          {
            key: row.id,
            role: "tab",
            className: "st-mosaic-proposal",
            active: row.id === picked.id,
            "data-testid": `proposal-${row.id}`,
            "data-status": row.status,
            onActivate: () => setPickedId(pickedId === row.id ? "__closed" : row.id)
          },
          h(
            "div",
            { className: "st-mosaic-proposal-head" },
            h("span", { className: "st-mosaic-proposal-count" }, `${changes.length} ${t("mosaic.proposalChanges")}`),
            h("span", { className: "st-mosaic-proposal-status", "data-status": row.status }, STATUS_LABEL[row.status] ?? row.status)
          ),
          h("span", { className: "st-list-row-meta" }, [SOURCE_LABEL[row.source] ?? row.source, chapterTitleOf(row.sourceChapterId), timeOf2(row.at)].filter((part) => part !== "").join(" \xB7 ")),
          (row.evidence ?? []).length === 0 ? null : h("span", { className: "st-list-row-meta" }, row.evidence[0])
        );
      })
    ),
    detailProps: { role: "tabpanel" },
    detail: picked === void 0 ? [h("div", { className: "st-split-detail-body" }, h("p", { className: "st-muted" }, t("mosaic.proposalsEmpty")))] : [
      h(
        "div",
        { className: "st-split-detail-head" },
        h("h3", { className: "st-split-detail-title" }, SOURCE_LABEL[picked.source] ?? picked.source),
        h("span", { className: "st-split-detail-meta" }, STATUS_LABEL[picked.status] ?? picked.status)
      ),
      h(
        "div",
        { className: "st-split-detail-body" },
        h(
          "div",
          { className: "st-mosaic-proposal-meta" },
          [chapterTitleOf(picked.sourceChapterId), timeOf2(picked.at)].filter((part) => part !== "").join(" \xB7 ")
        ),
        (picked.evidence ?? []).length === 0 ? null : h(
          "ul",
          { className: "st-mosaic-proposal-evidence" },
          (picked.evidence ?? []).map((line, i) => h("li", { key: `ev-${i}` }, line))
        ),
        (picked.changes ?? []).length === 0 ? null : h(
          "ul",
          { className: "st-mosaic-proposal-changes" },
          (picked.changes ?? []).map((change, i) => h("li", { key: `c-${i}` }, describeChange(change, entityNameOf)))
        ),
        picked.status === "pending" ? h(
          "div",
          { className: "st-mosaic-proposal-actions" },
          h("button", {
            type: "button",
            className: "st-btn st-btn-ghost",
            "data-testid": `proposal-accept-${picked.id}`,
            disabled: busy,
            onClick: () => answer(picked, "accepted")
          }, t("mosaic.proposalAccept")),
          h("button", {
            type: "button",
            className: "st-btn st-btn-ghost",
            "data-testid": `proposal-reject-${picked.id}`,
            disabled: busy,
            onClick: () => answer(picked, "rejected")
          }, t("mosaic.proposalReject"))
        ) : h(
          "div",
          { className: "st-mosaic-proposal-actions" },
          h("button", {
            type: "button",
            className: "st-btn st-btn-ghost",
            "data-testid": `proposal-delete-${picked.id}`,
            disabled: busy,
            onClick: () => discard(picked)
          }, t("mosaic.proposalDelete"))
        )
      )
    ]
  });
}
function VersionsPage({ t, book, bookFolder, api: api2, onAdoptWritten }) {
  const snap = async () => {
    await api2.snapshot(bookFolder, `${t("label.snapshotLabel")} ${(/* @__PURE__ */ new Date()).toLocaleString()}`);
    const data = await api2.load(bookFolder);
    if (typeof onAdoptWritten === "function") onAdoptWritten({ book: data.book, token: data.token, savedAt: data.savedAt });
  };
  const restore = async (id) => {
    const data = await api2.restore(bookFolder, id);
    if (typeof onAdoptWritten === "function") onAdoptWritten({ book: data.book, token: data.token, savedAt: data.savedAt });
  };
  return h(MosaicPage, {
    title: t("tab.versions"),
    // Snapshot is the page's one action, so it takes the page's one control row like every other
    // board page; it used to sit at the top of the content, which read as a different layout.
    actions: h("button", { type: "button", className: "st-btn", onClick: snap }, t("action.snapshot")),
    content: h(
      List,
      { className: "st-mosaic-versions" },
      [...book.snapshots].reverse().map((s) => h(
        ListRow,
        { key: s.id, className: "st-mosaic-version-row" },
        h(
          "div",
          { className: "st-mosaic-version-text" },
          h("div", { className: "st-list-row-title" }, s.label),
          h("div", { className: "st-list-row-meta" }, new Date(s.at).toLocaleString())
        ),
        h("button", { type: "button", className: "st-btn", onClick: () => restore(s.id) }, t("action.restore"))
      ))
    )
  });
}
function WritingStylesPage({ t, api: api2, bookFolder, book, onNotice }) {
  const boardScope = `story:${book?.id ?? bookFolder ?? ""}`;
  const [, setBoardBusy] = useDockState(boardScope, "mosaicBusy", false);
  const [, setNote] = useDockState(boardScope, "mosaicNote", "");
  const [state, setState] = React.useState(() => Array.isArray(book?.writingStyles) ? { writingStyles: book.writingStyles, activeId: book.activeWritingStyleId ?? "" } : null);
  const [error, setError] = React.useState("");
  const [epoch, setEpoch] = React.useState(0);
  const [pickedId, setPickedId] = React.useState(null);
  useNotice(onNotice, error);
  React.useEffect(() => {
    let cancelled = false;
    api2.writingStyles(bookFolder).then(
      (data) => {
        if (!cancelled) setState({ writingStyles: data?.writingStyles ?? [], activeId: data?.activeId ?? "" });
      },
      (failure) => {
        if (!cancelled) {
          setState({ writingStyles: [], activeId: "" });
          setError(failure?.message ?? String(failure));
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [api2, bookFolder, epoch]);
  const reload = () => setEpoch((n) => n + 1);
  const use = async (id) => {
    setError("");
    try {
      const data = await api2.setWritingStyleActive(bookFolder, id);
      setState({ writingStyles: data?.writingStyles ?? [], activeId: data?.activeId ?? "" });
    } catch (failure) {
      setError(failure?.message ?? String(failure));
    }
  };
  return h(MosaicPage, {
    t,
    title: t("tab.writingStyles"),
    actions: h(WritingStyleNewButton, { t, api: api2, bookFolder, onCreated: reload, setBoardBusy, setNote }),
    content: state === null ? h("div", { className: "st-muted" }, t("label.loading")) : state.writingStyles.length === 0 ? h("div", { className: "st-muted" }, t("mosaic.writingStyle.empty")) : (() => {
      const picked = pickedId === "__closed" ? void 0 : state.writingStyles.find((row) => row.id === pickedId) ?? state.writingStyles[0];
      const active = picked === void 0 ? false : state.activeId === picked.id;
      return SplitPane({
        listProps: { role: "tablist", "aria-label": t("tab.writingStyles") },
        list: h(
          List,
          null,
          state.writingStyles.map((writingStyle) => h(
            ListRow,
            {
              key: writingStyle.id,
              role: "tab",
              active: writingStyle.id === picked.id,
              onActivate: () => setPickedId(pickedId === writingStyle.id ? "__closed" : writingStyle.id)
            },
            h("span", { className: "st-list-row-title" }, writingStyle.name),
            h(
              "span",
              { className: "st-list-row-meta" },
              state.activeId === writingStyle.id ? t("mosaic.writingStyle.active") : t("mosaic.writingStyle.use")
            )
          ))
        ),
        detailProps: { role: "tabpanel" },
        detail: picked === void 0 ? [h("div", { className: "st-split-detail-body" }, h("p", { className: "st-muted" }, t("mosaic.writingStyle.empty")))] : [
          h(
            "div",
            { className: "st-split-detail-head" },
            h("h3", { className: "st-split-detail-title" }, picked.name),
            h("span", { className: "st-split-detail-meta" }, active ? t("mosaic.writingStyle.active") : "")
          ),
          h(
            "div",
            { className: "st-split-detail-body" },
            h("p", { className: "st-writing-style-prompt" }, picked.prompt),
            active ? null : h(
              "div",
              { className: "st-mosaic-proposal-actions" },
              h("button", {
                type: "button",
                className: "st-btn st-btn-primary",
                "data-testid": "writing-style-use",
                onClick: () => use(picked.id)
              }, t("mosaic.writingStyle.use"))
            )
          )
        ]
      });
    })()
  });
}
function WritingStyleNewButton({ t, api: api2, bookFolder, onCreated, setBoardBusy, setNote }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [source, setSource] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const close = () => {
    setOpen(false);
    setError("");
  };
  const generate = async () => {
    if (busy) return;
    setError("");
    if (source.trim() === "") {
      setError(t("mosaic.writingStyle.needSource"));
      return;
    }
    setBusy(true);
    if (typeof setBoardBusy === "function") setBoardBusy(true);
    if (typeof setNote === "function") setNote(t("mosaic.writingStyle.thinking"));
    try {
      setPrompt((await api2.generateWritingStyle(bookFolder, source)).prompt ?? "");
    } catch (failure) {
      setError(failure?.message ?? String(failure));
    } finally {
      if (typeof setNote === "function") setNote("");
      if (typeof setBoardBusy === "function") setBoardBusy(false);
      setBusy(false);
    }
  };
  const readFile = async (file) => {
    if (file === null || file === void 0 || typeof file.text !== "function") return;
    try {
      setSource(await file.text());
    } catch (failure) {
      setError(failure?.message ?? String(failure));
    }
  };
  const submit = async () => {
    if (busy) return;
    setError("");
    if (name.trim() === "") {
      setError(t("mosaic.writingStyle.needName"));
      return;
    }
    if (prompt.trim() === "") {
      setError(t("mosaic.writingStyle.needPrompt"));
      return;
    }
    setBusy(true);
    try {
      await api2.saveWritingStyle(bookFolder, { name, prompt, source });
      close();
      setName("");
      setPrompt("");
      setSource("");
      if (typeof onCreated === "function") onCreated();
    } catch (failure) {
      setError(failure?.message ?? String(failure));
    } finally {
      setBusy(false);
    }
  };
  return h(
    React.Fragment,
    null,
    h("button", {
      type: "button",
      className: "st-btn st-btn-primary",
      "data-testid": "writing-style-new",
      onClick: () => {
        setError("");
        setOpen(true);
      }
    }, t("mosaic.new")),
    open ? h(
      "div",
      {
        className: "st-backdrop",
        role: "presentation",
        onMouseDown: (e) => {
          if (e.target === e.currentTarget) close();
        }
      },
      h(
        "div",
        { className: "st-dialog", role: "dialog", "aria-modal": "true", "aria-label": t("mosaic.writingStyle.new") },
        h("div", { className: "st-dialog-title" }, t("mosaic.writingStyle.new")),
        h(
          "div",
          { className: "st-dialog-body" },
          h(
            "label",
            { className: "st-dialog-field" },
            h("span", { className: "st-dialog-label" }, t("mosaic.writingStyle.name")),
            h("input", {
              className: "st-input",
              "data-testid": "writing-style-name",
              value: name,
              onChange: (e) => setName(e.target.value)
            })
          ),
          h(
            "label",
            { className: "st-dialog-field" },
            h("span", { className: "st-dialog-label" }, t("mosaic.writingStyle.prompt")),
            h("textarea", {
              className: "st-input st-dialog-textarea",
              rows: 6,
              "data-testid": "writing-style-prompt",
              value: prompt,
              onChange: (e) => setPrompt(e.target.value)
            })
          ),
          h(
            "label",
            { className: "st-dialog-field" },
            h("span", { className: "st-dialog-label" }, t("mosaic.writingStyle.source")),
            h("textarea", {
              className: "st-input st-dialog-textarea",
              rows: 4,
              "data-testid": "writing-style-source",
              value: source,
              onChange: (e) => setSource(e.target.value)
            }),
            h(
              "div",
              { className: "st-writing-style-actions" },
              h(FileButton, {
                label: t("mosaic.writingStyle.file"),
                accept: ".txt,.md,text/plain",
                testId: "writing-style-source-file",
                onFile: readFile
              }),
              h("button", {
                type: "button",
                className: "st-btn st-writing-style-generate",
                disabled: busy,
                "data-testid": "writing-style-generate",
                onClick: generate
              }, busy ? "\u2026" : t("mosaic.writingStyle.generate"))
            )
          ),
          error === "" ? null : h("p", { className: "st-dialog-hint st-dialog-error" }, error)
        ),
        h(
          "div",
          { className: "st-dialog-actions" },
          h("button", { type: "button", className: "st-btn", onClick: close }, t("action.cancel")),
          h("button", {
            type: "button",
            className: "st-btn st-btn-primary",
            disabled: busy,
            "data-testid": "writing-style-save",
            onClick: submit
          }, t("mosaic.writingStyle.save"))
        )
      )
    ) : null
  );
}
function OverviewPage({ t, book, bookFolder, api: api2, onAdoptWritten, onNotice, onSummary }) {
  const [busy, setBusy] = React.useState(false);
  const [issues, setIssues] = React.useState(null);
  const [auditError, setAuditError] = React.useState("");
  const [pickedId, setPickedId] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);
  useNotice(onNotice, auditError);
  const refresh = async () => {
    setBusy(true);
    try {
      const data = await api2.overview(bookFolder, true);
      if (typeof onAdoptWritten === "function") {
        onAdoptWritten({
          merge: (prevBook) => prevBook === null || prevBook === void 0 ? prevBook : {
            ...prevBook,
            overview: data.book?.overview ?? data.overview ?? prevBook.overview
          },
          token: data.token,
          savedAt: data.savedAt
        });
      }
    } finally {
      setBusy(false);
    }
  };
  const runConsistency = async () => {
    setAuditError("");
    try {
      setIssues((await api2.consistency(bookFolder)).issues ?? []);
      setDialog("consistency");
    } catch (failure) {
      setAuditError(failure.message);
    }
  };
  const [manuscript, setManuscript] = React.useState(null);
  const runManuscript = async () => {
    setAuditError("");
    try {
      setManuscript((await api2.manuscript(bookFolder)).markdown ?? "");
      setDialog("manuscript");
    } catch (failure) {
      setAuditError(failure.message);
    }
  };
  if (book === null || book === void 0) {
    return h("div", { className: "st-scroll st-muted" }, t("label.loading"));
  }
  const chapters = book.chapters ?? [];
  const selected = chapters.find((chapter) => chapter.id === pickedId) ?? chapters[0];
  const chapterOverview = selected === void 0 ? void 0 : book.overview.chapters[selected.id];
  const finals = chapters.filter((c) => (c.text ?? "") !== "").length;
  const total = chapters.length;
  const textOf = (chapter) => typeof chapter?.text === "string" ? chapter.text : "";
  const summaryOf = (chapter) => typeof chapter?.summary === "string" ? chapter.summary : "";
  const issueKind = (kind) => t(`consistency.kind.${kind}`);
  return h(MosaicPage, {
    title: t("tab.overview"),
    // The progress read-out and the refresh control sit in the page's ONE control row, like every
    // other board page's actions. They used to open the content, which made the overview the only
    // page whose toolbar was inside its body.
    actions: h(
      "div",
      { className: "st-overview-actions" },
      // The cast count comes from the board: there is no separate character list any more.
      h("span", { className: "st-muted" }, t("label.overviewProgress", {
        c: total,
        f: finals,
        t: total,
        p: (book.mosaic?.entities ?? []).filter((e) => e.kind === "character").length
      })),
      h(
        "button",
        { type: "button", className: "st-btn", disabled: busy, onClick: refresh },
        busy ? "\u2026" : t("action.refresh")
      )
    ),
    content: h(
      "div",
      { className: "st-overview" },
      SplitPane({
        listProps: { role: "tablist", "aria-label": t("tab.overview") },
        list: h(
          List,
          null,
          chapters.length === 0 ? h("p", { className: "st-muted" }, t("mosaic.chapterEmpty")) : chapters.map((chapter) => h(
            ListRow,
            {
              key: chapter.id,
              role: "tab",
              active: chapter.id === selected?.id,
              "aria-selected": chapter.id === selected?.id ? "true" : "false",
              onActivate: () => setPickedId(chapter.id)
            },
            h("span", { className: "st-list-row-title" }, chapter.title || t("mosaic.untitled")),
            h(
              "span",
              { className: "st-list-row-meta" },
              t("label.charCount", { n: textOf(chapter).length })
            )
          ))
        ),
        detailProps: { role: "tabpanel" },
        detail: [
          selected === void 0 ? null : h(
            "div",
            { className: "st-split-detail-head" },
            h("h3", { className: "st-split-detail-title" }, selected.title || t("mosaic.untitled")),
            h(
              "span",
              { className: "st-split-detail-meta" },
              t("label.charCount", { n: textOf(selected).length })
            )
          ),
          h(
            "div",
            { className: "st-split-detail-body" },
            selected === void 0 ? h("p", { className: "st-muted" }, t("mosaic.chapterEmpty")) : h(
              React.Fragment,
              null,
              h(
                "label",
                { className: "st-overview-field" },
                h("span", { className: "st-overview-label" }, t("mosaic.summaryLabel")),
                h("textarea", {
                  className: "st-overview-summary",
                  value: summaryOf(selected),
                  placeholder: t("mosaic.summaryPlaceholder"),
                  onChange: (e) => {
                    if (typeof onSummary === "function") onSummary(selected.id, e.target.value);
                  }
                })
              ),
              h(
                "div",
                { className: "st-overview-field" },
                h("span", { className: "st-overview-label" }, t("mosaic.overviewLabel")),
                chapterOverview !== void 0 ? h("p", { className: "st-overview-text" }, chapterOverview.text) : h("p", { className: "st-overview-text st-muted" }, t("mosaic.overviewEmpty"))
              ),
              h(
                "div",
                { className: "st-overview-field" },
                h("span", { className: "st-overview-label" }, t("mosaic.bodyLabel")),
                textOf(selected) === "" ? h("p", { className: "st-overview-text st-muted" }, t("mosaic.bodyEmpty")) : h("div", { className: "st-overview-body" }, textOf(selected))
              )
            )
          )
        ]
      }),
      h(
        "div",
        { className: "st-overview-global" },
        h("div", { className: "st-overview-label" }, t("label.overviewGlobal")),
        book.overview.global ? h("p", { className: "st-overview-text" }, book.overview.global.text) : h("p", { className: "st-overview-text st-muted" }, t("mosaic.overviewEmpty"))
      ),
      h(
        "div",
        { className: "st-row st-gap-over-section" },
        h("button", { type: "button", className: "st-btn st-btn-primary", onClick: runManuscript }, t("action.manuscript")),
        h("button", { type: "button", className: "st-btn", onClick: runConsistency }, t("action.consistency"))
      ),
      dialog === "manuscript" ? h(
        Dialog,
        {
          t,
          title: t("action.manuscript"),
          onClose: () => setDialog(null),
          size: "wide"
        },
        manuscript === "" || manuscript === null ? h("div", { className: "st-muted" }, t("label.emptyManuscript")) : h("div", { className: "st-manuscript" }, ...renderManuscript(manuscript, t))
      ) : null,
      dialog === "consistency" && issues !== null ? h(
        Dialog,
        {
          t,
          title: t("label.consistencyReport"),
          onClose: () => setDialog(null),
          size: "medium"
        },
        issues.length === 0 ? h("div", null, t("label.noIssues")) : h(
          React.Fragment,
          null,
          issues.map((issue, index) => h(
            "div",
            { key: index, className: "st-issue" },
            h("span", { className: "st-badge" }, issueKind(issue.kind)),
            h("span", null, `${issue.where ? `${issue.where}\uFF1A` : ""}${issue.problem}`),
            issue.evidence ? h("div", { className: "st-muted" }, issue.evidence) : null
          ))
        )
      ) : null
    )
  });
}

// src/client/mosaic/index.js
var PAGE_EXIT_MS = 160;
function MosaicSheet({
  t,
  book,
  updateBook,
  onSummary,
  onClose,
  mosaicProposal,
  onProposal,
  api: api2,
  bookFolder,
  chapter,
  onFlush,
  onAdoptWritten,
  // The merged reference pages: same props the drawers passed, so each page keeps its behaviour.
  onNotice,
  tab: initialTab,
  onTab,
  closing: overlayClosing = false
}) {
  const [tab, setTab] = React.useState(initialTab ?? "relations");
  React.useEffect(() => {
    if (typeof onTab === "function") onTab(tab);
  }, [tab]);
  const mosaic = book?.mosaic ?? emptyBoard();
  const actions = useBoardActions({
    api: api2,
    bookFolder,
    book,
    updateBook,
    adoptWritten: onAdoptWritten,
    flushSave: onFlush,
    onNotice,
    t
  });
  const {
    portraitOf,
    pictureOf,
    portraitBusyId,
    portraitError,
    generatePortrait,
    patchCard,
    removeCard,
    applyChanges,
    createCard
  } = actions;
  const [picked, setPicked] = React.useState(null);
  const [inspecting, setInspecting] = React.useState(null);
  const [pageClosing, setPageClosing] = React.useState(false);
  const closePage = () => {
    if (inspecting === null || pageClosing) return;
    setPageClosing(true);
    globalThis.setTimeout(() => {
      setInspecting(null);
      setPageClosing(false);
    }, PAGE_EXIT_MS);
  };
  const inspect = (entity) => {
    setPageClosing(false);
    setInspecting(entity);
  };
  const [dooming, setDooming] = React.useState(null);
  const confirmRemoveCard = (entity) => {
    removeCard(entity.id);
    if (inspecting?.id === entity.id) setInspecting(null);
    if (picked?.kind === "entity" && picked.entity.id === entity.id) setPicked(null);
    setDooming(null);
  };
  const [decisions, setDecisions] = React.useState({});
  const decide = (indexOrReset, verdict) => {
    if (indexOrReset === "reset") {
      setDecisions({});
      return;
    }
    setDecisions((prev) => ({ ...prev, [indexOrReset]: verdict }));
  };
  React.useEffect(() => {
    if (typeof document === "undefined" || typeof document.addEventListener !== "function") return void 0;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const pendingCount = mosaicProposal !== null && mosaicProposal !== void 0 ? Array.isArray(mosaicProposal.changes) ? mosaicProposal.changes.filter((_, i) => decisions[i] === void 0 || decisions[i] === "undecided").length : 0 : 0;
  return h(
    "div",
    {
      className: `st-mosaic-backdrop${overlayClosing ? " st-closing" : ""}`,
      onMouseDown: (e) => {
        if (e.target === e.currentTarget) onClose();
      }
    },
    h(
      "section",
      { className: "st-mosaic-sheet", role: "dialog", "aria-label": t("mosaic.title") },
      h(
        "div",
        {
          className: "st-mosaic-body",
          // A click on EMPTY SPACE puts the detail page away — the same gesture that dismisses
          // the popover on the canvas. A click on a tab, a button or a card stays theirs.
          onClick: (e) => {
            if (inspecting === null) return;
            const target = e.target;
            if (target !== e.currentTarget && !(typeof target?.classList?.contains === "function" && (target.classList.contains("st-mosaic-canvas") || target.classList.contains("st-mosaic-body")))) return;
            closePage();
          }
        },
        tab === "relations" ? h(MosaicReviewPage, {
          t,
          api: api2,
          bookFolder,
          book,
          chapter,
          mosaicProposal,
          onProposal,
          updateBook,
          decisions,
          onDecide: decide,
          onApplyChanges: applyChanges,
          onCreate: createCard,
          onPatchEntity: patchCard,
          picked,
          onPick: setPicked,
          onInspect: inspect,
          mosaic,
          // The graph's popover generates portraits from the SAME state as the gallery's page:
          // one generation at a time, one cache of read pictures.
          onPortrait: generatePortrait,
          portraitOf,
          portraitBusyId,
          portraitError,
          onNotice
        }) : null,
        tab === "world" ? h(MosaicPage, {
          t,
          title: t("mosaic.tab.world"),
          // 世界观 entries are places, factions and events; 地点 is the kind a writer reaches
          // for first, and the picker lets them choose any of the five before naming it.
          actions: h(MosaicNewCard, { t, onCreate: createCard, onCreated: inspect, defaultKind: "place" }),
          content: h(MosaicCards, {
            t,
            mosaic,
            onInspect: inspect,
            onEdit: inspect,
            onDelete: setDooming,
            pictureOf
          })
        }) : null,
        tab === "cast" ? h(MosaicPage, {
          t,
          title: t("mosaic.tab.cast"),
          actions: h(MosaicNewCard, { t, onCreate: createCard, onCreated: inspect, defaultKind: "character" }),
          // The gallery is the page: a card opens its own detail page (inspect), which is
          // where a field is edited. An editing form under the gallery showed every character
          // twice over.
          content: h(MosaicCast, {
            t,
            mosaic,
            onInspect: inspect,
            onEdit: inspect,
            onDelete: setDooming,
            pictureOf
          })
        }) : null,
        tab === "items" ? h(MosaicPage, {
          t,
          title: t("mosaic.tab.items"),
          actions: h(MosaicNewCard, { t, onCreate: createCard, onCreated: inspect, defaultKind: "item" }),
          content: h(MosaicCards, {
            t,
            mosaic,
            itemsOnly: true,
            onInspect: inspect,
            onEdit: inspect,
            onDelete: setDooming,
            pictureOf
          })
        }) : null,
        tab === "proposals" ? h(MosaicPage, {
          t,
          title: t("mosaic.tab.proposals"),
          actions: null,
          content: h(ProposalsPage, {
            t,
            api: api2,
            book,
            bookFolder,
            onApply: applyChanges,
            onNotice
            // No reload: the board already repainted from the apply's own answer.
          })
        }) : null,
        tab === "overview" ? h(OverviewPage, {
          t,
          book,
          bookFolder,
          api: api2,
          onNotice,
          onAdoptWritten,
          onSummary
        }) : null,
        tab === "writingStyle" ? h(WritingStylesPage, { t, api: api2, bookFolder, book, onNotice }) : null,
        tab === "versions" ? h(VersionsPage, { t, book, bookFolder, api: api2, onAdoptWritten }) : null
      ),
      // The delete confirmation imports the shared dialog rather than a bespoke one: the shelf
      // asks the same question in the same shape, and one dialog is why the two ask it
      // identically.
      dooming === null ? null : h(ConfirmDialog, {
        t,
        title: t("mosaic.deleteCardTitle", { name: dooming.name }),
        confirmLabel: t("action.delete"),
        cancelLabel: t("action.cancel"),
        onConfirm: () => confirmRemoveCard(dooming),
        onCancel: () => setDooming(null)
      }),
      // The detail page slides in from the left INSIDE the sheet: the board stays where the
      // writer left it, and closing this returns to it. It reads the entity from the board by
      // id, so an edit made from here shows up here and on the card underneath.
      inspecting === null ? null : h(MosaicEntityPage, {
        t,
        entity: (mosaic?.entities ?? []).find((e) => e.id === inspecting.id) ?? inspecting,
        mosaic,
        closing: pageClosing,
        onClose: closePage,
        onPatchEntity: patchCard,
        onPortrait: generatePortrait,
        portraitOf,
        portraitBusy: portraitBusyId !== null && portraitBusyId === inspecting?.id,
        portraitError
      }),
      h(
        "nav",
        { className: "st-mosaic-tabs" },
        MOSAIC_TABS.map(([key, label]) => h(
          "button",
          {
            key,
            type: "button",
            className: "st-mosaic-tab",
            "data-active": tab === key,
            onClick: () => setTab(key)
          },
          t(label),
          // The review it owes is counted on the relations bookmark: a writer who closed the
          // sheet mid-review sees the number still outstanding without opening anything.
          key === "relations" && pendingCount > 0 ? h("span", { className: "st-mosaic-tab-badge" }, String(pendingCount)) : null
        ))
      )
    )
  );
}
function MosaicEntityPage({ t, entity, mosaic, onClose, closing, onPatchEntity, onPortrait, portraitOf, portraitBusy }) {
  const [editing, setEditing] = React.useState(false);
  const patch = (fields) => {
    if (typeof onPatchEntity === "function") onPatchEntity(entity.id, fields);
  };
  const picture = typeof portraitOf === "function" ? portraitOf(entity) : null;
  const busy = portraitBusy === true;
  const [statusDraft, setStatusDraft] = React.useState("");
  const [tagDraft, setTagDraft] = React.useState("");
  const [customLabel, setCustomLabel] = React.useState("");
  const [customValue, setCustomValue] = React.useState("");
  React.useEffect(() => {
    setStatusDraft("");
    setTagDraft("");
    setCustomLabel("");
    setCustomValue("");
  }, [entity.id]);
  const addStatus = () => {
    const label = statusDraft.trim();
    if (label === "") return;
    setStatusDraft("");
    if ((entity.statuses ?? []).some((each) => each.label === label)) return;
    patch({ statuses: [...entity.statuses ?? [], { id: rowId("s"), label }] });
  };
  const addTag = () => {
    const tag = tagDraft.trim();
    if (tag === "") return;
    setTagDraft("");
    if ((entity.tags ?? []).includes(tag)) return;
    patch({ tags: [...entity.tags ?? [], tag] });
  };
  const addCustom = () => {
    const label = customLabel.trim();
    if (label === "") return;
    setCustomLabel("");
    setCustomValue("");
    const rows = entity.custom ?? [];
    const held = rows.find((row2) => row2.label === label);
    patch({
      custom: held === void 0 ? [...rows, { id: rowId("c"), label, value: customValue.trim() }] : rows.map((row2) => row2.label === label ? { ...row2, value: customValue.trim() } : row2)
    });
  };
  const removeCustom = (label) => patch({ custom: (entity.custom ?? []).filter((row2) => row2.label !== label) });
  const entities = Array.isArray(mosaic.entities) ? mosaic.entities : [];
  const byId = new Map(entities.map((e) => [e.id, e]));
  const edges = Array.isArray(mosaic.edges) ? mosaic.edges : [];
  const outgoing = edges.filter((e) => e.from === entity.id && e.retired !== true);
  const incoming = edges.filter((e) => e.to === entity.id && e.retired !== true);
  const retired = edges.filter((e) => (e.from === entity.id || e.to === entity.id) && e.retired === true);
  const nameOf = (id) => byId.get(id)?.name ?? t("mosaic.untitled");
  const row = (label, value, field) => {
    const text = String(value ?? "");
    if (field === void 0) {
      return h(
        "div",
        { className: "st-mosaic-page-row" },
        h("span", { className: "st-mosaic-page-label" }, label),
        h("span", { className: "st-mosaic-page-value" }, text)
      );
    }
    return h(
      "div",
      { className: "st-mosaic-page-row" },
      h("span", { className: "st-mosaic-page-label" }, label),
      editing ? h("textarea", {
        className: "st-mosaic-field st-mosaic-field-area",
        "data-testid": field.testId,
        value: text,
        placeholder: label,
        rows: 3,
        onChange: (e) => patch({ [field.key]: e.target.value })
      }) : h("span", { className: "st-mosaic-page-value" }, text)
    );
  };
  const textRow = (label, value, field) => {
    const text = String(value ?? "");
    return h(
      "div",
      { className: "st-mosaic-page-row" },
      h("span", { className: "st-mosaic-page-label" }, label),
      editing ? h("input", {
        type: "text",
        className: "st-mosaic-field",
        "data-testid": field.testId,
        value: text,
        placeholder: label,
        onChange: (e) => patch({ [field.key]: e.target.value })
      }) : h("span", { className: "st-mosaic-page-value" }, text)
    );
  };
  const LONG_FIELDS = /* @__PURE__ */ new Set(["appearance", "personality", "motivation", "arc", "atmosphere", "purpose", "significance", "consequence"]);
  const renderField = (field) => {
    const label = fieldLabel(field, t);
    const value = fieldValue(entity, field, nameOf);
    if (isReferenceField(field)) return row(label, value);
    return LONG_FIELDS.has(field) ? row(label, value, { key: field, testId: `mosaic-page-${field}` }) : textRow(label, value, { key: field, testId: `mosaic-page-${field}` });
  };
  const allFields = kindFields(entity.kind);
  const briefRows = allFields.filter((field) => !LONG_FIELDS.has(field)).map(renderField);
  const longRows = allFields.filter((field) => LONG_FIELDS.has(field)).map(renderField);
  const chipBand = (labelText, chips, addField) => h(
    "div",
    { className: "st-mosaic-page-row" },
    h("span", { className: "st-mosaic-page-label" }, labelText),
    h(
      "div",
      { className: "st-mosaic-chip-row" },
      chips.map((chip) => h("span", {
        key: chip.key,
        className: `st-mosaic-chip${editing ? " st-mosaic-chip-toggle" : ""}`,
        "data-testid": editing ? addField.chipTestid : void 0,
        title: editing ? addField.removeTitle : void 0,
        onClick: editing ? chip.remove : void 0
      }, chip.label)),
      editing ? h("input", {
        type: "text",
        className: "st-mosaic-status-add",
        "data-testid": addField.addTestid,
        value: addField.draft,
        placeholder: addField.placeholder,
        onChange: (e) => addField.setDraft(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addField.add();
          }
        }
      }) : null
    )
  );
  const edgeRow = (edge, otherId, arrow) => h(
    "div",
    { key: edge.id, className: "st-mosaic-page-edge" },
    h("span", { className: "st-mosaic-page-edge-other" }, nameOf(otherId)),
    h("span", { className: "st-mosaic-page-edge-kind" }, `${arrow}${edge.truth.kind || t("mosaic.untitled")}`),
    edge.truth.note !== "" ? h("span", { className: "st-mosaic-page-edge-note" }, edge.truth.note) : null
  );
  return h(
    "aside",
    {
      className: "st-mosaic-page",
      role: "dialog",
      "aria-label": entity.name,
      "data-testid": "mosaic-entity-page",
      // The exit animation is chosen by this attribute: one element, two directions.
      "data-closing": closing ? "true" : "false"
    },
    h(
      "div",
      { className: "st-mosaic-page-head" },
      editing ? h("input", {
        type: "text",
        className: "st-mosaic-field st-mosaic-field-title",
        "data-testid": "mosaic-page-name",
        value: entity.name ?? "",
        "aria-label": t("mosaic.name"),
        onChange: (e) => patch({ name: e.target.value })
      }) : h("h3", { className: "st-mosaic-page-title" }, entity.name),
      h("span", { className: "st-spacer" }),
      h("button", {
        type: "button",
        className: "st-btn st-btn-ghost",
        "data-testid": "mosaic-entity-edit",
        "data-editing": editing ? "true" : "false",
        title: editing ? t("action.done") : t("mosaic.editEntry"),
        onClick: () => setEditing((was) => !was)
      }, editing ? t("action.done") : t("mosaic.editEntry")),
      h("button", {
        type: "button",
        className: "st-btn st-btn-ghost",
        title: t("action.close"),
        "aria-label": t("action.close"),
        onClick: onClose
      }, "\u2715")
    ),
    h(
      "div",
      { className: "st-mosaic-page-scroll" },
      // The summary band: picture on the left, the facts that identify this entry on the right.
      // No name here — the title row already names the entry, and a second copy two lines below
      // was the same words set twice.
      h(
        "div",
        { className: "st-mosaic-page-summary" },
        h(
          "div",
          { className: "st-mosaic-page-image" },
          h(DetailPortrait, { t, entity, picture, busy, onPortrait, editable: editing })
        ),
        h(
          "div",
          { className: "st-mosaic-page-facts" },
          // The category and every short, one-line fact sit beside the picture. They are identity,
          // not prose, and a grid of them is what makes a person's page readable at a glance.
          row(t("mosaic.field.kind"), kindLabel(entity.kind, t)),
          ...briefRows
        )
      ),
      // The long-form half: every remaining field as its own labelled section, separated by a
      // hairline. Keeping the chips and the prose out of the identity band is what stops the top
      // of the page from turning into a wall of mixed controls.
      h(
        "div",
        { className: "st-mosaic-page-body" },
        // The one-line summary leads the page body; it is the sentence the rest of the fields
        // support. It is editable in place, and an empty one leaves a blank row to fill.
        row(t("mosaic.newSummary"), entity.summary, { key: "summary", testId: "mosaic-page-summary" }),
        ...longRows,
        // The long prose is the part you read, not scan.
        row(t("mosaic.newDescription"), entity.description, { key: "description", testId: "mosaic-page-description" }),
        // Statuses and tags are standard fields too, so their rows stay put when empty. The add
        // input appears in edit mode; in read mode the blank row says "none recorded yet".
        chipBand(
          t("mosaic.statuses"),
          (entity.statuses ?? []).map((st) => ({
            key: st.id,
            label: st.label,
            remove: () => patch({ statuses: (entity.statuses ?? []).filter((each) => each.label !== st.label) })
          })),
          {
            chipTestid: "mosaic-page-status-chip",
            addTestid: "mosaic-page-status-add",
            removeTitle: t("mosaic.removeHint"),
            draft: statusDraft,
            setDraft: setStatusDraft,
            placeholder: t("mosaic.statusAddPlaceholder"),
            add: addStatus
          }
        ),
        chipBand(
          t("mosaic.field.tags"),
          (entity.tags ?? []).map((tag) => ({
            key: tag,
            label: tag,
            remove: () => patch({ tags: (entity.tags ?? []).filter((each) => each !== tag) })
          })),
          {
            chipTestid: "mosaic-page-tag-chip",
            addTestid: "mosaic-page-tag-add",
            removeTitle: t("mosaic.removeHint"),
            draft: tagDraft,
            setDraft: setTagDraft,
            placeholder: t("mosaic.tagAddPlaceholder"),
            add: addTag
          }
        ),
        // Custom fields: whatever the five kinds' presets do not cover — "血型: O" without
        // the schema knowing about it. Like the other fields the row is always there; an empty
        // one is where the writer adds the first pair.
        h(
          "div",
          { className: "st-mosaic-page-row" },
          h("span", { className: "st-mosaic-page-label" }, t("mosaic.custom")),
          h(
            "div",
            { className: "st-mosaic-chip-row" },
            (entity.custom ?? []).map((customRow) => h("span", {
              key: customRow.id,
              className: `st-mosaic-chip${editing ? " st-mosaic-chip-toggle" : ""}`,
              "data-testid": editing ? "mosaic-page-custom-chip" : void 0,
              title: editing ? t("mosaic.removeHint") : void 0,
              onClick: editing ? () => removeCustom(customRow.label) : void 0
            }, `${customRow.label}\uFF1A${customRow.value}`)),
            editing ? h(
              React.Fragment,
              null,
              h("input", {
                type: "text",
                className: "st-mosaic-status-add",
                "data-testid": "mosaic-page-custom-label",
                value: customLabel,
                placeholder: t("mosaic.customLabelPlaceholder"),
                onChange: (e) => setCustomLabel(e.target.value)
              }),
              h("input", {
                type: "text",
                className: "st-mosaic-status-add",
                "data-testid": "mosaic-page-custom-value",
                value: customValue,
                placeholder: t("mosaic.customValuePlaceholder"),
                onChange: (e) => setCustomValue(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }
              })
            ) : null
          )
        ),
        // Relations come last: they are facts about this entry and the rest of the board, and
        // they belong below the entry's own description.
        outgoing.length === 0 && incoming.length === 0 ? h(
          "div",
          { className: "st-mosaic-page-row" },
          h("span", { className: "st-mosaic-page-label" }, t("mosaic.field.relations")),
          h("span", { className: "st-mosaic-page-value" }, t("label.noRelationships"))
        ) : h(
          "div",
          { className: "st-mosaic-page-row" },
          h("span", { className: "st-mosaic-page-label" }, t("mosaic.field.relations")),
          h(
            "div",
            { className: "st-mosaic-page-edges" },
            outgoing.map((edge) => edgeRow(edge, edge.to, "\u2192 ")),
            incoming.map((edge) => edgeRow(edge, edge.from, "\u2190 "))
          )
        ),
        retired.length === 0 ? null : h(
          "div",
          { className: "st-mosaic-page-row" },
          h("span", { className: "st-mosaic-page-label" }, t("mosaic.field.retired")),
          h(
            "div",
            { className: "st-mosaic-page-edges" },
            retired.map((edge) => edgeRow(edge, edge.from === entity.id ? edge.to : edge.from, "\xB7 "))
          )
        )
      )
    )
  );
}

// src/client/api.js
async function fetchTransport(path, body) {
  let response;
  try {
    response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  } catch (error) {
    throw new Error(`\u65E0\u6CD5\u8FDE\u63A5\u6545\u4E8B\u670D\u52A1\uFF08${path}\uFF09\uFF1A${error?.message ?? "\u7F51\u7EDC\u9519\u8BEF"}`, { cause: error });
  }
  if (!response.ok) throw new Error(`${path} failed: HTTP ${response.status}`);
  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`${path} \u8FD4\u56DE\u4E86\u65E0\u6CD5\u89E3\u6790\u7684\u54CD\u5E94`, { cause: error });
  }
  if (data.ok !== true) throw new Error(data.error || `${path} failed`);
  return data;
}
function createStoryApi(transport) {
  if (typeof transport !== "function") throw new TypeError("story api needs a transport function");
  const call = (path, body) => transport(path, body);
  return {
    // bookFolder selects which manuscript; undefined means the workspace's original book.
    books: () => call("/api/story.books", {}),
    createBook: (title) => call("/api/story.createBook", { title }),
    openDirectory: (path) => call("/api/story.openDirectory", { path }),
    deleteBook: (folder, removeFiles) => call("/api/story.deleteBook", { bookFolder: folder, removeFiles }),
    renameBook: (folder, title) => call("/api/story.renameBook", { bookFolder: folder, title }),
    load: (bookFolder) => call("/api/story.load", { bookFolder }),
    save: (book, token, bookFolder) => call("/api/story.save", { book, token, bookFolder }),
    // The host takes (chapterId, text, instruction): the unit of an AI edit is the SELECTED
    // TEXT, not a paragraph. Passing the old paragraphId slot left `text` empty and pushed the
    // selection into `instruction`, so the model was asked to rewrite nothing and answered with
    // the instruction glued to the passage.
    // `role` names whose model does the work. It is omitted for the editor's own actions, which use
    // the `suggest` model, and is 'chat' when the question came in through the composer: the
    // writer configured a model for the chat because it is the one that knows the story, and an
    // edit that arrives through that conversation should not be handed to a different model.
    suggest: (bookFolder, chapterId, text, instruction, role, before, after) => call("/api/story.suggest", { bookFolder, chapterId, text, instruction, role, before, after }),
    overview: (bookFolder, refresh) => call("/api/story.overview", { bookFolder, refresh }),
    snapshot: (bookFolder, label) => call("/api/story.snapshot", { bookFolder, label }),
    restore: (bookFolder, id) => call("/api/story.restore", { bookFolder, id }),
    // The caret travels with the question: without it the chat could only answer in the
    // abstract, and a request to "write from here" had no "here".
    chat: (bookFolder, history, message, chapterId, before, after, selection) => call("/api/story.chat", { bookFolder, history, message, chapterId, before, after, selection }),
    applyProposal: (bookFolder, proposal) => call("/api/story.applyProposal", { bookFolder, proposal }),
    // `before` is the text up to the caret and `after` the text following it. Sending the whole
    // chapter as `text` made the model continue from the END even when the writer was working
    // in the middle of a paragraph.
    continue: (bookFolder, chapterId, text, before, after, role) => call("/api/story.continue", { bookFolder, chapterId, text, before, after, role }),
    // 流派: saved style prompts, which one is active, and generating a prompt from a sample.
    writingStyles: (bookFolder) => call("/api/story.writingStyles", { bookFolder }),
    saveWritingStyle: (bookFolder, fields) => call("/api/story.writingStyle.save", { bookFolder, ...fields }),
    setWritingStyleActive: (bookFolder, id) => call("/api/story.writingStyle.setActive", { bookFolder, id }),
    deleteWritingStyle: (bookFolder, id) => call("/api/story.writingStyle.delete", { bookFolder, id }),
    generateWritingStyle: (bookFolder, source) => call("/api/story.writingStyle.generate", { bookFolder, source }),
    consistency: (bookFolder) => call("/api/story.consistency", { bookFolder }),
    manuscript: (bookFolder) => call("/api/story.manuscript", { bookFolder }),
    // Which model the panel's own actions run on, for the status bar.
    meta: () => call("/api/story.meta", {}),
    // Where the books live. One setting decides it; changing it does not move any files.
    setLibrary: (path) => call("/api/story.setLibrary", { path }),
    // The model page: what each role resolves to, and where the writer pinned one.
    models: () => call("/api/story.models", {}),
    // Every model the host can route to. The page's picker is built from this, not from a
    // client service: what the host will accept is what the page offers.
    catalog: () => call("/api/story.catalog", {}),
    // The reasoning levels one model offers, for the axis.
    efforts: (provider, model) => call("/api/story.efforts", { provider, model }),
    setModel: (role, selection) => call("/api/story.setModel", { role, selection }),
    // A copy-edit of one section, and a blunt grammar critique of the prose by the caret.
    review: (bookFolder, chapterId, text) => call("/api/story.review", { bookFolder, chapterId, text }),
    critique: (bookFolder, chapterId, before, after, text, direction) => call("/api/story.critique", { bookFolder, chapterId, before, after, text, direction }),
    // The mosaic board: chapter consistency check, board Q&A, and reading relations out of the
    // cards. The sheet calls these on the relations page.
    mosaicCheck: (bookFolder, chapterId, text) => call("/api/story.mosaic.check", { bookFolder, chapterId, text }),
    mosaicAsk: (bookFolder, question) => call("/api/story.mosaic.ask", { bookFolder, question }),
    // Reads the CARDS, not a chapter: the writer described who knows whom in the summaries and
    // expects the lines to appear. The cards travel with the request because the panel is the
    // one holding the board the writer is looking at; the host re-reading the file would answer
    // about a possibly older (or missing) copy of it.
    mosaicRelate: (cards, edges, bookFolder) => call("/api/story.mosaic.relate", { cards, edges, bookFolder }),
    // Stored proposals: the page that lists what the model suggested and nobody answered yet.
    proposals: (bookFolder) => call("/api/story.proposals", { bookFolder }),
    setProposalStatus: (bookFolder, id, status) => call("/api/story.proposal.setStatus", { bookFolder, id, status }),
    deleteProposal: (bookFolder, id) => call("/api/story.proposal.delete", { bookFolder, id }),
    // The write for the changes the writer accepted, one call for the whole batch. The host
    // answers with the board it actually wrote, so the sheet can repaint from it.
    // proposalId is optional and only there so the host can mark a stored proposal answered in
    // the same write that applied it.
    mosaicApply: (bookFolder, changes, proposalId, provenance) => call("/api/story.mosaic.apply", { bookFolder, changes, proposalId, provenance }),
    // One portrait per card. The entity travels whole because the prompt is built from the fields
    // the writer has just been editing, not from what is on disk.
    mosaicPortrait: (bookFolder, entity, language) => call("/api/story.mosaic.portrait", { bookFolder, entity, language }),
    // The stored picture, read back by the relative path the board recorded. The host's route
    // surface is POST-only, so there is no URL to point an img at.
    mosaicPortraitRead: (bookFolder, path) => call("/api/story.mosaic.portrait.read", { bookFolder, path }),
    // The portrait settings live beside the role models in one file, so they share one write.
    setImage: (image) => call("/api/story.setImage", { image }),
    imageModels: (image) => call("/api/story.imageModels", image ?? {}),
    providerTest: (provider) => call("/api/story.provider.test", provider),
    // The answer history, kept in the book's own `answers/` folder rather than in book.json.
    // `limit` is passed because the panel shows the newest few; the host sorts before slicing.
    answers: (bookFolder, limit) => call("/api/story.answers", { bookFolder, limit }),
    saveAnswer: (bookFolder, answer) => call("/api/story.answer.save", { bookFolder, answer }),
    deleteAnswer: (bookFolder, id) => call("/api/story.answer.delete", { bookFolder, id }),
    // The writer's own OpenAI-compatible providers: interface, key and model ids.
    providers: () => call("/api/story.providers", {}),
    providerModels: ({ id, baseURL, apiKey }) => call("/api/story.provider.models", { id, baseURL, apiKey }),
    saveProvider: (provider) => call("/api/story.provider.save", { provider }),
    deleteProvider: (id) => call("/api/story.provider.delete", { id }),
    // The system event log: every model call's and picture request's outcome, newest last.
    events: () => call("/api/story.events", {})
  };
}
var api = createStoryApi(fetchTransport);

// src/client/panel/overlays.js
var EVENT_COLUMNS = [
  { key: "time", label: "log.time", width: 96 },
  { key: "name", label: "log.name", width: 190 },
  { key: "detail", label: "log.detail", width: null }
];
function eventType(event) {
  return String(event.action ?? event.type ?? "model");
}
function eventName(event, t) {
  const name = t(`log.op.${event.action ?? event.type ?? "model"}`);
  const what = event.title ?? event.folder ?? event.model ?? event.path ?? "";
  return what === "" ? name : `${name} ${what}`;
}
function eventDetail(event) {
  if (event.ok !== true) {
    const code = event.error ?? "";
    return `\u2717 ${code} \xB7 ${event.ms ?? "?"}ms`;
  }
  const parts = ["\u2713"];
  if (event.truncated === true) parts.push("\u22EF");
  parts.push(`${event.ms ?? "?"}ms`);
  return parts.join(" ");
}
function SystemEventLog({ t }) {
  const [events, setEvents] = React.useState(null);
  const [error, setError] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [refreshTick, setRefreshTick] = React.useState(0);
  const [widths, setWidths] = React.useState(EVENT_COLUMNS.map((column) => column.width));
  const dragRef = React.useRef(null);
  React.useEffect(() => {
    let alive = true;
    api.events().then(
      (data) => {
        if (alive) setEvents(Array.isArray(data?.events) ? data.events : []);
      },
      (failure) => {
        if (alive) setError(failure?.message ?? String(failure));
      }
    );
    return () => {
      alive = false;
    };
  }, [refreshTick]);
  const startDrag = (index) => (downEvent) => {
    downEvent.preventDefault();
    dragRef.current = { index, startX: downEvent.clientX, startWidth: widths[index] };
    const onMove = (moveEvent) => {
      const drag = dragRef.current;
      if (drag === null) return;
      const next = Math.max(48, drag.startWidth + moveEvent.clientX - drag.startX);
      setWidths((previous) => previous.map((width, i) => i === drag.index ? next : width));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  if (error !== "") return h("div", { className: "st-muted" }, error);
  if (events === null) return h("div", { className: "st-muted" }, t("label.loading"));
  const types = [...new Set((events ?? []).map(eventType))].sort();
  const rows = (events ?? []).filter((event) => filter === "all" || eventType(event) === filter).reverse();
  const headCells = EVENT_COLUMNS.map((column, index) => h(
    "div",
    {
      key: column.key,
      className: "st-event-th",
      role: "columnheader",
      style: widths[index] === null ? {} : { width: `${widths[index]}px`, flex: "0 0 auto" }
    },
    t(column.label),
    widths[index] !== null ? h("span", {
      className: "st-event-resize",
      role: "separator",
      onPointerDown: startDrag(index)
    }) : null
  ));
  const bodyRows = rows.map((event, index) => h(
    "div",
    {
      key: `${event.time}-${index}`,
      className: "st-event-row",
      role: "row",
      "data-ok": event.ok === true ? "true" : "false"
    },
    h(
      "span",
      { className: "st-event-time", role: "cell" },
      new Date(event.time).toLocaleTimeString([], { hour12: false })
    ),
    h("span", { className: "st-event-name", role: "cell" }, eventName(event, t)),
    h("span", { className: "st-event-text", role: "cell" }, eventDetail(event))
  ));
  const columnVars = { "--st-event-time-w": `${widths[0]}px`, "--st-event-name-w": `${widths[1]}px` };
  return h(
    "div",
    { className: "st-event-log", style: columnVars },
    h(
      "div",
      { className: "st-event-toolbar" },
      h(Dropdown, {
        className: "st-event-filter",
        testId: "log-type-filter",
        label: t("log.filter.byType"),
        value: filter,
        onChange: setFilter,
        options: [
          { value: "all", label: t("log.filter.all") },
          ...types.map((type) => ({ value: type, label: t(`log.op.${type}`) }))
        ]
      }),
      h("span", { className: "st-spacer" }),
      h("button", {
        type: "button",
        className: "st-btn st-btn-ghost",
        title: t("log.refresh"),
        onClick: () => setRefreshTick((tick) => tick + 1)
      }, "\u27F3")
    ),
    h(
      "div",
      { className: "st-event-table", role: "table" },
      h("div", { className: "st-event-head", role: "row" }, headCells)
    ),
    h(
      "div",
      { className: "st-event-body" },
      rows.length === 0 ? h("div", { className: "st-muted" }, t("log.empty")) : bodyRows
    )
  );
}
function AnswerLogOverlay({ open, t, answers, loadError, onInsert, onClose }) {
  const [page, setPage] = React.useState("answers");
  if (!open) return null;
  return h(Drawer, {
    t,
    title: t("action.answers"),
    onClose,
    // Answers are prose, set at the manuscript's size: narrow would wrap them into a column
    // of fragments.
    size: "reading",
    children: h(
      "div",
      { className: "st-answers-pages" },
      SegGroup({
        label: t("action.answers"),
        options: [
          { value: "answers", label: t("log.page.answers") },
          { value: "events", label: t("log.page.events") }
        ],
        value: page,
        onChange: setPage,
        testId: "answers-page"
      }),
      page === "answers" ? h(
        "div",
        { className: "st-answers-page" },
        loadError !== "" ? h("div", { className: "st-dialog-hint" }, loadError) : null,
        h(AnswerLog, { t, answers, onInsert })
      ) : h(SystemEventLog, { t })
    )
  });
}
function RemoveNodeOverlay({ t, doomed, countUnder, onConfirm, onCancel }) {
  if (doomed === null) return null;
  const counts = countUnder(doomed);
  const lines = [];
  if (counts.containers > 0) {
    lines.push(h("div", { key: "kids" }, t("label.removeNodeChildren", {
      n: counts.leaves,
      c: counts.containers
    })));
  }
  if (counts.chars > 0) lines.push(h("div", { key: "chars" }, t("label.removeNodeChars", { n: counts.chars })));
  lines.push(h("div", { key: "warn", className: "st-dialog-hint" }, t("label.removeNodeWarn")));
  return h(ConfirmDialog, {
    t,
    title: t("label.removeNodeConfirm", { title: doomed.title || t(`level.${doomed.level}`) }),
    confirmLabel: t("action.delete"),
    onConfirm,
    onCancel,
    children: lines
  });
}
var DRAWER_SIZES = {
  relationships: "max",
  overview: "wide"
};
function SheetOverlay({ t, motion, onClose, body }) {
  if (!motion.mounted) return null;
  return h(Drawer, {
    t,
    title: t(`tab.${motion.shown}`),
    onClose,
    // The width each panel actually needs. A relationship graph and a style profile have
    // nothing in common but their title bar.
    size: DRAWER_SIZES[motion.shown],
    closing: motion.closing,
    // `shown` for all three, so the body follows the title and the width. The caller hands
    // over the renderer, not a rendered node: a node built from the live state would be the
    // wrong page during exactly the frames this hook exists to cover.
    children: body(motion.shown)
  });
}
function MosaicOverlay({ mounted, book, ...props }) {
  if (!mounted || book === null) return null;
  return h(MosaicSheet, { book, ...props });
}

// src/client/panel/notes.js
var timeOf = (at) => Number.isFinite(at) ? new Date(at).toLocaleString() : "";
var firstName = (text) => String(text ?? "").split("\n")[0].trim();
function NotesPanel({ t, book, updateBook, onClose }) {
  const notes = Array.isArray(book?.notes) ? book.notes : [];
  const [draftId, setDraftId] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const createdRef = React.useRef(false);
  const write = (nextNotes, immediate = false) => {
    if (typeof updateBook !== "function") return;
    updateBook({ ...book, notes: nextNotes }, immediate ? { immediate: true } : void 0);
  };
  const updateNote = (id, text) => {
    if (id === null || id === void 0) return;
    write(notes.map((note) => note.id === id ? { ...note, text } : note));
  };
  React.useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    const id = rowId("note");
    write([{ id, text: "", at: Date.now() }, ...notes]);
    setDraftId(id);
    setSelectedId(null);
  }, []);
  const draft = notes.find((note) => note.id === draftId);
  const selected = notes.find((note) => note.id === selectedId);
  const ordered = [...notes].sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
  const close = () => {
    const current = notes.find((note) => note.id === draftId);
    if (current !== void 0 && current.text.trim() === "") {
      write(notes.filter((note) => note.id !== draftId));
    }
    onClose();
  };
  return h(
    Dialog,
    {
      t,
      title: t("notes.title"),
      onClose: close,
      size: "medium",
      bodyClassName: "st-notes-body",
      panelClassName: "st-notes-dialog",
      backdropClassName: "st-notes-backdrop"
    },
    h(
      "div",
      { className: "st-notes" },
      // The quick-capture field is first and focused: opening the panel is the whole gesture.
      h(
        "div",
        { className: "st-notes-capture" },
        h("textarea", {
          className: "st-input",
          autoFocus: true,
          "data-testid": "notes-capture",
          value: draft?.text ?? "",
          placeholder: t("notes.placeholder"),
          onChange: (e) => updateNote(draftId, e.target.value)
        })
      ),
      SplitPane({
        listProps: { role: "tablist", "aria-label": t("notes.title") },
        list: h(
          List,
          null,
          ordered.map((note) => h(
            ListRow,
            {
              key: note.id,
              role: "tab",
              active: note.id === selectedId,
              "data-testid": `note-${note.id}`,
              onActivate: () => setSelectedId(selectedId === note.id ? null : note.id)
            },
            h("span", { className: "st-list-row-title" }, firstName(note.text) || t("notes.untitled")),
            h("span", { className: "st-list-row-meta" }, timeOf(note.at))
          ))
        ),
        detailProps: { role: "tabpanel" },
        detail: selected === void 0 ? [h("div", { className: "st-split-detail-body" }, h("p", { className: "st-muted" }, t("notes.pick")))] : [
          // The note's text IS the detail. A title row and a timestamp above it only repeated
          // what the list already says and took height from the writing surface.
          h(
            "div",
            { className: "st-split-detail-body" },
            // Reading pane, not a form: the note's text is the whole content. Editing a new
            // thought happens in the capture field above; an archived note is read here.
            h("div", { className: "st-notes-detail", "data-testid": "notes-detail" }, selected.text)
          )
        ]
      })
    )
  );
}

// src/client/panel/tree-state.js
function useTreeEdits({ t, book, updateBook, chapter, selected, setSelected, chapterId, setChapterId }) {
  const commitNodes = (nodes, immediate) => {
    const next = { ...book, nodes, chapters: flattenLeaves(nodes) };
    updateBook(next, { immediate: immediate === true });
  };
  const patchChapter = (mutate) => {
    if (!chapter) return void 0;
    commitNodes(mapNode(book.nodes, chapter.id, mutate));
  };
  const onSummary = (chapterId2, summary) => {
    commitNodes(mapNode(book.nodes ?? [], chapterId2, (node) => ({ ...node, summary })));
  };
  const addNode = (level) => {
    const nodes = book.nodes ?? [];
    const id = newId(level[0]);
    if (level === "volume") {
      commitNodes([...nodes, { id, title: t("label.untitledVolume"), level, status: "writing", text: "", children: [] }], true);
      setSelected(id);
      return;
    }
    const ancestry = selected === "" ? [] : pathToNode(nodes, selected) ?? [];
    const parentLevel = level === "chapter" ? "volume" : "chapter";
    let parent = [...ancestry].reverse().find((node2) => node2.level === parentLevel);
    if (parent === void 0) {
      if (parentLevel === "volume") {
        parent = nodes[nodes.length - 1];
      } else {
        const volumes = nodes.filter((node2) => node2.level === "volume");
        const lastVolume = volumes[volumes.length - 1];
        const chapters = (lastVolume?.children ?? []).filter((node2) => node2.level === "chapter");
        parent = chapters[chapters.length - 1];
      }
    }
    if (parent === void 0) {
      if (level === "chapter") {
        const volume = { id: newId("v"), title: t("label.untitledVolume"), level: "volume", status: "writing", text: "", children: [] };
        const child = { id, title: t("chapter.defaultTitle", { n: 1 }), level, status: "writing", text: "", children: [] };
        commitNodes([...nodes, { ...volume, children: [child] }], true);
        setChapterId(id);
        setSelected(id);
      }
      return;
    }
    const title = level === "chapter" ? t("chapter.defaultTitle", { n: (book.chapters?.length ?? 0) + 1 }) : t("label.untitledSection");
    const node = { id, title, level, status: "writing", text: "", children: [] };
    commitNodes(mapNode(nodes, parent.id, (n) => ({ ...n, children: [...n.children, node] })), true);
    setChapterId(id);
    setSelected(id);
  };
  const renameNode = (nodeId, title) => commitNodes(mapNode(book.nodes, nodeId, (n) => ({ ...n, title })), true);
  const [doomed, setDoomed] = React.useState(null);
  const countUnder = (node) => {
    let leaves = 0;
    let containers = 0;
    const walk = (n) => {
      if (n.children.length === 0) {
        leaves += 1;
        return;
      }
      containers += 1;
      for (const child of n.children) walk(child);
    };
    walk(node);
    return { leaves, containers, chars: (node.text ?? "").length };
  };
  const confirmRemove = () => {
    const node = doomed;
    setDoomed(null);
    if (node === null) return;
    const emptied = node.children.length === 0 && node.id === chapterId;
    commitNodes(removeNode(book.nodes, node.id), true);
    if (emptied) setChapterId("");
  };
  const removeTreeNode = (nodeId) => {
    const node = findNode(book.nodes, nodeId);
    if (node === void 0) return;
    setDoomed(node);
  };
  const cancelRemove = () => setDoomed(null);
  return {
    commitNodes,
    patchChapter,
    onSummary,
    addNode,
    renameNode,
    doomed,
    countUnder,
    confirmRemove,
    cancelRemove,
    removeTreeNode
  };
}

// src/client/panel/ai-state.js
function useAiActions({ api: api2, bookFolder, chapter, book, adoptWritten, flushSave, dockScope, t }) {
  const [proposal, setProposal] = useDockState(dockScope, "proposal", null);
  const [aiError, setAiError] = useDockState(dockScope, "aiError", "");
  const [aiBusy, setAiBusy] = useDockState(dockScope, "aiBusy", false);
  const [aiNote, setAiNote] = useDockState(dockScope, "aiNote", "");
  const [scan, setScan] = useDockState(dockScope, "scan", SCAN_EMPTY);
  const [chat, setChat] = useDockState(dockScope, "chat", CHAT_EMPTY);
  const [answers, setAnswers] = useDockState(dockScope, "answers", []);
  const [answersError, setAnswersError] = useDockState(dockScope, "answersError", "");
  React.useEffect(() => {
    if (bookFolder === void 0) return void 0;
    if (typeof api2.answers !== "function") return void 0;
    let live = true;
    api2.answers(bookFolder).then((data) => {
      if (!live) return;
      const rows = Array.isArray(data?.answers) ? data.answers : [];
      setAnswers(rows);
      setAnswersError("");
    }).catch((failure) => {
      if (!live) return;
      setAnswersError(String(failure?.message ?? failure));
    });
    return () => {
      live = false;
    };
  }, [bookFolder]);
  const clearScan = () => setScan(SCAN_EMPTY);
  const runReview = async (text) => {
    if (!chapter) return;
    setScan({ kind: "review", busy: true, error: "", issues: [], ideas: [], truncated: false });
    setAiError("");
    try {
      const data = await api2.review(bookFolder, chapter.id, text);
      setScan({ kind: "review", busy: false, error: "", issues: data.issues ?? [], ideas: [], truncated: data.truncated === true });
    } catch (error) {
      setScan({ kind: "review", busy: false, error: error.message, issues: [], ideas: [], truncated: false });
    }
  };
  const runCritique = async (caret, direction) => {
    if (!chapter) return;
    setScan({ kind: "critique", busy: true, error: "", issues: [], critique: null, truncated: false });
    setAiError("");
    setAiNote(typeof direction === "string" ? direction.trim() : "");
    try {
      const data = await api2.critique(
        bookFolder,
        chapter.id,
        caret?.before ?? "",
        caret?.after ?? "",
        chapter.text ?? "",
        typeof direction === "string" ? direction : ""
      );
      setScan({ kind: "critique", busy: false, error: "", issues: [], critique: data.critique ?? null, truncated: data.truncated === true });
    } catch (error) {
      setScan({ kind: "critique", busy: false, error: error.message, issues: [], critique: null, truncated: false });
    } finally {
      setAiNote("");
    }
  };
  const castMarks = (cast) => {
    const rows = [];
    const entities = Array.isArray(book?.mosaic?.entities) ? book.mosaic.entities : [];
    const known = (kind, field, value) => entities.some(
      (entity) => entity.kind === kind && String(entity[field] ?? "").trim() === value
    );
    for (const raw of cast?.characters ?? []) {
      const name = String(raw?.name ?? "").trim();
      if (name === "") continue;
      rows.push({
        target: "character",
        label: name,
        verb: known("character", "name", name) ? "update" : "add",
        detail: [raw?.role, raw?.goal].filter((part) => typeof part === "string" && part !== "").join(" \xB7 ")
      });
    }
    for (const raw of cast?.settings ?? []) {
      const title = String(raw?.title ?? "").trim();
      if (title === "") continue;
      rows.push({
        target: "setting",
        label: title,
        // A place, a faction, an item or an event: the board keeps them all as entities, and
        // the one the proposal means is matched by its title.
        verb: entities.some((entity) => String(entity.name ?? "").trim() === title) ? "update" : "add",
        // A setting proposal's text is the long description now; `body` is gone.
        detail: String(raw?.description ?? "").slice(0, 60)
      });
    }
    for (const raw of cast?.relationships ?? []) {
      const from = String(raw?.from ?? "").trim();
      const to = String(raw?.to ?? "").trim();
      if (from === "" || to === "") continue;
      rows.push({ target: "relationship", label: `${from} \u2014 ${to}`, verb: "add", detail: String(raw?.kind ?? "") });
    }
    return rows;
  };
  const applyCast = async (p) => {
    try {
      await flushSave();
      const data = await api2.applyProposal(bookFolder, p.cast);
      adoptWritten({
        merge: (prevBook) => prevBook === null || prevBook === void 0 ? prevBook : {
          ...prevBook,
          mosaic: data.book?.mosaic ?? prevBook.mosaic
        },
        token: data.token,
        savedAt: data.savedAt
      });
    } catch (error) {
      setAiError(error.message);
    }
  };
  const insertFromLog = (entry) => {
    if (!chapter) return;
    setProposal({
      id: `log-${entry.at}`,
      kind: "chat",
      chapterId: chapter.id,
      baseText: "",
      proposedText: entry.reply,
      question: entry.question
    });
  };
  const askSelection = async (selection, wholeText, range, context, instruction) => {
    if (!chapter) return;
    clearScan();
    setChat((prev) => ({ ...prev, open: false }));
    setAiError("");
    setAiBusy(true);
    setAiNote(typeof instruction === "string" ? instruction.trim() : "");
    setProposal(null);
    try {
      const ask = typeof instruction === "string" && instruction.trim() !== "" ? instruction.trim() : "\u53EA\u6539\u9009\u4E2D\u7684\u8FD9\u6BB5\uFF08\u4FDD\u6301\u957F\u5EA6\u76F8\u8FD1\uFF09";
      const before = typeof context?.before === "string" ? context.before.slice(-400) : "";
      const after = typeof context?.after === "string" ? context.after.slice(0, 200) : "";
      const data = await api2.suggest(bookFolder, chapter.id, selection, ask, void 0, before, after);
      setProposal({
        ...data.suggestion,
        kind: "rewrite",
        wholeText,
        chapterId: chapter.id,
        from: range?.start ?? context?.start,
        to: range?.end ?? context?.end,
        // Kept with the proposal so "retry" resends the same picture of where the writer was,
        // not one rebuilt after the passage had already changed.
        context
      });
    } catch (error) {
      setAiError(error.message);
    } finally {
      setAiBusy(false);
      setAiNote("");
    }
  };
  const askContinue = async (text, caret) => {
    if (!chapter) return null;
    const at = Number.isInteger(caret) ? caret : text.length;
    const before = text.slice(0, at);
    const after = text.slice(at);
    if (before.trim() === "") {
      setAiError(t("label.writeBeforeContinue"));
      return null;
    }
    clearScan();
    setChat((prev) => ({ ...prev, open: false }));
    setAiError("");
    setAiBusy(true);
    setProposal(null);
    try {
      const data = await api2.continue(bookFolder, chapter.id, text, before, after);
      const next = data.continuation ?? "";
      if (next === "") {
        setAiError(t("label.nothingToSuggest"));
        return null;
      }
      setProposal({
        id: `cont-${Date.now()}`,
        kind: "continue",
        at,
        baseText: "",
        proposedText: next,
        chapterId: chapter.id,
        caret: at,
        chapterTextAtAsk: text
      });
      return next;
    } catch (error) {
      setAiError(error.message);
      return null;
    } finally {
      setAiBusy(false);
    }
  };
  const askChat = async (question, selection, caret) => {
    const text = String(question ?? "").trim();
    if (text === "") return;
    if (!chapter) return;
    const range = caret !== null && caret !== void 0 && Number.isInteger(caret.start) ? { start: caret.start, end: caret.end } : void 0;
    clearScan();
    setAiError("");
    const passage = typeof selection === "string" ? selection : "";
    if (routeChatQuestion(passage) === "rewrite") {
      setChat((prev) => ({ ...prev, open: false, question: text, busy: true, reply: "" }));
      setProposal(null);
      try {
        const data = await api2.suggest(bookFolder, chapter.id, passage, text, "chat");
        const proposed = String(data?.suggestion?.proposedText ?? "").trim();
        setChat((prev) => ({ ...prev, busy: false, reply: "" }));
        if (proposed === "") {
          setAiError(t("label.nothingToSuggest"));
          return;
        }
        setProposal({
          id: data.suggestion.id ?? `chat-rewrite-${Date.now()}`,
          kind: "rewrite",
          chapterId: chapter.id,
          baseText: passage,
          proposedText: proposed,
          question: text,
          from: range?.start,
          to: range?.end
        });
      } catch (error) {
        setChat((prev) => ({ ...prev, busy: false }));
        setAiError(error.message);
      }
      return;
    }
    setChat((prev) => ({ ...prev, open: false, question: text, busy: true, reply: "" }));
    setProposal(null);
    try {
      const data = await api2.chat(bookFolder, chat.history, text, chapter?.id, caret?.before, caret?.after, "");
      const reply = String(data.reply ?? "").trim();
      const marks = castMarks(data.proposal);
      setChat((prev) => ({
        ...prev,
        busy: false,
        reply,
        // The transcript keeps running so a follow-up can refer to what was already said. It
        // is capped: a side chat is about the sentence in front of the writer, not a book-long
        // conversation, and an unbounded transcript would keep re-sending the whole exchange.
        history: [...prev.history, { role: "user", text }, { role: "assistant", text: reply }].slice(-8)
      }));
      if (reply !== "") {
        const entry = { question: text, reply, at: Date.now(), chapterId: chapter?.id };
        setAnswers((prev) => [entry, ...prev].slice(0, 50));
        if (typeof api2.saveAnswer !== "function") return;
        api2.saveAnswer(bookFolder, entry).then((saved) => {
          const id = saved?.answer?.id;
          if (typeof id !== "string" || id === "") return;
          setAnswers((prev) => prev.map((row) => row === entry ? { ...row, id } : row));
        }).catch(() => {
        });
      }
      if (marks.length > 0) {
        setProposal({
          id: `cast-${Date.now()}`,
          kind: "cast",
          chapterId: chapter.id,
          question: text,
          reply,
          cast: data.proposal,
          marks
        });
        return;
      }
      if (reply !== "") {
        setProposal({
          id: `chat-${Date.now()}`,
          kind: "chat",
          chapterId: chapter.id,
          baseText: "",
          proposedText: reply,
          question: text,
          chatQuestion: text,
          caret: range
        });
      }
    } catch (error) {
      setChat((prev) => ({ ...prev, busy: false }));
      setAiError(error.message);
    }
  };
  const dismissProposal = () => {
    setProposal(null);
    setAiError("");
  };
  const clearStuck = () => {
    setAiBusy(false);
    setChat((prev) => prev !== null && prev !== void 0 && prev.busy === true ? { ...prev, busy: false } : prev);
  };
  return {
    // The dock's state, so the panel can render what is showing without reading the store twice.
    proposal,
    setProposal,
    aiError,
    aiBusy,
    aiNote,
    scan,
    setScan,
    chat,
    setChat,
    answers,
    answersError,
    // Discarding and housekeeping, rather than raw setters: the intent is what the panel has.
    dismissProposal,
    clearStuck,
    // The actions.
    clearScan,
    runReview,
    runCritique,
    applyCast,
    insertFromLog,
    askSelection,
    askContinue,
    askChat
  };
}

// src/client/panel/prefs-state.js
function usePreferences({ platform, saveInterval }) {
  const [chordOverrides, updateChordOverrides] = usePersisted(
    STORAGE_KEYS.chords,
    (raw) => {
      try {
        return JSON.parse(raw ?? "null") ?? {};
      } catch {
        return {};
      }
    },
    (value) => JSON.stringify(value)
  );
  const keyPlatform = platform ?? currentPlatform();
  const keys = resolveGestures(keyPlatform, chordOverrides);
  const [typography, updateTypography] = usePersisted(
    STORAGE_KEYS.typography,
    (raw) => {
      try {
        return normalizeTypography(JSON.parse(raw ?? "null"));
      } catch {
        return normalizeTypography(null);
      }
    },
    (value) => JSON.stringify(value)
  );
  const [autoSaveMs, persistAutoSave] = usePersisted(
    STORAGE_KEYS.autoSaveMs,
    (raw) => normalizeAutoSave(raw),
    (value) => String(value),
    saveInterval === void 0 ? void 0 : normalizeAutoSave(saveInterval)
  );
  const queueRef = React.useRef(null);
  const updateAutoSave = (value) => {
    const next = normalizeAutoSave(value);
    persistAutoSave(next);
    queueRef.current?.setIntervalMs(next);
  };
  return {
    keys,
    chordOverrides,
    updateChordOverrides,
    // The platform the chords were resolved for. Returned so the settings page can offer "reset this
    // row" against the same defaults the editor is using, rather than re-reading the UA and
    // risking a different answer.
    platform: keyPlatform,
    typography,
    updateTypography,
    autoSaveMs,
    updateAutoSave,
    autoSaveLocked: saveInterval !== void 0,
    queueRef
  };
}

// src/client/shared/styles.js
var CSS_SHARED = `
      /* Radii, semantic colours and the focus ring are host tokens, read from the shipped theme
         rather than invented. Type is NOT: the panel has its own four-step scale and its own font
         stack, because a writing surface mounted into an arbitrary host column should not inherit
         its typography from an ancestor it does not control. See the scale below.
         The one host-managed offset is --dsh-frame-leading-clearance: the shell raises it when
         the sidebar collapses so the frame's leading controls keep their seat. */
      .st-root,.st-root *,.st-shell *{box-sizing:border-box}
      /* The single place the accent is decided: every focus ring, selection, card edge, primary
         action and the send key read this one variable.
         It is the panel's OWN colour, not the host's brand token. The host's brand resolves to a
         near-white on the dark theme the panel runs on, so everything painted with it came out
         white on a near-black page \u2014 the panel's "accent" was the absence of one. Naming a colour
         here is what makes the panel look like itself on either host theme.
         The colour is \u6731\u7EA2 (#c3272b), picked on the dark canvas the panel actually runs on \u2014
         the earlier #e34234 read orange against the near-black page, so the accent is a step
         redder and a step darker than that first literal.
         The literal is the value itself rather than a variable: a var() whose fallback is another
         var() is not a fallback at all, and with no theme loaded the whole declaration is invalid
         and every background: var(--st-accent) rule silently paints nothing. */
      /* The panel's type, declared on the one element every other rule sits inside.
         Family here rather than per component, and the working size too: a rule that sets no size
         inherits 13/20, which is what almost every control in this panel is. That is what makes the
         31 "font-family: inherit" rules mean something \u2014 they inherit the PANEL's stack, not
         whichever host ancestor happened to declare one. */
      .st-shell{font-family:var(--st-font-family);
        font-size:var(--st-text-md);
        --st-accent:#c3272b;
        /* The panel's ground: pure black by decision, not the host's bg token \u2014 the host's base
           in the running dark theme is a grey. Layered surfaces (rail, cards, inputs) keep their
           theme layers and read as raised off this ground. The status bar shares it, so the
           bottom strip does not read as a separate grey band. */
        --st-bg:#000;
        /* THE FALLBACK PALETTE: what every host alias resolves to when the theme is absent.
           Defined once, here; the var(--alias, var(--st-fallback-*)) pattern is safe because these
           are declared on this same rule, in scope for every rule that reads them \u2014 unlike a
           literal copied into two hundred var() calls, where changing one changed only one. */
        --st-fallback-ink:#0f1115;
        --st-fallback-ink-soft:#61666b;
        --st-fallback-ink-faint:#81858c;
        --st-fallback-ink-caption:#adb2b8;
        --st-fallback-ink-dimmed:#e1e5ee;
        --st-fallback-ink-contrast:#fff;
        --st-fallback-hover:#2631480f;
        --st-fallback-border-l2:#00000014;
        --st-fallback-border-l3:#0000001f;
        --st-fallback-border-l4:#00000029;
        --st-fallback-page:#f2f3f5;
        --st-fallback-error:#ec1313;
        --st-fallback-warn:#f59e0b;
        --st-fallback-green:#22c55e;
        --st-fallback-scrollbar:#e5e5e5;
        --st-fallback-scrollbar-hover:#d4d4d4;
        /* THE TEXT INK TIERS. Three names for three jobs: a heading or value (primary), body
           copy and controls (secondary), and labels, metadata and disabled copy (tertiary).
           Captions used to have a fourth, almost identical tier; they use tertiary now, so two
           labels side by side can no longer be two different greys by accident. */
        --st-text-primary:var(--dsw-alias-label-primary,var(--st-fallback-ink));
        --st-text-secondary:var(--dsw-alias-label-secondary,var(--st-fallback-ink-soft));
        --st-text-tertiary:var(--dsw-alias-label-tertiary,var(--st-fallback-ink-faint));        /* THE SPACING SCALE.
           Six steps, not seventeen near-duplicates: 2px is the hairline step for marks and tight
           controls, then every layout distance is 4, 8, 12, 16 or 24. A step off that rhythm (6, 10,
           14, 20) is exactly how two adjacent cards came to have 10 and 12 of inner padding: each
           looked right where it was typed, and nothing kept them in step.
           The steps are named by their value rather than by size (sm/md/lg) because a name is an
           opinion and a number is a fact \u2014 --st-space-8 says exactly what it is. */
        --st-space-2:2px;
        --st-space-4:4px;
        --st-space-8:8px;
        --st-space-12:12px;
        --st-space-16:16px;
        --st-space-24:24px;
        /* THE LAYOUT SCALE. Spacing says how far apart two things are; these say how a page is
           built, and they must be shared or every board page becomes its own grid. The three
           board steps are what the investigation board's pages, its split panes and its slide-over
           all read, so a page cannot drift a few pixels away from its neighbour. The inset ladder
           is the same idea for controls: an inner padding is one of four sizes, never a one-off. */
        --st-board-gap:var(--st-space-12);
        --st-board-inset:var(--st-space-16);
        --st-board-inset-compact:var(--st-space-12);
        --st-inset-xs:var(--st-space-4);
        --st-inset-sm:var(--st-space-8);
        --st-inset-md:var(--st-space-12);
        --st-inset-xl:var(--st-space-24);
        /* THE RADIUS SCALE, on the same principle as the spacing one.
           The host ships five radii (xs 4, sm 8, md 12, lg 16, panel 28) and every one of them is used
           here through its token. What was NOT covered were the values written locally \u2014 1, 2, 3, 6,
           7, 9 and 18 \u2014 each one a small radius that happened to look right where it was typed, and
           none of them shared with the rule beside it. That is the same fragmentation the spacing
           scale was introduced to end: two adjacent chips with 3px and 4px corners, a tag with 2px
           next to a badge with 6px.
           The steps below are the ones this panel actually needs, mapped onto the host's tokens where
           a token exists so a change of theme still reaches them. --st-radius-pill covers 999px,
           which is not a measurement but "as round as the box allows" \u2014 it is the same intention
           everywhere it appears, so it deserves a name too. */
        --st-radius-xs:var(--dsw-radius-xs,4px);
        --st-radius-sm:var(--dsw-radius-sm,8px);
        --st-radius-md:var(--dsw-radius-md,12px);
        --st-radius-lg:var(--dsw-radius-lg,16px);
        --st-radius-panel:var(--dsw-radius-panel,28px);
        /* A SHAPE, not a step. The five above are sizes and come from dsh; this one says "as round as
           the box allows", which is a different intention and the only way a 4px dot and a 30px pill
           can both be round. dsh itself writes 999px where it means this, so the value is the same
           as the host's rather than a new invention \u2014 it just needed a name so it is not a stray
           literal in sixteen rules. */
        --st-radius-pill:999px;
        /* The two inks the panel draws its own depth with. Not host tokens because they are not part
           of the theme: a drop shadow is black at some opacity whatever the palette says, and the
           highlight that catches a floating card's top edge is white. Naming them keeps the exact
           rgba out of five different rules. */
        --st-shade:0,0,0;
        --st-highlight:#fff;
        /* The send key. It used to be \u6731\u7EA2, a second colour of the panel's own; now it is the
           accent, so the one affirmative control in the composer and every other accented control
           are the same colour instead of two near-misses. The hover is a shade of that same
           colour rather than a second literal, the way the session button's is. */
        --st-send:var(--st-accent,#c3272b);
        --st-send-hover:color-mix(in srgb, var(--st-accent) 86%, #000000);
        /* The keyboard-focus ink. Not the host's focus-ring-color: the shipped dark theme sets it
           to transparent, which on the pure-black ground made every focused control invisible.
           Derived from the primary label so it reads on the ground, on the grey layers and on
           the accent fills alike; each rule keeps its own ring geometry (box-shadow or outline). */
        --st-focus-ink:color-mix(in srgb, var(--dsw-alias-label-primary,var(--st-fallback-ink-contrast)) 45%, transparent);
        /* The two raised surfaces, derived FROM the host's layer tokens instead of read raw: the
           host tuned its greys for its own near-black base, and on the pure-black ground they sat
           a step too light. Each surface pulls its layer 72% toward the ground \u2014 one visible step
           of separation, not the full gap. Every raised fill in the panel reads one of these two:
           cards, rail, menus and the tooltip on --st-surface; inputs, selected pills, sheets and
           the model pickers on --st-surface-high. */
        --st-surface:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#232324) 72%, var(--st-bg));
        --st-surface-high:color-mix(in srgb, var(--dsw-alias-bg-layer-2,#2c2c2e) 72%, var(--st-bg));
        /* The selected state of a button, a tab or a list row. Surface-high against the page floor
           was only a few percent of grey apart, which on the near-black ground read as "not
           selected". This mixes the theme ink into the raised surface so the step is visible in
           both themes: lighter than the floor on dark, darker on light.
           The hover tier is quieter than selection on purpose \u2014 hover says "under the pointer",
           selection says "this is the one open right now". */
        --st-selected-fill:color-mix(in srgb, var(--st-text-primary) 18%, var(--st-surface));
        /* One hover wash for every button, tab and row. The old per-component hover used a 6%
           transparent ink that disappeared on the near-black ground; this is the same visual
           weight everywhere, so hover and selection cannot look like two different systems. */
        --st-hover-fill:color-mix(in srgb, var(--st-text-primary) 9%, var(--st-surface));
        /* A pressed control is one step darker than hover but still quieter than selection. */
        --st-active-fill:color-mix(in srgb, var(--st-text-primary) 14%, var(--st-surface));
        --st-list-hover:var(--st-hover-fill);
        /* The ink tiers: how strongly the theme's own ink is laid over a surface, for edges,
           dividers, hover ghosts and placeholder glyphs. Written as whole colour mixes (the ink
           at a strength over transparency) so a rule states the TIER it wants, not a percentage.
           Four tiers, quietest first:
             whisper  3%   hover ghosts, marks that are almost not there
             hair     8%   inset dividers and the quietest strokes
             edge    14%   every visible border and ring
             faint   45%   placeholder glyphs that must still be read as a character */
        --st-ink-whisper:color-mix(in srgb, var(--st-text-primary) 3%, transparent);
        --st-ink-hair:color-mix(in srgb, var(--st-text-primary) 8%, transparent);
        --st-ink-edge:color-mix(in srgb, var(--st-text-primary) 14%, transparent);
        --st-ink-faint:color-mix(in srgb, var(--st-text-primary) 45%, transparent);
        /* The ink that sits ON an accent surface: primary buttons, the send key, accent badges.
           Not the host's label-primary-foreground alias \u2014 in the theme the panel runs on that
           alias resolves to a dark ink, which read on the old light pink but turns into black
           text on the dark vermilion. White is a constant on purpose, for the same reason the
           tooltip bubble's ink is one. */
        /* The title row's height, in one place: the drawers start below it, so the number cannot
           drift from the row it describes. */
        /* THE TYPE SCALE: four steps, and the panel's own.
           The panel used the host's eleven-step ramp, of which it actually needed nine \u2014 and three
           of those nine were token names the host does not ship (2xs-12, l-18, 2xl-22), so those
           rules silently fell back to their literal and stopped tracking the theme. Nine sizes for
           one panel is also more than the panel can use: 12 and 13 sat one pixel apart and were
           picking up each other's work, so the same caption tier read at two sizes in two drawers.
           Four steps, chosen by ROLE rather than by size, because a role is what a rule is trying
           to express when it sets type:

             --st-text-sm    12px/18   the smallest tier: badges, counts, keycaps, IDs, group labels
             --st-text-md    13px/20   the working size: every control, field, card label, menu row
             --st-text-lg    16px/24   section and dialog titles, and the manuscript's interface type
             --st-text-xl    20px/28   a page title, and the one oversized glyph on the new-book tile

           Two things are deliberately NOT on this scale:
             the manuscript itself, which is the writer's own size setting (--st-font-size), and
             the composer's field, which is interface type held at 16/24 so a one-line question is
             not typed at caption size (--st-font-ui).

           Every step carries its leading with it: a size and its line height are one decision, and
           splitting them is how 94 rules ended up with a leading from a different tier than their
           size. */
        --st-text-sm:12px;
        --st-text-sm-leading:18px;
        --st-text-md:13px;
        --st-text-md-leading:20px;
        --st-text-lg:16px;
        --st-text-lg-leading:24px;
        --st-text-xl:20px;
        --st-text-xl-leading:28px;
        /* The two line-height tiers. The steps above carry their own leading for CONTROL text;
           these two are the PROSE rhythms: 1.6 for interface prose that sits inside cards and
           drawers, 1.9 for the manuscript itself (--st-line-height, set per writer in the type
           page \u2014 this one is the default, not the floor). */
        --st-line-height-ui:1.6;
        --st-line-height-reading:1.65;
        /* The font family, declared ONCE.
           The panel used to inherit whatever the host's body carried, with four rules repeating the
           host token in full and thirty-one saying "inherit". Both were guesses about a context the
           panel does not own: it is mounted into whichever column the host chooses, and a font
           declared by an ancestor two levels up is not a decision this panel made.
           The stack is written out as literals rather than as the host's font variable because the
           panel is not meant to nod along with the host's typography \u2014 it is a writing surface, and
           its own text metrics are its own. The CJK faces are named explicitly: without them a CJK
           fallback is chosen per-platform and the same document reads at different widths on two
           machines. */
        --st-font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",Roboto,sans-serif;
        /* The three weights the panel uses. Read from variables so a rule states intent, not a number. */
        --st-font-weight-normal:400;
        --st-font-weight-medium:500;
        --st-font-weight-strong:600;
        /* The monospace stack, for keycaps and model ids. */
        --st-font-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
        /* The welcome page speaks in a serif face; the manuscript page keeps the UI sans. */
        --st-font-serif:"Iowan Old Style","Palatino Linotype","Songti SC","Noto Serif SC",serif;
        --st-welcome-title:clamp(56px,8.4vw,118px);
        --st-welcome-title-leading:.9;
        --st-welcome-title-tracking:-.035em;
        --st-welcome-measure:780px;
        --st-welcome-gutter:clamp(28px,6vw,96px);
        --st-welcome-latin-size:clamp(34px,4vw,48px);
        --st-welcome-latin-leading:1.15;
        --st-welcome-latin-tracking:.045em;
        /* Optical alignment: the Latin italic's first ink starts left of its box, the Chinese
           glyph starts right of its own. This nudge puts the two first strokes on one vertical. */
        --st-welcome-latin-nudge:.08em;
        --st-welcome-lede-size:clamp(18px,2.2vw,24px);
        /* The pointer's glyph field on the welcome canvas. */
        --st-glyph-radius:130px;
        --st-glyph-size:17px;
        --st-glyph-depth:color-mix(in srgb,var(--st-text-primary) 18%,transparent);
        --st-glyph-flip:380ms;
        --st-glyph-z:1;
        --st-glyph-blur:4px;
        --st-glyph-content-pad:6px;
        --st-glyph-ink:color-mix(in srgb,var(--st-text-tertiary) 45%,transparent);
        --st-glyph-ink-primary:color-mix(in srgb,var(--st-text-primary) 26%,transparent);
        --st-glyph-ink-accent:color-mix(in srgb,var(--st-accent) 35%,transparent);
        --st-flow-border-w:1px;
        --st-flow-duration:4.5s;
        --st-welcome-wedge-z:0;
        --st-welcome-main-z:2;
        --st-welcome-back-z:3;
        --st-welcome-dialog-z:4;
        --st-welcome-dialog-w:480px;
        --st-welcome-dialog-title-size:20px;
        --st-welcome-dialog-input-size:16px;
        --st-mcp-w:460px;
        --st-mcp-code-h:220px;
        --st-mcp-dot:7px;
        --st-mcp-z:6;
        /* The menu glyph size. One step above the 16px interface icons so four rows at 16px type
           read as a list of destinations rather than as a column of small print, and below the
           label's own size so the glyph never outweighs the word it stands for. */
        /* ICON SIZES. One ladder for every glyph in the panel: 12 inline, 14 small actions,
           16 controls, 18 title-row/rail icons. A 13px book glyph next to an 18px board glyph
           was the same kind of control drawn at two weights. */
        --st-icon-xs:12px;
        --st-icon-sm:14px;
        --st-icon-md:16px;
        --st-icon-lg:18px;
        --st-icon-menu:var(--st-icon-lg);
        /* The \u22EF affordance on a card: a small hit box with three 2px dots in it.
           The dots are a MARK, not an icon \u2014 at 4px they read as three buttons stacked, and at 1px
           they disappear on a light picture. The hit box stays comfortable because a 2px target is
           not something to ask a pointer to find. */
        --st-icon-menu-dot:2px;
        /* The width of a settings column inside a drawer. The typography page and the models page
           both lay their rows out at this width, and it was written twice \u2014 which is how two pages
           that look like siblings came to be 340 and 340 by coincidence rather than by rule. */
        --st-settings-w:340px;

        /* ---- component geometry ----
           Every length below is a named decision rather than a number typed where it was needed.
           They are grouped here, next to the scale they extend, so a page that wants the same
           measure as another page finds it instead of inventing a second one. */
        /* The dock's hairline row: tall enough for the copy above the line to breathe. */
        --st-hairline-row-h:22px;
        /* The event log's table: the drag handle's hit width, and the reading ceiling of the
           list itself \u2014 the column widths live with the component that renders them. */
        --st-event-resize-w:7px;
        --st-event-body-max-h:320px;
        /* A drawn rule: the light line under the dock and the busy bar's top edge. */
        --st-rule-h:1px;
        /* A row of segmented choices, and the round send control beside it. */
        --st-seg-h:28px;
        --st-send-size:var(--st-btn-h-lg,36px);
        /* Chevrons and status dots: the small marks inside a row. */
        --st-mark-sm:4px;
        --st-mark-md:9px;
        --st-mark-lg:12px;
        /* The composer's model picker and the board's pick button. */
        --st-picker-min-w:220px;
        --st-menu-min-w:120px;
        --st-status-menu-min-w:240px;
        --st-review-max-w:520px;
        --st-review-chip-min-w:60px;
        /* The outline's node rows and the find field beside them. */
        --st-find-w:170px;
        --st-find-min-w:60px;
        --st-gutter-w:52px;
        /* The editor's floor: below this a page is not worth opening. */
        --st-editor-min-h:140px;
        /* The type preview's fixed frame: one line of the largest offered type at its loosest
           leading, plus the box's padding. Fixed on purpose \u2014 the frame must not jump when the
           chosen size changes; the sample is one line, so the frame is small. */
        --st-preview-h:72px;
        /* The entity page's label column, and the same column inside a fact row. */
        --st-fact-label-w:64px;
        --st-fact-label-w-compact:44px;
        /* The status bar's own height, and the effort axis's tick. */
        --st-statusbar-h:30px;
        --st-effort-tick:5px;

        --st-icon-menu-hit:20px;
        /* 8px of top air (the same drop the shelf head gets from its container) plus the bar
           itself: 16px padding-top, one 36px pill row, 8px padding-bottom. The overlay insets
           declare this value, so bar and overlays move together. */
        --st-titlebar-height:68px;
        /* The session button's flowing ring: the band's width, the gradient itself, and one
           revolution's duration. The two companion hues are literals on purpose \u2014 they are a
           fixed chromatic chord around the accent, not theme surfaces, and all three stops sit
           at a lightness that reads on both themes. */
        --st-session-text-flow:linear-gradient(110deg, var(--st-accent), color-mix(in srgb, var(--st-accent) 45%, #fff), var(--st-accent));
        --st-session-text-dur:5s;
        /* The heights of the panel's own control rows. These are not spacing steps: a menu row is as
           tall as one line of text plus its padding, and two menus that answer the same question must
           not be 34 and 32 tall because they were written a week apart.
           The "lg" step carries the rail's menu. It is derived from the row's own parts rather than
           written as a number: the menu's type is one step up from the working size, and a row is its
           line box plus the padding above and below it. Written as 36 it was correct only while the
           menu was at 14px \u2014 the moment the type grew, the row kept the old height and the glyph sat
           in it with 8px less room than the padding says it should have. */
        --st-row-height-lg:calc(var(--st-text-lg-leading) + var(--st-space-16,16px));
        /* The BUTTON height ladder: one step for standalone buttons (title row, dialogs, panels),
           one for the inline marks that live inside a text row. Rows and fields keep the row
           heights above \u2014 buttons and rows are different ladders. */
        --st-btn-h-xl:48px;
        --st-btn-h-lg:36px;
        --st-btn-h-sm:26px;
        --st-row-height:34px;
        --st-row-height-compact:26px;
        --st-hit-target:44px;
        /* The gallery card's size. A DIFFERENT card from the graph's: the gallery is a page of
           objects read side by side, the graph is a map with wires that have to land on a known
           box. They shared one variable once, which meant the graph's 140px silently set the
           gallery's column width. */
        /* TWO kinds of card, and they are DIFFERENT COMPONENTS, not one shape at two scales.
           Mixing them into one pair of variables was wrong: the wall's cards are placed by a
           graph layout that computes wire endpoints from their size in JavaScript, so the card
           tile's size could not be changed without moving every wire.

             the wall's card   .st-mosaic-card       portrait fills it, caption over the lower half
             the card tile     .st-mosaic-page-card  portrait band, caption band under it

           Both are PORTRAIT \u2014 taller than wide. A card on the wall is a person standing in the
           story, and a wide, short box reads as a row in a table however it is painted; the picture
           has to be given its height back. The wall's is the narrower of the two (120x168): its
           picture is a backdrop for a name, so it needs less width than the page tile, which is the
           content of its own page. The numbers are separate because the components are. */
        --st-card-w:120px;
        --st-card-h:168px;
        /* The cards' SHAPE, not a size: width over height, read by every portrait frame that
           shows a board picture, so one place decides what "the same shape as a card" means. */
        --st-card-aspect:5 / 7;
        --st-gallery-w:184px;
        /* The card tile follows the trading-card standard: 2.5 by 3.5 inches, 1:1.4. That ratio is
           what every printed card game uses, and a reader has handled enough of them to feel when a
           card is wrong: 1:1.25 read as a square tile, not as a card. 184 * 1.4 = 258. */
        --st-gallery-h:258px;
        /* The board's own stacking order, INSIDE the sheet. These are not the panel's
           --st-layer-* planes \u2014 they are the layers a board page stacks among itself: the
           detail popover over the canvas, the card's \u22EF menu over the card, and the detail page
           over everything but the tabs. Written as numbers they were four unrelated integers;
           as a group they say "what covers what" in one place. */
        --st-mosaic-z-detail:1;
        --st-mosaic-z-card-menu:2;
        --st-mosaic-z-card-menu-list:3;
        --st-mosaic-z-page:6;
        /* The relations wires. A stroke width is a drawing weight, not a length \u2014 it is set
           here with the layers above so the three widths that describe one line live together:
           the hair that is seen, the wide invisible target that takes the pointer, and the
           picked state that reads a step heavier. Unitless, as SVG strokes are. */
        --st-edge-w:1.2;
        --st-edge-hit-w:16;
        --st-edge-picked-w:2;
        --st-edge-opacity:.9;
        /* The two recurring fades. .6 is the quiet-mark tier (a separator dot, a disabled
           tool's icon); .5 is the discarded tier (a proposal the writer turned down). One-offs
           (an animation's start frame, the busy button) stay literals: a token used once is a
           second name for the number, not a decision. */
        --st-fade-quiet:.6;
        --st-fade-dim:.5;
        /* The vertical bookmarks' type: the tracking between glyphs, and the negative inline
           margin that pulls the slot letter-spacing adds AFTER the last glyph back out, so the
           selected pill sits centred on the text. The two are one decision \u2014 change the
           tracking and the pull follows it. */
        --st-tab-tracking:2px;
        --st-tab-tracking-pull:-1px;
        /* The welcome page's dot canvas: the dot itself, the lattice step, and how far the
           pointer's highlight reaches. The dots are theme-ink mixes, so the field reads on both
           themes; the bright layer is the pointer's neighbourhood, masked by its position. */
        --st-canvas-dot-size:1px;
        --st-canvas-grid:24px;
        --st-canvas-glow:160px;
        --st-canvas-dot:color-mix(in srgb, var(--st-text-primary) 14%, transparent);
        --st-canvas-dot-bright:color-mix(in srgb, var(--st-text-primary) 45%, transparent);
        /* The page gutter: the shelf's side padding, and the inset both titlebars' dividers keep
           from the panel edges. Wider than a spacing step, because the dot field needs air at the
           edges to read as a canvas rather than as a padded form. */
        --st-shelf-gutter:28px;
        /* Fixed widths that are a layout decision, not a spacing step: the outline's column, the
           confirmation dialog's reading width, and the gap the board keeps from the panel edges.
           Named so a rule that wants one does not carry its own copy of the number. */
        /* THE WIDTH LADDER. Panels used to carry their own pixel widths inline: a dialog said 820,
           its sibling 620, a drawer 720, another 980. Those are six fixed tiers now, so a panel
           picks a role ("wide", "reading") instead of memorising a number, and two dialogs that
           hold the same kind of content cannot end up 200px apart. */
        --st-w-narrow:340px;
        --st-w-compact:440px;
        --st-w-medium:620px;
        --st-w-reading:720px;
        --st-w-wide:820px;
        --st-w-max:980px;
        --st-rail-w:264px;
        --st-dialog-w:var(--st-w-compact);
        --st-dialog-textarea-min-h:64px;
        --st-dialog-max-h:760px;
        --st-overlay-inset:32px;
        /* The overview page's master-detail: the chapter list's column, the floor below which the
           split stops shrinking (it scrolls instead), and the summary field's fixed height. */
        --st-split-list-w:220px;
        --st-split-min-h:320px;
        --st-overview-summary-h:96px;
        /* The card-detail surfaces. The popover, the page's portrait and the picture button are one
           system, so their three sizes live together rather than as fallbacks written where each
           rule happens to use them. */
        --st-detail-w:var(--st-w-narrow);
        --st-detail-portrait:104px;
        --st-page-portrait:132px;
        --st-generate-size:28px;
        --st-detail-area-max:168px;
        /* The event log's first two columns. The third takes whatever is left, so these two are the
           only fixed widths in that table. */
        --st-log-col-time:96px;
        --st-log-col-name:190px;
        /* The board's floor clearance for the composer dock, and the side sheet's default ceiling.
           Both are layout decisions read from one place rather than fallbacks typed in the rule. */
        --st-mosaic-dock-clearance:150px;
        --st-sheet-max:var(--st-w-wide);
        /* \u968F\u7B14's dialog height: the capture field plus the list/detail split, not a full-height
           workspace. */
        --st-notes-h:348px;
        /* Custom-provider model chips: tall enough for a few rows, then scroll. */
        --st-model-list-max-h:160px;
        --st-notes-capture-h:120px;
        /* A card's edge. Half a pixel at 1x, one at 2x \u2014 the browser rounds it, and writing 1px
           made every card look like it had a drawn border. Named because the same hairline is the
           first layer of every shadow in this stylesheet. */
        --st-hairline:.5px;
        /* THE CARD SHADOW, in two states.
           This used to be argued the other way: "a box-shadow cannot be a token, because a layer
           list carries its own colours, so a stored offset list could not be re-coloured". That is
           true of storing the OFFSETS alone \u2014 and it is exactly why the recipe was then written
           out longhand in every card rule. The conclusion did not follow: storing the WHOLE shadow,
           colours included, works, because each colour is a color-mix of the theme ink and is
           substituted wherever the token is used. Two rules now share one recipe instead of
           agreeing by luck.

           What is stored is the recipe itself: a hairline contact layer, a close ambient layer, a
           wide soft layer. The first layer takes the shared hairline width, so a card's edge and
           the shadow sitting on that edge cannot drift apart. */
        --st-card-shadow:
          0 0 0 var(--st-hairline) color-mix(in srgb, var(--st-text-primary) 6%, transparent),
          0 1px 2px color-mix(in srgb, var(--st-text-primary) 7%, transparent),
          0 6px 16px color-mix(in srgb, var(--st-text-primary) 6%, transparent);
        /* The lifted state: the same three layers, closer and darker, so a card reads as picked up
           rather than as a different object. */
        --st-card-shadow-lift:
          0 0 0 var(--st-hairline) color-mix(in srgb, var(--st-text-primary) 8%, transparent),
          0 2px 4px color-mix(in srgb, var(--st-text-primary) 9%, transparent),
          0 12px 26px color-mix(in srgb, var(--st-text-primary) 10%, transparent);
        /* THE PANEL SHADOW, for the surfaces that slide in over the page: the two side sheets and
           the outline card.
           A card sits ON something, so its shadow is a contact layer \u2014 a hairline, a close cast,
           one soft spread. A panel does not sit on anything: it is a whole surface lifted off the
           page, and it needs separation at its own scale.
           There are two of them, because the direction is not shareable: the sheet enters from the
           RIGHT and its shadow is thrown LEFT, and the outline enters from the left and throws its
           shadow right. One token cannot carry both signs, and a rule that flipped the offset
           with calc() would be a second place the distance can be got wrong. The offset and blur
           are not spacing steps \u2014 they describe a light, not a gap \u2014 so they are written here
           rather than borrowed from the spacing scale.
           The reach is deliberately short: 6px of offset and 20px of blur is enough to lift the
           surface off the page and no more. A wide, dark throw (18/48 at 18%) looked like the panel
           was hovering half a metre above the page, and on a full-height sheet it read as a dark
           band down the side of the manuscript rather than as depth.
           Every colour is a mix of the theme ink, never a literal black: a fixed rgba shadow is
           invisible on the dark theme, which is how the old shelf card disappeared. */
        --st-panel-shadow-left:
          0 0 0 var(--st-hairline) color-mix(in srgb, var(--st-text-primary) 8%, transparent),
          -6px 0 20px color-mix(in srgb, var(--st-text-primary) 10%, transparent);
        --st-panel-shadow-right:
          0 0 0 var(--st-hairline) color-mix(in srgb, var(--st-text-primary) 8%, transparent),
          6px 0 20px color-mix(in srgb, var(--st-text-primary) 10%, transparent);
        /* The panel's INNER rim: a light line along the top edge, so the surface reads as having a
           thickness rather than being a rectangle of paint. Inset, because a real light would catch
           that edge and not the outside of it. Kept apart from the outer shadow so a rule can take
           one without the other. */
        --st-panel-rim:
          inset 0 1px 0 0 color-mix(in srgb, var(--st-text-primary) 6%, transparent);
        /* A card's state motion: the lift, the edge and the shadow, all on one duration. The
           fallbacks are written in ms rather than .14s so the value still reads as a literal length
           to the stylesheet's own hygiene check. */
        --st-card-motion:box-shadow var(--ds-transition-duration-fast,140ms) var(--ds-ease-in-out,ease-in-out),
          transform var(--ds-transition-duration-fast,140ms) var(--ds-ease-in-out,ease-in-out),
          border-color var(--ds-transition-duration-fast,140ms) var(--ds-ease-in-out,ease-in-out);
        /* A BOOK card's height, stated as its parts: a square cover (which is the width), the
           identity line under it, one line of meta, and the ACTIONS ROW. Both the shelf card and
           the two trailing tiles (new book, rename) take this one value, so a row of the grid is
           level \u2014 written twice it was two numbers to keep in step for one intention.

           The actions row is the term that is easy to forget and was: the card clips its contents
           (overflow: hidden, so a hover lift cannot spill), so a row that the sum did not account
           for was not visible but was cut off. Rename and delete sat below the card's own bottom
           edge \u2014 present in the tree, unreachable by a pointer. */
        /* The three --st-* terms need no fallback: they are declared on this same rule, a few lines
           above. The host font token DOES, because "no theme" is a supported state and a var()
           without one invalidates the whole declaration. */
        --st-book-card-h:calc(var(--st-gallery-w) + var(--st-row-height-compact)
          + var(--st-text-sm-leading) + var(--st-row-height-compact)
          + var(--st-space-4) + var(--st-space-24));
        /* THE LAYER TABLE.
           Overlays used to carry their own z-index where they were written, so which one covered
           which was decided by DOM order and by luck: the board and a drawer were both 70, and a
           model menu (60) opened while the board was up disappeared behind it. Every overlay now
           takes its layer from this table, and the ordering below IS the rule:
           the outline sits lowest, menus above it, the shared scrim above those, the board above
           the scrim, a drawer above the board (opening one from the board must work), and the
           status popover on top of everything because it is a transient reply. */
        --st-layer-rail:30;
        --st-layer-menu:60;
        --st-layer-mosaic:70;
        --st-layer-drawer:75;
        --st-layer-status:80;
        --st-layer-modal:90;
        /* THE MOTION PAIR. One duration for every overlay, so the outline, a drawer and the board
           all feel like the same system. Closing is faster than opening: an entrance is read,
           an exit only has to get out of the way. */
        --st-motion-open:180ms;
        --st-motion-close:140ms;
        display:flex;flex-direction:column;height:100%;min-height:0;min-width:0;
        font-family:var(--st-font-family);font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        background:var(--st-bg);color:var(--st-text-primary)}

      /* ---- the title row: the book title, its menu, and the three drawer buttons ---- */
      .st-titlebar{display:flex;align-items:center;gap:var(--st-space-8,8px);flex:none;margin-bottom:var(--st-space-16,16px);min-width:0;
        /* No fixed height: the bar is its content (one row of 36px pills) plus vertical padding,
           so it can never clip its own controls. The padding must keep the bar at the height the
           overlay insets declare (--st-titlebar-height) \u2014 bar and insets move together. */
        padding-top:var(--st-space-16,16px);padding-bottom:var(--st-space-8,8px);padding-left:max(var(--st-space-16,16px), calc(var(--dsh-frame-leading-clearance, 0) + var(--st-space-8,8px)));padding-right:var(--st-space-12,12px);
        border-bottom:var(--st-hairline) solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      /* A border paints on the element's own box, so the element's padding cannot inset it \u2014
         only a container or a margin can. The shelf head sits inside its scroll container, whose
         padding supplies the top air and the page gutter; the shell's own bar has no container,
         so it declares the same two insets as margins. Both dividers then share one geometry:
         the same side inset and the same drop from the panel's top edge. */
      .st-shell>.st-titlebar{margin-top:var(--st-space-8,8px);margin-left:var(--st-shelf-gutter);margin-right:var(--st-shelf-gutter)}
      .st-title{margin:0;font-size:var(--st-text-xl);line-height:var(--st-text-xl-leading);font-weight:var(--st-font-weight-strong);color:var(--st-text-primary);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:0 1 auto}
      /* The title row's icons. The drawer buttons and the mosaic entry are flex rows so an icon
         and its label share a baseline; the icon never shrinks and never takes the label's last
         pixel. */
      .st-bar-icon{flex:none;width:var(--st-icon-lg);height:var(--st-icon-lg)}
      .st-card-action-icon{flex:none;width:var(--st-icon-sm);height:var(--st-icon-sm)}
      .st-icon-xs{flex:none;width:var(--st-icon-xs);height:var(--st-icon-xs)}
      .st-icon-sm{flex:none;width:var(--st-icon-sm);height:var(--st-icon-sm)}
      .st-icon-md{flex:none;width:var(--st-icon-md);height:var(--st-icon-md)}
      .st-icon-lg{flex:none;width:var(--st-icon-lg);height:var(--st-icon-lg)}

      /* The frame: rail, page column, and the scroll area inside them ---- */
      .st-root{display:flex;flex:1 1 auto;min-height:0;min-width:0;width:100%;overflow:hidden}
      .st-col{display:flex;flex-direction:column;min-height:0;min-width:0}
      /* The outline is an overlay, not a column: it covers the left edge of the page and slides in
         from there. inset-block:0 with left:0 is what makes it flush: the card touches the
         panel's left edge and both the top and the bottom with no gap, and only its right side is
         rounded, because the other two corners are against the frame.
         Its positioning context is this layer, which spans the whole shell BELOW the title row:
         the card has to reach the panel's bottom edge, and the status bar is inside that span, so
         a context that ended at the bar could never produce it. */
      .st-rail-layer{position:absolute;z-index:var(--st-layer-rail);
        inset:var(--st-titlebar-height,68px) 0 0 0;
        /* A span, not a surface: it paints nothing and takes no clicks, so a folded outline cannot
           swallow a click meant for the page under it. */
        pointer-events:none}
      .st-rail{position:absolute;inset:0 auto 0 0;width:var(--st-rail-w);pointer-events:auto;
        display:flex;flex-direction:column;min-height:0;
        background:var(--st-surface);border:none;
        border-radius:0 var(--st-radius-lg,16px) var(--st-radius-lg,16px) 0;
        /* The left-entry twin of the sheet's shadow: this card is attached to the left frame and
           comes in from that edge, so its cast goes right, away from where it is anchored. */
        box-shadow:var(--st-panel-rim),var(--st-panel-shadow-right);
        animation:st-rail-in var(--st-motion-open,180ms) var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-rail-in{from{transform:translateX(-18px);opacity:0}to{transform:none;opacity:1}}
      /* Leaving is the entrance run backwards, and faster: an exit only has to get out of the way.
         A closing overlay keeps its node for the duration, so the animation is seen instead of the
         element vanishing between frames. */
      .st-closing .st-rail{animation:st-rail-out var(--st-motion-close,140ms) var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-rail-out{from{transform:none;opacity:1}to{transform:translateX(-18px);opacity:0}}
      .st-rail-collapsed{display:none}
      /* The scrim is invisible: the page stays readable while the outline is open, and a dimming
         layer over the manuscript would defeat the point of glancing at the contents. */
      .st-rail-scrim{position:absolute;inset:0;z-index:calc(var(--st-layer-rail) - 1);background:transparent}
      /* The few gaps that used to be inline styles on individual elements. They are the same steps as
         the scale above, named by what they do \u2014 the margin between two rows, a hint under its field,
         a block of evidence under a section \u2014 so the JSX says what the gap is FOR and the number
         lives in one place with every other number. */
      .st-gap-under-row{margin-bottom:var(--st-space-12,12px)}
      .st-gap-under-hint{margin-bottom:var(--st-space-8,8px)}
      .st-gap-over-row{margin-top:var(--st-space-8,8px)}
      .st-gap-over-section{margin-top:var(--st-space-12,12px)}
      .st-mid{flex:1 1 auto;min-width:0}
      .st-rail-toggle{display:inline-flex;align-items:center;justify-content:center;
        /* flex: none below already forbids shrinking; max-width/max-height said the same thing twice
           more, which is three places to keep in step for one intention. */
        /* The hit target, not the compact row step. It was 26 square \u2014 the size of a chip inside a
           field \u2014 and it is not inside a field: it is the first control in the title row, beside
           buttons that all sit at 26 with a gap. At the shared target step it is as reachable as
           anything else in that row and no longer reads as decoration. */
        width:var(--st-btn-h-lg,36px);height:var(--st-btn-h-lg,36px);padding:0;
        border:none;background:transparent;color:var(--st-text-primary);cursor:pointer;white-space:nowrap;
        border-radius:var(--st-radius-pill,999px);flex:none;corner-shape:round;
        /* The leading inset is the titlebar's own padding (the same leading clearance the shelf
           head takes) \u2014 no per-button margin on top of it, so both views start their row at the
           same distance from the frame edge. */}
      /* The rail's own scroll box fills the card: the tree is longer than the card on any book
         with more than a handful of sections, and a box sized to its content pushed the last row
         past the bottom edge instead of scrolling to it. */
      .st-rail .st-scroll{flex:1 1 auto;min-height:0}
      .st-scroll{overflow:auto;padding:var(--st-space-12,12px);min-height:0;min-width:0}
      /* ---- the shared master-detail split: \u6982\u89C8 / \u63D0\u6848 / \u6D41\u6D3E ---- */
      .st-split{display:flex;gap:var(--st-board-gap);flex:1 1 auto;min-height:var(--st-split-min-h,320px);min-width:0}
      .st-split-list{flex:0 0 var(--st-split-list-w,220px);min-width:0;min-height:0;
        display:flex;flex-direction:column;overflow:hidden;padding:0}
      .st-split-detail{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;min-height:0;
        overflow:hidden;border:var(--st-hairline,.5px) solid var(--st-ink-edge);
        border-radius:var(--st-radius-md,12px);corner-shape:round;background:var(--st-surface)}
      .st-split-detail-head{display:flex;align-items:baseline;gap:var(--st-space-8,8px);flex:none;
        padding:var(--st-board-inset-compact) var(--st-board-inset);
        border-bottom:var(--st-hairline,.5px) solid var(--st-ink-hair)}
      .st-split-detail-title{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong);
        color:var(--st-text-primary)}
      .st-split-detail-meta{flex:none;margin-left:auto;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-split-detail-body{flex:1 1 auto;min-height:0;overflow:auto;
        display:flex;flex-direction:column;gap:var(--st-board-gap);padding:var(--st-board-inset)}
      .st-card{border:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));border-radius:var(--st-radius-md,12px);
        padding:var(--st-space-12,12px) var(--st-space-12,12px);margin-bottom:var(--st-space-8,8px);background:var(--st-surface);min-width:0}
      .st-card[data-status="pending"]{border-color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-card[data-status="final"]{border-color:var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-card[data-collapsed="true"]{padding:var(--st-space-8,8px) var(--st-space-12,12px)}
      /* THE ONE LIST. Chapters, proposals and snapshots are all "a column of comparable rows":
         every row keeps its own hairline border, there is no gap between them, and the row under
         the pointer lifts off the column. Selected is the same lift with a stronger fill. */
      .st-list{display:flex;flex-direction:column;gap:var(--st-space-2);min-width:0;min-height:0;flex:1 1 auto;overflow:auto;
        padding:var(--st-space-4);
        border:var(--st-hairline) solid var(--st-ink-edge);border-radius:var(--st-radius-md,12px);corner-shape:round;
        background:var(--st-surface)}
      .st-list-row{position:relative;display:flex;flex-direction:column;gap:var(--st-space-2,2px);
        width:100%;min-width:0;box-sizing:border-box;
        padding:var(--st-space-10,10px) var(--st-space-12,12px);
        border:none;background:transparent;text-align:left;font-family:inherit;
        color:var(--st-text-primary);
        border-radius:var(--st-radius-sm,8px);corner-shape:round;
        transition:background var(--ds-transition-duration-fast,140ms) var(--ds-ease-in-out,ease-in-out)}
      .st-list-row:hover{background:var(--st-list-hover)}
      .st-list-row[data-active="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary)}
      button.st-list-row{cursor:pointer}
      .st-list-row-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-strong)}
      .st-list-row[data-active="true"] .st-list-row-title{font-weight:var(--st-font-weight-strong)}
      .st-list-row-meta{min-width:0;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary)}
      /* A character card: a name row, one row of short fields, then the notes.
         One field per line made a 178px card out of a name, a role, a goal and a few traits \u2014 two
         people filled the drawer and the rest was scrolling. The name gets its own line because it
         is what the row is about; the other three share the next one. */

      /* ---- input fields: one borderless convention ----
         Every field in the panel is a soft well, not a boxed control: a quiet layer fill, no
         stroke, and the focus ring as the only edge. A page of prose ringed with .5px rectangles
         reads as a form to fill in, and the editor itself \u2014 the largest input here \u2014 is already
         borderless. This is the rule the rest of the panel now follows instead of each field
         carrying its own border and its own radius. */
      .st-input,.st-find-input,.st-chat-input,.st-scan-steer-input{
        box-sizing:border-box;min-width:0;background:var(--st-surface);
        color:var(--st-text-primary);border:none;border-radius:var(--st-radius-sm,8px);
        padding:var(--st-space-4,4px) var(--st-space-8,8px);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        outline:none}
      .st-input::placeholder,.st-find-input::placeholder,
      .st-chat-input::placeholder,.st-scan-steer-input::placeholder{color:var(--dsw-alias-label-dimmed,var(--st-fallback-ink-dimmed))}
      /* Focus is the edge: the ring appears, and nothing shifts, because the border that used to
         change colour is gone and no replacement width is added. */
      .st-input:focus,.st-find-input:focus,.st-chat-input:focus,
      .st-scan-steer-input:focus{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      /* The panel's own dropdown and file trigger. Both exist because the browser's native
         controls paint outside the panel's stacking order: the log filter's option list was
         covered by the control itself, and a bare file input is an OS widget in the middle of
         a styled form. The popup here is a child of the panel, so it always sits above it. */
      .st-dropdown{position:relative;display:inline-flex;min-width:0;max-width:100%}
      .st-dropdown-button{box-sizing:border-box;display:inline-flex;align-items:center;gap:var(--st-space-8,8px);
        width:100%;height:var(--st-row-height,34px);padding:0 var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);background:var(--st-surface);
        color:var(--st-text-primary);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);text-align:left;
        cursor:pointer;outline:none;white-space:nowrap}
      .st-dropdown-button:hover{background:var(--st-hover-fill)}
      .st-dropdown-button:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-dropdown-value{min-width:0;overflow:hidden;text-overflow:ellipsis}
      .st-dropdown-list{position:absolute;z-index:var(--st-layer-menu);top:calc(100% + 4px);left:0;
        display:flex;flex-direction:column;min-width:100%;max-width:min(320px,calc(100vw - 48px));
        max-height:min(46vh,320px);overflow:auto;padding:var(--st-space-4,4px);
        border-radius:var(--st-radius-md,12px);corner-shape:round;background:var(--st-surface-high);
        box-shadow:var(--dsw-elevation-prominent,0 0 0 .5px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.12));
        scrollbar-width:thin}
      .st-dropdown-option{display:block;width:100%;padding:var(--st-space-8,8px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);corner-shape:round;background:transparent;
        color:var(--st-text-primary);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);text-align:left;
        cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-dropdown-option:hover{background:var(--st-hover-fill)}
      .st-dropdown-option[aria-selected="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary);font-weight:var(--st-font-weight-strong)}
      .st-file-button{display:inline-flex;align-items:center;min-width:0}
      .st-file-input{position:absolute;width:0;height:0;opacity:0;pointer-events:none}
      /* A field that is only a line of text in a row (renaming a node in the outline) keeps the
         fill but drops the padding: it sits inside the row, not on a page of its own. */
      /* Buttons are text with a hover wash, not bordered chips. A writing surface ringed with
         outlines reads as a form; the host's own toolbars are flat, and so is this. */
      /* Buttons are equal-height pills: one height token, the shape closed by the pill radius,
         and the circle case (a button holding only an icon) falls out of equal width and
         height for free. Inline controls that live inside a text row (the outline's rename and
         remove marks) override --st-btn-h down to the compact row instead of inheriting it. */
      .st-btn{font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        height:var(--st-btn-h,var(--st-btn-h-lg,36px));min-width:var(--st-btn-h,var(--st-btn-h-lg,36px));
        padding:0 var(--st-space-12,12px);
        display:inline-flex;align-items:center;justify-content:center;
        border-radius:var(--st-radius-pill,999px);border:none;corner-shape:round;
        background:transparent;color:var(--st-text-secondary);cursor:pointer;white-space:nowrap;flex:none}
      .st-btn:hover:not(:disabled){background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-btn:active:not(:disabled){background:var(--st-active-fill);color:var(--st-text-primary)}
      .st-btn:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink);outline:none}
      .st-btn:disabled{opacity:.45;cursor:not-allowed}
      /* The affirmative button fills with the accent, like everything else that means "this one".
         It used to take the host's primary fill, which is the brand token: on the dark theme that
         is near-white, so the confirm button in every dialog was the same white slab as the page's
         own controls and the panel's colour appeared nowhere. */
      /* The affirmative button fills with the accent, like everything else that means "this one".
         Its horizontal padding sits a step above the other buttons: a capsule whose two end arcs
         are the widest thing in the shape reads as an oval \u2014 the straight run between the ends
         is what makes a pill read as a pill, and a short label needs the extra padding to show it. */
      .st-btn-primary{background:var(--st-accent,#c3272b);color:var(--st-on-accent,#fff);
        padding:0 var(--st-space-16,16px)}
      /* The session button is the title row's one OUTLINE pill: no fill, so no control dominates
         the row. Its edge is a slow multi-hue light \u2014 the flowing ring \u2014 drawn by a pseudo-element
         masked to a thin band, so the gradient follows the pill's radius and the centre stays
         open for the label. The hue cycle is a registered custom property: conic gradients
         interpolate the angle, which makes the light run around the ring and loop seamlessly. */
      /* The session button's label carries the accent's own light: the gradient is clipped to the
         GLYPHS (background-clip: text), so the button keeps a quiet outline-free body and only
         the word Harness flows. Hover lifts the light instead of washing a box behind it. */
      .st-session-btn{font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        height:var(--st-btn-h,var(--st-btn-h-lg,36px));min-width:var(--st-btn-h,var(--st-btn-h-lg,36px));
        display:inline-flex;align-items:center;justify-content:center;
        padding:0 var(--st-space-16,16px);
        border:none;border-radius:var(--st-radius-pill,999px);cursor:pointer;white-space:nowrap;flex:none;corner-shape:round;
        background:transparent;color:var(--st-text-primary)}
      .st-session-btn:hover{background:var(--st-hover-fill)}
      /* The flowing outline is a button VARIANT, not a page-local decoration: it keeps the
         standard pill geometry and shares the same focus/hover rules as every other st-btn. */
      .st-btn-flow{position:relative;isolation:isolate;color:var(--st-text-primary)}
      .st-btn-flow::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:var(--st-flow-border-w);
        pointer-events:none;
        background:conic-gradient(from var(--st-flow-angle),var(--st-accent),color-mix(in srgb,var(--st-accent) 38%,#fff),var(--st-accent));
        -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
        -webkit-mask-composite:xor;
        mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
        mask-composite:exclude;
        animation:st-flow-ring var(--st-flow-duration) linear infinite}
      .st-btn-flow-label{position:relative}
      @property --st-flow-angle{syntax:'<angle>';inherits:false;initial-value:0deg}
      @keyframes st-flow-ring{to{--st-flow-angle:360deg}}
      @media (prefers-reduced-motion: reduce){.st-btn-flow::before{animation:none}}
      /* The flowing light lives on the LABEL, not on the button: the wash a hover paints must
         stay on the button's own background, which it cannot be while that background is clipped
         into the glyphs. */
      .st-session-label{background-image:var(--st-session-text-flow);background-size:200% 100%;
        -webkit-background-clip:text;background-clip:text;color:transparent;
        font-style:italic;font-weight:var(--st-font-weight-strong,600);
        animation:st-session-text-flow var(--st-session-text-dur,5s) linear infinite}
      .st-session-btn:hover .st-session-label{filter:brightness(1.15)}
      .st-session-btn:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      @keyframes st-session-text-flow{from{background-position:0% 0}to{background-position:200% 0}}
      @media (prefers-reduced-motion: reduce){.st-session-label{animation:none}}
      .st-btn-primary:hover:not(:disabled){background:color-mix(in srgb, var(--st-accent) 86%, #000000);color:var(--st-on-accent,#fff)}
      /* The hero size for a page whose only action is this one button. It is a step on the same
         size ladder, not a local override: height, type and padding move together. */
      .st-btn.st-btn-xl{--st-btn-h:var(--st-btn-h-xl,48px);font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        padding:0 var(--st-space-24,24px)}
      .st-btn-ghost{background:transparent;padding:0 var(--st-space-8,8px);color:var(--st-text-tertiary)}
      .st-btn-ghost:hover:not(:disabled){background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-btn-ghost:active:not(:disabled){background:var(--st-active-fill);color:var(--st-text-primary)}
      /* An icon-only button is the same 36px control as every other st-btn: one height token,
         one pill radius, and no text padding. It is a variant, not a bespoke square. */
      .st-btn-ghost.st-btn-icon{padding:0;background:var(--st-bg);
        box-shadow:inset 0 0 0 var(--st-hairline) var(--st-ink-edge)}
      /* Inputs keep a hairline: a field with no edge at all disappears into the page. */
      .st-btn[aria-pressed="true"]:not(:disabled),.st-btn[aria-pressed="true"]:hover:not(:disabled){background:var(--st-selected-fill);color:var(--st-text-primary)}
      /* The panel's own tooltip: a dark bubble opening DOWNWARD from the control, with a small
         caret pointing back up at it. It sits on the same grey layer every popover uses \u2014 a
         raised card like the rest, not a darker-than-page mix, which on the pure-black ground
         had nothing left to darken into. */
      .st-tip{position:absolute;z-index:var(--st-layer-menu);transform:translateX(-50%);
        pointer-events:none;padding:var(--st-space-4,4px) var(--st-space-12,12px);
        border:var(--st-hairline) solid color-mix(in srgb, #fff 14%, transparent);border-radius:var(--st-radius-sm,8px);corner-shape:round;
        background:var(--st-surface);
        color:#fff;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        white-space:nowrap;box-shadow:0 2px 8px color-mix(in srgb, #000 30%, transparent)}
      .st-tip::after{content:'';position:absolute;top:calc(-1 * var(--st-space-4,4px));left:calc(50% - var(--st-space-4,4px));
        width:var(--st-space-8,8px);height:var(--st-space-8,8px);background:inherit;
        transform:rotate(45deg);border-radius:var(--st-hairline)}
      .st-row{display:flex;gap:var(--st-space-8,8px);align-items:center;min-width:0}
      .st-spacer{flex:1 1 auto;min-width:0}
      .st-muted{color:var(--st-text-tertiary);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      .st-scan-where{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary)}
/* The two halves of a diff sit next to each other with nothing between them, so a deleted
         run and the added run that replaces it read as one string. A hair of horizontal padding
         and a small gap separates them without adding punctuation that is not in the text.
         The fills are mixed from the theme's diff colours at low strength rather than used whole:
         a solid green-and-red block inside a page of prose shouts, and the point of the diff is to
         point at the change, not to become the loudest thing on screen. */
      /* Opaque, not a translucent wash.
         The host's diff tokens are alpha 8-12%, which over dark prose is barely a tint and over
         light prose is invisible \u2014 and because a word diff alternates
         added and removed runs, a stack of faint washes reads as visual noise rather than as a
         change. These blocks are mixed from the theme's own opaque greens and reds at a strength
         chosen to stay readable behind text, and the text colour is set to match so the words on
         top are not fighting their own background. */
      .st-add{background:color-mix(in srgb, var(--dsw-static-green-500,var(--st-fallback-green)) 22%, var(--dsw-alias-bg-base,var(--st-fallback-page)));
        color:var(--st-text-primary);
        border-radius:var(--st-radius-xs,4px);padding:0 var(--st-space-2,2px);
        box-decoration-break:clone;-webkit-box-decoration-break:clone;corner-shape:round;}
/* A removed run is a wash, an added run is a block: what is gone should recede, what is new
         should be read. The deletion is genuinely translucent \u2014 it sits over the page rather than
         replacing it \u2014 while the addition stays opaque so it does not disappear into the prose. */
      .st-del{background:color-mix(in srgb, var(--dsw-static-red-400,#f25a5a) 22%, transparent);
        text-decoration:line-through;text-decoration-thickness:1px;
        color:var(--st-text-secondary);
        border-radius:var(--st-radius-xs,4px);padding:0 var(--st-space-2,2px);margin-right:var(--st-space-2,2px);
        box-decoration-break:clone;-webkit-box-decoration-break:clone;corner-shape:round;}
      /* The words either side of an INSERTION, at low opacity and slightly smaller: they are there
         for orientation, not to be read. They must never compete with the suggestion itself. */
      .st-ctx{opacity:.34;font-size:95%;letter-spacing:.01em}
      .st-ctx-before{margin-right:var(--st-space-2,2px)}
      .st-ctx-after{margin-left:var(--st-space-2,2px)}
      /* An ellipsis marks a cut in the context, so a short window does not look like the whole of
         the surrounding prose. */
      .st-ctx-before::before,.st-ctx-after::after{content:'\u2026';opacity:.6;margin:0 var(--st-space-2,2px)}
      /* An insertion has no diff styling: it is not a change to existing text, it is a sentence
         being added, and marking it green (or tinted) made it look like an edit. The contrast with
         the faded neighbours is what separates it \u2014 no colour needed. */
      .st-insert{color:var(--st-text-primary)}
      /* The pending completion: pale text under the caret, the host's code face. */
      .st-warn{padding:var(--st-space-8,8px) var(--st-space-12,12px);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn));
        border-bottom:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      /* The merged manuscript reads as a document, not as source: the headings carry the level
         structure the generator wrote, and the prose is the writer's own face and measure. */
`;

// src/client/panel/core.css.js
var CSS_CORE = `
      /* ---- the manuscript preview: headings, paragraphs, rules, and the issue marks in the text ---- */
      .st-manuscript{margin:var(--st-space-8,8px) 0 0;padding:var(--st-space-16,16px) var(--st-space-16,16px);max-height:min(60vh,640px);overflow:auto;
        word-break:break-word;font-family:var(--st-font-family);font-size:var(--st-text-md);line-height:1.9;
        color:var(--st-text-primary);background:var(--st-surface-high);
        border-radius:var(--st-radius-md,12px)}
      .st-md-h{margin:1.1em 0 .5em;font-weight:var(--st-font-weight-strong);line-height:1.4;color:var(--st-text-primary)}
      .st-md-h:first-child{margin-top:0}
      .st-md-h1{font-size:var(--st-text-xl)}
      .st-md-h2{font-size:var(--st-text-lg)}
      .st-md-h3{font-size:var(--st-text-lg)}
      .st-md-h4,.st-md-h5,.st-md-h6{font-size:var(--st-text-lg);color:var(--st-text-secondary)}
      .st-md-p{margin:0 0 .85em;text-indent:2em}
      .st-md-p:last-child{margin-bottom:0}
      .st-md-rule{border:none;border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));margin:1.2em 0}
      .st-issue{display:flex;gap:var(--st-space-8,8px);align-items:baseline;padding:var(--st-space-4,4px) 0;font-size:var(--st-text-md);line-height:var(--st-line-height-ui)}
      /* Scrollbars: the host themes them; leaving them default is the most visible inconsistency. */
      .st-scroll{scrollbar-gutter:stable}
      .st-scroll::-webkit-scrollbar{width:var(--st-space-12,12px);height:var(--st-space-12,12px)}
      .st-scroll::-webkit-scrollbar-track{background:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar));border-radius:var(--st-radius-pill,999px);corner-shape:round;margin:var(--st-space-2,2px)}
      .st-scroll::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar));border-radius:var(--st-radius-pill,999px);corner-shape:round}
      .st-scroll::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,var(--st-fallback-scrollbar-hover))}
      .st-scroll{scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar)) transparent}
      /* Text selection follows the theme instead of the browser default blue.
         It is mixed from the ACCENT, not filled with a surface token: the module-platform token is
         a page background (a near-white grey), so the selection read as a grey slab laid over the
         text and the ink under it disappeared into the slab. A tint of the brand colour at low
         opacity marks the range and leaves the words readable, which is the only thing a
         selection has to do. */
      .st-shell::selection{background:color-mix(in srgb, var(--st-accent) 26%, transparent);
        color:var(--st-text-primary)}
      /* Destructive hover on the book delete affordance. */
      /* Caption tier: quieter than secondary, for counts and metadata. */
      .st-caption{color:var(--st-text-tertiary);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      /* Rail toggle: a proper hit target rather than a bare glyph. */
      /* The page owns the full width now: the outline floats over it instead of taking a column. */
      .st-mid{padding:0 var(--st-space-4,4px);position:relative}
      /* The overlay covers the page and nothing else: the title bar stays reachable, which is
         where its toggle lives. */
      .st-root{position:relative}
      /* The library: a card grid, using the host's raised-surface radius. */

      /* ---- the sheet: a drawer that drops from the title row, and the desk under it ---- */
      .st-shell{position:relative}
      /* A centred dialog over the panel. It is absolute, not fixed: the host's centre column has
         overflow: hidden, and a fixed overlay is clipped by it, which is why the sheet was a narrow
         strip in the wrong place. */
      /* The backdrop is only a dimming layer now: the panel itself is flush against the right edge,
         so there is nothing to centre. */
      /* Below the title bar, never over it. A full-inset overlay covered the whole shell including
         the title row, so the book name and the panel buttons were dimmed and unclickable while a
         drawer was open \u2014 and the controls you need to close it live in that row. The offset is the
         title row's own height, declared once on the shell. */
      .st-sheet-backdrop{position:absolute;inset:var(--st-titlebar-height,68px) 0 0 0;z-index:var(--st-layer-drawer);
        display:flex;align-items:stretch;justify-content:flex-end;
        /* No wash over the page.
           A panel that slides in from the edge is not a modal: the manuscript beside it stays
           readable and stays the surface the writer is working on. Dimming it said "you cannot use
           this until you close the drawer", which was never true \u2014 the drawer is reference material
           consulted WHILE writing. Its separation is the flyout shadow on the panel itself, which
           is exactly what a shadow is for; a second dim on top of it was doing the same job twice
           and painting the page grey to do it.
           The layer stays because it is the click-away target and the panel's positioning context. */
        background:transparent}
      /* A panel that comes in from the right: full height, rounded on its inner edge only, like the
         outline rounded on its right edge. The two corners against the frame stay square.
         Its depth is two things, not one: the flyout shadow (dark, thrown LEFT, the direction it
         arrived from) and an inner rim along the top edge. The single lv3 shadow it used to carry
         is a card recipe \u2014 right for a 184px card, invisible under a 700px panel that reaches the
         top and bottom edges. */
      .st-sheet{display:flex;flex-direction:column;
        height:100%;max-height:none;overflow:hidden;
        border:none;border-radius:var(--st-radius-panel,28px) 0 0 var(--st-radius-panel,28px);
        background:var(--st-surface-high);
        box-shadow:var(--st-panel-rim),var(--st-panel-shadow-left);
        font-family:var(--st-font-family);font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-primary);animation:st-sheet-in var(--st-motion-open,180ms) var(--ds-ease-in-out,ease-in-out) both;
        /* Width follows the CONTENT, not a tier. Three fixed sizes were still a guess: a cast with
           two people got a 560px panel mostly full of nothing, and a graph with twelve needed more
           than 820. Sizing to fit takes what the content asks for, with a floor so a one-line
           panel is not a strip and a ceiling a page may raise, capped by the window. */
        width:fit-content;min-width:min(320px,100%);
        max-width:min(var(--st-sheet-max),100%)}
      /* A panel that names a width tier keeps that width; only the tierless ones size to their
         content. The history panel is prose and its width used to jump with the longest answer. */
      .st-sheet[data-size]{width:var(--st-sheet-max)}
      @keyframes st-sheet-in{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
      .st-closing .st-sheet{animation:st-sheet-out var(--st-motion-close,140ms) var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-sheet-out{from{transform:none;opacity:1}to{transform:translateX(24px);opacity:0}}
      .st-closing .st-sheet-backdrop{animation:st-scrim-out var(--st-motion-close,140ms) ease both}
      @keyframes st-scrim-out{from{opacity:1}to{opacity:0}}
      @media (max-width: 640px){
        /* Below this the content cannot lay itself out in a column narrower than the window, so the
           panel takes the whole width and drops its rounded inner edge. */
        .st-sheet{width:100%;min-width:0;border-radius:0}
      }
      .st-sheet-head{display:flex;align-items:center;gap:var(--st-space-8,8px);padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-12,12px);flex:none;
        border-bottom:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-sheet-title{margin:0;font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong)}
      .st-sheet-body{flex:1 1 auto;min-height:0;overflow:auto;padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-16,16px)}
      /* An icon and a label in one control: flex with centred alignment, or the svg sits on the
         text baseline and rides above it. The gap is the space between them. */
      /* Title-row buttons share the rail toggle's height, so the row is a line of EQUAL pills \u2014
         the 40px circle at the left end and these at the right end are the same object. */
      /* Title-row buttons read as chrome on the frame: their ink is the theme's primary label \u2014
         white on the dark theme \u2014 not the quieter secondary the inner-panel ghosts use, which
         all but disappears against the frame edge. The session button's flowing label paints its
         own gradient and is untouched by this. */
      .st-titlebar .st-btn{color:var(--st-text-primary)}
      .st-titlebar .st-rail-toggle{color:var(--st-text-primary)}
      .st-drawer-btn{display:inline-flex;align-items:center;gap:var(--st-space-4,4px);
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);padding:0 var(--st-space-8,8px)}
      /* Icons never stretch or shrink with the label beside them. */
      .st-drawer-btn .st-bar-icon{display:block}
      /* The writing surface: one uninterrupted editor with its own header. */
      /* The desk fills the column instead of floating in its middle: the editor is the page, so
         it takes every pixel the header leaves and scrolls internally. Its width is a variable
         because the writer can set it, and the two text layers read their metrics from the same
         three variables so they cannot drift apart. */
      .st-mid-body{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;min-width:0}
      .st-desk{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;width:100%;
        max-width:var(--st-width,760px);margin:0 auto;padding:var(--st-space-16,16px) var(--st-space-24,24px) 0}
      /* The dock slot is the panel's bottom edge in every state \u2014 box open, folded to the
         hairline, or idle. The desk's bottom padding would sit UNDER the hairline as a strip of
         dead page and push the line off the edge, so the padding moves into the slot itself:
         content keeps its breathing room above the line, and the line touches the edge. */
      .st-desk{padding-bottom:0}
      .st-dock-slot{padding-top:var(--st-space-16,16px)}
      .st-desk-head{display:flex;align-items:center;gap:var(--st-space-12,12px);margin-bottom:var(--st-space-16,16px);flex-wrap:wrap}
      .st-desk-title{margin:0;font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong)}
      /* flex:1 plus a zero min-height is what makes a textarea take the remaining height: without
         the min-height reset a flex child refuses to shrink and the editor collapses to one line. */
      .st-editor-wrap{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
      /* A transparent textarea over a painted copy of the same text: the copy is what draws the
         continuation and the search hits, while the textarea keeps the caret, selection and input
         handling. Both layers share every metric \u2014 including the width the scrollbar eats, which
         is measured and applied to the paint layer, or the two wrap at different points. */
      .st-editor-stack{position:relative;display:flex;flex:1 1 auto;min-height:var(--st-editor-min-h,140px);min-width:0}
      .st-editor-paint,.st-editor-over{font-family:inherit;font-size:var(--st-font-size,16px);
        line-height:var(--st-line-height,1.9);
        padding:0;margin:0;border:0;letter-spacing:normal;word-spacing:normal;
        white-space:pre-wrap;overflow-wrap:break-word;word-break:break-word;
        tab-size:4;box-sizing:border-box}
      .st-editor-paint{position:absolute;inset:0;overflow:hidden;pointer-events:none;
        color:var(--st-text-primary)}
      /* The continuation reads as "the sentence going on", so it is the same text in a lighter
         ink rather than a block underneath. */
      .st-editor-full{flex:1 1 auto;min-height:0;resize:none}
      .st-editor-over{position:relative;width:100%;height:100%;background:transparent;
        color:transparent;caret-color:var(--st-text-primary);outline:none;resize:none;
        overflow:auto;scrollbar-gutter:stable}
      /* The overlay is transparent ink drawn ON TOP of the paint layer, so its selection must be
         a tint without a colour: filling it with a surface token covered the visible text with a
         grey rectangle. A tint over a transparent fill marks the range and lets the paint show. */
      .st-editor-over::selection{background:color-mix(in srgb, var(--st-accent) 26%, transparent);color:transparent}
      /* A selection the textarea cannot draw because focus moved away \u2014 the composer, a button \u2014
         is drawn here instead. It is mixed from the accent so it is unmistakably a selection and
         still quieter than a live one: the module-platform token is only a few points off the page
         background, which made the passage look unselected again, the exact thing this is here to
         prevent. */
      .st-selected{background:color-mix(in srgb, var(--st-accent) 26%, transparent);
        border-radius:var(--st-radius-xs,4px);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--st-accent) 38%, transparent)}
      /* A search hit is a wash behind the glyphs; the current one also gets a ring. The text
         colour is deliberately left alone: overriding it made the highlighted word unreadable on
         some themes, and a highlight that recolours the words it marks is worse than one that
         does not. A colour mix rather than a background token keeps the wash visible on both the
         light and the dark page. */
      .st-hit{background:color-mix(in srgb, var(--st-accent) 30%, transparent);
        border-radius:var(--st-radius-xs,4px)}
      .st-hit[data-active="true"]{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,var(--st-fallback-warn)) 55%, transparent);
        box-shadow:inset 0 0 0 1px var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      /* The find bar: one row above the page, never over it, so the text does not reflow while
         the writer moves between hits. */
      /* In the header row: no margin of its own, and allowed to shrink, or it would push the
         header wider than the measure on a narrow window. */
      .st-find{display:flex;align-items:center;gap:var(--st-space-4,4px);flex:0 1 auto;min-width:0}
      /* The search field is one of the shared borderless fields; only its width belongs here.
         It sits in the header row, so it keeps the row's height rather than the page's. */
      .st-find-input{width:var(--st-find-w,170px);min-width:var(--st-find-min-w,60px);flex:0 1 auto;padding:var(--st-space-2,2px) var(--st-space-8,8px)}
      .st-find-count{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        flex:none;font-variant-numeric:tabular-nums}
      /* Typography: three rows of named steps.
         A fixed width on the page, not fit-content: the preview's text gets wider as the size goes
         up, and a panel that resized itself while the writer compared sizes made the comparison
         useless. One width for all three settings. */
      /* A DEFINITE width, then a percentage cap. min(340px, 100%) looks equivalent and is not: a
         percentage width counts as auto while the drawer measures its content, so the preview's
         text at 20px made the sheet 860px wide and at 14px 624px \u2014 the panel resized itself when
         the writer changed the size, which is exactly what the preview must not do. */
      .st-type{display:flex;flex-direction:column;gap:var(--st-space-8,8px);width:var(--st-settings-w,340px);max-width:100%}
      .st-type-row{display:flex;align-items:center;gap:var(--st-space-12,12px);min-width:0}
      .st-type-label{flex:none;width:var(--st-gutter-w,52px);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary)}
      /* The segmented control: one track, the chosen step raised inside it. Cheaper than three
         sliders and it says how many choices there are before you touch it. */
      .st-seg{display:inline-flex;align-items:center;gap:var(--st-space-2,2px);min-width:0;padding:var(--st-space-2,2px);
        border-radius:var(--st-radius-pill,999px);corner-shape:round;background:var(--st-surface);
        box-shadow:inset 0 0 0 var(--st-hairline) var(--dsw-alias-border-l2,var(--st-fallback-border-l2))}
      .st-seg-item{font-family:inherit;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);padding:var(--st-space-2,2px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-pill,999px);background:transparent;corner-shape:round;
        color:var(--st-text-secondary);cursor:pointer;white-space:nowrap}
      .st-seg-item:hover{background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-seg-item:active{background:var(--st-active-fill)}
      .st-seg-item:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-seg-item[aria-pressed="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary);
        box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--st-fallback-border-l4))}
      /* A FIXED frame, and a smaller one than before: the sample is one line, so the frame is one
         line of the largest offered type plus padding \u2014 72px, not the 150px the three-line copy
         needed. Fixed, not content-sized: the frame must not jump when the type changes. */
      .st-type-preview{height:var(--st-preview-h,72px);padding:var(--st-space-12,12px) var(--st-space-16,16px);border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface);color:var(--st-text-primary);
        box-shadow:inset 0 0 0 var(--st-hairline) var(--dsw-alias-border-l2,var(--st-fallback-border-l2));
        overflow:hidden;contain:content}
      .st-type-preview-in{white-space:pre-wrap;overflow-wrap:anywhere}
      .st-type-foot{display:flex;justify-content:flex-end}
      /* The settings page: named groups, because it now holds two unrelated kinds of preference.
         Without a heading the page reads as one long form and the saving row looks like a fourth
         type setting. A hairline between groups is enough \u2014 a card around each would make the
         drawer look like a form to submit rather than a panel that applies as you press. */
`;

// src/client/panel/library.css.js
var CSS_LIBRARY = `
      /* ---- the library: the shelf of books, and the dialogs over it ---- */
      /* The welcome page is a DOT CANVAS, the way a design tool's empty state is: the lattice
         says "work surface, not document", and a second, brighter dot layer is revealed in a
         circle around the pointer, so the field answers the mouse. The bright layer is the same
         lattice in stronger ink, masked to a position the component writes into CSS variables
         on pointermove. */
      .st-canvas{position:relative;
        background-image:radial-gradient(var(--st-canvas-dot) var(--st-canvas-dot-size), transparent 0);
        background-size:var(--st-canvas-grid) var(--st-canvas-grid)}
      .st-canvas::before{content:'';position:absolute;inset:0;pointer-events:none;
        background-image:radial-gradient(var(--st-canvas-dot-bright) var(--st-canvas-dot-size), transparent 0);
        background-size:var(--st-canvas-grid) var(--st-canvas-grid);
        -webkit-mask-image:radial-gradient(circle var(--st-canvas-glow) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px), #000, transparent);
        mask-image:radial-gradient(circle var(--st-canvas-glow) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px), #000, transparent)}
      .st-library{flex:1 1 auto;min-height:0;overflow:auto;padding:var(--st-space-8,8px) var(--st-shelf-gutter) var(--st-space-24,24px)}
      /* The head carries .st-titlebar (the titlebar row recipe): divider, paddings and the
         leading clearance all come from there. What is local: the gap to the grid below, and
         the min-width floor for the truncating title. */
      .st-library-head{margin-bottom:var(--st-space-16,16px);min-width:0}
      .st-library-title{margin:0;font-size:var(--st-text-xl);line-height:var(--st-text-xl-leading);font-weight:var(--st-font-weight-strong);color:var(--st-text-primary)}
      /* The shelf's cards ARE the board's gallery cards: one component, one size, one set of
         shadows, so the two places the writer browses look like one system. What is left here is
         the part a gallery card does not provide \u2014 the two inline editors and the body inside a
         card. Shadows are mixed from the theme ink rather than written as black: a literal rgba
         shadow is invisible on a dark theme, which is exactly how the old shelf card disappeared. */
      .st-book-card{display:flex;flex-direction:column;gap:var(--st-space-4,4px);padding:var(--st-space-16,16px) var(--st-space-16,16px);text-align:left;
        font-family:inherit;
        border:var(--st-hairline) solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);background:var(--st-surface);color:var(--st-text-primary);
        /* The shared card recipe: a book and a character sit at the same height because they read
           the same two tokens, not because two rules were written to agree. */
        box-shadow:var(--st-card-shadow);
        /* The hovered card lifts, like every other card in the panel: the row of covers reads as
           pickable objects rather than as text tiles. */
        transition:var(--st-card-motion)}
      .st-book-card:hover{transform:translateY(-2px);box-shadow:var(--st-card-shadow-lift)}
      .st-book-meta{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-secondary)}
      /* The two trailing tiles are CARDS, not buttons: same width, same radius, same dashed edge as
         a book card, so the last cell of the grid lines up with the ones before it. A fluid-width
         tile in a fixed-width grid was visibly a different size \u2014 the thing the writer pointed at. */
      .st-book-new{width:var(--st-gallery-w);box-sizing:border-box;
        /* The same height as a book card, for the same reason: the grid's last cell is a card too. */
        height:var(--st-book-card-h);
        align-items:center;justify-content:center;text-align:center;
        border-style:dashed;color:var(--st-text-secondary)}
      .st-book-plus{font-size:var(--st-text-xl);line-height:1;font-weight:var(--st-font-weight-normal)}
      /* The new-book tile is the only CONTROL in the shelf grid, and it is a real <button>. Two
         things follow from that and neither was written down: a button does not get a hand cursor
         by default, and st-book-card carries no state motion, so the tile sat perfectly still
         while every book beside it lifted under the pointer. That stillness is what read as "this
         one is not a card you can pick". The lift itself is NOT redefined here \u2014 the tile is
         grouped into the gallery card's hover rule, so there is one recipe for the whole grid. */
      .st-book-add{cursor:pointer;transition:var(--st-card-motion)}
      /* The ring is an OUTLINE, not a box-shadow. The hover state further down the sheet paints a
         box-shadow, and a focus ring written the same way would lose to it \u2014 same specificity, and
         the hover rule comes later. Outline lives on its own channel, so focus stays visible while
         the pointer is over the tile. */
      .st-book-add:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--st-focus-ink);
        outline-offset:var(--st-space-2,2px)}
      /* Pressing settles it back down. Written as :hover:active rather than :active so it beats the
         hover rule above on specificity instead of relying on source order. */
      .st-book-add:hover:active{transform:none}
      /* A form that happens to sit in the grid: same footprint as a tile, laid out as a column of
         controls rather than centred as a label. */
      .st-book-form{justify-content:flex-start;align-items:stretch;text-align:left}
      /* The click target inside a card. It is a div, not a button: the gallery card around it is
         already the button, and a button inside a button is invalid markup that browsers resolve
         by ignoring one of the two. */
      .st-book-open{display:flex;flex-direction:column;gap:var(--st-space-4,4px);flex:1 1 auto;min-width:0;
        background:none;border:none;padding:0;text-align:left;font-family:inherit;color:inherit;cursor:pointer}
      /* A real modal: the whole panel is dimmed and the question sits in a rounded card. */
      /* A dialog is centred on the PANEL, which is the surface it belongs to.
         It was fixed-positioned, and that means "the viewport" \u2014 but this panel is one occupant
         of the host's centre column, and that column clips its contents. A fixed overlay inside
         a clipped ancestor is still clipped by it, and is placed against the viewport rather than
         against the panel, so the card sat off-centre and its edges were cut. This panel's own
         sidebar comment already records the same lesson for the drawer; the dialogs had not
         learned it.
         Absolute, against the nearest positioned ancestor \u2014 the shell \u2014 centres on exactly the
         box the writer is looking at, and is not clipped by anything above it. */
      .st-backdrop{position:absolute;inset:0;z-index:var(--st-layer-modal);display:flex;align-items:center;justify-content:center;
        padding:var(--st-space-24,24px);background:color-mix(in srgb, var(--dsw-alias-bg-base,var(--st-fallback-page)) 62%, transparent);
        backdrop-filter:blur(2px)}
      .st-dialog{width:min(var(--st-dialog-w),100%);display:flex;flex-direction:column;gap:var(--st-inset-md);padding:var(--st-inset-xl);
        border-radius:var(--st-radius-panel,28px);corner-shape:round;border:var(--st-hairline) solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));
        background:var(--st-surface-high);box-shadow:var(--dsw-shadow-lv2,0 4px 12px rgba(0,0,0,.02),0 2px 8px rgba(0,0,0,.04));
        font-family:var(--st-font-family);font-size:var(--st-text-md);line-height:var(--st-line-height-ui);color:var(--st-text-primary)}
      .st-dialog-title{font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong)}
      /* A reading dialog: a fixed head with the close control, and a body that scrolls. The panel
         caps its height so a long manuscript stays one dialog rather than one very tall page. */
      .st-dialog-panel{max-height:min(84vh,var(--st-dialog-max-h))}
      .st-dialog-head{display:flex;align-items:center;gap:var(--st-space-8,8px);flex:none}
      .st-dialog-scroll{flex:1 1 auto;min-height:0;overflow:auto}
      .st-dialog-body{display:flex;flex-direction:column;gap:var(--st-space-8,8px);color:var(--st-text-secondary)}
      /* A labelled field inside a dialog: the label sits above its control, one line of small text. */
      .st-dialog-field{display:flex;flex-direction:column;gap:var(--st-space-4,4px);min-width:0}
      /* A segmented control is a compact choice, not a full-width field. As a flex child of the
         column it would otherwise stretch to the dialog's width and look like a text input. */
      .st-dialog-field>.st-seg{align-self:flex-start}
      .st-dialog-label{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-dialog-textarea{min-height:var(--st-dialog-textarea-min-h);resize:none;font-family:inherit}
      .st-dialog-error{margin:0;color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-dialog-hint{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary)}
      .st-dialog-actions{display:flex;justify-content:flex-end;gap:var(--st-space-8,8px);margin-top:var(--st-space-4,4px)}
      .st-check{display:flex;align-items:center;gap:var(--st-space-8,8px);font-size:var(--st-text-md);cursor:pointer;
        color:var(--st-text-primary)}
      /* A bottom sheet: slides up over the manuscript, rounded on its top corners only, which is
         what makes it read as "coming from the edge" rather than as a floating dialog. */
      /* The panel renders inside the host's centre column, which has overflow: hidden, so a fixed
         overlay gets clipped and the sheet shows as a narrow strip in the wrong place. Positioning
         it absolute against the panel shell covers exactly the panel, which is the surface a modal
         belongs to anyway. */
`;

// src/client/panel/welcome.css.js
var CSS_WELCOME = `
      /* ---- the welcome page: one display line, one door ---- */
      .st-welcome{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;
        padding:var(--st-space-16,16px) var(--st-welcome-gutter) var(--st-space-24,24px)}
      /* The page is a canvas, not a document: the same lattice the shelf uses, with a quiet accent
         wedge at the far edge so the empty first screen has a direction. */
      .st-welcome::after{content:'';position:absolute;right:0;bottom:0;width:38%;height:54%;pointer-events:none;
        background:linear-gradient(135deg,transparent 18%,color-mix(in srgb,var(--st-accent) 22%,transparent) 78%);
        clip-path:polygon(100% 0,100% 100%,0 100%);opacity:.55;z-index:var(--st-welcome-wedge-z)}
      .st-welcome-main{margin:auto 0;width:100%;max-width:var(--st-welcome-measure);display:flex;flex-direction:column;
        align-items:flex-start;position:relative;z-index:var(--st-welcome-main-z)}
      .st-welcome-title{display:inline-block;margin:var(--st-space-8,8px) 0 0;font-family:var(--st-font-serif);font-weight:var(--st-font-weight-normal);
        font-size:var(--st-welcome-title);line-height:var(--st-welcome-title-leading);letter-spacing:var(--st-welcome-title-tracking);
        color:var(--st-text-primary);white-space:nowrap}
      .st-welcome-accent{color:var(--st-accent)}
      .st-welcome-latin{width:fit-content;margin:var(--st-space-12,12px) 0 0 var(--st-welcome-latin-nudge);font-family:var(--st-font-serif);font-style:italic;
        font-size:var(--st-welcome-latin-size);line-height:var(--st-welcome-latin-leading);
        letter-spacing:var(--st-welcome-latin-tracking);color:var(--st-text-secondary)}
      /* One column, not four separate boxes: the gaps between the blocks are the part that most
         often caught a glyph between two headings, so the wash spans the whole copy column. The
         width follows the content, leaving the empty canvas to the right sharp. */
      /* The copy column is a layout wrapper only. The blur lives on individual glyphs (see
         glyph-field.css), never on a background patch behind the column. */
      .st-welcome-copy{display:flex;flex-direction:column;align-items:flex-start;width:fit-content;max-width:100%}
      .st-welcome-lede{width:fit-content;max-width:var(--st-welcome-measure);margin:var(--st-space-24,24px) 0 0;font-family:var(--st-font-serif);
        font-size:var(--st-welcome-lede-size);line-height:var(--st-line-height-reading);color:var(--st-text-secondary)}
      .st-welcome-cta{display:flex;flex-direction:column;align-items:flex-start;gap:var(--st-space-12,12px);
        margin-top:var(--st-space-24,24px);padding-top:var(--st-space-16,16px)}
      .st-welcome-actions{width:fit-content;display:flex;align-items:center;gap:var(--st-space-16,16px);flex-wrap:wrap}
      .st-welcome-error{margin:0;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      @media (max-width: 640px){.st-welcome-title{white-space:normal}}

      .st-welcome-back{position:absolute;z-index:var(--st-welcome-back-z);left:max(var(--st-welcome-gutter,28px),calc(var(--dsh-frame-leading-clearance,0px) + var(--st-space-8,8px)));top:var(--st-space-16,16px);
        color:var(--st-text-primary)}


`;

// src/client/panel/new-book-dialog.css.js
var CSS_NEWBOOK = `
      .st-newbook-backdrop{position:absolute;inset:0;z-index:var(--st-welcome-dialog-z);display:grid;place-items:center;
        padding:var(--st-space-24,24px);background:color-mix(in srgb,var(--st-bg,#000) 68%,transparent);
        animation:st-newbook-backdrop-in 160ms ease both}
      .st-newbook{width:min(var(--st-welcome-dialog-w),100%);display:flex;flex-direction:column;gap:var(--st-space-24,24px);
        padding:var(--st-space-24,24px);border:var(--st-hairline) solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);background:var(--st-surface-high);
        box-shadow:var(--st-card-shadow-lift);animation:st-newbook-in 180ms var(--ds-ease-in-out,ease-in-out) both}
      .st-newbook-title{margin:0;font-family:var(--st-font-serif);font-size:var(--st-welcome-dialog-title-size);
        line-height:var(--st-text-xl-leading);font-weight:var(--st-font-weight-normal);color:var(--st-text-primary)}
      .st-newbook-input{width:100%;box-sizing:border-box;padding:var(--st-space-8,8px) 0;
        border:none;border-bottom:var(--st-hairline) solid var(--st-ink-edge);border-radius:0;
        background:transparent;color:var(--st-text-primary);font-family:var(--st-font-serif);
        font-size:var(--st-welcome-dialog-input-size);line-height:var(--st-text-xl-leading);outline:none}
      .st-newbook-input::placeholder{color:var(--st-text-tertiary)}
      .st-newbook-input:focus{border-bottom-color:var(--st-accent);box-shadow:0 1px 0 var(--st-accent)}
      .st-newbook-error{margin:0;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-newbook-actions{display:flex;justify-content:flex-end;gap:var(--st-space-8,8px)}
      .st-newbook-open{margin-right:auto}
      @keyframes st-newbook-backdrop-in{from{opacity:0}to{opacity:1}}
      @keyframes st-newbook-in{from{opacity:0;translate:0 var(--st-space-4,4px)}to{opacity:1;translate:0 0}}
      @media (prefers-reduced-motion: reduce){.st-newbook-backdrop,.st-newbook{animation:none}}
`;

// src/client/panel/mcp-panel.css.js
var CSS_MCP = `
      .st-mcp-backdrop{position:absolute;inset:0;z-index:var(--st-mcp-z);display:flex;align-items:flex-start;justify-content:flex-end;
        padding:var(--st-space-24,24px);background:color-mix(in srgb,var(--st-bg,#000) 40%,transparent)}
      .st-mcp-panel{width:min(var(--st-mcp-w),100%);display:flex;flex-direction:column;gap:var(--st-space-12,12px);
        padding:var(--st-space-20,20px);border:var(--st-hairline) solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);background:var(--st-surface-high);
        box-shadow:var(--st-card-shadow-lift)}
      .st-mcp-head{display:flex;align-items:center;justify-content:space-between;gap:var(--st-space-8,8px)}
      .st-mcp-title{margin:0;font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong)}
      .st-mcp-note,.st-mcp-error{margin:0;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      .st-mcp-error{color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-mcp-row{display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0}
      .st-mcp-row-config{justify-content:space-between}
      .st-mcp-label{font-size:var(--st-text-sm);color:var(--st-text-tertiary);flex:none}
      .st-mcp-value{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--st-font-mono);
        font-size:var(--st-text-sm);color:var(--st-text-primary)}
      .st-mcp-config{margin:0;padding:var(--st-space-12,12px);overflow:auto;max-height:var(--st-mcp-code-h);
        border-radius:var(--st-radius-md,12px);background:var(--st-bg);font-family:var(--st-font-mono);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-secondary);white-space:pre}

      .st-mcp-status{display:flex;align-items:center;gap:var(--st-space-6,6px);font-size:var(--st-text-sm);color:var(--st-text-tertiary)}
      .st-mcp-dot{width:var(--st-mcp-dot);height:var(--st-mcp-dot);border-radius:var(--st-radius-pill);background:var(--st-text-tertiary);flex:none}
      .st-mcp-connected{color:var(--st-text-secondary)}
      .st-mcp-connected .st-mcp-dot{background:var(--st-accent)}
`;

// src/client/panel/glyph-field.css.js
var CSS_GLYPH = `
      .st-glyph-field{position:absolute;inset:0;z-index:var(--st-glyph-z);overflow:hidden;pointer-events:none;
        -webkit-mask-image:radial-gradient(circle var(--st-glyph-radius) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px),#000 0%,#000 70%,transparent 100%);
        mask-image:radial-gradient(circle var(--st-glyph-radius) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px),#000 0%,#000 70%,transparent 100%)}
      .st-glyph-field::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity var(--ds-transition-duration-fast,.12s);
        background:radial-gradient(circle var(--st-glyph-radius) at var(--st-pointer-x,-999px) var(--st-pointer-y,-999px),
          var(--st-bg,#0b0b0c) 0%, var(--st-bg,#0b0b0c) 70%, transparent 100%)}
      .st-glyph-field[data-visible="true"]::before{opacity:1}
      .st-glyph-slot{position:absolute;left:0;top:0;width:var(--st-canvas-grid);height:var(--st-canvas-grid);
        display:grid;place-items:center;perspective:var(--st-glyph-perspective,120px)}
      .st-glyph-face{font-family:var(--st-font-serif);font-size:var(--st-glyph-size);line-height:1;font-weight:var(--st-font-weight-normal);
        opacity:0;color:var(--st-glyph-ink);text-shadow:0 1px 0 var(--st-glyph-depth);
        transform:rotateX(var(--st-glyph-rx,0deg)) rotateY(calc(var(--st-glyph-ry,0deg) - 82deg)) scale(.72);
        transform-style:preserve-3d;transition:opacity var(--st-glyph-flip,320ms) ease;
        will-change:transform,opacity}
      /* Clear the lattice under an active cell. The soft radial shade alone left stray dots in
         the gaps between glyphs, which made the patch read as text pasted over the canvas. */
      .st-glyph-slot[data-on="true"]{background:var(--st-bg,#0b0b0c)}
      .st-glyph-slot[data-tone="primary"] .st-glyph-face{color:var(--st-glyph-ink-primary)}
      .st-glyph-slot[data-tone="accent"] .st-glyph-face{color:var(--st-glyph-ink-accent)}
      /* Only the glyph is filtered. A backdrop or tint here would paint a visible rectangle over
         the canvas; this leaves every dot and the empty field untouched. */
      .st-glyph-slot[data-content="true"] .st-glyph-face{filter:blur(var(--st-glyph-blur,4px))}
      .st-glyph-slot[data-on="true"] .st-glyph-face{opacity:1;
        transform:rotateX(var(--st-glyph-rx,0deg)) rotateY(var(--st-glyph-ry,0deg)) scale(1);
        animation:st-glyph-flip var(--st-glyph-flip,380ms) cubic-bezier(.2,.7,.2,1) both;
        animation-delay:var(--st-glyph-delay,0ms)}
      @keyframes st-glyph-flip{
        from{opacity:0;transform:rotateX(calc(var(--st-glyph-rx,0deg) + 18deg)) rotateY(calc(var(--st-glyph-ry,0deg) - 100deg)) scale(.7)}
        to{opacity:1;transform:rotateX(var(--st-glyph-rx,0deg)) rotateY(var(--st-glyph-ry,0deg)) scale(1)}
      }
`;

// src/client/panel/notes.css.js
var CSS_NOTES = `
      .st-notes-dialog{height:min(72vh,var(--st-notes-h));padding-top:var(--st-inset-md)}
      /* The notebook is an aside, not a modal takeover: the page behind stays sharp. */
      .st-notes-backdrop{backdrop-filter:none;-webkit-backdrop-filter:none}
      .st-dialog-body.st-notes-body{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;overflow:hidden}
      .st-notes{display:flex;flex-direction:column;gap:var(--st-board-gap);flex:1 1 auto;min-height:0}
      /* The capture area is its own region; the list and the detail below are two independent
         boxes with a gap between them, not one outer frame split by a line. */
      .st-notes-capture{flex:none;padding-bottom:var(--st-board-gap);
        border-bottom:var(--st-hairline) solid var(--st-ink-edge)}
      /* The panel's standard borderless input, sized for a thought rather than one line. Its
         focus ring is suppressed here: a bordered focus state made the capture box look like a
         form field, which is the opposite of a quick note. */
      .st-notes-capture .st-input{min-height:var(--st-notes-capture-h);resize:none;
        background:var(--st-surface-high);padding:var(--st-inset-sm) var(--st-inset-md)}
      .st-notes-capture .st-input:focus{box-shadow:none}
      .st-notes .st-split{flex:1 1 auto;min-height:0}
      /* A pane title is part of its content; no rule between them. */
      .st-notes .st-split-detail-head{border-bottom:none}
      .st-notes-detail{min-height:0;white-space:pre-wrap;word-break:break-word;
        font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-primary)}
      .st-notes .st-split-detail-body{display:flex;flex-direction:column}
`;

// src/client/panel/composer.css.js
var CSS_COMPOSER = `
      /* ---- the dock: the composer slot, its hairline, and the working state ---- */
      .st-ai-dock{flex:none;display:flex;flex-direction:column;gap:var(--st-space-12,12px);min-width:0;position:relative;
        /* The card's bottom edge clears the window by its own radius. It is the last row of a
           column that ends at the panel's bottom edge, and an element flush with an ancestor's
           edge has its outer edge \u2014 and with it the outer half of the rounded corner \u2014 painted
           UNDER that edge. A 28px corner therefore drew a thin line across its bottom, which read
           as a rule covering the box's lower edge rather than as a rounded card. Nested shapes are
           safe: their clipping ancestor is this card, not the window. */
        margin:0 0 var(--st-space-4,4px);
        padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-12,12px);border:none;
        border-radius:var(--st-radius-panel,28px);
        background:var(--dsw-specific-input-major,var(--st-surface-high));
        box-shadow:var(--dsw-elevation-soft,0 0 0 .5px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.03),0 0 24px rgba(0,0,0,.03));
        /* Interface type by default, NOT the manuscript's.
           The dock is one card holding three unlike things: a question box, a reply, and a proposed
           passage. Only the last one is a sentence of the book, so only it is set in the book's
           type. Declaring the manuscript size here made everything inherit it \u2014 the composer's own
           field typed at 16/1.9 while every other input in dsh types at 13/20, which read as a box
           borrowed from another application. The manuscript metrics live on .st-ai-dock-text below,
           where the three kinds are told apart.
           The 16px in this card belongs to the INPUT and to a short passage, and to nothing else:
           the buttons, the cast list and the scan panel each set their own 13px, so they stay the
           size they were. */
        font-family:inherit;font-size:var(--st-text-md);
        line-height:var(--st-text-md-leading);
        color:var(--st-text-primary);
        /* Grows with its content. A fixed 320px cap cut a long answer short and made the writer
           scroll inside a box that looked like it had room \u2014 the dock is a region of the page, so
           it takes the height it needs and the page scrolls, not the answer. The ceiling exists
           only so a runaway reply cannot push the manuscript off screen entirely. */
        max-height:none;
        animation:st-dock-in .18s var(--ds-ease-in-out,ease-in-out) both}
      /* The card's one coloured ornament, borrowed from the input-first tools: a hairline of the
         accent along the TOP edge only, fading out at both ends. It marks the box the writer
         types into without putting a border around it. */
      .st-ai-dock::before{content:'';position:absolute;top:0;left:var(--st-space-24,24px);right:var(--st-space-24,24px);
        height:var(--st-hairline);border-radius:var(--st-radius-pill,999px);corner-shape:round;
        background:linear-gradient(90deg, transparent, var(--st-accent) 50%, transparent);
        opacity:.55;pointer-events:none}
      /* A fade, not a slide: it belongs to the page above it and should not look like it flew in. */
      @keyframes st-dock-in{from{opacity:0}to{opacity:1}}
      /* The slot holds BOTH faces of the dock \u2014 the open box and, pressed directly against its
         bottom edge, the hairline. No margin between them: the line is where the box closes. */
      .st-dock-slot{flex:none;display:flex;flex-direction:column;min-width:0}
      .st-dock-slot .st-hairline{margin-top:0}
      /* The dock's persistent hairline: one glowing line at the page's bottom edge. It is the
         same element in three moods \u2014 the idle breathing glow, the working line with its rotating
         copy, and the kept result waiting to be re-opened \u2014 so the dock never truly disappears.
         The thinking copy sits ABOVE the line: the button stacks a copy row over the glow row. */
      .st-hairline{position:relative;display:flex;flex-direction:column;justify-content:flex-end;
        gap:var(--st-space-2,2px);width:100%;
        min-height:var(--st-hairline-row-h,22px);padding:0;border:none;background:transparent;cursor:default;
        font-family:inherit;color:var(--st-text-tertiary);outline:none;margin-top:var(--st-space-8,8px)}
      /* Only a kept line is a button: it holds a result one click away. Idle is ambient. */
      .st-hairline[data-state="kept"]{cursor:pointer}
      /* Idle and kept are the same face of the dock at rest: same glow speed, same strength,
         same click. Only working is brighter \u2014 that is the one state that means "wait". */
      .st-hairline:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink);
        border-radius:var(--st-radius-sm,8px)}
      /* The line itself, at rest: a plain 1px rule in the border grey.
         It used to glow in every state \u2014 weaker when idle, held when a result waited, strongest
         while the model worked. That made the accent the panel's permanent furniture at the bottom
         edge, and it made "there is something here" and "something is happening" look like two
         strengths of the same thing. They are different things:
           at rest        a rule, the way any other edge in this panel is drawn
           a result waits a rule, plus the word saying so \u2014 the line stays quiet
           working        the only lit state: the accent, and it breathes
         Nothing about the line is a promise until there is something behind it. */
      /* THE LINE IS A GRADIENT, NOT A STROKE.
         It is brightest at its centre and fades to nothing at both ends, so it reads as a light
         lying on the page rather than as a divider drawn across it. A solid rule would have to be
         clipped by something to fade; a mask does it without another element.
         The track is a flex row, and the lit part is this element centred in it \u2014 which is what
         lets the line GROW outward from its middle instead of sliding: at rest it occupies a third
         of the width, and while the model works it takes all of it. */
      .st-hairline-glow{position:relative;flex:0 0 auto;width:33.33%;height:var(--st-rule-h,1px);min-width:0;
        align-self:center;
        /* The gradient is the whole visual: transparent, up to a bright centre, back to transparent.
           Mixed from the border ink at rest, from the accent while working, so one shape serves
           both states and only the colour changes. */
        background:linear-gradient(to right,
          transparent 0%,
          color-mix(in srgb, var(--dsw-alias-border-l3,var(--st-fallback-border-l3)) 40%, transparent) 22%,
          var(--dsw-alias-border-l3,var(--st-fallback-border-l3)) 50%,
          color-mix(in srgb, var(--dsw-alias-border-l3,var(--st-fallback-border-l3)) 40%, transparent) 78%,
          transparent 100%);
        /* No rounding and no shadow: the ends are already the fade, and a radius on a 1px line drew
           two darker dots where the gradient was leaving. */
        border-radius:0;
        box-shadow:none;
        transition:width var(--ds-transition-duration-slow,260ms) var(--ds-ease-in-out,ease-in-out),
          height var(--ds-transition-duration-slow,260ms) var(--ds-ease-in-out,ease-in-out),
          background var(--ds-transition-duration-slow,260ms) var(--ds-ease-in-out,ease-in-out)}
      /* WORKING: the same line as at rest, stretched across the page and lit.
         The line ITSELF does not change shape. It stays a 1px gradient \u2014 the resting line, longer \u2014
         and everything that makes it read as glowing lives in a drop-shadow. That matters beyond
         taste: a drop-shadow is cast from the element's own painted alpha, so the halo fades out
         exactly where the gradient does and the light converges at both ends on its own. A
         box-shadow would be cast from the BOX instead, drawing a bright bar along a line that has
         already gone transparent there.
         The fill peaks at 62% rather than a solid bar, so the 1px line stays a line; the light it
         throws is brighter than that, because a halo that cannot be seen reads as no halo at all.
         An earlier version peaked at 85% with an 80px cast, and at that strength the glow was the
         brightest thing in the panel while the writer was reading \u2014 these are just under it. */
      .st-hairline[data-state="working"] .st-hairline-glow{
        width:100%;
        background:linear-gradient(to right,
          transparent 0%,
          color-mix(in srgb, var(--st-accent) 16%, transparent) 26%,
          color-mix(in srgb, var(--st-accent) 62%, transparent) 50%,
          color-mix(in srgb, var(--st-accent) 16%, transparent) 74%,
          transparent 100%);
        filter:drop-shadow(0 0 4px color-mix(in srgb, var(--st-accent) 65%, transparent))
          drop-shadow(0 0 12px color-mix(in srgb, var(--st-accent) 32%, transparent))
          drop-shadow(0 0 30px color-mix(in srgb, var(--st-accent) 16%, transparent));
        animation:st-hairline-breathe 0.9s ease-in-out infinite}
      /* The breath: 0.9s, and only 18% of the range. Fast enough to read as alive at a glance and
         slow enough not to strobe; a wider sweep at this speed did look like a pulse, which pulls
         the eye off the page every second. */
      @keyframes st-hairline-breathe{0%,100%{opacity:.82}50%{opacity:1}}
      /* The copy row: single line above the glow, caption scale, clipped so a long question
         cannot push the line taller. While working the rotating beats render inside this row;
         the row is absent in every other state, so the line sits alone. */
      .st-hairline-copy{display:block;min-width:0;overflow:hidden;
        text-overflow:ellipsis;white-space:nowrap;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-hairline[data-state="working"] .st-hairline-copy{color:var(--st-text-secondary)}
      /* The thinking row inside the hairline must not impose the box's own spacing. */
      .st-hairline .st-ai-thinking{padding:0}
      /* The output area.
         Interface type by default; the book's own metrics are applied below, and only to a passage
         short enough that reading it feels like reading the page. A declaration here would be the
         wrong default for every kind of answer at once. */
      .st-ai-dock-text{min-height:0;overflow:visible;white-space:pre-wrap;word-break:break-word}
      /* A SHORT passage is set in the book's own type: the writer is meant to read it as the
         sentence it will become, which is the whole point of showing it here rather than in a
         dialog. Four or five lines is the limit \u2014 past that the block stops reading as part of the
         page and becomes a wall inside a card. The threshold comes from data-prose, which the
         panel computes from the page settings (proseLineBudget), so it moves with the type size
         instead of being a fixed character count. */
      .st-ai-dock[data-prose="short"][data-kind="rewrite"] .st-ai-dock-text,
      .st-ai-dock[data-prose="short"][data-kind="continue"] .st-ai-dock-text{
        font-size:var(--st-font-size,16px);line-height:var(--st-line-height,1.9)}
      /* Every kind of answer scrolls inside a ceiling rather than growing without bound. Without
         one, a long continuation pushed the manuscript off the top of the window and the dock
         became the page; with one, the answer is readable and the page keeps its shape. The
         ceiling is never reached by a SHORT passage \u2014 five lines at any size the panel offers is
         far under 60vh \u2014 so the two rules do not fight: data-prose decides the type, this decides
         what happens to a long one. */
      .st-ai-dock[data-kind="rewrite"] .st-ai-dock-text,
      .st-ai-dock[data-kind="continue"] .st-ai-dock-text,
      .st-ai-dock[data-kind="cast"] .st-ai-dock-text{
        max-height:var(--st-dock-text-max-height,60vh);overflow:auto;
        scrollbar-width:thin;
        scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar)) transparent}
      /* A chat reply keeps the manuscript's type.
         Shrinking it to 13px made an answer look like a tooltip: the same model, in the same panel,
         suddenly writing in a smaller voice. What differs is the STRUCTURE \u2014 a reply has no
         first-line indent, no paragraph spacing of its own, no measure of its own \u2014 not the size of
         the letters. Only a very long reply gets a ceiling, and then it scrolls rather than growing
         without bound. */
      /* A long reply takes the room it needs and the PAGE scrolls, not the answer. The only ceiling
         is most of the viewport, so an unusually long answer stays reachable by scrolling the
         manuscript rather than by scrolling a narrow box inside it \u2014 a scroll area inside a page
         that also scrolls is the worst of both. */
      .st-ai-dock[data-kind="chat"] .st-ai-dock-text{
        max-height:var(--st-dock-text-max-height,60vh);overflow:auto;
        /* Not the book's type: a reply is a remark, not a passage. */
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        color:var(--st-text-primary)}
      /* Once it does have to scroll, the shortest useful affordance: the text is clipped at the
         bottom edge, and the box says so instead of silently hiding half the answer. */
      .st-ai-dock[data-kind="chat"] .st-ai-dock-text{
        scrollbar-width:thin;
        scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar)) transparent}
      /* The question above its answer: quieter than the reply, because it is a prompt, not content. */
      .st-ai-dock[data-kind="chat"] .st-ai-question{font-size:var(--st-text-sm);line-height:1.55;opacity:.8}
      .st-ai-dock[data-kind="chat"]{gap:var(--st-space-8,8px);padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-12,12px)}
      /* While thinking there is no suggestion text and no buttons, so the shell is one row. */
      .st-ai-dock-busy{gap:0;padding:var(--st-space-12,12px) var(--st-space-16,16px)}
      /* Positioned: it is the containing block the steer field is measured against, so the field can
         fill the room between the retry pill and the trailing button. */
      .st-ai-dock-actions{position:relative;display:flex;align-items:center;gap:var(--st-space-4,4px);flex:none;flex-wrap:wrap;margin-top:var(--st-space-2,2px)}
      /* The status bar: one quiet line under the page. */
      /* Centred: the bar is a read-out, so a centred line under a centred page reads as part of
         the same column rather than as a toolbar with left-aligned controls. */
      /* No top border: the page ends where the bar begins, and a rule across the bottom of the
         window read as a frame rather than as a separation. The layer behind it does the work. */

      /* ---- the composer's model seat: the host's own picker, copied ----
         Every number here is from dsh's ModelSelect: a 28px transparent chip at 13/20 with the
         effort in caption tone, a 4px-padded card on the prominent elevation, 34px rows, and a
         trailing check rather than a filled row. Two panes, so the effort is one click away
         instead of at the bottom of a scroll. */
      .st-seat{position:relative;min-width:0}
.st-seat-trigger{display:flex;align-items:center;gap:var(--st-space-4,4px);min-width:0;
        max-width:min(360px,45cqw);height:var(--st-seg-h,28px);padding:0 var(--st-space-4,4px) 0 var(--st-space-8,8px);
        border:none;border-radius:var(--st-radius-sm,8px);outline:none;background:transparent;
        color:var(--st-text-secondary);font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        font-weight:var(--st-font-weight-normal);cursor:pointer;corner-shape:round;}
      .st-seat-trigger:hover{background:var(--st-hover-fill)}
      /* The panel has one accent, and the focus ring is part of it: the host's own rule falls back
         to a fixed business blue, which is the one colour here that would not follow a skin. */
      .st-seat-trigger:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-seat-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* The effort gives up its room first, so the model name keeps its last pixel. */
      .st-seat-effort{flex-shrink:1000;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;color:var(--st-text-tertiary)}
      .st-seat-chevron{flex:0 0 auto;width:var(--st-icon-xs);height:var(--st-icon-xs);color:var(--st-text-tertiary);
        transition:transform 120ms ease}
      .st-seat-chevron[data-open="true"]{transform:rotate(180deg)}
/* Opens upward BY DEFAULT: the composer sits at the bottom of the page, and the host's card
         is placed from the trigger rect for the same reason. The side is decided at the click from
         the room the chip actually has (data-side, set in ComposerModelSeat) \u2014 in the settings
         drawer the same chip is near the top of a page, and a card that could only open one way
         was clipped by the page it opened into. */
      .st-seat-menu{position:absolute;z-index:var(--st-layer-menu);right:0;bottom:calc(100% + 6px);
        display:flex;flex-direction:column;width:max-content;
        min-width:min(240px,calc(100vw - 32px));max-width:min(420px,calc(100vw - 32px));
        max-height:min(360px,calc(100vh - 96px));overflow:hidden;padding:var(--st-space-4,4px);
        border:none;border-radius:var(--st-radius-md,12px);background:var(--st-surface-high);
        box-shadow:var(--dsw-elevation-prominent,var(--dsw-shadow-lv2,0 0 0 .5px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.04)));
        color:var(--st-text-primary);corner-shape:round;}
      .st-seat-menu[data-side="down"]{bottom:auto;top:calc(100% + 6px)}
      .st-seat-groups{min-height:0;overflow-y:auto}
/* A root row: the name of the setting on the left, its current value on the right. */
      .st-seat-cell{display:flex;align-items:center;gap:var(--st-space-8,8px);width:auto;min-width:100%;height:var(--st-row-height,34px);
        padding:0 var(--st-space-8,8px);border:none;border-radius:var(--st-radius-md,12px);background:transparent;
        color:var(--st-text-primary);font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        cursor:pointer;text-align:left;outline:none;corner-shape:round;}
      .st-seat-cell:hover,.st-seat-cell:focus-visible{background:var(--st-hover-fill)}
      .st-seat-cell-label{flex:0 0 auto;white-space:nowrap}
      .st-seat-cell-value{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;text-align:right;color:var(--st-text-tertiary)}
      .st-seat-cell-chevron{flex:0 0 auto;width:var(--st-icon-xs);height:var(--st-icon-xs);color:var(--st-text-tertiary)}
.st-seat-option{display:flex;align-items:center;gap:var(--st-space-8,8px);width:auto;min-width:100%;
        min-height:var(--st-row-height,34px);padding:var(--st-space-4,4px) var(--st-space-8,8px);border:none;border-radius:var(--st-radius-md,12px);
        background:transparent;color:inherit;font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        text-align:left;cursor:pointer;outline:none;corner-shape:round;}
      .st-seat-option:hover,.st-seat-option:focus-visible{background:var(--st-hover-fill)}
      .st-seat-option-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* The marker is the trailing check, not a filled row: the host's menu does the same, and a
         filled row reads as "hovered" in a menu that also has hover. */
      .st-seat-check{display:grid;place-items:center;flex:0 0 14px;color:var(--st-text-primary)}
      .st-seat-group{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        padding:var(--st-space-8,8px) var(--st-space-8,8px) var(--st-space-2,2px)}
      .st-seat-empty{padding:var(--st-space-8,8px);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary)}
      .st-seat-back{display:flex;align-items:center;gap:var(--st-space-4,4px);width:auto;min-width:100%;height:var(--st-row-height-compact,26px);
        padding:0 var(--st-space-8,8px);border:none;border-radius:var(--st-radius-md,12px);background:transparent;
        color:var(--st-text-tertiary);font-family:inherit;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        cursor:pointer;text-align:left;outline:none}
      .st-seat-back:hover,.st-seat-back:focus-visible{background:var(--st-hover-fill);
        color:var(--st-text-primary)}
      .st-seat-back .st-seat-cell-chevron{width:var(--st-space-12,12px);height:var(--st-space-12,12px);transform:rotate(180deg)}
      .st-model-item-id{margin-left:auto;font-family:var(--st-font-mono);font-size:var(--st-text-sm);
        color:var(--st-text-tertiary);overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;max-width:55%}
      /* A proposed cast change: one line per entity, the verb first because that is the decision. */

      /* ---- the cast strip: who is in this chapter, and what they want ---- */
      .st-cast{display:flex;flex-direction:column;gap:var(--st-space-8,8px);min-width:0;
        max-height:min(40vh,360px);overflow:auto;scrollbar-width:thin;
        scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar)) transparent}
      .st-cast-row{display:flex;align-items:baseline;gap:var(--st-space-8,8px);min-width:0;
        font-size:var(--st-text-md);line-height:var(--st-line-height-ui);color:var(--st-text-primary)}
      .st-cast-tag{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);padding:0 var(--st-space-8,8px);border-radius:var(--st-radius-pill,999px);corner-shape:round;
        background:color-mix(in srgb, var(--dsw-static-green-500,var(--st-fallback-green)) 18%, transparent);
        color:var(--st-text-primary)}
      /* An update changes what is already there, so it is marked with the accent rather than the
         green of something new. */
      .st-cast-tag[data-verb="update"]{background:color-mix(in srgb, var(--st-accent) 18%, transparent);
        color:var(--st-accent)}
      .st-cast-target{flex:none;font-size:var(--st-text-sm);color:var(--st-text-tertiary)}
      .st-cast-name{min-width:0;font-weight:var(--st-font-weight-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-cast-detail{min-width:0;font-size:var(--st-text-sm);color:var(--st-text-tertiary);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

      /* ---- the working state ----
         The accent is the THEME's brand colour, not a colour of ours: on a red theme it is red,
         on a green one green. --st-accent is the single place that decision is made, so nothing
         else in this stylesheet has to know which theme is active.
         Nothing here invents a colour of its own: the working state uses the theme accent and a
         change of opacity, so it stays quiet on a page of prose. */
      /* One row: the dots, then the question and the state together. */
      .st-ai-thinking{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:var(--st-space-8,8px);
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);color:var(--st-text-tertiary);overflow:hidden}
      .st-ai-thinking-row{display:flex;align-items:center;justify-content:flex-start;gap:var(--st-space-4,4px);min-width:0;flex-wrap:nowrap}
      /* All the labels share one grid cell, so the row never changes width as the copy turns
         over; a changing width would make the dots slide sideways every two seconds. */
      .st-ai-thinking-labels{display:grid;min-width:0;justify-items:start;text-align:left}
      /* The first label is visible from the first frame and the rest wait their turn: a state that
         starts as nothing but three dots for a fifth of a second looks like it is still loading. */
      .st-ai-thinking-label{grid-area:1/1;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;opacity:0;animation:st-say 7.2s ease-in-out infinite}
      .st-ai-thinking-label:first-child{opacity:1;animation-delay:0s}
      @keyframes st-say{
        0%{opacity:0;transform:translateY(3px)}
        4%,22%{opacity:1;transform:none}
        27%,100%{opacity:0;transform:translateY(-3px)}
      }
      /* The first label needs its own keyframes: sharing the turn-taking animation would leave it
         invisible at t=0, which is exactly when it has to be readable. */
      .st-ai-thinking-label:first-child{animation-name:st-say-first}
      @keyframes st-say-first{
        0%,22%{opacity:1;transform:none}
        27%,96%{opacity:0;transform:translateY(-3px)}
        100%{opacity:1;transform:none}
      }
      /* The thinking marker: a small spinner at the row's head, hard against the left edge. The
         mark is a rotating arc, not three dots: dots read as a loading placeholder, an arc reads
         as something thinking. The 2px top nudge is optical: a 10px circle centered on a 20px
         line sits half a pixel high otherwise. */
      .st-ai-thinking-mark{flex:none;width:var(--st-space-12,12px);height:var(--st-space-12,12px);margin:var(--st-space-2,2px) 0 0;
        border:1.5px solid color-mix(in srgb, var(--st-accent) 40%, transparent);
        border-top-color:var(--st-accent);border-radius:var(--st-radius-pill,999px);corner-shape:round;
        animation:st-think-spin 1s linear infinite}
      /* The row leads with the spinner and nothing else: no leading gap, no indent. The 4px gap
         keeps the copy reading as ONE line starting at the row's left edge, not as a badge beside
         a caption. */

      @keyframes st-think-spin{to{transform:rotate(360deg)}}
      /* The question box, set to match the host's own composer.
         The host publishes its composer metrics as variables, so this reads the same gaps and the
         same maximum height rather than inventing its own numbers; the surface, radius and type
         scale come from the same tokens the rest of the panel uses. It is not the host's lexcial
         editor, but it should not read as a foreign widget dropped into the page. */

      /* ---- the composer: the field, the send button, and the model menu ---- */
      .st-chat-composer{display:flex;flex-direction:column;
        gap:calc(var(--dsh-composer-stack-gap, var(--st-space-8,8px)) + var(--st-space-2,2px));
        width:100%;min-width:0}
      /* The one field that is NOT a well: it sits inside the dock's own card, which already
         supplies the surface, so a second fill inside it would read as a box in a box. It keeps
         the shared rule's no-border and no-outline, and overrides only the fill and the padding. */
      /* The ONE place in the dock that uses the interface size, and the only thing the writer types
         into. 16/24, a fixed pair that does not follow the page: it used to inherit the manuscript's
         size and leading, which made a one-line question look like a paragraph of the novel and
         three lines tall before a word was typed. The buttons, the reply and the cast list around
         it keep the 13px the rest of dsh uses \u2014 enlarging those was never asked for.
         The height cap is the host's own variable so the two composers stop growing at the same
         point. */
      .st-chat-input{width:100%;min-width:0;resize:none;background:transparent;
        border:none;outline:none;color:var(--st-text-primary);
        font-family:inherit;font-size:var(--st-font-ui,16px);
        line-height:var(--st-leading-ui,24px);
        max-height:var(--dsh-composer-text-max-height,336px);
        padding:0;margin:0;overflow:auto}
      .st-chat-input::placeholder{color:var(--st-text-tertiary)}
      /* No focus ring: the field is inside the dock's card, and a ring around it alone draws a box
         inside a box \u2014 at 2px it reads as exactly the border this field does not have. The caret
         and the dock's own surface mark where typing goes. */
      .st-chat-input:focus,.st-chat-input:focus-visible{box-shadow:none;outline:none}
      /* The control row under the input, laid out the way the host's composer lays out its own:
         the hint on the left, the model chip and the send button pushed to the right. */
      .st-chat-row{display:flex;align-items:center;gap:var(--st-space-12,12px);min-width:0;flex-wrap:wrap}
      .st-chat-trailing{display:flex;align-items:center;gap:var(--st-space-12,12px);margin-left:auto;flex:none}
      /* The menu opens upward by default: the composer's chip sits at the bottom of the page, so a
         downward menu would fall off the window. The settings page overrides this. */
      .st-model-menu{position:absolute;bottom:calc(100% + 6px);right:0;z-index:var(--st-layer-menu);
        min-width:var(--st-picker-min-w,220px);max-width:min(320px,80vw);max-height:min(52vh,360px);overflow:auto;
        display:flex;flex-direction:column;padding:var(--st-space-8,8px);
        border-radius:var(--st-radius-md,12px);border:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));
        background:var(--st-surface-high);box-shadow:var(--dsw-shadow-lv2,0 4px 12px rgba(0,0,0,.02),0 2px 8px rgba(0,0,0,.04))}
      .st-model-group-name{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        padding:var(--st-space-8,8px) var(--st-space-8,8px) var(--st-space-2,2px)}
.st-model-item{display:flex;align-items:center;gap:var(--st-space-8,8px);width:100%;text-align:left;
        font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);padding:var(--st-space-4,4px) var(--st-space-8,8px);
        border:none;border-radius:var(--st-radius-sm,8px);background:transparent;cursor:pointer;
        color:var(--st-text-secondary);corner-shape:round;}
      .st-model-item:hover{background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-model-item[data-current="true"]{color:var(--st-text-primary);font-weight:var(--st-font-weight-medium)}
      .st-model-item[data-current="true"]::after{content:'\u2713';margin-left:auto;
        color:var(--st-accent);font-size:var(--st-text-sm)}
      .st-model-item-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
      .st-model-empty{padding:var(--st-space-8,8px);font-size:var(--st-text-sm);color:var(--st-text-tertiary)}
      /* A count beside the history button, so an empty log does not invite a click. */
      .st-count{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);padding:0 var(--st-space-4,4px);border-radius:var(--st-radius-pill,999px);corner-shape:round;margin-left:var(--st-space-4,4px);
        background:var(--st-hover-fill);color:var(--st-text-tertiary);
        font-variant-numeric:tabular-nums}
      /* The answers card: one block per exchange, question first, then what came back. */

      /* ---- answers: what was asked, and what came back ---- */
      .st-answers{display:flex;flex-direction:column;gap:var(--st-space-16,16px)}
      .st-answer{border-bottom:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));padding-bottom:var(--st-space-16,16px)}
      .st-answer:last-child{border-bottom:none;padding-bottom:0}
      .st-answer-head{display:flex;align-items:baseline;gap:var(--st-space-8,8px);margin-bottom:var(--st-space-8,8px);flex-wrap:wrap}
      .st-answer-question{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:52%}
      .st-answer-body{white-space:pre-wrap;word-break:break-word;
        font-size:var(--st-font-size,16px);line-height:var(--st-line-height,1.9);
        color:var(--st-text-primary)}
      /* The send key: the host's own circular key, filled with the panel accent.
         The host drew this control before we did, so it is copied rather than reinvented: a 34px
         square, a grid that centres the glyph, a 999px radius, and \u2014 the line we were missing \u2014
         corner-shape: round.
         That last one is not decoration. DSH's theme declares a superellipse token and applies
         corner-shape to every element through a universal selector. A superellipse is the squircle:
         a 50% radius drawn with it is a rounded square, not a circle. So every round control in the
         host resets corner-shape to round, and this one has to do the same. Without it the button
         measures 34 by 34 with a 17px radius and still does not look round.
         Colour is the accent, like every other affirmative control here; --st-send is the one place
         that decides it, and it points at --st-accent. */
      /* Every dimension is pinned, including the minimums and the flex basis.
         A height alone is not enough to keep a control square: a min-height from anywhere above it
         \u2014 a host stylesheet, a reset, a dialog template \u2014 silently stretches the box while the
         width stays put, and the radius then draws an ellipse instead of a circle. Naming
         min-width, min-height and the flex basis makes the square a property of this rule rather
         than of the cascade around it. */
      .st-chat-send{display:grid;place-items:center;padding:0;
        width:var(--st-send-size,34px);height:var(--st-send-size,34px);
        flex:none;aspect-ratio:1/1;
        border:none;border-radius:var(--st-radius-pill,999px);corner-shape:round;cursor:pointer;
        background:var(--st-send,#c3272b);
        color:var(--st-on-accent,#fff);
        transition:background-color var(--ds-transition-duration-fast,.12s) var(--ds-ease-in-out,ease-in-out)}
      .st-chat-send:hover:not(:disabled){background:var(--st-send-hover,#c9352a)}
      .st-chat-send:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-chat-send:disabled{opacity:.4;cursor:not-allowed}
      /* The question above the answer (and above the working state): the reply needs a subject, and
         once the composer has folded away this is the only record of what was asked. */
      /* The question above a finished answer: a record of what was asked, above the reply. No rule
         under it \u2014 the answer below is already a separate block, and a line there separated two
         things that belong together. */
      .st-ai-question{font-size:var(--st-text-md);line-height:var(--st-line-height-ui);color:var(--st-text-tertiary);
        white-space:pre-wrap;word-break:break-word}
      /* While the model works the question is inline with the state, so it is one line:
         "\u8FD9\u91CC\u8BE5\u600E\u4E48\u6536\uFF1F \xB7 \u5728\u60F3\u4E0B\u4E00\u53E5". The question does not fade or rotate; the state does. */
      .st-ai-thinking-ask{color:var(--st-text-secondary);min-width:0;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}
      .st-ai-thinking-sep{opacity:.45;flex:none}
      /* The dock's own edge, one hairline in the accent, breathing slowly: it says "busy" from
         across the page without drawing a line over the text. */
      .st-ai-dock-busy{position:relative;overflow:hidden}
      .st-ai-dock-busy::before{content:'';position:absolute;top:0;left:0;right:0;height:var(--st-rule-h,1px);
        background:var(--st-accent);opacity:.3;animation:st-breathe 2.6s ease-in-out infinite}
      @keyframes st-breathe{0%,100%{opacity:.18}50%{opacity:.5}}
      /* Motion is decoration here: with reduced motion the colour and the words still carry the
         state, and nothing moves. */
      @media (prefers-reduced-motion: reduce){
        .st-ai-dock-busy::before{display:none}
        .st-ai-dock{animation:none}
        /* With the rotation off, every label would sit on top of every other one; the first
           carries the state and the rest step aside. */
        .st-ai-thinking-label{animation:none;opacity:0}
        .st-ai-thinking-label:first-child{opacity:1}
      }

      /* ---- the history drawer's pages: the answers, and the system event log ---- */
      .st-answers-pages{display:flex;flex-direction:column;gap:var(--st-space-12,12px);min-height:0}
      /* The page switcher is a control, not a full-width band. */
      .st-answers-pages>.st-seg{align-self:flex-start}
      /* One row per event: a fixed-width clock column, then the line. Failed calls carry the
         failure code the host reported \u2014 the UNKNOWN the writer could previously never see twice
         in context \u2014 and are marked in the error colour so a scan finds them. */
      .st-event-log{display:flex;flex-direction:column;gap:var(--st-space-2,2px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        font-family:var(--st-font-mono)}
      .st-event-toolbar{display:flex;gap:var(--st-space-8,8px);align-items:center}
      /* The type filter is a compact select, not a row of time chips: the option list can grow
         without widening the drawer, and it says what it filters in one word. */
      .st-event-filter{flex:none;width:auto;max-width:100%}
      /* Hug the current value instead of reserving a fixed block: "\u5168\u90E8\u7C7B\u578B" needs four glyphs,
         not a field as wide as the event table. */
      .st-event-filter .st-dropdown-button{width:auto}
      .st-event-filter:focus{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-event-table{border-bottom:var(--st-hairline) solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-event-head{display:flex;align-items:center;min-width:0;user-select:none}
      .st-event-th{position:relative;display:flex;align-items:center;padding:var(--st-space-2,2px) var(--st-space-8,8px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-secondary);
        overflow:hidden;white-space:nowrap}
      .st-event-resize{position:absolute;top:0;right:-3px;width:var(--st-event-resize-w);height:100%;cursor:col-resize}
      .st-event-resize:hover{background:var(--st-focus-ink)}
      .st-event-body{display:flex;flex-direction:column;gap:var(--st-space-2,2px);min-height:0;
        font-family:var(--st-font-mono);max-height:var(--st-event-body-max-h);overflow:auto}
      .st-event-row{display:flex;gap:var(--st-space-8,8px);align-items:baseline;min-width:0}
      .st-event-row[data-ok="false"] .st-event-text{color:var(--dsw-alias-state-error-primary,var(--st-fallback-error))}
      .st-event-time{flex:none;width:var(--st-event-time-w,var(--st-log-col-time));color:var(--st-text-tertiary)}
      .st-event-name{flex:none;width:var(--st-event-name-w,var(--st-log-col-name));overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--st-text-primary)}
      .st-event-text{min-width:0;overflow-wrap:anywhere;color:var(--st-text-secondary)}
`;

// src/client/panel/scan.css.js
var CSS_SCAN = `
      /* ---- the action row under a proposal, and a section scan ---- */
      .st-dock-act{font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        padding:var(--st-space-4,4px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);background:transparent;
        color:var(--st-text-secondary);cursor:pointer;corner-shape:round;}
      .st-dock-act:hover{background:var(--st-hover-fill);color:var(--st-text-primary)}
      .st-dock-act:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink);outline:none}
      .st-dock-act-primary{color:var(--st-accent);font-weight:var(--st-font-weight-medium)}
      .st-dock-act-primary:hover{color:var(--st-accent)}
      .st-dock-act-quiet{color:var(--st-text-tertiary);margin-left:auto}

      /* ---- a section scan: a copy-edit, or a grammar critique ----
         Interface type, not the manuscript's: these are notes ABOUT the text, and setting them in
         the same size and leading as the prose made a list of findings read like a chapter. The
         dock's shared surface, radius and elevation still apply \u2014 only the type changes. */
      .st-ai-dock[data-kind="scan"]{gap:var(--st-space-12,12px);padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-12,12px);
        font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-line-height-ui)}
      .st-scan{display:flex;flex-direction:column;gap:var(--st-space-12,12px);min-width:0}
      .st-scan-head{display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0}
      .st-scan-title{font-size:var(--st-text-md);line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-scan-count{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        font-variant-numeric:tabular-nums}
      /* The list scrolls, the header and the footer do not: a dozen findings would otherwise push
         the manuscript out of view, and the way to close a scan would be off the bottom of it. */
      .st-scan-list{display:flex;flex-direction:column;min-width:0;
        max-height:min(46vh,440px);overflow:auto;scrollbar-width:thin;
        scrollbar-color:var(--dsw-alias-scrollbar-bg-l2,var(--st-fallback-scrollbar)) transparent}
      /* Rules between rows, none above the first: the list is one block of related findings, and a
         box around each of them would read as a table of separate things. */
      .st-scan-row{padding:var(--st-space-8,8px) 0;border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3));min-width:0}
      .st-scan-row:first-child{border-top:none;padding-top:0}
      .st-scan-row:last-child{padding-bottom:0}
      .st-scan-row-head{display:flex;align-items:baseline;gap:var(--st-space-8,8px);min-width:0;margin-bottom:var(--st-space-2,2px)}
      /* The kind of problem, as a quiet chip in the theme's own colour. */
      .st-scan-tag{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);padding:0 var(--st-space-8,8px);border-radius:var(--st-radius-pill,999px);corner-shape:round;
        background:color-mix(in srgb, var(--st-accent) 14%, transparent);color:var(--st-accent)}
      /* Where it is. On one line: the quote can be a whole sentence and a wrapped quote buried the
         finding it was pointing at. The full text is still in the tooltip. */
      .st-scan-what{color:var(--st-text-primary);white-space:pre-wrap;word-break:break-word}
      /* The correction: a different thing from the complaint, so a different colour and an arrow
         rather than a second sentence in the same tone. */
      .st-scan-fix{margin-top:var(--st-space-2,2px);color:var(--st-text-secondary);
        white-space:pre-wrap;word-break:break-word}
      .st-scan-arrow{color:var(--st-accent);margin-right:var(--st-space-4,4px)}
      .st-scan-empty{color:var(--st-text-tertiary)}
      .st-scan-foot{display:flex;align-items:center;gap:var(--st-space-4,4px);flex:none}
      /* The critique's verdict: the overall judgement the points then back up. Prose, but set
         slightly quieter than the list, because the list is the actionable half. */
      .st-critique-verdict{color:var(--st-text-secondary);white-space:pre-wrap;
        word-break:break-word;padding:var(--st-space-2,2px) 0 var(--st-space-4,4px)}
      /* The steer: a chevron-labelled toggle that opens a one-line input. Flat like every other
         control in the dock; the chevron rotates the way the session chip's does. */
      /* The steer: a chevron that opens a small popover ABOVE its row. Absolutely positioned, so
         opening it never reflows the row it belongs to \u2014 the buttons stay exactly where they were. */
      /* NOT positioned: the input it opens is anchored to the action row above it, so a containing
         block here would shrink it back to the chevron's 20px. Static is what makes the nearest
         positioned ancestor \u2014 the action row \u2014 the one that counts. */
      /* Not positioned: the field it opens is laid out against the action row, so a containing
         block here would shrink it back to the chevron's own width. */
      .st-scan-steer{position:static;display:inline-flex;min-width:0}
.st-scan-steer-toggle{display:inline-flex;align-items:center;gap:var(--st-space-2,2px);font-family:inherit;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);padding:var(--st-space-2,2px) var(--st-space-8,8px);border:none;border-radius:var(--st-radius-sm,8px);
        background:transparent;color:var(--st-text-tertiary);cursor:pointer;white-space:nowrap;corner-shape:round;}
      .st-scan-steer-toggle:hover{background:var(--st-hover-fill);
        color:var(--st-text-primary)}
      .st-scan-steer-toggle:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      /* A normal flex item in the row, right after the chevron \u2014 not a popover.
         A floating box has to be told where to sit and how wide to be, and both answers depend on a
         layout it cannot see; in the flow it takes the room the row has left over and the row's own
         flex layout decides which control it stops before.
         Its vertical padding is the row's shared one, so the field is the height of the buttons
         beside it: a taller field would push the row open and shift everything above it. */
      .st-scan-steer-input{flex:1 1 auto;min-width:0;
        padding-top:var(--st-space-4,4px);padding-bottom:var(--st-space-4,4px);
        line-height:var(--st-text-md-leading)}

/* The retry group in the rewrite dock: button and chevron read as one control, so they sit
         in a flat pill with no seam between them.
         Each half is rounded only on its OUTER edge, which is what makes the pair read as one pill:
         a hovered half paints a shape with the pill's own corner on the outside and a straight edge
         at the seam, so the two halves always line up.
         The group must not clip: the field it opens is a child of it, and overflow: hidden here would
         cut that field off. */
      .st-retry-group{display:inline-flex;align-items:center;gap:0;
        border-radius:var(--st-radius-sm,8px);corner-shape:round;}
      /* When the steer field is open it is a CHILD of this group but must take part in the row's
         layout, not the group's. Contents makes the group generate no box: the retry button, the
         chevron and the field become siblings of \u653E\u5F03, and the row's flex layout hands the field the
         leftover room \u2014 so it can never sit on top of anything. */
      .st-retry-group:has(.st-scan-steer-input){display:contents}
/* The half-rounding is on the ELEMENTS, not on the container, so it survives the container
         dissolving into display: contents. One rule each, no open/closed variants to keep in step. */
      .st-retry-group .st-dock-act{border-radius:var(--st-radius-sm,8px) 0 0 var(--st-radius-sm,8px);corner-shape:round;}
/* The chevron carries the same type and the same vertical padding as \u91CD\u8BD5 beside it, which is
         what makes the pair one pill: at its own 12/18 metrics it stood 22px against the button's
         28px and read as a small tag stuck to a tall button. The metric comes from the shared row
         variable, so the two cannot drift apart again. */
      .st-retry-group .st-scan-steer-toggle{border-radius:0 var(--st-radius-sm,8px) var(--st-radius-sm,8px) 0;
        font-size:var(--st-text-md);
        line-height:var(--st-text-md-leading);
        padding:var(--st-space-4,4px) var(--st-space-8,8px);corner-shape:round;}
      /* The model page: one row per role, the chip on the right where the composer puts it. */
`;

// src/client/panel/status.css.js
var CSS_STATUS = `
      /* ---- the status bar: one read-out line, and the card it opens ---- */
      .st-statusbar{flex:0 0 auto;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);position:relative;
        align-items:center;gap:var(--st-space-12,12px);
        height:var(--st-statusbar-h,30px);padding:0 var(--st-space-16,16px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        border:none;background:var(--st-bg);
        white-space:nowrap;overflow:visible}
      /* The read-out is one cell of the grid: it stays centred between the corner slot and an
         empty balancing column. */
      /* The row itself does NOT clip: a popup hangs inside it now, and clipping the row is what made
         the model card disappear. Only the two text items, which are the ones that can overflow,
         keep their ellipsis. */
      .st-status-run{grid-column:2;display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0;overflow:visible}
      .st-status-run .st-status-item,
      .st-status-run .st-status-name,
      .st-status-run .st-status-count{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-status-item{overflow:hidden;text-overflow:ellipsis;min-width:0}
      /* Notices live at the bottom-left corner, whatever else the bar is reporting.
         Every hint and error used to be rendered where it happened \u2014 inside the dock, above the
         shelf, at the top of a drawer \u2014 so the same kind of message appeared in five different
         places and none of them was where the writer was looking. One corner, one place to read.
         Positioned rather than flowed in: the read-out in the middle is centred, and adding a
         flowing item would push it off centre every time a message appeared. */
      .st-status-notice{grid-column:1;justify-self:start;min-width:0;max-width:100%;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
      .st-status-notice[data-tone="error"]{color:var(--dsw-alias-state-error-primary,var(--st-fallback-error))}
      .st-status-notice[data-tone="warn"]{color:var(--dsw-alias-state-warn-primary,var(--st-fallback-warn))}
      .st-status-notice[data-tone="info"]{color:var(--st-text-tertiary)}
      .st-status-sep{opacity:.45}
      /* No spacer: with everything centred, the save state and the model sit in the same run as
         the counts instead of being pushed to opposite ends. */
      .st-status-spacer{display:none}
      .st-status-key{color:var(--st-text-tertiary);margin-right:var(--st-space-4,4px)}
      /* The model cell is a control now, so it looks like one without shouting: it inherits the
         read-out's type, gains a pointer, and shows a pressed state while its card is open. */
      .st-status-model{border:none;background:none;padding:0 var(--st-space-4,4px);margin:0 -4px;font:inherit;
        color:inherit;cursor:pointer;border-radius:var(--st-radius-xs,4px);corner-shape:round;text-align:left}
      .st-status-model:hover{background:var(--st-hover-fill)}
      .st-status-model[data-open="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary)}
      .st-status-model:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      /* The button and its card, as one unit. Inline-flex so the box is exactly the button's own
         size \u2014 that is what makes left:50% below mean "half the button's width". Positioned, so it
         is the card's containing block, and explicitly NOT overflow: hidden, which would clip the
         card that hangs above it. */
      .st-status-model-slot{position:relative;display:inline-flex;min-width:0}
      /* Above the button and centred on it. It floats over the page rather than pushing the
         read-out sideways: the bar's height is what the editor measures.
         ABSOLUTE against the slot, never fixed against the window: the panel lives inside the
         host's centre column, so the window edge is not the panel edge.
         Centring is CSS on both sides \u2014 left:50% is half the button, translateX(-50%) is half the
         card. Neither width is known in advance and neither has to be: the browser measures both. */
      /* The card exists to be READ, so it is sized to its content up to a generous cap. It was once
         capped against the bar's width, which on a narrow window squeezed the model names into
         "agnes /\u2026" \u2014 a detail card that hides the detail. */
      .st-status-pop{position:absolute;z-index:var(--st-layer-status);
        left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);
        width:max-content;
        min-width:var(--st-status-menu-min-w,240px);max-width:min(360px,calc(100vw - 48px));
        box-sizing:border-box;padding:var(--st-space-12,12px) var(--st-space-12,12px);
        /* The card must LOOK like a card. It used to take the theme's raised layer, which in the
           dark theme is a shade off the page it floats over: the text arrived with no visible
           edge, so the only way to judge where the card was is the last character of the longest
           line \u2014 which reads as "the card is not centred on its button" no matter where it sits.
           A surface this small needs a boundary, not a shadow, so it gets a fill of its own plus a
           hairline and a rim of light along the top edge. */
        background:var(--st-surface-high);
        color:var(--dsw-alias-label-primary,var(--st-fallback-ink-contrast));
        border:.5px solid var(--dsw-alias-border-l3,#ffffff2e);
        border-radius:var(--st-radius-md,12px);corner-shape:round;
        box-shadow:var(--dsw-shadow-lv3,0 8px 24px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)),
          inset 0 1px 0 0 var(--dsw-alias-border-l2,#ffffff17);
        display:flex;flex-direction:column;gap:var(--st-space-4,4px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      .st-status-pop-row{display:flex;gap:var(--st-space-8,8px);align-items:baseline;min-width:0}
      .st-status-pop-role{flex:none;white-space:nowrap;color:var(--st-text-tertiary)}
      /* Full name, wrapped if it must be. The ellipsis belongs to the BAR \u2014 a one-line read-out \u2014 not
         to the card that is opened specifically to show what the bar had to shorten. */
      .st-status-pop-model{min-width:0;white-space:normal;overflow-wrap:anywhere}
      .st-status-pop-empty{color:var(--st-text-tertiary)}
      /* The section name carries the weight in this pair; the position sits behind it as context,
         so a long title can still be read before the count. */
      .st-status-name{color:var(--st-text-secondary);margin-right:var(--st-space-8,8px);
        overflow:hidden;text-overflow:ellipsis;max-width:34ch;display:inline-block;vertical-align:bottom}
      .st-status-count{color:var(--st-text-tertiary)}
      /* The saved time is a read-out. Only a failure changes its colour: a timestamp that is a
         little stale is still a timestamp, and tinting it would turn information into an alarm. */
      .st-status-item[data-tone="error"]{color:var(--dsw-alias-state-error-primary,var(--st-fallback-error))}
      /* A write just landed: a wash behind the timestamp, fading out. The text does not change, so
         the reading stays truthful while the marker says "that was this instant". */
      .st-status-flash{animation:st-status-flash 1.4s var(--ds-ease-in-out,ease-in-out) both;border-radius:var(--st-radius-xs,4px)}
      @keyframes st-status-flash{
        0%{background:color-mix(in srgb, var(--st-accent) 34%, transparent);color:var(--st-text-primary)}
        100%{background:transparent}
      }
      @media (prefers-reduced-motion: reduce){
        /* No fade: the colour simply appears and goes, which still marks the moment. */
        .st-status-flash{animation:none;background:color-mix(in srgb, var(--st-accent) 22%, transparent)}
      }
      /* The dock's buttons: readable at arm's length, still flat. */
`;

// src/client/panel/models.css.js
var CSS_MODELS = `
      /* ---- models: the roles page, the two pickers, and the effort axis ---- */
      .st-models{display:flex;flex-direction:column;gap:var(--st-space-16,16px);width:var(--st-settings-w,340px);max-width:100%}
      .st-model-file{font-size:var(--st-text-sm);line-height:var(--st-line-height-ui);color:var(--st-text-tertiary);
        font-family:var(--st-font-mono);overflow-wrap:anywhere;padding-top:var(--st-space-4,4px)}
      .st-model-row{display:flex;flex-direction:column;gap:var(--st-space-8,8px);min-width:0;
        padding-top:var(--st-space-12,12px);border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-model-row:first-of-type{border-top:none;padding-top:0}
      .st-model-row-head{display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0}
      .st-model-role{flex:none;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-model-follow-tag{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-model-follow{margin-left:auto;font-size:var(--st-text-sm);padding:0 var(--st-space-8,8px)}
      /* The confirmation is the accent, briefly: the row's own state tag already changed, and this
         only has to say that the change reached the host. */
      .st-model-flash{margin-left:var(--st-space-8,8px);font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-accent);
        animation:st-flash-in .16s var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-flash-in{from{opacity:0;translate:0 2px}to{opacity:1;translate:0 0}}
      @media (prefers-reduced-motion: reduce){.st-model-flash{animation:none}}
      /* The chip is a compact control in the composer; on this page it is the row's main control,
         so it takes the width and says so: a name with a caret and no surface around it reads as
         a label, and the writer would not know it can be pressed. */
      .st-mselect{position:relative;min-width:0}
.st-mselect-button{display:flex;align-items:center;gap:var(--st-space-8,8px);width:100%;min-width:0;
        font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);padding:var(--st-space-4,4px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);cursor:pointer;
        background:var(--st-surface);color:var(--st-text-primary);corner-shape:round;}
      .st-mselect-button:hover{background:var(--st-hover-fill)}
      .st-mselect-button:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-mselect-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;text-align:left}
      .st-mselect-caret{flex:none;color:var(--st-text-tertiary)}
      /* The menu opens over the row it belongs to, not inside it: a list inside a 340px column
         would be clipped by the drawer's own scroll. */
      .st-mselect .st-model-menu{position:absolute;z-index:var(--st-layer-menu);top:calc(100% + 4px);left:0;right:0;
        /* Reset the composer menu's bottom offset: with both top and bottom set the box is pinned
           to neither end and collapses to the height of its own padding. */
        bottom:auto;min-width:0;max-width:none;max-height:min(46vh,320px)}
      /* The effort axis: stops on one line, least to most. The line is the point \u2014 it says which
         way is more, which a dropdown cannot. */
      .st-effort{position:relative;display:flex;align-items:flex-start;margin-top:var(--st-space-8,8px)}
      .st-effort::before{content:'';position:absolute;left:10%;right:10%;top:var(--st-effort-tick,5px);height:var(--st-rule-h,1px);
        background:var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-effort-stop{position:relative;flex:1 1 0;min-width:0;display:flex;flex-direction:column;
        align-items:center;gap:var(--st-space-4,4px);padding:0;border:none;background:transparent;
        cursor:pointer;font-family:inherit}
      .st-effort-stop:focus-visible{outline:none}
      .st-effort-stop:focus-visible .st-effort-dot{
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-effort-dot{width:var(--st-mark-md,9px);height:var(--st-mark-md,9px);border-radius:var(--st-radius-pill,999px);corner-shape:round;flex:none;
        background:var(--st-surface);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--st-fallback-border-l4));
        transition:background var(--ds-transition-duration-fast,.12s)}
      .st-effort-stop[data-on="true"] .st-effort-dot{background:var(--st-accent);
        box-shadow:0 0 0 3px color-mix(in srgb, var(--st-accent) 22%, transparent)}
      .st-effort-name{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
      .st-effort-stop[data-on="true"] .st-effort-name{color:var(--st-text-primary)}
      /* ---- custom providers ---- */
      .st-custom-models{display:flex;flex-direction:column;gap:var(--st-space-8,8px);
        padding-top:var(--st-space-12,12px);border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-custom-models-head{display:flex;align-items:center;gap:var(--st-space-8,8px)}
      .st-custom-add{margin-left:auto;font-size:var(--st-text-sm)}
      .st-custom-provider{display:flex;flex-direction:column;gap:var(--st-space-4,4px);
        padding:var(--st-inset-sm) var(--st-inset-md);border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface-high)}
      .st-custom-provider-main{display:flex;align-items:baseline;gap:var(--st-space-8,8px);min-width:0}
      .st-custom-provider-name{font-size:var(--st-text-md);font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-custom-provider-kind{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary)}
      .st-custom-provider-meta{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-custom-provider-actions{display:flex;align-items:center;gap:var(--st-space-4,4px)}
      .st-custom-provider-actions .st-btn{font-size:var(--st-text-sm);padding:0 var(--st-space-8,8px)}
      .st-custom-model-list{display:flex;flex-wrap:wrap;gap:var(--st-space-4,4px);max-height:var(--st-model-list-max-h,160px);overflow:auto}
      .st-custom-model-chip{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        padding:var(--st-space-2,2px) var(--st-space-8,8px);border-radius:var(--st-radius-pill,999px);
        background:var(--st-hover-fill);color:var(--st-text-secondary)}
`;

// src/client/panel/settings.css.js
var CSS_SETTINGS = `
      /* ---- settings: the preference page and its groups ---- */
      .st-settings{display:flex;flex-direction:column;gap:var(--st-space-16,16px)}
      .st-settings-group{display:flex;flex-direction:column;gap:var(--st-space-8,8px)}
      .st-settings-group + .st-settings-group{padding-top:var(--st-space-16,16px);
        border-top:.5px solid var(--dsw-alias-border-l3,var(--st-fallback-border-l3))}
      .st-settings-title{font-size:var(--st-text-md);
        line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-medium);
        color:var(--st-text-primary)}
      /* The AI dock: the suggestion, the thinking state, and their buttons.
         It sits UNDER the page, the width of the measure, in normal flow. It used to be an
         absolutely positioned card pinned under the caret line, which meant it covered the very
         paragraph being edited and swallowed clicks on it \u2014 so with a suggestion open the writer
         could not read or touch the text underneath. A textarea cannot hold a block between its
         own lines, so the honest place for it is below the page: nothing is covered, the full
         measure is used, and every other control stays reachable.

         No border and no shadow: on a dark page a drop shadow reads as a top edge, which is what
         "there is still a border on it" was pointing at. The raised layer alone separates it. */
      /* The surface, radius and shadow come from the host's own composer card: its panel radius,
         its input-major surface and its soft elevation are exactly what the dsh input box uses, so
         the dock and the host composer are the same rounded card rather than two surfaces that
         nearly match. Each token is read first with a fallback for a host that does not publish
         it. */

      .st-library-picker{display:flex;align-items:center;gap:var(--st-space-8,8px);min-width:0}
      .st-library-path{flex:1 1 auto;min-width:0;height:var(--st-row-height,32px);padding:0 var(--st-space-12,12px);
        border:var(--st-hairline) solid var(--st-ink-edge);border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface);color:var(--st-text-primary);font-family:inherit;font-size:var(--st-text-md);
        text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}
      .st-library-path:disabled{cursor:default;color:var(--st-text-tertiary)}
`;

// src/client/panel/outline.css.js
var CSS_OUTLINE = `
      /* ---- the outline: the chapter tree and its inline editors ---- */
      .st-tree{display:flex;flex-direction:column;gap:var(--st-space-2,2px)}
.st-node{display:flex;align-items:baseline;gap:var(--st-space-8,8px);padding:var(--st-space-4,4px) var(--st-space-8,8px) var(--st-space-4,4px) 0;border-radius:var(--st-radius-sm,8px);
        cursor:pointer;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);color:var(--st-text-secondary);min-width:0;corner-shape:round;}
      .st-node:hover{background:var(--st-hover-fill)}
      .st-node[data-current="true"]{background:var(--st-selected-fill);color:var(--st-text-primary)}
      .st-node[data-level="volume"]{color:var(--st-text-primary);font-weight:var(--st-font-weight-strong)}
      .st-node[data-level="chapter"]{font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-node-caret{flex:none;width:var(--st-space-12,12px);font-size:var(--st-text-sm);color:var(--st-text-tertiary)}
      .st-node-dot{flex:none;width:var(--st-mark-sm,4px);height:var(--st-mark-sm,4px);border-radius:var(--st-radius-pill,999px);corner-shape:round;background:var(--dsw-alias-border-l4,var(--st-fallback-border-l4));margin-top:var(--st-space-8,8px)}
      .st-node-input{flex:1 1 auto;min-width:0;font-size:var(--st-text-md);padding:var(--st-space-2,2px) var(--st-space-4,4px)}
      /* The two actions appear together on hover: they belong to the same row and hiding one of
         them made the other look like the row's only option. They override the button height
         down to the compact row, so the pill system does not inflate the tree. */
      .st-node-remove,.st-node-rename{--st-btn-h:var(--st-btn-h-sm,26px);opacity:0;flex:none;padding:0 var(--st-space-4,4px);line-height:var(--st-text-sm-leading)}
      .st-node:hover .st-node-remove,.st-node:hover .st-node-rename,
      .st-node:focus-within .st-node-remove,.st-node:focus-within .st-node-rename{opacity:1}
      .st-node-rename:hover{color:var(--st-accent) !important}
      .st-node-remove:hover{color:var(--dsw-alias-state-error-primary,var(--st-fallback-error)) !important}
/* The name is part of a clickable row, so it takes the hand too. It used to say "text",
         which made the row read as a line of prose you could put a caret in \u2014 the row selects a
         chapter, it does not edit one. Double-click still renames, and the caret appears in the
         input that opens for it, which is where a text cursor belongs. */
      .st-node-name{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        cursor:pointer;border-radius:var(--st-radius-xs,4px);corner-shape:round;}
      .st-node:hover .st-node-name{color:var(--st-text-primary)}

      /* The mosaic sheet: a card that drops from the panel's top edge, the way a reference panel
         unfolds downward. It stops above the dock \u2014 the composer is the one region of the page
         this board must never cover \u2014 and its height is FIXED: a board that grows with its
         content reflows the canvas under the writer's cursor. The dimmed area covers the shell
         between the title row and the dock slot, so both stay clickable. */
      /* Behind the board. It is a real scrim now: darker than the page and blurred, so the manuscript
         underneath reads as "put away" rather than as another surface at the same depth as the board.
         It used to be a 55% wash of the page's own colour, which on a dark theme left the board and
         the page as the same value \u2014 the sheet floated on nothing. */
      /* The dimmed area covers the WHOLE panel, dock included, so a click anywhere outside the
         board dismisses it. The dock clearance is a PADDING here, not part of the inset: with it
         carved out of the inset the strip below the board belonged to the editor, and clicking
         the empty space under the board did nothing \u2014 the one gesture every other popover in the
         panel answers. Padding keeps the board itself out of the dock while the scrim still
         catches the click. */
`;

// src/client/panel/rail.css.js
var CSS_RAIL = `
      /* ---- the rail: a scrolling upper region and a fixed one under it ---- */
      .st-rail-body{display:flex;flex-direction:column;min-height:0;flex:1 1 auto;min-width:0}
      /* The card is split in half: the tree above, the menu below.
         A FIXED share rather than "whatever the tree needs": the menu is a region of the panel, not
         a footer stuck under a list. Sized to its content the tree pushed the menu down to a strip
         at the bottom edge on any book with more than a handful of sections, which is why the menu
         read as an afterthought. Half the card is enough for a chapter list to be scanned and
         scrolled, and it puts the menu's first row at the card's midpoint \u2014 a place the eye can
         find without hunting.
         The tree still scrolls inside its share: a long book does not make the card taller. */
      .st-rail-body .st-scroll{flex:0 1 50%;min-height:0}
      /* The menu's own block: the remaining half, top-aligned. Not stretched to fill \u2014 a
         list that spreads its rows to the bottom edge would look like a settings form; the blank
         space under the last row is what says the list has ended.
         Its inline padding is WIDER than the tree's above it (16 against the scroll box's 12),
         which is deliberate: the tree is a dense outline where every pixel of width buys a longer
         title, while the menu is four short words and reads as cramped when it starts at the same
         line. The extra inset is what makes it a menu in the card rather than a continuation of
         the list. */
      .st-rail-menu{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;justify-content:flex-start;
        padding:var(--st-space-16,16px) var(--st-space-16,16px) var(--st-space-16,16px)}

      /* ---- the function list ----
         Set to the host sidebar's own panel list, because that is what this is: a vertical menu of
         destinations at the bottom of a narrow column. The numbers are the host's, taken from
         ui-sidebar/SidebarRoot.module.css rather than guessed:
           row     min-height 36, padding 7/8, gap 8, radius radius-md, rows 4 apart
           text    14px at the inherited weight (the host's sidebar root is 14px)
         The group has no heading. It is not one subject \u2014 the shelf is navigation, save writes the
         file, export leaves the panel, about is a read-out \u2014 and a label that names only the first
         of those would be worse than none. */
      .st-rail-tools{display:flex;flex-direction:column;gap:var(--st-space-4,4px);min-width:0}

/* One destination per line. Full width, 36 tall, at reading size \u2014 the same row the host
         uses for its own panels, so the menu reads as a sibling of the sidebar rather than as a
         strip of small print appended to a tree. */
      .st-rail-tool{display:flex;align-items:center;gap:var(--st-space-8,8px);
        width:100%;min-width:0;min-height:var(--st-row-height-lg,36px);
        padding:var(--st-space-8,8px);box-sizing:border-box;
        border:none;border-radius:var(--st-radius-md,12px);background:transparent;cursor:pointer;
        font-family:inherit;font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        font-weight:var(--st-font-weight-normal);color:var(--st-text-primary);text-align:left;corner-shape:round;}
      .st-rail-tool:hover:not(:disabled){background:var(--st-hover-fill)}
      .st-rail-tool:active:not(:disabled){background:var(--st-active-fill)}
      /* Focus is an INSET ring, matching the host's panel rows: an outer ring on a full-width row
         would draw over the column's edge instead of around the row. */
      .st-rail-tool:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--st-focus-ink);
        outline-offset:-2px}
      /* A destination that needs the book is disabled without one, and says so by looking like it.
         The ink drops, not the whole row's opacity: a faded glyph reads as a smudge. */
      .st-rail-tool:disabled{cursor:not-allowed;color:var(--st-text-tertiary)}
      .st-rail-tool:disabled .st-rail-tool-icon{opacity:var(--st-fade-quiet)}
      /* The glyph gets a fixed box so four labels share one left edge \u2014 the alignment comes from
         the slot being measured, not from four icons happening to be about as wide. */
      .st-rail-tool-icon{flex:none;display:inline-flex;align-items:center;justify-content:center;
        width:var(--st-icon-menu,18px);height:var(--st-icon-menu,18px);
        color:var(--st-text-secondary)}
      .st-rail-tool:hover:not(:disabled) .st-rail-tool-icon,
      .st-rail-tool:focus-visible .st-rail-tool-icon{color:var(--st-text-primary)}
      /* The label is what shortens when the column is narrow; the glyph is what identifies the row. */
      .st-rail-tool-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

// src/client/mosaic/board.css.js
var CSS_BOARD = `
      /* ---- the board: its surface and bookmark column ---- */
      /* No dimming layer: the board is a panel over the page, not a modal. The backdrop stays
         because it is the sheet's positioning context, but it paints nothing and passes clicks
         through, so the composer below stays visible and typeable. */
      .st-mosaic-backdrop{position:absolute;inset:var(--st-titlebar-height,68px) 0 0 0;z-index:var(--st-layer-mosaic);
        display:flex;align-items:flex-start;justify-content:center;
        padding-bottom:var(--st-mosaic-dock-clearance);
        pointer-events:auto;
        animation:st-mosaic-scrim-in var(--st-motion-open,180ms) ease both}
      @keyframes st-mosaic-scrim-in{from{opacity:0}to{opacity:1}}
      /* A raised surface, not a coloured rectangle: a hairline edge, a layered shadow, and a
         one-pixel inner highlight along the top. It takes its own clicks back \u2014 the layer
         around it passes everything through. */
      .st-mosaic-sheet{pointer-events:auto;
        width:calc(100% - var(--st-overlay-inset));height:100%;flex:none;min-height:0;
        background:var(--st-surface);
        border:.5px solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);corner-shape:round;
        display:flex;overflow:hidden;position:relative;
        box-shadow:inset 0 1px 0 color-mix(in srgb, var(--st-highlight,#fff) 10%, transparent),
                   0 2px 6px rgba(0,0,0,.14),
                   0 16px 40px rgba(0,0,0,.28),
                   0 40px 80px rgba(0,0,0,.22);
        animation:st-mosaic-in var(--st-motion-open,180ms) var(--ds-ease-in-out,ease-in-out) both}
      /* A drop, not a slide: the card unfolds downward, and folds back up the same way. */
      @keyframes st-mosaic-in{from{transform:translateY(-16px);opacity:0}to{transform:none;opacity:1}}
      .st-closing.st-mosaic-backdrop{animation:st-mosaic-scrim-out var(--st-motion-close,140ms) ease both}
      @keyframes st-mosaic-scrim-out{from{opacity:1}to{opacity:0}}
      .st-closing .st-mosaic-sheet{animation:st-mosaic-out var(--st-motion-close,140ms) var(--ds-ease-in-out,ease-in-out) both}
      @keyframes st-mosaic-out{from{transform:none;opacity:1}to{transform:translateY(-16px);opacity:0}}
      /* The bookmarks are a rail a step BELOW the page beside it: the content reads as the
         surface and the rail as its spine. */

      /* ---- the board's pages: bands, canvas, and the card drawn on it ---- */
      .st-mosaic-tabs{display:flex;flex-direction:column;gap:var(--st-space-8,8px);padding:var(--st-space-12,12px) var(--st-space-8,8px);
        border-left:.5px solid var(--st-ink-edge);
        background:var(--st-ink-whisper)}
      /* The vertical text is padded evenly on both sides: letter-spacing adds one slot after
         the last glyph, and the negative inline margin pulls it back out, so the selected pill
         sits centred. */
      .st-mosaic-tab{border:none;background:transparent;padding:var(--st-space-12,12px) 0;cursor:pointer;
        border-radius:var(--st-radius-sm,8px);corner-shape:round;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        writing-mode:vertical-rl;letter-spacing:var(--st-tab-tracking);margin-inline:var(--st-tab-tracking-pull);
        text-align:center;box-sizing:border-box;
        color:var(--st-text-tertiary)}
      .st-mosaic-tab:hover{background:var(--st-hover-fill)}
      .st-mosaic-tab:active{background:var(--st-active-fill)}
      /* The selected bookmark: a brighter FILL and weight, no coloured ring \u2014 selection is a
         brightness step, not an accent, so the board's colour stays reserved for the wires and
         the actions that need it. */
      .st-mosaic-tab[data-active="true"]{background:var(--st-selected-fill);
        color:var(--st-text-primary);font-weight:var(--st-font-weight-strong)}
      .st-mosaic-body{flex:1;min-width:0;overflow:hidden;padding:var(--st-board-inset);display:flex;flex-direction:column}
      /* Every page is three bands: a title, ONE non-growing row of controls, then the content.
         The operation area is the same height on every bookmark \u2014 layout is decided once. Only
         a non-board page's content scrolls; the canvas page hands its height to the board. */
      .st-mosaic-band{display:flex;flex-direction:column;gap:var(--st-board-gap);flex:1 1 auto;min-height:0}
      .st-mosaic-band-heading{margin:0;font-weight:var(--st-font-weight-strong);
        font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        color:var(--st-text-primary)}
      /* The title row: name on the left, tools at the trailing edge of the same line. One
         non-wrapping flex row, so a long title truncates instead of pushing the buttons down. */
      .st-mosaic-band-head{display:flex;align-items:center;gap:var(--st-space-12,12px);flex-wrap:nowrap;min-width:0}
      .st-mosaic-band-head .st-mosaic-band-heading{flex:0 1 auto;min-width:0;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-mosaic-band-tools{display:flex;gap:var(--st-space-8,8px);align-items:center;margin-left:auto;flex:none}
      /* Inside the title row the header carries no outer margin of its own \u2014 in a one-line row
         it just pushes the buttons off centre. */
      .st-mosaic-band-tools .st-mosaic-head{margin:0;flex-direction:row;align-items:center}
      .st-mosaic-band-tools .st-mosaic-check-row{gap:var(--st-space-4,4px)}
      .st-mosaic-band-content{display:flex;flex-direction:column;gap:var(--st-board-gap);min-width:0;flex:1 1 auto;min-height:0;overflow:auto}
      /* The relations board fills the page exactly: canvas grows, foot row keeps its height. */
      .st-mosaic-board{display:flex;flex-direction:column;gap:0;flex:1 1 auto;min-height:0}
      .st-mosaic-board .st-mosaic-focus{flex:none;margin:var(--st-space-8,8px) 0 0;padding:var(--st-space-12,12px) 0 0}
      .st-mosaic-band-content:has(> .st-mosaic-board){overflow:hidden;padding-bottom:0}
      /* A split page (\u6982\u89C8 / \u63D0\u6848 / \u6D41\u6D3E) owns its own scrolling columns; letting the outer band
         scroll as well produced two scrollbars and a detail pane that could be scrolled away. */
      .st-mosaic-band-content:has(> .st-split){overflow:hidden}
      /* The canvas: a positioning context with a floor, and a WELL one layer below the sheet \u2014
         a recessed fill and an inner hairline, so the cards visibly sit ON something. */
      .st-mosaic-canvas{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;padding:0;
        border-radius:var(--st-radius-md,12px);
        background:var(--dsw-alias-bg-layer-0,var(--dsw-alias-bg-base,var(--st-fallback-page)));
        box-shadow:inset 0 1px 3px rgba(0,0,0,.06)}
      /* The two selectors are the board's FOOT, above a hairline. No frame of their own \u2014 the
         panel's fields are borderless with a fill, and a box around a filled select is a box in
         a box. */
      .st-mosaic-focus{display:flex;flex-wrap:wrap;gap:var(--st-space-12,12px);align-items:center;
        margin:var(--st-board-inset) 0 0;padding:var(--st-board-inset) 0 0;
        border-top:1px solid var(--dsw-alias-border-l4,var(--st-fallback-border-l4))}
      .st-mosaic-focus-label{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      /* One picker: a framed field holding a button, and a list anchored to that field. The
         field is the positioning context, so the list opens UPWARD from it \u2014 the OS would open
         a native select upward over the control at the foot of a sheet; this direction is ours. */
      .st-mosaic-pick{position:relative;display:flex;gap:var(--st-space-8,8px);align-items:center;min-width:0;
        padding:var(--st-inset-xs) var(--st-inset-sm);border:1px solid var(--dsw-alias-border-l4,var(--st-fallback-border-l4));
        border-radius:var(--st-radius-sm,8px);corner-shape:round;background:var(--st-surface-high)}
      .st-mosaic-pick:focus-within{border-color:var(--st-accent)}
      .st-mosaic-pick-button{display:flex;align-items:center;gap:var(--st-space-4,4px);max-width:var(--st-picker-min-w,220px);min-width:0;
        padding:var(--st-space-2,2px) var(--st-space-4,4px);border:none;border-radius:var(--st-radius-xs,4px);corner-shape:round;background:transparent;
        color:var(--st-text-primary);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        cursor:pointer;text-align:left;outline:none}
      .st-mosaic-pick-button:focus-visible{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-mosaic-pick-value{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-mosaic-pick-list{position:absolute;z-index:var(--st-layer-menu);bottom:calc(100% + 4px);left:0;
        display:flex;flex-direction:column;min-width:100%;max-width:min(320px,calc(100vw - 48px));
        max-height:min(46vh,320px);overflow:auto;padding:var(--st-space-4,4px);
        border-radius:var(--st-radius-md,12px);corner-shape:round;background:var(--st-surface-high);
        box-shadow:var(--dsw-elevation-prominent,0 0 0 .5px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.12));
        scrollbar-width:thin}
      .st-mosaic-pick-option{display:flex;align-items:center;width:100%;padding:var(--st-space-8,8px) var(--st-space-12,12px);border:none;
        border-radius:var(--st-radius-sm,8px);corner-shape:round;background:transparent;
        color:var(--st-text-primary);font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        cursor:pointer;text-align:left;outline:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-mosaic-pick-option:hover{background:var(--st-hover-fill)}
      .st-mosaic-pick-option[aria-checked="true"]{color:var(--st-text-primary);font-weight:var(--st-font-weight-strong);
        background:var(--st-selected-fill)}
      .st-mosaic-wires{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
      /* The visible line reads the card border's own token \u2014 the same colour as the boxes it
         joins, in whichever theme is loaded. The border token is invisible on a dark theme, so
         a theme-specific hairline here drew nothing. */
      .st-mosaic-edge{stroke:var(--st-accent);stroke-width:var(--st-edge-w);
        stroke-opacity:var(--st-edge-opacity);pointer-events:none}
      /* The hit line: wide, transparent, takes the pointer. It carries hover for both lines via
         the adjacent-sibling combinator \u2014 the two lines are SIBLINGS, hit first, and a <line>
         cannot have children for a descendant combinator to find. */
      .st-mosaic-edge-hit{stroke:transparent;stroke-width:var(--st-edge-hit-w);pointer-events:stroke;cursor:pointer}
      .st-mosaic-edge-hit:hover + .st-mosaic-edge{stroke:var(--dsw-alias-label-primary,var(--st-fallback-ink-contrast));stroke-opacity:1}
      .st-mosaic-edge-picked{stroke:var(--st-accent);stroke-width:var(--st-edge-picked-w);stroke-opacity:1}
      /* A card is a RAISED object on the board \u2014 its own shadow is what separates it from the
         wall behind it. The height is set, not grown from content: the wires are drawn from the
         same number (see CARD_H), and a card that sized itself to its name would move its own
         endpoints. */

`;

// src/client/mosaic/cards.css.js
var CSS_CARDS = `
      /* ---- a card on the canvas: the photo, the caption, and the wires between them ---- */
      /* THE CARD IS ITS PICTURE.
         The portrait fills the whole box \u2014 no inset, no inner border, no band with a frame around
         it \u2014 and the caption LIES OVER its lower half. That is what the writer asked for, and it
         is also what makes the card readable as a person rather than as a form: a framed thumbnail
         with a caption beneath it is a passport photo, and the wall was a grid of them.
         The card is padded by nothing: the picture runs to its own rounded edge. */
      .st-mosaic-card{position:absolute;box-sizing:border-box;
        width:var(--st-card-w,120px);height:var(--st-card-h,168px);
        padding:0;overflow:hidden;
        border:1px solid var(--dsw-alias-border-l2,var(--st-fallback-border-l2));border-radius:var(--st-radius-md,12px);
        background:var(--st-surface);cursor:grab;user-select:none;touch-action:none;
        box-shadow:var(--dsw-shadow-lv2,0 1px 2px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.06));
        transition:box-shadow .12s ease}
      /* The picture: the card's whole box, cropped to fill it. No frame of its own \u2014 the card's
         own border is the only edge, which is why nothing here draws a second one. */
      .st-mosaic-card-photo{position:absolute;inset:0;overflow:hidden;
        display:grid;place-items:center;background:var(--st-surface)}
      .st-mosaic-card-photo img{width:100%;height:100%;object-fit:cover;display:block}
      /* The initial is centred in the picture's VISIBLE half, not in the card.
         The picture fills the whole card and the caption covers the lower half, so centring the
         letter in the box put it exactly on the seam \u2014 half of it behind the scrim, which is what
         made a one-letter card look broken. It is offset up by a quarter of the card's height so it
         sits in the middle of the band that is actually seen. */
      /* The monogram on a card with no photograph yet. It is centred in the card \u2014 the caption
         band below is the same surface colour, so what the eye sees is a glyph centred in the
         open upper half \u2014 and it is large enough to read as a deliberate face-holder rather than
         as a stray character in a corner. The old upward offset belonged to the translucent
         scrim era and has nothing to push away from now. */
      .st-mosaic-card-photo .st-mosaic-card-initial{user-select:none;font-weight:var(--st-font-weight-strong);
        font-size:calc(var(--st-text-xl,20px) * 2);line-height:1;
        color:var(--st-ink-faint)}
      /* The seam between the picture and the caption exists only when there IS a picture: on a
         plain card it is a line across an empty surface, cutting the card into two slabs. */
      /* The caption over the lower half of the picture, anchored to the BOTTOM edge. It covers
         exactly HALF the card, measured from its bottom edge \u2014 not "as much as its two lines
         need": a picture band on top and a caption band below is what makes every card in a
         wall break at the same line, where a content-sized caption left neighbours showing
         different amounts of picture and the wall looked ragged. The fraction is written
         against the card's own height so it follows --st-card-h instead of repeating a number
         that goes stale the next time the card is resized.
         A scrim under it is what keeps the title legible over an arbitrary photograph \u2014 without
         one, a pale picture made the name disappear and a busy one made it unreadable. */
      /* The band is exactly as tall as its text: by default two lines (name and identity), and
         it is NOT a fixed half of the card \u2014 a fixed half, filled opaquely, covered half of
         every photograph for the sake of one line of text. Hovering adds the introduction and
         the band grows for that one card alone. */
      .st-mosaic-card-caption{position:absolute;left:0;right:0;bottom:0;box-sizing:border-box;
        display:flex;flex-direction:column;justify-content:flex-end;gap:0;
        min-width:0;padding:var(--st-inset-xs) var(--st-inset-sm);
        /* OPAQUE, on the writer's instruction: the old scrim was a translucent black ramp that
           let the photograph ghost through under the text. The band is the card's own surface
           now; the hairline along its top edge \u2014 drawn only when a photograph is above it \u2014 is
           the boundary the ramp used to draw. */
        background:var(--st-surface)}
      .st-mosaic-card:not(.st-mosaic-card-plain) .st-mosaic-card-caption{
        box-shadow:inset 0 var(--st-hairline) 0 var(--dsw-alias-border-l2,var(--st-fallback-border-l2))}
      /* The \u22EF menu, in the card's top-right corner. It fades in with the card's hover on a wall
         where cards are the content, and stays out of the picture until then: a permanent glyph on
         every card in a grid of pictures is furniture. */
      .st-card-menu{position:absolute;top:var(--st-inset-sm);right:var(--st-inset-sm);
        z-index:var(--st-mosaic-z-card-menu);display:flex;flex-direction:column;align-items:flex-end}
      /* No fill and no ring until it is used: a dark pill behind the dots darkened the corner of
         every card and competed with the picture, so the three dots ARE the control.
         GREY, from the theme's own caption ink, and no shadow: the dots used to be white with a
         drop shadow to survive a photograph, which made them the brightest thing on a card whose
         picture is a placeholder. Quiet ink reads on both the empty field and a real image. */
      .st-card-menu-trigger{display:inline-flex;align-items:center;justify-content:center;
        width:var(--st-icon-menu-hit,20px);height:var(--st-icon-menu-hit,20px);padding:0;
        border:none;border-radius:var(--st-radius-pill,999px);corner-shape:round;
        background:transparent;cursor:pointer;
        color:var(--st-text-tertiary);
        opacity:0;transition:opacity var(--ds-transition-duration-fast,.12s) var(--ds-ease-in-out,ease-in-out)}
      /* The three dots, stacked. Drawn as dots rather than as a glyph so they are identical in size
         and spacing on every card: a vertical ellipsis character spaces itself by the font.
         One pixel each \u2014 a menu affordance is a mark, not a button's worth of ink. */
      .st-card-menu-dots{display:flex;flex-direction:column;align-items:center;
        gap:var(--st-space-2,2px)}
      .st-card-menu-dots>i{display:block;width:var(--st-icon-menu-dot,2px);height:var(--st-icon-menu-dot,2px);
        border-radius:var(--st-radius-pill,999px);corner-shape:round;background:currentColor}
      .st-mosaic-page-card:hover .st-card-menu-trigger,
      .st-mosaic-card:hover .st-card-menu-trigger,
      .st-card-menu-trigger:focus-visible,
      .st-card-menu-trigger[aria-expanded="true"]{opacity:1}
      /* Hover brightens the DOTS, never the box: a fill appearing under the pointer is the same
         darkening the trigger was freed from, just later. */
      .st-card-menu-trigger:hover{opacity:1}
      .st-card-menu-trigger:hover{color:var(--st-text-primary)}
      .st-card-menu-trigger:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      /* The list opens to the LEFT of the corner so a card at the grid's right edge does not push
         its own menu off the wall. */
      .st-card-menu-list{position:absolute;top:calc(100% + 4px);right:0;z-index:var(--st-mosaic-z-card-menu-list);
        display:flex;flex-direction:column;min-width:var(--st-menu-min-w,120px);padding:var(--st-space-8,8px);
        border-radius:var(--st-radius-md,12px);corner-shape:round;background:var(--st-surface-high);
        box-shadow:0 4px 16px rgba(0,0,0,.28)}
      /* Menu rows are TALL \u2014 generous vertical padding is what reads as airy; the type stays at
         the working step. */
      .st-card-menu-item{display:block;width:100%;padding:var(--st-space-8,8px) var(--st-space-12,12px);
        border:none;border-radius:var(--st-radius-sm,8px);corner-shape:round;background:transparent;text-align:left;
        font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        color:var(--st-text-primary);cursor:pointer}
      .st-card-menu-item:hover{background:var(--st-hover-fill)}
      .st-card-menu-item.st-danger{color:var(--dsw-alias-state-error-primary,var(--st-fallback-error))}
      .st-card-menu-item.st-danger:hover{background:var(--dsw-alias-state-error-primary,var(--st-fallback-error));color:#fff}
      .st-mosaic-card:hover{box-shadow:var(--dsw-shadow-lv3,0 2px 4px rgba(0,0,0,.1),0 8px 20px rgba(0,0,0,.1))}
      .st-mosaic-card:active{cursor:grabbing}
      /* Both lines sit on the scrim, so both are chosen for a dark backing rather than for the
         theme's page: the label tokens would turn dark-on-dark in a light theme. The name takes
         the working step, not the title step \u2014 at the title step a two-line caption took most
         of the band and squeezed the picture \u2014 and the weight still separates it from the line
         under it. */
      .st-mosaic-card-name{display:block;font-weight:var(--st-font-weight-strong);
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* The introduction, clamped to two lines. A writer's description can be a paragraph; the
         band is a fixed half of the card, so the text is what has to give. Two lines is enough for
         a sentence \u2014 which is what a card is for \u2014 and anything longer belongs in the popover. */
      /* The introduction appears only UNDER THE POINTER: by default the card shows its name and
         its identity line, and a wall of cards stays a wall of pictures \u2014 a paragraph on every
         card covered the photograph and made the board read as text. Reading the intro is a
         deliberate look at ONE card, which is exactly what a hover is. */
      .st-mosaic-card-intro{display:none;-webkit-line-clamp:2;-webkit-box-orient:vertical;
        overflow:hidden;margin-top:var(--st-space-2,2px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:color-mix(in srgb, #fff 66%, transparent)}
      .st-mosaic-card:hover .st-mosaic-card-intro{display:-webkit-box}
      .st-mosaic-card-sub{display:block;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:color-mix(in srgb, #fff 76%, transparent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* The detail popover floats over the canvas's near corner: reading one card or one edge
         should not displace the others, and a \u2715 plus an empty-canvas click both put it away.
         Its styles live in entity.css with the detail page it shares. */

      /* ---- the gallery: cards laid out as a page of objects, not as a map ---- */
      .st-mosaic-gallery{display:grid;gap:var(--st-board-gap);align-items:start;
        grid-template-columns:repeat(auto-fill,var(--st-gallery-w,184px));
        padding:var(--st-space-2) 0 var(--st-board-gap)}
      /* Every dimension is pinned, and the height is a contract: a card with a two-line summary
         and a card with none are the same size, so a row of them is a grid rather than a jagged
         stack. Content that overflows is clipped here and read in full in the detail popover.
         A card is an OBJECT, so it is drawn as one: a raised surface with a soft, layered shadow
         rather than a flat rectangle with a hairline. The three shadows are the ones a real card
         casts \u2014 a tight contact shadow at the edge, a close ambient one, and a wide soft one \u2014 and
         each is mixed from the theme ink so it works on a light and a dark theme alike. The
         proportions are stated as parts rather than one total: the picture band and the text band
         each claim a fixed share of the same height, instead of the picture being squeezed by
         whatever the prose needed. */
      .st-mosaic-page-card{width:var(--st-gallery-w,184px);height:var(--st-gallery-h,258px);
        /* A card is a BUTTON, so the pointer says so. Without an explicit cursor the browser
           chooses one from the content underneath the pointer, and text meant to be readable got
           the I-beam that means "you may place a caret here" \u2014 which is not what clicking a card
           does. It also suppresses the text selection a drag across the gallery would start. */
        cursor:pointer;user-select:none;
        margin:0;padding:0;overflow:hidden;
        display:flex;flex-direction:column;flex:none;min-width:0;max-width:none;
        border:1px solid var(--st-ink-edge);
        border-radius:var(--st-radius-lg,16px);corner-shape:round;
        background:var(--st-surface);
        box-shadow:var(--st-card-shadow);
        transition:var(--st-card-motion)}
      /* Hover lifts it a little and deepens the shadow: the card reads as pickable without moving
         far enough to disturb the row. The new-book tile is in this list because it is a cell of
         the same grid; it is not a gallery card, so its own class supplies the cursor and the
         transition, and only the appearance is shared. */
      .st-mosaic-page-card:hover,.st-book-add:hover{transform:translateY(-2px);
        border-color:var(--st-ink-edge);
        box-shadow:var(--st-card-shadow-lift)}
      /* The new-book tile while its own dialog is open: the accent edge and the lifted position,
         the pair the board's selected card uses to say "this one". Written AFTER the hover rule
         because it is the same specificity \u2014 above it, hovering the open tile would repaint the
         accent edge back to plain ink. The ring is an outline, not a box-shadow, so it does not
         fight the hover shadow for the same property. */
      .st-book-add[aria-expanded="true"]{transform:translateY(-2px);
        border-color:var(--st-accent);
        outline:var(--dsw-focus-ring-width,2px) solid color-mix(in srgb, var(--st-accent) 45%, transparent);
        outline-offset:0;
        color:var(--st-text-primary)}

      /* ---- the portrait band inside a card, and the page a card opens ---- */
      /* The picture's half, FIXED at 62% of the card, and neither half may grow or shrink: the
         text half was once flex 1 1 auto, so a long summary took height from the picture and
         the same card was a different shape depending on how much prose it held. Both halves
         are a stated share now, so the division is the same on every card and only the text
         INSIDE the lower half varies. 62% is what a trading card gives its art; the remaining
         38% holds the name and two lines. The band must be a box with a height of its own,
         because the picture inside it is sized as a share of that height \u2014 as a content-sized
         column the percentage had nothing to resolve against and the picture collapsed. A faint
         vertical wash in the band's background gives it depth even while it is empty, so the
         frame reads as a window rather than a blank panel. */
      .st-mosaic-portrait{position:relative;flex:0 0 62%;min-height:0;
        display:flex;flex-direction:column;gap:0;
        border-bottom:.5px solid var(--st-ink-hair);
        background:
          linear-gradient(180deg,
            var(--st-ink-whisper),
            transparent 60%),
          var(--st-surface-high)}
      /* The frame FILLS its half. A percentage here as well applied the 62% twice \u2014 the picture
         ended up at 38% of the card and the name row took the rest of the picture's box. */
      .st-mosaic-portrait-frame{flex:1 1 auto;width:100%;display:block;overflow:hidden;min-height:0}
      .st-mosaic-portrait-frame img{width:100%;height:100%;object-fit:cover;display:block}
      /* The placeholder initial sits in a coin of its own: it reads as "a picture goes here" rather
         than as stray text, and it is quiet enough that a real image will clearly replace it. */
      .st-mosaic-portrait-initial{user-select:none;
        width:var(--st-hit-target,44px);height:var(--st-hit-target,44px);border-radius:var(--st-radius-pill,999px);corner-shape:round;
        display:grid;place-items:center;
        font-size:var(--st-text-lg);line-height:1;font-weight:var(--st-font-weight-strong);
        color:var(--st-ink-faint);
        background:color-mix(in srgb, var(--st-surface) 70%, transparent);
        box-shadow:
          inset 0 0 0 .5px var(--st-ink-edge),
          0 1px 2px var(--st-ink-hair)}
      /* The caption line: the name, then the role beside it. The name carries the weight and the
         ink; the role is set quiet and set off by a small dot, so one line says who this is AND
         what they are without needing two rows. It is the text half's first line, not a band of
         its own \u2014 the half's height is what is fixed, not this row's. */
      .st-mosaic-portrait-hint{flex:none;padding:var(--st-inset-sm) var(--st-inset-md) 0;
        display:flex;align-items:baseline;justify-content:flex-start;
        gap:var(--st-space-8,8px);flex-wrap:nowrap;box-sizing:border-box;min-width:0;
        font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);font-weight:var(--st-font-weight-strong);
        overflow:hidden;white-space:nowrap}
      /* Text shrinks to an ellipsis; the GAP between the two parts does not. The name gives way
         first (it is the longer field and the one with a fallback \u2014 the picture already shows its
         initial), and the role only gives way after it. A pinned flex-shrink on the gap stops
         a long line from squeezing the space between name and role down to nothing, which is what
         made two crowded words look like one run-on label. */
      .st-mosaic-portrait-name{min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;font-weight:var(--st-font-weight-strong);color:var(--st-text-primary);
        font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading)}
      /* The subtitle, one step down from the title it sits beside. It inherited the title's size
         before, so a card read as two names of equal weight with a dot between them. */
      .st-mosaic-portrait-role{min-width:0;flex:0 1 auto;max-width:52%;overflow:hidden;text-overflow:ellipsis;
        white-space:nowrap;color:var(--st-text-tertiary);
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);font-weight:var(--st-font-weight-normal)}
      .st-mosaic-portrait-hint>*{flex-shrink:0}
      .st-mosaic-portrait-hint>.st-mosaic-portrait-name{flex-shrink:1}
      .st-mosaic-portrait-role::before{content:'\xB7';margin-right:var(--st-space-8,8px);opacity:var(--st-fade-quiet)}
      /* The description sits UNDER the picture, which is the reading order a card implies. */
      /* The description area takes exactly what is left after the picture and its caption, and
         clips: the card's outer height is the contract, so the body is the part that gives. */
      /* The detail page: a drawer from the LEFT INSIDE the sheet, over the board rather than
         beside it \u2014 the board stays where the writer left it and closing this returns to it.
         It comes in from the left edge because that is where the board's own navigation lives:
         a page you opened from a card arrives from the side you came from. */

      /* A BOOK card is the gallery card with a shorter body: the square cover and the identity
         line are the same, but there is no three-line summary under them \u2014 a book has a chapter
         count, not prose. The gallery's full height would leave most of the card empty, so a
         book card is as tall as its cover plus its caption plus its one line of meta. The height
         is written as those parts rather than as a number, so it follows the width token: the
         cover is square, the caption is a row height, and the meta line is one text line plus
         its padding. */
      .st-mosaic-page-card[data-kind="book"]{height:var(--st-book-card-h)}

      /* ---- the card body, and the chips a card can carry ---- */
      /* The caption's half, fixed at 38% of the card: title on top, body under it, and the body
         takes what the title leaves. Its first line is the summary \u2014 the sentence a reader needs
         to know what this card is \u2014 so the body is what gives when the text runs long, never the
         picture half above it. */
      .st-mosaic-card-text{flex:0 0 38%;min-height:0;overflow:hidden;
        display:flex;flex-direction:column;min-width:0}
      .st-mosaic-card-body{flex:1 1 auto;min-height:0;overflow:hidden;
        display:flex;flex-direction:column;gap:var(--st-space-2,2px);
        padding:var(--st-inset-xs) var(--st-inset-md) var(--st-inset-sm);min-width:0}
      /* Every text line in the card is one line: a name, a role, a holder. The summary is the one
         block allowed several, and it is capped so it cannot push the card taller. */
      .st-mosaic-card-body h4,.st-mosaic-card-body p{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0}
      .st-mosaic-card-body .st-mosaic-card-summary{white-space:normal;display:-webkit-box;
        -webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
      .st-mosaic-chips{margin-top:var(--st-inset-xs)}
      .st-mosaic-empty{margin:0;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      /* The review flow on the relations page: a header row above the canvas holds the check and
         ask entries; the fetched proposal renders as one card per change below it. Each card
         keeps its edit fields, verdict buttons and evidence quote in one column; the bookmark
         badge counts what is still owed a verdict. */
`;

// src/client/mosaic/entity.css.js
var CSS_ENTITY = `
      /* ---- the detail popover over the canvas ---- */
      .st-mosaic-detail{position:absolute;right:var(--st-board-inset);top:var(--st-board-inset);
        width:var(--st-detail-w);max-height:calc(100% - var(--st-board-inset) * 2);overflow:auto;
        display:flex;flex-direction:column;gap:var(--st-board-gap);
        border:var(--st-hairline) solid var(--st-ink-edge);border-radius:var(--st-radius-lg,16px);corner-shape:round;
        background:var(--st-surface);padding:var(--st-board-inset);z-index:var(--st-mosaic-z-detail);
        box-shadow:var(--st-card-shadow-lift)}
      /* The head is a media row: picture on the left, the editable identity on the right. */
      .st-mosaic-detail-head{display:flex;align-items:flex-start;gap:var(--st-board-gap);min-width:0}
      .st-mosaic-detail-identity{display:flex;flex-direction:column;gap:var(--st-inset-sm);
        flex:1 1 auto;min-width:0}
      /* The portrait keeps the board card's own shape, so a picture and its card read as one
         system rather than as two different crops of the same subject. */
      .st-mosaic-detail-portrait{position:relative;flex:none;
        width:var(--st-detail-portrait);aspect-ratio:var(--st-card-aspect,5 / 7);
        border-radius:var(--st-radius-md,12px);corner-shape:round;overflow:hidden}
      .st-mosaic-detail-frame{width:100%;height:100%;overflow:hidden;
        border-radius:var(--st-radius-md,12px);corner-shape:round;
        display:grid;place-items:center;
        background:var(--st-surface-high);
        box-shadow:inset 0 0 0 var(--st-hairline) var(--st-ink-edge)}
      .st-mosaic-detail-frame img{width:100%;height:100%;object-fit:cover;display:block}
      .st-mosaic-detail-initial{user-select:none;font-weight:var(--st-font-weight-strong);
        font-size:var(--st-text-lg);line-height:1;
        color:var(--st-ink-faint)}
      /* The picture button sits on the portrait's corner at the portrait's own scale: the glyph
         identifies it, so it reads as part of the card rather than as a button glued to it. */
      .st-mosaic-detail-generate{position:absolute;right:var(--st-inset-xs);bottom:var(--st-inset-xs);
        width:var(--st-generate-size);height:var(--st-generate-size);
        display:grid;place-items:center;padding:0;border:none;cursor:pointer;
        border-radius:var(--st-radius-pill,999px);corner-shape:round;
        background:var(--st-accent);
        color:var(--st-on-accent,#fff);
        box-shadow:var(--dsw-shadow-lv2,0 4px 12px rgba(0,0,0,.02),0 2px 8px rgba(0,0,0,.04));
        transition:transform .12s var(--ds-ease-in-out,ease-in-out),opacity .12s}
      .st-mosaic-detail-generate:hover:not(:disabled){transform:scale(1.08)}
      .st-mosaic-detail-generate:disabled{cursor:progress;opacity:.75}
      .st-mosaic-detail-generate:focus-visible{outline:none;
        box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      /* Spinning while the model works: the one motion here, and the only signal that a click
         that takes seconds is still alive. */
      .st-mosaic-detail-generate[data-busy="true"] svg{animation:st-think-spin 1s linear infinite}
      .st-mosaic-detail-title{font-weight:var(--st-font-weight-strong);flex:1;min-width:0;
        font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        color:var(--st-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .st-mosaic-detail-close{flex:none;padding:0 var(--st-inset-xs)}
      /* A section is a label over its content, never a two-column form: the label is a caption,
         and the field under it is the width of the panel. */
      .st-mosaic-detail-section{display:flex;flex-direction:column;gap:var(--st-inset-xs);min-width:0}
      .st-mosaic-detail-label{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary);margin:0;
        display:flex;align-items:center;gap:var(--st-inset-sm)}
      /* The editable fields in the panel: one rule, so the name, the role and the summary are the
         same control. Three different looks made it impossible to tell what could be typed in. */
      .st-mosaic-field{width:100%;box-sizing:border-box;font-family:inherit;
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        padding:var(--st-inset-xs) var(--st-inset-sm);
        border:1px solid var(--dsw-alias-border-l2,var(--st-fallback-border-l2));border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface);color:var(--st-text-primary);
        outline:none;resize:none}
      .st-mosaic-field:focus{border-color:var(--st-accent)}
      /* The name is the panel's title, so it is set at title size and weight \u2014 but it is still an
         input, and it looks like one on focus so the writer can tell it can be changed. */
      .st-mosaic-field-title{font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        font-weight:var(--st-font-weight-strong);padding:var(--st-inset-xs) var(--st-inset-sm)}
      /* The textareas grow with their content up to a ceiling: a fixed rows count showed three
         lines of a summary that might be one or fifteen. */
      .st-mosaic-field-area{min-height:calc(var(--st-row-height-compact,26px) * 2);max-height:var(--st-detail-area-max);
        scrollbar-width:thin;resize:none}
      /* Chips and the field that adds one, as one wrapped row: the plus belongs at the end of the
         list it extends, not on a line of its own below it. */
      .st-mosaic-chip-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--st-inset-xs)}
      .st-mosaic-chip-row .st-mosaic-chip{margin:0}
      /* A generation that failed says so where the button was pressed. */
      .st-mosaic-detail-error{margin:0;padding:var(--st-inset-sm);
        border-radius:var(--st-radius-sm,8px);
        background:color-mix(in srgb, var(--dsw-alias-state-error-primary,var(--st-fallback-error)) 10%, transparent);
        color:var(--dsw-alias-state-error-primary,var(--st-fallback-error));
        font-size:var(--st-text-sm);line-height:1.55;
        overflow-wrap:anywhere}
      .st-mosaic-detail-row{display:flex;gap:var(--st-inset-sm);align-items:baseline;flex-wrap:wrap;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary)}
      .st-mosaic-detail-field-label{flex:none;width:var(--st-fact-label-w-compact);font-size:var(--st-text-sm);
        line-height:var(--st-text-sm-leading);color:var(--st-text-tertiary)}
      .st-mosaic-detail-field-value{flex:1 1 auto;min-width:0;font-size:var(--st-text-sm);
        line-height:var(--st-text-sm-leading);color:var(--st-text-primary);
        white-space:pre-wrap;word-break:break-word}
      .st-mosaic-detail-note{margin:0;font-size:var(--st-text-sm);line-height:var(--st-line-height-ui);
        color:var(--st-text-secondary);white-space:pre-wrap;word-break:break-word}
      .st-mosaic-detail-holder{font-weight:var(--st-font-weight-medium);color:var(--st-text-primary)}
      .st-mosaic-detail-kind{flex:none}
      .st-mosaic-badge{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        padding:0 var(--st-inset-sm);border-radius:var(--st-radius-pill,999px);corner-shape:round;border:var(--st-hairline) solid var(--dsw-alias-border-l4,var(--st-fallback-border-l4));
        color:var(--st-text-tertiary)}
      .st-mosaic-chip{display:inline-block;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        padding:0 var(--st-inset-sm);border-radius:var(--st-radius-pill,999px);corner-shape:round;margin:0 var(--st-inset-xs) var(--st-inset-xs) 0;
        background:var(--st-hover-fill);color:var(--st-text-tertiary)}
      /* The static pages: one plain card per entity on the world, cast and item pages. */
      .st-mosaic-page-card h4{margin:0 0 var(--st-inset-xs);
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        color:var(--st-text-primary)}
      .st-mosaic-page-card p{margin:0;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary)}
      .st-mosaic-page-holder{font-weight:var(--st-font-weight-medium);color:var(--st-text-primary);margin:0 0 var(--st-inset-xs)}

      /* ---- the entity page: a left-side page, rounded on its open edge ---- */
      /* It stays a left-side panel, flush against the board's left edge: the board is the map you
         came from, and a page that floats away from the edge reads as a separate window. Only the
         right edge is rounded, the way a drawer is rounded on its inner side. */
      .st-mosaic-page{position:absolute;inset:0 auto 0 0;width:min(var(--st-w-compact),86%);z-index:var(--st-mosaic-z-page);
        display:flex;flex-direction:column;min-height:0;
        background:var(--st-surface);
        border-right:var(--st-hairline) solid var(--st-ink-edge);
        border-radius:0 var(--st-radius-lg,16px) var(--st-radius-lg,16px) 0;corner-shape:round;
        box-shadow:var(--st-panel-shadow-right);
        overflow:hidden;
        animation:st-mosaic-page-in .18s var(--ds-ease-out,ease-out) both}
      /* Slide in from off the left edge and settle: the movement says the page is a layer over the
         board, not a replacement for it. With reduced motion the fade alone carries that. */
      @keyframes st-mosaic-page-in{
        from{transform:translateX(-100%);opacity:.4}
        60%{opacity:1}
        to{transform:translateX(0);opacity:1}}
      .st-mosaic-page[data-closing="true"]{animation:st-mosaic-page-out .16s var(--ds-ease-in,ease-in) both}
      @keyframes st-mosaic-page-out{
        from{transform:translateX(0);opacity:1}
        to{transform:translateX(-100%);opacity:0}}
      @media (prefers-reduced-motion: reduce){
        .st-mosaic-page{animation:st-mosaic-page-fade .12s linear both}
        .st-mosaic-page[data-closing="true"]{animation:st-mosaic-page-fade-out .12s linear both}
        @keyframes st-mosaic-page-fade{from{opacity:0}to{opacity:1}}
        @keyframes st-mosaic-page-fade-out{from{opacity:1}to{opacity:0}}
      }
      /* The head takes the same inset as the body, so the title and the first row start on one
         vertical line instead of the title sitting a few pixels further out. */
      .st-mosaic-page-head{display:flex;align-items:center;gap:var(--st-inset-sm);
        padding:var(--st-board-inset-compact) var(--st-board-inset);flex:none;
        border-bottom:var(--st-hairline) solid var(--st-ink-hair)}
      .st-mosaic-page-title{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        font-size:var(--st-text-lg);line-height:var(--st-text-lg-leading);
        font-weight:var(--st-font-weight-strong);color:var(--st-text-primary)}
      .st-mosaic-page-head .st-mosaic-field{flex:1 1 auto;min-width:0;width:auto}
      .st-mosaic-page-scroll{flex:1 1 auto;min-height:0;overflow:auto;padding:var(--st-board-inset);
        display:flex;flex-direction:column;gap:var(--st-board-gap)}
      /* The summary band: picture left, identifying facts right. Both columns start at the top, so
         a short picture does not leave its facts floating in the middle. */
      .st-mosaic-page-summary{display:flex;gap:var(--st-board-inset);align-items:flex-start}
      .st-mosaic-page-image{flex:none;width:var(--st-page-portrait);min-width:0}
      .st-mosaic-page-image .st-mosaic-detail-portrait{
        width:100%;height:auto}
      .st-mosaic-page-image .st-mosaic-detail-frame{height:100%}
      .st-mosaic-page-image .st-mosaic-detail-initial{font-size:var(--st-text-xl)}
      .st-mosaic-page-facts{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:var(--st-inset-sm)}
      /* The brief facts beside the portrait are label-and-value on ONE line: a column of stacked
         labels would be as tall as the picture and read as a form. Only the prose fields below
         get the stacked label-over-value treatment. */
      .st-mosaic-page-facts .st-mosaic-page-row{display:flex;flex-direction:row;align-items:baseline;
        gap:var(--st-inset-sm);min-width:0}
      .st-mosaic-page-facts .st-mosaic-page-label{flex:none;width:auto;min-width:var(--st-fact-label-w-compact);
        white-space:nowrap}
      .st-mosaic-page-facts .st-mosaic-page-value{flex:1 1 auto;min-width:0}
      .st-mosaic-page-facts .st-mosaic-field{flex:1 1 auto;width:auto;min-width:0}
      /* Every field is a label over its value, and the value WRAPS: this is the place the writer
         reads the full text, so it must not be clipped the way a card is. */
      .st-mosaic-page-row{display:flex;flex-direction:column;gap:var(--st-inset-xs);min-width:0}
      .st-mosaic-page-label{flex:none;font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-page-value{flex:1 1 auto;min-width:0;word-break:break-word;white-space:pre-wrap;
        font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-primary)}
      /* An empty field keeps its line height: without this the label would sit alone on a zero-
         height row, which reads as a broken table rather than as a fact waiting to be filled. */
      .st-mosaic-page-value:empty{display:block;min-height:var(--st-text-md-leading)}
      /* The long-form half: one section per field, separated by a hairline, so the page has a
         reading rhythm instead of an undifferentiated stack of rows. The summary band above keeps
         its rows tight because they are identity, not prose. */
      .st-mosaic-page-body{display:flex;flex-direction:column;gap:0;min-width:0;
        border-top:var(--st-hairline) solid var(--st-ink-hair)}
      .st-mosaic-page-body>.st-mosaic-page-row{padding:var(--st-board-inset-compact) 0;
        border-bottom:var(--st-hairline) solid var(--st-ink-hair)}
      .st-mosaic-page-body>.st-mosaic-page-row:last-child{border-bottom:none;padding-bottom:0}
      .st-mosaic-page-edges{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:var(--st-inset-xs)}
      /* One edge is a run of TEXT, not a row of boxes: name, kind and note flow inline and wrap
         naturally, so a long note continues at the same rhythm instead of breaking into pieces. */
      .st-mosaic-page-edge{font-size:var(--st-text-md);line-height:var(--st-line-height-ui);min-width:0}
      .st-mosaic-page-edge-other{font-weight:var(--st-font-weight-medium);color:var(--st-text-primary);
        margin-right:var(--st-inset-sm)}
      .st-mosaic-page-edge-kind{color:var(--st-text-secondary);
        margin-right:var(--st-inset-sm)}
      .st-mosaic-page-edge-note{color:var(--st-text-tertiary)}
`;

// src/client/mosaic/review.css.js
var CSS_REVIEW = `
      /* ---- the review page: what the model proposes, and how a proposal is decided ---- */
      .st-mosaic-head{display:flex;flex-direction:column;gap:var(--st-space-8,8px);margin:0 0 var(--st-space-12,12px)}
      /* The two AI entries read as CHIPS, not as bare text buttons: a hairline edge groups them
         as actions on the page, the way suggestion chips sit under an input in design tools. */
      .st-mosaic-check-row .st-btn{box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l4,var(--st-fallback-border-l4))}
      .st-mosaic-check-row{display:flex;gap:var(--st-space-8,8px);align-items:center;min-width:0}
      /* The result of a \u68B3\u7406/\u68C0\u67E5 that produced no review cards: a quiet panel rather than a
         status-bar flash the writer can miss after a long wait. */
      .st-mosaic-notice{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary);
        padding:var(--st-space-12,12px) var(--st-space-12,12px);
        border:var(--st-hairline,.5px) solid var(--st-ink-edge);
        border-radius:var(--st-radius-sm,8px);background:var(--st-surface)}
      .st-mosaic-proposal-wrap{margin:0 0 var(--st-space-12,12px)}
      .st-mosaic-proposal-title{margin:0 0 var(--st-space-8,8px);font-weight:var(--st-font-weight-strong);
        font-size:var(--st-text-md);line-height:var(--st-text-md-leading);
        color:var(--st-text-primary)}
      .st-mosaic-proposal-evidence{margin:0 0 var(--st-space-8,8px);padding:var(--st-space-8,8px) var(--st-space-8,8px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary);
        background:var(--st-hover-fill);border-radius:var(--st-radius-sm,8px)}
      .st-mosaic-proposal-op{font-weight:var(--st-font-weight-strong);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-primary)}
      .st-mosaic-proposal-detail{margin:var(--st-space-2,2px) 0 var(--st-space-4,4px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary);word-break:break-word}
      /* The proposals page and the snapshot page are the same shared list at different contents. */
      .st-mosaic-proposals-empty{padding:var(--st-space-16,16px) 0;text-align:center;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-proposal-head{display:flex;align-items:baseline;gap:var(--st-space-8,8px);
        margin:0 0 var(--st-space-2,2px);min-width:0}
      .st-mosaic-proposal-meta{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary);word-break:break-word}
      .st-mosaic-proposal-count{flex:1 1 auto;min-width:0;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-proposal-status{flex:0 0 auto;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-proposal-status[data-status="accepted"]{color:var(--st-accent)}
      .st-mosaic-proposal-changes{margin:0 0 var(--st-space-8,8px);padding-left:var(--st-space-16,16px);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-secondary);word-break:break-word}
      .st-mosaic-proposal[data-status="rejected"]{opacity:var(--st-fade-dim)}
      .st-mosaic-fields{display:flex;gap:var(--st-space-8,8px);margin:var(--st-space-4,4px) 0}
      .st-mosaic-name{flex:1;min-width:0;box-sizing:border-box;
        border:1px solid var(--dsw-alias-border-l4,var(--st-fallback-border-l4));border-radius:var(--st-radius-sm,8px);
        background:var(--st-surface-high);padding:var(--st-space-2,2px) var(--st-space-8,8px);font-family:inherit;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-primary)}
      .st-mosaic-quote{margin:var(--st-space-4,4px) 0 0;
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      .st-mosaic-proposal-actions{display:flex;gap:var(--st-space-8,8px);margin-top:var(--st-space-8,8px)}
      .st-mosaic-apply-row{display:flex;gap:var(--st-space-8,8px);align-items:center;margin:var(--st-space-4,4px) 0 var(--st-space-12,12px)}
      .st-mosaic-chip-toggle{cursor:pointer}
      .st-mosaic-status-add{flex:1;min-width:var(--st-review-chip-min-w,60px);padding:var(--st-space-2,2px) var(--st-space-8,8px);border:1px solid var(--dsw-alias-border-l2,var(--st-fallback-border-l2));border-radius:var(--st-radius-pill,999px);corner-shape:round;background:var(--st-surface);color:var(--st-text-primary);font-size:var(--st-text-md)}
      .st-mosaic-tab-badge{display:inline-block;margin-left:var(--st-space-4,4px);padding:0 var(--st-space-4,4px);border-radius:var(--st-radius-pill,999px);corner-shape:round;
        background:var(--st-accent);color:var(--st-on-accent,#fff);
        font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading)}
      /* Snapshots: the same list as the chapter column and the proposal page, with a restore
         button at the trailing end of each row. */
      .st-mosaic-version-row{flex-direction:row;align-items:center;gap:var(--st-space-12,12px)}
      .st-mosaic-version-text{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:var(--st-space-2,2px)}
`;

// src/client/mosaic/overview.css.js
var CSS_OVERVIEW = `
      .st-overview{display:flex;flex-direction:column;gap:var(--st-board-gap);flex:1 1 auto;min-height:0}
      .st-overview-actions{display:flex;align-items:center;gap:var(--st-inset-md);min-width:0}
      .st-overview-field{display:flex;flex-direction:column;gap:var(--st-inset-sm);min-height:0}
      .st-overview-label{font-size:var(--st-text-sm);line-height:var(--st-text-sm-leading);
        color:var(--st-text-tertiary)}
      /* The one editable field on the page: a quiet fill, like every other field in the panel.
         Fixed height: the writer edits a line of summary, and a resizable box changed the
         reading pane's layout under the text every time the handle moved. */
      .st-overview-summary{width:100%;box-sizing:border-box;height:var(--st-overview-summary-h,96px);
        overflow:auto;resize:none;padding:var(--st-space-8,8px) var(--st-space-8,8px);border:none;
        border-radius:var(--st-radius-sm,8px);background:var(--st-surface-high);
        color:var(--st-text-primary);
        font-family:inherit;font-size:var(--st-text-md);line-height:var(--st-line-height-ui);outline:none}
      .st-overview-summary:focus{box-shadow:0 0 0 var(--dsw-focus-ring-width,2px) var(--st-focus-ink)}
      .st-overview-text{margin:0;font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-primary);white-space:pre-wrap;word-break:break-word}
      .st-overview-body{font-size:var(--st-text-md);line-height:var(--st-line-height-ui);
        color:var(--st-text-secondary);
        white-space:pre-wrap;word-break:break-word}
      /* The whole-book summary belongs to the page, not to a chapter: it sits under the split,
         above the audits, behind a hairline. */

      /* \u6D41\u6D3E uses the shared split: the list is navigation, the pane is the prompt. */
      .st-writing-style-actions{display:flex;align-items:center;gap:var(--st-space-8,8px);flex-wrap:wrap;align-self:flex-start}
      .st-writing-style-generate{align-self:flex-start;flex:none}
      .st-writing-style-prompt{margin:0;font-size:var(--st-text-sm);line-height:var(--st-line-height-ui);
        color:var(--st-text-secondary);
        white-space:pre-wrap;word-break:break-word}
      .st-overview-global{flex:none;padding-top:var(--st-board-gap);
        border-top:var(--st-hairline,.5px) solid var(--st-ink-hair)}
`;

// src/client/styles.js
var CSS = `${CSS_SHARED}
${CSS_CORE}
${CSS_LIBRARY}
${CSS_WELCOME}
${CSS_NEWBOOK}
${CSS_MCP}
${CSS_GLYPH}
${CSS_NOTES}
${CSS_COMPOSER}
${CSS_SCAN}
${CSS_STATUS}
${CSS_MODELS}
${CSS_SETTINGS}
${CSS_OUTLINE}
${CSS_RAIL}
${CSS_BOARD}
${CSS_CARDS}
${CSS_ENTITY}
${CSS_REVIEW}
${CSS_OVERVIEW}`;

// src/client/panel/core.js
var StoryPanelBoundary = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    try {
      writeStored(STORAGE_KEYS.lastError, JSON.stringify({
        at: (/* @__PURE__ */ new Date()).toISOString(),
        message: String(error?.message ?? error),
        stack: String(error?.stack ?? "").split("\n").slice(0, 14).join("\n"),
        component: String(info?.componentStack ?? "").split("\n").slice(0, 14).join("\n")
      }));
    } catch {
    }
  }
  render() {
    if (this.state.error === null) return h(StoryPanelBody, this.props);
    const error = this.state.error;
    return h(
      "div",
      { className: "st-shell" },
      h(
        "div",
        { className: "st-warn" },
        h("div", null, "\u5199\u6545\u4E8B\u9762\u677F\u6E32\u67D3\u65F6\u51FA\u9519\uFF1A"),
        h(
          "pre",
          { style: { whiteSpace: "pre-wrap", margin: "6px 0 0" } },
          String(error?.message ?? error)
        ),
        h(
          "pre",
          { style: { whiteSpace: "pre-wrap", margin: "6px 0 0", opacity: 0.7 } },
          String(error?.stack ?? "").split("\n").slice(0, 6).join("\n")
        )
      )
    );
  }
};
function StoryPanelBody(props) {
  const { t, api: api2, layout, uiWorkspace, workspaces, useWorkspaces, useSessions } = props;
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  const workspaceSnapshot = typeof useWorkspaces === "function" ? useWorkspaces((snapshot) => snapshot) : void 0;
  const items = workspaceSnapshot?.items ?? [];
  const shellRef = React.useRef(null);
  const [drawer, setDrawer] = React.useState(null);
  const [mosaicOpen, setMosaicOpen] = usePersisted(
    STORAGE_KEYS.mosaicOpen,
    (raw) => raw === "true",
    (value) => value === true ? "true" : "false"
  );
  const [mosaicTab, setMosaicTab] = usePersisted(
    STORAGE_KEYS.mosaicTab,
    (raw) => typeof raw === "string" && raw !== "" ? raw : "relations",
    (value) => String(value)
  );
  const drawerMotion = useClosingAnimation(drawer);
  const mosaicMotion = useClosingAnimation(mosaicOpen === true ? mosaicOpen : null);
  React.useEffect(() => {
    if (mosaicOpen) {
      setRailHidden(true);
      setDrawer(null);
    }
  }, [mosaicOpen]);
  const {
    keys,
    chordOverrides,
    updateChordOverrides,
    platform: keyPlatform,
    typography,
    updateTypography,
    autoSaveMs,
    updateAutoSave,
    autoSaveLocked,
    queueRef
  } = usePreferences({ platform: props.platform, saveInterval: props.config?.saveInterval });
  const { library, chooseLibrary } = useLibrary(api2);
  const pickDirectory = typeof props.pickDirectory === "function" ? props.pickDirectory : uiWorkspace !== void 0 && uiWorkspace !== null && typeof uiWorkspace.pickDirectory === "function" ? () => uiWorkspace.pickDirectory() : void 0;
  const mcpInfo = typeof props.mcpInfo === "function" ? props.mcpInfo : void 0;
  const openHarness = typeof props.openHarness === "function" ? props.openHarness : void 0;
  const [railHidden, setRailHidden] = React.useState(true);
  const railMotion = useClosingAnimation(railHidden ? null : "rail");
  const [bookFolder, setBookFolder] = React.useState(void 0);
  const [startOpen, setStartOpen] = React.useState(false);
  const [startSeen, setStartSeen] = React.useState(() => readStored(STORAGE_KEYS.welcomeSeen) === "1" || readStored(STORAGE_KEYS.lastBook) !== null || !storageAvailable());
  const [bookPath, setBookPath] = React.useState(void 0);
  const [shelfNotice, setShelfNotice] = React.useState("");
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [mcpOpen, setMcpOpen] = React.useState(false);
  const [mcpState, setMcpState] = React.useState({ loading: false, error: "", info: null });
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [drawerNotice, setDrawerNotice] = React.useState({ text: "", tone: "info" });
  const noticeRow = (text, tone = "info") => setDrawerNotice({ text: String(text ?? ""), tone });
  const [collapsed, setCollapsed] = React.useState(/* @__PURE__ */ new Set());
  const [chapterId, setChapterId] = React.useState("");
  const [selected, setSelected] = React.useState("");
  const bookData = useBookData({
    api: api2,
    library,
    bookFolder,
    t,
    autoSaveMs,
    // A fetched proposal belongs to the book it was checked against: its changes carry entity
    // ids resolved against THAT board. Only the PROPOSAL goes; the board itself is fine.
    //
    // The board used to CLOSE here too, which is what made it shut itself when the writer
    // switched windows. Whether the board is open is the writer's state, not a fact about a
    // book, and it is remembered across exactly that.
    onLoaded: (loaded) => {
      setChapterId(loaded.chapters[0]?.id ?? "");
      setMosaicProposal(null);
    }
  });
  const {
    state,
    book,
    books,
    setBooks,
    refreshShelf,
    queue,
    saveStatus,
    flushSave,
    adoptWritten,
    saveNow,
    updateBook
  } = bookData;
  queueRef.current = queue;
  const openDirectory = async () => {
    if (typeof pickDirectory !== "function") return;
    let path;
    try {
      path = await pickDirectory();
    } catch (failure) {
      setShelfNotice(String(failure?.message ?? failure));
      return;
    }
    if (path === null || path === void 0 || path === "") return;
    try {
      flushSave();
      const data = await api2.openDirectory(path);
      await chooseLibrary(data.library);
      setBooks(Array.isArray(data.books) ? data.books : []);
      setStartOpen(false);
      if (data.kind === "book") {
        setBookPath(void 0);
        setBookFolder(data.bookFolder);
      } else {
        setBookFolder(void 0);
      }
    } catch (failure) {
      setShelfNotice(String(failure?.message ?? failure));
    }
  };
  const { chatError, openConversation } = useBookConversation({
    layout,
    uiWorkspace,
    workspaces,
    items,
    useSessions,
    book,
    bookFolder,
    bookPath,
    t
  });
  const lastBookKey = STORAGE_KEYS.lastBook;
  const [restored, setRestored] = React.useState(false);
  React.useEffect(() => {
    if (restored || bookFolder !== void 0 || !library || books.length === 0) return;
    setRestored(true);
    let stored = "";
    stored = readStored(lastBookKey) ?? "";
    if (stored === "") return;
    const entry = books.find((row) => row.id === stored) ?? books.find((row) => row.folder === stored);
    if (entry === void 0) return;
    setBookFolder(entry.folder);
    setBookPath(entry.absolutePath);
  }, [restored, bookFolder, library, books, lastBookKey]);
  React.useEffect(() => {
    if (bookFolder === void 0) return;
    const entry = books.find((row) => row.folder === bookFolder);
    if (entry === void 0) return;
    const id = typeof entry.id === "string" && entry.id !== "" ? entry.id : entry.folder;
    if (typeof id !== "string" || id === "") return;
    if (readStored(lastBookKey) !== id) writeStored(lastBookKey, id);
  }, [bookFolder, books, lastBookKey]);
  const remembered = bookFolder !== void 0 ? void 0 : (() => {
    let stored = "";
    stored = readStored(lastBookKey) ?? "";
    if (stored === "") return void 0;
    return books.find((row) => row.id === stored) ?? books.find((row) => row.folder === stored);
  })();
  const chapter = book?.chapters.find((c) => c.id === chapterId) ?? book?.chapters[0];
  const {
    patchChapter,
    onSummary,
    addNode,
    renameNode,
    doomed,
    countUnder,
    confirmRemove,
    cancelRemove,
    removeTreeNode
  } = useTreeEdits({ t, book, updateBook, chapter, selected, setSelected, chapterId, setChapterId });
  const dockScope = `story:${book?.id ?? bookFolder ?? ""}`;
  const [mosaicProposal, setMosaicProposal] = useDockState(dockScope, "mosaicProposal", null);
  const [mosaicBusy] = useDockState(dockScope, "mosaicBusy", false);
  const [mosaicNote] = useDockState(dockScope, "mosaicNote", "");
  const {
    proposal,
    setProposal,
    aiError,
    aiBusy,
    aiNote,
    scan,
    chat,
    setChat,
    answers,
    answersError,
    dismissProposal,
    clearStuck,
    clearScan,
    runReview,
    runCritique,
    applyCast,
    insertFromLog,
    askSelection,
    askContinue,
    askChat
  } = useAiActions({ api: api2, bookFolder, chapter, book, adoptWritten, flushSave, dockScope, t });
  const {
    roleModels,
    refreshModels,
    catalog,
    chatEfforts,
    setChatModel: changeChatModel,
    setChatEffort: changeChatEffort
  } = useModels({ api: api2, bookFolder, dockScope });
  React.useEffect(() => {
    const stuck = aiBusy === true || chat !== null && chat !== void 0 && chat.busy === true;
    if (!stuck) return void 0;
    const timer = globalThis.setTimeout(() => {
      clearStuck();
    }, 12e4);
    return () => clearTimeout(timer);
  }, [aiBusy, chat]);
  const [answerLog, setAnswerLog] = React.useState(false);
  const closePanelsExcept = (keep) => {
    if (keep !== "drawer") setDrawer(null);
    if (keep !== "board") setMosaicOpen(false);
    if (keep !== "answers") setAnswerLog(false);
    if (keep !== "about") setAboutOpen(false);
    if (keep !== "mcp") setMcpOpen(false);
    if (keep !== "notes") setNotesOpen(false);
    if (keep !== "rail") setRailHidden(true);
  };
  const closeAllPanels = () => closePanelsExcept("");
  const openMcp = async () => {
    closePanelsExcept("mcp");
    setMcpOpen(true);
    setMcpState({ loading: true, error: "", info: null });
    try {
      const info = await mcpInfo();
      setMcpState({ loading: false, error: info?.ok === false ? String(info.error ?? "") : "", info: info?.ok === false ? null : info });
    } catch (failure) {
      setMcpState({ loading: false, error: String(failure?.message ?? failure), info: null });
    }
  };
  React.useEffect(() => {
    if (!mcpOpen || mcpInfo === void 0) return void 0;
    let cancelled = false;
    const read = async () => {
      try {
        const info = await mcpInfo();
        if (!cancelled) setMcpState((previous) => ({
          ...previous,
          loading: false,
          error: info?.ok === false ? String(info.error ?? "") : "",
          info: info?.ok === false ? null : info
        }));
      } catch (failure) {
        if (!cancelled) setMcpState((previous) => ({ ...previous, loading: false, error: String(failure?.message ?? failure) }));
      }
    };
    const timer = globalThis.setInterval(read, 3e3);
    read();
    return () => {
      cancelled = true;
      globalThis.clearInterval(timer);
    };
  }, [mcpOpen, mcpInfo]);
  const drawers = ["models", "typography"];
  const drawerButtons = h(
    React.Fragment,
    null,
    drawers.map((key) => h("button", {
      key,
      type: "button",
      className: "st-btn st-btn-ghost st-drawer-btn",
      "aria-haspopup": "dialog",
      "aria-expanded": drawer === key ? "true" : "false",
      // The open drawer is the button's selected state. Without it the button went back to its
      // resting fill and only the hover wash said anything, so moving the pointer over it after
      // opening the panel looked like a second, unrelated change.
      "aria-pressed": drawer === key ? "true" : "false",
      // A drawer covers the page, so a write still sitting in the debounce is flushed first:
      // the writer is about to work elsewhere and must not leave a sentence in memory.
      //
      // Opening a drawer also puts the board away, the same way opening the board puts a drawer
      // away. The two are overlays on the same surface and only one may own it; the board's
      // open state is REMEMBERED across sessions, so without this a writer who left the board
      // up came back to it sitting behind every drawer they opened — which read as "clicking
      // Settings opens the model page as well".
      onClick: () => {
        flushSave();
        if (drawer === key) {
          setDrawer(null);
          return;
        }
        closePanelsExcept("drawer");
        setDrawer(key);
      }
    }, key === "models" ? h(ModelIcon) : h(SlidersIcon), t(`tab.${key}`)))
  );
  const addUnderSelection = () => {
    const node = selected === "" ? void 0 : findNode(book.nodes, selected);
    if (node === void 0) {
      addNode("volume");
      return;
    }
    if (node.level === "volume") {
      addNode("chapter");
      return;
    }
    addNode("section");
  };
  const markStartSeen = () => {
    writeStored(STORAGE_KEYS.welcomeSeen, "1");
    setStartSeen(true);
  };
  const leftPane = () => h(
    "div",
    { className: "st-rail-body" },
    // The tree's own box: it scrolls, and the function row below it does not. One scrolling box
    // for both meant a long book pushed the row off the bottom of the panel.
    h(
      "div",
      { className: "st-scroll" },
      h(
        "div",
        { className: "st-row st-gap-under-row" },
        h("button", { type: "button", className: "st-btn st-btn-primary", onClick: addUnderSelection }, t("action.addUnder"))
      ),
      h(TreeNav, {
        // The outline highlights what the WRITER selected, not merely the chapter being edited:
        // a volume or chapter must show as current too, because the next node is created under
        // the selection.
        t,
        book,
        activeId: selected === "" ? chapter?.id : selected,
        onSelect: (id) => {
          flushSave();
          setSelected(id);
          setChapterId(id);
        },
        collapsed,
        onToggle: (id) => setCollapsed((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
        onRename: renameNode,
        onRemove: removeTreeNode
      })
    ),
    // The four book-level actions, pinned to the card's bottom edge. See rail-tools.js.
    h(RailTools, {
      t,
      book,
      // While the shelf is showing there is nowhere to go: the row keeps its shape and the button
      // reports that it cannot be used instead of doing nothing quietly.
      onStart: () => {
        flushSave();
        closePanelsExcept("");
        setStartOpen(true);
      },
      onShelf: () => {
        setBookFolder(void 0);
      },
      onSave: saveNow,
      onExport: async () => {
        const data = await api2.manuscript(bookFolder);
        return typeof data?.markdown === "string" ? data.markdown : "";
      },
      onNotice: noticeRow,
      onAbout: () => {
        closePanelsExcept("about");
        setAboutOpen(true);
      },
      onOpen: pickDirectory === void 0 ? void 0 : openDirectory,
      saving: saveStatus?.status === "saving"
    })
  );
  const drawerBody = (key) => {
    if (key === "typography") return h(SettingsPage, {
      t,
      typography,
      onChange: updateTypography,
      autoSaveMs,
      onAutoSave: updateAutoSave,
      // A profile-set interval is not the writer's to change, so the row reports it instead
      // of offering buttons that would do nothing.
      autoSaveLocked,
      // The resolved chords, so the row shows the key that actually fires — including one the
      // writer rebound, and including a platform default they never touched.
      keys,
      // Which platform's defaults a single row falls back to, resolved once here so the settings
      // page and the editor cannot disagree about what "the default" is.
      platform: keyPlatform,
      onRebind: (gesture, chord) => updateChordOverrides({ ...chordOverrides, [gesture]: chord }),
      // Reset clears the stored overrides rather than writing the current defaults down: a
      // stored copy of a default would freeze it, and a later version improving the default
      // would never reach this writer.
      onResetChords: () => updateChordOverrides({}),
      library,
      onLibrary: chooseLibrary,
      onPickDirectory: pickDirectory
    });
    return h(ModelsPage, { t, api: api2, onChange: refreshModels, onNotice: noticeRow });
  };
  const middle = () => {
    if (library === void 0) return h("div", { className: "st-scroll st-muted" }, t("label.loading"));
    if (state.status === "loading") return h("div", { className: "st-scroll st-muted" }, t("label.loading"));
    if (state.status === "error") return h("div", { className: "st-warn" }, state.error);
    if (!book) return h("div", { className: "st-scroll st-muted" }, t("label.loading"));
    if (!chapter) {
      return h(
        "div",
        { className: "st-mid-body" },
        h("div", { className: "st-scroll st-muted" }, t("label.emptyChapters"))
      );
    }
    return h(
      "div",
      { className: "st-mid-body" },
      h(ChapterEditor, {
        t,
        chapter,
        // The panel resolves the chords once; the editor only reads them.
        keys,
        busy: aiBusy || mosaicBusy,
        // The writer's direction for THIS pass, shown in the thinking line while it runs.
        aiNote: mosaicBusy ? mosaicNote : aiNote,
        saveStatus,
        typography,
        // Cmd+S: the panel owns the queue, so the keystroke writes through it rather than
        // through a second path that could race the interval.
        onSaveNow: saveNow,
        // The side chat lives in the panel (it owns the route and the transcript) and renders
        // in the editor's dock, which is where the writer is.
        chat,
        // The role models the panel fetched for the status bar; the composer names the `chat`
        // one, because that is who will answer a question typed into it.
        chatModels: roleModels,
        // One catalogue for both pickers, and the levels the chat model offers.
        chatCatalog: catalog,
        chatEfforts,
        onChatModelChange: changeChatModel,
        onChatEffortChange: changeChatEffort,
        // The history card lives in the panel; the button that opens it sits with the other AI
        // controls in the editor's header, which is where the writer's hand already is.
        answerCount: answers.length,
        onAnswersToggle: () => {
          if (answerLog) {
            setAnswerLog(false);
            return;
          }
          closePanelsExcept("answers");
          setAnswerLog(true);
        },
        onAnswersOpen: () => answerLog,
        // The two whole-section actions, and their result. The editor owns the caret; the panel
        // owns the calls.
        scan,
        onReview: () => runReview(chapter.text ?? ""),
        // The editor owns the caret, so it hands the windows over the same way it does for a
        // question: the panel cannot read the textarea's selection from out here.
        onCritique: (caret, direction) => runCritique(caret, direction),
        onScanClose: clearScan,
        // The chord toggles. Pressing it while the composer is open is the obvious way to put
        // it away again, and it is what every other toggle in this panel does.
        // It also dismisses a scan, which is the one thing that outranks the composer: a
        // section scan owns the dock while it is up, so without this the keystroke would open
        // a box nobody could see. A proposal needs no dismissal — the composer outranks it,
        // and closing the composer brings the answer straight back.
        onChatOpen: () => {
          clearScan();
          setChat((prev) => ({ ...prev, open: prev.open !== true }));
        },
        onChatClose: () => setChat((prev) => ({ ...prev, open: false })),
        onChatSend: askChat,
        // A proposal for another chapter is not this chapter's business.
        suggestion: proposal !== null && proposal.chapterId === chapter.id ? proposal : null,
        onText: (text) => patchChapter((c) => ({ ...c, text, status: statusAfterText(text, c.status) })),
        // Losing focus is the one moment before a close that the browser always delivers:
        // a page frozen on `pagehide` never gets to finish its fetch.
        onFlush: flushSave,
        onAskSelection: askSelection,
        onContinue: askContinue,
        onAccept: () => {
          const p = proposal;
          dismissProposal();
          if (p !== null && p.kind === "cast") applyCast(p);
        },
        onReject: dismissProposal,
        onRetry: (direction) => {
          const p = proposal;
          setProposal(null);
          if (!p) return;
          if (p.kind === "continue") {
            const at = Number.isInteger(p.caret) ? p.caret : (chapter.text ?? "").length;
            askContinue(p.chapterTextAtAsk ?? chapter.text ?? "", at);
            return;
          }
          if (p.kind === "chat") {
            askChat(p.chatQuestion ?? p.question ?? "", p.baseText, p.caret);
            return;
          }
          askSelection(p.baseText, p.wholeText ?? "", { start: p.from, end: p.to }, p.context, direction);
        }
      })
    );
  };
  if (library === void 0) {
    return h("div", { className: "st-shell" }, h("div", { className: "st-scroll st-muted" }, t("label.loading")));
  }
  if (startOpen || bookFolder === void 0 && (!startSeen || books.length === 0)) {
    return h(
      "div",
      { className: "st-shell", ref: shellRef },
      h(WelcomePage, {
        t,
        api: api2,
        books,
        hasBook: bookFolder !== void 0,
        onSeen: markStartSeen,
        onCreated: (folder, list, absolutePath) => {
          markStartSeen();
          setStartOpen(false);
          setBooks(list);
          setBookFolder(folder);
          setBookPath(absolutePath);
        },
        onLibrary: () => {
          markStartSeen();
          setStartOpen(false);
          if (bookFolder !== void 0) setBookFolder(void 0);
        },
        onBack: () => setStartOpen(false),
        onOpenDirectory: pickDirectory === void 0 ? void 0 : openDirectory
      }),
      h(TooltipLayer, { rootRef: shellRef })
    );
  }
  if (bookFolder === void 0) {
    return h(
      "div",
      { className: "st-shell", ref: shellRef },
      h(BookLibrary, {
        t,
        api: api2,
        library,
        books,
        workspaces,
        workspaceSnapshot,
        onNotice: setShelfNotice,
        // Back to the book the shelf was opened from. The remembered folder is read here
        // instead of being kept in its own state: it is the same value the panel restores on
        // the next launch, and a second copy could drift from it.
        onBack: remembered === void 0 ? void 0 : () => {
          setBookFolder(remembered.folder);
          setBookPath(remembered.absolutePath);
        },
        backTitle: remembered?.title ?? "",
        // A rename moves the folder but not the book's id, so the remembered book needs no
        // repair here — it is the same book under a new name. Only the two live pointers move:
        // the open book has to follow the folder that exists now, and the shelf is re-read.
        onRenamed: (entry, data) => {
          if (bookFolder !== void 0 && bookFolder === entry.folder && data?.folder !== void 0) {
            setBookFolder(data.folder);
          }
          refreshShelf();
        },
        onDeleted: refreshShelf,
        onOpen: (folder, absolutePath) => {
          setBookFolder(folder);
          setBookPath(absolutePath);
        },
        onCreated: (folder, list, absolutePath) => {
          setBooks(list);
          setBookFolder(folder);
          setBookPath(absolutePath);
        },
        onOpenDirectory: pickDirectory === void 0 ? void 0 : openDirectory
      }),
      h(TooltipLayer, { rootRef: shellRef })
    );
  }
  return h(
    "div",
    { className: "st-shell", ref: shellRef },
    h(
      "div",
      {
        className: "st-titlebar",
        // Empty space in the title row puts the board away.
        //
        // The board owns the page while it is open, and the row above it is the one strip that
        // always stays visible — so it is where a writer's hand goes to dismiss something. A press
        // on a BUTTON in the row is obviously not that: the check walks up from the target and
        // ignores anything inside a control, so the drawer toggles, the book menu and the session
        // button keep their own behaviour.
        //
        // Mouse-down rather than click, matching every other dismiss-on-outside in this panel: the
        // press is what the writer means, and waiting for the release would also fire after a drag
        // that merely started on the bar.
        onMouseDown: (event) => {
          const target = event?.target;
          if (target !== null && target !== void 0 && typeof target.closest === "function" && target.closest('button, a, input, select, textarea, [role="menu"], [role="menuitem"]') !== null) return;
          closeAllPanels();
        }
      },
      h("button", {
        type: "button",
        className: "st-btn st-btn-ghost st-rail-toggle",
        title: railHidden ? t("action.showRail") : t("action.hideRail"),
        "aria-label": railHidden ? t("action.showRail") : t("action.hideRail"),
        "aria-expanded": railHidden ? "false" : "true",
        onClick: () => {
          if (railHidden) closePanelsExcept("rail");
          setRailHidden((wasHidden) => !wasHidden);
        }
      }, h(RailIcon, { collapsed: railHidden })),
      // The book's name, and nothing behind it. It was a menu of the other books with the library
      // as its last row; the caret beside it invited a click that opened a list over the page the
      // writer was reading. The title of a page is a heading — switching books is the shelf's job,
      // and the shelf is one press away in the outline's own menu.
      h("h1", { className: "st-title" }, book?.title || t("panel")),
      // The board button sits against the title, not with the preference drawers at the far end.
      // It acts on the book the title names — the same subject — while 模型 and 排版 are the
      // panel's own settings; putting all three together made a writer read the row as
      // "three things about this panel" instead of "this book, then the panel".
      h("button", {
        type: "button",
        className: "st-btn st-btn-ghost st-drawer-btn",
        "data-testid": "mosaic-open",
        "aria-haspopup": "dialog",
        "aria-expanded": mosaicOpen ? "true" : "false",
        // The same pressed state the find and ask buttons use: the row tells the writer which
        // of its controls owns the page below it.
        "aria-pressed": mosaicOpen ? "true" : "false",
        // Closing the outline is the effect above's job, not this handler's: one rule in one place.
        onClick: () => {
          if (mosaicOpen) {
            setMosaicOpen(false);
            return;
          }
          closePanelsExcept("board");
          setMosaicOpen(true);
        }
      }, h(BoardIcon), t("mosaic.open")),
      // 随笔 sits beside the board button because both act on the book, not on the panel's own
      // settings. It is a separate surface: notes are whole-book, the board is the cast graph.
      book === null || book === void 0 ? null : h("button", {
        type: "button",
        className: "st-btn st-btn-ghost st-drawer-btn",
        "data-testid": "notes-open",
        "aria-haspopup": "dialog",
        "aria-expanded": notesOpen ? "true" : "false",
        "aria-pressed": notesOpen ? "true" : "false",
        onClick: () => {
          if (notesOpen) {
            setNotesOpen(false);
            return;
          }
          closePanelsExcept("notes");
          setNotesOpen(true);
        }
      }, h(NotebookIcon), t("notes.title")),
      // No progress caption beside the title. "1 章 · 已定稿 1 段" read as a label the title needed,
      // when the title is the page's name and needs nothing after it. The same counts are already
      // in the status bar, at the bottom, where a read-out belongs.
      h("span", { className: "st-spacer" }),
      mcpInfo === void 0 ? null : h("button", {
        type: "button",
        className: "st-btn st-btn-ghost st-drawer-btn",
        "data-testid": "mcp-open",
        "aria-haspopup": "dialog",
        "aria-expanded": mcpOpen ? "true" : "false",
        onClick: openMcp
      }, h(McpIcon), t("mcp.title")),
      drawerButtons,
      // The full conversation, not an in-panel imitation: a real Session has the tools,
      // streaming and history this panel cannot reproduce. A standalone host without the
      // layout/workspace services simply has no such button.
      layout !== void 0 && uiWorkspace !== void 0 ? h("button", {
        type: "button",
        className: "st-session-btn",
        onClick: openConversation
      }, h("span", { className: "st-session-label" }, t("action.openChat"))) : null
    ),
    h(
      "div",
      { className: "st-root" },
      // No side chat: the book's conversation is a real dsh Session behind 去完整对话, so a
      // second, cut-down chat beside the manuscript was a worse copy of the same idea.
      // The outline is an OVERLAY on the page rather than a column beside it: it slides in
      // from the left edge, over the text, and closing it gives the manuscript its width back.
      h(
        "div",
        { className: "st-col st-mid" },
        middle(),
        // The click-away layer stays over the PAGE and nothing else. Inside the rail's own layer it
        // would span the status bar and the composer too, so a click in the question box would
        // dismiss the outline instead of typing — and the box is exactly where the writer's hand
        // goes next.
        railMotion.mounted ? h("div", { className: "st-rail-scrim", onClick: () => setRailHidden(true), role: "presentation" }) : null
      )
    ),
    // The status bar is the bottom edge of the PANEL, not of the writing column: it spans the
    // whole width, under the outline and the page alike, so it stays put when the outline
    // opens and covers the same ground whatever the writer is doing.
    h(StatusBar, {
      t,
      book: state.book,
      chapter: state.book?.chapters.find((c) => c.id === chapterId) ?? state.book?.chapters[0],
      saveStatus,
      model: roleModels,
      // A drawer or the board owns the page while it is open. The model card is an aside that
      // belongs to the bar, so it must not stay open behind a panel: the writer closed it by
      // opening something else, and a card left floating there reappears the moment the panel
      // closes — which reads as "Settings opened the model page as well".
      covered: drawer !== null || mosaicOpen || answerLog || aboutOpen || notesOpen,
      // One message at a time, most-blocking first. A load failure outranks a failed save,
      // which outranks an AI error, which outranks the note that the last answer was cut short.
      // A message that merely informs — a truncated list, a recovered draft — is amber rather
      // than red, so "this went wrong" and "read this with care" do not look alike.
      notice: (() => {
        const first = [
          { text: shelfNotice, tone: "error" },
          { text: drawerNotice.text, tone: drawerNotice.tone },
          { text: state.error, tone: "error" },
          { text: state.saveError, tone: "error" },
          { text: aiError, tone: "error" },
          { text: chatError, tone: "error" },
          { text: scan?.error ?? "", tone: "error" },
          { text: scan?.truncated === true ? t("scan.truncated") : "", tone: "warn" },
          { text: state.recovered ? t("label.recovered") : "", tone: "warn" }
        ].find((row) => String(row.text ?? "") !== "");
        return first ?? { text: "", tone: "info" };
      })()
    }),
    // The outline is a SHELL child, after the status bar: positioned against the shell, its card
    // runs from under the title row to the very bottom edge of the panel. Measured against the
    // writing column it stopped at the bar's top edge, which left a strip of page under a card
    // that is meant to be flush with the frame. z-index keeps it under the overlays below.
    h(
      "div",
      {
        className: `st-rail-layer${railMotion.closing ? " st-closing" : ""}`
      },
      // The rail node always exists and carries its own collapsed class: the exit animation needs
      // the node for its duration, and the state is readable from the class whether or not a
      // browser is animating it.
      h(
        "div",
        { className: `st-rail${railHidden ? " st-rail-collapsed" : ""}` },
        railMotion.mounted ? leftPane() : null
      )
    ),
    // 关于, mounted at the PANEL's level. See the note where `aboutOpen` is declared.
    aboutOpen ? h(AboutBox, { t, onClose: () => setAboutOpen(false) }) : null,
    mcpOpen ? h(McpPanel, {
      t,
      loading: mcpState.loading,
      error: mcpState.error,
      info: mcpState.info,
      onClose: () => setMcpOpen(false),
      onLaunch: openHarness
    }) : null,
    // The things that open over the manuscript, in the order they stack. See overlays.js
    // for each one's own reasoning; the decisions stay here.
    notesOpen ? h(NotesPanel, {
      t,
      book,
      updateBook,
      onClose: () => setNotesOpen(false)
    }) : null,
    h(AnswerLogOverlay, {
      open: answerLog,
      t,
      answers,
      loadError: answersError,
      // An old answer is inserted the same way the newest one is: the editor owns the range
      // and the undo history, so it does the work.
      onInsert: (entry) => {
        insertFromLog(entry);
        setAnswerLog(false);
      },
      onClose: () => setAnswerLog(false)
    }),
    // Deleting from the outline asks first.
    h(RemoveNodeOverlay, {
      t,
      doomed,
      countUnder,
      onConfirm: confirmRemove,
      onCancel: cancelRemove
    }),
    h(SheetOverlay, {
      t,
      motion: drawerMotion,
      onClose: () => setDrawer(null),
      body: drawerBody
    }),
    // Last, so the board sits over a drawer if both are somehow open.
    h(MosaicOverlay, {
      mounted: mosaicMotion.mounted,
      book: state.book,
      t,
      updateBook,
      onSummary,
      tab: mosaicTab,
      onTab: setMosaicTab,
      closing: mosaicMotion.closing,
      // What the review flow needs: the folder the routes address, the chapter 检查本章 reads,
      // and the proposal itself. The panel owns the proposal state and hands down its setter;
      // nothing is persisted — a proposal the writer never accepts is re-fetched by the next
      // 检查本章.
      mosaicProposal,
      api: api2,
      bookFolder,
      chapter,
      onProposal: setMosaicProposal,
      // The apply route writes the file, so the review header needs the same two panel
      // services a drawer gets: a flush before it reads, and the write result it adopts.
      onFlush: flushSave,
      onAdoptWritten: adoptWritten,
      // The merged reference pages ride on the same services their drawers used, plus the two
      // ways a page reports back: a notice, and the book a route wrote.
      onNotice: noticeRow,
      onClose: () => setMosaicOpen(false)
    }),
    // Last: the drawn tooltip layer, so a bubble can sit over every overlay above.
    h(TooltipLayer, { rootRef: shellRef })
  );
}

// src/client/index.js
var index_default = {
  inject: ["slots", "locale", "connection", "workspaces"],
  // Only the word diff survived the move to selection-based editing: it is what renders
  // the transient proposal block, and it is the one piece worth testing in isolation.
  // Pure pieces worth testing alone: the word diff renders the proposal card, the save queue
  // decides whether a burst of keystrokes reaches the disk, the find helpers drive the search
  // bar, and typography normalisation is what keeps a corrupt stored value from breaking mount.
  __logic: {
    diffWords,
    createSaveQueue,
    findMatches,
    normalizeTypography,
    TYPOGRAPHY_DEFAULT,
    TYPOGRAPHY_BOUNDS,
    // The row edits the three reference drawers share. Pure, so a test can pin them without
    // mounting a component, and the same functions the pages actually call.
    patchRow,
    appendRow,
    removeRow,
    rowId,
    clockTime,
    // The auto-save schedule: the default is what the settings page shows as chosen, so a
    // test that pins "five minutes" has to read the same constant the panel uses.
    AUTO_SAVE_DEFAULT,
    AUTO_SAVE_PRESETS,
    normalizeAutoSave,
    // The editor pieces that decide what a keystroke does and what a document looks like,
    // exposed so both can be tested without a browser.
    createHistory,
    renderMarkdownBlocks,
    routeChatQuestion,
    paintRuns,
    createLoneModifierWatcher,
    // The two pure helpers behind 导出: the file name a download gets, and what the download does
    // when there is no document to do it with. Exposed here with the other pure pieces because
    // they are functions, not components — __components is walked by a test that mounts each
    // entry, and a bag of helpers would fail it.
    exportFileName,
    downloadText,
    // How long a passage may be and still be set in the book's own type. Derived from the
    // page settings, so it is a pure function a test can pin at every size the panel offers —
    // TYPE_PRESETS is exported alongside it so that test walks the real steps rather than a
    // copy of them.
    proseLineBudget,
    TYPE_PRESETS,
    UI_FONT_SIZE,
    UI_LINE_HEIGHT,
    // The board's geometry: the card's box and the grid's pitch. Exported so a test can state
    // the wire arithmetic against the same numbers the component uses, instead of restating
    // them — a test that carries its own copy passes when the real one changes and the wires
    // stop landing on the cards.
    CARD_W,
    CARD_H,
    CARD_STEP_X,
    CARD_STEP_Y,
    // The chord table and matcher: the gestures are platform-specific, and getting the
    // modifiers or the Shift rule wrong is silent, so both are tested without a browser.
    gestureKeys,
    chordMatches,
    currentPlatform,
    isModifierChord
  },
  // Components are exposed for tests: a stub React can execute each body, which is the only
  // reliable way to catch hook-order and dangling-name crashes before a real render.
  // Hooks that own a whole job rather than a widget. Exposed so they can be driven on their
  // own: `useBookData` is the book lifecycle, and testing it through a mounted panel would
  // test the panel's layout at the same time.
  __hooks: { useBookData, useClosingAnimation, useBoardActions },
  __components: {
    StoryPanel: StoryPanelBody,
    StoryPanelBoundary,
    BookLibrary,
    TreeNav,
    ChapterEditor,
    ConfirmDialog,
    Drawer,
    OverviewPage,
    WritingStylesPage,
    SettingsPage,
    ModelsPage,
    StatusBar,
    AiThinking,
    ChatComposer,
    AnswerLog,
    // The two gallery pages and the card they share. Exposed because a page mounted through
    // the whole sheet is hard to assert a single attribute against — and it was the shared card
    // that had to keep the clickable and non-clickable cases apart.
    MosaicGalleryCard,
    MosaicCast,
    MosaicCards,
    MosaicPortrait,
    // The rail's function row. Mounted whole in the panel, but its four buttons are independent
    // outcomes — a shelf, a save, a download and a dialog — and each one has to be driven on its
    // own to prove it is not a decorative label.
    RailTools,
    AboutBox
  },
  apply(ctx, config) {
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      const record = (kind) => (event) => {
        const error = event?.error ?? event?.reason;
        writeStored(STORAGE_KEYS.lastError, JSON.stringify({
          kind,
          at: (/* @__PURE__ */ new Date()).toISOString(),
          message: String(error?.message ?? event?.message ?? error ?? ""),
          stack: String(error?.stack ?? "").split("\n").slice(0, 12).join("\n")
        }));
      };
      window.addEventListener("error", record("error"));
      window.addEventListener("unhandledrejection", record("rejection"));
    }
    ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN }), "storywriting: dictionaries");
    const t = ctx.locale.bind(NS);
    ctx.inject(["layout", "workspaces", "uiWorkspace"], (scope) => {
      scope.slots.inject("main", () => scope.slots.register({
        name: "main",
        key: "story",
        locale: NS,
        // `useWorkspaces`/`useSessions` arrive as slot standard props; the services the
        // panel calls directly are read here so a missing one cannot break mounting.
        inject: () => ({
          t,
          api,
          config,
          layout: scope.layout,
          workspaces: scope.workspaces,
          uiWorkspace: scope.uiWorkspace,
          // Read from the container rather than from this scope, and defensively: it is
          // optional, and a host (or a test double) without `get` must leave the panel
          // standing. A missing service is a small loss; a panel that does not render is not.
          sessionsService: typeof ctx.get === "function" ? ctx.get("sessions") : void 0
        })
      }, StoryPanelBoundary));
    });
    ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
      name: "sidebar.panellist",
      id: "story",
      order: 20,
      locale: NS,
      label: () => t("panel")
    }, PanelIcon));
  }
};
    return module.exports.default;
  },
});
