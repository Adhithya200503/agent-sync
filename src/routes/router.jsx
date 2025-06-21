import { createBrowserRouter } from "react-router-dom";
import AgentSync from "../Layout/AgentSync";
import CreateLinkPage from "../WhatsappPages/CreateLinkPage";
import ListLinks from "../WhatsappPages/ListLinks";
import LoginPage from "../authPages/LoginPage";
import SignUpPage from "../authPages/SignUpPage";
import UserProfile from "../components/AppComponents/ProfilePage";
import LinkEditPage from "../WhatsappPages/EditPage";
import LinkAnalytics from "../WhatsappPages/LinkAnalytics";
import LinkInfoPage from "../WhatsappPages/LinkInfoPage";
import ShortenUrlForm from "../Zurl-pages/ShortenUrlForm";
import LinkList from "../Zurl-pages/LinkList";
import ZapLinkHome from "../zaplink/ZapLinkHome";
import CheckProfile from "../authPages/CheckUserProfile";
import EditLinkPage from "../Zaplink/ZapLinkEditPage";
import PublicLinkPage from "../Zaplink/PublicZapLink";
import ZurlAnalytics from "../Zurl-pages/ZurlAnalytics";
import LinkPageStats from "../Zaplink/LinkPageStats";
import { ZurlUnlockPage } from "../Zurl-pages/ZurlUnlockPage";
import PortfolioForm from "../BioGram/createPortfolioForm";
import PortfolioEditForm from "../BioGram/PortfolioEditForm";
import ListPortfolios from "../BioGram/ListPortfolios";
import LinkBioPage from "../Zaplink/PublicZapLink";
import Template from "../Zaplink/Template";
import PortfolioLinkResult from "../BioGram/PortfolioLinkResult";
import AuthPage from "../authPages/AuthPage";
import ZurlHomePage from "../Zurl-pages/ZurlHomePage";
import Home from "../Home";
import { useAuth } from "../context/AuthContext";
import AuthRedirector from "../AuthRedirector";

import ZappyPost from "../ZappyPost/ZappyPost";

import ShortLinkInfoPage from "../Zurl-pages/ShortLinkInfoPage";
import ZurlFolder from "../Zurl-pages/ZurlFolder";
import BioGramAnalytics from "../BioGram/BioGramAnalytics";


const router = createBrowserRouter([
  {
    path: "/Zurl/unlock/:shortId",
    element: <ZurlUnlockPage />,
  },
  {
    path: "/",
    element: <AuthRedirector />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: "/whatsapp",
    element: <AgentSync />,
    children: [
      {
        index: true,
        element: <CreateLinkPage />,
      },
      {
        path: "link-info/:id",
        element: <LinkInfoPage />,
      },
      {
        path: "view-links",
        element: <ListLinks />,
      },
      {
        path: "analytics",
        element: <LinkAnalytics />,
      },
    ],
  },
  {
    path: "zurl",
    element: <AgentSync />,
    children: [
      {
        index: true,
        element: <ShortenUrlForm />,
      },
      {
        path: "link-list",
        element: <LinkList />,
      },
      {
        path: "view-links/:shortId",
        element: <ShortLinkInfoPage />,
      },
      {
        path: "folders",
        element: <ZurlFolder />,
      },

      {
        path: ":slug",
        element: <ZurlAnalytics />,
      },
    ],
  },
  {
    path: "/auth",
    children: [
      {
        index: true,
        element: <AuthPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },

      {
        path: "check-profile",
        element: <CheckProfile />,
      },
    ],
  },
  {
    path: "/user",
    element: <AgentSync />,
    children: [
      {
        index: true,
        element: <UserProfile />,
      },
    ],
  },
  {
    path: "/zap-link",
    element: <AgentSync />,
    children: [
      {
        index: true,
        element: <ZapLinkHome />,
      },
      {
        path: "templates",
        element: <Template />,
      },
      {
        path: "create-zap-link",
        element: <EditLinkPage />,
      },
      {
        path: ":slug",
        element: <LinkPageStats />,
      },
    ],
  },
  {
    path: "/bio-gram",
    element: <AgentSync />,
    children: [
      {
        path: "create-portfolio",
        element: <PortfolioForm />,
      },
      {
        path: "portfolio/edit/:portfolioId",
        element: <PortfolioEditForm />,
      },
      {
        path: "portfolios",
        element: <ListPortfolios />,
      },
      {
        path: "link-generator",
        element: <PortfolioLinkResult />,
      },
      {
        path: "analytics/:slug",
        element: <BioGramAnalytics />,
      },
    ],
  },
  {
    path: "/zapLink/:username",
    element: <LinkBioPage />,
  },
  {
    path: "/zappy-post",
    element: <AgentSync />,
    children: [
      {
        index: true,
        element: <ZappyPost />,
      },
    ],
  },
]);

export default router;
