
import React from 'react';
import { AuthorDetails } from '../types';
import Loader from './Loader';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorDetails: AuthorDetails | null;
  isLoading: boolean;
  error: string | null;
}

const AuthorModal: React.FC<AuthorModalProps> = ({ 
  isOpen, 
  onClose, 
  authorDetails, 
  isLoading, 
  error 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-2xl font-serif text-stone-900">
            {isLoading ? 'about the author' : authorDetails?.name?.toLowerCase()}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 text-stone-700 leading-relaxed">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error.toLowerCase()}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-stone-100 rounded-full hover:bg-stone-200"
              >
                close
              </button>
            </div>
          ) : authorDetails ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="whitespace-pre-wrap font-light text-lg mb-8">
                {authorDetails.biography.toLowerCase()}
              </div>
              
              {authorDetails.sources.length > 0 && (
                <div className="mt-8 pt-8 border-t border-stone-100">
                  <h4 className="text-sm font-semibold text-stone-400 tracking-widest mb-4">references</h4>
                  <ul className="space-y-2">
                    {authorDetails.sources.map((source, idx) => (
                      <li key={idx}>
                        <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-stone-600 hover:text-stone-900 hover:underline flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {source.title.toLowerCase()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AuthorModal;
