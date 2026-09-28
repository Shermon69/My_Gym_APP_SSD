import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useFormik, Form, FormikProvider } from "formik";
import Axios from "axios";
// material
import {
  Link,
  Stack,
  Checkbox,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// component
import Iconify from "../../../components/Iconify";

// ----------------------------------------------------------------------

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // ── Google One Tap / Button setup ───────────────────────────────────────
  // We use the Google Identity Services (GIS) library which supports the
  // PKCE-backed Authorization Code flow. The library is loaded via a <script>
  // tag in public/index.html. Here we initialise it once on mount and render
  // a native Google Sign-In button so users can use their Google account
  // instead of (or in addition to) the username/password form.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      // use_fedcm_for_prompt: true,
      callback: handleGoogleCredentialResponse,
      ux_mode: "popup",
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-btn"),
      {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Called by GIS after the user picks their Google account in the popup.
   * The `response.credential` is a signed Google ID token (JWT).
   * We send it to our backend which verifies it with Google's public keys
   * and issues an httpOnly cookie — the raw token never touches localStorage.
   */
  const handleGoogleCredentialResponse = (response) => {
    setError("");
    Axios.post(
      `${API_URL}/api/auth/google`,
      { credential: response.credential },
      { withCredentials: true } // required for the Set-Cookie header to be stored
    )
      .then((res) => {
        // Store only non-sensitive profile info — no JWT in localStorage (V11 fix)
        const { id, username, email, roles } = res.data;
        localStorage.setItem("user", JSON.stringify({ id, username, email, roles }));
        // Hard redirect so App.js re-evaluates authentication via the cookie
        window.location.href = "/dashboard/app";
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "Google sign-in failed. Please try again."
        );
      });
  };

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "admin",
      password: "admin",
      remember: true,
    },
    validationSchema: LoginSchema,
    onSubmit: (values, actions) => {
      setError("");
      Axios.post(`${API_URL}/api/auth/signin`, values)
        .then((response) => {
          if (response.data.accessToken) {
            localStorage.setItem("user", JSON.stringify(response.data));
            Axios.defaults.headers.common["x-access-token"] =
              response.data.accessToken;
            navigate("/dashboard/app", { replace: true });
          }
        })
        .catch((err) => {
          setTimeout(() => {
            setError(err?.response?.data?.message || "Login failed.");
            actions.setSubmitting(false);
          }, 1000);
        });
    },
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } =
    formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            autoComplete="username"
            type="text"
            label="Username"
            {...getFieldProps("username")}
            error={Boolean(touched.username && errors.username)}
            helperText={touched.username && errors.username}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            label="Password"
            {...getFieldProps("password")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Iconify
                      icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ my: 2 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                {...getFieldProps("remember")}
                checked={values.remember}
              />
            }
            label="Remember me"
          />

          <Link
            component={RouterLink}
            variant="subtitle2"
            to="#"
            underline="hover"
          >
            Forgot password?
          </Link>
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Login
        </LoadingButton>

        {/* ── Google Sign-In ──────────────────────────────────────────── */}
        {GOOGLE_CLIENT_ID && (
          <>
            <Divider sx={{ my: 3 }}>OR</Divider>
            {/* The Google GIS library targets this div and renders its branded button */}
            <div id="google-signin-btn" style={{ width: "100%" }} />
          </>
        )}
      </Form>
    </FormikProvider>
  );
}
