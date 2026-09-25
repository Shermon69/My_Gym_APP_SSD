import { useState, useMemo } from "react";
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

// ----------------------------------------------------------------------

// Re-attach the stored JWT to every future axios request on load/refresh,
// so protected API routes keep working for an already-logged-in session.
const storedUser = localStorage.getItem("user");
if (storedUser) {
  try {
    const { accessToken } = JSON.parse(storedUser);
    if (accessToken) {
      Axios.defaults.headers.common["x-access-token"] = accessToken;
    }
  } catch (e) {
    // Malformed localStorage value: ignore, user will be redirected to login.
  }
}

export default function App() {
  const [user, setUser] = useState({});

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  const routing = useRoutes(Router(localStorage.getItem("user")));

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
