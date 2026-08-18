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
    errorBoundary: {
      title: 'Algo salió mal',
      description: 'Esta parte de la aplicación se detuvo inesperadamente. Puedes intentar cargarla de nuevo.',
      retry: 'Reintentar',
    },
    home: {
      errorTitle: 'Algo salió mal',
      errorDescription: 'No se pudieron cargar las publicaciones. Desliza hacia abajo para reintentar.',
      emptyTitle: 'Todavía no hay publicaciones',
      emptyDescription: 'Por ahora no hay nada que leer aquí.',
    },
    postDetail: {
      errorTitle: 'Publicación no disponible',
      errorDescription: 'No se pudo cargar esta publicación. Vuelve atrás e inténtalo de nuevo.',
      comments: 'Comentarios',
      commentForm: {
        title: 'Deja un comentario',
        namePlaceholder: 'Tu nombre',
        emailPlaceholder: 'Tu correo electrónico',
        bodyPlaceholder: 'Escribe tu comentario',
        submit: 'Publicar comentario',
        submitting: 'Publicando…',
        error: 'No se pudo publicar tu comentario. Inténtalo de nuevo.',
      },
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
