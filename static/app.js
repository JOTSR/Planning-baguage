// static/app.ts
if ("serviceWorker" in navigator) {
  try {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    });
  } catch (error) {
    console.error(`Registration failed: ${error}`);
  }
}
//# sourceMappingURL=app.js.map
