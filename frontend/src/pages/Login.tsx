import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                alert("Login success! Token: " + data.access_token);
                // Save token and redirect as needed
                navigate("/dashboard");
            } else {
                const errorData = await res.json();
                setError(errorData.detail || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 400,
                margin: "auto",
                paddingTop: 50,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderRadius: 8,
                padding: 24,
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h2 style={{ textAlign: "center", marginBottom: 24 }}>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: "100%",
                        marginBottom: 15,
                        padding: 12,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 16,
                    }}
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: "100%",
                        marginBottom: 15,
                        padding: 12,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 16,
                    }}
                    disabled={loading}
                />
                {error && (
                    <div
                        style={{
                            marginBottom: 15,
                            color: "red",
                            fontWeight: "bold",
                            fontSize: 14,
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 12,
                        backgroundColor: loading ? "#999" : "#007bff",
                        color: "white",
                        fontSize: 16,
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: 4,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "background-color 0.3s",
                    }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <p style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
                Don't have an account?{" "}
                <Link to="/auth/signup" style={{ color: "#007bff", textDecoration: "none" }}>
                    Sign up here
                </Link>
            </p>
        </div>
    );
}