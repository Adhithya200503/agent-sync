import React, { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Link2,
  SquareSlash,
  Zap,
} from "lucide-react";
import Hero from "./assets/hero.png";
import Wamehero from "./assets/wamehero.png";
import Zurlhero from "./assets/zurlhero.png";
import Zaplinkhero from "./assets/zaplinkhero.png";
import { NavLink } from "react-router-dom";

const Home = () => {
  const [image1Coords, setImage1Coords] = useState({ x: 0, y: 0 });
  const [image1Hovering, setImage1Hovering] = useState(false);

  const handleImage1MouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) / (width / 2);
    const y = (e.clientY - (top + height / 2)) / (height / 2);
    setImage1Coords({ x, y });
  };

  const handleImage1MouseLeave = () => {
    setImage1Hovering(false);
    setImage1Coords({ x: 0, y: 0 });
  };

  const handleImage1MouseEnter = () => {
    setImage1Hovering(true);
  };

  const parallaxIntensity = 20;

  const image1TransformStyle = {
    transform: image1Hovering
      ? `translate(${image1Coords.x * parallaxIntensity}px, ${
          image1Coords.y * parallaxIntensity
        }px)`
      : "translate(0px, 0px)",
    transition: image1Hovering
      ? "transform 0.1s ease-out"
      : "transform 0.3s ease-out",
  };

  return (
    <main className="min-h-full w-full overflow-x-hidden">
      <section
        className="flex flex-col gap-10 bg-gradient-to-br  from-blue-300 to-gray-300 dark:bg-gradient-to-tr dark:from-neutral-800 dark:to-stone-600 dark:text-gray-300 p-8"
      >
        <div className="flex flex-col items-center justify-center text-center font-black text-5xl">
          <p className="leading-12.9">
            The
            <span className="bg-gradient-to-l from-sky-400 to-blue-600 hover:bg-gradient-to-r bg-clip-text text-transparent italic hover:animate-pulse">
              &nbsp; Supersite &nbsp;
            </span>
            to rule them all.
          </p>
          <NavLink to={"/whatsapp"}>
            <button class="btn text-lg btn-info hover:btn-neutral dark:hover:btn-warning group flex mt-10 rounded-full items-center transition-all duration-200">
              Get Started
              <span class="hidden group-hover:block transition-all duration-300">
                <ArrowUpRight />
              </span>
            </button>
          </NavLink>
        </div>
        <div
          className="relative group flex items-center justify-center"
          onMouseMove={handleImage1MouseMove}
          onMouseLeave={handleImage1MouseLeave}
          onMouseEnter={handleImage1MouseEnter}
        >
          <img
            src={Hero}
            alt="agentSync - The Supersite"
            className="lg:w-3/5 lg:h-3/5 object-cover h-auto rounded-lg pointer-events-none"
            style={image1TransformStyle}
          />
        </div>
        <span className="flex items-center font-medium justify-center text-center">
          Discover agentSync
          <ChevronDown className="animate-bounce mt-1 ml-1" />
        </span>
      </section>
      <section className="flex flex-col md:flex-row gap-10 bg-blue-100 dark:bg-blue-950 dark:text-gray-300 p-8">
        <div className="flex flex-1/2 flex-col font-semibold md:pl-10 justify-center text-4xl">
          <p className="badge badge-success text-lg mb-3">WHATSAPP</p>
          <p>
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              WhatsApp
            </span>{" "}
            Links?
          </p>
          <p>Consider it done.</p>
          <p className="mt-3 font-normal text-base">
            Create custom WhatsApp links with a preset message and an expiry
            duration.
          </p>
          <p className="font-normal mt-2 text-base">It's as easy as ABC.</p>
          <NavLink to={"/whatsapp"}>
            <span>
              <button className="btn btn-success mt-5 rounded-lg">
                <Link2 /> Create your first WhatsApp Link
              </button>
            </span>
          </NavLink>
        </div>
        <div className="flex flex-1/2 items-center justify-center hover:scale-110 duration-300 transition-all">
          <img src={Wamehero} alt="WhatsApp Links" />
        </div>
      </section>
      <section className="flex flex-col md:flex-row gap-10 bg-green-100 dark:bg-slate-900 dark:text-gray-300 p-8">
        <div className="flex flex-1/2 flex-col font-semibold md:pl-10 justify-center text-4xl">
          <p className="badge badge-error text-lg mb-3">ZURL</p>
          <p>
            The&nbsp;
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              smarter
            </span>{" "}
            way to share.
          </p>
          <p className="mt-3 font-normal text-base">
            Streamline your sharing with short links and gain valuable
            performance data through analytics.
          </p>
          <p className="font-normal text-base mt-3">
            Zip. Zap. <span className="italic">Zurl.</span>
          </p>
          <NavLink to={"/zurl"}>
            <span>
              <button className="btn btn-error mt-5 rounded-lg">
                <SquareSlash /> Create your first Zurl
              </button>
            </span>
          </NavLink>
        </div>
        <div className="flex flex-1/2 items-center justify-center hover:scale-110 duration-300 transition-all">
          <img src={Zurlhero} alt="Zurl" />
        </div>
      </section>
      <section className="flex flex-col md:flex-row gap-10 bg-orange-100 dark:bg-black dark:text-gray-300 p-8">
        <div className="flex flex-1/2 flex-col font-semibold md:pl-10 justify-center text-4xl">
          <p className="badge badge-primary text-lg mb-3">ZAPLINKS</p>
          <p>
            Meet the new&nbsp;
            <span className="bg-gradient-to-r from-violet-400 to-indigo-600 dark:bg-gradient-to-r dark:from-violet-300 dark:to-violet-500  bg-clip-text text-transparent">
              home
            </span>{" "}
          </p>
          <p>for all your social media links.</p>
          <p className="mt-3 font-normal text-base">
            Showcase your entire digital universe, all from one powerful link.
          </p>
          <p className="font-normal text-base mt-2">
            Instagram, YouTube, custom links...we've got you covered.
          </p>
          <NavLink to={"/zap-link/create-zap-link"}>
            <span>
              <button className="btn btn-primary mt-5 rounded-lg">
                <Zap /> Create your first ZapLink
              </button>
            </span>
          </NavLink>
        </div>
        <div className="flex flex-1/2 items-center justify-center hover:scale-110 duration-300 transition-all">
          <img src={Zaplinkhero} alt="ZapLink" />
        </div>
      </section>
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>agentSync © 2025</p>
        </aside>
      </footer>
    </main>
  );
};

export default Home;