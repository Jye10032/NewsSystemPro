/**
 * Polyfills for axios compatibility in browser environments
 *
 * axios 1.13.2 tries to destructure Request and Response from utils.global
 * but in some build configurations, this can fail. This polyfill ensures
 * these APIs are available on the global object before axios is loaded.
 */

// Ensure global object is properly defined
if (typeof globalThis === 'undefined') {
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
  globalThis.Request = globalThis.Request || window.Request || class Request {}
  globalThis.Response = globalThis.Response || window.Response || class Response {}
}
