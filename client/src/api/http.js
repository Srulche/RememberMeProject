export const http = {
  async get(url) {
    const res = await fetch(`/api${url}`, {
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.message || res.statusText);
      err.response = { status: res.status, data };
      throw err;
    }
    return { data };
  },

  async post(url, body) {
    const res = await fetch(`/api${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.message || res.statusText);
      err.response = { status: res.status, data };
      throw err;
    }
    return { data };
  },
};
