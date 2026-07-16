/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEMORIES_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
