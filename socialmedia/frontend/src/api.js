const API_BASE = window.API_BASE || 'http://localhost:3000';

const buildUrl = (path, params = {}) => {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

const api = {
  login: async (email, password, nextParam) => {
    const url = buildUrl('/api/auth/login', nextParam ? { next: nextParam } : {});
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, next: nextParam })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },
  logout: async () => {
    const url = buildUrl('/api/auth/logout');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include'
    });
    return res.json();
  },
  getProfile: async (id) => {
    const url = buildUrl(`/api/users/${id}`);
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Unable to load profile');
    return res.json();
  },
  updateProfile: async (id, payload) => {
    const url = buildUrl(`/api/users/${id}`);
    const res = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  listFriends: async () => {
    const url = buildUrl('/api/friends');
    const res = await fetch(url, { credentials: 'include' });
    return res.json();
  },
  addFriend: async (friendId, nickname) => {
    const url = buildUrl('/api/friends/add');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId, nickname })
    });
    return res.json();
  },
  removeFriend: async (id) => {
    const url = buildUrl(`/api/friends/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res.json();
  },
  getMessages: async (userId) => {
    const url = buildUrl('/api/messages', { userId });
    const res = await fetch(url, { credentials: 'include' });
    return res.json();
  },
  sendMessage: async (payload) => {
    const url = buildUrl('/api/messages/send');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  searchUsers: async (q) => {
    const url = buildUrl('/api/search', { q });
    const res = await fetch(url, { credentials: 'include' });
    return res.json();
  },
  getPhoto: async (filename) => {
    const url = buildUrl(`/api/photos/${filename}`);
    return fetch(url, { credentials: 'include' });
  },
  listPhotosByUser: async (userId) => {
    const url = buildUrl(`/api/photos/user/${userId}`);
    const res = await fetch(url, { credentials: 'include' });
    return res.json();
  },
  publishPhoto: async (payload) => {
    const url = buildUrl('/api/photos/publish');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Publish failed' }));
      throw new Error(error.message || 'Publish failed');
    }
    return res.json();
  },
  deletePhoto: async (id) => {
    const url = buildUrl(`/api/photos/item/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(error.message || 'Delete failed');
    }
    return res.json();
  },
  setBlockStatus: async (userId, blocked) => {
    const url = buildUrl(`/api/admin/users/${userId}/block`);
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Update failed' }));
      throw new Error(error.message || 'Update failed');
    }
    return res.json();
  },
  adminListFiles: async () => {
    const url = buildUrl('/api/admin/files');
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Unable to load admin files');
    return res.json();
  },
  adminUploadFile: async (payload) => {
    const url = buildUrl('/api/admin/files/upload');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }
    return res.json();
  },
  adminDeleteFile: async (name) => {
    const url = buildUrl(`/api/admin/files/${encodeURIComponent(name)}`);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(error.message || 'Delete failed');
    }
    return res.json();
  },
  fetchFeed: async () => {
    const url = buildUrl('/api/posts/feed');
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Unable to load feed');
    return res.json();
  },
  createPost: async (content) => {
    const url = buildUrl('/api/posts');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Post failed' }));
      throw new Error(error.message || 'Post failed');
    }
    return res.json();
  },
  updatePost: async (id, content) => {
    const url = buildUrl(`/api/posts/${id}`);
    const res = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Update failed' }));
      throw new Error(error.message || 'Update failed');
    }
    return res.json();
  },
  deletePost: async (id) => {
    const url = buildUrl(`/api/posts/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(error.message || 'Delete failed');
    }
    return res.json();
  },
  updateSettings: async (payload) => {
    const url = buildUrl('/api/settings/update');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  getNotifications: async (nextParam) => {
    const url = buildUrl('/api/notifications', nextParam ? { next: nextParam } : {});
    const res = await fetch(url, { credentials: 'include' });
    return res.json();
  }
};

window.api = api;
window.buildUrl = buildUrl;
