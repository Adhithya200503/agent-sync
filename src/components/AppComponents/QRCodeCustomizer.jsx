import React, { useRef, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toPng } from "html-to-image";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const ColorPicker = ({ label, color, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm">{label}:</span>
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="h-6 w-6 rounded-full border cursor-pointer"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-32 p-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-8 border-none cursor-pointer"
        />
      </PopoverContent>
    </Popover>
  </div>
);

const themes = {
  default: { qr: "#000000", bg: "#ffffff" },
  dark: { qr: "#ffffff", bg: "#333333" },
  blue: { qr: "#1a5276", bg: "#eaf2f8" },
  green: { qr: "#2e864d", bg: "#e8f8f5" },
  purple: { qr: "#512e5f", bg: "#f4ecf7" },
};

const QRCodeCustomizerDialog = ({
  url = "https://example.com",
  imageUrl = null,
  downloadEnabled = true,
  customizeQR,
  setCustomizeQR,
}) => {
  const [qrText, setQrText] = useState(url);
  const [qrColor, setQrColor] = useState(themes.default.qr);
  const [bgColor, setBgColor] = useState(themes.default.bg);
  const [frameStyle, setFrameStyle] = useState("none");
  const [image, setImage] = useState(imageUrl);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [imageSize, setImageSize] = useState(60);
  const qrRef = useRef(null);

  useEffect(() => {
    setQrText(url);
    setImage(imageUrl);
    setQrColor(themes.default.qr);
    setBgColor(themes.default.bg);
    setSelectedTheme("default");
    setImageSize(60);
  }, [url, imageUrl]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleThemeChange = (themeName) => {
    setSelectedTheme(themeName);
    setQrColor(themes[themeName].qr);
    setBgColor(themes[themeName].bg);
  };

  const downloadQR = () => {
    if (qrRef.current) {
      toPng(qrRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "custom-qr.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => console.error("Download failed", err));
    }
  };

  return (
    <Dialog open={customizeQR} onOpenChange={setCustomizeQR}>
      <DialogTrigger asChild>
        <Button variant="default">Customize QR</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-h-[90vh] w-full max-w-full sm:max-w-xl md:max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>QR Code Customizer</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Content */}
          <div className="col-span-full">
            <label
              htmlFor="qr-content"
              className="text-sm font-medium mb-2 block"
            >
              QR Content
            </label>
            <Input
              id="qr-content"
              type="text"
              placeholder="Enter QR content"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
            />
          </div>

          {/* Themes */}
          <div>
            <label
              htmlFor="qr-theme"
              className="text-sm font-medium mb-2 block"
            >
              Predefined Themes
            </label>
            <Select value={selectedTheme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-full" id="qr-theme">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(themes).map((themeName) => (
                  <SelectItem key={themeName} value={themeName}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            <ColorPicker
              label="QR Color"
              color={qrColor}
              onChange={setQrColor}
            />
            <ColorPicker
              label="BG Color"
              color={bgColor}
              onChange={setBgColor}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="center-image"
              className="text-sm font-medium mb-2 block"
            >
              Upload Center Image
            </label>
            <Input
              id="center-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Image Size */}
          <div>
            <label
              htmlFor="image-size"
              className="text-sm font-medium mb-2 block"
            >
              Center Image Size ({imageSize}px)
            </label>
            <Input
              id="image-size"
              type="range"
              min="20"
              max="100"
              step="5"
              value={imageSize}
              onChange={(e) => setImageSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Frame Style */}
          <div className="col-span-full">
            <label
              htmlFor="frame-style"
              className="text-sm font-medium mb-2 block"
            >
              Frame Style
            </label>
            <Select value={frameStyle} onValueChange={setFrameStyle}>
              <SelectTrigger className="w-full" id="frame-style">
                <SelectValue placeholder="Select a frame style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="rounded-square">Rounded Square</SelectItem>
                <SelectItem value="thick-square">Thick Square</SelectItem>
                <SelectItem value="dashed-square">Dashed Square</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* QR Code Preview */}
          <div className="col-span-full flex flex-col items-center mt-4">
            <div className="relative inline-block" ref={qrRef}>
              <QRCodeCanvas
                value={qrText}
                size={150}
                bgColor={bgColor}
                fgColor={qrColor}
                level="H"
                includeMargin={false}
              />
              {image && (
                <img
                  src={image}
                  alt="center"
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: `${imageSize}px`,
                    height: `${imageSize}px`,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
              )}
              {frameStyle !== "none" && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    border:
                      frameStyle === "square"
                        ? `6px solid ${qrColor}`
                        : frameStyle === "rounded-square"
                        ? `6px solid ${qrColor}`
                        : frameStyle === "thick-square"
                        ? `12px solid ${qrColor}`
                        : frameStyle === "dashed-square"
                        ? `6px dashed ${qrColor}`
                        : `6px solid ${qrColor}`,
                    borderRadius:
                      frameStyle === "rounded-square" ? "15px" : "0",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>

            {downloadEnabled && (
              <div className="text-center mt-4">
                <Button onClick={downloadQR}>Download QR</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeCustomizerDialog;
