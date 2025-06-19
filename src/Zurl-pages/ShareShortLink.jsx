
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  faWhatsapp,
  faTelegram,
  faTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";

const ShareShortLink = ({ shortUrl, title = "Check this out!" }) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(shortUrl);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: faWhatsapp,
      color: "text-green-500",
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: faTelegram,
      color: "text-blue-500",
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: faTwitter,
      color: "text-sky-500",
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: faFacebook,
      color: "text-blue-700",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Link copied to clipboard!");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><Share2/>Share</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share your short link</DialogTitle>
          <DialogDescription>
            Share this link or copy it directly
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between p-3 border rounded-md mb-4">
          <span className="text-sm truncate max-w-[70%]">{shortUrl}</span>
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            <Copy className="mr-2" />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2">
          {links.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 border rounded-md hover:bg-muted transition"
            >
              <FontAwesomeIcon
                icon={item.icon}
                size="2x"
                className={`${item.color} mb-2`}
              />
              <span className="text-sm">{item.name}</span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareShortLink;
