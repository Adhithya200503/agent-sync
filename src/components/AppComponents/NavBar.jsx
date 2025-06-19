import { NavLink } from "react-router-dom";
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const components = [
  {
    title:"Zurl",
    href: "/zurl",
    description:
      "Streamline your sharing with short links and gain valuable performance data through analytics.",
  },
  {
    title: "Zap links",
    href: "/zap-link",
    description:
      "Showcase your entire digital universe, all from one powerful link. Instagram, YouTube, custom links...we've got you covered.",
  },
  {
    title: "Bio gram",
    href: "/bio-gram/portfolios",
    description:
      "Design a captivating digital portfolio that truly reflects your talent. Whether you're a creative pro, a job seeker, or simply sharing your passion, Biogram makes building your online presence simple and stunning.",
  },
  {
    title: "Zapp Post",
    href: "/zappy-post",
    description: "ZappyPost generates tailored social media posts from URLs. Select a platform (Instagram, LinkedIn, etc.) for optimized content.",
  },
  {
    title:"Zap Store",
    href: "/zap-store",
    description:
      "Start your own ecommerce website with Zap Store",
  },
  {
    title:"Whatsapp",
    href: "/whatsapp",
    description:
      "Create custom WhatsApp links with a preset message and an expiry duration. It's as easy as ABC.",
  }
];

export function NavigationMenuDemo() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <NavLink
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                    to="/" 
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      shadcn/ui
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Beautifully designed components built with Tailwind CSS.
                    </p>
                  </NavLink>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Our Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <NavLink to="/docs">Contact us</NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <NavLink to="/docs">About us</NavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  {/* Use NavLink instead of Link */}
                  <NavLink to="#">Components</NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  {/* Use NavLink instead of Link */}
                  <NavLink to="#">Documentation</NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  {/* Use NavLink instead of Link */}
                  <NavLink to="#">Blocks</NavLink>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  {/* Use NavLink instead of Link */}
                  <NavLink to="#" className="flex-row items-center gap-2">
                    <CircleHelpIcon />
                    Backlog
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  {/* Use NavLink instead of Link */}
                  <NavLink to="#" className="flex-row items-center gap-2">
                    <CircleIcon />
                    To Do
                  </NavLink>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  {/* Use NavLink instead of Link */}
                  <NavLink to="#" className="flex-row items-center gap-2">
                    <CircleCheckIcon />
                    Done
                  </NavLink>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({ title, children, href, ...props }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        {/* Use NavLink instead of Link */}
        <NavLink to={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </NavLink>
      </NavigationMenuLink>
    </li>
  );
}