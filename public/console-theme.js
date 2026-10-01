// Console theme before first paint (CONSOLE §10.2): the stored choice, if any, becomes
// <html data-console-theme>. Storage can be disabled; then the system preference applies.
try {
  var t = window.localStorage.getItem('mb-console-theme')
  if (t === 'light' || t === 'dark') document.documentElement.dataset.consoleTheme = t
} catch (e) {}
