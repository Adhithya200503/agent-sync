
import * as React from "react";
import { NavLink } from "react-router-dom";
import { XIcon } from "lucide-react";

import { ModeToggle } from "../mode-toggle";

const mobileLinks = [
  { title: "Home", href: "/" },
  { title: "Docs", href: "/docs" },
  { title: "Components", href: "/docs/primitives/alert-dialog" },
  { title: "Installation", href: "/docs/installation" },
  { title: "Typography", href: "/docs/primitives/typography" },
];

const MobileNavItem = React.forwardRef(({ href, title, children, className, onLinkClick, ...props }, ref) => {
  const combinedClassName = `block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className || ''}`;

  return (
    <li>
      <NavLink
        to={href}
        ref={ref}
        className={combinedClassName}
        onClick={onLinkClick}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        {children && (
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        )}
      </NavLink>
    </li>
  );
});
MobileNavItem.displayName = "MobileNavItem";


export function MobileNav({ isOpen, onClose }) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-card p-6 shadow-lg sm:max-w-sm">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-semibold">Navigation</h2>
          <button
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="grid gap-4">
          {mobileLinks.map((link) => (
            <MobileNavItem key={link.title} href={link.href} title={link.title} onLinkClick={handleLinkClick} />
          ))}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <ModeToggle />
          </div>
        </nav>
      </div>
    </div>
  );
}