/**
 * Polyfills for axios compatibility in browser environments
 *
 * axios 1.13.2 tries to destructure Request and Response from utils.global
 * but in some build configurations, this can fail. This polyfill ensures
 * these APIs are available on the global object before axios is loaded.
 */

console.log('=== Polyfill Debug Info ===');
console.log('typeof globalThis:', typeof globalThis);
console.log('typeof window:', typeof window);
console.log('typeof global:', typeof global);
console.log('typeof self:', typeof self);
console.log('window.Request:', window.Request);
console.log('window.Response:', window.Response);

// Ensure global object is properly defined
if (typeof globalThis === 'undefined') {
  console.log('globalThis is undefined, attempting to define it');
  if (typeof window !== 'undefined') {
    window.globalThis = window
  } else if (typeof global !== 'undefined') {
    global.globalThis = global
  } else if (typeof self !== 'undefined') {
    self.globalThis = self
  }
}

// Ensure Request and Response are available globally
if (typeof globalThis !== 'undefined') {
  console.log('Setting Request and Response on globalThis');
  globalThis.Request = globalThis.Request || window.Request || class Request {}
  globalThis.Response = globalThis.Response || window.Response || class Response {}
  console.log('globalThis.Request:', globalThis.Request);
  console.log('globalThis.Response:', globalThis.Response);
}

// Also set on window and global for maximum compatibility
if (typeof window !== 'undefined') {
  window.Request = window.Request || class Request {}
  window.Response = window.Response || class Response {}
  console.log('After setting - window.Request:', window.Request);
  console.log('After setting - window.Response:', window.Response);
}

// Check what axios utils.global will resolve to
const testGlobal = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  return undefined;
})();

console.log('testGlobal:', testGlobal);
console.log('testGlobal.Request:', testGlobal?.Request);
console.log('testGlobal.Response:', testGlobal?.Response);
console.log('=== End Polyfill Debug ===');
