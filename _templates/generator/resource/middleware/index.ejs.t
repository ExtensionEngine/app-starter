---
to: "<%= `${h.getResourcePath(resource, path)}/middleware/index.ts` %>"
---
export { default as Get<%= Resource = h.capitalize(resource) %>Middleware } from './Get<%= Resource %>';
