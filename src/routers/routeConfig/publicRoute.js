// routeConfig/publicRoute.jsx
import Home from "../../views/pages/HomePage/HomePage";
import Register from "../../views/pages/RegisterPage/RegisterPage";
import Login from "../../views/pages/LoginPage/LoginPage";
import ForgotPassword from "../../views/pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPassword from "../../views/pages/ResetPasswordPage/ResetPasswordPage";
import ProductDetails from "../../views/pages/ProductDetailsPage/ProductDetailsPage";
import ViewCategory from "../../views/pages/CategoryPage/CategoryPage";
import Cart from "../../views/pages/CartPage/CartPage";
import Checkout from "../../views/pages/CheckoutPage/CheckoutPage";
import CheckOutHistory from "../../views/pages/CheckOutHistory/CheckOutHistory";
import ProductsCategory from "../../views/pages/ProductsPage/ProductsPage";
import Account from "../../views/pages/AccountPage/AccountPage";
import Metronome from "../../views/pages/ToolsPage/MetronomePage/Metronome";
import Songs from "../../views/pages/SongsPage/SongsPage";
import ChordsPage from "../../views/pages/ToolsPage/ChordsPage/ChordsPage";
import SongDetails from "../../views/pages/songDetails/SongDetails";
import FavoritesPage from "../../views/pages/FavoritesPage/FavoritesPage";
import TunerPage from "../../views/pages/TunerPage/TunerPage";
import AdminPage from "../../views/pages/AdminPage/AdminPage";
import AccountEditPage from "../../views/pages/AccountPage/AccountEditPage/AccountEditPage";
import AddressPage from "../../views/pages/AddressPage/AddressPage";
import ChordDetailPage from "../../views/pages/ChordDetailPage";
import ChordPracticePage from "../../views/pages/ToolsPage/ChordPracticePage/ChordPracticePage";
import ChordPracticeDetailPage from "../../views/pages/ToolsPage/ChordPracticePage/ChordPracticeDetailPage";
import RhythmPracticePage from "../../views/pages/ToolsPage/ChordPracticePage/RhythmPracticePage";
import FingerPracticePage from "../../views/pages/ToolsPage/FingerPracticePage/FingerPracticePage";
import LeftHandPracticePage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHandPracticePage";
import RightHandPracticePage from "../../views/pages/ToolsPage/FingerPracticePage/RightHandPracticePage";
import IndependencePage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHand/IndependencePage";
import LegatoPage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHand/LegatoPage";
import LegatoPracticePage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHand/LegatoPracticePage";
import StretchShiftPage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHand/StretchShiftPage";
import BarrePage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHand/BarrePage";
import ArpeggioPage from "../../views/pages/ToolsPage/FingerPracticePage/RightHand/ArpeggioPage";
import StrummingPage from "../../views/pages/ToolsPage/FingerPracticePage/RightHand/StrummingPage";
import ProtectedNotificationCenter from "../../views/pages/NotificationCenter/ProtectedNotificationCenter";
import ChatbotPage from "../../views/pages/ChatbotPage/ChatbotPage";
import AuthCallback from "../../views/pages/AuthCallback/AuthCallback";
import ForumPage from "../../views/pages/ForumPage/ForumPage";
import FriendRequestsPage from "../../views/pages/FriendsPage/FriendRequestsPage";
import FriendsListPage from "../../views/pages/FriendsPage/FriendsListPage";
import ProfilePage from "../../views/pages/ProfilePage/ProfilePage";
import SearchPage from "../../views/pages/SearchPage/SearchPage";
import ForumThreadPage from "../../views/pages/ForumThreadPage/ForumThreadPage";
import UserProfilePage from "../../views/pages/UserProfilePage/UserProfilePage";
import { Navigate } from "react-router-dom";
import LearningDashboardPage from "../../views/pages/courses/LearningDashboardPage";
import CourseListPage from "../../views/pages/courses/CourseListPage";
import CourseDetailPage from "../../views/pages/courses/CourseDetailPage";
import LessonPlayerPage from "../../views/pages/courses/LessonPlayerPage";
import PracticeRoutinePage from "../../views/pages/courses/PracticeRoutinePage";
import ChallengeSongPage from "../../views/pages/courses/ChallengeSongPage";
import ModuleCompletePage from "../../views/pages/courses/ModuleCompletePage";
import QuizPage from "../../views/pages/courses/QuizPage";
import CreatorDashboardPage from "../../views/pages/creator/CreatorDashboardPage";
import CreatorCourseNewPage from "../../views/pages/creator/CreatorCourseNewPage";
import CreatorCourseEditPage from "../../views/pages/creator/CreatorCourseEditPage";
import SongSearchPage from "../../views/pages/SongSearchPage/SongSearchPage";
import CompareTwoSongsPage from "../../views/pages/ToolsPage/CompareTwoSongsPage/CompareTwoSongsPage";
import PrivacyPolicyPage from "../../views/pages/PrivacyPolicyPage/PrivacyPolicyPage";
import PaymentResultPage from "../../views/pages/PaymentResultPage/PaymentResultPage";

const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/products/:slug", element: <ProductDetails /> },
  { path: "/products", element: <ProductsCategory /> },
  { path: "/category/:slug", element: <ViewCategory /> },
  { path: "/cart", element: <Cart /> },
  { path: "/favorites", element: <FavoritesPage /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/checkout-history", element: <CheckOutHistory /> },
  { path: "/payment-result", element: <PaymentResultPage /> },
  { path: "/account", element: <Account /> },
  { path: "/addresses", element: <AddressPage /> },
  { path: "/tools/metronome", element: <Metronome /> },
  { path: "/tools/chords", element: <ChordsPage/> },
  { path: "/tools/chords/:chordName", element: <ChordDetailPage /> },
  { path: "/tools/chord-practice", element: <ChordPracticePage /> },
  { path: "/tools/chord-practice/:id", element: <ChordPracticeDetailPage /> },
  { path: "/tools/chord-practice/rhythm", element: <RhythmPracticePage /> },
  { path: "/tools/finger-practice", element: <FingerPracticePage /> },
  { path: "/tools/finger-practice/left", element: <LeftHandPracticePage /> },
  { path: "/tools/finger-practice/left/independence", element: <IndependencePage /> },
  { path: "/tools/finger-practice/left/legato", element: <LegatoPage /> },
  { path: "/tools/finger-practice/left/legato/practice/:lessonId", element: <LegatoPracticePage /> },
  { path: "/tools/finger-practice/left/stretch-shift", element: <StretchShiftPage /> },
  { path: "/tools/finger-practice/left/barre", element: <BarrePage /> },
  { path: "/tools/finger-practice/right", element: <RightHandPracticePage /> },
  { path: "/tools/finger-practice/right/arpeggio", element: <ArpeggioPage /> },
  { path: "/tools/finger-practice/right/strumming", element: <StrummingPage /> },
  { path: "/tools/tuner", element: <TunerPage /> },
  { path: "/tools/ai-guitar-practice", element: <CompareTwoSongsPage /> },
  { path: "/tools/compare-song", element: <Navigate to="/tools/ai-guitar-practice" replace /> },
  { path: "/admin/*", element: <AdminPage /> },
  { path: "/songs", element: <Songs />},
  { path: "/songs/:slug", element: <SongDetails /> },
  { path: "/song-search", element: <SongSearchPage /> },
  { path: "/account/edit", element: <AccountEditPage /> },
  { path: "/notifications", element: <ProtectedNotificationCenter /> },
  { path: "/chatbot", element: <ChatbotPage /> },
  { path: "/forum", element: <ForumPage /> },
  { path: "/forum/thread/:threadId", element: <ForumThreadPage /> },
  { path: "/forum/post/:postId", element: <ForumThreadPage legacyParam="postId" /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/u/:username", element: <UserProfilePage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/friends", element: <FriendsListPage /> },
  { path: "/friends/requests", element: <FriendRequestsPage /> },

  { path: "/learn", element: <LearningDashboardPage /> },
  { path: "/courses", element: <CourseListPage /> },
  { path: "/courses/:courseId", element: <CourseDetailPage /> },
  { path: "/courses/:courseId/lesson/:lessonId", element: <LessonPlayerPage /> },
  { path: "/courses/:courseId/module/:moduleId/practice", element: <PracticeRoutinePage /> },
  { path: "/courses/:courseId/module/:moduleId/challenge", element: <ChallengeSongPage /> },
  { path: "/courses/:courseId/module/:moduleId/complete", element: <ModuleCompletePage /> },
  { path: "/quiz/:quizId", element: <QuizPage /> },

  { path: "/creator", element: <CreatorDashboardPage /> },
  { path: "/creator/course/new", element: <CreatorCourseNewPage /> },
  { path: "/creator/course/:courseId/edit", element: <CreatorCourseEditPage /> },

  { path: "/learning/*", element: <Navigate to="/learn" replace /> },
  { path: "/instructor/*", element: <Navigate to="/creator" replace /> },
];

export default publicRoutes;
