import React, { useState, useRef } from "react";
import { Card, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Plus } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import ZapStoreList from "./ZapStoreList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const socialMediaRegex = {
  Website: /^(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/i, // General URL pattern for Website
  GitHub: /^(https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+)\/?$/i,
  Twitter: /^(https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+)\/?$/,
  YouTube: /^(https?:\/\/(www\.)?youtube\.com\/[a-zA-Z0-9_-]+)\/?$/,
  Instagram: /^(https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+)\/?$/,
  LinkedIn: /^(https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+)\/?$/,
  // Basic email validation regex
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Basic phone number validation (adjust based on expected formats, e.g., international)
  phoneNumber: /^\+?[0-9]{6,15}$/, // Allows optional '+' and 6-15 digits
};

const socialMediaPlatforms = [
  "Website",
  "GitHub",
  "Twitter",
  "YouTube",
  "Instagram",
  "LinkedIn",
  // Add more as needed
];

const ZapStoreHome = () => {
  const [zapStores, setZapStores] = useState([]);
  const [formData, setFormData] = useState({
    storeName: "",
    bio: "",
    address: "", // Changed to a single string
    logo: null,
    phoneNumber: "",
    email: "",
    socialMediaLinks: [], // Changed to an array
  });

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const abortControllerRef = useRef(null);
  const { getAccessToken } = useAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "logo") {
      setFormData({ ...formData, logo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSocialMediaChange = (index, field, value) => {
    setValidationErrors((prev) => ({ ...prev, [`socialMediaLinks[${index}].${field}`]: undefined }));
    const newSocialMediaLinks = [...formData.socialMediaLinks];
    newSocialMediaLinks[index] = { ...newSocialMediaLinks[index], [field]: value };
    setFormData((prev) => ({ ...prev, socialMediaLinks: newSocialMediaLinks }));
  };

  const addSocialMediaLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks: [...prev.socialMediaLinks, { type: "", url: "" }],
    }));
  };

  const removeSocialMediaLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks: prev.socialMediaLinks.filter((_, i) => i !== index),
    }));
    // Clear any validation errors related to the removed link
    const newValidationErrors = { ...validationErrors };
    delete newValidationErrors[`socialMediaLinks[${index}].type`];
    delete newValidationErrors[`socialMediaLinks[${index}].url`];
    setValidationErrors(newValidationErrors);
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    // Required fields
    if (!formData.storeName.trim()) { errors.storeName = "Store Name is required"; isValid = false; }
    if (!formData.bio.trim()) { errors.bio = "Bio is required"; isValid = false; }
    if (!formData.address.trim()) { errors.address = "Address is required"; isValid = false; } // Validating address as a single string
    if (!formData.logo) { errors.logo = "Store Logo is required"; isValid = false; }

    // Validate Email
    if (formData.email && !socialMediaRegex.email.test(formData.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    // Validate Phone Number
    if (formData.phoneNumber && !socialMediaRegex.phoneNumber.test(formData.phoneNumber)) {
      errors.phoneNumber = "Invalid phone number format (e.g., +919876543210)";
      isValid = false;
    }

    // Validate Social Media Links array
    formData.socialMediaLinks.forEach((link, index) => {
      if (!link.type.trim()) {
        errors[`socialMediaLinks[${index}].type`] = "Type is required";
        isValid = false;
      }
      if (!link.url.trim()) {
        errors[`socialMediaLinks[${index}].url`] = "URL is required";
        isValid = false;
      }
      if (link.type && link.url && socialMediaRegex[link.type] && !socialMediaRegex[link.type].test(link.url)) {
        errors[`socialMediaLinks[${index}].url`] = `Invalid ${link.type} URL`;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the form errors.");
      return;
    }

    setLoading(true);

    const payload = new FormData();
    payload.append("storeName", formData.storeName);
    payload.append("bio", formData.bio);
    payload.append("address", formData.address); // Send address as a string
    payload.append("phoneNumber", formData.phoneNumber);
    payload.append("email", formData.email);
    payload.append("socialMediaLinks", JSON.stringify(formData.socialMediaLinks)); // Send socialMediaLinks as JSON string

    if (formData.logo) {
      payload.append("logo", formData.logo);
    }

    const token = await getAccessToken();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/create-zapStore`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      toast.success(`${res.data.message} | Store ID: ${res.data.storeId}`);
      resetForm();
      const newStore = res.data.storeData;
      setZapStores((prev) => [...prev, newStore]);
      setOpen(false);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled");
      } else {
        console.error(err);
        toast.error(err.response?.data?.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const resetForm = () => {
    setFormData({
      storeName: "",
      bio: "",
      address: "", // Reset to empty string
      logo: null,
      phoneNumber: "",
      email: "",
      socialMediaLinks: [], // Reset to empty array
    });
    setValidationErrors({});
  };

  return (
    <div>
      <div className="w-full flex flex-col mb-4">
        <span className="text-2xl mb-2">Zap Store</span>
        <span>Create your own ecommerce website</span>
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
            resetForm();
          }
        }}
      >
        <DialogTrigger asChild>
          <Card className="w-[150px] h-[150px] flex flex-col justify-center items-center cursor-pointer">
            <Plus className="w-[30px] h-[30px]" />
            <CardFooter className="text-sm">Zap Store</CardFooter>
          </Card>
        </DialogTrigger>

        <DialogContent className="w-[90vw] max-w-none md:w-[70vw] md:max-w-none lg:w-[70vw] lg:max-w-none p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Create Zap Store</DialogTitle>
            <DialogDescription>Fill out the details below</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-full md:col-span-1">
                  <Label htmlFor="storeName" className="mb-1 block">
                    Store Name
                  </Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                  {validationErrors.storeName && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.storeName}
                    </p>
                  )}
                </div>

                <div className="md:col-span-full">
                  <Label htmlFor="bio" className="mb-1 block">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                  {validationErrors.bio && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.bio}
                    </p>
                  )}
                </div>

                <div className="col-span-full md:col-span-1">
                  <Label htmlFor="logo" className="mb-1 block">
                    Store Logo
                  </Label>
                  <Input
                    id="logo"
                    type="file"
                    name="logo"
                    onChange={handleChange}
                    className="w-full"
                  />
                  {validationErrors.logo && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.logo}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Field (single string) */}
              <div>
                <Label htmlFor="address" className="mb-1 block">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g., 123 Main St, Anna Nagar, Chennai, 600001"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
                {validationErrors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.address}
                  </p>
                )}
              </div>

              {/* Phone Number and Email Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full md:col-span-1">
                  <Label htmlFor="phoneNumber" className="mb-1 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g., +919876543210"
                    className="w-full"
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="col-span-full md:col-span-1">
                  <Label htmlFor="email" className="mb-1 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., store@example.com"
                    className="w-full"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Media Links (Dynamic Array) */}
              <div>
                <Label className="mb-2 block">
                  Social Media Links (Optional)
                </Label>
                {formData.socialMediaLinks.map((link, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 items-end">
                    <div>
                      <Label htmlFor={`socialMediaLink-type-${index}`} className="sr-only">
                        Type
                      </Label>
                      <Select
                        value={link.type}
                        onValueChange={(value) => handleSocialMediaChange(index, 'type', value)}
                      >
                        <SelectTrigger id={`socialMediaLink-type-${index}`}>
                          <SelectValue placeholder="Select Platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {socialMediaPlatforms.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors[`socialMediaLinks[${index}].type`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`socialMediaLinks[${index}].type`]}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 flex items-end gap-2">
                      <div className="flex-grow">
                        <Label htmlFor={`socialMediaLink-url-${index}`} className="sr-only">
                          URL
                        </Label>
                        <Input
                          id={`socialMediaLink-url-${index}`}
                          type="url"
                          placeholder="Enter URL"
                          value={link.url}
                          onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                          className="w-full"
                        />
                        {validationErrors[`socialMediaLinks[${index}].url`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors[`socialMediaLinks[${index}].url`]}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeSocialMediaLink(index)}
                      >
                        -
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={addSocialMediaLink} variant="outline" className="mt-2">
                  Add Social Media Link
                </Button>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="animate-spin w-4 h-4" /> Creating...
                    </span>
                  ) : (
                    "Create Store"
                  )}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ZapStoreList zapStores={zapStores} setZapStores={setZapStores} />
    </div>
  );
};

export default ZapStoreHome;