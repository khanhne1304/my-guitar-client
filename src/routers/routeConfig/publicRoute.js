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
import ProductsCategory from "../../views/pages/ProductsPage/ProductsPage"; // trang liệt kê/tìm kiếm sản phẩm
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
import LearningPathOnboardingPage from "../../views/pages/LearningPathPage/LearningPathOnboardingPage";
import LearningRoadmapPage from "../../views/pages/LearningPathPage/LearningRoadmapPage";
import LearningLessonPage from "../../views/pages/LearningPathPage/LearningLessonPage";
const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/products/:slug", element: <ProductDetails /> }, // chi tiết sản phẩm
  { path: "/products", element: <ProductsCategory /> },     // tìm kiếm/lọc sản phẩm theo ?q=&category=&brand=
  { path: "/category/:slug", element: <ViewCategory /> },   // list sản phẩm theo :slug
  { path: "/cart", element: <Cart /> },
  { path: "/favorites", element: <FavoritesPage /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/checkout-history", element: <CheckOutHistory /> },

  // { path: "/productsCategory", element: <ProductsCategory /> }, // (tuỳ chọn) alias cũ, có thể bỏ
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
  { path: "/admin/*", element: <AdminPage /> },
  { path: "/songs", element: <Songs />},
  { path: "/songs/:slug", element: <SongDetails /> },
  { path: "/account/edit", element: <AccountEditPage /> },
  { path: "/notifications", element: <ProtectedNotificationCenter /> },
  { path: "/chatbot", element: <ChatbotPage /> },
  { path: "/forum", element: <ForumPage /> },
  // New structured forum route
  { path: "/forum/thread/:threadId", element: <ForumThreadPage /> },
  // Backward compatibility: old "post" route now resolves to the new thread page
  { path: "/forum/post/:postId", element: <ForumThreadPage legacyParam="postId" /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/u/:username", element: <UserProfilePage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/friends", element: <FriendsListPage /> },
  { path: "/friends/requests", element: <FriendRequestsPage /> },
  { path: "/learning/onboarding", element: <LearningPathOnboardingPage /> },
  { path: "/learning/roadmap", element: <LearningRoadmapPage /> },
  { path: "/learning/lesson/:lessonId", element: <LearningLessonPage /> },
];

export default publicRoutes;
