// Utility function to handle unauthorized access
const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    // Clear any stored auth data
    localStorage.removeItem("auth-token");
    // Clear Redux state by dispatching logout (if available)
    // For immediate redirect, we use window.location.href
    window.location.href = "/signin";
  }
};

// Unified API Client
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; error: null } | { data: null; error: string }> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Note: We use HTTP-only cookies for authentication, so we don't need to
      // read from localStorage or send Authorization header.
      // The cookies are automatically sent with credentials: "include"

      // Ensure credentials are always included for cookie-based auth
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: "include", // Include cookies for httpOnly tokens - this is essential!
      };
      
      // Log in development to debug cookie issues
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        console.log("Making request to:", url);
        console.log("Credentials:", fetchOptions.credentials);
      }

      const response = await fetch(url, fetchOptions);

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      let data: any = null;
      
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error("JSON parse error:", parseError, "Response text:", text);
            return {
              data: null,
              error: "Invalid JSON response from server",
            };
          }
        }
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          // Check if it's a token expiration error
          const errorMessage = data?.error || "";
          if (errorMessage.includes("expired") || errorMessage.includes("Invalid or expired token") || errorMessage.includes("Not authenticated")) {
            handleUnauthorized();
          } else {
            handleUnauthorized();
          }
        }
        
        return {
          data: null,
          error: data?.error || `Request failed with status ${response.status}`,
        };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<{ data: T; error: null } | { data: null; error: string }> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<{ data: T; error: null } | { data: null; error: string }> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<{ data: T; error: null } | { data: null; error: string }> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<{ data: T; error: null } | { data: null; error: string }> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<{ data: T; error: null } | { data: null; error: string }> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();

