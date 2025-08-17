import { Outlet, useLocation, useParams } from "react-router-dom";
import Header from "./Header";
import MobileTabBar from "./MobileTabBar";

const AppLayout = () => {
  const location = useLocation();
  const params = useParams();
  
  const isProjectPage = location.pathname.startsWith('/project/') && params.id;
  const isAuthPage = location.pathname.startsWith('/auth');
  const isLandingPage = location.pathname === '/';

  // Don't show layout for auth pages
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {isProjectPage && <MobileTabBar projectId={params.id} />}
    </div>
  );
};

export default AppLayout;