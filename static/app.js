// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

if ('serviceWorker' in navigator) {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        const subscription = await getOrSubscribe(registration);
        await fetch('/api/webpush', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                subscription
            })
        });
    } catch (error) {
        console.error(`Registration failed: ${error}`);
    }
}
async function getOrSubscribe(registration) {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) return subscription;
    const request = await fetch('/api/webpush', {
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    });
    const { data , message  } = await request.json();
    if (!request.ok) {
        throw new Error(message);
    }
    const { pub  } = data;
    return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: pub
    });
}
