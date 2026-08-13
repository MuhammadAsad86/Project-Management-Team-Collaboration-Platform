import React from 'react';

const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;