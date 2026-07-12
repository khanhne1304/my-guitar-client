import { Navigate } from "react-router-dom";
import Home from "../../views/pages/HomePage/HomePage";
import Register from "../../views/pages/RegisterPage/RegisterPage";
import Login from "../../views/pages/LoginPage/LoginPage";
import ForgotPassword from "../../views/pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPassword from "../../views/pages/ResetPasswordPage/ResetPasswordPage";
import ProductDetails from "../../views/pages/ProductDetailsPage/ProductDetailsPage";
import ProductsCategory from "../../views/pages/ProductsPage/ProductsPage";
import Metronome from "../../views/pages/ToolsPage/MetronomePage/Metronome";
import ChordsPage from "../../views/pages/ToolsPage/ChordsPage/ChordsPage";
import TunerPage from "../../views/pages/TunerPage/TunerPage";
import ChordDetailPage from "../../views/pages/ChordDetailPage";
import AuthCallback from "../../views/pages/AuthCallback/AuthCallback";
import ForumPage from "../../views/pages/ForumPage/ForumPage";
import ForumThreadPage from "../../views/pages/ForumThreadPage/ForumThreadPage";
import UserProfilePage from "../../views/pages/UserProfilePage/UserProfilePage";
import SongSearchPage from "../../views/pages/SongSearchPage/SongSearchPage";
import ChatbotPage from "../../views/pages/ChatbotPage/ChatbotPage";
import PrivacyPolicyPage from "../../views/pages/PrivacyPolicyPage/PrivacyPolicyPage";
import ShippingReturnsPage from "../../views/pages/PolicyPages/ShippingReturnsPage";
import HowToBuyPage from "../../views/pages/PolicyPages/HowToBuyPage";
import PaymentSecurityPage from "../../views/pages/PolicyPages/PaymentSecurityPage";
import WarrantyPolicyPage from "../../views/pages/PolicyPages/WarrantyPolicyPage";
import WarrantyLookupPage from "../../views/pages/PolicyPages/WarrantyLookupPage";
import PolicyHubPage from "../../views/pages/PolicyPages/PolicyHubPage";
import AboutPage from "../../views/pages/CompanyPages/AboutPage";
import ShowroomsPage from "../../views/pages/CompanyPages/ShowroomsPage";
import ContactPage from "../../views/pages/CompanyPages/ContactPage";
import InstallmentPage from "../../views/pages/CompanyPages/InstallmentPage";
import LoyaltyPage from "../../views/pages/CompanyPages/LoyaltyPage";
import TermsPage from "../../views/pages/CompanyPages/TermsPage";
import CareersPage from "../../views/pages/CompanyPages/CareersPage";
import LearningDashboardPage from "../../views/pages/courses/LearningDashboardPage";
import CourseListPage from "../../views/pages/courses/CourseListPage";
import CourseDetailPage from "../../views/pages/courses/CourseDetailPage";

const publicRoutes = [
  { path: "/", element: <Home /> },

  { path: "/policies", element: <PolicyHubPage /> },
  { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
  { path: "/shipping-returns", element: <ShippingReturnsPage /> },
  { path: "/how-to-buy", element: <HowToBuyPage /> },
  { path: "/payment-security", element: <PaymentSecurityPage /> },
  { path: "/warranty-policy", element: <WarrantyPolicyPage /> },
  { path: "/warranty", element: <WarrantyLookupPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/showrooms", element: <ShowroomsPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/installment", element: <InstallmentPage /> },
  { path: "/loyalty", element: <LoyaltyPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/careers", element: <CareersPage /> },

  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },

  { path: "/products/:slug", element: <ProductDetails /> },
  { path: "/products", element: <ProductsCategory /> },

  { path: "/tools/metronome", element: <Metronome /> },
  { path: "/tools/chords", element: <ChordsPage /> },
  { path: "/tools/chords/:chordName", element: <ChordDetailPage /> },
  { path: "/tools/tuner", element: <TunerPage /> },

  { path: "/song-search", element: <SongSearchPage /> },
  { path: "/chatbot", element: <ChatbotPage /> },

  { path: "/forum", element: <ForumPage /> },
  { path: "/forum/thread/:threadId", element: <ForumThreadPage /> },
  { path: "/forum/post/:postId", element: <ForumThreadPage legacyParam="postId" /> },
  { path: "/u/:username", element: <UserProfilePage /> },

  { path: "/learn", element: <LearningDashboardPage /> },
  { path: "/courses", element: <CourseListPage /> },
  { path: "/courses/:courseId", element: <CourseDetailPage /> },

  { path: "/learning/*", element: <Navigate to="/learn" replace /> },
  { path: "/instructor/*", element: <Navigate to="/creator" replace /> },
];

export default publicRoutes;
