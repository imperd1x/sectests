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

const readJsonSafely = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    return { raw: text };
  }
};

const handleJsonResponse = async (res, fallbackMessage = 'Request failed') => {
  const data = await readJsonSafely(res);
  if (!res.ok) {
    const message = data.error || data.message || fallbackMessage;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
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
    return handleJsonResponse(res, 'Login failed');
  },
  logout: async () => {
    const url = buildUrl('/api/auth/logout');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include'
    });
    return handleJsonResponse(res, 'Logout failed');
  },
  getProfile: async (id) => {
    const url = buildUrl(`/api/users/${id}`);
    const res = await fetch(url, { credentials: 'include' });
    return handleJsonResponse(res, 'Unable to load profile');
  },
  updateProfile: async (id, payload) => {
    const url = buildUrl(`/api/users/${id}`);
    const res = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse(res, 'Profile update failed');
  },
  listFriends: async () => {
    const url = buildUrl('/api/friends');
    const res = await fetch(url, { credentials: 'include' });
    return handleJsonResponse(res, 'Unable to load friends');
  },
  addFriend: async (friendId, nickname) => {
    const url = buildUrl('/api/friends/add');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId, nickname })
    });
    return handleJsonResponse(res, 'Add friend failed');
  },
  removeFriend: async (id) => {
    const url = buildUrl(`/api/friends/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleJsonResponse(res, 'Remove friend failed');
  },
  getMessages: async (userId) => {
    const url = buildUrl('/api/messages', { userId });
    const res = await fetch(url, { credentials: 'include' });
    return handleJsonResponse(res, 'Unable to load messages');
  },
  sendMessage: async (payload) => {
    const url = buildUrl('/api/messages/send');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse(res, 'Send message failed');
  },
  searchUsers: async (q) => {
    const url = buildUrl('/api/search', { q });
    const res = await fetch(url, { credentials: 'include' });
    return handleJsonResponse(res, 'Search failed');
  },
  getPhoto: async (filename) => {
    const url = buildUrl(`/api/photos/${filename}`);
    return fetch(url, { credentials: 'include' });
  },
  listPhotosByUser: async (userId) => {
    const url = buildUrl(`/api/photos/user/${userId}`);
    const res = await fetch(url, { credentials: 'include' });
    return handleJsonResponse(res, 'Unable to load photos');
  },
  publishPhoto: async (payload) => {
    const url = buildUrl('/api/photos/publish');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse(res, 'Publish failed');
  },
  deletePhoto: async (id) => {
    const url = buildUrl(`/api/photos/item/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleJsonResponse(res, 'Delete failed');
  },
  setBlockStatus: async (userId, blocked) => {
    const url = buildUrl(`/api/admin/users/${userId}/block`);
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked })
    });
    return handleJsonResponse(res, 'Update failed');
  },
  adminListFiles: async () => {
    const url = buildUrl('/api/admin/files');
    const res = await fetch(url, { credentials: 'include' });
    return handleJsonResponse(res, 'Unable to load admin files');
  },
  adminUploadFile: async (payload) => {
    const url = buildUrl('/api/admin/files/upload');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse(res, 'Upload failed');
  },
  adminDeleteFile: async (name) => {
    const url = buildUrl(`/api/admin/files/${encodeURIComponent(name)}`);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleJsonResponse(res, 'Delete failed');
  },
  fetchFeed: async () => {
    const url = buildUrl('/api/posts/feed');
    const res = await fetch(url, { credentials: 'include' });
    return handleJsonResponse(res, 'Unable to load feed');
  },
  createPost: async (content) => {
    const url = buildUrl('/api/posts');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return handleJsonResponse(res, 'Post failed');
  },
  updatePost: async (id, content) => {
    const url = buildUrl(`/api/posts/${id}`);
    const res = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return handleJsonResponse(res, 'Update failed');
  },
  deletePost: async (id) => {
    const url = buildUrl(`/api/posts/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleJsonResponse(res, 'Delete failed');
  },
  updateSettings: async (payload) => {
    const url = buildUrl('/api/settings/update');
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleJsonResponse(res, 'Settings update failed');
  },
  getNotifications: async (nextParam) => {
    const url = buildUrl('/api/notifications', nextParam ? { next: nextParam } : {});
    const res = await fetch(url, { credentials: 'include' });
    return handleJsonResponse(res, 'Unable to load notifications');
  }
};

window.api = api;
window.buildUrl = buildUrl;
