import { useState, useEffect, useRef } from "react";
import axios from "axios";
import QRCode from "qrcode"; // Correct import for qrcode library
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
import { // Font Awesome brand icons
  faInstagram,
  faFacebookF,
  faLinkedinIn,
  faTwitter,
  faYoutube,
  faTwitch,
  faDiscord,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { // Font Awesome solid icons
  faLink,
  faEnvelope,
  faTimes,
  faGlobe,
  faDownload,
  faCopy,
  faSpinner,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext"; // Assuming AuthContext exists at this path
import { toast } from "sonner"; // Sonner toast library
import { useLocation } from "react-router-dom"; // React Router DOM for useLocation
import EmojiPicker from "emoji-picker-react"; // Emoji picker library

import { Loader, Pencil, Image as ImageIcon } from "lucide-react"; // Lucide React icons

// Font Awesome Icon Component wrapper for consistency
const FAIcon = ({ icon, className }) => (
  <FontAwesomeIcon icon={icon} className={className} />
);

// Define available platforms and their associated icons/prefixes
const PLATFORMS = [
  { name: "Instagram", icon: faInstagram, prefix: "https://instagram.com/" },
  { name: "Facebook", icon: faFacebookF, prefix: "https://facebook.com/" },
  { name: "LinkedIn", icon: faLinkedinIn, prefix: "https://linkedin.com/in/" },
  { name: "Twitter", icon: faTwitter, prefix: "https://twitter.com/" },
  { name: "YouTube", icon: faYoutube, prefix: "https://www.youtube.com/" },
  { name: "Twitch", icon: faTwitch, prefix: "https://twitch.tv/" },
  { name: "GitHub", icon: faGithub, prefix: "https://github.com/" },
  { name: "Discord", icon: faDiscord, prefix: "https://discord.gg/" },
  { name: "Website", icon: faGlobe, prefix: "https://" },
  { name: "Gmail", icon: faEnvelope, prefix: "mailto:" },
  { name: "Custom", icon: faLink, prefix: "" }, // Custom link uses faLink by default
];

// Define your available templates for the ZapLink page
const TEMPLATES = [
  { name: "DEFAULT", value: "default" },
  { name: "FROSTED GLASS", value: "frosted-glass" },
  { name: "BREEZE", value: "breeze" },
  { name: "COLOR BURST", value: "color-burst" },
  { name: "TERMINAL", value: "terminal" },
  { name: "PASTEL", value: "pastel" },
  { name: "GAMER", value: "gamer" },
];

export default function CreateZapLink() {
  // State variables for form fields and UI control
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null); // File object for new profile pic
  const [profilePicPreviewUrl, setProfilePicPreviewUrl] = useState(""); // URL for local preview
  const [links, setLinks] = useState([
    {
      platform: "Instagram",
      value: "",
      title: "",
      imageFile: null, // File object for new custom link image
      linkImagePreviewUrl: "", // URL for local preview of custom link image
    },
  ]);
  const location = useLocation(); // Hook from react-router-dom to get state
  const selectedtemplate = location.state?.template;
  const [selectedTemplate, setSelectedTemplate] = useState(selectedtemplate || "default");
  const [isSaving, setIsSaving] = useState(false); // State for form submission loading
  const [linkPageUrl, setLinkPageUrl] = useState(""); // Generated ZapLink page URL
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(""); // QR code data URL

  const qrCodeRef = useRef(null); // Ref for QR code element (not directly used for rendering now)

  const { getAccessToken } = useAuth(); // Auth context for token
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeLinkIndex, setActiveLinkIndex] = useState(null); // Index of link whose title is being edited for emoji
  const customLinkInputRefs = useRef([]); // Refs for custom link title inputs
  const [pickerPosition, setPickerPosition] = useState("bottom"); // Position of emoji picker

  // AI bio assistance states
  const [useAIBio, setUseAIBio] = useState(false);
  const [aiBioQuestion, setAiBioQuestion] = useState("");
  const [aiBioAnswer, setAiBioAnswer] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  /**
   * Handles emoji selection from the picker and appends it to the active link's title.
   * @param {object} emojiData - The emoji data object from emoji-picker-react.
   */
  const handleEmojiClick = (emojiData) => {
    if (activeLinkIndex !== null) {
      const currentLink = links[activeLinkIndex];
      handleLinkChange(activeLinkIndex, "title", currentLink.title + emojiData.emoji);
    }
    setShowEmojiPicker(false);
    setActiveLinkIndex(null);
  };

  /**
   * Adjusts emoji picker position based on input field visibility.
   */
  useEffect(() => {
    if (showEmojiPicker && activeLinkIndex !== null) {
      const inputElement = customLinkInputRefs.current[activeLinkIndex];
      if (inputElement) {
        const inputRect = inputElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const desiredPickerHeight = 400; // Approximate height of the emoji picker

        // Position picker above if there's not enough space below
        if (inputRect.bottom + desiredPickerHeight > viewportHeight && inputRect.top > desiredPickerHeight + 20) {
          setPickerPosition("top");
        } else {
          setPickerPosition("bottom");
        }
      }
    }
  }, [showEmojiPicker, activeLinkIndex]);

  /**
   * Generates the ZapLink page URL and QR code whenever the username changes.
   */
  useEffect(() => {
    if (username && username.trim()) {
      const baseDomain = window.location.origin;
      const url = `${baseDomain}/zaplink/${username}`;
      setLinkPageUrl(url);

      // Generate QR code using the qrcode library
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
          toast.error("Failed to generate QR code.");
          setQrCodeDataUrl("");
        });
    } else {
      // Clear URL and QR code if username is empty
      setLinkPageUrl("");
      setQrCodeDataUrl("");
    }
  }, [username]);

  /**
   * Handles changes to link properties (platform, value, title).
   * @param {number} index - Index of the link in the `links` array.
   * @param {string} field - The field to update (e.g., "platform", "value", "title").
   * @param {string} value - The new value for the field.
   */
  const handleLinkChange = (index, field, value) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  /**
   * Adds a new default link to the `links` array.
   */
  const addLink = () => {
    setLinks([...links, { platform: "Instagram", value: "", title: "", imageFile: null, linkImagePreviewUrl: "" }]);
  };

  /**
   * Removes a link from the `links` array. Prevents removing the last link.
   * @param {number} index - Index of the link to remove.
   */
  const removeLink = (index) => {
    if (links.length === 1) {
      toast.error("At least one link is required.");
      return;
    }
    const updated = [...links];
    updated.splice(index, 1);
    setLinks(updated);
  };

  /**
   * Handles profile picture file selection and sets a local preview URL.
   * @param {Event} event - The file input change event.
   */
  const handleProfilePicFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreviewUrl(URL.createObjectURL(file)); // Create a blob URL for preview
    } else {
      setProfilePic(null);
      setProfilePicPreviewUrl(""); // Clear preview
    }
  };

  /**
   * Handles custom link image file selection and sets a local preview URL.
   * @param {Event} event - The file input change event.
   * @param {number} index - Index of the link to update.
   */
  const handleCustomLinkImageFileChange = (event, index) => {
    const file = event.target.files[0];
    const updatedLinks = [...links];
    if (file) {
      updatedLinks[index].imageFile = file;
      updatedLinks[index].linkImagePreviewUrl = URL.createObjectURL(file);
    } else {
      updatedLinks[index].imageFile = null;
      updatedLinks[index].linkImagePreviewUrl = "";
    }
    setLinks(updatedLinks);
  };

  /**
   * Calls the AI backend to generate a bio based on user input.
   */
  const getAIBioResponse = async () => {
    setIsAILoading(true);
    // getAccessToken is from AuthContext
    const token = await getAccessToken(); // Ensure token is available
    try {
      // Direct call to Gemini API using a fetch, as axios might not be configured for direct LLM calls easily
      // Assumes `import.meta.env.VITE_BACKEND_URL` is where your backend is hosted
      const chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: `Generate a short and catchy bio (max 250 characters) based on the following: ${aiBioQuestion}` }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // API key will be provided by Canvas runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setAiBioAnswer(text);
        setBio(text); // Automatically set the generated bio to the bio field
        toast.success("Bio generated by AI!");
      } else {
        console.error("AI Bio Generation Error: Unexpected API response structure", result);
        setAiBioAnswer("❌ Error generating bio. Unexpected AI response.");
        toast.error("Failed to generate bio with AI. Please try again.");
      }
    } catch (error) {
      console.error("AI Bio Generation Error:", error);
      setAiBioAnswer("❌ Error generating bio.");
      toast.error("Failed to generate bio with AI. Please try again.");
    } finally {
      setIsAILoading(false);
    }
  };

  /**
   * Handles the form submission to create a new ZapLink.
   */
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Obtain authentication token from AuthContext
      const token = await getAccessToken();

      // Form validation
      if (!username.trim()) {
        toast.error("Username is required.");
        setIsSaving(false); return;
      }
      if (username.length < 3 || username.length > 30) {
        toast.error("Username must be between 3 and 30 characters long.");
        setIsSaving(false); return;
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        toast.error(
          "Username can only contain letters, numbers, underscores, hyphens, and periods."
        );
        setIsSaving(false); return;
      }

      if (bio.length > 250) {
        toast.error("Bio cannot exceed 250 characters.");
        setIsSaving(false); return;
      }

      if (links.length === 0) {
        toast.error("At least one link is required.");
        setIsSaving(false); return;
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("template", selectedTemplate);

      // Append profile picture if a new one is selected
      if (profilePic instanceof File) {
        formData.append("profilePic", profilePic);
      }

      // Helper function for URL validation
      const isValidUrl = (url) => {
        const regex =
          /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|sms:[^\s]+|whatsapp:[^\s]+)/i;
        return regex.test(url);
      };

      // Format links data for backend
      const formattedLinks = links.map((link, index) => {
        const platform = PLATFORMS.find((p) => p.name === link.platform);
        if (!platform) {
          toast.error(`Invalid platform selected for link: ${link.platform}`);
          throw new Error(`Invalid platform: ${link.platform}`);
        }

        let fullUrl = "";
        let displayTitle = link.title || platform.name;

        // Construct full URL based on platform type
        if (platform.name === "Custom") {
          fullUrl = link.value;
        } else if (platform.name === "Gmail") {
          fullUrl = platform.prefix + link.value;
        } else if (platform.name === "Website") {
          fullUrl = link.value;
          // Ensure Website URLs have a protocol
          if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
            fullUrl = "https://" + fullUrl;
          }
        } else {
          fullUrl = platform.prefix + link.value;
        }

        // Validate constructed URL
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
          icon: platform.name.toLowerCase(), // Store icon name (e.g., "instagram", "custom")
          platform: link.platform, // Explicitly include platform for backend logic
        };
      });

      // Append stringified links array to FormData
      formData.append("links", JSON.stringify(formattedLinks));
      
      // Append individual custom link image files to FormData
      links.forEach((link, index) => {
        if (link.platform === "Custom" && link.imageFile instanceof File) {
          formData.append(`linkImage_${index}`, link.imageFile);
        }
      });

      // Log FormData content for debugging (for development environment)
      // console.log("Sending FormData to backend:");
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }

      // Make the actual API call to your backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/zaplink/link-page`, // Your backend endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' is usually set automatically by axios when sending FormData
          },
        }
      );

      // Handle successful response
      setLinkPageUrl(response.data.linkPageUrl);
      toast.success("Zap link created successfully!", {
        description: "Your new link page has been created.",
      });
      // Reset form fields after successful submission for a new creation
      setUsername("");
      setBio("");
      setProfilePic(null);
      setProfilePicPreviewUrl("");
      setLinks([{ platform: "Instagram", value: "", title: "", imageFile: null, linkImagePreviewUrl: "" }]);
      setSelectedTemplate("default");

    } catch (err) {
      console.error("Submission Error:", err);
      // Extract error message from backend response or provide a generic one
      const message =
        err.response?.data?.message ||
        "There was an error creating your Zap link. Please try again.";
      toast.error("Error creating Zap link.", { description: message });
    } finally {
      setIsSaving(false); // End saving state regardless of success or failure
    }
  };

  /**
   * Handles downloading the generated QR code.
   */
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

  /**
   * Handles copying the generated QR code image to the clipboard.
   * Uses `document.execCommand('copy')` for better iframe compatibility.
   */
  const handleCopyQRCode = async () => {
    if (qrCodeDataUrl) {
      try {
        // Attempt to use modern Clipboard API first
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
          // Fallback for older browsers or environments without Clipboard API access (like some iframes)
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

  /**
   * Handles copying the generated ZapLink page URL to the clipboard.
   * Uses `document.execCommand('copy')` for better iframe compatibility.
   */
  const handleCopyLink = () => {
    if (linkPageUrl) {
      const tempInput = document.createElement('textarea');
      tempInput.value = linkPageUrl;
      document.body.appendChild(tempInput);
      tempInput.select(); // Select the text
      try {
        document.execCommand('copy'); // Execute copy command
        toast.success("Link copied!", {
          description: "Your link-in-bio URL has been copied to your clipboard.",
        });
      } catch (err) {
        console.error("Failed to copy link:", err);
        toast.error("Copy failed.", {
          description: "Could not copy the link. Please try again manually.",
        });
      } finally {
        document.body.removeChild(tempInput); // Clean up the temporary textarea
      }
    }
  };

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto p-4 space-y-4 dark:bg-gray-900 dark:text-white">
      <Card className="dark:bg-gray-800 shadow-none border-none">
        <CardContent className="space-y-4 pt-6">
          {/* Username Input */}
          <Input
            placeholder="Your unique username (e.g., zaplink123)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            This will be the path for your main link page:{" "}
            <span className="font-semibold">
              {window.location.origin}/zaplink/{username || "[username]"}
            </span>
          </p>

          {/* Profile Picture Upload */}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfilePicFileChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white file:dark:text-gray-300"
            />
            {profilePicPreviewUrl && (
              <img
                src={profilePicPreviewUrl}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
          </div>

          <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Bio Section with AI integration */}
          <h2 className="text-lg font-semibold dark:text-white">Bio</h2>
          <div className="flex items-center gap-2">
            <Textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={useAIBio}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setUseAIBio(!useAIBio)}
              title={useAIBio ? "Disable AI Bio" : "Generate Bio with AI"}
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            >
              {useAIBio ? (
                <Pencil className="h-5 w-5" />
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
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button
                onClick={getAIBioResponse}
                disabled={isAILoading || !aiBioQuestion.trim()}
                className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
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
              {aiBioAnswer && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI Suggestion: {aiBioAnswer}
                </p>
              )}
            </div>
          )}

          <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Template Chooser Field */}
          <h2 className="text-lg font-semibold dark:text-white">Choose Your Template</h2>
          <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
            <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:text-white">
              {TEMPLATES.map((template) => (
                <SelectItem key={template.value} value={template.value}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Select a visual template for your link-in-bio page.
          </p>

          <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Links Section */}
          <h2 className="text-lg font-semibold dark:text-white">Links</h2>
          {links.map((link, index) => {
            const selected =
              PLATFORMS.find((p) => p.name === link.platform) || PLATFORMS[0]; // Get selected platform details

            return (
              <div
                key={index}
                className="flex flex-col gap-2 p-4 border rounded-md dark:border-gray-700 dark:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(val) => {
                      handleLinkChange(index, "platform", val);
                      // Reset title, value, and image if platform changes away from Custom
                      if (val !== "Custom") {
                        handleLinkChange(index, "title", "");
                        handleLinkChange(index, "imageFile", null);
                        handleLinkChange(index, "linkImagePreviewUrl", "");
                      }
                      handleLinkChange(index, "value", ""); // Always reset value when platform changes
                    }}
                    value={link.platform}
                  >
                    <SelectTrigger className="w-[140px] dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-white">
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
                      className="h-5 w-5 text-muted-foreground dark:text-gray-400"
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
                      className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(index)}
                    disabled={links.length === 1}
                    className="dark:hover:bg-gray-600"
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
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
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
                        className="text-xl p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        😊
                      </button>
                    </div>
                    {showEmojiPicker && activeLinkIndex === index && (
                      <div
                        className="absolute z-50 mt-2 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-md"
                        style={
                          pickerPosition === "top"
                            ? { bottom: "calc(100% + 8px)" }
                            : { top: "100%" }
                        }
                      >
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">
                      This is the text that will appear on your page for this
                      link.
                    </p>

                    {/* Custom Link Image Upload */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCustomLinkImageFileChange(e, index)}
                        className="flex-grow dark:bg-gray-600 dark:border-gray-500 dark:text-white file:dark:text-gray-300"
                      />
                      {link.linkImagePreviewUrl ? (
                        <img
                          src={link.linkImagePreviewUrl}
                          alt="Link Icon"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Button className="mr-[10px] dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white" variant="outline" onClick={addLink}>
            + Add Link
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="dark:bg-green-600 dark:hover:bg-green-700 dark:text-white">
            {isSaving ? (
              <>
                <FAIcon icon={faSpinner} spin className="h-4 w-4 mr-2" />{" "}
                Creating...
              </>
            ) : (
              "Create Zap Link"
            )}
          </Button>

          <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Link Page URL and QR Code Display */}
          {linkPageUrl && linkPageUrl.trim() && (
            <>
              <h2 className="text-lg font-semibold mt-6 dark:text-white">Your Link-in-Bio</h2>
              <div className="flex flex-col md:flex-row items-center gap-6 p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-700">
                <div ref={qrCodeRef} className="p-2 border rounded-lg dark:border-gray-600 dark:bg-white">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-300">
                      Generating QR Code...
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center md:items-start gap-4 w-full">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownloadQRCode}
                      className="gap-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                      disabled={!qrCodeDataUrl}
                    >
                      <FAIcon icon={faDownload} className="h-4 w-4" /> Download
                      QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyQRCode}
                      className="gap-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                      disabled={!qrCodeDataUrl}
                    >
                      <FAIcon icon={faCopy} className="h-4 w-4" /> Copy QR
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <Input value={linkPageUrl} readOnly className="flex-grow dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
                    <Button onClick={handleCopyLink} className="gap-1 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white">
                      <FAIcon icon={faCopy} className="h-4 w-4" /> Copy Link
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center md:text-left dark:text-gray-400">
                    Scan this QR code or copy the link to share your hello.
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
