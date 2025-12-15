import React from "react";

interface MainContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const MainContainer = ({
  children,
  title,
  className = "",
}: MainContainerProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-legacy-bg py-10 px-4">
      <div
        className={`w-full max-w-[1100px] bg-legacy-container rounded-xl shadow-lg p-8 md:p-10 ${className}`}
      >
        {title && (
          <h2 className="text-center text-2xl font-semibold text-legacy-text mb-8">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};
