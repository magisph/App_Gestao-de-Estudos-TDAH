// Service Worker para PWA Gestão de Estudos
// Versão: 1.0.0

const CACHE_NAME = 'gestao-estudos-v1';
const DATA_CACHE_NAME = 'gestao-estudos-data-v1';

// Recursos para cache inicial
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
  '/manifest.json'
];

// URLs de dados que devem ser cached
const DATA_CACHE_URLS = [
  '/api/',
  '/data/'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Forçar ativação imediata
        return self.skipWaiting();
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remover caches antigos
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar controle de todas as páginas
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégia para recursos estáticos
  if (request.method === 'GET' && (
    request.destination === 'document' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image'
  )) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Retornar do cache e atualizar em background
            fetch(request).then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                cache.put(request, fetchResponse.clone());
              }
            }).catch(() => {
              // Ignorar erros de rede em background
            });
            return cachedResponse;
          }
          
          // Não está no cache, buscar da rede
          return fetch(request).then((fetchResponse) => {
            if (fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          }).catch(() => {
            // Se offline, retornar página offline para documentos
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
            throw new Error('Recurso não disponível offline');
          });
        });
      })
    );
    return;
  }
  
  // Estratégia para dados da aplicação
  if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request).then((fetchResponse) => {
          if (fetchResponse.status === 200) {
            cache.put(request, fetchResponse.clone());
          }
          return fetchResponse;
        }).catch(() => {
          // Se offline, retornar do cache
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            throw new Error('Dados não disponíveis offline');
          });
        });
      })
    );
    return;
  }
  
  // Para outras requisições, usar estratégia padrão
  event.respondWith(fetch(request));
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Evento de sincronização:', event.tag);
  
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions());
  }
});

// Função para sincronizar sessões quando voltar online
async function syncSessions() {
  try {
    // Aqui você implementaria a lógica para sincronizar
    // dados locais com o servidor quando voltar online
    console.log('[SW] Sincronizando sessões...');
    
    // Exemplo: buscar dados do IndexedDB e enviar para servidor
    // const sessions = await getUnsyncedSessions();
    // await uploadSessions(sessions);
    
    console.log('[SW] Sincronização concluída');
  } catch (error) {
    console.error('[SW] Erro na sincronização:', error);
  }
}

// Notificações push (se necessário no futuro)
self.addEventListener('push', (event) => {
  console.log('[SW] Notificação push recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Gestão de Estudos', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clique em notificação:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
});

// Tratamento de erros
self.addEventListener('error', (event) => {
  console.error('[SW] Erro no Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Promise rejeitada:', event.reason);
});

console.log('[SW] Service Worker carregado - Versão 1.0.0');

