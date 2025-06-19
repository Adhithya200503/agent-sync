// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';
// import { Sun, Moon, Instagram, Facebook, Linkedin, Twitter, Link as LinkIcon, Mail, Youtube, Twitch, Github, Globe } from "lucide-react";
// import { toast } from 'sonner';
// import { useParams } from 'react-router-dom';

// const ICON_MAP = {
//   instagram: Instagram,
//   facebook: Facebook,
//   linkedin: Linkedin,
//   twitter: Twitter,
//   youtube: Youtube,
//   twitch: Twitch,
//   github: Github,
//   website: Globe,
//   gmail: Mail,
//   custom: LinkIcon,
// };

// const ACCENT_COLOR_CLASS = 'bg-blue-600 hover:bg-blue-700 text-white';
// const ACCENT_TEXT_CLASS = 'text-blue-600 dark:text-blue-400';

// export default function LinkBioPage() {
//   const params = useParams();
//   const {username} = params;

//   const [pageData, setPageData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//     localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
//   }, [isDarkMode]);

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'dark') {
//       setIsDarkMode(true);
//     } else if (savedTheme === 'light') {
//       setIsDarkMode(false);
//     } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
//       setIsDarkMode(true);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchPageData = async () => {
//       if (!username) return;

//       try {
//         const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/link-page/${username}`);
//         setPageData(response.data.data);
//         console.log(response.data.data)
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching link page:', err);
//         setError('Could not load this link page. It might not exist or there was a server error.');
//         setLoading(false);
//         toast.error('Error loading page', {
//           description: err.response?.data?.message || 'Please try again later.',
//         });
//       }
//     };

//     fetchPageData();
//   }, [username]);

//   const handleLinkClick = async (linkUrl, platformName) => {
//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/zaplink/track/link/${username}`, { linkUrl: linkUrl });
//       console.log(`Tracked click for ${platformName} link: ${linkUrl}`);
//     } catch (err) {
//       console.error('Error tracking link click:', err);
//     } finally {
//       window.open(linkUrl, '_blank', 'noopener,noreferrer');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
//         <p>Loading your ZapLink page...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white p-4 text-center">
//         <p className="text-lg font-semibold">{error}</p>
//       </div>
//     );
//   }

//   if (!pageData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white p-4 text-center">
//         <p className="text-lg font-semibold">No link page found for this username.</p>
//       </div>
//     );
//   }

//   const { profilePic, username: displayUsername, bio, links: userLinks } = pageData;

//   return (
//     <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-inter flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
//       <div className="absolute top-4 right-4 flex items-center space-x-2">
//         <Sun className={`h-5 w-5 ${!isDarkMode ? ACCENT_TEXT_CLASS : 'text-gray-400'}`} />
//         <Switch
//           id="dark-mode-toggle"
//           checked={isDarkMode}
//           onCheckedChange={setIsDarkMode}
//           className={`${ACCENT_COLOR_CLASS}`}
//         />
//         <Label htmlFor="dark-mode-toggle" className="sr-only">Toggle Dark Mode</Label>
//         <Moon className={`h-5 w-5 ${isDarkMode ? ACCENT_TEXT_CLASS : 'text-gray-400'}`} />
//       </div>

//       <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 sm:p-8">
//         <CardContent className="flex flex-col items-center space-y-6 pt-0">
//           <Avatar className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-blue-600 dark:border-blue-400 shadow-md overflow-hidden">
//             <AvatarImage
//               src={profilePic || `https://placehold.co/128x128/cccccc/333333?text=${displayUsername.charAt(0).toUpperCase()}`}
//               alt={`${displayUsername}'s profile`}
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = `https://placehold.co/128x128/cccccc/333333?text=${displayUsername.charAt(0).toUpperCase()}`;
//               }}
//             />
//             <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-4xl font-bold">
//               {displayUsername.charAt(0).toUpperCase()}
//             </AvatarFallback>
//           </Avatar>

//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center">
//             @{displayUsername}
//           </h1>

//           {bio && (
//             <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center leading-relaxed">
//               {bio}
//             </p>
//           )}

//           <div className="w-full space-y-4">
//             {userLinks && userLinks.length > 0 ? (
//               userLinks.map((link, index) => {
//                 const IconComponent = ICON_MAP[link.icon] || LinkIcon;

//                 return (
//                   <Button
//                     key={index}
//                     onClick={() => handleLinkClick(link.url, link.title)}
//                     className={`w-full flex items-center justify-center p-3 sm:p-4 rounded-lg shadow-md transition-all duration-200 ease-in-out
//                                 ${ACCENT_COLOR_CLASS}
//                                 border border-blue-700 dark:border-blue-500
//                                 transform hover:scale-105 active:scale-95`}
//                   >
//                     <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
//                     <span className="font-semibold text-base sm:text-lg">{link.title}</span>
//                   </Button>
//                 );
//               })
//             ) : (
//               <p className="text-center text-gray-500 dark:text-gray-400">No links set up yet.</p>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       <footer className="mt-8 text-center text-xs text-gray-500 dark:text-gray-600">
//         Powered by ZapLink
//       </footer>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Twitch,
  Github,
  Globe,
  Mail,
  Link as LinkIcon,
} from "lucide-react";

const ICON_MAP = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  twitch: Twitch,
  github: Github,
  website: Globe,
  gmail: Mail,
  custom: LinkIcon,
};

export default function LinkBioPage() {
  const { username } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const THEMES = {
    default: {
      card: "bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700",
      button: "bg-blue-600 hover:bg-blue-800 text-white active:bg-gray-700",
      avatarBorder: "border-blue-600 dark:border-blue-400",
      text: "text-gray-900 dark:text-white dark:bg-zinc-600",
    },
    "color-burst": {
      card: "backdrop-blur-md bg-white/30 text-black",
      button:
        "bg-white text-indigo-700 border-2 border-gray-200/70 font-black hover:bg-gradient-to-l from-purple-500 to-indigo-700 hover:text-white active:bg-gradient-to-r",
      text: "text-white",
      bgImg:
        "url(https://images.pexels.com/photos/7135121/pexels-photo-7135121.jpeg)",
    },
    "frosted-glass": {
      card: "bg-white/30 backdrop-blur-lg shadow-lg border-2 border-white/20",
      button:
        "bg-white/70 hover:bg-white text-zinc-800 font-semibold hover:font-black active:bg-gray-300/50",
      text: "text-white",
      bgImg:
        "url(https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg)",
    },
    "breeze": {
      card: "border-white/80 text-black/80 border-2 shadow-lg transition-all duration-300",
      button:
        "font-serif text-cyan-600 border border-cyan-500 font-medium py-2 px-4 rounded shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/70 active:bg-gray-300/50",
      text: "text-gray-700 font-serif",
      bgImg:
        "url(https://images.pexels.com/photos/3369526/pexels-photo-3369526.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)",
    },
    "pastel": {
      card: "bg-amber-100/80 backdrop-blur-xs border-2 border-orange-300",
      button: "bg-orange-400 hover:bg-amber-600 text-white active:bg-amber-700",
      text: "text-amber-700",
      bgImg:
        "url(https://media.istockphoto.com/id/680444772/photo/beach-huts-or-bathing-boxes-on-the-beach.jpg?s=612x612&w=0&k=20&c=bipPVEYMUeuytD1iECupyITIAHoshsy3LUb2Chb1dGg=)",
    },
    "terminal": {
      card: "bg-black border-dashed border-green-400 text-white",
      button:
        "bg-green-600 text-black font-mono hover:animate-pulse hover:bg-orange-500 active:animate-bounce border border-transparent hover:border-black border-dashed",
      text: "text-green-400 font-mono",
      bgImg:
        "url(https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)",
    },
    "gamer": {
      card: "bg-black/30 backdrop-blur-sm border-3 border-yellow-500 ring-4 ring-amber-700 text-white",
      button:
        "rounded bg-amber-400 text-black  font- font-mono hover:scale-120 hover:bg-orange-500 active:scale-30",
      text: "text-white font-mono",
      bgImg:
        "url(https://images.pexels.com/photos/5883539/pexels-photo-5883539.jpeg?auto=compress&cs=tinysrgb&w=1200&lazy=load)",
    },
    "teacher": {
      card: "bg-yellow-50 border-2 border-yellow-300 shadow-md",
      button:
        "bg-yellow-400 text-black hover:bg-yellow-500 active:bg-yellow-600 font-medium",
      text: "text-gray-800 font-serif",
      bgImg:
        "url(https://th.bing.com/th/id/OIP.68cqqpramaVPYwmePsmJeAHaEJ?w=276&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7)", 
    },
  };

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDarkMode(true);
    } else if (theme === "light") {
      setIsDarkMode(false);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!username) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/link-page/${username}`
        );
        setPageData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Could not load the page.");
        setLoading(false);
        toast.error("Error fetching data", {
          description:
            err?.response?.data?.message || "Please try again later.",
        });
      }
    };

    fetchPageData();
  }, [username]);

  const handleLinkClick = async (url, platformName) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/zaplink/track/link/${username}`,
        { linkUrl: url }
      );
    } catch (err) {
      console.error(err);
    } finally {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-black text-black dark:text-white">
        <p className="font-semibold mb-5">agentSync</p>
        <p>Loading ZapLink page...</p>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-black text-black dark:text-white px-4 text-center">
        <p className="text-lg font-semibold">
          {error || "No link page found for this username."}
        </p>
      </div>
    );
  }

  const { username: uname, bio, links, profilePic, template } = pageData;

  const theme = THEMES[template];

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${theme.text} px-4 py-10 transition-all duration-300 bg-cover bg-center bg-no-repeat`}
      style={
        pageData.template !== "default" ? { backgroundImage: theme.bgImg } : {}
      }
    >
      {/* Card */}
      <div
        className={`w-full max-w-lg ${theme.card} rounded-2xl shadow-lg border border-gray-200/50 dark:border-zinc-700/50 p-6 space-y-6 text-center transition-all duration-200`}
      >
        {/* Avatar */}
        <div
          className={`w-28 h-28 bg-auto sm:w-32 mx-auto sm:h-32 rounded-full border-4 border-white dark:border-black hover:border-dotted shadow-md overflow-hidden transition-all duration-200`}
        >
          <img
            src={
              profilePic ||
              `https://placehold.co/128x128/cccccc/333333?text=${uname
                .charAt(0)
                .toUpperCase()}`
            }
            alt={`${uname}'s profile`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/128x128/cccccc/333333?text=${uname
                .charAt(0)
                .toUpperCase()}`;
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Username */}
        <h1 className="text-2xl font-bold">@{uname}</h1>

        {/* Bio */}
        {bio && <p className=" text-md">{bio}</p>}

        {/* Links */}
        <div className="flex flex-col space-y-4">
          {links && links.length > 0 ? (
            links.map((link, i) => {
              const Icon = ICON_MAP[link.icon?.toLowerCase()] || LinkIcon;
              return (
                <button
                  key={i}
                  onClick={() => handleLinkClick(link.url, link.title)}
                  className={`flex items-center justify-center space-x-3 w-full hover:scale-103 hover:cursor-pointer ${theme.button} font-semibold py-3 px-4 rounded-lg shadow transition-all duration-200`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.title}</span>
                </button>
              );
            })
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No links available.
            </p>
          )}
        </div>
      </div>

      <footer className="mt-8 text-xs">
        Powered by{" "}
        <a
          href="https://agentsync-5ab53.web.app/zap-link"
          className="font-bold"
        >
          ZapLink
        </a>
      </footer>
    </div>
  );
}
