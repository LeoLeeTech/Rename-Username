/**
 * 文件说明：法文多语言文案文件，提供设置、菜单、提示等 UI 文本。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
export const messages = {
  'settings.enableCurrentSite': 'Activer UTags sur le site actuel',
  'settings.enableCurrentSiteCustomRule': 'Activer les règles de correspondance personnalisées pour le site web actuel',
  'settings.customRuleValue': 'Règles de correspondance personnalisées',
  'settings.showHidedItems': "Afficher les éléments masqués (contenu marqué avec les tags 'block', 'hide')",
  'settings.noOpacityEffect': "Supprimer l'effet de transparence (contenu marqué avec les tags 'ignore', 'clickbait', 'promotion')",
  'settings.useVisitedFunction': 'Activer la fonction de marquage du contenu de navigation sur le site web actuel',
  'settings.displayEffectOfTheVisitedContent': "Effet d'affichage du contenu visité",
  'settings.displayEffectOfTheVisitedContent.recordingonly': 'Enregistrer uniquement, ne pas afficher de marque',
  'settings.displayEffectOfTheVisitedContent.showtagonly': 'Afficher uniquement la marque',
  'settings.displayEffectOfTheVisitedContent.changecolor': 'Changer la couleur du titre',
  'settings.displayEffectOfTheVisitedContent.translucent': 'Translucide',
  'settings.displayEffectOfTheVisitedContent.hide': 'Masquer',
  'settings.pinnedTags': 'Ajoutez les tags que vous souhaitez épingler, séparés par des virgules',
  'settings.pinnedTagsDefaultValue': 'block, hide, ignore, clickbait, promotion',
  'settings.pinnedTagsPlaceholder': 'foo, bar',
  'settings.emojiTags': 'Ajoutez les tags emoji, séparés par des virgules',
  'settings.customStyle': 'Activer le style personnalisé pour tous les sites web',
  'settings.customStyleCurrentSite': 'Activer le style personnalisé pour le site web actuel',
  'settings.customStyleDefaultValue': `/* Style personnalisé */
body {
  /* Couleur du texte du tag */
  --utags-text-tag-color: white;
  /* Couleur de la bordure du tag */
  --utags-text-tag-border-color: red;
  /* Couleur de l'arrière-plan du tag */
  --utags-text-tag-background-color: red;
}

/* Style du tag pour le label 'TEST' */
.utags_text_tag[data-utags_tag="TEST"] {
  /* Couleur du texte du tag */
  --utags-text-tag-color: white;
  /* Couleur de la bordure du tag */
  --utags-text-tag-border-color: orange;
  /* Couleur de l'arrière-plan du tag */
  --utags-text-tag-background-color: orange;
}`,
  'settings.customStyleExamples': 'Exemples',
  'settings.customStyleExamplesContent': `<p>Exemples de style personnalisé</p>
  <p>
  <pre>/* Style personnalisé */
body {
  /* Couleur du texte du tag */
  --utags-text-tag-color: white;
  /* Couleur de la bordure du tag */
  --utags-text-tag-border-color: red;
  /* Couleur de l'arrière-plan du tag */
  --utags-text-tag-background-color: red;
}

/* Style du tag pour le label 'TEST' */
.utags_text_tag[data-utags_tag="TEST"] {
  /* Couleur du texte du tag */
  --utags-text-tag-color: white;
  /* Couleur de la bordure du tag */
  --utags-text-tag-border-color: orange;
  /* Couleur de l'arrière-plan du tag */
  --utags-text-tag-background-color: orange;
}

[data-utags_list_node*=",bar,"] {
  /* Couleur d'arrière-plan des entrées de la liste contenant le tag 'bar' */
  background-color: aqua;
}

body {
  /* Couleur du titre des publications visitées */
  --utags-visited-title-color: red;
}

/* Mode sombre */
[data-utags_darkmode="1"] body {
  /* Couleur du titre des publications visitées */
  --utags-visited-title-color: yellow;
}
</pre>
  </p>
  <p><a href="https://github.com/utags/utags/tree/main/custom-style-examples">Plus d'exemples</a></p>
  `,
  'settings.enableTagStyleInPrompt': 'Activer le style des tags dans la fenêtre de saisie des tags',
  'settings.useSimplePrompt': 'Utiliser une méthode simple pour ajouter des tags',
  'settings.openTagsPage': 'Liste des tags',
  'settings.openDataPage': 'Exporter/Importer des données',
  'settings.title': '🏷️ UTags - Ajouter des tags utilisateur aux liens',
  'settings.information': "Après avoir modifié les paramètres, rechargez la page pour qu'ils prennent effet",
  'settings.report': 'Signaler un problème',
  'prompt.addTags': '[UTags] Veuillez saisir des tags, plusieurs tags sont séparés par des virgules',
  'prompt.pinnedTags': 'Épinglé',
  'prompt.mostUsedTags': 'Récemment utilisés fréquemment',
  'prompt.recentAddedTags': 'Nouvellement ajouté',
  'prompt.emojiTags': 'Emoji',
  'prompt.copy': 'Copier',
  'prompt.cancel': 'Annuler',
  'prompt.ok': 'Confirmer',
  'prompt.settings': 'Paramètres',
  'menu.addTagsToCurrentPage': 'Ajouter des étiquettes à la page actuelle',
  'menu.modifyCurrentPageTags': 'Modifier les étiquettes de la page actuelle',
  'menu.addQuickTag': "Ajouter l'étiquette {tag} à la page actuelle",
  'menu.removeQuickTag': "Supprimer l'étiquette {tag} de la page actuelle",
  'menu.bookmarkList': 'Gestionnaire de favoris',
  'menu.hideAllTags': 'Masquer toutes les étiquettes',
  'menu.unhideAllTags': 'Afficher toutes les étiquettes',
  'settings.enableQuickStar': "Activer ajout rapide d'étoile",
  'settings.quickTags': 'Étiquettes Rapides',
  'settings.quickTagsPlaceholder': '★, ⭐, 💎',
}

export default messages
