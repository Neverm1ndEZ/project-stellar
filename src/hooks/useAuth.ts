// src/hooks/useAuth.ts
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function useAuth() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // TRPC mutations
  const register = api.auth.register.useMutation();
  const checkEmail = api.auth.checkEmail.useQuery(
    { email: "" },
    { enabled: false },
  );

  const login = useCallback(
    async ({ identifier, password }: LoginCredentials) => {
      setIsLoading(true);
      try {
        const result = await signIn("credentials", {
          identifier,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Invalid credentials. Please try again.",
          });
          return false;
        }

        // Check if phone verification is needed
        if (!session?.user.phoneNumber) {
          router.push("/verify-phone");
          return true;
        }

        // Get return URL or default to home
        const searchParams = new URLSearchParams(window.location.search);
        const returnUrl = searchParams.get("from") ?? "/";
        router.push(returnUrl);

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        return true;
      } catch (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "An unexpected error occurred. Please try again.",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, session, toast],
  );

  const registerUser = useCallback(
    async (credentials: RegisterCredentials) => {
      setIsLoading(true);
      try {
        // Check if email exists
        const emailCheck = await checkEmail.refetch({
          email: credentials.email,
        });

        if (emailCheck.data?.exists) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "This email is already registered.",
          });
          return false;
        }

        // Register user
        await register.mutateAsync(credentials);

        // Automatically log in after registration
        const loginResult = await login({
          identifier: credentials.email,
          password: credentials.password,
        });

        if (loginResult) {
          toast({
            title: "Welcome!",
            description: "Your account has been created successfully.",
          });
          router.push("/verify-phone");
          return true;
        }

        return false;
      } catch (error) {
        console.error("Registration error:", error);
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [login, register, checkEmail, router, toast],
  );

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred while logging out.",
      });
    }
  }, [router, toast]);

  const updateProfile = useCallback(
    async (data: Partial<RegisterCredentials>) => {
      setIsLoading(true);
      try {
        // Here you would call your update profile mutation
        // For now, just update the session
        await updateSession();

        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        return true;
      } catch (error) {
        console.error("Profile update error:", error);
        toast({
          variant: "destructive",
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateSession, toast],
  );

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || isLoading,
    login,
    registerUser,
    logout,
    updateProfile,
  };
}
