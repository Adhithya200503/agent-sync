import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy,
  Download,
  Loader,
  Info,
  Check,
  X,
  Folder,
  Share2,
  Eye,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { useAuth } from "../context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { use } from "react";

export default function ShortenUrlForm() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [urlName, setUrlName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFormLoading, setInitialFormLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [zaplinks, setZaplinks] = useState([]);
  const [selectedZaplinks, setSelectedZaplinks] = useState([]);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const { getAccessToken, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const zurlAppHostname = "agentsync.onrender.com";

  const fetchUserZaplinks = async () => {
    setInitialFormLoading(true);
    try {
      if (!currentUser) {
        toast.info("Please log in to manage your Zaplinks.");
        return;
      }

      const linkPagesQuery = query(
        collection(db, "linkPages"),
        where("uid", "==", currentUser.uid)
      );
      const snapShot = await getDocs(linkPagesQuery);
      const linkPagesData = snapShot.docs.map((doc) => ({
        id: doc.id,
        username: doc.data().username,
        ...doc.data(),
      }));
      setZaplinks(linkPagesData);
    } catch (error) {
      console.error("Error fetching zap links:", error);
      toast.error("Unable to fetch Zaplinks.");
    } finally {
      setInitialFormLoading(false);
    }
  };

  const getUserCreatedFolders = async () => {
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
    if (currentUser) {
      fetchUserZaplinks();
      getUserCreatedFolders();
    } else {
      setZaplinks([]);
      setSelectedZaplinks([]);
    }
  }, [currentUser]);

  const handleShorten = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const zaplinkIds = selectedZaplinks.map((link) => link.id);

    try {
      const token = await getAccessToken();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/zurl/create-short-url`,
        {
          originalUrl,
          customUrl,
          protected: isProtected,
          zaplinkIds: zaplinkIds,
          name: urlName,
          folderId: selectedFolderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(response.data);
      setOriginalUrl("");
      setCustomUrl("");
      setIsProtected(false);
      setSelectedZaplinks([]);
      setUrlName("");
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Server or network error"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success("Copied to clipboard!"))
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.top = "0";
          textArea.style.left = "0";
          textArea.style.position = "fixed";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand("copy");
            toast.success("Copied to clipboard! (Fallback)");
          } catch (err) {
            console.error("Fallback: Oops, unable to copy", err);
            toast.error("Copying failed. Please copy manually.");
          }
          document.body.removeChild(textArea);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Copied to clipboard! (Fallback)");
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
        toast.error("Copying failed. Please copy manually: " + text);
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadQrCode = () => {
    if (result && result.qrcode) {
      const link = document.createElement("a");
      link.href = result.qrcode;
      link.download = `qrcode-${result.shortId || "short-url"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR Code downloaded!");
    } else {
      toast.error("No QR Code available to download.");
    }
  };

  const handleSelectZaplink = (zaplink) => {
    setSelectedZaplinks((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (link) => link.id === zaplink.id
      );
      if (isAlreadySelected) {
        return prevSelected.filter((link) => link.id !== zaplink.id);
      } else {
        return [...prevSelected, zaplink];
      }
    });
  };

  const getZaplinkUsername = (zaplink) =>
    zaplink.username || "Untitled Zaplink";

  const getPreviewUrl = () => {
    const domainPart = zurlAppHostname;
    const pathPart = customUrl.trim() ? `/${customUrl.trim()}` : "";
    return `https://${domainPart}${pathPart}`;
  };

  return (
    <Card className="max-w-xl lg:max-w-4xl mx-auto mt-10 p-6 dark:bg-gray-800">
      <CardContent className="space-y-6">
        <h2 className="text-2xl text-center mb-4">Create a Short URL</h2>

        <div className="space-y-4">
          {initialFormLoading ? (
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              <Input
                type="url"
                placeholder="Enter original URL"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                className="w-full"
                disabled={loading}
              />

              <div className="flex gap-2.5 items-center">
                <Input
                  value={"https://agentsync.onrender.com"}
                  disabled
                ></Input>
                <span>/</span>
                <Input
                  placeholder="Optional custom alias (e.g., my-awesome-link)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <Input
                placeholder="Optional name for this URL (e.g., My Project Link)"
                value={urlName}
                onChange={(e) => setUrlName(e.target.value)}
                className="w-full"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 -mt-3 pb-4">
                Current URL will look like:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {getPreviewUrl()}
                </span>
              </p>

              <div className="flex items-center space-x-2 mb-4">
                {" "}
                {/* Added mb-4 for more space below */}
                <Checkbox
                  id="protected"
                  checked={isProtected}
                  onCheckedChange={setIsProtected}
                  disabled={loading}
                />
                <Label htmlFor="protected" className="text-muted-foreground">
                  Protect this URL with an ID
                </Label>
              </div>
              <div className="flex flex-col justify-center gap-2.5">
                <Label className="text-muted-foreground">
                  Select folder to store the file
                </Label>
                <Select onValueChange={(value) => setSelectedFolderId(value)}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>

                  <SelectContent>
                    {folders.length > 0 ? (
                      folders.map((folder) => (
                        <SelectItem value={folder.id} key={folder.id}>
                          <Folder /> {folder.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        <p>No folders found.</p>
                        <button className="mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 text-sm">
                          Create Folder
                        </button>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full mb-4">
                <Label
                  htmlFor="zaplinks-select"
                  className="mb-2 block text-muted-foreground"
                >
                  Add to Zaplink Pages (Optional)
                </Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between"
                      disabled={loading || initialFormLoading || !currentUser}
                    >
                      {selectedZaplinks.length > 0
                        ? `${selectedZaplinks.length} Zaplink(s) selected`
                        : "Select Zaplinks..."}
                      <Info className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search Zaplinks..." />

                      {zaplinks.length === 0 ? (
                        <CommandEmpty className="py-6 text-center text-sm">
                          <p className="mb-2">
                            No Zaplink found for your account.
                          </p>
                          <Button
                            onClick={() => {
                              setComboboxOpen(false); // Close combobox
                              navigate("/zap-link/create-zap-link");
                            }}
                            size="sm"
                            className="mt-2"
                          >
                            Create a Zaplink
                          </Button>
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {zaplinks.map((zaplink) => (
                            <CommandItem
                              key={zaplink.id}
                              value={zaplink.username}
                              onSelect={() => handleSelectZaplink(zaplink)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center">
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedZaplinks.some(
                                      (s) => s.id === zaplink.id
                                    )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {getZaplinkUsername(zaplink)}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedZaplinks.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">Selected Zaplinks:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedZaplinks.map((zaplink) => (
                        <div
                          key={zaplink.id}
                          className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                        >
                          {getZaplinkUsername(zaplink)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-5 w-5"
                            onClick={() => handleSelectZaplink(zaplink)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleShorten}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader className="mr-2 h-5 w-5 animate-spin" /> creating
                  </span>
                ) : (
                  "Shorten URL"
                )}
              </Button>
            </>
          )}
        </div>

        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

        {result && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md sm:max-w-xl" hideCloseButton>
              <DialogHeader>
                <DialogTitle className="text-bold">Short URL Created</DialogTitle>
                <hr></hr>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                   <div>
                    <Label>Short Link</Label>
                    <a
                    href={result.shortUrl}
                    className="text-blue-600 underline break-all text-sm sm:text-base dark:text-blue-400"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {result.shortUrl}
                  </a>
                   </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.shortUrl)}
                    className="flex items-center gap-1 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                </div>

                {/* Unlock ID */}
                {result.unLockId && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="font-medium text-gray-700 dark:text-gray-200">
                      Unlock ID (Keep this safe!):
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="break-all font-mono text-sm sm:text-base bg-gray-100 p-2 rounded dark:bg-gray-600 dark:text-gray-100">
                        {result.unLockId}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.unLockId)}
                        className="flex items-center gap-1 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <Copy className="h-4 w-4" /> Copy ID
                      </Button>
                    </div>
                  </div>
                )}

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <p className="mb-2 text-gray-700 dark:text-gray-200">
                    QR Code:
                  </p>
                  {loading ? (
                    <Skeleton className="w-40 h-40" />
                  ) : (
                    <img
                      src={result.qrcode}
                      alt="QR Code"
                      className="w-40 h-40 object-contain border p-1 bg-white rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-800"
                      draggable={false}
                    />
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={downloadQrCode}
                    className="mt-3 flex items-center gap-1 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Download className="h-4 w-4" /> Download QR
                  </Button>
                </div>
              </div>

              {/* Footer with Share + View Details */}
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-1"
                  onClick={() =>
                    navigator.share
                      ? navigator.share({
                          title: "Check out this link",
                          url: result.shortUrl,
                        })
                      : copyToClipboard(result.shortUrl)
                  }
                >
                  <Share2 className="h-4 w-4" /> Share
                </Button>

                <Button
                  variant="default"
                  className="flex items-center gap-1"
                  onClick={() => window.open(`/link/${result.id}`, "_blank")}
                >
                  <Eye className="h-4 w-4" /> View Details
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {isDialogOpen ? "" : <Button onClick={setIsDialogOpen}>View Short link</Button>}
      </CardContent>
    </Card>
  );
}
