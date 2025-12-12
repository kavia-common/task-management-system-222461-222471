const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

/**
 * Small wrapper over fetch that sets JSON headers and handles errors.
 * Ensures requests include proper CORS-friendly headers from frontend side.
 */
async function request(path, options = {}) {
  const url = `${DEFAULT_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const resp = await fetch(url, {
    ...options,
    headers,
    // credentials can be included if backend supports cookies; for now keep same-origin
    // credentials: 'include',
    mode: 'cors',
  });

  let data = null;
  const contentType = resp.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await resp.json().catch(() => null);
  } else {
    data = await resp.text().catch(() => null);
  }

  if (!resp.ok) {
    const message =
      (data && data.message) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${resp.status}`;
    const err = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the effective API base URL from env or default. */
  return DEFAULT_BASE_URL;
}

// PUBLIC_INTERFACE
export const TasksAPI = {
  /** Fetch all tasks */
  async list() {
    return request('/tasks', { method: 'GET' });
  },

  /** Create a task: { title: string } */
  async create(payload) {
    return request('/tasks', { method: 'POST', body: JSON.stringify(payload) });
  },

  /** Update a task by id: partial fields like { title, completed } */
  async update(id, payload) {
    return request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  /** Toggle completion convenience */
  async toggle(id, completed) {
    return request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) });
  },

  /** Delete a task by id */
  async remove(id) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  },
};
