// client/src/components/LogoutButton.jsx
import { useState } from "react";
import { logoutApi } from "../api/authApi";

export default function LogoutButton({ onLoggedOut }) {
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logoutApi();        // מוחק cookie בצד שרת
            onLoggedOut?.();          // ננקה state בקליינט
            // אופציונלי: רענון מלא אם רוצים אפס זיכרון:
            // window.location.reload();

        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="btn-gradient"
            onClick={handleLogout}
            disabled={loading}
        >
            {loading ? "Logging out…" : "Logout"}
        </button>
    );
}
