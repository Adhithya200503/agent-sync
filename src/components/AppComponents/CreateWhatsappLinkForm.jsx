import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../firebase/firebase";
import { toast } from "sonner";
import { Ban } from "lucide-react";


const formSchema = z.object({
  // Add countryCode to the schema
  countryCode: z.string().min(1, "Country code is required").regex(/^\d+$/, "Country code must be digits"),
  phone: z.string().min(10, "Phone number is required").regex(/^\d+$/, "Phone number must be digits"),
  message: z.string().optional(),
  duration: z
    .string()
    .optional()
    .refine((val) => !val || val === "permanent" || /^[0-9]+[mh]$/.test(val), {
      message:
        "Duration must be 'permanent' or a number followed by 'm' or 'h'",
    }),
  customDomain: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(val), // simple domain regex
      { message: "Invalid domain format" }
    ),
});

function CreateWhatsappLinkForm({ onFormChange }) {
  const { getAccessToken, currentUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { // Set a default country code if you have one, e.g., "91" for India
      countryCode: "", // You might want to default this based on user's location or a common one
    }
  });

  const watchedValues = watch();

  const prevValuesRef = useRef();

  // Fetch phone number and country code from Firestore when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.phone) {
            setValue("phone", data.phone);
          }
          // Assuming you also store countryCode in user data
          if (data.countryCode) {
            setValue("countryCode", data.countryCode);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [currentUser, setValue]);

  useEffect(() => {
    if (
      JSON.stringify(prevValuesRef.current) !== JSON.stringify(watchedValues)
    ) {
      onFormChange(watchedValues);
      prevValuesRef.current = watchedValues;
    }
  }, [watchedValues, onFormChange]);

  const [shortUrl, setShortUrl] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoadingQr(true);
      const token = await getAccessToken();
      console.log(token);
      console.log(data.countryCode,data.phone);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/whatsapp/create`,
        // Ensure countryCode is included in the data sent
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 attach token
          },
        }
      );
      setShortUrl(response.data.shortUrl);
      setUploadedData(response.data.uploadedData);
      reset(); // Resets all form fields including countryCode

      // Ensure toast message handles success or error appropriately
      if (response.data.error) {
        toast.error(response.data.error, {
          duration: 3000,
          icon: <Ban />,
        });
      } else {
        toast.success("WhatsApp link created successfully!");
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error(error.response?.data?.error || "An unexpected error occurred", {
        duration: 3000,
        icon: <Ban />,
      });
    } finally {
      setIsLoadingQr(false);
    }
  };

  // Copy shortUrl to clipboard
  const copyToClipboard = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl).then(() => {
      toast.success("Link copied to clipboard!");
    });
  };

  // Download QR code image
  const downloadQrCode = () => {
    if (!uploadedData?.base64DataUrl) return;

    const link = document.createElement("a");
    link.href = uploadedData.base64DataUrl;
    link.download = "whatsapp-qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-w-md min-h-md mx-auto p-6 rounded-xl shadow-md bg-white dark:bg-gray-900 space-y-4">
      <div className="space-y-4">
        {/* --- Start of combined Country Code and Phone Number row --- */}
        <div className="flex gap-4">
          {/* Country Code Input */}
          <div className="flex flex-col gap-1.5 w-1/4"> {/* Adjusted width for country code */}
            <label
              htmlFor="countryCode"
              className="text-sm font-medium text-gray-900 dark:text-gray-200"
            >
              Country Code
            </label>
            <input
              id="countryCode"
              {...register("countryCode")}
              type="tel" // Use type "tel" for numerical input suitable for phone numbers
              placeholder="e.g. 91"
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            />
            {errors.countryCode && (
              <p className="text-red-500 text-sm">{errors.countryCode.message}</p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="flex flex-col gap-1.5 flex-1"> {/* This takes up the remaining space */}
            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-900 dark:text-gray-200"
            >
              Phone Number
            </label>
            <input
              id="phone"
              {...register("phone")}
              type="tel" // Use type "tel" for numerical input suitable for phone numbers
              placeholder="e.g. 1234567890"
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
        </div>
        {/* --- End of combined row --- */}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="message"
            className="text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            Message (optional)
          </label>
          <textarea
            id="message"
            {...register("message")}
            placeholder="Hello from AgentSync!"
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="duration"
            className="text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            Expiry Duration (e.g. 10m, 2h or permanent)
          </label>
          <input
            id="duration"
            {...register("duration")}
            placeholder="permanent / 10m / 2h"
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm">{errors.duration.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="customDomain"
            className="text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            Custom Domain (optional)
          </label>
          <input
            id="customDomain"
            {...register("customDomain")}
            placeholder="e.g. links.mysite.com"
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          {errors.customDomain && (
            <p className="text-red-500 text-sm">
              {errors.customDomain.message}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create WhatsApp Link"}
        </button>
      </div>

      {shortUrl && (
        <div className="mt-4 p-4 rounded-md space-y-2 bg-gray-50 dark:bg-gray-800">
          <p className="font-medium text-gray-900 dark:text-gray-200">
            Link Created:
          </p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline break-all"
          >
            {shortUrl}
          </a>

          <div>
            <p className="mt-2 font-medium text-gray-900 dark:text-gray-200">
              QR Code:
            </p>
            {isLoadingQr || !uploadedData?.base64DataUrl ? (
              <div className="w-40 h-40 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Loading...
                </span>
              </div>
            ) : (
              <img
                src={uploadedData.base64DataUrl}
                alt="WhatsApp QR Code"
                className="w-40 h-40 border rounded bg-white dark:bg-gray-900"
              />
            )}
          </div>

          {/* Buttons for copy and download */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Copy Link
            </button>

            <button
              onClick={downloadQrCode}
              variant="outline"
              disabled={isLoadingQr || !uploadedData?.base64DataUrl}
              className={`flex-1 py-2 rounded-md ${
                isLoadingQr || !uploadedData?.base64DataUrl
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateWhatsappLinkForm;