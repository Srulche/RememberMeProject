
import { useState } from "react";
import { loginApi, meApi, verifyOtpApi } from "../api/authApi";
import LoginForm from "../components/LoginForm";
import { startSignupApi } from "../api/authApi";

export default function Login({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [mode, setMode] = useState("login"); // "login" | "otp"
    const [emailForOtp, setEmailForOtp] = useState("");
    const [info, setInfo] = useState(""); // הודעות מידע כמו "OTP נשלח ל..."

    async function handleLogin({ email, password, remember }) {
        setErr("");
        setLoading(true);
        try {
            await loginApi({ email, password, remember });  // מציב cookie
            const { data } = await meApi();                 // { uid }
            onSuccess?.(data);
        } catch (e) {
            const status = e.response?.status;
            if (status === 404) {
                const ok = window.confirm("We don't have you in our systems, would you like to sign up?")
                if (ok) {
                    try {
                        await startSignupApi({ email, password });
                        setEmailForOtp(email);
                        setInfo(`We sent you a verification email at ${email}. Please  enter the OTP below to finish your registration.`);
                        setMode("otp");
                    } catch (e2) {
                        setErr(e2.response?.data?.message || "Failed to start sign up");

                    }
                } else {
                    setErr(" Unauthorized")
                }
            } else {
                setErr(e.response?.data?.message || "Login failed");

            }

        } finally {
            setLoading(false);
        }
    }

    async function handleOtpSubmit(otp) {
        setErr("");
        setLoading(true);
        try {
            await verifyOtpApi({ email: emailForOtp, otp });
            const { data } = await meApi();
            onSuccess?.(data);
        } catch (e) {
            setErr(e.response?.data?.message || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ color: "white", padding: 20 }}>
            {mode === "login" ? (
                <>
                    <LoginForm onSubmit={handleLogin} loading={loading} />
                    {err && <div style={{ color: "#f66", marginTop: 8 }}>{err}</div>}
                </>
            ) : (
                <div className="card" style={{ width: 360 }}>
                    <h2 style={{ marginTop: 0 }}>Login</h2>
                    <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.4 }}>{info}</p>
                    <form onSubmit={e => { e.preventDefault(); handleOtpSubmit(e.target.otp.value.trim()); }}>
                        <input
                            name="otp"
                            placeholder="OTP"
                            style={{
                                width: "100%", background: "#2a2a2a", border: "1px solid #3a3a3a",
                                borderRadius: 12, color: "white", padding: "12px 14px", outline: "none"
                            }}
                        />
                        <button className="btn-gradient" type="submit" style={{ marginTop: 12 }}>
                            Login
                        </button>
                    </form>
                    {err && <div style={{ color: "#f66", marginTop: 8 }}>{err}</div>}
                </div>
            )}
        </div>
    );
}
