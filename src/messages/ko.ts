/**
 * 文件说明：韩文多语言文案文件，提供设置、菜单、提示等 UI 文本。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
export const messages = {
  'settings.enableCurrentSite': '현재 웹사이트에서 UTags 활성화',
  'settings.enableCurrentSiteCustomRule': '현재 웹사이트에 대한 사용자 지정 일치 규칙 사용',
  'settings.customRuleValue': '사용자 지정 일치 규칙',
  'settings.showHidedItems': "숨겨진 항목 표시 ('block', 'hide' 태그가 지정된 콘텐츠)",
  'settings.noOpacityEffect': "투명도 효과 제거 ('ignore', 'clickbait', 'promotion' 태그가 지정된 콘텐츠)",
  'settings.useVisitedFunction': '현재 웹사이트에서 브라우징 콘텐츠 태그 기능 활성화',
  'settings.displayEffectOfTheVisitedContent': '방문한 콘텐츠의 표시 효과',
  'settings.displayEffectOfTheVisitedContent.recordingonly': '기록만 저장, 마크 표시 안함',
  'settings.displayEffectOfTheVisitedContent.showtagonly': '마크만 표시',
  'settings.displayEffectOfTheVisitedContent.changecolor': '제목 색상 변경',
  'settings.displayEffectOfTheVisitedContent.translucent': '반투명',
  'settings.displayEffectOfTheVisitedContent.hide': '숨김',
  'settings.pinnedTags': '고정할 태그를 쉼표로 구분하여 추가하세요',
  'settings.pinnedTagsDefaultValue': 'block, hide, ignore, clickbait, promotion',
  'settings.pinnedTagsPlaceholder': 'foo, bar',
  'settings.emojiTags': '이모지 태그를 쉼표로 구분하여 추가하세요',
  'settings.customStyle': '모든 웹사이트에서 사용자 정의 스타일 활성화',
  'settings.customStyleCurrentSite': '현재 웹사이트에서 사용자 정의 스타일 활성화',
  'settings.customStyleDefaultValue': `/* 사용자 정의 스타일 */
body {
  /* 태그 텍스트 색상 */
  --utags-text-tag-color: white;
  /* 태그 테두리 색상 */
  --utags-text-tag-border-color: red;
  /* 태그 배경 색상 */
  --utags-text-tag-background-color: red;
}

/* 'TEST' 라벨의 태그 스타일 */
.utags_text_tag[data-utags_tag="TEST"] {
  /* 태그 텍스트 색상 */
  --utags-text-tag-color: white;
  /* 태그 테두리 색상 */
  --utags-text-tag-border-color: orange;
  /* 태그 배경 색상 */
  --utags-text-tag-background-color: orange;
}`,
  'settings.customStyleExamples': '예시',
  'settings.customStyleExamplesContent': `<p>사용자 정의 스타일 예시</p>
  <p>
  <pre>/* 사용자 정의 스타일 */
body {
  /* 태그 텍스트 색상 */
  --utags-text-tag-color: white;
  /* 태그 테두리 색상 */
  --utags-text-tag-border-color: red;
  /* 태그 배경 색상 */
  --utags-text-tag-background-color: red;
}

/* 'TEST' 라벨의 태그 스타일 */
.utags_text_tag[data-utags_tag="TEST"] {
  /* 태그 텍스트 색상 */
  --utags-text-tag-color: white;
  /* 태그 테두리 색상 */
  --utags-text-tag-border-color: orange;
  /* 태그 배경 색상 */
  --utags-text-tag-background-color: orange;
}

[data-utags_list_node*=",bar,"] {
  /* 목록에서 'bar' 태그를 포함한 항목의 배경색 */
  background-color: aqua;
}

body {
  /* 방문한 게시물의 제목 색상 */
  --utags-visited-title-color: red;
}

/* 다크 모드 */
[data-utags_darkmode="1"] body {
  /* 방문한 게시물의 제목 색상 */
  --utags-visited-title-color: yellow;
}
</pre>
  </p>
  <p><a href="https://github.com/utags/utags/tree/main/custom-style-examples">더 많은 예시</a></p>
  `,
  'settings.enableTagStyleInPrompt': '태그 입력 창에서 태그 스타일 활성화',
  'settings.useSimplePrompt': '간단한 방법으로 태그 추가',
  'settings.openTagsPage': '태그 목록',
  'settings.openDataPage': '데이터 내보내기/가져오기',
  'settings.title': '🏷️ UTags - 링크에 사용자 태그 추가',
  'settings.information': '설정을 변경한 후 페이지를 새로고침하면 적용됩니다',
  'settings.report': '문제 신고',
  'prompt.addTags': '[UTags] 태그를 입력하세요. 여러 태그는 쉼표로 구분하세요',
  'prompt.pinnedTags': '고정',
  'prompt.mostUsedTags': '최근 자주 사용',
  'prompt.recentAddedTags': '최근 추가',
  'prompt.emojiTags': '이모지',
  'prompt.copy': '복사',
  'prompt.cancel': '취소',
  'prompt.ok': '확인',
  'prompt.settings': '설정',
  'menu.addTagsToCurrentPage': '현재 페이지에 태그 추가',
  'menu.modifyCurrentPageTags': '현재 페이지 태그 수정',
  'menu.addQuickTag': '현재 페이지에 {tag} 태그 추가',
  'menu.removeQuickTag': '현재 페이지에서 {tag} 태그 제거',
  'menu.bookmarkList': '북마크 관리자',
  'menu.hideAllTags': '모든 태그 숨기기',
  'menu.unhideAllTags': '모든 태그 숨김 해제',
  'settings.enableQuickStar': '빠른 별표 추가 활성화',
  'settings.quickTags': '빠른 태그',
  'settings.quickTagsPlaceholder': '★, ⭐, 💎',
}

export default messages
