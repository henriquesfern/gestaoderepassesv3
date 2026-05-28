declare module '*?raw' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_FONTE_PROJETOS_RUNTIME?: 'legado' | 'dados-vivos';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
