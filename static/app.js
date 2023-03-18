if("serviceWorker"in navigator)try{await navigator.serviceWorker.register("/sw.js",{scope:"/"})}catch(r){console.error(`Registration failed: ${r}`)}
