import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeCanvas } from "qrcode.react";

const PortfolioLinkResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const originalLink = location.state?.url || "";
  console.log(originalLink);
  const [shortenedUrl, setShortenedUrl] = React.useState(null);
  const qrRef = React.useRef();

  const handleCopy = () => {
    if (originalLink) {
      navigator.clipboard.writeText(originalLink);
      alert("Copied to clipboard!");
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  };

  const handleShorten = () => {
    const short = originalLink.split("/").slice(-1)[0].slice(0, 6);
    setShortenedUrl(`https://zurl.to/${short}`);
  };

  if (!originalLink) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">No portfolio link found. Please create a portfolio first.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 text-center">
      <h2 className="text-2xl font-bold">Your Zaplink</h2>

      <div className="flex items-center gap-2">
        <Input readOnly value={originalLink} />
        <Button onClick={handleCopy}>Copy</Button>
      </div>

      {shortenedUrl && (
        <div className="text-sm text-muted-foreground">
          Short URL: <a href={shortenedUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{shortenedUrl}</a>
        </div>
      )}

      <div ref={qrRef} className="mx-auto w-fit">
        <QRCodeCanvas value={originalLink} size={180} />
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={handleDownloadQR}>Download QR</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        <Button onClick={handleShorten}>Shorten URL</Button>
      </div>
    </div>
  );
};

export default PortfolioLinkResult;
