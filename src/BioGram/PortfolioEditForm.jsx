import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../context/AuthContext";

const Loader = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4.75V6.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.1266 6.87347L16.0659 7.93413"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.25 12L17.75 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.1266 17.1265L16.0659 16.0659"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 17.75V19.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.93413 16.0659L6.87347 17.1266"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.25 12L4.75 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.93413 7.93413L6.87347 6.87347"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PortfolioEditForm = () => {
  const { getAccessToken, currentUser } = useAuth();
  const navigate = useNavigate();
  const { portfolioId } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    profileImg: "",
    phoneNumber: "",
    email: "",
    city: "",
    country: "",
    description: "",
    domain: "",
    profession: "",
    socialMediaLinks: [],
    achievements: [],
    certificates: [],
    projects: [], // Array to hold project objects
    education: [],
    languages: [],
    resume: "",
    professionSpecificFields: {},
    customFields: {},
    experience: [],
    template: "default",
  });

  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  // Separate uploading states
  const [uploadingProfileImg, setUploadingProfileImg] = useState(false);
  const [uploadingProjectImg, setUploadingProjectImg] = useState(false); // Used for both new and existing projects
  const [uploadingCertificates, setUploadingCertificates] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [newSocialMediaLinkType, setNewSocialMediaLinkType] = useState("");
  const [newSocialMediaLinkUrl, setNewSocialMediaLinkUrl] = useState("");

  const [newAchievementTitle, setNewAchievementTitle] = useState("");
  const [newAchievementDescription, setNewAchievementDescription] =
    useState("");

  // State for a project currently being added (before it's pushed to formData.projects)
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    url: "",
    imageUrl: "",
  });

  const [newEducation, setNewEducation] = useState({
    degree: "",
    institution: "",
    year: "",
  });

  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "", // Optional, can be empty string for "present"
    description: "", // Optional
  });
  const [newLanguage, setNewLanguage] = useState("");

  const [customFieldName, setCustomFieldName] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");

  // Effect to load portfolio data for editing
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!currentUser) {
        setLoadingPortfolio(false);
        toast.error("You must be logged in to edit a portfolio.");
        navigate("/login");
        return;
      }

      if (!portfolioId) {
        setLoadingPortfolio(false);
        setHasPortfolio(false);
        toast.info(
          "No portfolio ID provided. Starting a new portfolio creation."
        );
        return;
      }

      setLoadingPortfolio(true);
      try {
        const token = await getAccessToken();
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/portfolio/${portfolioId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data.data;

        const loadedFormData = {
          name: data.name || "",
          age: data.age || "",
          profileImg: data.profileImg || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          city: data.city || "",
          country: data.country || "",
          description: data.description || "",
          domain: data.domain || "",
          profession: data.profession || "",
          socialMediaLinks: data.socialMediaLinks || [],
          achievements: data.achievements || [],
          certificates: data.certificates || [],
          projects: data.projects || [], // Ensure projects are loaded
          education: data.education || [],
          languages: data.languages || [],
          resume: data.resume || "",
          professionSpecificFields: {},
          customFields: {},
          experience: data.experience || [],
          template: data.template || "default",
        };

        if (data.profession === "Other/Custom") {
          loadedFormData.customFields = data.customFields || {};
        } else {
          loadedFormData.professionSpecificFields = data.customFields || {};
        }

        setFormData(loadedFormData);
        setHasPortfolio(true);
      } catch (err) {
        console.error("Error fetching portfolio:", err);
        if (err.response && err.response.status === 404) {
          setHasPortfolio(false);
          toast.info(
            "No portfolio found for your account. Please create one first."
          );
          navigate("/create-portfolio");
        } else if (err.response && err.response.status === 401) {
          toast.error("Unauthorized. Please log in.");
          navigate("/login");
        } else {
          toast.error(
            "Failed to load portfolio: " +
              (err.response?.data?.message || err.message)
          );
        }
      } finally {
        setLoadingPortfolio(false);
      }
    };

    fetchPortfolio();
  }, [currentUser, getAccessToken, navigate, portfolioId]);

  const handleChange = (e, key, charLimit = 0) => {
    let value = e.target.value;
    if (charLimit > 0 && value.length > charLimit) {
      value = value.substring(0, charLimit);
      toast.info(`Character limit for this field is ${charLimit}.`);
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfessionSpecificFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      professionSpecificFields: {
        ...prev.professionSpecificFields,
        [field]: value,
      },
    }));
  };

  const handleProfessionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      profession: value,
      professionSpecificFields: {},
      customFields: {},
    }));
    setCustomFieldName("");
    setCustomFieldValue("");
  };

  const handleAddCustomField = () => {
    if (customFieldName.trim() !== "" && customFieldValue.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldName.trim()]: customFieldValue.trim(),
        },
      }));
      setCustomFieldName("");
      setCustomFieldValue("");
      toast.success("Custom field added!");
    } else {
      toast.error("Please enter both custom field name and value.");
    }
  };

  const handleRemoveCustomField = (keyToRemove) => {
    setFormData((prev) => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[keyToRemove];
      return { ...prev, customFields: newCustomFields };
    });
    toast.success(`Custom field "${keyToRemove}" removed.`);
  };

  const handleNewExperienceChange = (e) => {
    const { name, value } = e.target;
    setNewExperience((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExperience = () => {
    if (
      newExperience.title.trim() !== "" &&
      newExperience.company.trim() !== "" &&
      newExperience.startDate.trim() !== ""
    ) {
      setFormData((prev) => ({
        ...prev,
        experience: [...prev.experience, newExperience],
      }));
      setNewExperience({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      }); // Reset for next new entry
      toast.success("Experience added!");
    } else {
      toast.error(
        "Please fill in job title, company, and start date for experience."
      );
    }
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
    toast.success("Experience removed.");
  };

  const handleAddSocialMediaLink = () => {
    if (
      newSocialMediaLinkType.trim() !== "" &&
      newSocialMediaLinkUrl.trim() !== ""
    ) {
      setFormData((prev) => ({
        ...prev,
        socialMediaLinks: [
          ...prev.socialMediaLinks,
          {
            type: newSocialMediaLinkType.trim(),
            url: newSocialMediaLinkUrl.trim(),
          },
        ],
      }));
      setNewSocialMediaLinkType("");
      setNewSocialMediaLinkUrl("");
      toast.success("Social media link added!");
    } else {
      toast.error("Please enter both social media type and URL.");
    }
  };

  const handleRemoveSocialMediaLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks: prev.socialMediaLinks.filter((_, i) => i !== index),
    }));
    toast.success("Social media link removed.");
  };

  const handleAddAchievement = () => {
    if (
      newAchievementTitle.trim() !== "" &&
      newAchievementDescription.trim() !== ""
    ) {
      setFormData((prev) => ({
        ...prev,
        achievements: [
          ...prev.achievements,
          {
            title: newAchievementTitle.trim(),
            description: newAchievementDescription.trim(),
          },
        ],
      }));
      setNewAchievementTitle("");
      setNewAchievementDescription("");
      toast.success("Achievement added!");
    } else {
      toast.error("Please enter both achievement title and description.");
    }
  };

  const handleRemoveAchievement = (index) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
    toast.success("Achievement removed.");
  };

  // --- Project Management Functions ---

  // Handles changes to the new project being typed in
  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  // Handles image upload for the NEW project (updates newProject.imageUrl)
  const handleNewProjectImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProjectImg(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUDNAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUDNAME
        }/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );
      const result = await res.json();
      if (result.secure_url) {
        setNewProject((prev) => ({ ...prev, imageUrl: result.secure_url }));
        toast.success("New project image uploaded successfully!");
      } else {
        toast.error("Failed to upload new project image.");
      }
    } catch (error) {
      console.error("Error uploading new project image:", error);
      toast.error("Error uploading new project image.");
    } finally {
      setUploadingProjectImg(false);
    }
  };

  // Handles removing image from the NEW project
  const handleRemoveNewProjectImage = () => {
    setNewProject((prev) => ({ ...prev, imageUrl: "" }));
    toast.info("New project image removed.");
  };

  // Handles image upload for an EXISTING project (updates formData.projects[index].imageUrl)
  const handleProjectImageUpload = async (e, projectIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProjectImg(true); // Re-using this state for both new and existing
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUDNAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUDNAME
        }/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );
      const result = await res.json();
      if (result.secure_url) {
        setFormData((prev) => ({
          ...prev,
          projects: prev.projects.map((proj, idx) =>
            idx === projectIndex
              ? { ...proj, imageUrl: result.secure_url }
              : proj
          ),
        }));
        toast.success("Project image updated successfully!");
      } else {
        toast.error("Failed to upload project image.");
      }
    } catch (error) {
      console.error("Error uploading project image:", error);
      toast.error("Error uploading project image.");
    } finally {
      setUploadingProjectImg(false);
    }
  };

  // Handles removing image from an EXISTING project
  const handleRemoveProjectImage = (projectIndex) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj, idx) =>
        idx === projectIndex ? { ...proj, imageUrl: "" } : proj
      ),
    }));
    toast.info("Project image removed.");
  };

  // Adds the newProject to the formData.projects array
  const handleAddProject = () => {
    if (newProject.title.trim() === "") {
      toast.error("Project title is required.");
      return; // Prevent adding if title is empty
    }
    // Image URL is not mandatory at the point of adding, but can be uploaded later
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
    setNewProject({ title: "", description: "", url: "", imageUrl: "" }); // Reset for next new project
    toast.success("Project added!");
  };

  // Removes an existing project by index
  const handleRemoveProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
    toast.success("Project removed.");
  };

  // --- End Project Management Functions ---

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProfileImg(true); // Set specific uploading state
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUDNAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUDNAME
        }/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );
      const result = await res.json();
      if (result.secure_url) {
        setFormData((prev) => ({ ...prev, profileImg: result.secure_url }));
        toast.success("Profile image uploaded successfully!");
      } else {
        toast.error("Failed to upload profile image.");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Error uploading profile image.");
    } finally {
      setUploadingProfileImg(false); // Reset specific uploading state
    }
  };

  const handleRemoveProfileImage = () => {
    setFormData((prev) => ({ ...prev, profileImg: "" }));
    toast.info("Profile image removed.");
  };

  const handleCertificateUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadingCertificates(true); // Set specific uploading state

    const newCertificates = [];

    for (const file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);
      data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUDNAME);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUDNAME
          }/auto/upload`,
          {
            method: "POST",
            body: data,
          }
        );

        const result = await res.json();
        if (result.secure_url) {
          newCertificates.push({
            title: file.name,
            url: result.secure_url,
            date: new Date().toISOString().slice(0, 10),
          });
        }
      } catch (error) {
        console.error("Error uploading certificate:", error);
        toast.error(`Failed to upload certificate: ${file.name}`);
      }
    }

    setFormData((prev) => ({
      ...prev,
      certificates: [...prev.certificates, ...newCertificates],
    }));

    setUploadingCertificates(false); // Reset specific uploading state
    if (newCertificates.length > 0) {
      toast.success(`${newCertificates.length} certificate(s) uploaded.`);
    }
  };

  const handleRemoveCertificate = (index) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
    toast.success("Certificate removed.");
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true); // Set specific uploading state
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUDNAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUDNAME
        }/raw/upload`,
        {
          // 'raw' for documents
          method: "POST",
          body: data,
        }
      );
      const result = await res.json();
      if (result.secure_url) {
        setFormData((prev) => ({ ...prev, resume: result.secure_url }));
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error("Failed to upload resume.");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Error uploading resume.");
    } finally {
      setUploadingResume(false); // Reset specific uploading state
    }
  };

  const handleRemoveResume = () => {
    setFormData((prev) => ({ ...prev, resume: "" }));
    toast.info("Resume removed.");
  };

  // Education handlers
  const handleAddEducation = () => {
    if (
      newEducation.degree.trim() &&
      newEducation.institution.trim() &&
      newEducation.year.trim()
    ) {
      setFormData((prev) => ({
        ...prev,
        education: [...prev.education, newEducation],
      }));
      setNewEducation({ degree: "", institution: "", year: "" });
      toast.success("Education entry added!");
    } else {
      toast.error("Please fill all education fields.");
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
    toast.success("Education entry removed.");
  };

  // Language handlers
  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
      toast.success("Language added!");
    } else {
      toast.error("Please enter a language.");
    }
  };

  const handleRemoveLanguage = (index) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
    toast.success("Language removed.");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const dataToSend = { ...formData };

      // Logic to handle custom fields based on profession selection
      if (dataToSend.profession !== "Other/Custom") {
        // If a specific profession is selected, professionSpecificFields should be saved as customFields
        dataToSend.customFields = { ...dataToSend.professionSpecificFields };
      }
      // Always delete professionSpecificFields as it's a transient UI state
      delete dataToSend.professionSpecificFields;

      // Remove imageGallery field if it exists (already done in previous version)
      if (dataToSend.imageGallery) {
        delete dataToSend.imageGallery;
      }

      const token = await getAccessToken();
      const apiUrl = portfolioId
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/bio-gram/portfolio/${portfolioId}`
        : `${import.meta.env.VITE_BACKEND_URL}/portfolio/create`;

      const httpMethod = portfolioId ? "PUT" : "POST";

      const res = await axios({
        method: httpMethod,
        url: apiUrl,
        data: dataToSend,
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        `Portfolio ${portfolioId ? "updated" : "created"} successfully!`
      );

      if (!portfolioId && res.data.id) {
        // If a new portfolio was created, navigate to its edit URL
        navigate(`/edit-portfolio/${res.data.id}`);
      }
    } catch (err) {
      console.error(
        "Error creating/updating portfolio:",
        err.response?.data || err.message
      );
      toast.error(
        `Error creating/updating portfolio: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPortfolio) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <Loader className="h-10 w-10 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">
          Loading your portfolio...
        </p>
      </div>
    );
  }

  if (!hasPortfolio && portfolioId) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <p className="text-lg text-red-500 dark:text-red-400">
          No portfolio found to edit. Please create one.
        </p>
        <Button onClick={() => navigate("/create-portfolio")} className="ml-4">
          Create Portfolio
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl lg:max-w-6xl mx-auto dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl  mb-8 text-center text-black dark:text-white">
        {portfolioId ? "Edit Your Portfolio" : "Create Your Portfolio"}
      </h1>
      {/* Personal Information Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Personal Information
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Update your basic personal details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange(e, "name")}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange(e, "age")}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange(e, "phoneNumber")}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange(e, "email")}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange(e, "city")}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange(e, "country")}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="description">
              Description (Max 500 characters)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange(e, "description", 500)}
              rows={4}
              maxLength={500}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formData.description.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* Profile Image Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Profile Image
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Upload or update your profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {formData.profileImg && (
            <div className="mb-4 text-center">
              <Avatar className="h-32 w-32 border-4 border-blue-300 dark:border-blue-600 shadow-md">
                <AvatarImage src={formData.profileImg} alt="Profile" />
                <AvatarFallback>
                  {formData.name ? formData.name.charAt(0) : "P"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="destructive"
                onClick={handleRemoveProfileImage}
                className="mt-4"
              >
                Remove Image
              </Button>
            </div>
          )}
          <div className="w-full space-y-2">
            <Label htmlFor="profileImageUpload">Upload New Profile Image</Label>
            <Input
              id="profileImageUpload"
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              disabled={uploadingProfileImg}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 file:dark:bg-gray-600 file:dark:text-gray-50"
            />
            {uploadingProfileImg && (
              <div className="flex items-center text-blue-500 dark:text-blue-400 mt-2">
                <Loader className="h-5 w-5 animate-spin mr-2" /> Uploading
                profile image...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* Profession and Domain Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Profession & Domain
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Define your professional area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => handleChange(e, "domain")}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profession">Profession</Label>
            <Select
              onValueChange={handleProfessionChange}
              value={formData.profession}
            >
              <SelectTrigger
                id="profession"
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              >
                <SelectValue placeholder="Select Profession" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                <SelectItem value="Engineer">Engineer</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Other/Custom">Other/Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profession-Specific Fields (Conditionally Rendered) */}
          {formData.profession === "Engineer" && (
            <Card className="mt-6 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">
                  Engineer Specific Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={
                      formData.professionSpecificFields.specialization || ""
                    }
                    onChange={(e) =>
                      handleProfessionSpecificFieldChange(
                        "specialization",
                        e.target.value
                      )
                    }
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    value={
                      formData.professionSpecificFields.yearsExperience || ""
                    }
                    onChange={(e) =>
                      handleProfessionSpecificFieldChange(
                        "yearsExperience",
                        e.target.value
                      )
                    }
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyProjects">Key Projects</Label>
                  <Input
                    id="keyProjects"
                    value={formData.professionSpecificFields.keyProjects || ""}
                    onChange={(e) =>
                      handleProfessionSpecificFieldChange(
                        "keyProjects",
                        e.target.value
                      )
                    }
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    value={formData.professionSpecificFields.skills || ""}
                    onChange={(e) =>
                      handleProfessionSpecificFieldChange(
                        "skills",
                        e.target.value
                      )
                    }
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Designer Specific Fields (New Section) */}
          {formData.profession === "Designer" && (
            <Card className="mt-6 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950">
              {" "}
              {/* You can choose a different color if you like, e.g., border-green-300, bg-green-50 */}
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">
                  Designer Specific Fields
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Additional details for your design portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="designerPortfolioLink">Portfolio Link</Label>
                  <Input
                    id="designerPortfolioLink"
                    value={
                      formData.professionSpecificFields.portfolioLink || ""
                    }
                    onChange={(e) =>
                      handleProfessionSpecificFieldChange(
                        "portfolioLink",
                        e.target.value
                      )
                    }
                    placeholder="Link to your online portfolio (e.g., Behance, Dribbble)"
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designerSoftwareUsed">
                    Software Proficiency
                  </Label>
                  <Input
                    id="designerSoftwareUsed"
                    value={formData.professionSpecificFields.softwareUsed || ""}
                    onChange={(e) =>
                      handleProfessionSpecificFieldChange(
                        "softwareUsed",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Figma, Adobe Photoshop, Illustrator, Sketch"
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designerDesignPhilosophy">
                    Design Philosophy
                  </Label>
                  <Textarea
                    id="designerDesignPhilosophy"
                    value={
                      formData.professionSpecificFields.designPhilosophy || ""
                    }
                    onChange={(e) =>
                      handleProfessionSpecificFieldChange(
                        "designPhilosophy",
                        e.target.value
                      )
                    }
                    placeholder="Briefly describe your approach to design or your design principles."
                    rows={3}
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designerAwards">
                    Design Awards/Recognition
                  </Label>
                  <Textarea
                    id="designerAwards"
                    value={formData.professionSpecificFields.awards || ""}
                    onChange={(e) =>
                      handleProfessionSpecificFieldChange(
                        "awards",
                        e.target.value
                      )
                    }
                    placeholder="List any design awards or notable recognitions received."
                    rows={3}
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>
          )}
          {/* Custom Fields (for "Other/Custom" profession) */}
          {formData.profession === "Other/Custom" && (
            <Card className="mt-6 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950">
              <CardHeader>
                <CardTitle className="text-purple-800 dark:text-purple-200">
                  Custom Fields
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Add any additional fields relevant to your profession.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="Field Name (e.g., 'Favorite Medium')"
                    value={customFieldName}
                    onChange={(e) => setCustomFieldName(e.target.value)}
                    className="w-1/2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                  <Input
                    placeholder="Field Value"
                    value={customFieldValue}
                    onChange={(e) => setCustomFieldValue(e.target.value)}
                    className="w-1/2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                  <Button
                    onClick={handleAddCustomField}
                    className="flex-shrink-0"
                  >
                    Add Custom Field
                  </Button>
                </div>
                {Object.keys(formData.customFields).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                      Your Custom Fields:
                    </h4>
                    {Object.entries(formData.customFields).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md"
                        >
                          <p className="text-sm font-medium">
                            {key}:{" "}
                            <span className="font-normal text-gray-600 dark:text-gray-400">
                              {value}
                            </span>
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomField(key)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* Social Media Links Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Social Media Links
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Add links to your social profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Type (e.g., LinkedIn, GitHub)"
              value={newSocialMediaLinkType}
              onChange={(e) => setNewSocialMediaLinkType(e.target.value)}
              className="w-1/3 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <Input
              placeholder="URL"
              value={newSocialMediaLinkUrl}
              onChange={(e) => setNewSocialMediaLinkUrl(e.target.value)}
              className="w-2/3 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <Button
              onClick={handleAddSocialMediaLink}
              className="flex-shrink-0"
            >
              Add Link
            </Button>
          </div>
          {formData.socialMediaLinks.length > 0 && (
            <div className="space-y-2">
              {formData.socialMediaLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md"
                >
                  <p className="text-sm font-medium">
                    {link.type}:{" "}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {link.url}
                    </a>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSocialMediaLink(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* You'll place this within your component's return statement, inside your main form */}
      <hr className="my-6" /> {/* Optional separator */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Experience
        </h2>

        {/* Display Existing Experience Entries */}
        {formData.experience.length > 0 && (
          <div className="grid gap-3">
            {formData.experience.map((exp, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {exp.title} at {exp.company}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {exp.description}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveExperience(index)}
                  className="ml-4 flex-shrink-0"
                >
                  <span className="sr-only">Remove Experience</span>
                  {/* Replace with your icon component if using, e.g., <Trash2 className="h-4 w-4" /> */}
                  &times;
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input Fields for New Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="title"
            placeholder="Job Title (e.g., Software Developer)"
            value={newExperience.title}
            onChange={handleNewExperienceChange}
          />
          <Input
            name="company"
            placeholder="Company Name (e.g., Google)"
            value={newExperience.company}
            onChange={handleNewExperienceChange}
          />
          <Label htmlFor="exp-start-date" className="sr-only">
            Start Date
          </Label>
          <Input
            id="exp-start-date"
            type="date"
            name="startDate"
            placeholder="Start Date"
            value={newExperience.startDate}
            onChange={handleNewExperienceChange}
          />
          <Label htmlFor="exp-end-date" className="sr-only">
            End Date
          </Label>
          <Input
            id="exp-end-date"
            type="date"
            name="endDate"
            placeholder="End Date (Optional)"
            value={newExperience.endDate}
            onChange={handleNewExperienceChange}
          />
          <div className="md:col-span-2">
            <Textarea
              name="description"
              placeholder="Description of responsibilities and achievements (optional)"
              value={newExperience.description}
              onChange={handleNewExperienceChange}
            />
          </div>
        </div>
        <Button type="button" onClick={handleAddExperience} className="mt-2">
          Add Experience
        </Button>
      </div>
      {/* Achievements Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Achievements
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Highlight your notable accomplishments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Input
              placeholder="Achievement Title"
              value={newAchievementTitle}
              onChange={(e) => setNewAchievementTitle(e.target.value)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <Textarea
              placeholder="Description"
              value={newAchievementDescription}
              onChange={(e) => setNewAchievementDescription(e.target.value)}
              rows={2}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <Button onClick={handleAddAchievement}>Add Achievement</Button>
          </div>
          {formData.achievements.length > 0 && (
            <div className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md"
                >
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAchievement(index)}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* Projects Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Projects
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Showcase your notable projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Section for Adding a New Project */}
          <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">
              Add New Project
            </h3>

            {/* Project Title */}
            <div className="mb-4">
              <Label
                htmlFor="newProjectTitle"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="newProjectTitle"
                name="title" // important for handleNewProjectChange
                value={newProject.title}
                onChange={handleNewProjectChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="e.g., My Awesome Portfolio Website"
                required
              />
            </div>

            {/* Project Description */}
            <div className="mb-4">
              <Label
                htmlFor="newProjectDescription"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </Label>
              <Textarea
                id="newProjectDescription"
                name="description"
                value={newProject.description}
                onChange={handleNewProjectChange}
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="A brief description of the project."
              ></Textarea>
            </div>

            {/* Project URL */}
            <div className="mb-4">
              <Label
                htmlFor="newProjectUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                URL (Optional)
              </Label>
              <Input
                type="url"
                id="newProjectUrl"
                name="url"
                value={newProject.url}
                onChange={handleNewProjectChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="https://www.myproject.com"
              />
            </div>

            {/* New Project Image Upload */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Image (for new project)
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleNewProjectImageUpload} // <--- Use the new handler here!
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:dark:bg-gray-600 file:dark:text-gray-50"
                disabled={uploadingProjectImg}
              />
              {newProject.imageUrl && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={newProject.imageUrl}
                    alt="New Project Preview"
                    className="h-24 w-24 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                  />
                  <Button
                    type="button"
                    onClick={handleRemoveNewProjectImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs h-6 w-6 flex items-center justify-center hover:bg-red-600"
                    size="icon"
                  >
                    &times;
                  </Button>
                </div>
              )}
              {uploadingProjectImg && (
                <div className="flex items-center text-blue-500 dark:text-blue-400 mt-2">
                  <Loader className="h-5 w-5 animate-spin mr-2" /> Uploading
                  image...
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={handleAddProject}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={submitting || uploadingProjectImg} // Disable if overall submitting or image is uploading
            >
              Add Project
            </Button>
          </div>

          <Separator className="my-8 bg-gray-200 dark:bg-gray-700" />

          {/* Display Existing Projects for Editing */}
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Your Existing Projects
          </h3>
          {formData.projects.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No projects added yet. Add one using the section above.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.projects.map((project, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800  shadow-sm"
                >
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`project-title-${index}`}>Title</Label>
                        <Input
                          id={`project-title-${index}`}
                          type="text"
                          value={project.title}
                          onChange={(e) => {
                            const updatedProjects = [...formData.projects];
                            updatedProjects[index].title = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              projects: updatedProjects,
                            }));
                          }}
                          className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`project-description-${index}`}>
                          Description
                        </Label>
                        <Textarea
                          id={`project-description-${index}`}
                          value={project.description}
                          onChange={(e) => {
                            const updatedProjects = [...formData.projects];
                            updatedProjects[index].description = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              projects: updatedProjects,
                            }));
                          }}
                          rows={2}
                          className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`project-url-${index}`}>URL</Label>
                        <Input
                          id={`project-url-${index}`}
                          type="url"
                          value={project.url}
                          onChange={(e) => {
                            const updatedProjects = [...formData.projects];
                            updatedProjects[index].url = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              projects: updatedProjects,
                            }));
                          }}
                          className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`project-image-upload-${index}`}>
                          Project Image
                        </Label>
                        <Input
                          id={`project-image-upload-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProjectImageUpload(e, index)}
                          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:dark:bg-gray-600 file:dark:text-gray-50"
                          disabled={uploadingProjectImg}
                        />
                        {project.imageUrl && (
                          <div className="mt-2 relative inline-block">
                            <img
                              src={project.imageUrl}
                              alt="Project Preview"
                              className="h-24 w-24 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                            />
                            <Button
                              type="button"
                              onClick={() => handleRemoveProjectImage(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs h-6 w-6 flex items-center justify-center hover:bg-red-600"
                              size="icon"
                            >
                              &times;
                            </Button>
                          </div>
                        )}
                        {uploadingProjectImg && (
                          <div className="flex items-center text-blue-500 dark:text-blue-400 mt-2">
                            <Loader className="h-5 w-5 animate-spin mr-2" />{" "}
                            Uploading image...
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveProject(index)}
                      >
                        Remove Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* Certificates Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Certificates
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Upload your professional certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Label htmlFor="certificateUpload">
              Upload Certificates (PDF, Image)
            </Label>
            <Input
              id="certificateUpload"
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={handleCertificateUpload}
              disabled={uploadingCertificates}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 file:dark:bg-gray-600 file:dark:text-gray-50"
            />
            {uploadingCertificates && (
              <div className="flex items-center text-blue-500 dark:text-blue-400 mt-2">
                <Loader className="h-5 w-5 animate-spin mr-2" /> Uploading
                certificates...
              </div>
            )}
          </div>
          {formData.certificates.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                Uploaded Certificates:
              </h4>
              {formData.certificates.map((cert, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md"
                >
                  <p className="text-sm font-medium">
                    {cert.title} (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View
                    </a>
                    )
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCertificate(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* Education Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Education
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Add your academic qualifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Input
              placeholder="Degree/Program (e.g., Bachelor of Science)"
              value={newEducation.degree}
              onChange={(e) =>
                setNewEducation((prev) => ({ ...prev, degree: e.target.value }))
              }
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <Input
              placeholder="Institution (e.g., University of California)"
              value={newEducation.institution}
              onChange={(e) =>
                setNewEducation((prev) => ({
                  ...prev,
                  institution: e.target.value,
                }))
              }
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <Input
              placeholder="Year (e.g., 2020)"
              value={newEducation.year}
              onChange={(e) =>
                setNewEducation((prev) => ({ ...prev, year: e.target.value }))
              }
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <Button onClick={handleAddEducation}>Add Education</Button>
          </div>
          {formData.education.length > 0 && (
            <div className="space-y-2">
              {formData.education.map((edu, index) => (
                <div
                  key={index}
                  className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md"
                >
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    {edu.degree}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {edu.institution}, {edu.year}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEducation(index)}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* Languages Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Languages
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            List the languages you speak.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Language (e.g., English, Hindi)"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="flex-grow dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <Button onClick={handleAddLanguage}>Add Language</Button>
          </div>
          {formData.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages.map((lang, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200"
                >
                  {lang}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLanguage(index)}
                    className="h-5 w-5 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </Button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Separator className="my-8 bg-gray-300 dark:bg-gray-700" />
      {/* Resume Upload Card */}
      <Card className="mb-6 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">
            Resume
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Upload your resume (PDF).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.resume && (
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Current Resume:{" "}
                <a
                  href={formData.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  View Resume
                </a>
              </p>
              <Button
                variant="destructive"
                onClick={handleRemoveResume}
                className="mt-2"
              >
                Remove Resume
              </Button>
            </div>
          )}
          <div className="w-full space-y-2">
            <Label htmlFor="resumeUpload">Upload New Resume</Label>
            <Input
              id="resumeUpload"
              type="file"
              accept="application/pdf"
              onChange={handleResumeUpload}
              disabled={uploadingResume}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 file:dark:bg-gray-600 file:dark:text-gray-50"
            />
            {uploadingResume && (
              <div className="flex items-center text-blue-500 dark:text-blue-400 mt-2">
                <Loader className="h-5 w-5 animate-spin mr-2" /> Uploading
                resume...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Template Selection
        </h2>
        <div>
          <Label
            htmlFor="template-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Choose a Portfolio Template
          </Label>
          <Select
            value={formData.template}
            onValueChange={(value) => {
              setFormData((prevFormData) => ({
                ...prevFormData,
                template: value,
              }));
            }}
          >
            <SelectTrigger id="template-select" className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="frosted-glass">Frosted Glass</SelectItem>
              <SelectItem value="color-burst">Color Burst</SelectItem>
              <SelectItem value="pastel">Pastel</SelectItem>
              <SelectItem value="gamer">Gamer</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a visual template for your bio-gram portfolio.
          </p>
        </div>
      </div>
      <div className="mt-8 text-end">
        <Button
          onClick={handleSubmit}
          className="w-full md:w-auto px-8 py-3  dark:bg-white dark:hover:bg-gray-200  dark:text-black rounded-lg shadow-xl"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader className="h-6 w-6 animate-spin mr-2" /> Saving...
            </>
          ) : portfolioId ? (
            "Update Portfolio"
          ) : (
            "Create Portfolio"
          )}
        </Button>
      </div>
    </div>
  );
};

export default PortfolioEditForm;
