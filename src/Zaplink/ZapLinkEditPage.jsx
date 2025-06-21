import { useState, useEffect, useRef } from "react";
import axios from "axios";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebookF,
  faLinkedinIn,
  faTwitter,
  faYoutube,
  faTwitch,
  faDiscord,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import {
  faLink,
  faEnvelope,
  faTimes,
  faGlobe,
  faDownload,
  faCopy,
  faSpinner,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";

import { Circle, CircleX, Loader, Pencil, Image as ImageIcon } from "lucide-react";

// Define a fallback icon component using Font Awesome
const FallbackLinkIcon = ({ className }) => (
  <FontAwesomeIcon icon={faLink} className={className} />
);

// Font Awesome Icon Component wrapper for consistency
const FAIcon = ({ icon, className }) => (
  <FontAwesomeIcon icon={icon} className={className} />
);

const PLATFORMS = [
  { name: "Instagram", icon: faInstagram, prefix: "https://instagram.com/" },
  { name: "Facebook", icon: faFacebookF, prefix: "https://facebook.com/" },
  { name: "LinkedIn", icon: faLinkedinIn, prefix: "https://linkedin.com/in/" },
  { name: "Twitter", icon: faTwitter, prefix: "https://twitter.com/" },
  { name: "YouTube", icon: faYoutube, prefix: "https://www.youtube.com/" }, // Corrected YouTube prefix
  { name: "Twitch", icon: faTwitch, prefix: "https://twitch.tv/" },
  { name: "GitHub", icon: faGithub, prefix: "https://github.com/" },
  { name: "Discord", icon: faDiscord, prefix: "https://discord.gg/" },
  { name: "Website", icon: faGlobe, prefix: "https://" },
  { name: "Gmail", icon: faEnvelope, prefix: "mailto:" },
  { name: "Custom", icon: faLink, prefix: "" },
];

// Define your available templates
const TEMPLATES = [
  { name: "DEFAULT", value: "default" },
  { name: "FROSTED GLASS", value: "frosted-glass" },
  { name: "BREEZE", value: "breeze" },
  { name: "COLOR BURST", value: "color-burst" },
  { name: "TERMINAL", value: "terminal" },
  { name: "PASTEL", value: "pastel" },
  { name: "GAMER", value: "gamer" },
];

export default function EditLinkPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null); // Stores the File object for a new profile pic upload
  const [profilePicPreviewUrl, setProfilePicPreviewUrl] = useState(""); // URL for local preview (blob: or existing)
  const [backendProfilePicUrl, setBackendProfilePicUrl] = useState(""); // Stores the actual Cloudinary URL from backend
  const [links, setLinks] = useState([
    {
      platform: "Instagram",
      value: "",
      title: "",
      imageFile: null, // Stores the File object for a new custom link image
      linkImagePreviewUrl: "", // URL for local preview of custom link image
      backendLinkImageUrl: "", // Stores the actual Cloudinary URL for custom link image
    },
  ]);
  const location = useLocation();
  const selectedtemplate = location.state?.template;
  const [selectedTemplate, setSelectedTemplate] = useState(selectedtemplate);
  const [isUploading, setIsUploading] = useState(false); // Can be reused for general "saving" state
  const [isSaving, setIsSaving] = useState(false);
  const [linkPageUrl, setLinkPageUrl] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const qrCodeRef = useRef(null);

  const { getAccessToken } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeLinkIndex, setActiveLinkIndex] = useState(null);
  const customLinkInputRefs = useRef([]);
  const [pickerPosition, setPickerPosition] = useState("bottom");

  // AI bio assistance
  const [useAIBio, setUseAIBio] = useState(false);
  const [aiBioQuestion, setAiBioQuestion] = useState("");
  const [aiBioAnswer, setAiBioAnswer] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  const handleEmojiClick = (emojiData) => {
    if (activeLinkIndex !== null) {
      const currentLink = links[activeLinkIndex];
      handleLinkChange(activeLinkIndex, "title", currentLink.title + emojiData.emoji);
    }
    setShowEmojiPicker(false);
    setActiveLinkIndex(null);
  };

  useEffect(() => {
    if (showEmojiPicker && activeLinkIndex !== null) {
      const inputElement = customLinkInputRefs.current[activeLinkIndex];
      if (inputElement) {
        const inputRect = inputElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const desiredPickerHeight = 400;

        if (inputRect.top > desiredPickerHeight + 20) {
          setPickerPosition("top");
        } else {
          setPickerPosition("bottom");
        }
      }
    }
  }, [showEmojiPicker, activeLinkIndex]);

  useEffect(() => {
    if (username && username.trim()) {
      const baseDomain = window.location.origin;
      const url = `${baseDomain}/zaplink/${username}`;
      setLinkPageUrl(url);

      QRCode.toDataURL(url, {
        width: 256,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((dataUrl) => {
          setQrCodeDataUrl(dataUrl);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setQrCodeDataUrl("");
        });
    } else {
      setLinkPageUrl("");
      setQrCodeDataUrl("");
    }
  }, [username]);

  // Handle initial data loading (e.g., when editing an existing page)
  useEffect(() => {
    const fetchLinkPageData = async () => {
      const token = await getAccessToken();
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/zaplink/link-page/me`, // Assuming an endpoint to fetch current user's link page
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { username, bio, profilePicUrl, links: fetchedLinks, template } = response.data;
        setUsername(username);
        setBio(bio);
        setBackendProfilePicUrl(profilePicUrl || ""); // Store the actual URL
        setProfilePicPreviewUrl(profilePicUrl || ""); // Use for preview initially
        setSelectedTemplate(template || "default"); // Set fetched template or default

        // Map fetched links to component state, preserving existing image URLs
        const mappedLinks = fetchedLinks.map(link => {
          const platformInfo = PLATFORMS.find(p => p.name.toLowerCase() === link.icon.toLowerCase());
          let platformName = platformInfo ? platformInfo.name : "Custom"; // Default to Custom if icon not found
          let value = link.url;
          let title = link.title;

          // Special handling for prefixes to extract just the value
          if (platformName !== "Custom") {
            const foundPlatform = PLATFORMS.find(p => p.name === platformName);
            if (foundPlatform && foundPlatform.prefix && link.url.startsWith(foundPlatform.prefix)) {
              value = link.url.substring(foundPlatform.prefix.length);
            }
          }

          return {
            platform: platformName,
            value: value,
            title: title,
            imageFile: null, // No file initially loaded from backend
            linkImagePreviewUrl: link.linkImage || "", // Use linkImage from backend for preview
            backendLinkImageUrl: link.linkImage || "", // Store the actual backend URL
          };
        });
        setLinks(mappedLinks.length > 0 ? mappedLinks : [{ platform: "Instagram", value: "", title: "", imageFile: null, linkImagePreviewUrl: "", backendLinkImageUrl: "" }]);

      } catch (error) {
        console.error("Error fetching link page data:", error);
        // Optionally, toast an error if data couldn't be loaded
        // toast.error("Failed to load your link page data.");
      }
    };

    fetchLinkPageData();
  }, [getAccessToken]);


  const handleLinkChange = (index, field, value) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  const addLink = () => {
    setLinks([...links, { platform: "Instagram", value: "", title: "", imageFile: null, linkImagePreviewUrl: "", backendLinkImageUrl: "" }]);
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

  const handleProfilePicFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(file); // Set the actual File object
      setProfilePicPreviewUrl(URL.createObjectURL(file)); // For immediate local preview (blob URL)
      setBackendProfilePicUrl(""); // Clear the backend URL as a new file is selected
    } else {
      setProfilePic(null);
      setProfilePicPreviewUrl(""); // Clear preview
      // Decide if you want to revert to backendProfilePicUrl here if input is cleared
      // For now, it will clear if no file is selected.
    }
  };

  const handleCustomLinkImageFileChange = (event, index) => {
    const file = event.target.files[0];
    const updatedLinks = [...links];
    if (file) {
      updatedLinks[index].imageFile = file; // Store the actual File object
      updatedLinks[index].linkImagePreviewUrl = URL.createObjectURL(file); // For immediate local preview
      updatedLinks[index].backendLinkImageUrl = ""; // Clear backend URL as a new file is chosen
    } else {
      updatedLinks[index].imageFile = null;
      updatedLinks[index].linkImagePreviewUrl = "";
      // Decide if clearing means no image or revert to backendLinkImageUrl
    }
    setLinks(updatedLinks);
  };

  const getAIBioResponse = async () => {
    setIsAILoading(true);
    const token = await getAccessToken();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/ai/generate-bio`,
        {
          aiBioQuestion: aiBioQuestion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAiBioAnswer(res.data.bio);
      setBio(res.data.bio);
      toast.success("Bio generated by AI!");
    } catch (error) {
      console.error("AI Bio Generation Error:", error);
      setAiBioAnswer("❌ Error generating bio.");
      toast.error("Failed to generate bio with AI. Please try again.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSubmit = async () => {
  setIsSaving(true);
  try {
    const token = await getAccessToken();

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
        "Username can only contain letters, numbers, underscores, hyphens, and periods."
      );
      return;
    }

    if (bio.length > 250) {
      toast.error("Bio cannot exceed 250 characters.");
      return;
    }

    if (links.length === 0) {
      toast.error("At least one link is required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    formData.append("template", selectedTemplate);

    if (profilePic instanceof File) {
      formData.append("profilePic", profilePic);
    } else if (backendProfilePicUrl) {
      formData.append("profilePicUrl", backendProfilePicUrl);
    }

    const isValidUrl = (url) => {
      const regex =
        /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|sms:[^\s]+|whatsapp:[^\s]+)/i;
      return regex.test(url);
    };

    const formattedLinks = links.map((link, index) => {
      const platform = PLATFORMS.find((p) => p.name === link.platform);
      if (!platform) {
        toast.error(`Invalid platform selected for link: ${link.platform}`);
        throw new Error(`Invalid platform: ${link.platform}`);
      }

      let fullUrl = "";
      let displayTitle = platform.name;

      if (platform.name === "Custom") {
        fullUrl = link.value;
        displayTitle = link.title || "Custom Link";

        if (link.imageFile instanceof File) {
          formData.append(`linkImage_${index}`, link.imageFile);
        } else if (link.backendLinkImageUrl) {
          formData.append(
            `linkImageExistingUrl_${index}`,
            link.backendLinkImageUrl
          );
        }
      } else if (platform.name === "Gmail") {
        fullUrl = platform.prefix + link.value;
        displayTitle = "Gmail";
      } else if (platform.name === "Website") {
        fullUrl = link.value;
        if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
          fullUrl = "https://" + fullUrl;
        }
      } else {
        fullUrl = platform.prefix + link.value;
      }

      if (!fullUrl.trim()) {
        toast.error(`URL for ${displayTitle} is required.`);
        throw new Error("Empty URL");
      }

      if (!isValidUrl(fullUrl)) {
        toast.error(
          `Invalid URL for ${displayTitle}. Must be a valid web/mail/phone link.`
        );
        throw new Error("Invalid URL format.");
      }

      return {
        title: displayTitle,
        url: fullUrl,
        icon: platform.name.toLowerCase(),
      };
    });

    formData.append("links", JSON.stringify(formattedLinks));

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/zaplink/link-page`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setLinkPageUrl(response.data.linkPageUrl);
    toast.success("Saved successfully!", {
      description: "Your link page has been updated.",
    });
  } catch (err) {
    console.error("Submission Error:", err);
    const message =
      err.response?.data?.message ||
      "There was an error saving your changes. Please try again.";
    toast.error("Error saving link page.", { description: message });
  } finally {
    setIsSaving(false);
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
        console.error("Failed to copy QR code image:", err);
        toast.error("Copy failed.", {
          description:
            "Could not copy QR code image. Please try downloading it.",
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

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto p-4 space-y-4">
      <Card className="dark:bg-gray-800 shadow-none border-none">
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="Your unique username (e.g., zaplink123)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This will be the path for your main link page:{" "}
            <span className="font-semibold">
              {window.location.origin}/zaplink/{username || "[username]"}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfilePicFileChange}
            />
            {profilePicPreviewUrl && ( // Show preview if existing or new file
              <img
                src={profilePicPreviewUrl}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
          </div>

          ---

          {/* Bio Section with AI integration */}
          <h2 className="text-lg font-semibold">Bio</h2>
          <div className="flex items-center gap-2">
            <Textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="flex-grow"
              disabled={useAIBio}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setUseAIBio(!useAIBio)}
              title={useAIBio ? "Disable AI Bio" : "Generate Bio with AI"}
            >
              {useAIBio ? (
                <Pencil />
              ) : (
                <FAIcon icon={faRobot} className="h-5 w-5" />
              )}
            </Button>
          </div>
          {useAIBio && (
            <div className="space-y-2">
              <Input
                placeholder="Tell me about yourself or your brand (e.g., 'I am a musician who loves indie rock' or 'We sell handmade jewelry')"
                value={aiBioQuestion}
                onChange={(e) => setAiBioQuestion(e.target.value)}
                disabled={isAILoading}
              />
              <Button
                onClick={getAIBioResponse}
                disabled={isAILoading || !aiBioQuestion.trim()}
              >
                {isAILoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />{" "}
                    Generating...
                  </>
                ) : (
                  "Generate Bio"
                )}
              </Button>
            </div>
          )}

          ---

          {/* Template Chooser Field */}
          <h2 className="text-lg font-semibold">Choose Your Template</h2>
          <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((template) => (
                <SelectItem key={template.value} value={template.value}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select a visual template for your link-in-bio page.
          </p>

          ---

          <h2 className="text-lg font-semibold">Links</h2>
          {links.map((link, index) => {
            const selected =
              PLATFORMS.find((p) => p.name === link.platform) || PLATFORMS[0];

            return (
              <div
                key={index}
                className="flex flex-col gap-2 p-2 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(val) => {
                      handleLinkChange(index, "platform", val);
                      // Reset title, value, and image if platform changes away from Custom
                      if (val !== "Custom") {
                        handleLinkChange(index, "title", "");
                        handleLinkChange(index, "imageFile", null); // Clear file
                        handleLinkChange(index, "linkImagePreviewUrl", ""); // Clear preview URL
                        handleLinkChange(index, "backendLinkImageUrl", ""); // Clear backend URL
                      }
                      handleLinkChange(index, "value", ""); // Also reset value
                    }}
                    value={link.platform}
                  >
                    <SelectTrigger className="w-[140px]">
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

                  {/* Input for Platform-specific value (username/URL) */}
                  <div className="flex items-center gap-2 w-full">
                    <FAIcon
                      icon={selected.icon}
                      className="h-5 w-5 text-muted-foreground"
                    />
                    <Input
                      placeholder={`Enter ${
                        selected.name === "Gmail" ||
                        selected.name === "Website" ||
                        selected.name === "Custom"
                          ? "URL or Email"
                          : "username"
                      }`}
                      value={link.value}
                      onChange={(e) =>
                        handleLinkChange(index, "value", e.target.value)
                      }
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(index)}
                    disabled={links.length === 1}
                  >
                    <FAIcon icon={faTimes} className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                {/* Conditional Input for Custom Link Title and Image Upload */}
                {link.platform === "Custom" && (
                  <div className="relative pl-8 pt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        ref={(el) => (customLinkInputRefs.current[index] = el)}
                        placeholder="Custom Link Title (e.g., My Portfolio)"
                        value={link.title}
                        onChange={(e) =>
                          handleLinkChange(index, "title", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (activeLinkIndex === index && showEmojiPicker) {
                            setShowEmojiPicker(false);
                            setActiveLinkIndex(null);
                          } else {
                            setActiveLinkIndex(index);
                            setShowEmojiPicker(true);
                          }
                        }}
                        className="text-xl p-2 rounded-md hover:bg-gray-100"
                      >
                        😊
                      </button>
                    </div>
                    {showEmojiPicker && activeLinkIndex === index && (
                      <div
                        className="absolute z-50 mt-2 right-0"
                        style={
                          pickerPosition === "top"
                            ? { bottom: "calc(100% + 8px)" }
                            : { top: "100%" }
                        }
                      >
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      This is the text that will appear on your page for this
                      link.
                    </p>

                    {/* Custom Link Image Upload */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCustomLinkImageFileChange(e, index)}
                        className="flex-grow"
                      />
                      {link.linkImagePreviewUrl ? (
                        <img
                          src={link.linkImagePreviewUrl}
                          alt="Link Icon"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" /> // Lucide React Icon
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Button className="mr-[10px]" variant="outline" onClick={addLink}>
            + Add Link
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <FAIcon icon={faSpinner} spin className="h-4 w-4 mr-2" />{" "}
                Saving...
              </>
            ) : (
              "Save Page"
            )}
          </Button>

          ---

          {linkPageUrl && linkPageUrl.trim() && (
            <>
              <h2 className="text-lg font-semibold mt-6">Your Link-in-Bio</h2>
              <div className="flex flex-col md:flex-row items-center gap-6 p-4 border rounded-lg">
                <div ref={qrCodeRef} className="p-2 border rounded-lg">
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownloadQRCode}
                      className="gap-1"
                      disabled={!qrCodeDataUrl}
                    >
                      <FAIcon icon={faDownload} className="h-4 w-4" /> Download
                      QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyQRCode}
                      className="gap-1"
                      disabled={!qrCodeDataUrl}
                    >
                      <FAIcon icon={faCopy} className="h-4 w-4" /> Copy QR
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <Input value={linkPageUrl} readOnly className="flex-grow" />
                    <Button onClick={handleCopyLink} className="gap-1">
                      <FAIcon icon={faCopy} className="h-4 w-4" /> Copy Link
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center md:text-left">
                    Scan this QR code or copy the link to share your page.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}