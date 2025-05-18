import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const res = await fetch("http://localhost:8000/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (res.ok) {
            alert("Signup successful! Please login.");
            navigate("/");
        } else {
            const error = await res.json();
            alert("Signup failed: " + error.detail);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto", paddingTop: 50 }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", marginBottom: 10, padding: 8 }}
                />
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", marginBottom: 10, padding: 8 }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", marginBottom: 10, padding: 8 }}
                />
                <button type="submit" style={{ width: "100%", padding: 10 }}>
                    Sign Up
                </button>
            </form>
        </div>
    );
}