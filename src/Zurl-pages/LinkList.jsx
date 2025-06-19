import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { db } from "../../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import {
  Trash2,
  Copy,
  Calendar as CalendarIcon,
  Search,
  SlidersHorizontal,
  Share2,
  EllipsisVertical, // For the three dots menu
  QrCode,
  Eye, // For QR code icon
} from "lucide-react";
import {
  faTwitter,
  faFacebookF,
  faLinkedinIn,
  faWhatsapp,
  faInstagram,
  faYoutube,
  faReddit,
  faPinterest,
  faTelegramPlane,
  faSnapchatGhost,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import QRCode from "react-qr-code";
import copy from "copy-to-clipboard";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Import Dialog components for the modal
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LinkList() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState("");
  const MAX_SEARCH_LENGTH = 50;
  const [filterProtection, setFilterProtection] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [date, setDate] = useState(null); // State for the selected date

  // QR Code Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentQrLink, setCurrentQrLink] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 5;

  // Function to fetch links based on current filters and search
  const fetchLinks = async () => {
    if (!currentUser || !currentUser.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let q = query(
        collection(db, "short-links"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      // Apply Protection filter
      if (filterProtection === "protected") {
        q = query(q, where("protected", "==", true));
      } else if (filterProtection === "unprotected") {
        q = query(q, where("protected", "==", false));
      }

      // Apply Active Status filter
      if (filterActive === "active") {
        q = query(q, where("isActive", "==", true));
      } else if (filterActive === "inactive") {
        q = query(q, where("isActive", "==", false));
      }

      const snapshot = await getDocs(q);
      let fetchedLinks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // --- Client-side Date Filtering ---
      if (date) {
        const selectedDayString = format(date, "yyyy-MM-dd");

        fetchedLinks = fetchedLinks.filter((link) => {
          if (typeof link.createdAt === "string") {
            const linkDatePart = link.createdAt.substring(0, 10);
            return linkDatePart === selectedDayString;
          }
          return false;
        });
      }
       
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        fetchedLinks = fetchedLinks.filter(
          (link) =>
            
            link.id.toLowerCase().includes(lowerCaseSearchTerm) ||
            link.shortUrl?.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }

      setLinks(fetchedLinks);
      setCurrentPage(1); // Reset to first page on filter/search change
      setLoading(false);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast.error("Failed to fetch links: " + error.message);
      setLoading(false);
    }
  };

  const handleSearchButtonClick = () => {
    fetchLinks(); // Trigger the search using the current searchTerm
  };
  console.log(links)
  useEffect(() => {
    fetchLinks();
  }, [currentUser, filterProtection, filterActive, date]);

  const deleteLink = async (id) => {
    try {
      await deleteDoc(doc(db, "short-links", id));
      await fetchLinks(); // Re-fetch all links after delete
      toast.success("Link deleted successfully!");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link.");
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const docRef = doc(db, "short-links", id);
      await updateDoc(docRef, {
        isActive: !currentStatus,
      });
      await fetchLinks();
      toast.success(
        `Link ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
      toast.error("Failed to update link status.");
    }
  };

  const toggleProtection = async (id, currentStatus) => {
    try {
      const docRef = doc(db, "short-links", id);
      await updateDoc(docRef, {
        protected: !currentStatus,
      });
      await fetchLinks();
      toast.success(
        `Link protection ${
          !currentStatus ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
      toast.error("Failed to update link status.");
    }
  };

  const copyToClipboard = (text) => {
    if (copy(text)) {
      toast.success("Copied to clipboard!");
    } else {
      toast.error("Failed to copy.");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_SEARCH_LENGTH) {
      setSearchTerm(value);
    } else {
      toast.info(`Search term cannot exceed ${MAX_SEARCH_LENGTH} characters.`);
    }
  };

  const handleGenerateQR = (link) => {
    setCurrentQrLink(link);
    setShowQrModal(true);
  };

  const handleDownloadQR = () => {
    if (!currentQrLink) return;

    const svgElement = document.getElementById(`qr-code-${currentQrLink.id}`);

    if (!svgElement) {
      toast.error("Failed to find QR code element for download.");
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = img.width;
        offscreenCanvas.height = img.height;
        const ctx = offscreenCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const pngDataUrl = offscreenCanvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngDataUrl;
        a.download = `qr-${currentQrLink.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("QR Code download initiated!");
      };
      img.onerror = (err) => {
        console.error("Error loading SVG image for QR download:", err);
        toast.error("Failed to process QR code for download. Try again.");
      };
      img.src = url;
    } catch (error) {
      console.error("Error during QR code download:", error);
      toast.error("An error occurred during QR code download.");
    }
  };

  // Function to generate social media share URLs
  const getShareUrl = (platform, url, text = "", title = "") => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const encodedTitle = encodeURIComponent(title);

    switch (platform) {
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case "linkedin":
        return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`;
      case "whatsapp":
        return `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
      case "email":
        return `mailto:?subject=${
          encodedTitle || "Check out this link"
        }&body=${encodedText}%20${encodedUrl}`;
      case "pinterest":
        return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
      case "reddit":
        return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
      case "telegram":
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
      default:
        return "#"; // Fallback
    }
  };

  // Pagination logic
  const indexOfLastLink = currentPage * linksPerPage;
  const indexOfFirstLink = indexOfLastLink - linksPerPage;
  const currentLinks = links.slice(indexOfFirstLink, indexOfLastLink);
  const totalPages = Math.ceil(links.length / linksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="grid gap-4 p-4 max-w-2xl lg:max-w-6xl mx-auto">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 grid gap-4 max-w-2xl lg:max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        My Short Links
      </h1>

      {/* --- Filter and Search Bar Section --- */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-1/2 flex items-center">
          <Input
            type="text"
            placeholder={`Search by ID or Short URL (max ${MAX_SEARCH_LENGTH} chars)`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pr-4 py-2 border rounded-md w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
            maxLength={MAX_SEARCH_LENGTH}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchButtonClick();
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchButtonClick}
            className="ml-2 shrink-0 dark:text-white dark:hover:bg-gray-700"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Filter Options */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Protection Filter */}
          <Select value={filterProtection} onValueChange={setFilterProtection}>
            <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Protection Status" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:text-white">
              <SelectItem value="all">All Protection</SelectItem>
              <SelectItem value="protected">Protected</SelectItem>
              <SelectItem value="unprotected">Unprotected</SelectItem>
            </SelectContent>
          </Select>

          {/* Active Status Filter */}
          <Select value={filterActive} onValueChange={setFilterActive}>
            <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Active Status" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Picker Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full sm:w-[200px] justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  !date && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 dark:bg-gray-800">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="dark:text-white"
              />
              {date && (
                <div className="p-2 flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setDate(null)}
                    className="text-sm dark:text-white"
                  >
                    Clear Date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {/* --- End Filter and Search Bar Section --- */}

      {links.length === 0 && (
        <p className="text-center text-gray-500 dark:text-white">
          No links found matching your criteria. Create your first short link!
        </p>
      )}

      {currentLinks.map((link) => (
        <Card
          key={link.id}
          className="shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800"
        >
          <CardHeader className="p-4 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-700 flex flex-col sm:flex-row items-center justify-between">
              <div className="dark:text-white mb-2 sm:mb-0">
                Short ID:{" "}
                <span className="font-mono text-blue-600 tracking-wider dark:text-white">
                  {link.id}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-white">
                Created:{" "}
                {link.createdAt instanceof Timestamp
                  ? new Date(link.createdAt.toDate()).toLocaleDateString()
                  : link.createdAt
                  ? new Date(link.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="font-medium text-gray-900 dark:text-white">
                  Original URL:
                </strong>{" "}
                <a
                  href={link.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all dark:text-blue-400"
                >
                  {link.originalUrl.length > 50
                    ? link.originalUrl.slice(0, 50) + "..."
                    : link.originalUrl}
                </a>
              </p>
              <p className="flex items-center text-gray-700 dark:text-gray-300">
                <strong className="font-medium text-gray-900 dark:text-white">
                  Short URL:
                </strong>{" "}
                <span className="text-green-600 font-mono ml-2 break-all dark:text-green-400">
                  {link.shortUrl}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(link.shortUrl)}
                  className="ml-2 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
                  title="Copy Short URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
                <div className="flex items-center gap-4">
                  <p className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Eye />
                    <span className="text-orange-500 font-bold">
                      {link.clicks || 0}
                    </span>
                  </p>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Status:
                  </span>
                  <Switch
                    checked={link.isActive}
                    onCheckedChange={() => toggleActive(link.id, link.isActive)}
                    className={`${
                      link.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600 dark:text-white">
                    {link.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    URL Protection:
                  </span>
                  <Switch
                    checked={link.protected}
                    onCheckedChange={() =>
                      toggleProtection(link.id, link.protected)
                    }
                    className={`${
                      link.protected ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600 dark:text-white">
                    {link.protected ? "Protected" : "Unprotected"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-row gap-3 justify-end items-end">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-400 text-gray-700 hover:bg-gray-100 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-800 hidden md:block"
              >
                <NavLink to={`/zurl/view-links/${link.id}`} className="flex items-center">
                  View Link Details
                </NavLink>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-gray-400 text-gray-700 hover:bg-gray-100 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-800"
              >
                <NavLink to={`/zurl/${link.id}`} className="flex items-center">
                  Analytics
                </NavLink>
              </Button>

              {/* Share Button with Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-400 text-gray-700 hover:bg-gray-100 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
                  >
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 dark:bg-gray-800 dark:text-white">
                  <div className="flex flex-col gap-2">
                    <a
                      href={getShareUrl(
                        "twitter",
                        link.shortUrl,
                        `Check out my short link: ${link.id}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faTwitter}
                        className="h-5 w-5 text-blue-400"
                      />{" "}
                      Share on Twitter
                    </a>
                    <a
                      href={getShareUrl("facebook", link.shortUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faFacebookF}
                        className="h-5 w-5 text-blue-600"
                      />{" "}
                      Share on Facebook
                    </a>
                    <a
                      href={getShareUrl(
                        "linkedin",
                        link.shortUrl,
                        `Short Link: ${link.id}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faLinkedinIn}
                        className="h-5 w-5 text-blue-700"
                      />{" "}
                      Share on LinkedIn
                    </a>
                    <a
                      href={getShareUrl(
                        "whatsapp",
                        link.shortUrl,
                        `Check out this short link: ${
                         link.id
                        }`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faWhatsapp}
                        className="h-5 w-5 text-green-500"
                      />{" "}
                      Share on WhatsApp
                    </a>
                    <a
                      href={getShareUrl(
                        "email",
                        link.shortUrl,
                        `Check out this short link: ${
                          link.id
                        }`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="h-5 w-5 text-gray-500"
                      />{" "}
                      Share via Email
                    </a>
                    <a
                      href={getShareUrl(
                        "telegram",
                        link.shortUrl,
                        `Check out this short link: ${
                          link.id
                        }`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faTelegramPlane}
                        className="h-5 w-5 text-blue-400"
                      />{" "}
                      Share on Telegram
                    </a>
                    <a
                      href={getShareUrl(
                        "reddit",
                        link.shortUrl,
                        `Check out this short link: ${
                         link.id
                        }`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faReddit}
                        className="h-5 w-5 text-orange-500"
                      />{" "}
                      Share on Reddit
                    </a>
                    <a
                      href={getShareUrl(
                        "pinterest",
                        link.shortUrl,
                        `Check out this short link: ${
                          link.id
                        }`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faPinterest}
                        className="h-5 w-5 text-red-600"
                      />{" "}
                      Share on Pinterest
                    </a>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Three dots menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 shrink-0 dark:text-white dark:hover:bg-gray-700"
                    title="More options"
                  >
                    <EllipsisVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-gray-800 dark:text-white">
                  <DropdownMenuItem
                    onClick={() => handleGenerateQR(link)}
                    className="flex items-center gap-2 dark:hover:bg-gray-700"
                  >
                    <QrCode className="h-4 w-4" /> Generate QR Code
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteLink(link.id)}
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination Controls */}
      {links.length > linksPerPage && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            Previous
          </Button>
          <span className="text-gray-700 dark:text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            Next
          </Button>
        </div>
      )}

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold dark:text-white">
              QR Code for{" "}
              <span className="text-blue-500">
                {currentQrLink?.id}
              </span>
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 dark:text-gray-300">
              Scan this QR code to access your short link.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center p-4 bg-white rounded-md">
            {currentQrLink && (
              <QRCode
                id={`qr-code-${currentQrLink.id}`}
                value={currentQrLink.shortUrl}
                size={256}
                level="H"
                viewBox={`0 0 256 256`}
              />
            )}
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleDownloadQR}
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            >
              Download QR Code (PNG)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
