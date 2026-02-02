
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
      <p className="mt-4 text-stone-500 font-light italic">gathering ink and paper...</p>
    </div>
  );
};

export default Loader;
