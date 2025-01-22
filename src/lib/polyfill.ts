// Polyfill for Draft.js global object
if (typeof global === 'undefined') {
  (window as any).global = window;
}

export {}; 