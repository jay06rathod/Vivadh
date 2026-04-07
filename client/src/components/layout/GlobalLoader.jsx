import { useState, useEffect } from 'react';

const GlobalLoader = ({ isLoading, children }) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer;
    
    if (isLoading) {
      // Wait 250ms before showing the loader. 
      // If isLoading turns false before 250ms, it cancels.
      timer = setTimeout(() => setShowLoader(true), 250);
    } else {
      setShowLoader(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading]); 

  return (
    <>
      {showLoader && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center">
          <div className="preloader">
            <div className="crack crack1"></div>
            <div className="crack crack2"></div>
            <div className="crack crack3"></div>
            <div className="crack crack4"></div>
            <div className="crack crack5"></div>
          </div>
        </div>
      )}
      <div style={{ opacity: showLoader ? 0 : 1, transition: 'opacity 0.2s' }}>
        {children}
      </div>
    </>
  );
};

export default GlobalLoader;