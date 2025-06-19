import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Import Popover components
import { Calendar } from "@/components/ui/calendar"; // Import Calendar component
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for class merging
import { format } from "date-fns"; // For date formatting

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebookF,
  faLinkedinIn,
  faTwitter,
  faYoutube,
  faTwitch,
  faGithub,
  faDiscord
} from "@fortawesome/free-brands-svg-icons";
import {
  faLink,
  faEnvelope,
  faTimes,
  faGlobe,
  faDownload,
  faCopy,
  faEdit,
  faTrash,
  faArrowLeft,
  faSave,
  faPlus,
  faChartBar,
  faCalendar as faCalendarIcon, // Renamed to avoid conflict with Calendar component
  faLaugh, // For emoji picker trigger
  faExternalLinkAlt, // For opening links in new tabs
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import QRCode from "qrcode";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react"; // Import EmojiPicker

// Re-using Shadcn UI icons for consistency where available, otherwise FontAwesome
import { BarChart, Edit, Share2, Trash2, PlusCircle, X } from "lucide-react"; // Import X for clear date

const TEMPLATES = [
  { name: "DEFAULT", value: "default" },
  { name: "FROSTED GLASS", value: "frosted-glass" },
  { name: "BREEZE", value: "breeze" },
  { name: "COLOR BURST", value: "color-burst" },
  { name: "TERMINAL", value: "terminal" },
  { name: "PASTEL", value: "pastel" },
  { name: "GAMER", value: "gamer" },
];

// Re-aligning PLATFORMS to use FontAwesomeIcon objects directly for the `icon` prop
const PLATFORMS = [
  { name: "Instagram", icon: faInstagram, prefix: "https://instagram.com/" },
  { name: "Facebook", icon: faFacebookF, prefix: "https://facebook.com/" },
  { name: "LinkedIn", icon: faLinkedinIn, prefix: "https://linkedin.com/in/" },
  { name: "Twitter", icon: faTwitter, prefix: "https://twitter.com/" },
  { name: "YouTube", icon: faYoutube, prefix: "https://youtube.com/" }, // Corrected YouTube prefix
  { name: "Twitch", icon: faTwitch, prefix: "https://twitch.tv/" },
  { name: "GitHub", icon: faGithub, prefix: "https://github.com/" },
  { name: "Discord", icon: faDiscord, prefix: "https://discord.gg/" },
  { name: "Website", icon: faGlobe, prefix: "https://" },
  { name: "Gmail", icon: faEnvelope, prefix: "mailto:" },
  { name: "Custom", icon: faLink, prefix: "" },
];

// Helper component for FontAwesome Icons
const LinkIcon = ({ icon, className }) => (
  <FontAwesomeIcon icon={icon} className={className} />
);

const baseDomain = window.location.origin;

const ZapLinkHome = () => {
  const { currentUser, authLoading } = useAuth();
  const [userLinkPages, setUserLinkPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);
  const [username, setUsername] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [template, setTemplate] = useState(TEMPLATES[0].value);
  const [links, setLinks] = useState([
    { platform: "Instagram", value: "", title: "" },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [linkPageUrl, setLinkPageUrl] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const qrCodeRef = useRef(null);
  const navigate = useNavigate();

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(undefined); // Initialize with undefined

  // Emoji picker states and refs
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeLinkIndex, setActiveLinkIndex] = useState(null);
  const customLinkInputRefs = useRef([]); // Ref for each custom link title input
  const emojiPickerRef = useRef(null); // Ref for the emoji picker itself
  const emojiTriggerRefs = useRef([]); // <--- THIS IS THE CRUCIAL LINE! Make sure it's here.
  const [pickerStyles, setPickerStyles] = useState({}); // State for dynamic picker positioning

  // Define handleEmojiClick here
  const handleEmojiClick = (emojiData) => {
    if (activeLinkIndex !== null) {
      const currentLink = links[activeLinkIndex];
      // Append the selected emoji to the current title
      handleLinkChange(
        activeLinkIndex,
        "title",
        currentLink.title + emojiData.emoji
      );
    }
    setShowEmojiPicker(false); // Hide the picker after selection
    setActiveLinkIndex(null); // Reset active link index
  };

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest(".emoji-picker-trigger") // Prevent closing if clicking the emoji icon
      ) {
        setShowEmojiPicker(false);
        setActiveLinkIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const generateQrCode = useCallback(async (url) => {
    if (!url) {
      setQrCodeDataUrl("");
      return;
    }
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
      setQrCodeDataUrl("");
    }
  }, []);

  const fetchUserLinkPages = useCallback(async () => {
    if (!currentUser || authLoading) return;

    try {
      const linkPagesRef = collection(db, "linkPages");
      const q = query(linkPagesRef, where("uid", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);

      const fetchedPages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Ensure createdAt is a string, handling potential Firebase Timestamp objects
        createdAt:
          doc.data().createdAt?.toDate().toISOString() ||
          new Date().toISOString(),
      }));
      setUserLinkPages(fetchedPages);
    } catch (error) {
      console.error("Error fetching user link pages:", error);
      toast.error("Failed to load your link pages.");
    }
  }, [currentUser, authLoading]);

  useEffect(() => {
    fetchUserLinkPages();
  }, [fetchUserLinkPages]);

  useEffect(() => {
    generateQrCode(linkPageUrl);
  }, [linkPageUrl, generateQrCode]);

  useEffect(() => {
    if (username.trim()) {
      setLinkPageUrl(`${baseDomain}/zaplink/${username}`);
    } else {
      setLinkPageUrl("");
    }
  }, [username]);

  // Effect to calculate picker position when it's about to be shown
  useEffect(() => {
    if (showEmojiPicker && activeLinkIndex !== null) {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Approximate height and width of the emoji picker.
      // Make sure these are reasonably accurate for proper centering.
      const pickerApproxHeight = 450;
      const pickerApproxWidth = 350;

      // Calculate top and left to perfectly center it in the viewport
      const topPosition = viewportHeight / 2 - pickerApproxHeight / 2;
      const leftPosition = viewportWidth / 2 - pickerApproxWidth / 2;

      // Ensure it doesn't go off-screen if the viewport is very small
      const finalTop = Math.max(16, topPosition); // At least 16px from top
      const finalLeft = Math.max(16, leftPosition); // At least 16px from left

      setPickerStyles({
        position: "fixed", // Use 'fixed' to position relative to the viewport
        top: `${finalTop}px`,
        left: `${finalLeft}px`,
        maxHeight: `${viewportHeight - 32}px`, // Allow some padding on top/bottom
        overflowY: "auto", // Keep scrolling if content is too tall
        width: `${pickerApproxWidth}px`, // Explicitly set width
        backgroundColor: "var(--background)", // Ensure it has a background
        zIndex: 1000, // Ensure it's on top
      });
    } else {
      // Reset styles when the picker is not shown
      setPickerStyles({});
    }
    // Dependencies: only showEmojiPicker as position is now fixed to screen
    // activeLinkIndex is still needed to conditionally render the picker for the right input.
  }, [showEmojiPicker, activeLinkIndex]); // Removed links.length as it's no longer relevant for positioning

  const handleLinkChange = (index, field, value) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  const addLink = () => {
    // Default to "Custom" link as it's the most flexible starting point
    setLinks([...links, { platform: "Custom", value: "", title: "" }]);
  };

  const removeLink = (index) => {
    if (links.length === 1) {
      toast.error("At least one link is required.");
      return;
    }
    const updated = [...links];
    updated.splice(index, 1);
    setLinks(updated);
  };

  const handleProfilePicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "music-album"); // Ensure this matches your Cloudinary preset

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/datvfcnme/image/upload`, // Replace 'datvfcnme' with your Cloudinary cloud name
        formData
      );
      setProfilePic(response.data.secure_url);
      toast.success("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
    setUsername(page.username);
    setInitialUsername(page.username);
    setBio(page.bio || "");
    setProfilePic(page.profilePic || "");
    setTemplate(page.template || TEMPLATES[0].value);

    // Ensure page.links is an array before mapping.
    // If page.links is not an array (e.g., it's the number 0), default to an empty array.
    const rawLinks = Array.isArray(page.links) ? page.links : [];

    const formattedLinks = rawLinks.map((link) => {
      // Find the platform entry based on the stored icon property
      // The stored 'icon' property in Firestore is expected to be the 'name' of the platform
      // from your PLATFORMS array.
      const platformEntry = PLATFORMS.find(
        (p) => p.name.toLowerCase() === link.icon?.toLowerCase()
      );

      let linkValue = link.url;
      let linkPlatform = platformEntry ? platformEntry.name : "Custom"; // Default to "Custom" if not found
      let linkTitle = link.title;

      // Special handling for platforms with prefixes (e.g., social media usernames)
      if (
        platformEntry &&
        platformEntry.prefix &&
        link.url.startsWith(platformEntry.prefix)
      ) {
        linkValue = link.url.substring(platformEntry.prefix.length);
      }

      // If the original link was stored with an unrecognized icon or explicitly 'custom'
      if (!platformEntry || link.icon?.toLowerCase() === "custom") {
        linkPlatform = "Custom";
        linkTitle = link.title || ""; // Ensure custom title is preserved
        linkValue = link.url; // Custom links store the full URL in 'value'
      }

      return {
        platform: linkPlatform, // Correctly set the platform name
        value: linkValue,
        title: linkTitle,
      };
    });
    setLinks(
      formattedLinks.length > 0
        ? formattedLinks
        : [{ platform: "Instagram", value: "", title: "" }] // Default to Instagram if no links found
    );
  };

  const handleGoBackToList = () => {
    setEditingPage(null);
    setUsername(""); // Clear form fields
    setInitialUsername("");
    setBio("");
    setProfilePic("");
    setTemplate(TEMPLATES[0].value);
    setLinks([{ platform: "Instagram", value: "", title: "" }]);
    setLinkPageUrl(""); // Clear generated URL
    setQrCodeDataUrl(""); // Clear QR code
    fetchUserLinkPages(); // Refresh the list
  };

  const handleDeletePage = async (pageId, pageUsername) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the page "${pageUsername}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "linkPages", pageId));
      toast.success(`Page "${pageUsername}" deleted successfully.`);
      if (editingPage && editingPage.id === pageId) {
        setEditingPage(null); // Exit edit mode if the current page is deleted
      }
      fetchUserLinkPages(); // Refresh the list of link pages
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error(`Failed to delete page "${pageUsername}".`);
    }
  };

  const handleViewAnalytics = (username) => {
    navigate(`/zap-link/${username}`); // Assuming this navigates to ZurlAnalytics component
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to save.");
      return;
    }

    try {
      // --- Validation ---
      if (!username.trim()) {
        toast.error("Username is required.");
        return;
      }
      if (username.length < 3 || username.length > 30) {
        toast.error("Username must be between 3 and 30 characters long.");
        return;
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        toast.error(
          "Username can only contain alphanumeric characters, underscores, hyphens, and periods."
        );
        return;
      }

      if (bio.length > 250) {
        toast.error("Bio cannot exceed 250 characters.");
        return;
      }

      if (profilePic && !/^https?:\/\/.+\..+$/.test(profilePic)) {
        toast.error("Invalid profile picture URL format.");
        return;
      }

      if (links.length === 0) {
        toast.error("At least one link is required.");
        return;
      }

      const formattedLinks = links.map((link) => {
        const platform = PLATFORMS.find((p) => p.name === link.platform);
        if (!platform) {
          toast.error(`Invalid platform selected for link: ${link.platform}`);
          throw new Error(`Invalid platform: ${link.platform}`);
        }

        let fullUrl = "";
        let displayTitle = link.title || link.platform; // Prioritize custom title, fallback to platform name

        if (platform.name === "Custom") {
          fullUrl = link.value; // For custom, 'value' is the full URL
          if (!displayTitle) displayTitle = "Custom Link"; // Fallback for custom link title
        } else if (platform.prefix) {
          fullUrl = platform.prefix + link.value; // For prefixed platforms, 'value' is username
        } else {
          fullUrl = link.value; // Fallback for cases not covered by prefix or custom (though all should be covered)
        }

        // Validate URLs before saving
        if (!fullUrl.trim()) {
          toast.error(`URL for ${displayTitle} is required.`);
          throw new Error("Link URL is empty.");
        }
        if (
          !/^https?:\/\/.+\..+$/.test(fullUrl) && // http(s):// validation
          !/^mailto:.+@.+\..+$/.test(fullUrl) && // mailto: validation
          !/^tel:\+?[0-9()\s-]{5,20}$/.test(fullUrl) // tel: validation (basic)
        ) {
          toast.error(
            `Link for ${displayTitle}: Invalid URL format. Must start with http(s)://, mailto:, or tel:.`
          );
          throw new Error("Invalid link URL format.");
        }

        return {
          title: displayTitle,
          url: fullUrl,
          icon: platform.name.toLowerCase(), // Store the name as lowercase for icon matching
          clicks: link.clicks || 0, // Preserve existing clicks if editing
        };
      });

      // Check if username is being changed and if new username is taken
      if (username !== initialUsername) {
        const existingPageDoc = await getDoc(doc(db, "linkPages", username));
        if (existingPageDoc.exists()) {
          const existingPageData = existingPageDoc.data();
          if (existingPageData.uid !== currentUser.uid) {
            // Ensure it's not the current user's old page
            toast.error("Username already taken by another user.");
            return;
          }
        }
      }

      const linkPageData = {
        uid: currentUser.uid,
        username: username,
        bio: bio,
        profilePic: profilePic,
        links: formattedLinks,
        template: template,
        updatedAt: serverTimestamp(),
        linkPageUrl: `${baseDomain}/zaplink/${username}`,
        // Note: pageClicks and createdAt are handled during update/creation
      };

      if (editingPage && username === initialUsername) {
        // Update existing page with the same username
        await setDoc(doc(db, "linkPages", username), linkPageData, {
          merge: true, // Merge new data with existing, keeping createdAt and pageClicks
        });
        toast.success("Link page updated successfully!");
      } else if (editingPage && username !== initialUsername) {
        // Username changed: delete old page and create new one, transferring pageClicks/createdAt
        const oldPageDocRef = doc(db, "linkPages", initialUsername);
        const oldPageSnapshot = await getDoc(oldPageDocRef);
        let oldPageData = oldPageSnapshot.exists()
          ? oldPageSnapshot.data()
          : {};

        await setDoc(doc(db, "linkPages", username), {
          ...linkPageData,
          createdAt: oldPageData.createdAt || serverTimestamp(), // Preserve old createdAt or set new
          pageClicks: oldPageData.pageClicks || 0, // Preserve old pageClicks
        });
        await deleteDoc(oldPageDocRef); // Delete the old document

        toast.success("Username changed and page updated successfully!");
      } else {
        // Creating a new page (no editingPage context)
        await setDoc(
          doc(db, "linkPages", username),
          {
            ...linkPageData,
            createdAt: serverTimestamp(),
            pageClicks: 0, // Initialize pageClicks for a new page
          },
          { merge: true }
        ); // Use merge to avoid overwriting if a doc with this username already exists (e.g., from a partial save)
        toast.success("New link page created successfully!");
      }

      // Update local state after successful save
      setEditingPage({ id: username, ...linkPageData }); // Set editing page to the newly saved/updated one
      setInitialUsername(username); // Update initial username to the new one
      fetchUserLinkPages(); // Re-fetch the list to show updated data
    } catch (err) {
      console.error("Error saving link page:", err);
      toast.error("Error saving link page.", {
        description:
          err.message ||
          "There was an error saving your changes. Please try again.",
      });
    }
  };

  const handleDownloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `zaplink-qrcode-${username || "yourpage"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR Code downloaded!", {
        description: "The QR code image has been saved to your device.",
      });
    }
  };

  const handleCopyQRCode = async () => {
    if (qrCodeDataUrl) {
      try {
        // Check if the browser supports the Clipboard API for images
        if (navigator.clipboard && navigator.clipboard.write) {
          const response = await fetch(qrCodeDataUrl);
          const blob = await response.blob();
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          toast.success("QR Code copied!", {
            description: "The QR code image has been copied to your clipboard.",
          });
        } else {
          toast.error("Copy not supported.", {
            description:
              "Automatic image copy is not supported by your browser. Please download it.",
          });
        }
      } catch (err) {
        console.error("Failed to copy QR code:", err);
        toast.error("Failed to copy QR Code.", {
          description: "There was an error copying the QR code image.",
        });
      }
    }
  };

  const handleCopyLink = () => {
    if (linkPageUrl) {
      navigator.clipboard
        .writeText(linkPageUrl)
        .then(() => {
          toast.success("Link copied!", {
            description:
              "Your link-in-bio URL has been copied to your clipboard.",
          });
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
          toast.error("Copy failed.", {
            description: "Could not copy the link. Please try again manually.",
          });
        });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <p className="text-lg text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  // Display message if no pages exist and not in editing mode
  if (!editingPage && userLinkPages.length === 0) {
    return (
      <div className="max-w-2xl lg:max-w-4xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>No ZapLink Pages Found</CardTitle>
            <CardDescription>
              It seems you don't have any existing ZapLink pages to manage.
              Create your first ZapLink page to get started!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              className="border-1 border-black  text-black bg-white hover:bg-white dark:bg-blue-600 dark:text-white"
              onClick={() => navigate("/zap-link/create-zap-link")}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Page
            </Button>{" "}
            {/* Offer to create new */}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sorting and Filtering Logic
  const sortedPages = [...userLinkPages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredPages = sortedPages
    .filter((page) =>
      page.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((page) => {
      if (!selectedDate) return true;
      const createdDate = new Date(page.createdAt);
      // Compare dates without time part
      return (
        createdDate.getFullYear() === selectedDate.getFullYear() &&
        createdDate.getMonth() === selectedDate.getMonth() &&
        createdDate.getDate() === selectedDate.getDate()
      );
    });

  return (
    <div className="max-w-2xl lg:max-w-6xl mx-auto p-4 space-y-6">
      {/* List of Link Pages (shown when not editing) */}
      {userLinkPages.length > 0 && !editingPage && (
        <>
          <Card className="dark:bg-gray-800 shadow-none border-none">
            <CardHeader>
              <CardTitle>Your ZapLink Pages</CardTitle>
              <CardDescription>
                Select a page to manage or create a new one.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search and Calendar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Input
                  placeholder="Search by username"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full sm:w-[200px] justify-start text-left font-normal", // Adjust width for responsiveness
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <LinkIcon
                          icon={faCalendarIcon}
                          className="mr-2 h-4 w-4"
                        />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        toDate={new Date()} // Disable future dates
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedDate && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedDate(undefined)}
                      className="shrink-0"
                      aria-label="Clear selected date"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <ul className="space-y-3">
                {filteredPages.length > 0 ? (
                  filteredPages.map((page) => (
                    <li
                      key={page.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md shadow-sm gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg">{page.username}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                          {page.bio || "No bio set."}
                        </p>
                        <a
                          href={`${baseDomain}/zaplink/${page.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all flex items-center gap-1"
                        >
                          {`${baseDomain}/zaplink/${page.username}`}
                          <LinkIcon
                            icon={faExternalLinkAlt}
                            className="h-3 w-3"
                          />
                        </a>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                        <Button
                          className="text-blue-600 border border-blue-600 bg-white hover:bg-white dark:text-white dark:bg-blue-600"
                          size="sm"
                          onClick={() => handleViewAnalytics(page.username)}
                        >
                          <BarChart className="w-4 h-4 mr-2" /> Analytics
                        </Button>
                        <Button
                          className="text-blue-600 border border-blue-600 bg-white hover:bg-white dark:text-white dark:bg-blue-600"
                          size="sm"
                          onClick={() => handleEditPage(page)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          className="text-blue-600 border border-blue-600 bg-white hover:bg-white dark:text-white dark:bg-blue-600"
                          size="sm"
                          onClick={() => {
                            const shareUrl = `${baseDomain}/zaplink/${page.username}`;
                            const shareData = {
                              title: `Check out ${page.username}'s ZapLink`,
                              // MODIFICATION HERE: Include the URL directly in the text
                              text: `${
                                page.bio || "See my ZapLink page"
                              }\n${shareUrl}`, // Add the URL to the text
                              url: shareUrl, // Keep the URL property for other apps that use it directly
                            };

                            if (navigator.share) {
                              navigator
                                .share(shareData)
                                .catch((error) =>
                                  console.error("Sharing failed", error)
                                );
                            } else {
                              toast.info("Web Share API not supported.", {
                                description:
                                  "You can copy the link manually instead.",
                              });
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" /> Share
                        </Button>
                              <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeletePage(page.id, page.username)
                          }
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center text-muted-foreground p-4">
                    No matching ZapLink pages found on that day
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => {
                navigate("/zap-link/create-zap-link");
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Create New ZapLink Page
            </Button>
          </div>
        </>
      )}

      {/* Page Editor (shown when editing or creating a new page) */}
      {editingPage && (
        <Card className="dark:bg-gray-800 shadow-none border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingPage.id
                  ? "Edit ZapLink Page"
                  : "Create New ZapLink Page"}
              </CardTitle>
              {userLinkPages.length > 0 && ( // Only show back button if there are pages to go back to
                <Button variant="outline" onClick={handleGoBackToList}>
                  <LinkIcon icon={faArrowLeft} className="mr-2" /> Back to List
                </Button>
              )}
            </div>
            <CardDescription>
              {editingPage.id
                ? `Manage your ZapLink page at ${linkPageUrl}`
                : "Configure your new ZapLink page."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <LinkIcon icon={faEdit} className="h-5 w-5 text-primary" />{" "}
                General Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium leading-none"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    placeholder="Your unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your ZapLink URL will be:{" "}
                    <span className="font-medium text-blue-600 break-all">
                      {linkPageUrl || `${baseDomain}/zaplink/yourusername`}
                    </span>
                  </p>
                </div>
                <br></br>
                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="text-sm font-medium leading-none"
                  >
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself (max 250 chars)"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={400}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/250
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="profilePic"
                  className="text-sm font-medium leading-none"
                >
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {profilePic && (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  )}
                  <Input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <span className="text-sm text-muted-foreground">
                      Uploading...
                    </span>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="template"
                  className="text-sm font-medium leading-none"
                >
                  Template
                </label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Links Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <LinkIcon icon={faLink} className="h-5 w-5 text-primary" /> Your
                Links
              </h3>
              <div className="space-y-3">
                {links.map((link, index) => {
                  const selectedPlatform =
                    PLATFORMS.find((p) => p.name === link.platform) ||
                    PLATFORMS[0];
                  return (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-center gap-3 p-3 border rounded-md relative"
                    >
                      {/* Platform Dropdown */}
                      <Select
                        onValueChange={(val) => {
                          handleLinkChange(index, "platform", val);
                          // Reset title and value if platform changes away from Custom
                          if (val !== "Custom") {
                            handleLinkChange(index, "title", "");
                            handleLinkChange(index, "value", ""); // Also reset value
                          }
                        }}
                        value={link.platform}
                      >
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue placeholder="Platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map(({ name }) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Value Input (URL or Username) */}
                      <div className="flex items-center gap-2 flex-1 w-full">
                        <LinkIcon
                          icon={selectedPlatform.icon}
                          className="h-5 w-5 text-muted-foreground"
                        />
                        <Input
                          placeholder={
                            selectedPlatform.name === "Custom"
                              ? "Enter Full URL (e.g., https://example.com)"
                              : `Enter ${
                                  selectedPlatform.name === "Gmail" ||
                                  selectedPlatform.name === "Website"
                                    ? "email/URL"
                                    : "username"
                                }`
                          }
                          value={link.value}
                          onChange={(e) =>
                            handleLinkChange(index, "value", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>

                      {/* Custom Link Title Input - shown only for Custom platform */}
                      {link.platform === "Custom" && (
                        <div className="relative flex-1 w-full">
                          <Input
                            ref={(el) =>
                              (customLinkInputRefs.current[index] = el)
                            }
                            placeholder="Custom Link Title (e.g., My Portfolio)"
                            value={link.title}
                            onChange={(e) =>
                              handleLinkChange(index, "title", e.target.value)
                            }
                            className="w-full pr-10"
                          />
                          <Button
                            ref={(el) => (emojiTriggerRefs.current[index] = el)}
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLinkIndex(index);
                              setShowEmojiPicker(!showEmojiPicker);
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 emoji-picker-trigger"
                            aria-label="Add emoji to title"
                          >
                            <LinkIcon icon={faLaugh} className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Remove Link Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLink(index)}
                        disabled={links.length === 1}
                      >
                        <LinkIcon
                          icon={faTimes}
                          className="h-4 w-4 text-red-500"
                        />
                      </Button>

                      {/* Emoji Picker Popover */}
                      {showEmojiPicker && activeLinkIndex === index && (
                        <div
                          ref={emojiPickerRef}
                          className={cn(
                            "rounded-lg shadow-lg bg-background border border-border overflow-hidden z-50"
                          )}
                          style={pickerStyles} // Make sure this is pickerStyles
                        >
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button onClick={addLink} variant="outline">
                <LinkIcon icon={faPlus} className="h-4 w-4 mr-2" /> Add Link
              </Button>
            </div>

            {/* Save and QR Code Section */}
            <div className="pt-4 border-t mt-6">
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="w-full gap-2"
              >
                <LinkIcon icon={faSave} className="h-4 w-4" /> Save Changes
              </Button>
            </div>

            {/* QR Code and Link Section */}
            {linkPageUrl && linkPageUrl.trim() && (
              <div className="space-y-4 text-center mt-6">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <LinkIcon icon={faLink} className="h-5 w-5 text-primary" />{" "}
                  Your Link-in-Bio
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-6 p-4 border rounded-lg">
                  <div
                    ref={qrCodeRef}
                    className="p-2 border rounded-lg bg-white"
                  >
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-500">
                        Generating QR Code...
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center md:items-start gap-4 w-full">
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handleDownloadQRCode}
                        className="gap-1"
                        disabled={!qrCodeDataUrl}
                      >
                        <LinkIcon icon={faDownload} className="h-4 w-4" />{" "}
                        Download QR
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCopyQRCode}
                        className="gap-1"
                        disabled={!qrCodeDataUrl}
                      >
                        <LinkIcon icon={faCopy} className="h-4 w-4" /> Copy QR
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={linkPageUrl}
                        readOnly
                        className="flex-grow"
                      />
                      <Button onClick={handleCopyLink} className="gap-1">
                        <LinkIcon icon={faCopy} className="h-4 w-4" /> Copy Link
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                      Scan this QR code or copy the link to share your page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZapLinkHome;
