// localStorage and sessionStorage that never throw. Storage can be blocked
// (private windows, strict privacy settings) and doesn't exist while
// prerendering; then reads return null and writes are quietly dropped,
// so the site simply forgets.

function wrap(name) {
  return {
    get(key) {
      try {
        return window[name].getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window[name].setItem(key, value);
      } catch {
        // blocked: nothing is remembered
      }
    },
    remove(key) {
      try {
        window[name].removeItem(key);
      } catch {
        // blocked: there was nothing to forget
      }
    },
  };
}

export const local = wrap("localStorage");
export const session = wrap("sessionStorage");
