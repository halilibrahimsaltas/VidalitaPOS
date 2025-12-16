import Navbar from './Navbar';
import Sidebar from './Sidebar';
import POSNavbar from './POSNavbar';

const PageLayout = ({ children, title, description, actions, hideSidebar = false, fullScreen = false, showPOSNavbar = false }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      {showPOSNavbar && <POSNavbar />}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!hideSidebar && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar />
          </div>
        )}
        
        {/* Main Content */}
        <main className={`flex-1 ${fullScreen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {fullScreen ? (
            <div className="h-full">
              {children}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {(title || actions) && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 truncate">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-gray-600 truncate">
                        {description}
                      </p>
                    )}
                  </div>
                  {actions && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {actions}
                    </div>
                  )}
                </div>
              )}
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;

