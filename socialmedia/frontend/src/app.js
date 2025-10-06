const params = new URLSearchParams(window.location.search);
const nextParam = params.get('next');
let state = {
  currentUser: null,
  view: params.get('view') || 'profile'
};

const API_ORIGIN = window.API_BASE || 'http://localhost:3000';
const STATIC_PHOTO_BASE = `${API_ORIGIN}/static-photos`;
const FALLBACK_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

const formatAvatarBasename = (id) => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return null;
  }
  return `avatar_${String(numericId).padStart(3, '0')}`;
};

const applyAvatarToElement = (img, id, altText) => {
  if (!img) return;
  img.alt = altText || img.alt || 'User avatar';
  const baseName = formatAvatarBasename(id);
  if (!baseName) {
    img.onerror = null;
    img.src = FALLBACK_AVATAR;
    return;
  }

  const pngUrl = `${STATIC_PHOTO_BASE}/${baseName}.png`;
  const jpgUrl = `${STATIC_PHOTO_BASE}/${baseName}.jpg`;
  img.src = pngUrl;
  img.onerror = () => {
    if (img.src === pngUrl) {
      img.src = jpgUrl;
      return;
    }
    img.onerror = null;
    img.src = FALLBACK_AVATAR;
  };
};

const hydrateAvatarImages = (root) => {
  const scope = root || document;
  scope.querySelectorAll('img[data-avatar-user-id]').forEach((img) => {
    const userId = img.getAttribute('data-avatar-user-id');
    const alt = img.getAttribute('data-avatar-alt') || img.alt;
    applyAvatarToElement(img, userId, alt);
  });
};

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app');
const navList = document.getElementById('nav-links');
let navLinks = [];
const viewContainer = document.getElementById('view-container');
const userEmailDisplay = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const loginForm = document.getElementById('login-form');
const loginEmailInput = loginForm.querySelector('input[name="email"]');
const loginPasswordInput = loginForm.querySelector('input[name="password"]');
const accountButtons = document.querySelectorAll('.prefill-account');
const NAV_CONFIG = {
  user: [
    { view: 'profile', label: 'Profile' },
    { view: 'friends', label: 'Friends' },
    { view: 'timeline', label: 'Timeline' },
    { view: 'messages', label: 'Messages' },
    { view: 'search', label: 'Search' },
    { view: 'photos', label: 'Photos' },
    { view: 'settings', label: 'Settings' },
    { view: 'public-profile', label: 'Public Profile', hidden: true }
  ],
  admin: [
    { view: 'admin-dashboard', label: 'Dashboard' },
    { view: 'admin-users', label: 'User Directory' },
    { view: 'admin-files', label: 'File Uploads' },
    { view: 'admin-logs', label: 'System Logs' },
    { view: 'settings', label: 'Settings' }
  ]
};
const defaultViewForRole = (role) => (role === 'admin' ? 'admin-dashboard' : 'profile');
const getNavConfig = () => NAV_CONFIG[state.currentUser?.role === 'admin' ? 'admin' : 'user'];
const getAllowedViews = () => getNavConfig().map((item) => item.view);

const buildNavigation = () => {
  const config = getNavConfig();
  navList.innerHTML = config
    .filter((item) => !item.hidden)
    .map((item) => `<li><a data-view="${item.view}" href="#">${item.label}</a></li>`)
    .join('');
  navLinks = Array.from(navList.querySelectorAll('a'));
  setNavLinks();
  bindNavEvents();
  highlightActiveNav();
};

accountButtons.forEach((button) => {
  button.addEventListener('click', () => {
    accountButtons.forEach((b) => b.classList.remove('selected'));
    button.classList.add('selected');
    loginEmailInput.value = button.dataset.email;
    loginPasswordInput.value = button.dataset.password;
  });
});

const setNavLinks = () => {
  navLinks.forEach((link) => {
    const view = link.dataset.view;
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    if (nextParam) {
      url.searchParams.set('next', nextParam);
    } else {
      url.searchParams.delete('next');
    }
    link.href = url.toString();
  });
};

const highlightActiveNav = () => {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.view === state.view);
  });
};

const persistState = () => {
  localStorage.setItem('insecure-social-user', JSON.stringify(state.currentUser));
};

const restoreState = async () => {
  const stored = localStorage.getItem('insecure-social-user');
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    const profile = await api.getProfile(parsed.id);
    state.currentUser = profile;
    onAuthenticated();
  } catch (err) {
    console.warn('Unable to restore session', err);
    localStorage.removeItem('insecure-social-user');
  }
};

const loadView = async (view) => {
  const allowedViews = getAllowedViews();
  const fallbackView = defaultViewForRole(state.currentUser?.role || 'user');
  if (!allowedViews.includes(view)) {
    view = fallbackView;
  }
  state.view = view;
  const url = `views/${view}.html`;
  const res = await fetch(url);
  const html = await res.text();
  viewContainer.innerHTML = html;
  highlightActiveNav();
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get('view') !== view) {
    currentUrl.searchParams.set('view', view);
    history.replaceState({}, '', currentUrl.toString());
  }
  attachViewHandlers(view);
};

const attachViewHandlers = (view) => {
  switch (view) {
    case 'profile':
      setupProfileView();
      break;
    case 'friends':
      setupFriendsView();
      break;
    case 'messages':
      setupMessagesView();
      break;
    case 'search':
      setupSearchView();
      break;
    case 'timeline':
      setupTimelineView();
      break;
    case 'photos':
      setupPhotosView();
      break;
    case 'settings':
      setupSettingsView();
      break;
    case 'notifications':
      setupNotificationsView();
      break;
    case 'admin-dashboard':
      setupAdminDashboard();
      break;
    case 'admin-users':
      setupAdminUsers();
      break;
    case 'admin-files':
      setupAdminFiles();
      break;
    case 'admin-logs':
      setupAdminLogs();
      break;
    case 'public-profile':
      setupPublicProfileView();
      break;
    default:
      break;
  }
};

const requireUser = () => {
  if (!state.currentUser) {
    throw new Error('Not logged in');
  }
  return state.currentUser;
};

const onAuthenticated = () => {
  loginContainer.classList.add('hidden');
  appContainer.classList.remove('hidden');
  userEmailDisplay.textContent = state.currentUser.email;
  persistState();
  if (!state.view || !getAllowedViews().includes(state.view)) {
    state.view = defaultViewForRole(state.currentUser.role);
  }
  buildNavigation();
  const url = new URL(window.location.href);
  url.searchParams.set('view', state.view);
  history.replaceState({}, '', url.toString());
  loadView(state.view);
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = formData.get('email');
  const password = formData.get('password');
  try {
    const response = await api.login(email, password, nextParam);
    state.currentUser = response.user;
    onAuthenticated();
    if (response.next) {
      // VULN: open redirect handled by notifications view, but we also honor next immediately.
      window.location.href = response.next;
    }
  } catch (err) {
    alert(err.message || 'Login failed.');
  }
});

logoutButton.addEventListener('click', async () => {
  await api.logout();
  state.currentUser = null;
  localStorage.removeItem('insecure-social-user');
  appContainer.classList.add('hidden');
  loginContainer.classList.remove('hidden');
});

const bindNavEvents = () => {
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const view = link.dataset.view;
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      history.pushState({}, '', url.toString());
      loadView(view);
    });
  });
};

window.addEventListener('popstate', () => {
  const url = new URL(window.location.href);
  const view = url.searchParams.get('view') || 'profile';
  loadView(view);
});

const setupProfileView = async () => {
  const user = requireUser();
  if (user.role === 'admin') {
    const container = document.querySelector('.profile-view');
    if (container) {
      container.innerHTML = '<h2>Profile Disabled</h2><p>Admin accounts manage the platform but do not expose a public profile.</p>';
    }
    return;
  }
  const avatar = document.getElementById('profile-avatar');
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const roleEl = document.getElementById('profile-role');
  const bioEl = document.getElementById('profile-bio');
  const idDisplay = document.getElementById('profile-id-display');
  const photoGallery = document.getElementById('profile-photo-gallery');
  let activeProfileId = user.id;

  const renderPhotos = (photos, isOwner) => {
    if (!photoGallery) return;
    if (!photos.length) {
      photoGallery.innerHTML = '<div class="photo-empty">No photos published yet.</div>';
      return;
    }
    photoGallery.innerHTML = photos
      .map((photo) => `
        <figure class="photo-card">
          <img src="${window.API_BASE}/api/photos/${encodeURIComponent(photo.filename)}" alt="${photo.description || photo.filename}">
          <figcaption>${photo.description || 'Untitled photo'}<br><small>${new Date(photo.created_at).toLocaleString()}</small></figcaption>
          ${isOwner ? '<div class="photo-card-actions"><span class="search-status">Visible to everyone</span></div>' : ''}
        </figure>`)
      .join('');
  };

  const loadProfilePhotos = async (id) => {
    if (!photoGallery) return;
    try {
      const photos = await api.listPhotosByUser(id);
      renderPhotos(photos, Number(id) === Number(state.currentUser.id));
    } catch (err) {
      console.warn('Failed to load photos', err);
      photoGallery.innerHTML = '<div class="photo-empty">Unable to load photos.</div>';
    }
  };

  const renderProfile = (profile) => {
    idDisplay.textContent = profile.id;
    nameEl.textContent = profile.name || 'Unnamed User';
    emailEl.textContent = profile.email;
    roleEl.textContent = profile.role;
    bioEl.textContent = profile.bio || 'No bio provided yet.';
    applyAvatarToElement(avatar, profile.id, `${profile.email} avatar`);
  };

  const loadProfile = async (id) => {
    try {
      const profile = await api.getProfile(id);
      renderProfile(profile);
      activeProfileId = id;
      if (state.currentUser && Number(profile.id) === Number(state.currentUser.id)) {
        state.currentUser = profile;
        userEmailDisplay.textContent = profile.email;
      }
      await loadProfilePhotos(profile.id);
    } catch (err) {
      console.warn('Failed to load profile', err);
    }
  };

  await loadProfile(activeProfileId);
};

const setupPublicProfileView = async () => {
  requireUser();
  const container = document.querySelector('.public-profile');
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  if (!userId) {
    container.innerHTML = '<p class="photo-empty">No user selected.</p>';
    return;
  }

  try {
    const profile = await api.getProfile(userId);
    if (profile.role === 'admin') {
      container.innerHTML = '<p class="photo-empty">Admin profiles are private.</p>';
      return;
    }

    document.getElementById('public-name').textContent = profile.name || 'Unnamed User';
    document.getElementById('public-email').textContent = profile.email;
    document.getElementById('public-role').textContent = `Role: ${profile.role}`;
    document.getElementById('public-bio').textContent = profile.bio || 'No bio provided yet.';
    const avatar = document.getElementById('public-avatar');
    applyAvatarToElement(avatar, profile.id, `${profile.email} avatar`);

    const gallery = document.getElementById('public-photo-gallery');
    const photos = await api.listPhotosByUser(userId);
    if (!photos.length) {
      gallery.innerHTML = '<div class="photo-empty">No photos published yet.</div>';
    } else {
      gallery.innerHTML = photos
        .map((photo) => `
          <figure class="photo-card">
            <img src="${window.API_BASE}/api/photos/${encodeURIComponent(photo.filename)}" alt="${photo.description || photo.filename}">
            <figcaption>${photo.description || 'Untitled photo'}<br><small>${new Date(photo.created_at).toLocaleString()}</small></figcaption>
          </figure>`)
        .join('');
    }
  } catch (err) {
    console.warn('Failed to load public profile', err);
    container.innerHTML = '<p class="photo-empty">Unable to load this profile.</p>';
  }
};

const setupFriendsView = async () => {
  const user = requireUser();
  const listContainer = document.getElementById('friends-list');
  const searchInput = document.getElementById('friend-search');
  const countDisplay = document.getElementById('friend-count');
  let friendsCache = [];

  if (user.role !== 'user') {
    if (searchInput) {
      searchInput.disabled = true;
      searchInput.placeholder = 'Friends feature is available for standard users only';
    }
    if (countDisplay) {
      countDisplay.textContent = 'Admins do not maintain friend lists.';
    }
    listContainer.innerHTML = '<li class="friend-empty">Friends feature is disabled for your role.</li>';
    return;
  }

  const updateCount = (visibleCount = 0, totalCount = 0) => {
    if (!countDisplay) return;
    countDisplay.textContent = `Showing ${visibleCount} of ${totalCount} friends`;
  };

  const renderFriends = (friends) => {
    if (!friends.length) {
      listContainer.innerHTML = '<li class="friend-empty">No friends match.</li>';
      updateCount(0, friendsCache.length);
      return;
    }
    listContainer.innerHTML = friends
      .map((f) => {
        const name = f.friendName || f.friendEmail || 'Unknown Friend';
        // VULN: nickname is injected directly into the DOM without sanitization.
        return `
          <li class="friend-card">
            <img class="friend-avatar" data-avatar-user-id="${f.friend_id ?? ''}" data-avatar-alt="${name} avatar" alt="${name} avatar">
            <div class="friend-card-body">
              <div class="friend-name">${name}</div>
              <div class="friend-nickname">${f.nickname}</div>
              <div class="friend-email">${f.friendEmail}</div>
              <div class="friend-actions">
                <button class="friend-view" data-id="${f.friend_id}">View Profile</button>
                <button class="friend-remove" data-id="${f.id}">Remove</button>
              </div>
            </div>
          </li>`;
      })
      .join('');
    updateCount(friends.length, friendsCache.length);
    hydrateAvatarImages(listContainer);
  };

  const filterFriends = () => {
    const term = (searchInput.value || '').toLowerCase();
    if (!term) {
      renderFriends(friendsCache);
      return;
    }
    const filtered = friendsCache.filter((friend) => {
      const nickname = friend.nickname || '';
      const email = friend.friendEmail || '';
      const name = friend.friendName || '';
      return (
        nickname.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term)
      );
    });
    renderFriends(filtered);
  };

  const loadFriends = async () => {
    friendsCache = await api.listFriends();
    renderFriends(friendsCache);
  };

  if (searchInput) {
    searchInput.addEventListener('input', filterFriends);
  }

  listContainer.addEventListener('click', async (event) => {
    const viewButton = event.target.closest('.friend-view');
    if (viewButton) {
      const profileId = viewButton.dataset.id;
      if (profileId) {
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'public-profile');
        url.searchParams.set('userId', profileId);
        history.pushState({}, '', url.toString());
        loadView('public-profile');
      }
      return;
    }

    const removeButton = event.target.closest('.friend-remove');
    if (!removeButton) return;
    const id = removeButton.dataset.id;
    if (!id) return;
    if (!confirm('Remove this friend? This action cannot be undone.')) {
      return;
    }
    try {
      await api.removeFriend(id);
      await loadFriends();
      if (searchInput) {
        searchInput.value = '';
      }
    } catch (err) {
      alert('Remove failed');
    }
  });

  await loadFriends();
};

const setupMessagesView = async () => {
  requireUser();
  const contactsContainer = document.getElementById('messages-contacts');
  const threadContainer = document.getElementById('message-thread');
  const form = document.getElementById('send-message-form');
  const textarea = document.getElementById('message-body');
  const chatName = document.getElementById('chat-name');
  const chatEmail = document.getElementById('chat-email');
  const chatAvatar = document.getElementById('chat-avatar');

  let contacts = [];
  let activeContact = null;

  const setChatHeader = (contact) => {
    if (!contact) {
      chatName.textContent = 'Select a friend';
      chatEmail.textContent = '';
      applyAvatarToElement(chatAvatar, null, 'No contact selected avatar');
      form.querySelector('button[type="submit"]').disabled = true;
      textarea.disabled = true;
      return;
    }
    chatName.textContent = contact.friendName || contact.friendEmail;
    chatEmail.textContent = contact.friendEmail || '';
    applyAvatarToElement(
      chatAvatar,
      contact.friend_id,
      `${contact.friendEmail || contact.friendName} avatar`
    );
    form.querySelector('button[type="submit"]').disabled = false;
    textarea.disabled = false;
  };

  setChatHeader(null);

  const renderThread = async (recipientId) => {
    if (!recipientId) {
      threadContainer.innerHTML = '<div class="message-empty">Pick someone from the list to start chatting.</div>';
      return;
    }
    const messages = await api.getMessages(recipientId);
    if (!messages.length) {
      threadContainer.innerHTML = '<div class="message-empty">No messages yet.</div>';
      return;
    }
    threadContainer.innerHTML = messages
      .map((m) => {
        const isSender = m.sender_id === state.currentUser.id;
        const classes = ['message-bubble', isSender ? 'sent' : 'received'];
        const meta = isSender ? `${m.senderEmail || m.sender_id}` : `${m.recipientEmail || m.recipient_id}`;
        return `
          <div class="${classes.join(' ')}">
            <div class="message-meta">${meta}</div>
            <div class="message-body">${m.body}</div>
          </div>`;
      })
      .join('');
    threadContainer.scrollTop = threadContainer.scrollHeight;
  };

  const renderContacts = () => {
    if (!contacts.length) {
      contactsContainer.innerHTML = '<div class="contact-empty">No other users found.</div>';
      setChatHeader(null);
      threadContainer.innerHTML = '<div class="message-empty">Invite more users to start messaging.</div>';
      return;
    }

    contactsContainer.innerHTML = contacts
      .map((contact) => {
        const isActive = activeContact && contact.friend_id === activeContact.friend_id;
        const badge = contact.isFriend ? '<span class="contact-badge">Friend</span>' : '';
        return `
          <button class="contact-item ${isActive ? 'active' : ''}" data-id="${contact.friend_id}">
            <img class="contact-avatar" data-avatar-user-id="${contact.friend_id ?? ''}" data-avatar-alt="${contact.friendEmail || contact.friendName} avatar" alt="${contact.friendEmail || contact.friendName} avatar">
            <div class="contact-text">
              <span class="contact-name">${contact.friendName || contact.friendEmail}</span>
              <span class="contact-email">${contact.friendEmail || ''}</span>
              ${badge}
            </div>
          </button>`;
      })
      .join('');
    hydrateAvatarImages(contactsContainer);
  };

  const setActiveContact = async (contactId) => {
    const contact = contacts.find((c) => String(c.friend_id) === String(contactId));
    activeContact = contact || null;
    setChatHeader(activeContact);
    renderContacts();
    await renderThread(activeContact ? activeContact.friend_id : null);
  };

  contactsContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('.contact-item');
    if (!button) return;
    const id = button.dataset.id;
    if (activeContact && String(activeContact.friend_id) === id) {
      return;
    }
    await setActiveContact(id);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeContact) {
      alert('Select a contact first.');
      return;
    }
    const payload = {
      recipientId: activeContact.friend_id,
      body: textarea.value
    };
    await api.sendMessage(payload); // VULN: No CSRF protection, accepts fraud requests.
    textarea.value = '';
    await renderThread(activeContact.friend_id);
  });

  const loadContacts = async () => {
    const friends = await api.listFriends();
    const friendMap = new Map(friends.map((f) => [Number(f.friend_id), f]));
    const users = await api.searchUsers('');

    contacts = users
      .filter((user) => user.id !== state.currentUser.id)
      .map((user) => {
        const friend = friendMap.get(Number(user.id));
        return {
          friend_id: user.id,
          friendEmail: user.email,
          friendName: friend?.friendName || user.name,
          isFriend: Boolean(friend)
        };
      })
      .sort((a, b) => {
        if (a.isFriend !== b.isFriend) {
          return a.isFriend ? -1 : 1;
        }
        const nameA = (a.friendName || a.friendEmail || '').toLowerCase();
        const nameB = (b.friendName || b.friendEmail || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

    renderContacts();
    if (contacts.length) {
      await setActiveContact(contacts[0].friend_id);
    }
  };

  await loadContacts();
};

const setupSearchView = () => {
  requireUser();
  const form = document.getElementById('search-form');
  const resultsContainer = document.getElementById('search-results');
  const queryInput = document.getElementById('search-query');
  let friendMap = new Map();
  let currentResults = [];
  let suggestionPool = [];
  let currentQuery = '';

  const loadFriends = async () => {
    const friends = await api.listFriends();
    friendMap = new Map(friends.map((f) => [Number(f.friend_id), f]));
  };

  const getSuggestions = (limit = 5) => {
    return suggestionPool
      .filter((user) => Number(user.id) !== Number(state.currentUser.id))
      .filter((user) => !friendMap.has(Number(user.id)))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  };

  const renderResults = (users) => {
    let list = users;

    if (!list.length) {
      const suggestions = getSuggestions(5);
      if (!suggestions.length) {
        currentResults = [];
        resultsContainer.innerHTML = '<div class="search-empty">No matching users found. Try another query.</div>';
        return;
      }
      currentResults = suggestions;
      resultsContainer.innerHTML = `
        <div class="search-message">No direct matches. Here are some people you can invite:</div>
        <div class="search-grid">${suggestions.map((user) => renderCard(user)).join('')}</div>`;
      hydrateAvatarImages(resultsContainer);
      return;
    }

    currentResults = list;
    const header = currentQuery
      ? ''
      : '<div class="search-message">Suggested people to connect with</div>';
    resultsContainer.innerHTML = `${header}<div class="search-grid">${list.map((user) => renderCard(user)).join('')}</div>`;
    hydrateAvatarImages(resultsContainer);
  };

  const renderCard = (user) => {
    const isSelf = Number(user.id) === Number(state.currentUser.id);
    const friendEntry = friendMap.get(Number(user.id));
    const isAdmin = user.role === 'admin';
    const status = isSelf
      ? '<span class="search-status">This is you</span>'
      : isAdmin
      ? '<span class="search-status admin">Admin</span>'
      : friendEntry
      ? '<span class="search-status">Friend</span>'
      : '';

    let button = '';
    if (isSelf || isAdmin) {
      button = '<button class="search-button" disabled>Invite</button>';
    } else if (friendEntry) {
      button = '<button class="search-button" disabled>Already friends</button>';
    } else {
      button = `<button class="search-button" data-action="invite" data-id="${user.id}">Invite</button>`;
    }

    return `
      <article class="search-card" data-id="${user.id}">
        <header>
          <img class="search-avatar" data-avatar-user-id="${user.id ?? ''}" data-avatar-alt="${user.email} avatar" alt="${user.email} avatar">
          <div>
            <div class="search-name">${user.name || user.email}</div>
            <div class="search-email">${user.email}</div>
          </div>
        </header>
        <div class="search-bio">${user.bio || 'No bio yet.'}</div><!-- VULN: bio renders unsanitized HTML. -->
        <div class="search-actions">
          ${status}
          ${button}
        </div>
      </article>`;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const q = queryInput.value.trim();
    currentQuery = q;
    await loadFriends();
    suggestionPool = await api.searchUsers('');
    const results = q ? await api.searchUsers(q) : getSuggestions(12);
    renderResults(results);
  });

  resultsContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('.search-button[data-action="invite"]');
    if (!button) return;
    const userId = button.dataset.id;
    const user = currentResults.find((u) => String(u.id) === String(userId));
    if (!user) return;
    const defaultNickname = user.name || user.email || 'Friend';
    const nickname = prompt('Nickname for this friend (HTML allowed):', defaultNickname);
    if (nickname === null) {
      return;
    }
    await api.addFriend(userId, nickname);
    await loadFriends();
    suggestionPool = await api.searchUsers('');
    const refreshed = currentQuery ? await api.searchUsers(currentQuery) : getSuggestions(12);
    renderResults(refreshed);
    alert('Invite sent. Refresh or revisit friends to confirm.');
  });

  (async () => {
    suggestionPool = await api.searchUsers('');
    await loadFriends();
    currentQuery = '';
    const initial = getSuggestions(6);
    renderResults(initial);
  })();
};

const setupPhotosView = () => {
  const user = requireUser();
  const gallery = document.getElementById('photo-gallery');
  const form = document.getElementById('photo-upload-form');
  const fileInput = document.getElementById('photo-file');
  const statusEl = document.getElementById('photo-upload-status');

  const buildCard = (photo, options = {}) => {
    const { deletable = false } = options;
    return `
      <figure class="photo-card" data-photo-id="${photo.id}">
        <img src="${window.API_BASE}/api/photos/${encodeURIComponent(photo.filename)}" alt="${photo.description || photo.filename}">
        <figcaption>${photo.description || 'Untitled photo'}<br><small>${new Date(photo.created_at).toLocaleString()}</small></figcaption>
        ${deletable ? '<div class="photo-card-actions"><button class="photo-delete" data-id="' + photo.id + '">Delete</button></div>' : ''}
      </figure>`;
  };

  const renderGallery = (photos) => {
    if (!gallery) return;
    if (!photos.length) {
      gallery.innerHTML = '<div class="photo-empty">You have not published any photos yet.</div>';
      return;
    }
    gallery.innerHTML = photos.map((photo) => buildCard(photo, { deletable: true })).join('');
  };

  const refreshGallery = async () => {
    try {
      const photos = await api.listPhotosByUser(user.id);
      renderGallery(photos);
    } catch (err) {
      console.warn('Failed to load gallery', err);
      gallery.innerHTML = '<div class="photo-empty">Unable to load your photos.</div>';
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!fileInput.files || !fileInput.files[0]) {
      statusEl.textContent = 'Pick a file before publishing.';
      return;
    }
    try {
      const file = fileInput.files[0];
      const base64 = await toBase64(file);
      const filename = (file.name || `upload-${Date.now()}.bin`).trim();
      await api.publishPhoto({ filename, description: '', data: base64 });
      statusEl.textContent = 'Photo published.';
      fileInput.value = '';
      refreshGallery();
    } catch (err) {
      console.error('Publish failed', err);
      statusEl.textContent = err.message || 'Failed to publish photo.';
    }
  });

  gallery.addEventListener('click', async (event) => {
    const button = event.target.closest('.photo-delete');
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;
    if (!confirm('Delete this photo? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deletePhoto(id);
      await refreshGallery();
      statusEl.textContent = 'Photo removed.';
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  });

  refreshGallery();
};

const setupSettingsView = () => {
  const user = requireUser();
  const form = document.getElementById('settings-form');
  const nameInput = document.getElementById('settings-name');
  const bioInput = document.getElementById('settings-bio');
  const emailInput = document.getElementById('settings-email');
  const updatesCheckbox = document.getElementById('settings-updates');
  const passwordInput = document.getElementById('settings-password');
  const confirmInput = document.getElementById('settings-confirm');
  const statusEl = document.getElementById('settings-status');

  nameInput.value = user.name || '';
  bioInput.value = user.bio || '';
  if (emailInput) {
    emailInput.value = user.email;
  }
  const prefKey = `settings-pref-${user.id}`;
  if (updatesCheckbox) {
    updatesCheckbox.checked = localStorage.getItem(prefKey) === '1';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusEl.textContent = '';
    if (updatesCheckbox) {
      localStorage.setItem(prefKey, updatesCheckbox.checked ? '1' : '0');
    }
    const passwordValue = passwordInput?.value || '';
    const confirmValue = confirmInput?.value || '';

    if (passwordValue || confirmValue) {
      if (passwordValue !== confirmValue) {
        statusEl.textContent = 'Passwords do not match.';
        return;
      }
      statusEl.textContent = 'Password change simulated (not persisted).';
    }
    const payload = {
      name: nameInput.value,
      bio: bioInput.value
    };
    try {
      await api.updateSettings(payload); // VULN: Mass assignment lets role escalate.
      statusEl.textContent = 'Settings saved.';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 5000);
      if (passwordInput) {
        passwordInput.value = '';
      }
      if (confirmInput) {
        confirmInput.value = '';
      }
    } catch (err) {
      statusEl.textContent = 'Request failed';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 5000);
    }
  });
};

const setupNotificationsView = async () => {};

const setupTimelineView = async () => {
  const user = requireUser();
  const form = document.getElementById('timeline-form');
  const textarea = document.getElementById('timeline-content');
  const statusEl = document.getElementById('timeline-status');
  const feedContainer = document.getElementById('timeline-feed');

  const renderFeed = (posts) => {
    if (!posts.length) {
      feedContainer.innerHTML = '<div class="photo-empty">Your timeline is quiet. Add friends or share something!</div>';
      return;
    }
    feedContainer.innerHTML = posts
      .map((post) => {
        const isOwner = Number(post.user_id) === Number(user.id);
        const contentHtml = post.content;
        return `
          <article class="timeline-card" data-id="${post.id}">
            <div class="timeline-meta">
              <span class="timeline-author">${post.name || post.email}</span>
              <span>${new Date(post.created_at).toLocaleString()}</span>
            </div>
            <div class="timeline-content" data-content>${contentHtml}</div>
            ${isOwner
              ? `
                <div class="timeline-editable hidden">
                  <textarea>${contentHtml.replace(/<\/textarea/gi, '&lt;/textarea')}</textarea>
                  <div class="timeline-actions-inline edit-controls">
                    <button class="timeline-save" data-id="${post.id}">Save</button>
                    <button class="timeline-cancel" data-id="${post.id}">Cancel</button>
                  </div>
                </div>
                <div class="timeline-actions-inline controls">
                  <button class="timeline-edit" data-id="${post.id}">Edit</button>
                  <button class="timeline-delete" data-id="${post.id}">Delete</button>
                </div>`
              : ''}
          </article>`;
      })
      .join('');
  };

  const refreshFeed = async () => {
    try {
      const posts = await api.fetchFeed();
      renderFeed(posts);
    } catch (err) {
      feedContainer.innerHTML = '<div class="photo-empty">Unable to load timeline.</div>';
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusEl.textContent = '';
    const content = textarea.value.trim();
    if (!content) {
      statusEl.textContent = 'Write something before posting.';
      return;
    }
    try {
      await api.createPost(content);
      textarea.value = '';
      statusEl.textContent = 'Posted!';
      refreshFeed();
    } catch (err) {
      statusEl.textContent = err.message || 'Post failed';
    }
  });

  feedContainer.addEventListener('click', async (event) => {
    const editButton = event.target.closest('.timeline-edit');
    if (editButton) {
      const card = editButton.closest('.timeline-card');
      if (!card) return;
      card.querySelector('.timeline-content').classList.add('hidden');
      card.querySelector('.controls').classList.add('hidden');
      const editable = card.querySelector('.timeline-editable');
      editable.classList.remove('hidden');
      editable.querySelector('textarea').focus();
      return;
    }

    const cancelButton = event.target.closest('.timeline-cancel');
    if (cancelButton) {
      const card = cancelButton.closest('.timeline-card');
      if (!card) return;
      const contentEl = card.querySelector('.timeline-content');
      const editable = card.querySelector('.timeline-editable');
      const controls = card.querySelector('.controls');
      const textarea = editable.querySelector('textarea');
      textarea.value = contentEl.innerHTML;
      editable.classList.add('hidden');
      contentEl.classList.remove('hidden');
      controls.classList.remove('hidden');
      return;
    }

    const saveButton = event.target.closest('.timeline-save');
    if (saveButton) {
      const card = saveButton.closest('.timeline-card');
      if (!card) return;
      const id = saveButton.dataset.id;
      const textarea = card.querySelector('.timeline-editable textarea');
      try {
        await api.updatePost(id, textarea.value);
        statusEl.textContent = 'Post updated.';
        refreshFeed();
      } catch (err) {
        alert(err.message || 'Update failed');
      }
      return;
    }

    const deleteButton = event.target.closest('.timeline-delete');
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      if (!confirm('Delete this post?')) {
        return;
      }
      try {
        await api.deletePost(id);
        statusEl.textContent = 'Post deleted.';
        refreshFeed();
      } catch (err) {
        alert(err.message || 'Delete failed');
      }
    }
  });

  refreshFeed();
};

const setupAdminDashboard = async () => {
  const totalEl = document.getElementById('admin-total-users');
  if (!totalEl) return;
  const users = await api.searchUsers('');
  const total = users.length;
  const adminCount = users.filter((user) => user.role === 'admin').length;
  const standardCount = total - adminCount;
  const friendCount = (await api.listFriends()).length;

  totalEl.textContent = total;
  document.getElementById('admin-standard-users').textContent = standardCount;
  document.getElementById('admin-admin-users').textContent = adminCount;
  document.getElementById('admin-friend-count').textContent = friendCount;

  const inviteList = document.getElementById('admin-recent-invites');
  const sample = users
    .filter((user) => user.role !== 'admin')
    .filter((user) => Number(user.id) !== Number(state.currentUser.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
  inviteList.innerHTML = sample.length
    ? sample.map((user) => `<li>${user.name || user.email} <span class="contact-email">${user.email}</span></li>`).join('')
    : '<li>No invites recorded yet.</li>';
};

const setupAdminUsers = async () => {
  const container = document.getElementById('admin-users-table');
  if (!container) return;
  const users = await api.searchUsers('');
  const rows = users
    .map((user) => {
      const isSelf = Number(user.id) === Number(state.currentUser.id);
      const isAdmin = user.role === 'admin';
      const blocked = Number(user.blocked) === 1;
      const disableToggle = isSelf || isAdmin;
      const buttonLabel = blocked ? 'Unblock' : 'Block';
      const button = `<button class="admin-block-button" data-id="${user.id}" data-blocked="${blocked ? 1 : 0}" ${disableToggle ? 'disabled' : ''}>${disableToggle ? 'N/A' : buttonLabel}</button>`;
      return `
        <tr>
          <td>${user.name || user.email}</td>
          <td>${user.email}</td>
          <td>${user.role}${blocked ? ' · blocked' : ''}</td>
          <td>${button}</td>
        </tr>`;
    })
    .join('');
  container.innerHTML = `
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  container.querySelectorAll('.admin-block-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const currentlyBlocked = Number(button.dataset.blocked) === 1;
      const confirmMessage = currentlyBlocked ? 'Unblock this user?' : 'Block this user?';
      if (!confirm(confirmMessage)) {
        return;
      }
      try {
        await api.setBlockStatus(id, currentlyBlocked ? 0 : 1);
        await setupAdminUsers();
      } catch (err) {
        alert(err.message || 'Update failed');
      }
    });
  });
};

const setupAdminFiles = () => {
  const form = document.getElementById('admin-file-form');
  if (!form) return;
  const input = document.getElementById('admin-file-input');
  const statusEl = document.getElementById('admin-file-status');
  const listEl = document.getElementById('admin-file-list');
  if (!input || !statusEl || !listEl) return;

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const renderList = (files) => {
    if (!files.length) {
      listEl.innerHTML = '<div class="photo-empty">No files stored yet.</div>';
      return;
    }
    listEl.innerHTML = files
      .map((file) => `
        <div class="admin-file-row">
          <div class="admin-file-meta">
            <strong>${file.name}</strong>
            <span>${file.size} bytes · ${new Date(file.modified).toLocaleString()}</span>
          </div>
          <button class="admin-file-delete" data-name="${file.name}">Remove</button>
        </div>`)
      .join('');
  };

  const refreshFiles = async () => {
    try {
      const files = await api.adminListFiles();
      renderList(files);
    } catch (err) {
      listEl.innerHTML = '<div class="photo-empty">Unable to load files.</div>';
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = input.files?.[0];
    if (!file) {
      statusEl.textContent = 'Pick a file first.';
      return;
    }
    try {
      const base64 = await toBase64(file);
      await api.adminUploadFile({ filename: file.name, data: base64 });
      statusEl.textContent = 'File uploaded.';
      input.value = '';
      await refreshFiles();
    } catch (err) {
      statusEl.textContent = err.message || 'Upload failed.';
    }
  });

  listEl.addEventListener('click', async (event) => {
    const button = event.target.closest('.admin-file-delete');
    if (!button) return;
    const name = button.dataset.name;
    if (!name) return;
    if (!confirm(`Remove ${name}?`)) {
      return;
    }
    try {
      await api.adminDeleteFile(name);
      await refreshFiles();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  });

  refreshFiles();
};

const setupAdminLogs = () => {
  const logs = [
    'WARN  ' + new Date().toISOString() + ' :: S3 bucket still public for training purposes',
    'INFO  ' + new Date().toISOString() + ' :: Generated 10 fake notifications for audit trail demo',
    'ERROR ' + new Date().toISOString() + ' :: Failed admin login attempt from 127.0.0.1',
    'INFO  ' + new Date().toISOString() + ' :: Vulnerability scan scheduled (mock)'
  ];
  const list = document.getElementById('admin-log-list');
  if (!list) return;
  list.innerHTML = logs.map((entry) => `<li>${entry}</li>`).join('');
};

restoreState();
