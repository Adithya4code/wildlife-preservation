import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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
            alert("Login failed");
        }
    };

    return (
        <div style={{maxWidth: 400, margin: "auto", paddingTop: 50}}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{width: "100%", marginBottom: 10, padding: 8}}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{width: "100%", marginBottom: 10, padding: 8}}
                />
                <button type="submit" style={{width: "100%", padding: 10}}>
                    Login
                </button>
            </form>
            <p style={{marginTop: 15}}>
                Don't have an account? <Link to="/auth/signup">Sign up here</Link>
            </p>
        </div>
    );
}