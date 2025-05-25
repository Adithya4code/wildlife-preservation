import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                navigate("/auth/login");
            } else {
                const error = await res.json();
                setErrorMessage(error.detail || "Signup failed. Please try again.");
            }
        } catch {
            setErrorMessage("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 400,
                margin: "50px auto",
                padding: 30,
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h2 style={{ textAlign: "center", marginBottom: 24, color: "#222" }}>
                Create Account
            </h2>

            {errorMessage && (
                <div
                    style={{
                        marginBottom: 20,
                        padding: 12,
                        borderRadius: 4,
                        backgroundColor: "#fdecea",
                        color: "#b00020",
                        fontWeight: "bold",
                        fontSize: 14,
                    }}
                >
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSignup} noValidate>
                <input
                    type="text"
                    placeholder="Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                        width: "100%",
                        marginBottom: 16,
                        padding: 12,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 16,
                        outline: "none",
                    }}
                    disabled={isLoading}
                />

                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: "100%",
                        marginBottom: 16,
                        padding: 12,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 16,
                        outline: "none",
                    }}
                    disabled={isLoading}
                />

                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: "100%",
                        marginBottom: 24,
                        padding: 12,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 16,
                        outline: "none",
                    }}
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        padding: 14,
                        borderRadius: 4,
                        border: "none",
                        backgroundColor: isLoading ? "#90cdf4" : "#3182ce",
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "bold",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        transition: "background-color 0.3s ease",
                    }}
                >
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
}
