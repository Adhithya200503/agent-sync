import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle,CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/AuthContext";
import { auth, provider } from "../../firebase/firebase";
import {Link, useNavigate} from "react-router-dom"
const LoginPage = () => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/auth/check-profile");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, provider);
      navigate("/auth/check-profile");
    } catch (err) {
      setError(err.message);
    }
  };

  if (currentUser) {
    return (
      <div className="flex justify-center mt-10 text-center">
        <Card className="w-[400px] p-6">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Logged in as <strong>{currentUser.email}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-[400px] p-6 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              placeholder="Email"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder="Password"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
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

          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
           <span className="text-center">Don't have an account ? <Link to="/auth/signup" className="underline">Singup</Link></span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
