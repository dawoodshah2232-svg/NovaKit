import type { LocaleDictionary } from './types';

export const es: LocaleDictionary = {
  locale: 'es',
  htmlLang: 'es',
  dir: 'ltr',
  chrome: {
    backToTools: 'Volver a las herramientas',
    home: 'Inicio',
    popularBadge: 'Popular',
    useTool: 'Usar herramienta',
  },
  home: {
    metaTitle: 'PDFEdit – Editor PDF gratis online y herramientas PDF',
    metaDescription:
      'Editor PDF gratis online y herramientas PDF. Combina, divide, comprime, firma, convierte y edita archivos PDF en tu navegador: sin subir archivos y sin cuentas.',
    heroKicker: 'Herramientas PDF gratuitas · 100 % en tu navegador',
    heroTitle: 'Edita tus PDF gratis, sin subirlos a ningún servidor',
    heroLead:
      'PDFEdit es una herramienta PDF gratuita que funciona por completo en tu navegador: combina, comprime, convierte, firma y edita PDF sin subir archivos, sin marcas de agua y sin crear cuentas.',
    toolsHeading: 'Herramientas PDF más usadas',
    toolsSub:
      'Cada herramienta se ejecuta en tu dispositivo. Tus archivos nunca salen de tu navegador.',
    viewAllTools: 'Ver las 30 herramientas',
    whyHeading: 'Por qué elegir PDFEdit',
    whyLead:
      'La mayoría de editores PDF online suben tus archivos a sus servidores. PDFEdit no: todo el procesamiento ocurre en tu navegador.',
    whyPoints: [
      {
        title: 'Tus archivos nunca se suben',
        body: 'Combinar, comprimir o firmar un PDF ocurre en la memoria de tu propio dispositivo. Nada viaja por la red.',
      },
      {
        title: 'Gratis de verdad, sin marcas de agua',
        body: 'Las herramientas principales son gratuitas y no añaden marcas de agua a tus documentos.',
      },
      {
        title: 'Sin cuentas ni instalaciones',
        body: 'Abre la herramienta y úsala. No hay registros, ni descargas, ni suscripciones.',
      },
      {
        title: 'Rápido y privado',
        body: 'Al no depender de un servidor, las tareas empiezan al instante y tus documentos permanecen privados.',
      },
    ],
    trustHeading: 'Privacidad ante todo',
    trustBullets: [
      'Procesamiento local en tu navegador',
      'Cero almacenamiento en la nube',
      'Sin seguimiento de tus documentos',
      'Funciona con archivos confidenciales',
    ],
    faqHeading: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿PDFEdit es realmente gratis?',
        answer:
          'Sí. Las herramientas PDF principales —combinar, comprimir, convertir, firmar y más— son gratuitas y no añaden marcas de agua a tus documentos.',
      },
      {
        question: '¿Mis archivos se suben a un servidor?',
        answer:
          'No. PDFEdit procesa tus archivos directamente en tu navegador. Tus documentos nunca salen de tu dispositivo.',
      },
      {
        question: '¿Necesito crear una cuenta?',
        answer:
          'No. No hay registros ni inicios de sesión: abre la herramienta que necesites y úsala al momento.',
      },
      {
        question: '¿Funciona en el móvil?',
        answer:
          'Sí. Todas las herramientas funcionan en navegadores modernos de móvil, tableta y escritorio.',
      },
    ],
    ctaHeading: 'Empieza con tus PDF ahora mismo',
    ctaBody:
      'Elige una herramienta y trabaja con tus documentos sin subirlos a ningún servidor.',
    ctaButton: 'Explorar herramientas',
  },
  tools: {
    'merge-pdf': {
      key: 'merge-pdf',
      engineSlug: 'pdf-merger',
      name: 'Combinar PDF',
      metaTitle: 'Combinar PDF gratis online – Unir archivos PDF | PDFEdit',
      metaDescription:
        'Une varios archivos PDF en uno solo, en el orden que quieras, directamente en tu navegador. Gratis, sin subir archivos y sin crear una cuenta.',
      answerLead:
        'Sí: PDFEdit combina tus archivos PDF en un solo documento, en el orden que elijas, todo en tu navegador.',
      answerHeading: 'Combinar PDF funciona en tu navegador: nada se sube',
      answerBody:
        'Añade dos o más archivos PDF, ordénalos arrastrando y elige Combinar. PDFEdit une todas las páginas en el orden mostrado y conserva el texto y los vectores del documento original.',
      processingNote: '100 % privado · Procesado en la memoria local',
      stepsHeading: 'Cómo combinar PDF en 3 pasos',
      steps: [
        {
          title: 'Añade tus archivos PDF',
          description:
            'Selecciona o arrastra los PDF que quieras unir. Puedes añadir tantos como necesites.',
        },
        {
          title: 'Ordénalos a tu gusto',
          description:
            'Arrastra las miniaturas para definir el orden final de las páginas en el documento combinado.',
        },
        {
          title: 'Combina y descarga',
          description:
            'Pulsa Combinar PDF y descarga al instante un único archivo con todo el contenido.',
        },
      ],
      privacyHeading: 'Privacidad y estándares de la arquitectura sin servidor',
      privacyBullets: [
        'Espacio de memoria aislado',
        'Cero almacenamiento en la nube',
        'Velocidad de tu propio equipo',
        'Sin límites de uso',
      ],
      faqHeading: 'Preguntas frecuentes sobre Combinar PDF',
      faqs: [
        {
          question: '¿Puedo cambiar el orden de los PDF antes de combinarlos?',
          answer:
            'Sí. Arrastra las miniaturas de los archivos para reordenarlos antes de pulsar Combinar PDF.',
        },
        {
          question: '¿Hay un límite de archivos para combinar?',
          answer:
            'No hay un límite fijo: depende de la memoria de tu dispositivo, ya que todo se procesa localmente en tu navegador.',
        },
        {
          question: '¿Se pierde calidad al combinar PDF?',
          answer:
            'No. La herramienta copia las páginas directamente en lugar de convertirlas en imágenes, así que el texto y los vectores se conservan.',
        },
      ],
      relatedToolsHeading: 'Herramientas PDF relacionadas',
      relatedGuidesHeading: 'Guías relacionadas',
      relatedGuidesNote: 'Tutoriales paso a paso del blog de PDFEdit (en inglés).',
      backLabel: 'Volver a las herramientas',
      homeLabel: 'Inicio',
      zeroUploadsLabel: 'Cero subidas al servidor',
    },
    'compress-pdf': {
      key: 'compress-pdf',
      engineSlug: 'compress-pdf',
      name: 'Comprimir PDF',
      metaTitle: 'Comprimir PDF gratis online – Reducir tamaño de PDF | PDFEdit',
      metaDescription:
        'Reduce el tamaño de tus archivos PDF para enviarlos por correo o compartirlos, directamente en tu navegador y sin perder legibilidad.',
      answerLead:
        'Sí: PDFEdit reduce el tamaño de tu PDF optimizándolo en tu propio navegador, sin subir archivos.',
      answerHeading: 'Comprimir PDF funciona en tu navegador: nada se sube',
      answerBody:
        'La herramienta optimiza imágenes y flujos internos del PDF en tu dispositivo para lograr un archivo más ligero, ideal para correo electrónico, formularios y plataformas con límite de tamaño.',
      processingNote: 'Sin subidas · Optimización local del documento',
      stepsHeading: 'Cómo comprimir un PDF en 3 pasos',
      steps: [
        {
          title: 'Sube tu archivo PDF',
          description:
            'Selecciona el PDF que pesa demasiado. El archivo solo se abre en tu navegador.',
        },
        {
          title: 'Elige el nivel de compresión',
          description:
            'Ajusta la calidad según necesites: más compresión para archivos pequeños o calidad alta para impresión.',
        },
        {
          title: 'Descarga el PDF ligero',
          description:
            'Compara el tamaño antes y después, y descarga tu PDF optimizado al instante.',
        },
      ],
      privacyHeading: 'Privacidad y estándares de la arquitectura sin servidor',
      privacyBullets: [
        'Espacio de memoria aislado',
        'Cero almacenamiento en la nube',
        'Velocidad de tu propio equipo',
        'Sin límites de uso',
      ],
      faqHeading: 'Preguntas frecuentes sobre Comprimir PDF',
      faqs: [
        {
          question: '¿Cuánto se puede reducir un PDF?',
          answer:
            'Depende del contenido: los PDF con muchas imágenes suelen reducirse notablemente, mientras que los de solo texto ya son ligeros.',
        },
        {
          question: '¿Pierde calidad el documento?',
          answer:
            'Puedes elegir el nivel de compresión. En niveles moderados el texto se mantiene nítido y las imágenes conservan buena calidad.',
        },
        {
          question: '¿Mis archivos salen de mi dispositivo?',
          answer:
            'No. La compresión ocurre por completo en tu navegador; ningún servidor recibe tu documento.',
        },
      ],
      relatedToolsHeading: 'Herramientas PDF relacionadas',
      relatedGuidesHeading: 'Guías relacionadas',
      relatedGuidesNote: 'Tutoriales paso a paso del blog de PDFEdit (en inglés).',
      backLabel: 'Volver a las herramientas',
      homeLabel: 'Inicio',
      zeroUploadsLabel: 'Cero subidas al servidor',
    },
    'pdf-to-word': {
      key: 'pdf-to-word',
      engineSlug: 'pdf-to-word',
      name: 'PDF a Word',
      metaTitle: 'Convertir PDF a Word gratis online | PDFEdit',
      metaDescription:
        'Convierte el texto de tu PDF en un documento Word (DOCX) editable, directamente en tu navegador y sin subir archivos.',
      answerLead:
        'Sí: PDFEdit convierte tu PDF en un documento Word editable en tu navegador; el texto sigue siendo texto.',
      answerHeading: 'Convertir PDF a Word funciona en tu navegador: nada se sube',
      answerBody:
        'La herramienta extrae el contenido de texto del PDF y genera un archivo DOCX que puedes abrir y editar en Microsoft Word, Google Docs o LibreOffice.',
      processingNote: '100 % privado · Conversión local en tu navegador',
      stepsHeading: 'Cómo convertir PDF a Word en 3 pasos',
      steps: [
        {
          title: 'Añade tu archivo PDF',
          description:
            'Selecciona el PDF cuyo texto quieras convertir. Funciona mejor con PDF de texto, no escaneados como imagen.',
        },
        {
          title: 'Convierte el documento',
          description:
            'La herramienta extrae el texto y crea un DOCX editable en segundos, sin subir nada.',
        },
        {
          title: 'Descarga tu Word',
          description:
            'Descarga el archivo .docx y éditalo en Word, Google Docs o LibreOffice.',
        },
      ],
      privacyHeading: 'Privacidad y estándares de la arquitectura sin servidor',
      privacyBullets: [
        'Espacio de memoria aislado',
        'Cero almacenamiento en la nube',
        'Velocidad de tu propio equipo',
        'Sin límites de uso',
      ],
      faqHeading: 'Preguntas frecuentes sobre PDF a Word',
      faqs: [
        {
          question: '¿Funciona con PDF escaneados?',
          answer:
            'La conversión directa funciona con PDF que contienen texto. Para documentos escaneados como imagen, usa primero la herramienta de OCR.',
        },
        {
          question: '¿Se conserva el formato del documento?',
          answer:
            'Se conserva el texto y la estructura básica. Los diseños muy complejos pueden necesitar pequeños ajustes en Word.',
        },
        {
          question: '¿El archivo DOCX tiene marca de agua?',
          answer:
            'No. El documento convertido es limpio y completamente editable.',
        },
      ],
      relatedToolsHeading: 'Herramientas PDF relacionadas',
      relatedGuidesHeading: 'Guías relacionadas',
      relatedGuidesNote: 'Tutoriales paso a paso del blog de PDFEdit (en inglés).',
      backLabel: 'Volver a las herramientas',
      homeLabel: 'Inicio',
      zeroUploadsLabel: 'Cero subidas al servidor',
    },
    'word-to-pdf': {
      key: 'word-to-pdf',
      engineSlug: 'word-to-pdf',
      name: 'Word a PDF',
      metaTitle: 'Convertir Word a PDF gratis online | PDFEdit',
      metaDescription:
        'Convierte tus documentos Word (DOCX) en archivos PDF listos para compartir, directamente en tu navegador.',
      answerLead:
        'Sí: PDFEdit convierte tu documento Word en un PDF limpio en tu navegador, sin subir archivos.',
      answerHeading: 'Convertir Word a PDF funciona en tu navegador: nada se sube',
      answerBody:
        'Sube tu archivo DOCX y obtén un PDF con el contenido del documento, perfecto para compartir, imprimir o archivar sin que el formato cambie.',
      processingNote: '100 % privado · Conversión local en tu navegador',
      stepsHeading: 'Cómo convertir Word a PDF en 3 pasos',
      steps: [
        {
          title: 'Añade tu documento Word',
          description:
            'Selecciona el archivo .docx que quieras convertir a PDF.',
        },
        {
          title: 'Convierte el archivo',
          description:
            'La herramienta genera el PDF en tu navegador en segundos, sin enviar nada a un servidor.',
        },
        {
          title: 'Descarga tu PDF',
          description:
            'Descarga el PDF listo para compartir, imprimir o archivar.',
        },
      ],
      privacyHeading: 'Privacidad y estándares de la arquitectura sin servidor',
      privacyBullets: [
        'Espacio de memoria aislado',
        'Cero almacenamiento en la nube',
        'Velocidad de tu propio equipo',
        'Sin límites de uso',
      ],
      faqHeading: 'Preguntas frecuentes sobre Word a PDF',
      faqs: [
        {
          question: '¿Qué formatos de Word acepta?',
          answer:
            'La herramienta trabaja con documentos DOCX, el formato moderno de Microsoft Word.',
        },
        {
          question: '¿El PDF resultante tiene marca de agua?',
          answer:
            'No. El PDF generado es limpio, sin marcas ni logotipos añadidos.',
        },
        {
          question: '¿Mis documentos se suben a algún servidor?',
          answer:
            'No. Toda la conversión ocurre en tu navegador; tus documentos nunca salen de tu dispositivo.',
        },
      ],
      relatedToolsHeading: 'Herramientas PDF relacionadas',
      relatedGuidesHeading: 'Guías relacionadas',
      relatedGuidesNote: 'Tutoriales paso a paso del blog de PDFEdit (en inglés).',
      backLabel: 'Volver a las herramientas',
      homeLabel: 'Inicio',
      zeroUploadsLabel: 'Cero subidas al servidor',
    },
    'sign-pdf': {
      key: 'sign-pdf',
      engineSlug: 'sign-pdf',
      name: 'Firmar PDF',
      metaTitle: 'Firmar PDF gratis online – Firma electrónica | PDFEdit',
      metaDescription:
        'Firma tus documentos PDF electrónicamente dibujando, escribiendo o subiendo tu firma, todo en tu navegador y sin subir archivos.',
      answerLead:
        'Sí: PDFEdit te permite firmar PDF dibujando o escribiendo tu firma en tu navegador; el documento nunca sale de tu dispositivo.',
      answerHeading: 'Firmar PDF funciona en tu navegador: nada se sube',
      answerBody:
        'Crea tu firma dibujándola con el ratón o el dedo, escribiendo tu nombre o subiendo una imagen, colócala donde necesites en el documento y descarga el PDF firmado.',
      processingNote: '100 % privado · La firma nunca sale de tu dispositivo',
      stepsHeading: 'Cómo firmar un PDF en 3 pasos',
      steps: [
        {
          title: 'Abre tu documento PDF',
          description:
            'Selecciona el PDF que necesitas firmar. Solo se abre en tu navegador.',
        },
        {
          title: 'Crea tu firma',
          description:
            'Dibuja tu firma, escríbela con un estilo de letra manuscrita o sube una imagen de tu firma.',
        },
        {
          title: 'Colócala y descarga',
          description:
            'Arrastra la firma al lugar exacto del documento y descarga tu PDF firmado.',
        },
      ],
      privacyHeading: 'Privacidad y estándares de la arquitectura sin servidor',
      privacyBullets: [
        'Espacio de memoria aislado',
        'Cero almacenamiento en la nube',
        'Tu firma nunca se transmite',
        'Sin límites de uso',
      ],
      faqHeading: 'Preguntas frecuentes sobre Firmar PDF',
      faqs: [
        {
          question: '¿La firma electrónica es válida?',
          answer:
            'Para la mayoría de usos cotidianos —contratos, formularios, autorizaciones— una firma electrónica es aceptada. Para documentos con requisitos legales estrictos, consulta la normativa de tu país.',
        },
        {
          question: '¿Puedo firmar varias veces el mismo documento?',
          answer:
            'Sí. Puedes colocar tu firma en varias páginas o añadir firmas de distintas personas en el mismo PDF.',
        },
        {
          question: '¿Mi firma se guarda en algún servidor?',
          answer:
            'No. Tu firma se crea y se aplica localmente en tu navegador; nunca se envía a ningún servidor.',
        },
      ],
      relatedToolsHeading: 'Herramientas PDF relacionadas',
      relatedGuidesHeading: 'Guías relacionadas',
      relatedGuidesNote: 'Tutoriales paso a paso del blog de PDFEdit (en inglés).',
      backLabel: 'Volver a las herramientas',
      homeLabel: 'Inicio',
      zeroUploadsLabel: 'Cero subidas al servidor',
    },
  },
};
