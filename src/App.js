import { useState, useMemo, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import Axios from "axios";

import { SnackbarProvider } from "notistack";
// routes
import Router from "./routes";
// theme
import ThemeConfig from "./theme";
import GlobalStyles from "./theme/globalStyles";

// components
import ScrollToTop from "./components/ScrollToTop";
import { BaseOptionChartStyle } from "./components/charts/BaseOptionChart";

import { UserContext } from "./UserContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export default function App() {
  const [user, setUser] = useState({});
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value = useMemo(() => ({ user, setUser }), [user]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setAuthChecked(true);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const accessToken = parsedUser?.accessToken;

      if (!accessToken) {
        localStorage.removeItem("user");
        setAuthChecked(true);
        return;
      }

      Axios.defaults.headers.common["x-access-token"] = accessToken;

      // The server is the real authentication boundary.
      Axios.get(`${API_URL}/api/auth/verify`)
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Invalid/expired token: clear the client session.
          localStorage.removeItem("user");
          delete Axios.defaults.headers.common["x-access-token"];
          setIsAuthenticated(false);
        })
        .finally(() => {
          setAuthChecked(true);
        });
    } catch (e) {
      localStorage.removeItem("user");
      setAuthChecked(true);
    }
  }, []);

  // Hooks must always run in the same order.
  // Until authentication is checked, keep the client route guard closed.
  const routing = useRoutes(
    Router(
      authChecked && isAuthenticated
        ? localStorage.getItem("user")
        : null
    )
  );

  // Wait until the server has checked the stored token.
  if (!authChecked) {
    return null;
  }

  return (
    <ThemeConfig>
      <ScrollToTop />
      <GlobalStyles />
      <BaseOptionChartStyle />
      <SnackbarProvider>
        <UserContext.Provider value={value}>
          {routing}
        </UserContext.Provider>
      </SnackbarProvider>
    </ThemeConfig>
  );
}