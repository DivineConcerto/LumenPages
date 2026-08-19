const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function createOptions(method = 'GET', body, token) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || '请求失败，请稍后再试。');
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getSite: () => request('/site'),
  getReleases: () => request('/releases'),
  getPosts: () => request('/posts'),
  getPost: (slug) => request(`/posts/${slug}`),

  login: (payload) => request('/admin/login', createOptions('POST', payload)),
  getAdminSite: (token) => request('/admin/site', createOptions('GET', null, token)),
  saveSite: (payload, token) => request('/admin/site', createOptions('PUT', payload, token)),
  getAdminReleases: (token) => request('/admin/releases', createOptions('GET', null, token)),
  createRelease: (payload, token) => request('/admin/releases', createOptions('POST', payload, token)),
  updateRelease: (id, payload, token) => request(`/admin/releases/${id}`, createOptions('PUT', payload, token)),
  deleteRelease: (id, token) => request(`/admin/releases/${id}`, createOptions('DELETE', null, token)),
  getAdminPosts: (token) => request('/admin/posts', createOptions('GET', null, token)),
  createPost: (payload, token) => request('/admin/posts', createOptions('POST', payload, token)),
  updatePost: (id, payload, token) => request(`/admin/posts/${id}`, createOptions('PUT', payload, token)),
  deletePost: (id, token) => request(`/admin/posts/${id}`, createOptions('DELETE', null, token)),
  changePassword: (payload, token) => request('/admin/password', createOptions('PUT', payload, token))
};
