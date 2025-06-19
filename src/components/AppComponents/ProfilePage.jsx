import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebase";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    shortLinks: 0,
    linkPages: 0,
    portfolios: 0,
    links: 0,
  });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      setPhone(user.phoneNumber || "");

      const loadFirestoreData = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.phone && !user.phoneNumber) {
            setPhone(data.phone);
          }
        }

        const shortLinksRef = collection(db, "short-links");
        const shortLinksQuery = query(
          shortLinksRef,
          where("userId", "==", user.uid)
        );
        const shortLinksCount = (
          await getCountFromServer(shortLinksQuery)
        ).data().count;

        const linkPagesRef = collection(db, "linkPages");
        const linkPagesQuery = query(
          linkPagesRef,
          where("uid", "==", user.uid)
        );
        const linkPagesCount = (await getCountFromServer(linkPagesQuery)).data()
          .count;

        const portfoliosRef = collection(db, "portfolios");
        const portfoliosQuery = query(
          portfoliosRef,
          where("userId", "==", user.uid)
        );
        const portfoliosCount = (
          await getCountFromServer(portfoliosQuery)
        ).data().count;

        const linksRef = collection(db, "links");
        const linksQuery = query(linksRef, where("userId", "==", user.uid));
        const linksCount = (await getCountFromServer(linksQuery)).data().count;

        setCounts({
          shortLinks: shortLinksCount,
          linkPages: linkPagesCount,
          portfolios: portfoliosCount,
          links: linksCount,
        });
      };

      loadFirestoreData();
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, {
        displayName,
        photoURL,
      });

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          displayName,
          photoURL,
          phone,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("Profile updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-10 text-gray-500">No user logged in.</div>
    );
  }
  const handleZurlClick = () => {
    navigate("/zurl/link-list");
  };
  const handleZapLink = () => {
    navigate("/zap-link");
  };

  const handlePortfolios = () => {
    navigate("/bio-gram/portfolios");
  };

  const handleWhatsapp = () => {
    navigate("/whatsapp/view-links");
  };
  return (
    <div className="max-w-[60vw] mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={photoURL} />
              <AvatarFallback>
                {user.email?.[0].toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.email}</p>
              <p className="text-sm text-muted-foreground">UID: {user.uid}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-2.5">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="createdAt">Created at</Label>
              <Badge className="bg-blue-500 text-white p-2">
                {user.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleString()
                  : "N/A"}
              </Badge>
            </div>
          </div>

          <Button onClick={handleUpdate} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>
      <div className="user-usage-info grid gird-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2.5">
        <Card
          className="transform transition-transform duration-300 hover:scale-105"
          onClick={handleZurlClick}
        >
          <CardHeader className="flex justify-center">
            <p>Zurl links</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <span className="text-2xl"> {counts.shortLinks}</span>
          </CardContent>
        </Card>
        <Card
          className="transform transition-transform duration-300 hover:scale-105"
          onClick={handleZapLink}
        >
          <CardHeader className="flex justify-center">
            <p>Zap links</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <span className="text-2xl">{counts.linkPages}</span>
          </CardContent>
        </Card>
        <Card
          className="transform transition-transform duration-300 hover:scale-105"
          onClick={handlePortfolios}
        >
          <CardHeader className="flex justify-center">
            <p>Bio gram</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <span className="text-2xl"> {counts.portfolios}</span>
          </CardContent>
        </Card>
        <Card
          className="transform transition-transform duration-300 hover:scale-105"
          onClick={handleWhatsapp}
        >
          <CardHeader className="flex justify-center">
            <p>Whatsapp links</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <span className="text-2xl"> {counts.links}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
