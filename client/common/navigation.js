export function navigate(path = '/') {
  const url = new URL(location);
  url.pathname = path;
  location.replace(url.href);
}
