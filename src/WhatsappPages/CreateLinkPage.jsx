import React, { useState } from "react";
import CreateWhatsappLinkForm from "../components/AppComponents/CreateWhatsappLinkForm";
import WhatsAppSimulator from "../components/AppComponents/WhatsAppSimulator";

const CreateLinkPage = () => {
  const [formData, setFormData] = useState({});

  const handleFormChange = (data) => {
    setFormData(data);
  };

  return (
    <div className="w-full max-w-full flex flex-col lg:flex-row gap-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex justify-center px-4">
        <div className="w-full max-w-xl">
          <CreateWhatsappLinkForm onFormChange={handleFormChange} />
        </div>
      </div>

      {/* Right side: Simulator */}
      <div className="w-full lg:w-1/2 flex justify-center px-4">
        <div className="w-full max-w-[360px] h-[640px] border border-gray-300 dark:border-gray-700 rounded-xl shadow-md overflow-hidden bg-white dark:bg-gray-800">
          <WhatsAppSimulator formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default CreateLinkPage;
