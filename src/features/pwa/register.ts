export function kanServiceWorkerRegistreren(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}

async function deregistreerServiceWorkersInDev(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.unregister()))
}

export async function registreerServiceWorker(isProductie = import.meta.env.PROD): Promise<void> {
  if (!kanServiceWorkerRegistreren()) {
    return
  }

  if (!isProductie) {
    await deregistreerServiceWorkersInDev()
    return
  }

  await navigator.serviceWorker.register('/sw.js')
}