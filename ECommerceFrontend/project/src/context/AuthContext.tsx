import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import api from "../services/api";
import { Result, notification } from "antd";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];

  isCustomer: boolean;
  customerId?: string;

  isSeller: boolean;
  sellerId?: string;
  storeName?: string;
  city?: string;

  isAdmin: boolean;
  lastLogin: Date;
}

interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
  email?: string;
  userId?: string;
}

interface VerifyOtpResult {
  success: boolean;
  message: string;
  description: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyOtp: (otpCode: string) => Promise<VerifyOtpResult>;
  // resendOtp: (email: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    roles: ("Customer" | "Seller")[],
    city?: string,
    storeName?: string
  ) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: "customer" | "seller" | "admin") => boolean;

  activeRole: string | null;
  setActiveRole: (role: string) => void;

  // 2FA related states
  pendingVerification: boolean;
  pendingEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        // Check if there's a pending 2FA verification
        const pending2FAEmail = localStorage.getItem("pending_2fa_email");
        if (pending2FAEmail) {
          setPendingVerification(true);
          setPendingEmail(pending2FAEmail);
        }
        return;
      }

      try {
        const response = await api.get("/auth/profile");

        const userData = response.data.data;
        const loggedUser: User = {
          id: userData.userId,
          name: userData.fullName,
          email: userData.email,
          roles: userData.roles.map((r: string) => r.toLowerCase()),

          isCustomer: userData.isCustomer,
          customerId: userData.customerId,

          isSeller: userData.isSeller,
          sellerId: userData.sellerId,
          storeName: userData.storeName,
          city: userData.city,

          isAdmin: userData.isAdmin,
          lastLogin: userData.lastLogin,
        };

        setUser(loggedUser);
        setIsAuthenticated(true);
        setActiveRole(localStorage.getItem("role") || loggedUser.roles[0]);

        // Clear any pending 2FA state
        clearPending2FA();
      } catch (error) {
        console.error("Session validation failed:", error);
        logout();
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (user?.roles?.length && !activeRole) {
      setActiveRole(user.roles[0]);
    }
  }, [user, activeRole]);

  const clearPending2FA = () => {
    setPendingVerification(false);
    setPendingEmail(null);
    localStorage.removeItem("pending_2fa_userId");
    localStorage.removeItem("pending_2fa_email");
  };

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      const userData = response.data.data;

      // Check for 2FA requirement
      if (userData.status === "2FA_REQUIRED") {
        // Save email/userId in temp state or localStorage for OTP verification step
        localStorage.setItem("pending_2fa_userId", userData.userId);
        localStorage.setItem("pending_2fa_email", email);

        // Update state
        setPendingVerification(true);
        setPendingEmail(email);

        return {
          success: false,
          requires2FA: true,
          email: email,
          userId: userData.userId,
        };
      }

      const loggedUser: User = {
        id: userData.user.userId,
        name: userData.user.fullName,
        email: userData.user.email,
        roles: userData.user.roles.map((r: string) => r.toLowerCase()), // ['customer', 'seller', 'admin']

        isCustomer: userData.user.isCustomer,
        customerId: userData.user.customerId,

        isSeller: userData.user.isSeller,
        sellerId: userData.user.sellerId,
        city: userData.user.city,
        storeName: userData.user.storeName,

        isAdmin: userData.user.isAdmin,
        lastLogin: userData.user.lastLogin,
      };

      setUser(loggedUser);

      const defaultRole = userData.user.roles[0];
      const lowercaseRole = defaultRole.toLowerCase();
      setActiveRole(lowercaseRole);

      setIsAuthenticated(true);

      localStorage.setItem("auth_token", userData.token);
      localStorage.setItem("refresh_token", userData.refreshToken);
      localStorage.setItem("role", lowercaseRole);

      clearPending2FA();
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false };
    }
  };

  const verifyOtp = async (otpCode: string): Promise<VerifyOtpResult> => {
    const userId = localStorage.getItem("pending_2fa_userId");
    const email = localStorage.getItem("pending_2fa_email");

    if (!userId || !email) {
      // notification.error({
      //   message: "Verification Error",
      //   description: "Session expired. Please login again.",
      // });
      return {success: false, message: "Verification Error" , description: "Session expired. Please login again."};
    }

    try {
      const response = await api.post("/auth/verify-otp", {
        userId: userId,
        otpCode: otpCode,
        // email: email
      });

      if (response.data.success) {
        const userData = response.data.data;

        // Create user object
        const loggedUser: User = {
          id: userData.user.userId,
          name: userData.user.fullName,
          email: userData.user.email,
          roles: userData.user.roles.map((r: string) => r.toLowerCase()),

          isCustomer: userData.user.isCustomer,
          customerId: userData.user.customerId,

          isSeller: userData.user.isSeller,
          sellerId: userData.user.sellerId,
          city: userData.user.city,
          storeName: userData.user.storeName,

          isAdmin: userData.user.isAdmin,
          lastLogin: userData.user.lastLogin,
        };

        setUser(loggedUser);
        setIsAuthenticated(true);

        const defaultRole = userData.user.roles[0];
        const lowercaseRole = defaultRole.toLowerCase();
        setActiveRole(lowercaseRole);

        // Store tokens
        localStorage.setItem("auth_token", userData.token);
        localStorage.setItem("refresh_token", userData.refreshToken);
        localStorage.setItem("role", lowercaseRole);

        // Clear pending 2FA state
        clearPending2FA();

        // notification.success({
        //   message: "Verification Successful",
        //   description: `Welcome, ${userData.user.fullName}! Your account has been verified.`,
        //   duration: 3,
        // });

        return {success: true, message: "Verification Successful", description: "OTP Verfied Successfully"};
      }
      else{
        return {success: false, message: `${response.data.message}`, description: `${response.data.errors[0]}`};
      }
    } catch (error: any) {
      console.error("OTP verification failed:", error);

      // notification.error({
      //   message: "Verification Failed",
      //   description: error.response?.data?.message || "Invalid verification code. Please try again.",
      //   duration: 4,
      // });

      return {success: false, message: "Verification Failed", description: "Something went wrong while verfying OTP"};
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    const userId = localStorage.getItem("pending_2fa_userId");

    if (!userId) {
      notification.error({
        message: "Resend Error",
        description: "Session expired. Please login again.",
      });
      return false;
    }

    try {
      await api.post("/auth/resend-otp", {
        userId: userId,
        email: email,
      });

      notification.success({
        message: "Code Sent",
        description: "A new verification code has been sent to your email.",
        duration: 3,
      });

      return true;
    } catch (error: any) {
      console.error("Resend OTP failed:", error);

      notification.error({
        message: "Resend Failed",
        description:
          error.response?.data?.message ||
          "Failed to resend verification code. Please try again.",
        duration: 4,
      });

      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    roles: ("Customer" | "Seller")[],
    city?: string,
    storeName?: string
  ) => {
    try {
      const payload = {
        fullName: name,
        email: email,
        password: password,
        roles: roles,
        city: city,
        storeName: storeName,
      };
      const response = await api.post("/auth/register", payload);
      console.log("Resposne: " + response);
      console.log("JSON Resposne: " + JSON.stringify(response));
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    setIsAuthenticated(false);
    clearPending2FA();

    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");

    notification.info({
      message: "Logged Out",
      description: "You have been successfully logged out.",
      duration: 2,
    });
  };

  const hasRole = (role: "customer" | "seller" | "admin") => {
    return user?.roles.includes(role) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        verifyOtp,
        register,
        logout,
        hasRole,

        activeRole,
        setActiveRole,

        pendingVerification,
        pendingEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
