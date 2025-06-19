import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase"; // Ensure this path is correct

// Shadcn UI Imports
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react"; // For the alert icon

export function ZurlUnlockPage() {
  const { shortId } = useParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state for data fetch

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(""); // Clear previous errors
      try {
        const docSnap = await getDoc(doc(db, "short-links", shortId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Check if the link is actually protected, otherwise redirect immediately
          if (!data.protected) {
            window.location.href = data.originalUrl;
            return; // Stop further execution
          }
          setLinkData(data);
        } else {
          setError("This short link does not exist.");
        }
      } catch (err) {
        console.error("Error fetching link data:", err);
        setError("Failed to load link data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shortId]);

  const handleUnlock = () => {
    setError(""); // Clear previous errors
    if (!code) {
      setError("Please enter the unlock code.");
      return;
    }
    if (code === linkData?.unLockId) {
      window.location.href = linkData.originalUrl;
    } else {
      setError("Incorrect code. Please try again.");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading link details...</p>
      </div>
    );
  }

  // Render error state for link not found or fetch error
  if (error && !linkData) { // Only show error if linkData is not found/loaded
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Uh oh! Something went wrong.</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the unlock form only if linkData is loaded and it's a protected link
  if (linkData && linkData.protected) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Unlock Your Link</CardTitle>
            <CardDescription className="mt-2 text-gray-600">
              This short URL is protected. Please enter the unlock code to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="unlock-code" className="sr-only">Unlock Code</Label>
              <Input
                id="unlock-code"
                type="password" // Use type="password" for sensitive input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter unlock code"
                className="w-full text-center py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUnlock();
                  }
                }}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Access Denied!</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleUnlock} className="w-full">
              Unlock Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback for cases where linkData is loaded but not protected (should be handled by early redirect)
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}