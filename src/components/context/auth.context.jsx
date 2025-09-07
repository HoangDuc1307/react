import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({
    auth: {
        isAuthenticated: false,
        user: null,
    },
    setAuth: () => {},
    appLoading: true,
    setAppLoading: () => {},
});

export const AuthWrapper = (props) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: null,
    });

    const [appLoading, setAppLoading] = useState(true);

    // Hydrate auth state from localStorage once on mount
    useEffect(() => {
        try {
            const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
            const storedUser = localStorage.getItem("user");

            if (accessToken) {
                const parsedUser = storedUser ? JSON.parse(storedUser) : null;
                setAuth({ isAuthenticated: true, user: parsedUser });
            } else {
                setAuth({ isAuthenticated: false, user: null });
            }
        } catch (err) {
            setAuth({ isAuthenticated: false, user: null });
        } finally {
            setAppLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            auth,
            setAuth,
            appLoading,
            setAppLoading
        }} >
            {props.children}
        </AuthContext.Provider>
    );
}

