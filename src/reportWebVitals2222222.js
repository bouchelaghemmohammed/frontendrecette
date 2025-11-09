// src/reportWebVitals.js
// Export par défaut d'une fonction qui accepte un callback onPerfEntry
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch((err) => {
      // en dev, silent fail si web-vitals indisponible
      // console.warn('web-vitals import failed', err);
    });
  }
};

export default reportWebVitals;