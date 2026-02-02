
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LITERARY_POOL, VAN_GOGH_PAINTINGS } from './constants';
import { Quote, AuthorDetails } from './types';
import { fetchAuthorBio } from './services/geminiService';
import AuthorModal from './components/AuthorModal';

const SEEN_QUOTES_KEY = 'the_iced_book_seen_v1';
const SAVED_QUOTES_KEY = 'the_iced_book_saved_v1';

const App: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [currentBg, setCurrentBg] = useState(VAN_GOGH_PAINTINGS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorDetails, setAuthorDetails] = useState<AuthorDetails | null>(null);
  const [isBioLoading, setIsBioLoading] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Load seen
    const storedSeen = localStorage.getItem(SEEN_QUOTES_KEY);
    if (storedSeen) {
      try {
        const parsed = JSON.parse(storedSeen);
        if (Array.isArray(parsed)) seenIdsRef.current = new Set(parsed);
      } catch (e) {}
    }

    // Load saved
    const storedSaved = localStorage.getItem(SAVED_QUOTES_KEY);
    if (storedSaved) {
      try {
        const parsed = JSON.parse(storedSaved);
        if (Array.isArray(parsed)) setSavedQuotes(parsed);
      } catch (e) {}
    }

    getNextQuote();
  }, []);

  const saveSeenId = (id: string) => {
    seenIdsRef.current.add(id);
    localStorage.setItem(SEEN_QUOTES_KEY, JSON.stringify(Array.from(seenIdsRef.current)));
  };

  const getNextQuote = useCallback(async () => {
    setIsQuoteLoading(true);
    
    const bgIndex = Math.floor(Math.random() * VAN_GOGH_PAINTINGS.length);
    setCurrentBg(VAN_GOGH_PAINTINGS[bgIndex]);

    let availableQuotes = LITERARY_POOL.filter(q => !seenIdsRef.current.has(q.id));
    
    if (availableQuotes.length === 0) {
      seenIdsRef.current.clear();
      localStorage.removeItem(SEEN_QUOTES_KEY);
      availableQuotes = [...LITERARY_POOL];
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    const selected = availableQuotes[randomIndex];

    if (selected) {
      saveSeenId(selected.id);
      setTimeout(() => {
        setCurrentQuote(selected);
        setIsQuoteLoading(false);
      }, 300);
    }
  }, []);

  const handleAuthorClick = async () => {
    if (!currentQuote) return;
    
    setIsModalOpen(true);
    setIsBioLoading(true);
    setBioError(null);
    setAuthorDetails(null);

    try {
      // optimized bio service is now much faster
      const bio = await fetchAuthorBio(currentQuote.author);
      setAuthorDetails(bio);
    } catch (err) {
      setBioError("i'm sorry, i couldn't retrieve the biography at this moment.");
    } finally {
      setIsBioLoading(false);
    }
  };

  const toggleSaveQuote = () => {
    if (!currentQuote) return;
    const isSaved = savedQuotes.some(q => q.id === currentQuote.id);
    let newSaved: Quote[];
    if (isSaved) {
      newSaved = savedQuotes.filter(q => q.id !== currentQuote.id);
    } else {
      newSaved = [currentQuote, ...savedQuotes];
    }
    setSavedQuotes(newSaved);
    localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(newSaved));
  };

  const removeSavedQuote = (id: string) => {
    const newSaved = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(newSaved);
    localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(newSaved));
  };

  if (!currentQuote) return null;

  const isCurrentSaved = savedQuotes.some(q => q.id === currentQuote.id);

  return (
    <div className="min-h-screen relative flex flex-col items-center selection:bg-amber-100 overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out scale-110"
        style={{ backgroundImage: `url("${currentBg.url}")` }}
      />
      
      {/* Artistic Overlay */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-stone-900/40 via-transparent to-stone-900/60 pointer-events-none" />
      <div className="fixed inset-0 z-10 backdrop-blur-[2px] opacity-30 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-20 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="w-full max-w-7xl mx-auto px-8 py-10 flex justify-between items-center">
          <div className="group cursor-default">
            <h1 className="text-xs tracking-[0.5em] text-white font-bold drop-shadow-lg lowercase">
              the iced book
            </h1>
            <div className="h-[1px] w-full bg-white/20 mt-1 overflow-hidden">
               <div className="h-full w-0 group-hover:w-full bg-white transition-all duration-1000"></div>
            </div>
          </div>

          {/* Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <span className="text-[10px] tracking-[0.2em] lowercase opacity-0 group-hover:opacity-100 transition-opacity">saved</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {savedQuotes.length > 0 && (
              <span className="bg-white text-stone-900 text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center -ml-1">
                {savedQuotes.length}
              </span>
            )}
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-6 pb-48">
          <div className={`relative w-full transition-all duration-1000 transform ${isQuoteLoading ? 'opacity-0 translate-y-8 blur-sm' : 'opacity-100 translate-y-0 blur-0'}`}>
            
            <div className="bg-[#fdfcf8] p-12 md:p-20 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-l-[12px] border-stone-800 rounded-sm relative group overflow-hidden">
              {/* Paper Texture */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
              
              {/* Bookmark Toggle Icon */}
              <button 
                onClick={toggleSaveQuote}
                className={`absolute top-8 right-8 transition-all duration-300 z-30 ${isCurrentSaved ? 'text-amber-600 scale-110' : 'text-stone-300 hover:text-stone-400 hover:scale-105'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={isCurrentSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              <blockquote className="relative">
                <p className="font-serif text-2xl md:text-5xl text-stone-900 leading-[1.3] italic font-normal mb-16 lowercase">
                  “{currentQuote.text.toLowerCase()}”
                </p>

                <div className="flex flex-col items-end space-y-4">
                  <div className="h-px w-24 bg-stone-200"></div>
                  
                  <div className="text-right">
                    <button 
                      onClick={handleAuthorClick}
                      className="block text-stone-900 text-2xl font-serif hover:text-stone-500 transition-colors border-b border-stone-100 hover:border-stone-400 mb-1 lowercase"
                    >
                      {currentQuote.author.toLowerCase()}
                    </button>
                    
                    <cite className="not-italic text-stone-400 font-medium text-xs tracking-[0.2em] lowercase">
                      {currentQuote.book.toLowerCase()}
                    </cite>
                  </div>
                </div>
              </blockquote>
              
              <div className="absolute bottom-6 left-8 text-[10px] text-stone-300 font-mono tracking-tighter opacity-50 lowercase">
                lit-id: {currentQuote.id.toLowerCase()}
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 w-full z-30 flex flex-col items-center pb-8 pt-12 bg-gradient-to-t from-stone-900/90 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center gap-6">
            <button 
              onClick={() => getNextQuote()}
              disabled={isQuoteLoading}
              className={`flex items-center gap-4 text-white transition-all group px-10 py-5 rounded-full border border-white/20 hover:border-white/60 bg-black/50 hover:bg-black/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 ${isQuoteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-base tracking-[0.25em] font-bold lowercase">
                {isQuoteLoading ? 'gathering lines...' : 'next quote'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isQuoteLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-1000'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <div className="bg-black/30 backdrop-blur-xl px-8 py-2.5 rounded-full border border-white/5 cursor-default lowercase">
              <span className="text-white/60 text-[10px] font-bold tracking-[0.4em]">made by piyush for him</span>
            </div>
          </div>
        </div>

        {/* Bio Modal */}
        <AuthorModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          authorDetails={authorDetails}
          isLoading={isBioLoading}
          error={bioError}
        />

        {/* Saved Quotes Drawer Menu */}
        <div className={`fixed inset-0 z-50 transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
          <div className={`absolute inset-0 bg-stone-950/60 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)} />
          <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-stone-900 text-white shadow-2xl transition-transform duration-500 ease-out p-8 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-xs tracking-[0.5em] font-bold lowercase opacity-50">saved lines</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-white/40 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-12">
              {savedQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-sm tracking-widest lowercase">no echoes saved yet</p>
                </div>
              ) : (
                savedQuotes.map((q) => (
                  <div key={q.id} className="group relative border-b border-white/5 pb-8">
                    <button 
                      onClick={() => removeSavedQuote(q.id)}
                      className="absolute -top-1 -right-2 text-white/0 group-hover:text-red-400 transition-all p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="font-serif italic text-lg text-white/90 mb-4 leading-relaxed lowercase cursor-pointer hover:text-white" onClick={() => {
                      setCurrentQuote(q);
                      setIsMenuOpen(false);
                    }}>
                      “{q.text.toLowerCase()}”
                    </p>
                    <div className="flex justify-between items-center text-[10px] tracking-widest lowercase text-white/40">
                      <span>{q.author}</span>
                      <span className="opacity-50">{q.book}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] tracking-[0.3em] opacity-30 lowercase">the iced book collection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
