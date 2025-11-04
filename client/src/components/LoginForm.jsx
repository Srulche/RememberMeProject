
import { useState } from "react";

export default function LoginForm({ onSubmit, loading }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    // const [errors, setErrors] = useState({});
    const [errors, setErrors] = useState({ email: "", password: "" });

    function validate() {
        const next = {};
        if (!email.trim()) {
            next.email = "* Required field";
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            next.email = "* Invalid email";
        }
        if (!password) {
            next.password = "* Required field";
        }
        else if (password.length < 8) {
            next.password = "* Password must be at least 8 characters";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }
    //     function validate({ email, password }) {
    //   const e = { email: "", password: "" };
    //   if (!email) e.email = "* Required Field";
    //   else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "* Invalid Email";

    //   if (!password) e.password = "* Required Field";
    //   else if (password.length < 8) e.password = "* Password must be 8+ characters";

    //   setErrors(e);
    //   return !e.email && !e.password;
    // }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({ email: email.trim(), password, remember });
    }

    return (
        <form onSubmit={handleSubmit} className="login-card" >
            <div className="login-header">
                <h2 className="login-title">Login</h2>
            </div>

            <label className="field">
                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby="email-error"
                />
                {errors.email && (
                    <div id="email-error" className="error">
                        {errors.email}
                    </div>
                )}

            </label>

            <label className="field">
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby="password-error"
                />
                {errors.password && (
                    <div id="password-error" className="error">
                        {errors.password}
                    </div>
                )}
            </label>
            <label className="remember">
                <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>

            </label>

            <button className="login-btn" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Login"}
            </button>

            {/* {error && <div style={{ color: "#f66", marginTop: 8 }}>{error}</div>} */}
        </form>
    );
}
