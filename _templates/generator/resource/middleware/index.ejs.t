---
to: "<%= `${h.getResourcePath(resource, path)}/middleware/index.ts` %>"
---
export { default as Get<%= Resource = h.changeCase.pascalCase(resource) %>Middleware } from './Get<%= Resource %>';
