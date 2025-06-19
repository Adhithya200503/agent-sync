import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const socialMediaRegex = {
  Website: /^(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/i,
  GitHub: /^(https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+)\/?$/i,
  Twitter: /^(https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+)\/?$/,
  YouTube: /^(https?:\/\/(www\.)?youtube\.com\/[a-zA-Z0-9_-]+)\/?$/,
  Instagram: /^(https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+)\/?$/,
  LinkedIn: /^(https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+)\/?$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneNumber: /^\+?[0-9]{6,15}$/,
};

const socialMediaPlatforms = [
  "Website",
  "GitHub",
  "Twitter",
  "YouTube",
  "Instagram",
  "LinkedIn",
];

const EditZapStore = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    storeName: "",
    bio: "",
    address: "", // Changed to a single string
    logo: null,
    currentLogoUrl: "",
    phoneNumber: "",
    email: "",
    socialMediaLinks: [], // Changed to an array
  });

  const [loading, setLoading] = useState(false);
  const [fetchingStore, setFetchingStore] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const abortControllerRef = useRef(null);
  const { getAccessToken } = useAuth();

  const fetchStoreData = useCallback(async () => {
    if (!storeId) {
      toast.error("Store ID is missing. Redirecting...");
      navigate("/zap-stores");
      return;
    }

    setFetchingStore(true);
    const token = await getAccessToken();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/stores/${storeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      const responseData = res.data;
      const storeData = responseData.store;

      if (!storeData) {
        toast.error("Store data not found in response.");
        navigate("/zap-stores");
        return;
      }

      setFormData({
        storeName: storeData.storeName || "",
        bio: storeData.bio || "",
        address: storeData.address || "", // Directly set the address string
        logo: null,
        currentLogoUrl: storeData.storeImageUrl || "",
        phoneNumber: storeData.phoneNumber || "",
        email: storeData.email || "",
        socialMediaLinks: storeData.socialMediaLinks || [], // Directly set the array
      });
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Fetch request canceled");
      } else {
        console.error("Error fetching store:", err);
        toast.error(err.response?.data?.error || "Failed to load store data.");
        navigate("/zap-stores");
      }
    } finally {
      setFetchingStore(false);
      abortControllerRef.current = null;
    }
  }, [storeId, getAccessToken, navigate]);

  useEffect(() => {
    fetchStoreData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStoreData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "logo") {
      setFormData({ ...formData, logo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value }); // Update address directly if name is "address"
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

    if (!formData.logo && !formData.currentLogoUrl) { errors.logo = "Store Logo is required"; isValid = false; }

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
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/zap-store/stores/store/update/${storeId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          signal: controller.signal,
        }
      );

      toast.success(res.data.message || "Store updated successfully!");
      navigate("/zap-store");
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled");
      } else {
        console.error("Error updating store:", err);
        toast.error(err.response?.data?.error || "Failed to update store.");
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  if (fetchingStore) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin w-8 h-8 text-gray-500" />
        <span className="ml-2 text-gray-700">Loading store data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="w-full flex flex-col mb-6">
        <span className="text-3xl font-bold mb-2">Edit Zap Store</span>
        <span className="text-gray-600">Update your store's information</span>
      </div>

      <ScrollArea className="max-h-[80vh] px-4 py-2 pr-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Store Name */}
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
              />
              {validationErrors.storeName && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.storeName}
                </p>
              )}
            </div>

            {/* Bio */}
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
              />
              {validationErrors.bio && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.bio}
                </p>
              )}
            </div>

            {/* Store Logo */}
            <div className="col-span-full md:col-span-full">
              <Label htmlFor="logo" className="mb-1 block">
                Store Logo
              </Label>
              {formData.currentLogoUrl && (
                <div className="mb-2">
                  <img
                    src={formData.currentLogoUrl}
                    alt="Current Store Logo"
                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current Logo
                  </p>
                </div>
              )}
              <Input id="logo" type="file" name="logo" onChange={handleChange} />
              {validationErrors.logo && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.logo}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Upload a new image to replace the current one. Max size 2MB.
              </p>
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

          {/* Contact Fields */}
          <div>
            <Label className="mb-2 block text-lg font-medium">Contact Information</Label>
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
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Links (Dynamic Array) */}
          <div>
            <Label className="mb-2 block text-lg font-medium">
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

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin w-4 h-4" /> Updating...
                </span>
              ) : (
                "Update Store"
              )}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
};

export default EditZapStore;