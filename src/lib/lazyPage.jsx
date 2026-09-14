import React, { Suspense } from 'react';

const RouteLoading = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

export const lazyPage = (importer) => {
  const Component = React.lazy(importer);

  return function LazyPage(props) {
    return (
      <Suspense fallback={<RouteLoading />}>
        <Component {...props} />
      </Suspense>
    );
  };
};
