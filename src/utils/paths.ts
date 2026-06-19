export function withBase(path: string) {
	if (!path || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('#') || path.startsWith('javascript:')) {
		return path;
	}

	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${base}${normalizedPath}` || '/';
}
