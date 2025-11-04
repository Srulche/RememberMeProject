
import { useEffect, useState } from "react";
import { meApi } from "./api/authApi";
import Login from "./pages/Login";
import LogoutButton from "./components/LogoutButton";

export default function App() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false); // סיימנו בדיקה ראשונית?

  useEffect(() => {
    (async () => {
      try {
        const { data } = await meApi();
        setUser(data);            // { uid }
      } catch (err) {
        // 401 = לא מחובר – מתעלמים בשקט
        if (err.response?.status !== 401) console.error(err);
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  if (!checked) {
    return <div style={{ color: "white", padding: 20 }}>Loading…</div>;
  }

  return (
    <div style={{ color: "white", padding: 20 }}>
      {user ? (

        <div className="card" style={{ marginTop: 24 }}>
          <h2 style={{ marginTop: 0, color: "white", textAlign: "center" }}>Welcome {user.email}</h2>
          <LogoutButton onLoggedOut={() => setUser(null)} />
        </div>

      ) : (
        <Login onSuccess={(data) => setUser(data)} />
      )}
    </div>

  );
}
