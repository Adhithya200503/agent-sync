import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Import your template images
import ColorBurst from "../assets/colorburst.jpg";
import Default from "../assets/default.jpg";
import FrostedGlass from "../assets/frosted-glass.jpg";
import Gamer from "../assets/gamer.jpg";
import Pastel from "../assets/pastel.jpg";
import Terminal from "../assets/terminal.jpg";
// Assuming 'Breeze' also has an image, if not, adjust or add it.
// import Breeze from "../assets/breeze.jpg";

// This TEMPLATES_CONFIG is your source of truth for template values and categories
const TEMPLATES_CONFIG = [
  { name: "DEFAULT", value: "default", category: "Minimalist" },
  { name: "FROSTED GLASS", value: "frosted-glass", category: "Modern" },
  { name: "BREEZE", value: "breeze", category: "Minimalist" },
  { name: "COLOR BURST", value: "color-burst", category: "Vibrant" },
  { name: "TERMINAL", value: "terminal", category: "Developer" },
  { name: "PASTEL", value: "pastel", category: "Aesthetic" },
  { name: "GAMER", value: "gamer", category: "Gaming" }, // Ensure 'Gamer' is consistently defined
];

// This array now includes the `image` import and the `category` for local display
const templates = [
  { name: "Color Burst", image: ColorBurst, category: "Vibrant" },
  { name: "Default", image: Default, category: "Minimalist" },
  { name: "Frosted Glass", image: FrostedGlass, category: "Modern" },
  { name: "Gamer", image: Gamer, category: "Gaming" },
  { name: "Pastel", image: Pastel, category: "Aesthetic" },
  { name: "Terminal", image: Terminal, category: "Developer" },
  // If you have a 'Breeze' image, add it here:
  // { name: "Breeze", image: Breeze, category: "Minimalist" },
];

const Template = () => {
  const navigate = useNavigate();
  // State to keep track of the currently active category filter
  const [activeCategory, setActiveCategory] = useState('All');

  // Dynamically get unique categories from the TEMPLATES_CONFIG
  // We use Set to ensure only unique categories are listed, and add 'All' manually
  const categories = ['All', ...new Set(TEMPLATES_CONFIG.map(t => t.category))];

  /**
   * Handles navigation to the create Zaplink page with the selected template value.
   * @param {string} templateName - The display name of the template clicked.
   */
  const handleNavigation = (templateName) => {
    // Find the template configuration object that matches the clicked template name
    const templateMatch = TEMPLATES_CONFIG.find(
      (t) => t.name.toLowerCase() === templateName.toLowerCase()
    );
    if (templateMatch) {
      // Navigate to the creation page, passing the template's 'value' as state
      navigate('/zap-link/create-zap-link', {
        state: { template: templateMatch.value }
      });
    } else {
      console.warn("Template value not found for:", templateName);
      // Optionally, show a toast error to the user if a template isn't found
      // toast.error(`Template "${templateName}" not found or misconfigured.`);
    }
  };

  /**
   * Filters the templates based on the activeCategory state.
   * If 'All' is selected, all templates are returned.
   * Otherwise, only templates matching the active category are returned.
   */
  const filteredTemplates = activeCategory === 'All'
    ? templates
    : templates.filter(template => {
        // Find the corresponding category from TEMPLATES_CONFIG for the current template
        const configEntry = TEMPLATES_CONFIG.find(t => t.name.toLowerCase() === template.name.toLowerCase());
        return configEntry && configEntry.category === activeCategory;
      });

  return (
    <ScrollArea className="h-[calc(100vh-100px)] p-4">
      {/* Category filter buttons */}
      {/* Added 'lg:justify-start' to align buttons to the left on large screens */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center lg:justify-start">
        {categories.map((category) => (
          <Button
            key={category}
            // Apply 'default' variant if this is the active category, 'outline' otherwise
            variant={activeCategory === category ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 justify-items-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Map and render the filtered templates */}
        {filteredTemplates.map((template, index) => (
          <div
            key={index}
            className="relative w-[210px] h-[480px] rounded-2xl overflow-hidden group shadow-md"
          >
            <img
              src={template.image}
              alt={template.name}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center text-white px-2 text-center">
              <div className="text-sm font-semibold mb-3">{template.name}</div>
              <Button className="z-10" onClick={() => handleNavigation(template.name)}>
                Create Zaplink
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default Template;