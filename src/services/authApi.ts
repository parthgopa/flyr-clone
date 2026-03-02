import axios from "axios";
import { backendURL } from "./api";

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile_picture?: string;
    status?: string;
    role?: string;
  };
}

/**
 * Sign up a new user with email, phone and password
 */
export async function signupUser(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<AuthResponse> {
  try {
    console.log("API: Signup request for", email);
    const response = await axios.post(`${backendURL}/auth/signup`, {
      name,
      email,
      phone,
      password,
    });
    console.log("API: Signup response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API: Signup error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || "Signup failed",
    };
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    console.log("API: Login request for", email);
    const response = await axios.post(`${backendURL}/auth/login`, {
      email,
      password,
    });
    console.log("API: Login response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API: Login error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || "Login failed",
    };
  }
}

/**
 * Sign in with Google OAuth
 */
export async function googleSignIn(idToken: string): Promise<AuthResponse> {
  try {
    console.log("API: Google sign-in request");
    const response = await axios.post(`${backendURL}/auth/google-signin`, {
      id_token: idToken,
    });
    console.log("API: Google sign-in response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API: Google sign-in error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || "Google sign-in failed",
    };
  }
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<AuthResponse> {
  try {
    console.log("API: Verifying token");
    const response = await axios.post(`${backendURL}/auth/verify-token`, {
      token,
    });
    console.log("API: Token verification response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API: Token verification error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || "Token verification failed",
    };
  }
}
