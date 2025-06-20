import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Home,
  Inbox,
  LinkIcon,
  Search,
  Settings,
  MessageCircle,
  Plus,
  Eye,
  User,
  CreditCard,
  Users,
  Crown,
  BarChart2,
  List,
  Frame,
  Scissors,
  ExternalLink,
  FileUser,
  ShoppingBag,
  Folder,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { SidebarFooter, SidebarHeader, SidebarSeparator } from "./sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom"; // Import useLocation

export function AppSidebar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const hideWhatsAppSection =
    currentPath.startsWith("/zurl") ||
    currentPath.startsWith("/zap-link") ||
    currentPath.startsWith("/Bio-gram") ||
    currentPath.startsWith("/zap-store") ||
    currentPath.startsWith("/zappy-post") ||
    currentPath.startsWith("/apps/primitives");
  const hideZurlSection =
    currentPath.startsWith("/whatsapp") ||
    currentPath.startsWith("/zap-link") ||
    currentPath.startsWith("/Bio-gram") ||
    currentPath.startsWith("/zap-store") ||
    currentPath.startsWith("/zappy-post") ||
    currentPath.startsWith("/apps/primitives");
  const hideZapLinksSection =
    currentPath.startsWith("/whatsapp") ||
    currentPath.startsWith("/zurl") ||
    currentPath.startsWith("/Bio-gram") ||
    currentPath.startsWith("/zap-store") ||
    currentPath.startsWith("/zappy-post") ||
    currentPath.startsWith("/apps/primitives");
  const hideBioGramSection =
    currentPath.startsWith("/whatsapp") ||
    currentPath.startsWith("/zurl") ||
    currentPath.startsWith("/zap-link") ||
    currentPath.startsWith("/zap-store") ||
    currentPath.startsWith("/zappy-post") ||
    currentPath.startsWith("/apps/primitives");
  const hideZapStoreSection =
    currentPath.startsWith("/whatsapp") ||
    currentPath.startsWith("/zurl") ||
    currentPath.startsWith("/zap-link") ||
    currentPath.startsWith("/Bio-gram") ||
    currentPath.startsWith("/zappy-post") ||
    currentPath.startsWith("/apps/primitives");
  const hideZappyPostSection =
    currentPath.startsWith("/whatsapp") ||
    currentPath.startsWith("/zurl") ||
    currentPath.startsWith("/zap-link") ||
    currentPath.startsWith("/Bio-gram") ||
    currentPath.startsWith("/zap-store") ||
    currentPath.startsWith("/apps/primitives");
  const hideAppsPrimitivesSection =
    currentPath.startsWith("/whatsapp") ||
    currentPath.startsWith("/zurl") ||
    currentPath.startsWith("/zap-link") ||
    currentPath.startsWith("/Bio-gram") ||
    currentPath.startsWith("/zappy-post") ||
    currentPath.startsWith("/zap-store");

  const isAuthPage = currentPath.startsWith("/auth");
  const isPublicPage =
    currentPath.startsWith("/Zurl/unlock") ||
    currentPath.startsWith("/biogram/") ||
    currentPath.startsWith("/zapLink/");

  const getVisibleSection = (path) => {
    if (path.startsWith("/whatsapp")) return "whatsapp";
    if (path.startsWith("/zurl")) return "zurl";
    if (path.startsWith("/zap-link")) return "zap-link";
    if (path.startsWith("/bio-gram")) return "bio-gram";
    if (path.startsWith("/zap-store")) return "zap-store";
    if (path.startsWith("/zappy-post")) return "zappy-post";
    if (path.startsWith("/apps/primitives")) return "apps-primitives";

    return null;
  };

  const activeSection = getVisibleSection(currentPath);

  const showSection = (sectionName) => {
    if (isAuthPage || isPublicPage) return false;

    return activeSection === sectionName;
  };

  return (
    <Sidebar className="w-[200px]">
      <SidebarHeader>
        <SidebarMenuButton asChild>
          <Link to="/" className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            <span className="font-semibold text-lg data-[collapsed=true]:hidden">
              AgentSync
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="mt-14">
        {showSection("whatsapp") && (
          <SidebarGroup className="data-[collapsed=true]:hidden">
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  <MessageCircle className="mr-[10px]" />
                  WhatsApp
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/whatsapp/create-link">
                          <Plus />
                          Create Link
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {currentUser && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/whatsapp/view-links">
                            <Eye />
                            View Links
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {/* You might want to add analytics if it's part of WhatsApp */}
                    {currentUser && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/whatsapp/analytics">
                            <BarChart2 />
                            Analytics
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {showSection("zurl") && ( // Conditionally render
          <SidebarGroup className="data-[collapsed=true]:hidden">
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  <Scissors className="mr-[10px]" />
                  Zurl
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zurl">
                          <Plus />
                          Create Link
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zurl/link-list">
                          <List />
                          List
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zurl/folders">
                          <Folder />
                          Folders
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {showSection("zap-link") && ( // Conditionally render
          <SidebarGroup className="data-[collapsed=true]:hidden">
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  <ExternalLink className="mr-[10px]" />
                  Zap Links
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zap-link/create-zap-link">
                          <Plus />
                          Create Link
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {currentUser && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/zap-link">
                            <Eye />
                            View Zap links
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zap-link/templates">
                          <Frame />
                          Templates
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {showSection("bio-gram") && (
          <SidebarGroup className="data-[collapsed=true]:hidden">
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  <FileUser className="mr-[10px]" />
                  Bio Gram
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/bio-gram/create-portfolio">
                          <Plus />
                          Create Portfolio
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/bio-gram/portfolios">
                          <List />
                          Portfolios
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {showSection("zap-store") && (
          <SidebarGroup className="data-[collapsed=true]:hidden">
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  <ShoppingBag className="mr-[10px]" />
                  Zap Store
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zap-store">
                          <Plus />
                          Create Zap Store
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zap-store/stores">
                          {" "}
                          {/* Assuming this lists stores */}
                          <List />
                          View Stores
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/* Add Zap Store Analytics if applicable */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zap-store/analytics">
                          {" "}
                          {/* Assuming an analytics path */}
                          <BarChart2 />
                          Analytics
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {showSection("zappy-post") && (
          <SidebarGroup className="data-[collapsed=true]:hidden">
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  <ShoppingBag className="mr-[10px]" />
                  Zappy Post
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zappy-post">
                          <Plus />
                          Create Zappy Post
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/zappy-post/list">
                          <List />
                          View Posts
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {showSection("apps-primitives") && (
          <SidebarGroup className="data-[collapsed=true]:hidden">
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  <List className="mr-[10px]" />
                  App Primitives
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/apps/primitives/alert-dialog">
                          <Plus />
                          Alert Dialog
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/apps/primitives/hover-card">
                          <Plus />
                          Hover Card
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/apps/primitives/progress">
                          <Plus />
                          Progress
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/apps/primitives/scroll-area">
                          <Plus />
                          Scroll Area
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/apps/primitives/tabs">
                          <Plus />
                          Tabs
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/apps/primitives/tooltip">
                          <Plus />
                          Tooltip
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={
                        currentUser?.photoURL || "https://github.com/shadcn.png"
                      }
                    />
                    <AvatarFallback>
                      {currentUser?.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="data-[collapsed=true]:hidden">
                    {currentUser?.displayName || "User"}
                  </span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="w-4 h-4" />
                  <Link to="/user">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="w-4 h-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="w-4 h-4" />
                  Team
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Crown className="w-4 h-4" />
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {currentUser ? (
                  <DropdownMenuItem onClick={() => logout()}>
                    Log out
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <Link to="/auth/login">Login</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
