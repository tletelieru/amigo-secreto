import { defineMessages } from './react';

type Strings = {
  appName: string;
  toLight: string;
  toDark: string;
  language: string;
  hero: { title: string; subtitle: string };
  event: {
    title: string;
    name: string;
    date: string;
    amount: string;
    note: string;
  };
  people: {
    title: string;
    add: string;
    addLabel: string;
    remove: (name: string) => string;
    emoji: (name: string) => string;
    empty: string;
    duplicate: string;
    email: (name: string) => string;
    emailHint: string;
    emailInvalid: string;
  };
  lists: {
    title: string;
    name: string;
    save: string;
    load: (name: string) => string;
    remove: (name: string) => string;
    replace: string;
    replaceTitle: string;
    replaceBody: string;
  };
  exclusions: {
    title: string;
    hint: string;
    from: string;
    to: string;
    bothWays: string;
    add: string;
    remove: (from: string, to: string) => string;
  };
  run: {
    singleCycle: string;
    singleCycleHint: string;
    draw: string;
    needPeople: (min: number) => string;
    impossible: string;
    impossibleCycle: string;
  };
  group: {
    title: string;
    subtitle: string;
    linkTitle: string;
    linkBody: string;
    showIndividual: string;
    hideIndividual: string;
    notConfigured: string;
    loadFailed: string;
    noEmail: string;
    notInGroup: (email: string) => string;
  };
  links: {
    title: string;
    done: string;
    warning: string;
    copy: string;
    copied: string;
    copyFailed: string;
    share: string;
    whatsapp: string;
    sent: string;
    progress: (sent: number, total: number) => string;
    message: (name: string, event: string) => string;
    redo: string;
    redoTitle: string;
    redoBody: string;
    cancel: string;
  };
  data: {
    export: string;
    import: string;
    reset: string;
    resetTitle: string;
    resetBody: string;
    importTitle: string;
    importBody: string;
    confirm: string;
    invalid: string;
  };
  result: {
    loading: string;
    greeting: (name: string) => string;
    privateNote: string;
    reveal: string;
    envelope: string;
    giveTo: string;
    event: string;
    date: string;
    amount: string;
    invalidTitle: string;
    invalidBody: string;
    create: string;
  };
  footer: { developedBy: string };
};

export const messages = defineMessages<Strings>({
  en: {
    appName: 'Secret Santa',
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    language: 'Language',
    hero: {
      title: 'Draw names, keep the secret',
      subtitle:
        'Everyone gets a private link with their match. No accounts, and nothing leaves your browser.',
    },
    event: {
      title: 'Event',
      name: 'Event name',
      date: 'Date',
      amount: 'Suggested amount',
      note: 'Note (place, theme)',
    },
    people: {
      title: 'Participants',
      add: 'Add',
      addLabel: 'Name',
      remove: (name) => `Remove ${name}`,
      emoji: (name) => `Change emoji for ${name}`,
      empty: 'Add the people taking part.',
      duplicate: 'That name is already on the list.',
      email: (name) => `Google email for ${name}`,
      emailHint: 'Add everyone’s Google email to get one link for the whole group.',
      emailInvalid: 'Check this email.',
    },
    lists: {
      title: 'Saved lists',
      name: 'List name',
      save: 'Save list',
      load: (name) => `Load list ${name}`,
      remove: (name) => `Delete list ${name}`,
      replace: 'Load list',
      replaceTitle: 'Load this list?',
      replaceBody: 'It replaces the current participants and exclusions. The event stays the same.',
    },
    exclusions: {
      title: 'Exclusions',
      hint: 'Pairs that should not draw each other, like couples or last year’s match.',
      from: 'Person',
      to: 'Cannot draw',
      bothWays: 'Both ways',
      add: 'Add exclusion',
      remove: (from, to) => `Remove exclusion ${from} and ${to}`,
    },
    run: {
      singleCycle: 'Single round',
      singleCycleHint: 'Everyone forms one chain, so gifts can be handed over in a circle.',
      draw: 'Draw names',
      needPeople: (min) => `Add at least ${min} people to draw.`,
      impossible: 'No valid draw exists with these exclusions. Remove one and try again.',
      impossibleCycle:
        'No single round exists with these exclusions. Turn it off or remove an exclusion.',
    },
    group: {
      title: 'Secret Santa',
      subtitle: 'Sign in with Google to see who you are giving a gift to.',
      linkTitle: 'One link for everyone',
      linkBody:
        'Send this link to the group. Each person signs in with Google and sees only their match.',
      showIndividual: 'Show individual links',
      hideIndividual: 'Hide individual links',
      notConfigured: 'Google sign-in is not set up yet.',
      loadFailed: 'Google sign-in could not load. Check your connection and try again.',
      noEmail: 'that account',
      notInGroup: (email) => `${email} is not in this group. Try another Google account.`,
    },
    links: {
      title: 'Send the links',
      done: 'The draw is done and hidden from you. Send each person their link.',
      warning:
        'Opening someone else’s link would show their match. This view only prevents seeing it by accident.',
      copy: 'Copy link',
      copied: 'Link copied',
      copyFailed: 'Could not copy the link',
      share: 'Share',
      whatsapp: 'WhatsApp',
      sent: 'Sent',
      progress: (sent, total) => `${sent} of ${total} sent`,
      message: (name, event) => `${name}, this is your Secret Santa link for ${event}:`,
      redo: 'Redo the draw',
      redoTitle: 'Redo the draw?',
      redoBody:
        'Links you already sent will still open their old match. You will need to send new ones.',
      cancel: 'Cancel',
    },
    data: {
      export: 'Export',
      import: 'Import',
      reset: 'New group',
      resetTitle: 'Start a new group?',
      resetBody: 'This deletes the current group and its links from this browser.',
      importTitle: 'Replace the current group?',
      importBody: 'The imported file replaces the group saved in this browser.',
      confirm: 'Continue',
      invalid: 'That file is not a valid group.',
    },
    result: {
      loading: 'Opening your link…',
      greeting: (name) => `Hi ${name}!`,
      privateNote: 'This link is only for you. Open it when nobody is looking.',
      reveal: 'Tap to reveal',
      envelope: 'Open the envelope',
      giveTo: 'You are giving a gift to',
      event: 'Event',
      date: 'Date',
      amount: 'Suggested amount',
      invalidTitle: 'This link does not work',
      invalidBody: 'It may be incomplete. Ask the organizer to send it again.',
      create: 'Create your own draw',
    },
    footer: { developedBy: 'Developed by' },
  },
  es: {
    appName: 'Amigo Secreto',
    toLight: 'Cambiar a modo claro',
    toDark: 'Cambiar a modo oscuro',
    language: 'Idioma',
    hero: {
      title: 'Sortea y guarda el secreto',
      subtitle:
        'Cada persona recibe un link privado con su resultado. Sin cuentas, y nada sale de tu navegador.',
    },
    event: {
      title: 'Evento',
      name: 'Nombre del evento',
      date: 'Fecha',
      amount: 'Monto sugerido',
      note: 'Nota (lugar, temática)',
    },
    people: {
      title: 'Participantes',
      add: 'Agregar',
      addLabel: 'Nombre',
      remove: (name) => `Quitar a ${name}`,
      emoji: (name) => `Cambiar emoji de ${name}`,
      empty: 'Agrega a las personas que participan.',
      duplicate: 'Ese nombre ya está en la lista.',
      email: (name) => `Correo de Google de ${name}`,
      emailHint:
        'Agrega el correo de Google de cada persona para tener un solo link para todo el grupo.',
      emailInvalid: 'Revisa este correo.',
    },
    lists: {
      title: 'Listas guardadas',
      name: 'Nombre de la lista',
      save: 'Guardar lista',
      load: (name) => `Cargar lista ${name}`,
      remove: (name) => `Borrar lista ${name}`,
      replace: 'Cargar lista',
      replaceTitle: '¿Cargar esta lista?',
      replaceBody: 'Reemplaza los participantes y exclusiones actuales. El evento no cambia.',
    },
    exclusions: {
      title: 'Exclusiones',
      hint: 'Pares que no deben tocarse, como parejas o quien se regaló el año pasado.',
      from: 'Persona',
      to: 'No le puede tocar',
      bothWays: 'En ambos sentidos',
      add: 'Agregar exclusión',
      remove: (from, to) => `Quitar exclusión entre ${from} y ${to}`,
    },
    run: {
      singleCycle: 'Ronda única',
      singleCycleHint: 'Todos forman una sola cadena, para entregar los regalos en ronda.',
      draw: 'Sortear',
      needPeople: (min) => `Agrega al menos ${min} personas para sortear.`,
      impossible: 'No hay sorteo posible con estas exclusiones. Quita alguna e inténtalo de nuevo.',
      impossibleCycle:
        'No hay ronda única posible con estas exclusiones. Desactívala o quita una exclusión.',
    },
    group: {
      title: 'Amigo Secreto',
      subtitle: 'Entra con Google para ver a quién te toca regalarle.',
      linkTitle: 'Un link para todos',
      linkBody: 'Envía este link al grupo. Cada persona entra con Google y ve solo su resultado.',
      showIndividual: 'Ver links individuales',
      hideIndividual: 'Ocultar links individuales',
      notConfigured: 'El inicio de sesión con Google aún no está configurado.',
      loadFailed: 'No se pudo cargar Google. Revisa tu conexión e inténtalo de nuevo.',
      noEmail: 'esa cuenta',
      notInGroup: (email) => `${email} no está en este grupo. Prueba con otra cuenta de Google.`,
    },
    links: {
      title: 'Envía los links',
      done: 'El sorteo está hecho y oculto para ti. Envía a cada persona su link.',
      warning:
        'Abrir el link de otra persona mostraría su resultado. Esta vista solo evita verlo por accidente.',
      copy: 'Copiar link',
      copied: 'Link copiado',
      copyFailed: 'No se pudo copiar el link',
      share: 'Compartir',
      whatsapp: 'WhatsApp',
      sent: 'Enviado',
      progress: (sent, total) => `${sent} de ${total} enviados`,
      message: (name, event) => `${name}, este es tu link del amigo secreto de ${event}:`,
      redo: 'Rehacer sorteo',
      redoTitle: '¿Rehacer el sorteo?',
      redoBody:
        'Los links ya enviados seguirán abriendo el resultado antiguo. Habrá que enviar los nuevos.',
      cancel: 'Cancelar',
    },
    data: {
      export: 'Exportar',
      import: 'Importar',
      reset: 'Nuevo grupo',
      resetTitle: '¿Empezar un grupo nuevo?',
      resetBody: 'Esto borra de este navegador el grupo actual y sus links.',
      importTitle: '¿Reemplazar el grupo actual?',
      importBody: 'El archivo importado reemplaza el grupo guardado en este navegador.',
      confirm: 'Continuar',
      invalid: 'Ese archivo no es un grupo válido.',
    },
    result: {
      loading: 'Abriendo tu link…',
      greeting: (name) => `¡Hola, ${name}!`,
      privateNote: 'Este link es solo para ti. Ábrelo cuando nadie esté mirando.',
      reveal: 'Toca para revelar',
      envelope: 'Abrir el sobre',
      giveTo: 'Te toca regalarle a',
      event: 'Evento',
      date: 'Fecha',
      amount: 'Monto sugerido',
      invalidTitle: 'Este link no funciona',
      invalidBody: 'Puede estar incompleto. Pídele a quien organiza que lo envíe de nuevo.',
      create: 'Crea tu propio sorteo',
    },
    footer: { developedBy: 'Desarrollado por' },
  },
});
