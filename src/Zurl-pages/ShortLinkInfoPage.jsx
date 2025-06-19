import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import ShareShortLink from "./ShareShortLink";
import QRCodeCustomizerDialog from "../components/AppComponents/QRCodeCustomizer";
import { use } from "react";
import { useAuth } from "../context/AuthContext";
import { Folder } from "lucide-react";
import { query, collection, where, getDocs } from "firebase/firestore";

const TimestampDisplay = ({ timestamp }) => {
  const date = timestamp.toDate();
  const formatted = date.toLocaleString();
  return <span className="text-gray-700">{formatted}</span>;
};

const ShortLinkInfoPage = () => {
  const { shortId } = useParams();
  const [link, setLink] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [customizeQR, setCustomizeQR] = useState(false);
  const [changedFolder, setChangedFolder] = useState("");
  const [folders, setFolders] = useState([]);
  const { currentUser } = useAuth();
  useEffect(() => {
    const fetchLink = async () => {
      try {
        const docRef = doc(db, "short-links", shortId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLink(data);
          setFormData(data);

          if (data.folderId) {
            const folderRef = doc(db, "folders", data.folderId);
            const folderSnap = await getDoc(folderRef);
            setFolderName(
              folderSnap.exists() ? folderSnap.data().name : "Folder not found"
            );
          }
        } else {
          toast.error("Link not found");
        }
      } catch (error) {
        toast.error("Failed to fetch link details");
        console.error(error);
      }
    };

    fetchLink();
  }, [shortId]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateUnlockId = () => {
    setFormData((prev) => ({ ...prev, unLockId: uuidv4() }));
  };
  const getUserFolders = async () => {
    try {
      const userFolderQuery = query(
        collection(db, "folders"),
        where("userId", "==", currentUser.uid)
      );
      const snapShot = await getDocs(userFolderQuery);
      const userFolderQueryData = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFolders(userFolderQueryData);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (isEditing && currentUser.uid) {
      getUserFolders();
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      const fullFormData = { ...formData, folderId: changedFolder };
      const docRef = doc(db, "short-links", shortId);
      await updateDoc(docRef, fullFormData);
      setLink(fullFormData);
      setIsEditing(false);
      if (changedFolder) {
        const folderRef = doc(db, "folders", changedFolder);
        const folderSnap = await getDoc(folderRef);
        if (folderSnap.exists()) {
          setFolderName(folderSnap.data().name);
        }
      }
      toast.success("Link updated successfully");
    } catch (err) {
      toast.error("Failed to save changes");
      console.error(err);
    }
  };
  useEffect(() => {
    if (link?.folderId) {
      setChangedFolder(link.folderId);
    }
  }, [link]);

  if (!link) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Short Link Details</h2>
        <Button onClick={() => setIsEditing((prev) => !prev)}>
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm items-center">
        <div className="col-span-full">
          <label className="font-medium">Original URL</label>
          {isEditing ? (
            <Input
              value={formData.originalUrl}
              onChange={(e) => handleChange("originalUrl", e.target.value)}
            />
          ) : (
            <div className="p-3 border rounded-md break-all">
              {link.originalUrl}
            </div>
          )}
        </div>
        <div>
          <label className="font-medium">Short URL</label>
          <div className="p-3 border rounded-md break-all">{link.shortUrl}</div>
        </div>
        <div>
          <label className="font-medium">Short ID</label>
          <div className="p-3 border rounded-md">{link.shortId}</div>
        </div>
        <div>
          <label className="font-medium">Name</label>
          {isEditing ? (
            <Input
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          ) : (
            <div className="p-3 border rounded-md">{link.name || "—"}</div>
          )}
        </div>
        <div>
          <label className="font-medium">Clicks</label>
          <div className="p-3 border rounded-md">{link.clicks}</div>
        </div>
        <div>
          <label className="font-medium">User ID</label>
          <div className="p-3 border rounded-md break-all">{link.userId}</div>
        </div>
        <div>
          <label className="font-medium">Protected</label>
          {isEditing ? (
            <Select
              value={formData.protected ? "yes" : "no"}
              onValueChange={(value) =>
                handleChange("protected", value === "yes")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 border rounded-md">
              {link.protected ? "Yes" : "No"}
            </div>
          )}
        </div>
        <div>
          <label className="font-medium">Unlock ID</label>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={formData.unLockId || ""}
                onChange={(e) => handleChange("unLockId", e.target.value)}
              />
              <Button onClick={handleGenerateUnlockId}>Generate</Button>
            </div>
          ) : (
            <div className="p-3 border rounded-md break-all">
              {link.unLockId || "—"}
            </div>
          )}
        </div>
        <div>
          <label className="font-medium">Is Active</label>
          {isEditing ? (
            <Select
              value={formData.isActive ? "yes" : "no"}
              onValueChange={(value) =>
                handleChange("isActive", value === "yes")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 border rounded-md">
              {link.isActive ? "Yes" : "No"}
            </div>
          )}
        </div>
        <div>
          <label className="font-medium">Created At</label>
          <div className="p-3 border rounded-md">
            <TimestampDisplay timestamp={link.createdAt} />
          </div>
        </div>
      </div>

      {isEditing ? (
        <div>
          <Select
            value={changedFolder}
            onValueChange={(value) => setChangedFolder(value)}
          >
            <SelectTrigger>
              <SelectValue value="select folder" />
            </SelectTrigger>
            <SelectContent>
              {folders.length > 0
                ? folders.map((folder) => (
                    <SelectItem value={folder.id} key={folder.id}>
                      <Folder className="inline mr-1" size={14} />
                      {folder.name}
                    </SelectItem>
                  ))
                : "no folder found"}
            </SelectContent>
          </Select>
        </div>
      ) : (
        link.folderId && (
          <div>
            <label className="font-medium">Folder</label>
            <div className="p-3 border rounded-md">{folderName}</div>
          </div>
        )
      )}

      <ShareShortLink shortUrl={link.shortUrl} />

      <div className="space-y-2">
        <label className="font-medium">QR Code</label>
        <img
          src={link.qrcode}
          alt="QR Code"
          className="w-40 h-40 border rounded-md"
        />
        <QRCodeCustomizerDialog
          url={link.shortUrl}
          customizeQR={customizeQR}
          setCustomizeQR={setCustomizeQR}
        />
      </div>

      {isEditing && (
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShortLinkInfoPage;
