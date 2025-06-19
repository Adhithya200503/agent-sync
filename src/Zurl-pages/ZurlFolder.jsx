// components/ZurlFolder.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc, // Kept this as it might be useful elsewhere or re-added if needed
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Folder,
  Plus,
  Loader,
  Check,
  ChevronsUpDown,
  XCircle,
  FolderOpen,
  LinkIcon,
  Trash2,
  Pencil,
  Link,
  ExternalLink,
  MoreVertical
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "../../firebase/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const ZurlFolder = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // --- Create Folder Dialog States ---
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedLinkIds, setSelectedLinkIds] = useState([]);
  const [availableLinks, setAvailableLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [error, setError] = useState(null);

  // --- Folder List States ---
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [folderListError, setFolderListError] = useState(null);

  // --- Selected Folder and its Links States ---
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [linksInSelectedFolder, setLinksInSelectedFolder] = useState([]);
  const [loadingLinksInFolder, setLoadingLinksInFolder] = useState(false);
  const [linksInFolderError, setLinksInFolderError] = useState(null);

  // --- Folder Rename Dialog States ---
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [newFolderNameValue, setNewFolderNameValue] = useState("");
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [renameFolderError, setRenameFolderError] = useState(null);

  // --- Link Rename Dialog States ---
  const [isRenameLinkDialogOpen, setIsRenameLinkDialogOpen] = useState(false);
  const [linkToRename, setLinkToRename] = useState(null);
  const [newLinkTitleValue, setNewLinkTitleValue] = useState("");
  const [isRenamingLink, setIsRenamingLink] = useState(false);
  const [renameLinkError, setRenameLinkError] = useState(null);

  // --- Add Link to Folder Dialog States (from available links) ---
  const [isAddLinkToFolderDialogOpen, setIsAddLinkToFolderDialogOpen] = useState(false);
  const [selectedLinksToAdd, setSelectedLinksToAdd] = useState([]);
  const [availableLinksForAdd, setAvailableLinksForAdd] = useState([]);
  const [loadingAvailableLinksForAdd, setLoadingAvailableLinksForAdd] = useState(false);
  const [addLinkToFolderError, setAddLinkToFolderError] = useState(null);
  const [isAddingLinksToFolder, setIsAddingLinksToFolder] = useState(false);

  // --- Effect to fetch user's links for folder creation dialog ---
  useEffect(() => {
    if (isCreateFolderDialogOpen && userId && db) {
      const fetchLinks = async () => {
        setLoadingLinks(true);
        setError(null);
        try {
          const linksQuery = query(
            collection(db, "short-links"),
            where("userId", "==", userId),
            where("folderId", "==", null),
            orderBy("createdAt", "desc")
          );
          const snapshot = await getDocs(linksQuery);
          const linksData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("the data:",linksData)
          setAvailableLinks(linksData);
        } catch (e) {
          console.error("Error fetching links for selection:", e);
          setError("Failed to load links for selection.");
        } finally {
          setLoadingLinks(false);
        }
      };
      fetchLinks();
    } else if (!isCreateFolderDialogOpen) {
      setNewFolderName("");
      setSelectedLinkIds([]);
      setError(null);
      setAvailableLinks([]);
    }
  }, [isCreateFolderDialogOpen, userId, db]);

  // --- Effect & Callback to fetch user's folders ---
  const fetchFolders = useCallback(async () => {
    console.log("fetchFolders called. userId:", userId, "selectedFolder.id before fetch:", selectedFolder?.id);
    if (!userId || !db) {
      console.log("fetchFolders: Skipping due to missing userId or db.");
      setLoadingFolders(false);
      return;
    }
    setLoadingFolders(true);
    setFolderListError(null);
    try {
      const foldersQuery = query(
        collection(db, "folders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(foldersQuery);
      const foldersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFolders(foldersData);
      console.log("fetchFolders: Folders fetched, count:", foldersData.length);

      if (selectedFolder) {
        const foundUpdatedFolder = foldersData.find(f => f.id === selectedFolder.id);
        if (!foundUpdatedFolder) {
          console.log("fetchFolders: Selected folder was deleted, deselecting.");
          setSelectedFolder(null);
          setLinksInSelectedFolder([]);
        }
      }

    } catch (e) {
      console.error("fetchFolders Error:", e);
      setFolderListError("Failed to load your folders.");
    } finally {
      console.log("fetchFolders: Setting setLoadingFolders(false).");
      setLoadingFolders(false);
    }
  }, [userId, db, selectedFolder]);

  useEffect(() => {
    console.log("useEffect for fetchFolders triggered. fetchFolders changed?", fetchFolders);
    fetchFolders();
  }, [fetchFolders, isCreateFolderDialogOpen, isRenameFolderDialogOpen]);

  // --- Effect & Callback to fetch links within a selected folder ---
  const fetchLinksInFolder = useCallback(async () => {
    console.log("fetchLinksInFolder called. selectedFolder.id:", selectedFolder?.id, "userId:", userId);
    if (!selectedFolder || !userId || !db) {
      console.log("fetchLinksInFolder: Skipping due to missing selectedFolder, userId or db.");
      setLinksInSelectedFolder([]);
      return;
    }
    console.log("fetchLinksInFolder: Setting setLoadingLinksInFolder(true).");
    setLoadingLinksInFolder(true);
    setLinksInFolderError(null);
    try {
      const linksQuery = query(
        collection(db, "short-links"),
        where("userId", "==", userId),
        where("folderId", "==", selectedFolder.id),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(linksQuery);
      const linksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLinksInSelectedFolder(linksData);
      console.log("fetchLinksInFolder: Links fetched for folder", selectedFolder?.name, "count:", linksData.length);
    } catch (e) {
      console.error("fetchLinksInFolder Error:", e);
      setLinksInFolderError("Failed to load links for this folder.");
    } finally {
      console.log("fetchLinksInFolder: Setting setLoadingLinksInFolder(false).");
      setLoadingLinksInFolder(false);
    }
  }, [selectedFolder, userId, db]);

  useEffect(() => {
    console.log("useEffect for fetchLinksInFolder triggered. fetchLinksInFolder changed?", fetchLinksInFolder);
    fetchLinksInFolder();
  }, [fetchLinksInFolder]);

  // --- Handlers for Create Folder Dialog ---
  const handleLinkSelectionChange = (linkId) => {
    setSelectedLinkIds((prevSelected) =>
      prevSelected.includes(linkId)
        ? prevSelected.filter((id) => id !== linkId)
        : [...prevSelected, linkId]
    );
  };

  const handleFolderCreation = async () => {
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty.");
      return;
    }
    if (!userId || !db) {
      setError("Authentication required to create folders.");
      return;
    }

    setIsCreatingFolder(true);
    setError(null);

    try {
      const newFolderRef = doc(collection(db, "folders"));
      await setDoc(newFolderRef, {
        name: newFolderName.trim(),
        userId: userId,
        createdAt: new Date().toISOString(),
        // linkCount removed from here
      });

      if (selectedLinkIds.length > 0) {
        const batch = writeBatch(db);
        selectedLinkIds.forEach((linkId) => {
          const linkRef = doc(db, "short-links", linkId);
          batch.update(linkRef, { folderId: newFolderRef.id });
        });
        await batch.commit();
      }

      setIsCreateFolderDialogOpen(false);
      setNewFolderName("");
      setSelectedLinkIds([]);
      toast.success("Folder created successfully!");
    } catch (e) {
      console.error("Error during folder creation:", e);
      setError("Failed to create folder. " + (e.message || "Please try again."));
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const displaySelectedLinksCount = () => {
    const count = selectedLinkIds.length;
    if (count === 0) return "Select links to add (optional)";
    return `${count} link${count !== 1 ? "s" : ""} selected`;
  };

  // --- Handlers for Folder Actions ---
  const handleFolderClick = (folder) => {
    console.log("handleFolderClick: Setting selectedFolder to:", folder.name, folder.id);
    setSelectedFolder(folder);
  };

  const handleRenameFolderClick = (folder) => {
    setFolderToRename(folder);
    setNewFolderNameValue(folder.name);
    setIsRenameFolderDialogOpen(true);
    setRenameFolderError(null);
  };

  const handleRenameFolder = async () => {
    if (!newFolderNameValue.trim()) {
      setRenameFolderError("Folder name cannot be empty.");
      return;
    }
    if (!folderToRename || !userId || !db) return;

    setIsRenamingFolder(true);
    setRenameFolderError(null);

    try {
      const folderRef = doc(db, "folders", folderToRename.id);
      await updateDoc(folderRef, { name: newFolderNameValue.trim() });
      setIsRenameFolderDialogOpen(false);
      toast.success("Folder renamed successfully!");
    } catch (e) {
      console.error("Error renaming folder:", e);
      setRenameFolderError("Failed to rename folder. " + (e.message || "Please try again."));
    } finally {
      setIsRenamingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId, folderName) => { // Removed linkCount from params
    if (!userId || !db) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the folder "${folderName}"?\n\nLinks previously assigned to this folder will become unassigned but will NOT be deleted.` // Updated message
    );

    if (!confirmDelete) return;

    try {
      const batch = writeBatch(db);

      // 1. Unassign links from this folder
      const linksQuery = query(
        collection(db, "short-links"),
        where("userId", "==", userId),
        where("folderId", "==", folderId)
      );
      const snapshot = await getDocs(linksQuery);
      snapshot.docs.forEach((linkDoc) => {
        const linkRef = doc(db, "short-links", linkDoc.id);
        batch.update(linkRef, { folderId: null });
      });

      // 2. Delete the folder document
      const folderRef = doc(db, "folders", folderId);
      batch.delete(folderRef);

      await batch.commit();

      setSelectedFolder(null);
      toast.success("Folder deleted successfully!");
      fetchFolders();
    } catch (e) {
      console.error("Error deleting folder:", e);
      toast.error("Failed to delete folder: " + (e.message || "Please try again."));
    }
  };

  // --- Handlers for Link Actions within Selected Folder ---

  const handleRenameLinkClick = (link) => {
    setLinkToRename(link);
    setNewLinkTitleValue(link.title || link.shortUrl);
    setIsRenameLinkDialogOpen(true);
    setRenameLinkError(null);
  };

  const handleRenameLink = async () => {
    if (!newLinkTitleValue.trim()) {
      setRenameLinkError("Link title cannot be empty.");
      return;
    }
    if (!linkToRename || !userId || !db) return;

    setIsRenamingLink(true);
    setRenameLinkError(null);

    try {
      const linkRef = doc(db, "short-links", linkToRename.id);
      await updateDoc(linkRef, { title: newLinkTitleValue.trim() });
      setIsRenameLinkDialogOpen(false);
      toast.success("Link renamed successfully!");
      fetchLinksInFolder();
    } catch (e) {
      console.error("Error renaming link:", e);
      setRenameLinkError("Failed to rename link. " + (e.message || "Please try again."));
    } finally {
      setIsRenamingLink(false);
    }
  };

  const handleDeleteLinkFromFolder = async (linkId, shortUrl) => {
    if (!selectedFolder || !userId || !db) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to remove the link "${shortUrl}" from "${selectedFolder.name}"? This will NOT delete the link, only unassign it from this folder.`
    );

    if (!confirmDelete) return;

    try {
      const batch = writeBatch(db);

      const linkRef = doc(db, "short-links", linkId);
      batch.update(linkRef, { folderId: null });

      // Removed batch.update(folderRef, { linkCount: ... });

      await batch.commit();

      toast.success("Link unassigned from folder successfully!");
      fetchLinksInFolder(); // Still need to refresh links for current folder view
      fetchFolders(); // To refresh folder list (though linkCount not shown on cards anymore)
    } catch (e) {
      console.error("Error unassigning link from folder:", e);
      toast.error("Failed to remove link from folder: " + (e.message || "Please try again."));
    }
  };

  const handleAddLinksToFolderClick = async () => {
    if (!selectedFolder || !userId || !db) return;

    setLoadingAvailableLinksForAdd(true);
    setAddLinkToFolderError(null);
    setSelectedLinksToAdd([]);

    try {
      const unassignedLinksQuery = query(
        collection(db, "short-links"),
        where("userId", "==", userId),
        where("folderId", "==", null)
      );
      const unassignedLinksSnapshot = await getDocs(unassignedLinksQuery);
      const unassignedLinks = unassignedLinksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setAvailableLinksForAdd(unassignedLinks);
      setIsAddLinkToFolderDialogOpen(true);
    } catch (e) {
      console.error("Error fetching available links to add:", e);
      setAddLinkToFolderError("Failed to load available links.");
    } finally {
      setLoadingAvailableLinksForAdd(false);
    }
  };

  const handleAddSelectedLinksToFolder = async () => {
    if (selectedLinksToAdd.length === 0 || !selectedFolder || !userId || !db) {
      setAddLinkToFolderError("Please select at least one link.");
      return;
    }

    setIsAddingLinksToFolder(true);
    setAddLinkToFolderError(null);

    try {
      const batch = writeBatch(db);

      selectedLinksToAdd.forEach((linkId) => {
        const linkRef = doc(db, "short-links", linkId);
        batch.update(linkRef, { folderId: selectedFolder.id });
      });

      // Removed batch.update(folderRef, { linkCount: ... });

      await batch.commit();

      setIsAddLinkToFolderDialogOpen(false);
      toast.success(`${selectedLinksToAdd.length} link(s) added to folder successfully!`);
      fetchLinksInFolder();
      fetchFolders();
    } catch (e) {
      console.error("Error adding links to folder:", e);
      setAddLinkToFolderError("Failed to add links. " + (e.message || "Please try again."));
    } finally {
      setIsAddingLinksToFolder(false);
    }
  };

  const handleAvailableLinkForAddSelectionChange = (linkId) => {
    setSelectedLinksToAdd((prevSelected) =>
      prevSelected.includes(linkId)
        ? prevSelected.filter((id) => id !== linkId)
        : [...prevSelected, linkId]
    );
  };

  return (
    <div className="folder-management p-4 flex flex-col gap-6">
      {/* --- Create Folder Dialog Trigger --- */}
      <div className="flex justify-start">
        <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-5 w-5" /> New Folder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold dark:text-white">Create New Folder</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Enter a name for your new folder and optionally add <span className="font-semibold text-blue-400">unassigned</span> links to it.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="folderName" className="text-right dark:text-gray-200">
                  Folder Name
                </Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="e.g., Marketing Campaigns 2024"
                  disabled={isCreatingFolder}
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="addLinks" className="text-right mt-2 dark:text-gray-200">
                  Add Links
                </Label>
                <div className="col-span-3 w-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        disabled={loadingLinks || isCreatingFolder}
                      >
                        {loadingLinks ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          displaySelectedLinksCount()
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 dark:bg-gray-700 dark:border-gray-600">
                      <Command className="dark:bg-gray-700">
                        <CommandInput
                          placeholder="Search links..."
                          className="dark:text-white dark:placeholder-gray-400"
                        />
                        <CommandList>
                          {loadingLinks ? (
                            <CommandEmpty className="py-6 text-center text-gray-500">
                              Loading links...
                            </CommandEmpty>
                          ) : availableLinks.length === 0 ? (
                            <CommandEmpty className="py-6 text-center text-gray-500">
                              No unassigned links found for this user.
                            </CommandEmpty>
                          ) : (
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {availableLinks.map((link) => (
                                <CommandItem
                                  key={link.id}
                                  value={link.title || link.shortUrl || link.originalUrl}
                                  onSelect={() => handleLinkSelectionChange(link.id)}
                                  className="flex items-center gap-2 dark:text-gray-200 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
                                >
                                  <Checkbox
                                    checked={selectedLinkIds.includes(link.id)}
                                    onCheckedChange={() => handleLinkSelectionChange(link.id)}
                                    className="dark:border-gray-500 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:text-white"
                                  />
                                  <span className="truncate">
                                    {link.title || link.shortUrl || link.originalUrl}
                                  </span>
                                  <Check
                                    className={`ml-auto h-4 w-4 ${
                                      selectedLinkIds.includes(link.id) ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
                <XCircle className="h-4 w-4" /> {error}
              </p>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateFolderDialogOpen(false)}
                disabled={isCreatingFolder}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFolderCreation}
                disabled={!newFolderName.trim() || isCreatingFolder}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {isCreatingFolder ? (
                  <span className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </span>
                ) : (
                  "Create Folder"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- Display Existing Folders Section --- */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Folders</h2>
        {loadingFolders ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        ) : folderListError ? (
          <p className="text-red-500 flex items-center gap-1">
            <XCircle className="h-5 w-5" /> {folderListError}
          </p>
        ) : folders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            You haven't created any folders yet. Click "New Folder" to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`bg-card dark:bg-gray-700 text-card-foreground dark:text-white rounded-lg shadow-md p-4 flex flex-col justify-between h-24 relative
                  ${selectedFolder?.id === folder.id ? "border-2 border-blue-500 ring-2 ring-blue-500" : "border border-gray-200 dark:border-gray-600"}
                  hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors
                `}
              >
                <button
                  onClick={() => handleFolderClick(folder)}
                  className="absolute inset-0 z-0 p-4 flex flex-col justify-between items-start text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="h-6 w-6 text-blue-500" />
                    <h3 className="font-medium text-lg truncate">{folder.name}</h3>
                  </div>
                  {/* Removed linkCount display from here */}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Links
                  </p>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 p-0 h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40 dark:bg-gray-700 dark:border-gray-600">
                    <DropdownMenuLabel className="dark:text-white">Folder Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:bg-gray-600" />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFolderClick(folder);
                      }}
                      className="dark:text-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id, folder.name); // Removed folder.linkCount
                      }}
                      className="text-red-500 dark:text-red-400 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Selected Folder Details and Links Section --- */}
      {selectedFolder && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-8 bg-white dark:bg-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <FolderOpen className="h-7 w-7 text-blue-500" />
              {selectedFolder.name}
              <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                ({linksInSelectedFolder.length || 0} links)
              </span>
            </h2>
            <Button
              onClick={handleAddLinksToFolderClick}
              className="bg-blue-600 hover:bg-blue-800 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Link
            </Button>
          </div>

          {linksInFolderError ? (
            <p className="text-red-500 flex items-center gap-1 py-8">
              <XCircle className="h-5 w-5" /> {linksInFolderError}
            </p>
          ) : linksInSelectedFolder.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No links found in this folder. Add some using the "Add Link" button!
            </p>
          ) : (
            <div className="grid gap-4">
              {linksInSelectedFolder.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-grow">
                    <LinkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span
                        className="font-medium text-blue-600 hover:underline cursor-pointer truncate dark:text-blue-400"
                        onClick={() => window.open(link.shortUrl, "_blank")}
                      >
                        {link.title || link.shortUrl}
                      </span>
                      <span className="text-sm text-gray-600 truncate dark:text-gray-300">
                        <ExternalLink className="inline-block h-3 w-3 mr-1 align-text-bottom" />
                        {link.originalUrl.length > 50 ? `${link.originalUrl.slice(0, 50)}...` : link.originalUrl}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-800 self-end sm:self-center"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 dark:bg-gray-700 dark:border-gray-600">
                      <DropdownMenuLabel className="dark:text-white">Link Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="dark:bg-gray-600" />
                      <DropdownMenuItem
                        onClick={() => handleRenameLinkClick(link)}
                        className="dark:text-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Rename Title
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteLinkFromFolder(link.id, link.shortUrl)}
                        className="text-red-500 dark:text-red-400 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove from Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Rename Folder Dialog --- */}
      <Dialog open={isRenameFolderDialogOpen} onOpenChange={setIsRenameFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Rename Folder</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Change the name of your folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newFolderName" className="text-right dark:text-gray-200">
                New Name
              </Label>
              <Input
                id="newFolderName"
                value={newFolderNameValue}
                onChange={(e) => setNewFolderNameValue(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                disabled={isRenamingFolder}
              />
            </div>
            {renameFolderError && (
              <p className="text-red-500 text-sm col-span-full flex items-center gap-1 justify-end">
                <XCircle className="h-4 w-4" /> {renameFolderError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameFolderDialogOpen(false)}
              disabled={isRenamingFolder}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameFolder}
              disabled={!newFolderNameValue.trim() || isRenamingFolder}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isRenamingFolder ? (
                <span className="flex items-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Renaming...
                </span>
              ) : (
                "Rename"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Rename Link Dialog --- */}
      <Dialog open={isRenameLinkDialogOpen} onOpenChange={setIsRenameLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Rename Link Title</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Change the display title for this link. The actual short URL won't change.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newLinkTitle" className="text-right dark:text-gray-200">
                New Title
              </Label>
              <Input
                id="newLinkTitle"
                value={newLinkTitleValue}
                onChange={(e) => setNewLinkTitleValue(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                disabled={isRenamingLink}
              />
            </div>
            {renameLinkError && (
              <p className="text-red-500 text-sm col-span-full flex items-center gap-1 justify-end">
                <XCircle className="h-4 w-4" /> {renameLinkError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameLinkDialogOpen(false)}
              disabled={isRenamingLink}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameLink}
              disabled={!newLinkTitleValue.trim() || isRenamingLink}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isRenamingLink ? (
                <span className="flex items-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Renaming...
                </span>
              ) : (
                "Rename"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Add Link to Folder Dialog --- */}
      <Dialog open={isAddLinkToFolderDialogOpen} onOpenChange={setIsAddLinkToFolderDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add Links to "{selectedFolder?.name}"</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Select links to add to this folder. Only links not already in this folder are shown.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingAvailableLinksForAdd ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-8 w-8 animate-spin text-blue-500" />
                <p className="ml-2 text-gray-500">Loading available links...</p>
              </div>
            ) : addLinkToFolderError ? (
              <p className="text-red-500 flex items-center gap-1">
                <XCircle className="h-5 w-5" /> {addLinkToFolderError}
              </p>
            ) : availableLinksForAdd.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No unassigned links available to add.
              </p>
            ) : (
              <Command className="dark:bg-gray-700 border dark:border-gray-600 rounded-md">
                <CommandInput placeholder="Search available links..." className="dark:text-white dark:placeholder-gray-400" />
                <CommandList className="max-h-60 overflow-y-auto">
                  <CommandGroup>
                    {availableLinksForAdd.map((link) => (
                      <CommandItem
                        key={link.id}
                        value={link.title || link.shortUrl || link.originalUrl}
                        onSelect={() => handleAvailableLinkForAddSelectionChange(link.id)}
                        className="flex items-center gap-2 dark:text-gray-200 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
                      >
                        <Checkbox
                          checked={selectedLinksToAdd.includes(link.id)}
                          onCheckedChange={() => handleAvailableLinkForAddSelectionChange(link.id)}
                          className="dark:border-gray-500 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:text-white"
                        />
                        <span className="truncate">{link.title || link.shortUrl || link.originalUrl}</span>
                        <Check
                          className={`ml-auto h-4 w-4 ${
                            selectedLinksToAdd.includes(link.id) ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </div>
          {selectedLinksToAdd.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {selectedLinksToAdd.length} link(s) selected.
            </p>
          )}
          {addLinkToFolderError && (
            <p className="text-red-500 text-sm mt-4 flex items-center gap-1">
              <XCircle className="h-4 w-4" /> {addLinkToFolderError}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddLinkToFolderDialogOpen(false)}
              disabled={isAddingLinksToFolder}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelectedLinksToFolder}
              disabled={selectedLinksToAdd.length === 0 || isAddingLinksToFolder}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isAddingLinksToFolder ? (
                <span className="flex items-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </span>
              ) : (
                "Add Selected Links"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZurlFolder;