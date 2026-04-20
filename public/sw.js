const CACHE_NAAM = 'plusmin-spel-app-shell-v1'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAAM).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAAM).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached
      }

      return fetch(event.request)
        .then((response) => {
          if (!response.ok || response.type === 'opaque') {
            return response
          }

          const clone = response.clone()
          void caches.open(CACHE_NAAM).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match('/'))
    }),
  )
})