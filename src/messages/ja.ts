/**
 * 文件说明：日文多语言文案文件，提供设置、菜单、提示等 UI 文本。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
export const messages = {
  'settings.enableCurrentSite': '現在のウェブサイトでUTagsを有効にする',
  'settings.enableCurrentSiteCustomRule': '現在のウェブサイトのカスタムマッチングルールを有効にする',
  'settings.customRuleValue': 'カスタムマッチングルール',
  'settings.showHidedItems': "非表示のアイテムを表示する（'block'、'hide'タグが付けられたコンテンツ）",
  'settings.noOpacityEffect': "透明度効果を無効にする（'ignore'、'clickbait'、'promotion'タグが付けられたコンテンツ）",
  'settings.useVisitedFunction': '現在のウェブサイトで閲覧コンテンツのタグ機能を有効にする',
  'settings.displayEffectOfTheVisitedContent': '閲覧済みコンテンツの表示効果',
  'settings.displayEffectOfTheVisitedContent.recordingonly': '記録のみ保存、マークは表示しない',
  'settings.displayEffectOfTheVisitedContent.showtagonly': 'マークのみ表示',
  'settings.displayEffectOfTheVisitedContent.changecolor': 'タイトルの色を変更',
  'settings.displayEffectOfTheVisitedContent.translucent': '半透明',
  'settings.displayEffectOfTheVisitedContent.hide': '非表示',
  'settings.pinnedTags': 'ピン留めしたいタグをカンマ区切りで追加してください',
  'settings.pinnedTagsDefaultValue': 'block, hide, ignore, clickbait, promotion',
  'settings.pinnedTagsPlaceholder': 'foo, bar',
  'settings.emojiTags': '絵文字タグをカンマ区切りで追加してください',
  'settings.customStyle': 'すべてのウェブサイトでカスタムスタイルを有効にする',
  'settings.customStyleCurrentSite': '現在のウェブサイトでカスタムスタイルを有効にする',
  'settings.customStyleDefaultValue': `/* カスタムスタイル */
body {
  /* タグのテキスト色 */
  --utags-text-tag-color: white;
  /* タグの境界線色 */
  --utags-text-tag-border-color: red;
  /* タグの背景色 */
  --utags-text-tag-background-color: red;
}

/* 'TEST'ラベルのタグスタイル */
.utags_text_tag[data-utags_tag="TEST"] {
  /* タグのテキスト色 */
  --utags-text-tag-color: white;
  /* タグの境界線色 */
  --utags-text-tag-border-color: orange;
  /* タグの背景色 */
  --utags-text-tag-background-color: orange;
}`,
  'settings.customStyleExamples': '例',
  'settings.customStyleExamplesContent': `<p>カスタムスタイルの例</p>
  <p>
  <pre>/* カスタムスタイル */
body {
  /* タグのテキスト色 */
  --utags-text-tag-color: white;
  /* タグの境界線色 */
  --utags-text-tag-border-color: red;
  /* タグの背景色 */
  --utags-text-tag-background-color: red;
}

/* 'TEST'ラベルのタグスタイル */
.utags_text_tag[data-utags_tag="TEST"] {
  /* タグのテキスト色 */
  --utags-text-tag-color: white;
  /* タグの境界線色 */
  --utags-text-tag-border-color: orange;
  /* タグの背景色 */
  --utags-text-tag-background-color: orange;
}

[data-utags_list_node*=",bar,"] {
  /* リスト内の'bar'タグを含む項目の背景色 */
  background-color: aqua;
}

body {
  /* 閲覧済み投稿のタイトル色 */
  --utags-visited-title-color: red;
}

/* ダークモード */
[data-utags_darkmode="1"] body {
  /* 閲覧済み投稿のタイトル色 */
  --utags-visited-title-color: yellow;
}
</pre>
  </p>
  <p><a href="https://github.com/utags/utags/tree/main/custom-style-examples">その他の例</a></p>
  `,
  'settings.enableTagStyleInPrompt': 'タグ入力ウィンドウでタグスタイルを有効にする',
  'settings.useSimplePrompt': 'シンプルな方法でタグを追加する',
  'settings.openTagsPage': 'タグリスト',
  'settings.openDataPage': 'データのエクスポート/インポート',
  'settings.title': '🏷️ 小魚タグ (UTags) - リンクにユーザータグを追加',
  'settings.information': '設定を変更した後、ページを再読み込みすると有効になります',
  'settings.report': '問題を報告',
  'prompt.addTags': '[UTags] タグを入力してください。複数のタグはカンマで区切ってください',
  'prompt.pinnedTags': 'ピン留め',
  'prompt.mostUsedTags': '最近よく使用',
  'prompt.recentAddedTags': '最新追加',
  'prompt.emojiTags': '絵文字',
  'prompt.copy': 'コピー',
  'prompt.cancel': 'キャンセル',
  'prompt.ok': '確認',
  'prompt.settings': '設定',
  'menu.addTagsToCurrentPage': '現在のページにタグを追加',
  'menu.modifyCurrentPageTags': '現在のページのタグを変更',
  'menu.addQuickTag': '現在のページに {tag} タグを追加',
  'menu.removeQuickTag': '現在のページから {tag} タグを削除',
  'menu.bookmarkList': 'ブックマーク マネージャ',
  'menu.hideAllTags': 'すべてのタグを非表示',
  'menu.unhideAllTags': 'すべてのタグの非表示を解除',
  'settings.enableQuickStar': 'クイックスター追加を有効にする',
  'settings.quickTags': 'クイックタグ',
  'settings.quickTagsPlaceholder': '★, ⭐, 💎',
}

export default messages
