import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import { useAuth } from "../context/AuthContext";
import { auth, provider, db } from "../../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Assuming sonner is used for toasts

// Initialize Google Auth Provider outside the component to avoid re-creation
const googleProvider = new GoogleAuthProvider();

const AuthPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State for Login Tab
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // State for Signup Tab
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // --- Login Handlers ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast.success("Logged in successfully!");
      navigate("/auth/check-profile");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Google login successful!");
      navigate("/auth/check-profile");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  // --- Signup Handlers ---
  const handleEmailSignup = async () => {
    setSignupLoading(true);
    setSignupError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName || null, // displayName might be null for email/password signup
        photoURL: user.photoURL || null,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        },
      };

      await setDoc(doc(db, "users", user.uid), userData);

      toast.success("Account created successfully!");
      navigate("/auth/check-profile");
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSignupError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists in 'users' collection, if not, create
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef); // Need to import getDoc from firestore

      if (!userDocSnap.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
        };
        await setDoc(doc(db, "users", user.uid), userData);
        toast.success("Google sign-up successful and user data saved!");
      } else {
        toast.success("Google sign-in successful!"); // User already existed, just signed in
      }
      
      navigate("/auth/check-profile");
    } catch (err) {
      setSignupError(err.message);
    }
  };

  // If a user is already logged in, show a welcome message
  if (currentUser) {
    return (
      <div className="flex justify-center mt-10 text-center">
        <Card className="w-[400px] p-6 shadow-xl">
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You're currently logged in as <strong>{currentUser.email}</strong>.
            </p>
            <Button onClick={() => navigate("/whatsapp")} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl text-center">Auth</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab Content */}
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <Input
                  placeholder="Email"
                  value={loginEmail}
                  type="email"
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Input
                  placeholder="Password"
                  value={loginPassword}
                  type="password"
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Login with Email
                </Button>
              </form>

              <div className="my-4 text-center text-muted-foreground text-sm">
                or
              </div>

              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full"
              >
                Login with Google
              </Button>

              {loginError && (
                <p className="text-red-500 text-sm mt-3 text-center">
                  {loginError}
                </p>
              )}
            </TabsContent>

            {/* Sign Up Tab Content */}
            <TabsContent value="signup" className="mt-4">
              <div className="space-y-4">
                {signupError && (
                  <div className="text-red-500 text-sm bg-red-100 p-2 rounded">
                    {signupError}
                  </div>
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
                <Button className="w-full" disabled={signupLoading} onClick={handleEmailSignup}>
                  {signupLoading ? "Signing up..." : "Sign Up with Email"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">or</div>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogleSignup}
                >
                  Continue with Google
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;