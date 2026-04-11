/// <reference types="vite/client" />

declare global {
  interface Window {
    go?: {
      main?: {
        App?: unknown
      }
    }
    runtime?: unknown
  }
}

export {}
