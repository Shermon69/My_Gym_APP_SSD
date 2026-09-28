/**
 * AuthCallback.js
 *
 * This page is the redirect target for the Google PKCE Authorization Code flow.
 * After Google redirects back to /auth/callback with the authorization code,
 * this component exchanges it for a credential (ID token) using the Google
 * Identity Services library, then posts it to our backend for verification.
 *
 * V11 Fix: The backend issues an httpOnly cookie instead of returning a raw
 * JWT in the body. localStorage is never used for the token.
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Axios from "axios";
import { CircularProgress, Box, Typography, Alert } from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const credential = searchParams.get("credential");

    if (!credential) {
      setError("No Google credential received. Please try again.");
      return;
    }

    Axios.post(
      `${API_URL}/api/auth/google`,
      { credential },
      { withCredentials: true } // needed to store the httpOnly cookie
    )
      .then((response) => {
        // Store non-sensitive user info only (no JWT in localStorage!)
        const { id, username, email, roles } = response.data;
        localStorage.setItem("user", JSON.stringify({ id, username, email, roles }));
        navigate("/dashboard/app", { replace: true });
        // Force a page reload so App.js re-reads the cookie via /api/auth/verify
        window.location.href = "/dashboard/app";
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "Google login failed. Please try again."
        );
      });
  }, [navigate, searchParams]);

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        Signing you in with Google...
      </Typography>
    </Box>
  );
}
