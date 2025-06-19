import { useAuth } from "../context/AuthContext";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import axios from "axios";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PortfolioForm = () => {
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
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
    projects: [],
    languages: [],
    education: [],
    resume: "",
    customFields: {},
    experience: [],
    template: "",
  });

  const [uploadingProfileImg, setUploadingProfileImg] = useState(false);
  const [uploadingProjectImg, setUploadingProjectImg] = useState(false);
  const [uploadingCertificates, setUploadingCertificates] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false); // New state for submission loading

  // State for new social media link
  const [newSocialMediaLinkType, setNewSocialMediaLinkType] = useState("");
  const [newSocialMediaLinkUrl, setNewSocialMediaLinkUrl] = useState("");

  // State for new achievement
  const [newAchievementTitle, setNewAchievementTitle] = useState("");
  const [newAchievementDescription, setNewAchievementDescription] =
    useState("");

  // State for new project
  // MODIFIED: Added imageUrl
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    url: "",
    imageUrl: "",
  });

  // State for custom fields (for "Other/Custom" profession)
  const [customFieldName, setCustomFieldName] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");

  // NEW: State for new language
  const [newLanguage, setNewLanguage] = useState("");

  // NEW: State for new education entry
  const [newEducation, setNewEducation] = useState({
    degree: "",
    institution: "",
    year: "",
    description: "",
  });

  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  // States for specific domain fields
  // Engineer
  const [engineerSpecialization, setEngineerSpecialization] = useState("");
  const [engineerYearsExperience, setEngineerYearsExperience] = useState("");
  const [engineerKeyProjects, setEngineerKeyProjects] = useState("");
  const [engineerSkills, setEngineerSkills] = useState("");

  // Designer
  const [designerPortfolioLink, setDesignerPortfolioLink] = useState("");
  const [designerSoftwareUsed, setDesignerSoftwareUsed] = useState("");
  const [designerDesignPhilosophy, setDesignerDesignPhilosophy] = useState("");
  const [designerAwards, setDesignerAwards] = useState("");

  const handleChange = (e, key, charLimit = 0) => {
    let value = e.target.value;
    if (charLimit > 0 && value.length > charLimit) {
      value = value.substring(0, charLimit);
      toast.info(`Character limit for this field is ${charLimit}.`);
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfessionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      profession: value,
      customFields: {}, // Clear custom fields when profession changes
    }));
    // Also clear specific domain fields when profession changes
    setEngineerSpecialization("");
    setEngineerYearsExperience("");
    setEngineerKeyProjects("");
    setEngineerSkills("");

    // Removed Doctor-specific state clearing
    // setDoctorSpecialty("");
    // setDoctorLicenseNumber("");
    // setDoctorClinicAffiliation("");
    // setDoctorMedicalBoardCertifications("");

    setDesignerPortfolioLink("");
    setDesignerSoftwareUsed("");
    setDesignerDesignPhilosophy("");
    setDesignerAwards("");

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
    } else {
      toast.error("Please enter both custom field name and value.");
    }
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
      });
    } else {
      toast.error(
        "Please fill in title, company, and start date for experience."
      );
    }
  };

  const handleRemoveExperience = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, index) => index !== indexToRemove),
    }));
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
    } else {
      toast.error("Please enter both social media type and URL.");
    }
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
    } else {
      toast.error("Please enter both achievement title and description.");
    }
  };

  const handleAddProject = () => {
    if (newProject.title.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        projects: [...prev.projects, newProject],
      }));
      // MODIFIED: Reset imageUrl too
      setNewProject({ title: "", description: "", url: "", imageUrl: "" });
    } else {
      toast.error("Project title is required.");
    }
  };

  // NEW: Handler for adding a language
  const handleAddLanguage = () => {
    if (newLanguage.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    } else {
      toast.error("Please enter a language.");
    }
  };

  // NEW: Handler for adding an education entry
  const handleAddEducation = () => {
    if (
      newEducation.degree.trim() !== "" &&
      newEducation.institution.trim() !== "" &&
      newEducation.year.trim() !== ""
    ) {
      setFormData((prev) => ({
        ...prev,
        education: [...prev.education, newEducation],
      }));
      setNewEducation({
        degree: "",
        institution: "",
        year: "",
        description: "",
      });
    } else {
      toast.error(
        "Please fill in degree, institution, and year for education."
      );
    }
  };

  // New handler for profile image upload
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProfileImg(true);
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
      setUploadingProfileImg(false);
    }
  };

  const handleProjectImageUpload = async (e) => {
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
        setNewProject((prev) => ({ ...prev, imageUrl: result.secure_url })); // Update newProject's imageUrl
        toast.success("Project image uploaded successfully!");
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

  const handleCertificateUpload = async (e, description) => {
    const files = Array.from(e.target.files);
    setUploadingCertificates(true);

    const newCertificates = [];

    for (const file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);
      data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUDNAME);

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
    }

    setFormData((prev) => ({
      ...prev,
      certificates: [...prev.certificates, ...newCertificates],
    }));

    setUploadingCertificates(false);
  };

  // NEW: Handler for resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME); // Assuming same Cloudinary preset for docs
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUDNAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUDNAME
        }/raw/upload`,
        {
          // Use 'raw' for documents
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
      setUploadingResume(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true); // Start submission loading
    try {
      // Before submitting, update customFields based on selected profession
      const finalCustomFields = { ...formData.customFields };

      if (formData.profession === "Engineer") {
        finalCustomFields.specialization = engineerSpecialization;
        finalCustomFields.yearsExperience = engineerYearsExperience;
        finalCustomFields.keyProjects = engineerKeyProjects;
        finalCustomFields.skills = engineerSkills;
      } else if (formData.profession === "Designer") {
        finalCustomFields.portfolioLink = designerPortfolioLink;
        finalCustomFields.softwareUsed = designerSoftwareUsed;
        finalCustomFields.designPhilosophy = designerDesignPhilosophy;
        finalCustomFields.awards = designerAwards;
      }

      const token = await getAccessToken();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/bio-gram/create-portfolio`,
        {
          ...formData,
          customFields: finalCustomFields,

          languages: formData.languages,
          education: formData.education,
          experience: formData.experience,
          resumeUrl: formData.resume,
          template: formData.template,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Portfolio created successfully with ID: ${res.data.id}`);
      const url = res.data.url;
      navigate("/bio-gram/link-generator", { state: { url } });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setSubmitting(false); 
    }
  };

  return (
    <div className="max-w-2xl lg:max-w-6xl mx-auto space-y-8 p-6 shadow-none rounded-lg my-8">
      <h2 className="text-3xl text-center text-gray-800 mb-6 dark:text-white">
        Create Your Professional Portfolio
      </h2>
      <p className="text-center text-gray-600 mb-8 dark:text-white">
        Showcase your skills, experience, and achievements to the world!
      </p>

      
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white">
          Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-gray-700 dark:text-white">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Your Full Name"
              value={formData.name}
              onChange={(e) => handleChange(e, "name")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="age" className="text-gray-700 dark:text-white">
              Age
            </Label>
            <Input
              id="age"
              placeholder="Your Age"
              type="number"
              value={formData.age}
              onChange={(e) => handleChange(e, "age")}
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="phoneNumber"
              className="text-gray-700 dark:text-white"
            >
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              placeholder="e.g., +1234567890"
              value={formData.phoneNumber}
              onChange={(e) => handleChange(e, "phoneNumber")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-white">
              Email
            </Label>
            <Input
              id="email"
              placeholder="your.email@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange(e, "email")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="city" className="text-gray-700 dark:text-white">
              City
            </Label>
            <Input
              id="city"
              placeholder="Your City"
              value={formData.city}
              onChange={(e) => handleChange(e, "city")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="country" className="text-gray-700 dark:text-white">
              Country
            </Label>
            <Input
              id="country"
              placeholder="Your Country"
              value={formData.country}
              onChange={(e) => handleChange(e, "country")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="domain" className="text-gray-700 dark:text-white">
              Domain
            </Label>
            <Input
              id="domain"
              placeholder="e.g., Technology, Healthcare, Arts"
              value={formData.domain}
              onChange={(e) => handleChange(e, "domain")}
              className="mt-1"
            />
          </div>
          {/* Profession Select */}
          <div>
            <Label
              htmlFor="profession"
              className="text-gray-700 dark:text-white"
            >
              Profession
            </Label>
            <Select
              onValueChange={handleProfessionChange}
              value={formData.profession}
            >
              <SelectTrigger id="profession" className="mt-1">
                <SelectValue placeholder="Select Your Profession" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineer">Engineer</SelectItem>
                {/* Removed Doctor profession */}
                {/* <SelectItem value="Doctor">Doctor</SelectItem> */}
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Other/Custom">Other / Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label
            htmlFor="description"
            className="text-gray-700 dark:text-white"
          >
            About Me
          </Label>
          <Textarea
            id="description"
            placeholder="A brief description about yourself, your goals, and what you do."
            value={formData.description}
            onChange={(e) => handleChange(e, "description", 500)}
            rows={4}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formData.description.length}/500 characters
          </p>
        </div>
        {/* Profile Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="profileImg" className="text-gray-700 dark:text-white">
            Profile Image
          </Label>
          <Input
            id="profileImg"
            type="file"
            accept="image/*"
            onChange={handleProfileImageUpload}
            className="mt-1"
          />
          {uploadingProfileImg && formData.profileImg === "" && (
            <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
              Uploading profile image... Please wait.
            </p>
          )}
          {formData.profileImg && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Current Profile Image:
              </p>
              <img
                src={formData.profileImg}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full border border-gray-300 dark:border-gray-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Conditional Custom Fields */}
      {formData.profession && (
        <div className="space-y-4 border p-4 rounded-lg dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white dark:border-gray-700">
            Profession Specific Information
          </h3>
          {formData.profession === "Engineer" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="engineerSpecialization"
                  className="text-gray-700 dark:text-white"
                >
                  Specialization
                </Label>
                <Input
                  id="engineerSpecialization"
                  placeholder="e.g., Software Engineering, Civil Engineering"
                  value={engineerSpecialization}
                  onChange={(e) => setEngineerSpecialization(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="engineerYearsExperience"
                  className="text-gray-700 dark:text-white"
                >
                  Years of Experience
                </Label>
                <Input
                  id="engineerYearsExperience"
                  placeholder="e.g., 5"
                  type="number"
                  value={engineerYearsExperience}
                  onChange={(e) => setEngineerYearsExperience(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label
                  htmlFor="engineerKeyProjects"
                  className="text-gray-700 dark:text-white"
                >
                  Key Projects/Areas of Focus
                </Label>
                <Textarea
                  id="engineerKeyProjects"
                  placeholder="List major projects or areas of expertise (e.g., 'Led migration to cloud infrastructure, Developed scalable APIs')"
                  value={engineerKeyProjects}
                  onChange={(e) => setEngineerKeyProjects(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label
                  htmlFor="engineerSkills"
                  className="text-gray-700 dark:text-white"
                >
                  Technical Skills
                </Label>
                <Textarea
                  id="engineerSkills"
                  placeholder="List your programming languages, tools, frameworks (e.g., 'React, Node.js, Python, AWS, Docker')"
                  value={engineerSkills}
                  onChange={(e) => setEngineerSkills(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {formData.profession === "Designer" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="designerPortfolioLink"
                  className="text-gray-700 dark:text-white"
                >
                  Portfolio Link
                </Label>
                <Input
                  id="designerPortfolioLink"
                  placeholder="Link to your online portfolio (e.g., Behance, Dribbble)"
                  value={designerPortfolioLink}
                  onChange={(e) => setDesignerPortfolioLink(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="designerSoftwareUsed"
                  className="text-gray-700 dark:text-white"
                >
                  Software Proficiency
                </Label>
                <Input
                  id="designerSoftwareUsed"
                  placeholder="e.g., Figma, Adobe Photoshop, Illustrator, Sketch"
                  value={designerSoftwareUsed}
                  onChange={(e) => setDesignerSoftwareUsed(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label
                  htmlFor="designerDesignPhilosophy"
                  className="text-gray-700 dark:text-white"
                >
                  Design Philosophy
                </Label>
                <Textarea
                  id="designerDesignPhilosophy"
                  placeholder="Briefly describe your approach to design or your design principles."
                  value={designerDesignPhilosophy}
                  onChange={(e) => setDesignerDesignPhilosophy(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label
                  htmlFor="designerAwards"
                  className="text-gray-700 dark:text-white"
                >
                  Design Awards/Recognition
                </Label>
                <Textarea
                  id="designerAwards"
                  placeholder="List any design awards or notable recognitions received."
                  value={designerAwards}
                  onChange={(e) => setDesignerAwards(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {formData.profession === "Other/Custom" && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Define your own custom fields to best describe your profession.
              </p>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <Input
                  placeholder="Custom Field Name (e.g., 'Favorite Quote')"
                  value={customFieldName}
                  onChange={(e) => setCustomFieldName(e.target.value)}
                  className="flex-1 mt-1"
                />
                <Input
                  placeholder="Custom Field Value"
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  className="flex-1 mt-1"
                />
                <Button
                  onClick={handleAddCustomField}
                  className="w-full md:w-auto mt-2 md:mt-0"
                >
                  Add Custom Field
                </Button>
              </div>
              {Object.keys(formData.customFields).length > 0 && (
                <div className="border border-dashed p-3 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                  <h4 className="font-medium text-gray-700 mb-2 dark:text-white">
                    Added Custom Fields:
                  </h4>
                  <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
                    {Object.entries(formData.customFields).map(
                      ([key, value]) => (
                        <li key={key}>
                          <span className="font-semibold">{key}:</span> {value}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Social Media Links */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white dark:border-gray-700">
          Social Media & Links
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Add links to your professional and social profiles.
        </p>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-end">
          <div className="flex-grow">
            <Label
              htmlFor="socialMediaType"
              className="text-gray-700 dark:text-white"
            >
              Platform
            </Label>
            <Select
              onValueChange={setNewSocialMediaLinkType}
              value={newSocialMediaLinkType}
            >
              <SelectTrigger id="socialMediaType" className="w-full mt-1">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Twitter">Twitter</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Website">Personal Website</SelectItem>
                <SelectItem value="GitHub">GitHub</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-grow-[2]">
            <Label
              htmlFor="socialMediaUrl"
              className="text-gray-700 dark:text-white"
            >
              URL
            </Label>
            <Input
              id="socialMediaUrl"
              placeholder="Full URL (e.g., https://linkedin.com/in/yourprofile)"
              value={newSocialMediaLinkUrl}
              onChange={(e) => setNewSocialMediaLinkUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleAddSocialMediaLink}
            className="w-full md:w-auto mt-2 md:mt-0"
          >
            Add Link
          </Button>
        </div>
        {formData.socialMediaLinks.length > 0 && (
          <div className="border border-dashed p-3 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
            <h4 className="font-medium text-gray-700 mb-2 dark:text-white">
              Your Links:
            </h4>
            <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
              {formData.socialMediaLinks.map((link, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">{link.type}:</span>{" "}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* NEW: Languages */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white dark:border-gray-700">
          Languages
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          List languages you are proficient in.
        </p>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-end">
          <div className="flex-grow">
            <Label htmlFor="language" className="text-gray-700 dark:text-white">
              Language
            </Label>
            <Input
              id="language"
              placeholder="e.g., English, Spanish, Hindi"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleAddLanguage}
            className="w-full md:w-auto mt-2 md:mt-0"
          >
            Add Language
          </Button>
        </div>
        {formData.languages.length > 0 && (
          <div className="border border-dashed p-3 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
            <h4 className="font-medium text-gray-700 mb-2 dark:text-white">
              Your Languages:
            </h4>
            <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
              {formData.languages.map((lang, idx) => (
                <li key={idx}>{lang}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* NEW: Education */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white dark:border-gray-700">
          Education
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Add your academic qualifications.
        </p>
        <div className="space-y-3 p-4 rounded-lg">
          <div>
            <Label
              htmlFor="educationDegree"
              className="text-gray-700 dark:text-white"
            >
              Degree/Qualification
            </Label>
            <Input
              id="educationDegree"
              placeholder="e.g., Bachelor of Technology, MBA"
              value={newEducation.degree}
              onChange={(e) =>
                setNewEducation((prev) => ({ ...prev, degree: e.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="educationInstitution"
              className="text-gray-700 dark:text-white"
            >
              Institution Name
            </Label>
            <Input
              id="educationInstitution"
              placeholder="e.g., Indian Institute of Technology"
              value={newEducation.institution}
              onChange={(e) =>
                setNewEducation((prev) => ({
                  ...prev,
                  institution: e.target.value,
                }))
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="educationYear"
              className="text-gray-700 dark:text-white"
            >
              Year of Graduation
            </Label>
            <Input
              id="educationYear"
              placeholder="e.g., 2018"
              type="number"
              value={newEducation.year}
              onChange={(e) =>
                setNewEducation((prev) => ({ ...prev, year: e.target.value }))
              }
              className="mt-1"
            />
          </div>
          <Button onClick={handleAddEducation}>Add Education</Button>
        </div>
        {formData.education.length > 0 && (
          <div className="border border-dashed p-3 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
            <h4 className="font-medium text-gray-700 mb-2 dark:text-white">
              Your Education:
            </h4>
            <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
              {formData.education.map((edu, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">{edu.degree}</span> from{" "}
                  <span className="font-semibold">{edu.institution}</span> (
                  {edu.year}){edu.description && `: ${edu.description}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Experience</h3>
        {formData.experience.map((exp, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 border rounded-md p-2"
          >
            <div className="flex-grow">
              <p className="font-semibold">
                {exp.title} at {exp.company}
              </p>
              <p className="text-sm text-gray-600">
                {exp.startDate} - {exp.endDate || "Present"}
              </p>
              <p className="text-sm text-gray-700">{exp.description}</p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveExperience(index)}
            >
              -
            </Button>
          </div>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Job Title (e.g., Software Engineer)"
            value={newExperience.title}
            onChange={(e) =>
              setNewExperience((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <Input
            placeholder="Company Name"
            value={newExperience.company}
            onChange={(e) =>
              setNewExperience((prev) => ({ ...prev, company: e.target.value }))
            }
          />
          <Label htmlFor="experience-start-date" className="sr-only">
            Start Date
          </Label>
          <Input
            id="experience-start-date"
            type="date"
            placeholder="Start Date"
            value={newExperience.startDate}
            onChange={(e) =>
              setNewExperience((prev) => ({
                ...prev,
                startDate: e.target.value,
              }))
            }
          />
          <Label htmlFor="experience-end-date" className="sr-only">
            End Date
          </Label>
          <Input
            id="experience-end-date"
            type="date"
            placeholder="End Date (Optional)"
            value={newExperience.endDate}
            onChange={(e) =>
              setNewExperience((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
          <div className="md:col-span-2">
            <Textarea
              placeholder="Description of responsibilities and achievements (optional)"
              value={newExperience.description}
              onChange={(e) =>
                setNewExperience((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <Button type="button" onClick={handleAddExperience} className="mt-2">
          Add Experience
        </Button>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white dark:border-gray-700">
          Achievements & Awards
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Highlight your significant accomplishments and recognitions.
        </p>
        <div className="space-y-3 p-4 rounded-lg">
          <div>
            <Label
              htmlFor="achievementTitle"
              className="text-gray-700 dark:text-white"
            >
              Achievement Title
            </Label>
            <Input
              id="achievementTitle"
              placeholder="e.g., 'Awarded Top Performer', 'Published Research Paper'"
              value={newAchievementTitle}
              onChange={(e) => setNewAchievementTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="achievementDescription"
              className="text-gray-700 dark:text-white"
            >
              Description
            </Label>
            <Textarea
              id="achievementDescription"
              placeholder="Briefly describe the achievement and its impact (e.g., 'Recognized for achieving 150% of sales target in Q4, leading to a 10% revenue increase.')"
              value={newAchievementDescription}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setNewAchievementDescription(value);
                } else {
                  toast.info(
                    "Achievement description limited to 500 characters."
                  );
                }
              }}
              maxLength={500}
              rows={3}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {newAchievementDescription.length}/500 characters
            </p>
          </div>
          <Button onClick={handleAddAchievement}>Add Achievement</Button>
        </div>
        {formData.achievements.length > 0 && (
          <div className="border border-dashed p-3 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
            <h4 className="font-medium text-gray-700 mb-2 dark:text-white">
              Your Achievements:
            </h4>
            <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
              {formData.achievements.map((achievement, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">{achievement.title}:</span>{" "}
                  {achievement.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white dark:border-gray-700">
          Projects
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Showcase your work and contributions.
        </p>
        <div className="space-y-3 p-4 rounded-lg">
          <div>
            <Label
              htmlFor="projectTitle"
              className="text-gray-700 dark:text-white"
            >
              Project Title
            </Label>
            <Input
              id="projectTitle"
              placeholder="e.g., 'E-commerce Platform Redesign'"
              value={newProject.title}
              onChange={(e) =>
                setNewProject((prev) => ({ ...prev, title: e.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label
              htmlFor="projectDescription"
              className="text-gray-700 dark:text-white"
            >
              Project Description
            </Label>
            <Textarea
              id="projectDescription"
              placeholder="Describe your role, technologies used, and outcomes (e.g., 'Developed a responsive UI using React and integrated with a RESTful API, resulting in a 20% increase in user engagement.')"
              value={newProject.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setNewProject((prev) => ({ ...prev, description: value }));
                } else {
                  toast.info("Project description limited to 500 characters.");
                }
              }}
              rows={3}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {newProject.description.length}/500 characters
            </p>
          </div>
          <div>
            <Label
              htmlFor="projectUrl"
              className="text-gray-700 dark:text-white"
            >
              Project URL (Optional)
            </Label>
            <Input
              id="projectUrl"
              placeholder="Link to live demo, GitHub repo, or detailed case study"
              value={newProject.url}
              onChange={(e) =>
                setNewProject((prev) => ({ ...prev, url: e.target.value }))
              }
              className="mt-1"
            />
          </div>
          {/* NEW: Project Image Upload */}
          <div className="space-y-2">
            <Label
              htmlFor="projectImageUpload"
              className="text-gray-700 dark:text-white"
            >
              Project Image (Optional)
            </Label>
            <Input
              id="projectImageUpload"
              type="file"
              accept="image/*"
              onChange={handleProjectImageUpload}
              className="mt-1"
            />
            {uploadingProjectImg && newProject.imageUrl === "" && (
              <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
                Uploading project image... Please wait.
              </p>
            )}
            {newProject.imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Preview:
                </p>
                <img
                  src={newProject.imageUrl}
                  alt="Project Preview"
                  className="w-48 h-auto object-cover rounded-md"
                />
              </div>
            )}
          </div>
          <Button onClick={handleAddProject}>Add Project</Button>
        </div>
        {formData.projects.length > 0 && (
          <div className="border border-dashed p-3 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
            <h4 className="font-medium text-gray-700 mb-2 dark:text-white">
              Your Projects:
            </h4>
            <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
              {formData.projects.map((project, idx) => (
                <li
                  key={idx}
                  className="mb-3 flex flex-col sm:flex-row items-start sm:items-center"
                >
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-24 h-auto object-cover rounded-md mr-3 mb-2 sm:mb-0"
                    />
                  )}
                  <div>
                    <span className="font-semibold">{project.title}</span>:{" "}
                    {project.description}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        View Project
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Certificates */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white dark:border-gray-700">
          Certificates
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Upload your professional certificates and credentials.
        </p>
        <div className="space-y-2">
          <Label
            htmlFor="certificateUpload"
            className="text-gray-700 dark:text-white"
          >
            Upload Certificates
          </Label>
          <Input
            id="certificateUpload"
            type="file"
            accept=".pdf,image/*" // Allow both images and PDFs for certificates
            multiple
            onChange={handleCertificateUpload}
            className="mt-1"
          />
          {uploadingCertificates && (
            <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
              Uploading certificates... Please wait.
            </p>
          )}
          {formData.certificates.length > 0 && (
            <div className="border border-dashed p-3 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
              <h4 className="font-medium text-gray-700 mb-2 dark:text-white">
                Uploaded Certificates:
              </h4>
              <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
                {formData.certificates.map((cert, idx) => (
                  <li key={idx} className="mb-1">
                    <span className="font-semibold">{cert.title}</span>{" "}
                    (Uploaded: {cert.date}){" "}
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Certificate
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* NEW: Resume Upload */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4 dark:text-white dark:border-gray-700">
          Resume
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Upload your professional resume (PDF recommended).
        </p>
        <div className="space-y-2">
          <Label
            htmlFor="resumeUpload"
            className="text-gray-700 dark:text-white"
          >
            Upload Resume
          </Label>
          <Input
            id="resumeUpload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="mt-1"
          />
          {uploadingResume && (
            <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
              Uploading resume... Please wait.
            </p>
          )}
          {formData.resumeUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Current Resume:
              </p>
              <a
                href={formData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Uploaded Resume
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl mb-4 text-gray-800 dark:text-gray-200">
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

      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSubmit}
          className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" /> Creating
              Portfolio...
            </>
          ) : (
            "Create Portfolio"
          )}
        </Button>
      </div>
    </div>
  );
};

export default PortfolioForm;
