import Navbar from './Navbar';

const PageLayout = ({ children, title, description, actions }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      </main>
    </div>
  );
};

export default PageLayout;

