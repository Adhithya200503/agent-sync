import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

const ZapStoreAuthPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/signup`,
        { email, password },
        { withCredentials: true } // send cookies
      );
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to signup");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/login`,
        { email, password },
        { withCredentials: true } // send cookies
      );
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to login");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    type="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    type="password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-black text-white py-2 rounded-md"
                >
                  Login
                </button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    type="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    type="password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-black text-white py-2 rounded-md"
                >
                  Signup
                </button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZapStoreAuthPage;
