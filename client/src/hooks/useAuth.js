import { useEffect } from "react";
import { useState } from "react";
import { loginApi, meApi } from "../api/authApi";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    meApi().then(
      (res) => setUser(res.data.user),
      () => setUser(null)
    );
  }, []);
  async function login({ email, password, remember }) {
    await loginApi({ email, password, remember });
    const res = await meApi();
    setUser(res.data.user);
  }
  async function logout() {
    // await logoutApi();
    setUser(null);
  }
  return { user, login, logout };
}
