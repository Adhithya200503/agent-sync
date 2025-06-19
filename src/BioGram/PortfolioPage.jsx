import React, { useState, useEffect } from "react";
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
  PhoneIcon,
  MapPin,
  CalendarDays,
  SquareArrowOutUpRight,
  FileBadge,
  FileText,
  CircleCheck,
  ImageUpscale,
  Info,
} from "lucide-react";

const SOCIAL_ICON_MAP = {
  Instagram: Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  Twitter: Twitter,
  Facebook: Facebook,
  Twitch: Twitch,
  GitHub: Github,
  Website: Globe,
  Custom: LinkIcon,
};

export default function PortfolioPage() {
  const { bioGramId } = useParams();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const THEMES = {
    default: {
      card: "bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-zinc-700",
      button: "bg-blue-600 hover:bg-blue-800 text-white active:bg-gray-700",
      avatarBorder: "border-blue-600 dark:border-blue-400",
      text: "bg-white text-gray-900 dark:text-white dark:bg-black",
    },
    "color-burst": {
      card: "backdrop-blur-md bg-white/40 dark:bg-black/30 text-black dark:text-white border-2 border-white/20",
      button:
        "bg-white text-indigo-700 border-2 border-gray-200/70 font-black dark:bg-gray-200 hover:bg-gradient-to-l from-purple-500 to-indigo-700 hover:text-white active:bg-gradient-to-r",
      text: "text-white",
      bgImg:
        "url(https://images.pexels.com/photos/7004739/pexels-photo-7004739.jpeg?auto=compress&cs=tinysrgb&w=800)",
    },
    "frosted-glass": {
      card: "bg-white/50 dark:bg-black/40 backdrop-blur-lg shadow-lg border-2 text-black dark:text-white border-white/20",
      button:
        "bg-white/60 border-gray-200/60 border dark:bg-black/60 text-black dark:text-white",
      text: "text-white",
      bgImg:
        "url(https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg)",
    },
    pastel: {
      card: "bg-amber-100/80 backdrop-blur-md dark:bg-amber-900/80 dark:text-orange-300 border-2 border-orange-300",
      button: "bg-orange-400 hover:bg-amber-600 text-white active:bg-amber-700",
      text: "text-amber-700",
      bgImg:
        "url(https://images.pexels.com/photos/2957862/pexels-photo-2957862.jpeg?auto=compress&cs=tinysrgb&w=800)",
    },
    gamer: {
      card: "bg-black/30 backdrop-blur-md border-3 border-yellow-500 ring-4 ring-amber-700 text-white",
      button:
        "bg-amber-400 text-black font-mono hover:rounded-xl hover:bg-orange-500",
      text: "text-white font-mono",
      bgImg: `url(https://images.pexels.com/photos/5883539/pexels-photo-5883539.jpeg?auto=compress&cs=tinysrgb&w=1200&lazy=load)`,
    },
  };

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!bioGramId) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/portfolio/${bioGramId}`
        );
        setPortfolioData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching portfolio data:", err);
        setError("Could not load the portfolio page.");
        setLoading(false);
        toast.error("Error fetching data", {
          description:
            err?.response?.data?.message || "Please try again later.",
        });
      }
    };

    fetchPortfolioData();
  }, [bioGramId]);

  const handleLinkClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-black text-black dark:text-white">
        <p className="font-semibold mb-4">agentSync Biogram</p>
        <p>Loading Portfolio page...</p>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-black text-black dark:text-white px-4 text-center">
        <p className="text-lg font-semibold">
          {error || "No portfolio found for this User ID."}
        </p>
      </div>
    );
  }

  const {
    name,
    profession,
    profileImg,
    description,
    socialMediaLinks,
    achievements,
    projects,
    customFields,
    email,
    phoneNumber,
    city,
    country,
    age,
    certificates,
    resume,
    education,
    languages,
    experience,
  } = portfolioData;

  const template = portfolioData.template || "default";
  const theme = THEMES[template];

  return (
    <main
      className={`min-h-screen flex flex-col lg:flex-row ${theme.text} p-5 gap-5 scroll-smooth transition-all duration-300 bg-cover bg-center bg-no-repeat`}
      style={
        template !== "default" ? { backgroundImage: `${theme.bgImg}` } : {}
      }
    >
      <aside
        className={`w-full lg:max-w-[25%] lg:w-fit h-full lg:sticky lg:top-5 ${theme.card} rounded-2xl shadow-lg p-6 text-center transition-all duration-200`}
      >
        {/* Profile Section */}
        <section className="flex flex-col justify-between lg:justify-center lg:gap-5 items-center">
          <div
            className={`w-40 h-40 scale-80 rounded-2xl border-4 ${theme.avatarBorder} hover:border-dotted shadow-md overflow-hidden transition-all duration-200`}
          >
            <img
              src={
                profileImg ||
                `https://placehold.co/128x128/cccccc/333333?text=${name
                  .charAt(0)
                  .toUpperCase()}`
              }
              alt={`${name}'s profile`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/128x128/cccccc/333333?text=${name
                  .charAt(0)
                  .toUpperCase()}`;
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-md font-light badge badge-neutral p-2.5">
              {profession}
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-start gap-4">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex text-sm font-light gap-2 items-center justify-center"
              >
                <div
                  className={`flex items-center justify-center ${theme.button} p-2 rounded-full shadow`}
                >
                  <Mail size={20} />
                </div>
                <span className="hidden lg:block">{email}</span>
              </a>
            )}
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber}`}
                className="flex text-sm font-light gap-2 items-center justify-center"
              >
                <div
                  className={`flex items-center justify-center ${theme.button} p-2 rounded-full shadow`}
                >
                  <PhoneIcon size={20} />
                </div>
                <span className="hidden lg:block">{phoneNumber}</span>
              </a>
            )}
            {age && (
              <div className="flex text-sm font-light gap-2 items-center justify-center">
                <p
                  className={`flex items-center justify-center ${theme.button} p-2 rounded-full shadow`}
                >
                  <CalendarDays size={20} />
                </p>
                <span className="hidden lg:block">{age} years</span>
              </div>
            )}
            {(city || country) && (
              <div className="flex text-sm font-light gap-2 items-center justify-center">
                <p
                  className={`flex items-center justify-center ${theme.button} p-2 rounded-full shadow`}
                >
                  <MapPin size={20} />
                </p>
                <span className="hidden lg:block">
                  {city} {city && country && "·"} {country}
                </span>
              </div>
            )}
          </div>

          {/* Social Media Links */}
          {socialMediaLinks && socialMediaLinks.length > 0 && (
            <div>
              <div className="hidden lg:flex flex-col lg:flex-row flex-wrap justify-center items-center gap-1">
                {socialMediaLinks.map((link, i) => {
                  const Icon = SOCIAL_ICON_MAP[link.type] || LinkIcon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleLinkClick(link.url)}
                      className="btn btn-ghost btn-circle"
                      title={`${link.type}`}
                    >
                      <Icon className="h-5 w-5 hover:scale-110 transition-all duration-200" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <span className="hidden lg:block text-sm font-light">
            Powered by{" "}
            <a
              href="https://agentsync-5ab53.web.app/bio-gram"
              className="font-bold"
            >
              Biogram
            </a>
          </span>
        </section>
      </aside>

      <section className="collapse collapse-plus lg:hidden">
        <input type="checkbox" className="peer" />
        <div
          className={`collapse-title ${theme.card} text-xl font-medium rounded-2xl shadow-lg`}
        >
          More details
        </div>
        <div
          className={`collapse-content ${theme.card} rounded-2xl shadow-lg mt-2 p-4 flex flex-col gap-3`}
        >
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex text-sm font-light gap-2 items-center"
            >
              <div
                className={`flex items-center justify-center ${theme.button} p-2 rounded-full shadow`}
              >
                <Mail size={20} />
              </div>
              <span className="block">{email}</span>
            </a>
          )}
          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              className="flex text-sm font-light gap-2 items-center"
            >
              <div
                className={`flex items-center justify-center ${theme.button} p-2 rounded-full shadow`}
              >
                <PhoneIcon size={20} />
              </div>
              <span className="block">{phoneNumber}</span>
            </a>
          )}
          {age && (
            <div className="flex text-sm font-light gap-2 items-center">
              <p
                className={`flex items-center justify-center ${theme.button} p-2 rounded-full shadow`}
              >
                <CalendarDays size={20} />
              </p>
              <span className="block">{age} years</span>
            </div>
          )}
          {(city || country) && (
            <div className="flex text-sm font-light gap-2 items-center">
              <p
                className={`flex items-center justify-center ${theme.button} p-2 rounded-full shadow`}
              >
                <MapPin size={20} />
              </p>
              <span className="block">
                {city} {city && country && "·"} {country}
              </span>
            </div>
          )}
          {socialMediaLinks && socialMediaLinks.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mt-4 mb-4 divider divider-start">
                Social Links
              </h3>
              <div className="flex flex-wrap justify-start items-center gap-1">
                {socialMediaLinks.map((link, i) => {
                  const Icon = SOCIAL_ICON_MAP[link.type] || LinkIcon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleLinkClick(link.url)}
                      className={`btn btn-circle btn-ghost`}
                      title={`${link.type}`}
                    >
                      <Icon className="h-5 w-5 hover:scale-110 transition-all duration-200 " />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <span className="block badge mx-auto text-sm font-light text-center mt-3">
          Powered by{" "}
          <a
            href="https://agentsync-5ab53.web.app/bio-gram"
            className="font-bold"
          >
            Biogram
          </a>
        </span>
      </section>

      <aside className={`w-full space-y-6 transition-all duration-200`}>
        {description && (
          <div className={`${theme.card} rounded-2xl shadow-lg w-full p-6`}>
            <h2 className="text-2xl font-semibold mb-4">About Me</h2>
            <p className="text-md overflow-clip">{description}</p>
          </div>
        )}

        {customFields && Object.keys(customFields).length > 0 && (
          <div
            className={`${theme.card} rounded-2xl shadow-lg w-full p-6 text-left`}
          >
            <h2 className="text-2xl font-semibold mb-4">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields.specialization && (
                <div>
                  <h3 className="font-semibold text-lg">Specialization:</h3>
                  <p>{customFields.specialization}</p>
                </div>
              )}
              {customFields.yearsExperience && (
                <div>
                  <h3 className="font-semibold text-lg">
                    Years of Experience:
                  </h3>
                  <p>{customFields.yearsExperience}</p>
                </div>
              )}
              {customFields.skills && (
                <div>
                  <h3 className="font-semibold text-lg">Skills:</h3>
                  <p>{customFields.skills}</p>
                </div>
              )}
              {customFields.keyProjects && (
                <div>
                  <h3 className="font-semibold text-lg">Key Projects:</h3>
                  <p>{customFields.keyProjects}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div
            className={`${theme.card} rounded-2xl shadow-lg w-full p-6 text-left`}
          >
            <h2 className="text-2xl font-semibold mb-4">Projects</h2>
            <div className="carousel rounded-box w-full space-x-4 p-4 overflow-x-auto scroll-smooth snap-mandatory snap-x">
              {projects.map((project, i) => (
                <div
                  key={i}
                  className={`carousel-item relative group overflow-hidden ${theme.card} rounded-2xl shadow-md flex-col max-w-80 max-h-75 overflow-y-auto`}
                >
                  {project.imageUrl && (
                    <div className="w-full h-1/3 flex object-cover">
                      <img
                        src={project.imageUrl}
                        alt={`${project.title} image`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/10/cccccc/333333?text=Project";
                        }}
                      />
                      <a
                        href={project.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="h-1/3 w-full absolute inset-0 rounded-t-2xl backdrop-blur-md bg-black/40 text-white space-y-2 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                      >
                        <ImageUpscale className="h-8 w-8" />{" "}
                        <span className="font-semibold">View Image</span>
                      </a>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-xl mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm mb-3">{project.description}</p>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${theme.button} inline-flex items-center space-x-2 px-3 py-1 mb-3 text-sm rounded-2xl`}
                      >
                        <SquareArrowOutUpRight size={16} />
                        <span>View Project</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {experience?.length > 0 && (
          <div className="drawer drawer-end">
            <input id="exp-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <div
                className={`${theme.card} rounded-2xl flex flex-col items-start gap-3 shadow-lg w-full p-6`}
              >
                <h2 className="text-2xl font-semibold mb-4">Experience</h2>
                <label
                  htmlFor="exp-drawer"
                  className={`drawer-button btn gap-2 ${theme.button} rounded-full mb-4`}
                >
                  <Info size={16} />
                  View in Detail
                </label>
                <div className="w-full carousel">
                  <ul className="timeline timeline-horizontal">
                    {experience.map((exp, i) => {
                      const start = new Date(exp.startDate).toLocaleString(
                        "en-IN",
                        { year: "numeric", month: "long" }
                      );
                      const end = exp.endDate
                        ? new Date(exp.endDate).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "long",
                          })
                        : "Present";

                      return (
                        <li key={i}>
                          <hr />
                          <div
                            className={`timeline-start timeline-box ${theme.card}`}
                          >
                            <h1 className="font-semibold text-lg">
                              {exp.title}
                            </h1>
                            <h3 className="font-medium">{exp.company}</h3>
                          </div>
                          <div
                            className={`timeline-middle ${theme.button} p-1 rounded-full`}
                          >
                            <CircleCheck />
                          </div>
                          <div
                            className={`timeline-end badge rounded text-xs`}
                          >
                            {start} - {end}
                          </div>
                          <hr />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            <div className="drawer-side">
              <label
                htmlFor="exp-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                {experience.map((exp, i) => (
                  <React.Fragment key={i}>
                    <li>
                      <a>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-lg">
                            {exp.title}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {exp.company}
                          </span>
                          {exp.description && (
                            <p className="text-xs mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </a>
                    </li>
                    {i < experience.length - 1 && (
                      <li>
                        <hr />
                      </li>
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div
            className={`${theme.card} rounded-2xl flex flex-col items-start gap-3 shadow-lg w-full p-6`}
          >
            <h2 className="text-2xl font-semibold mb-4">Education</h2>
            <ul className="timeline timeline-horizontal carousel">
              {education.map((edu, i) => (
                <li key={i}>
                  <hr />
                  <div className={`timeline-start timeline-box ${theme.card}`}>
                    <h1 className="font-bold">{edu.degree}</h1>
                    <h3 className="font-extralight">{edu.institution}</h3>
                  </div>
                  <div
                    className={`timeline-middle ${theme.button} p-1 rounded-full`}
                  >
                    <CircleCheck />
                  </div>
                  <div className="timeline-end">{edu.year}</div>
                  <hr />
                </li>
              ))}
            </ul>
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div
            className={`${theme.card} rounded-2xl shadow-lg w-full p-6 text-left`}
          >
            <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
            <ul className="list-disc space-y-2 ml-3">
              {achievements.map((achievement, i) => (
                <li key={i}>
                  <h3 className="font-medium text-lg">{achievement.title}</h3>
                  {achievement.description && (
                    <p className="text-sm">{achievement.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {resume && (
          <div className={`${theme.card} rounded-2xl shadow-lg w-full p-6`}>
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-4">Resume</h2>
              <a
                href={resume}
                target="_blank"
                rel="noopener noreferrer"
                download={`${name}_Resume.pdf`}
                className={`inline-flex items-center space-x-2 ${theme.button} px-4 py-2 text-base rounded-full`}
              >
                <FileText size={20} />
                <span>View Resume</span>
              </a>
            </div>
          </div>
        )}

        {certificates && certificates.length > 0 && (
          <div
            className={`${theme.card} rounded-2xl shadow-lg w-full p-6 text-left`}
          >
            <h2 className="text-2xl font-semibold mb-4">Certificates</h2>
            <div className="carousel rounded-box w-full space-x-4 p-4 overflow-x-auto scroll-smooth snap-mandatory snap-x">
              {certificates.map((certificate, i) => (
                <div
                  key={i}
                  className={`${theme.card} p-4 rounded-2xl carousel-item shadow flex flex-col justify-between max-w-50`}
                >
                  <div className="w-full">
                    <FileBadge size={32} className="mb-2" />
                    <h3 className="font-semibold w-full overflow-clip text-lg mb-1">
                      {certificate.title.replace(
                        /\.(pdf|jpg|jpeg|png|gif|bmp|svg|webp)$/i,
                        ""
                      )}
                    </h3>
                  </div>
                  <div className="mt-3">
                    <a
                      href={certificate.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={certificate.title}
                      className={`inline-flex items-center space-x-2 ${theme.button} px-3 py-1 text-sm rounded-2xl`}
                    >
                      <SquareArrowOutUpRight size={16} />{" "}
                      <span>View Certificate</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div
            className={`${theme.card} rounded-2xl shadow-lg w-full p-6 text-left`}
          >
            <h2 className="text-2xl font-semibold mb-4">Languages Spoken</h2>
            {languages.map((lang, i) => (
              <div
                className={`text-md mr-2 mt-2 badge badge-soft ${theme.card}`}
                key={i}
              >
                {lang}
              </div>
            ))}
          </div>
        )}
      </aside>
    </main>
  );
}