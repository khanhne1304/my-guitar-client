import { Navigate } from "react-router-dom";
import Cart from "../../views/pages/CartPage/CartPage";
import Checkout from "../../views/pages/CheckoutPage/CheckoutPage";
import CheckOutHistory from "../../views/pages/CheckOutHistory/CheckOutHistory";
import FavoritesPage from "../../views/pages/FavoritesPage/FavoritesPage";
import PaymentResultPage from "../../views/pages/PaymentResultPage/PaymentResultPage";
import Account from "../../views/pages/AccountPage/AccountPage";
import AccountEditPage from "../../views/pages/AccountPage/AccountEditPage/AccountEditPage";
import AddressPage from "../../views/pages/AddressPage/AddressPage";
import ChordPracticePage from "../../views/pages/ToolsPage/ChordPracticePage/ChordPracticePage";
import ChordPracticeDetailPage from "../../views/pages/ToolsPage/ChordPracticePage/ChordPracticeDetailPage";
import RhythmPracticePage from "../../views/pages/ToolsPage/ChordPracticePage/RhythmPracticePage";
import LeftHandPracticePage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHandPracticePage";
import RightHandPracticePage from "../../views/pages/ToolsPage/FingerPracticePage/RightHandPracticePage";
import IndependencePage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHand/IndependencePage";
import LegatoPage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHand/LegatoPage";
import LegatoPracticePage from "../../views/pages/ToolsPage/FingerPracticePage/LeftHand/LegatoPracticePage";
import ArpeggioPage from "../../views/pages/ToolsPage/FingerPracticePage/RightHand/ArpeggioPage";
import StrummingPage from "../../views/pages/ToolsPage/FingerPracticePage/RightHand/StrummingPage";
import CompareTwoSongsPage from "../../views/pages/ToolsPage/CompareTwoSongsPage/CompareTwoSongsPage";
import ProfilePage from "../../views/pages/ProfilePage/ProfilePage";
import FriendsListPage from "../../views/pages/FriendsPage/FriendsListPage";
import FriendRequestsPage from "../../views/pages/FriendsPage/FriendRequestsPage";
import SearchPage from "../../views/pages/SearchPage/SearchPage";
import NotificationCenter from "../../views/pages/NotificationCenter/NotificationCenter";
import MessengerPage from "../../views/pages/MessengerPage/MessengerPage";
import LessonPlayerPage from "../../views/pages/courses/LessonPlayerPage";
import PracticeRoutinePage from "../../views/pages/courses/PracticeRoutinePage";
import ChallengeSongPage from "../../views/pages/courses/ChallengeSongPage";
import ModuleCompletePage from "../../views/pages/courses/ModuleCompletePage";
import QuizPage from "../../views/pages/courses/QuizPage";
import CreatorDashboardPage from "../../views/pages/creator/CreatorDashboardPage";
import CreatorCourseNewPage from "../../views/pages/creator/CreatorCourseNewPage";
import CreatorCourseEditPage from "../../views/pages/creator/CreatorCourseEditPage";

export const socialPrivateRoutes = [
  { path: "/profile", element: <ProfilePage embedded /> },
  { path: "/friends", element: <FriendsListPage embedded /> },
  { path: "/friends/requests", element: <FriendRequestsPage embedded /> },
  { path: "/messenger", element: <MessengerPage /> },
  { path: "/search", element: <SearchPage embedded /> },
  { path: "/notifications", element: <NotificationCenter /> },
];

const privateRoutes = [
  { path: "/cart", element: <Cart /> },
  { path: "/favorites", element: <FavoritesPage /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/checkout-history", element: <CheckOutHistory /> },
  { path: "/payment-result", element: <PaymentResultPage /> },

  { path: "/account", element: <Account /> },
  { path: "/account/edit", element: <AccountEditPage /> },
  { path: "/addresses", element: <AddressPage /> },

  { path: "/tools/chord-practice", element: <ChordPracticePage /> },
  { path: "/tools/chord-practice/:id", element: <ChordPracticeDetailPage /> },
  { path: "/tools/chord-practice/rhythm", element: <RhythmPracticePage /> },
  { path: "/tools/finger-practice", element: <Navigate to="/tools/finger-practice/left/independence" replace /> },
  { path: "/tools/finger-practice/left", element: <LeftHandPracticePage /> },
  { path: "/tools/finger-practice/left/independence", element: <IndependencePage /> },
  { path: "/tools/finger-practice/left/legato", element: <LegatoPage /> },
  { path: "/tools/finger-practice/left/legato/practice/:lessonId", element: <LegatoPracticePage /> },
  { path: "/tools/finger-practice/right", element: <RightHandPracticePage /> },
  { path: "/tools/finger-practice/right/arpeggio", element: <ArpeggioPage /> },
  { path: "/tools/finger-practice/right/strumming", element: <StrummingPage /> },
  { path: "/tools/ai-guitar-practice", element: <CompareTwoSongsPage /> },
  { path: "/tools/compare-song", element: <Navigate to="/tools/ai-guitar-practice" replace /> },

  { path: "/courses/:courseId/lesson/:lessonId", element: <LessonPlayerPage /> },
  { path: "/courses/:courseId/module/:moduleId/practice", element: <PracticeRoutinePage /> },
  { path: "/courses/:courseId/module/:moduleId/challenge", element: <ChallengeSongPage /> },
  { path: "/courses/:courseId/module/:moduleId/complete", element: <ModuleCompletePage /> },
  { path: "/quiz/:quizId", element: <QuizPage /> },

  { path: "/creator", element: <CreatorDashboardPage /> },
  { path: "/creator/course/new", element: <CreatorCourseNewPage /> },
  { path: "/creator/course/:courseId/edit", element: <CreatorCourseEditPage /> },
];

export default privateRoutes;
