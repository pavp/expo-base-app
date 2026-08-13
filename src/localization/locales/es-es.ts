import en_US from './en-us';

const es_ES: typeof en_US = {
  translation: {
    welcome: 'Hola',
    screens: {
      home: 'Inicio',
      explore: 'Explorar',
      post: 'Publicación',
      posts: 'Placeholders',
      settings: 'Ajustes',
    },
    explore: {
      searchPlaceholder: 'Buscar publicaciones',
      clearSearch: 'Borrar búsqueda',
      emptyTitle: 'Busca una publicación',
      emptyDescription: 'Escribe una palabra para buscar en el título y el cuerpo de cada publicación.',
      allAuthors: 'Todos',
      noResultsTitle: 'Sin coincidencias',
      noResultsDescription: 'No se encontró nada para «{{term}}». Prueba con otra palabra.',
      noResultsForAuthorDescription: 'Este autor no tiene publicaciones que coincidan con el filtro actual.',
      errorTitle: 'Algo salió mal',
      errorDescription: 'No se pudo completar la búsqueda. Desliza hacia abajo para reintentar.',
    },
    settings: {
      appearance: 'Apariencia',
      theme: 'Tema',
      themeLight: 'Claro',
      themeDark: 'Oscuro',
      language: 'Idioma',
      languageEnglish: 'Inglés',
      languageSpanish: 'Español',
      about: 'Acerca de',
      version: 'Versión',
    },
  },
};

export default es_ES;
