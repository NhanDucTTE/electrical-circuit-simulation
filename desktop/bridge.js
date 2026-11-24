(() => {
  if (window.top !== window || location.origin !== 'https://mophongtudien.local.invalid') return;
  const channel = window.chrome.webview;
  const pending = new Map();
  let nextId = 0;

  channel.addEventListener('message', ({ data }) => {
    const call = pending.get(data.id);
    if (!call) return;
    pending.delete(data.id);
    if (data.ok) call.resolve(data.value);
    else call.reject(new Error(data.error));
  });

  function invoke(method, payload) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      try {
        channel.postMessage({ id, method, ...payload });
      } catch (error) {
        pending.delete(id);
        reject(error);
      }
    });
  }

  Object.defineProperty(window, 'desktop', {
    value: Object.freeze({
      openProject: () => invoke('openProject'),
      setLanguage: (language) => invoke('setLanguage', { language }),
      copyText: (text) => invoke('copyText', { text }),
      saveProject: (text, path, openPaths = []) => invoke('saveProject', { text, path, openPaths }),
      exportBomCsv: (name, text) => invoke('exportBomCsv', { name, text }),
      exportDrawing: (format, name, scene) => invoke('exportDrawing', { format, name, scene }),
      openExample: (slug) => invoke('openExample', { slug }),
      confirmDiscard: () => invoke('confirmDiscard'),
      setDirty: (dirty) => invoke('setDirty', { dirty }),
      getRecovery: () => invoke('getRecovery'),
      setRecovery: (text) => invoke('setRecovery', { text })
    })
  });
})();
