// Only www requests invoke this Worker; apex pages remain static assets.
addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (!['www.solostack.au'].includes(url.hostname)) {
    event.respondWith(new Response('Not found', {status: 404}));
    return;
  }
  // Let Pages answer certificate-validation requests directly.
  if (url.pathname.startsWith('/.well-known/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  url.protocol = 'https:';
  url.hostname = url.hostname.slice(4);
  event.respondWith(Promise.resolve(Response.redirect(url.toString(), 301)));
});
