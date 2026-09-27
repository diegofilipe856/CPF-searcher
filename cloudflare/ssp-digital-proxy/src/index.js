const PREFIX = '/personal-projects/ssp-digital';
const PAGES_ORIGIN = 'https://ssp-digital-project.pages.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === PREFIX) {
      url.protocol = 'https:';
      url.pathname += '/';
      return Response.redirect(url.toString(), 308);
    }

    if (!url.pathname.startsWith(`${PREFIX}/`)) {
      return new Response('Not found', { status: 404 });
    }

    const upstream = new URL(PAGES_ORIGIN);
    upstream.pathname = url.pathname.slice(PREFIX.length);
    upstream.search = url.search;
    const response = await fetch(new Request(upstream, request), { redirect: 'manual' });
    const headers = new Headers(response.headers);
    const location = headers.get('location');

    if (location) {
      const target = new URL(location, upstream);
      if (target.origin === PAGES_ORIGIN) {
        target.protocol = 'https:';
        target.host = url.host;
        target.pathname = PREFIX + target.pathname;
        headers.set('location', target.toString());
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
