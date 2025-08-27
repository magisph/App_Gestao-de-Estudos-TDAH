// Utilitários PWA para o aplicativo de Gestão de Estudos

// Gerar manifest.json dinamicamente
export const generateManifest = () => {
  const manifest = {
    name: "Gestão de Estudos - TJ-CE",
    short_name: "Gestão Estudos",
    description: "PWA de produtividade para estudantes com TDAH - Preparação para provas do TJ-CE",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    orientation: "portrait-primary",
    scope: "/",
    lang: "pt-BR",
    categories: ["education", "productivity", "utilities"],
    icons: [
      {
        src: "https://placehold.co/72x72/059669/ffffff?text=GE",
        sizes: "72x72",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "https://placehold.co/96x96/059669/ffffff?text=GE",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "https://placehold.co/128x128/059669/ffffff?text=GE",
        sizes: "128x128",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "https://placehold.co/144x144/059669/ffffff?text=GE",
        sizes: "144x144",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "https://placehold.co/152x152/059669/ffffff?text=GE",
        sizes: "152x152",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "https://placehold.co/192x192/059669/ffffff?text=GE",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "https://placehold.co/384x384/059669/ffffff?text=GE",
        sizes: "384x384",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "https://placehold.co/512x512/059669/ffffff?text=GE",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    shortcuts: [
      {
        name: "Nova Sessão",
        short_name: "Sessão",
        description: "Iniciar uma nova sessão de estudo",
        url: "/?action=new-session",
        icons: [
          {
            src: "https://placehold.co/96x96/2563eb/ffffff?text=S",
            sizes: "96x96"
          }
        ]
      },
      {
        name: "Calendário",
        short_name: "Calendário",
        description: "Ver cronograma de estudos",
        url: "/?view=calendar",
        icons: [
          {
            src: "https://placehold.co/96x96/7c3aed/ffffff?text=C",
            sizes: "96x96"
          }
        ]
      },
      {
        name: "Progresso",
        short_name: "Progresso",
        description: "Visualizar progresso dos estudos",
        url: "/?view=progress",
        icons: [
          {
            src: "https://placehold.co/96x96/dc2626/ffffff?text=P",
            sizes: "96x96"
          }
        ]
      }
    ]
  };
  
  return manifest;
};

// Registrar manifest dinamicamente
export const registerManifest = () => {
  const manifest = generateManifest();
  const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: 'application/json'
  });
  const manifestURL = URL.createObjectURL(manifestBlob);
  
  // Remover manifest anterior se existir
  const existingLink = document.querySelector('link[rel="manifest"]');
  if (existingLink) {
    existingLink.remove();
  }
  
  // Adicionar novo manifest
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = manifestURL;
  document.head.appendChild(link);
  
  return manifestURL;
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registrado com sucesso:', registration);
      
      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              console.log('Nova versão do app disponível');
              // Aqui poderia mostrar uma notificação para o usuário
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return null;
    }
  } else {
    console.log('Service Worker não suportado neste navegador');
    return null;
  }
};

// Verificar se o app está instalado
export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Detectar se está offline
export const isOffline = () => {
  return !navigator.onLine;
};

// Configurar listeners para eventos PWA
export const setupPWAListeners = (dispatch, actions) => {
  // Listener para mudanças de conectividade
  const handleOnline = () => {
    console.log('Aplicativo online');
    // Sincronizar dados quando voltar online
  };
  
  const handleOffline = () => {
    console.log('Aplicativo offline');
    // Mostrar indicador offline
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Listener para beforeinstallprompt
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    // O evento será capturado pelo Header component
    window.deferredPrompt = e;
  };
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  
  // Listener para appinstalled
  const handleAppInstalled = () => {
    console.log('App instalado com sucesso');
    window.deferredPrompt = null;
  };
  
  window.addEventListener('appinstalled', handleAppInstalled);
  
  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  };
};

// Verificar suporte a PWA
export const checkPWASupport = () => {
  const support = {
    serviceWorker: 'serviceWorker' in navigator,
    manifest: 'manifest' in document.createElement('link'),
    beforeInstallPrompt: 'onbeforeinstallprompt' in window,
    standalone: 'standalone' in window.navigator,
    fullscreen: 'requestFullscreen' in document.documentElement
  };
  
  return support;
};

// Configurações de cache para diferentes tipos de recursos
export const getCacheConfig = () => {
  return {
    // Cache de assets estáticos (longa duração)
    static: {
      name: 'gestao-estudos-static-v1',
      urls: [
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/manifest.json'
      ],
      strategy: 'CacheFirst',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
    },
    
    // Cache de dados da aplicação (média duração)
    data: {
      name: 'gestao-estudos-data-v1',
      strategy: 'NetworkFirst',
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    },
    
    // Cache de imagens (longa duração)
    images: {
      name: 'gestao-estudos-images-v1',
      strategy: 'CacheFirst',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    }
  };
};

// Inicializar PWA
export const initializePWA = async (dispatch, actions) => {
  try {
    // Registrar manifest
    registerManifest();
    
    // Registrar service worker
    await registerServiceWorker();
    
    // Configurar listeners
    const cleanup = setupPWAListeners(dispatch, actions);
    
    // Verificar suporte
    const support = checkPWASupport();
    console.log('Suporte PWA:', support);
    
    // Verificar se está instalado
    const installed = isAppInstalled();
    console.log('App instalado:', installed);
    
    return { success: true, support, installed, cleanup };
  } catch (error) {
    console.error('Erro ao inicializar PWA:', error);
    return { success: false, error };
  }
};

