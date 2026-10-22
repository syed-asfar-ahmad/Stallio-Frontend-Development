import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLoading from './components/admin/AdminLoading';
import { useReferralCapture } from './lib/referral';

const ReferralRedirect = lazy(() => import('./pages/ReferralRedirect'));

// Affiliate Platform
const RequireAffiliate = lazy(() => import('./affiliate/RequireAffiliate'));
const AffiliateLayout = lazy(() => import('./affiliate/AffiliateLayout'));
const AffiliateSignup = lazy(() => import('./affiliate/pages/AffiliateSignup'));
const AffiliateVerifyEmail = lazy(() => import('./affiliate/pages/AffiliateVerifyEmail'));
const AffiliateLogin = lazy(() => import('./affiliate/pages/AffiliateLogin'));
const AffiliateForgotPassword = lazy(() => import('./affiliate/pages/AffiliateForgotPassword'));
const AffiliateResetPassword = lazy(() => import('./affiliate/pages/AffiliateResetPassword'));
const AffiliateDashboardOverview = lazy(() => import('./affiliate/pages/DashboardOverview'));
const AffiliateReferrals = lazy(() => import('./affiliate/pages/Referrals'));
const AffiliateLinkQrStudio = lazy(() => import('./affiliate/pages/LinkQrStudio'));
const AffiliateEarnings = lazy(() => import('./affiliate/pages/Earnings'));
const AffiliatePayouts = lazy(() => import('./affiliate/pages/Payouts'));
const AffiliateSettings = lazy(() => import('./affiliate/pages/Settings'));

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Contact = lazy(() => import('./pages/Contact'));
const Careers = lazy(() => import('./pages/Careers'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ForgotPasswordCheckEmail = lazy(() => import('./pages/ForgotPasswordCheckEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const DashboardProducts = lazy(() => import('./pages/DashboardProducts'));
const DashboardOrders = lazy(() => import('./pages/DashboardOrders'));
const DashboardSettings = lazy(() => import('./pages/DashboardSettings'));
const DashboardAbout = lazy(() => import('./pages/DashboardAbout'));
const DashboardCategories = lazy(() => import('./pages/DashboardCategories'));
const DashboardContactPage = lazy(() => import('./pages/DashboardContactPage'));
const DashboardMessages = lazy(() => import('./pages/DashboardMessages'));
const DashboardSupportChat = lazy(() => import('./pages/DashboardSupportChat'));
const DashboardFooter = lazy(() => import('./pages/DashboardFooter'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const DashboardDelivery = lazy(() => import('./pages/DashboardDelivery'));
const DashboardCoupons = lazy(() => import('./pages/DashboardCoupons'));
const DashboardThemes = lazy(() => import('./pages/DashboardThemes'));
const DashboardNotifications = lazy(() => import('./pages/DashboardNotifications'));
const Shop = lazy(() => import('./pages/Shop'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminSellerDetail = lazy(() => import('./pages/admin/AdminSellerDetail'));
const AdminShops = lazy(() => import('./pages/admin/AdminShops'));
const AdminShopEdit = lazy(() => import('./pages/admin/AdminShopEdit'));
const AdminSubscriptions = lazy(() => import('./pages/admin/AdminSubscriptions'));
const AdminSupportChat = lazy(() => import('./pages/admin/AdminSupportChat'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminAffiliates = lazy(() => import('./pages/admin/AdminAffiliates'));
const AdminAffiliateDetail = lazy(() => import('./pages/admin/AdminAffiliateDetail'));
const AdminReferrals = lazy(() => import('./pages/admin/AdminReferrals'));
const AdminCommissions = lazy(() => import('./pages/admin/AdminCommissions'));
const AdminPayouts = lazy(() => import('./pages/admin/AdminPayouts'));
const AdminAffiliateSettings = lazy(() => import('./pages/admin/AdminAffiliateSettings'));
// const DashboardThemes = lazy(() => import('./pages/DashboardThemes'));
function LegacyShopRedirect() {
  const { pathname, search, hash } = useLocation();
  const stripped = pathname.replace(/^\/shop\/?/, '');
  if (!stripped) return <Navigate to="/" replace />;
  return <Navigate to={`/${stripped}${search}${hash}`} replace />;
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-zinc-950">
      <AdminLoading />
    </div>
  );
}

export default function App() {
  useReferralCapture();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/check-email" element={<ForgotPasswordCheckEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminSellerDetail />} />
        <Route path="/admin/shops" element={<AdminShops />} />
        <Route path="/admin/shops/:id" element={<AdminShopEdit />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/support-chat" element={<AdminSupportChat />} />
        <Route path="/admin/support-chat/:sellerId" element={<AdminSupportChat />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/affiliates" element={<AdminAffiliates />} />
        <Route path="/admin/affiliates/:id" element={<AdminAffiliateDetail />} />
        <Route path="/admin/referrals" element={<AdminReferrals />} />
        <Route path="/admin/commissions" element={<AdminCommissions />} />
        <Route path="/admin/payouts" element={<AdminPayouts />} />
        <Route path="/admin/affiliate-settings" element={<AdminAffiliateSettings />} />
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/dashboard/home" element={<DashboardHome />} />
        <Route path="/dashboard/products" element={<DashboardProducts />} />
        <Route path="/dashboard/orders" element={<DashboardOrders />} />
        <Route path="/dashboard/coupons" element={<DashboardCoupons />} />
        <Route path="/dashboard/settings" element={<DashboardSettings />} />
        <Route
          path="/dashboard/about"
          element={
            <ErrorBoundary>
              <DashboardAbout />
            </ErrorBoundary>
          }
        />
        <Route path="/dashboard/categories" element={<DashboardCategories />} />
        <Route path="/dashboard/contact" element={<DashboardContactPage />} />
        <Route path="/dashboard/messages" element={<DashboardMessages />} />
        <Route path="/dashboard/support" element={<DashboardSupportChat />} />
        <Route path="/dashboard/notifications" element={<DashboardNotifications />} />
        <Route path="/dashboard/footer" element={<DashboardFooter />} />
        <Route path="/dashboard/themes" element={<DashboardThemes />} />
        <Route path="/dashboard/delivery" element={<DashboardDelivery />} />
        <Route path="/dashboard/themes" element={<DashboardThemes />} />
        <Route path="/shop/*" element={<LegacyShopRedirect />} />
        <Route path="/r/:code" element={<ReferralRedirect />} />

        {/* Affiliate Public & Auth Routes */}
        <Route path="/affiliate/signup" element={<AffiliateSignup />} />
        <Route path="/affiliate/verify-email" element={<AffiliateVerifyEmail />} />
        <Route path="/affiliate/login" element={<AffiliateLogin />} />
        <Route path="/affiliate/forgot-password" element={<AffiliateForgotPassword />} />
        <Route path="/affiliate/reset-password" element={<AffiliateResetPassword />} />

        {/* Affiliate Protected Dashboard */}
        <Route
          path="/affiliate/dashboard"
          element={
            <RequireAffiliate>
              <AffiliateLayout />
            </RequireAffiliate>
          }
        >
          <Route index element={<AffiliateDashboardOverview />} />
          <Route path="referrals" element={<AffiliateReferrals />} />
          <Route path="link" element={<AffiliateLinkQrStudio />} />
          <Route path="earnings" element={<AffiliateEarnings />} />
          <Route path="payouts" element={<AffiliatePayouts />} />
          <Route path="settings" element={<AffiliateSettings />} />
        </Route>

        <Route path="/:username/product/:productId" element={<Shop />} />
        <Route path="/:username/category/:categorySlug" element={<Shop />} />
        <Route path="/:username/categories" element={<Shop />} />
        <Route path="/:username/products" element={<Shop />} />
        <Route path="/:username/contact" element={<Shop />} />
        <Route path="/:username/about" element={<Shop />} />
        <Route path="/:username/refund" element={<Shop />} />
        <Route path="/:username" element={<Shop />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
