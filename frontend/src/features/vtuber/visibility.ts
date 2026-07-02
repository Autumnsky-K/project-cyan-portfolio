export function isVtuberVisiblePath(pathname: string): boolean {
  return pathname === '/goods' || pathname === '/cart' || /^\/goods\/\d+$/.test(pathname)
}
