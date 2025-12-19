
interface LoginResponse {
  user: {
    id: string;
    name: string;
    role: string;
  };
  token: string;
}

/**
 * AuthService handles all authentication related requests.
 */
export const AuthService = {
  /**
   * Simulates a user login.
   */
  async login(credentials: any): Promise<LoginResponse> {
    console.log("Attempting login for:", credentials.email);
    
    // Simulating network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful response
    return {
      user: {
        id: "1",
        name: "Muhamad Fathurohman",
        role: "Super Admin"
      },
      token: "mock-jwt-token-gsm"
    };
  },

  /**
   * Simulates a user logout.
   */
  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  }
};
