if("serviceWorker"in navigator)try{let e=await navigator.serviceWorker.register("/sw.js",{scope:"/"}),r=await o(e);await fetch("/api/webpush",{method:"POST",headers:{"Content-type":"application/json"},body:JSON.stringify({subscription:r})})}catch(e){console.error(`Registration failed: ${e}`)}async function o(e){let r=await e.pushManager.getSubscription();if(r)return r;let t=await fetch("/api/webpush",{method:"GET",headers:{accept:"application/json"}}),{data:i,message:s}=await t.json();if(!t.ok)throw new Error(s);let{pub:a}=i;return e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:a})}
