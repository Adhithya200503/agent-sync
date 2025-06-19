import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Save,
  Phone,
  MessageSquare,
  ExternalLink,
  Calendar,
  Clock,
  User,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const LinkEditPage = ({id}) => {
  
  const navigate = useNavigate();

  const [link, setLink] = useState(null);
  const [editedLink, setEditedLink] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const linkRef = doc(db, "links", id);
        const linkSnap = await getDoc(linkRef);
        if (linkSnap.exists()) {
          const data = { id: linkSnap.id, ...linkSnap.data() };
          setLink(data);
          setEditedLink(data);
        } else {
          console.error("Link not found");
        }
      } catch (error) {
        console.error("Error fetching link:", error);
      }
    };

    fetchLink();
  }, [id]);

  const updateField = (field, value) => {
    setEditedLink((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "phone" || field === "message") {
        const phone = field === "phone" ? value : prev.phone;
        const message = field === "message" ? value : prev.message;
        if (phone && message) {
          updated.waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
            message
          )}`;
        }
      }

      if (field === "waUrl" && value) {
        try {
          const url = new URL(value);
          if (url.hostname === "wa.me") {
            const phone = url.pathname.substring(1);
            const message = decodeURIComponent(
              url.searchParams.get("text") || ""
            );
            updated.phone = phone;
            updated.message = message;
          }
        } catch (e) {
          console.error("Invalid URL:", e);
        }
      }

      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedData = { ...editedLink };

      if (editedLink.waUrl && editedLink.waUrl !== link.waUrl) {
        try {
          const newBase64Url = await QRCode.toDataURL(editedLink.waUrl);
          updatedData.base64DataUrl = newBase64Url;
        } catch (error) {
          console.error("Error generating QR code:", error);
        }
      }

      if (typeof editedLink.expiresAt === "string") {
        updatedData.expiresAt = new Date(editedLink.expiresAt);
      }

      updatedData.modifiedAt = new Date();

      await updateDoc(doc(db, "links", id), updatedData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setLink(updatedData);
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    if (timestamp instanceof Date) return timestamp.toLocaleString();
    return new Date(timestamp).toLocaleString();
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    return expiry < new Date();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!link) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  const expired = isExpired(editedLink.expiresAt);

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
      <div className="w-full flex flex-col items-center mx-auto mb-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Link
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modify your WhatsApp marketing link details
        </p>
      </div>
      <div className="max-w-[90%] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Links</span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={expired ? "destructive" : "default"}>
              {expired ? "Expired" : "Active"}
            </Badge>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>

        {saveSuccess && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Link updated successfully!
            </AlertDescription>
          </Alert>
        )}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit Form */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Link Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
                      {editedLink.urlId}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(editedLink.urlId)}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <Input
                    type="text"
                    value={editedLink.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Enter phone number (e.g., 1234567890)"
                    className="bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Message
                  </label>
                  <Textarea
                    value={editedLink.message || ""}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder="Enter WhatsApp message"
                    rows={4}
                    className="bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    WhatsApp URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="url"
                      value={editedLink.waUrl || ""}
                      onChange={(e) => updateField("waUrl", e.target.value)}
                      placeholder="WhatsApp URL will be generated automatically"
                      className="flex-1 bg-white dark:bg-gray-700"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(editedLink.waUrl || "")}
                      disabled={!editedLink.waUrl}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {editedLink.waUrl && (
                    <a
                      href={editedLink.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-1 block"
                    >
                      Test this link
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Expiry Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={
                      editedLink.expiresAt?.toDate
                        ? new Date(
                            editedLink.expiresAt.toDate().getTime() -
                              editedLink.expiresAt
                                .toDate()
                                .getTimezoneOffset() *
                                60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) => updateField("expiresAt", e.target.value)}
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Info */}
          <div className="space-y-6">
            {/* QR Code */}
            {editedLink.base64DataUrl && (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5" />
                    <span>QR Code</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <img
                    src={editedLink.base64DataUrl}
                    alt="QR Code"
                    className="w-48 h-48 rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Link Information */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Link Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {formatDateTime(editedLink.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Modified
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {formatDateTime(editedLink.modifiedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </p>
                    <Badge
                      variant={expired ? "destructive" : "default"}
                      className="mt-1"
                    >
                      {expired ? "Expired" : "Active"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link Preview
                  </p>
                  {editedLink.waUrl ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        When clicked, this link will:
                      </p>
                      <ul className="text-sm text-gray-900 dark:text-gray-100 space-y-1">
                        <li>• Open WhatsApp</li>
                        <li>
                          • Start a chat with: {editedLink.phone || "N/A"}
                        </li>
                        <li>
                          • Pre-fill message: "{editedLink.message || "N/A"}"
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add phone number and message to generate preview
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkEditPage;
