// The files src/embed.ts imports `with { type: 'text' }`: esbuild inlines each as a string.
declare module '*.html' {
  const text: string;
  export default text;
}
declare module '*.css' {
  const text: string;
  export default text;
}
