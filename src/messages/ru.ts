/**
 * 文件说明：俄文多语言文案文件，提供设置、菜单、提示等 UI 文本。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
const messages = {
  'settings.enableCurrentSite': 'Включить UTags на текущем сайте',
  'settings.enableCurrentSiteCustomRule': 'Включить пользовательские правила соответствия для текущего веб-сайта',
  'settings.customRuleValue': 'Пользовательские правила соответствия',
  'settings.showHidedItems': 'Показывать скрытые элементы (с тегами «block», «hide»)',
  'settings.noOpacityEffect': 'Убрать эффект полупрозрачности (с тегами «ignore», «clickbait», «promotion»)',
  'settings.useVisitedFunction': 'Включить функцию отметки просмотренного контента на текущем сайте',
  'settings.displayEffectOfTheVisitedContent': 'Эффект отображения просмотренного контента',
  'settings.displayEffectOfTheVisitedContent.recordingonly': 'Только сохранять записи, не показывать отметки',
  'settings.displayEffectOfTheVisitedContent.showtagonly': 'Только показывать отметки',
  'settings.displayEffectOfTheVisitedContent.changecolor': 'Изменить цвет заголовка',
  'settings.displayEffectOfTheVisitedContent.translucent': 'Полупрозрачность',
  'settings.displayEffectOfTheVisitedContent.hide': 'Скрыть',
  'settings.pinnedTags': 'Добавьте теги для закрепления, разделяя запятыми',
  'settings.pinnedTagsDefaultValue': 'block, hide, ignore, clickbait, promotion',
  'settings.pinnedTagsPlaceholder': 'foo, bar',
  'settings.emojiTags': 'Добавьте эмодзи-теги, разделяя запятыми',
  'settings.customStyle': 'Включить пользовательские стили для всех сайтов',
  'settings.customStyleCurrentSite': 'Включить пользовательские стили для текущего сайта',
  'settings.customStyleDefaultValue': `/* Пользовательские стили */
body {
  /* Цвет текста тега */
  --utags-text-tag-color: white;
  /* Цвет границы тега */
  --utags-text-tag-border-color: red;
  /* Цвет фона тега */
  --utags-text-tag-background-color: red;
}

/* Стиль для тега с названием «TEST» */
.utags_text_tag[data-utags_tag="TEST"] {
  /* Цвет текста тега */
  --utags-text-tag-color: white;
  /* Цвет границы тега */
  --utags-text-tag-border-color: orange;
  /* Цвет фона тега */
  --utags-text-tag-background-color: orange;
}`,
  'settings.customStyleExamples': 'Примеры',
  'settings.customStyleExamplesContent': `<p>Примеры пользовательских стилей</p>
  <p>
  <pre>/* Пользовательские стили */
body {
  /* Цвет текста тега */
  --utags-text-tag-color: white;
  /* Цвет границы тега */
  --utags-text-tag-border-color: red;
  /* Цвет фона тега */
  --utags-text-tag-background-color: red;
}

/* Стиль для тега с названием «TEST» */
.utags_text_tag[data-utags_tag="TEST"] {
  /* Цвет текста тега */
  --utags-text-tag-color: white;
  /* Цвет границы тега */
  --utags-text-tag-border-color: orange;
  /* Цвет фона тега */
  --utags-text-tag-background-color: orange;
}

[data-utags_list_node*=",bar,"] {
  /* Цвет фона элементов списка,
  содержащих тег «bar» */
  background-color: aqua;
}

body {
  /* Цвет заголовков просмотренных записей */
  --utags-visited-title-color: red;
}

/* Тёмная тема */
[data-utags_darkmode="1"] body {
  /* Цвет заголовков просмотренных записей */
  --utags-visited-title-color: yellow;
}
</pre>
  </p>
  <p><a href="https://github.com/utags/utags/tree/main/custom-style-examples">Больше примеров</a></p>
  `,
  'settings.enableTagStyleInPrompt': 'Включить стиль тегов в окне ввода тегов',
  'settings.useSimplePrompt': 'Использовать простой метод добавления тегов',
  'settings.openTagsPage': 'Открыть список тегов',
  'settings.openDataPage': 'Экспорт/импорт данных',
  'settings.title': '🏷️ UTags - Добавить пользовательские теги к ссылкам',
  'settings.information': 'После изменения настроек перезагрузите страницу для применения изменений',
  'settings.report': 'Сообщить о проблеме...',
  'prompt.addTags': '[UTags] Введите теги, разделяя их запятыми',
  'prompt.pinnedTags': 'Закреплённые',
  'prompt.mostUsedTags': 'Часто используемые',
  'prompt.recentAddedTags': 'Недавно добавленные',
  'prompt.emojiTags': 'Эмодзи',
  'prompt.copy': 'Копировать',
  'prompt.cancel': 'Отмена',
  'prompt.ok': 'ОК',
  'prompt.settings': 'Настройки',
  'menu.addTagsToCurrentPage': 'Добавить теги к текущей странице',
  'menu.modifyCurrentPageTags': 'Изменить теги текущей страницы',
  'menu.addQuickTag': 'Добавить тег {tag} к текущей странице',
  'menu.removeQuickTag': 'Удалить тег {tag} с текущей страницы',
  'menu.bookmarkList': 'Диспетчер закладок',
  'menu.hideAllTags': 'Скрыть все теги',
  'menu.unhideAllTags': 'Показать все теги',
  'settings.enableQuickStar': 'Включить быстрое добавление звезды',
  'settings.quickTags': 'Быстрые Теги',
  'settings.quickTagsPlaceholder': '★, ⭐, 💎',
}

export default messages
