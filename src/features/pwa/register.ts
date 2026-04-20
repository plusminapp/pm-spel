export function kanServiceWorkerRegistreren(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}

export async function registreerServiceWorker(): Promise<void> {
  if (!kanServiceWorkerRegistreren()) {
    return
  }

  await navigator.serviceWorker.register('/sw.js')
}