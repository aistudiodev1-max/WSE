/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Menu, X, Star } from 'lucide-react';
import { useAuthStore } from '../features/auth/useAuthStore';
import { useUIStore } from '../store/useUIStore';

import Image from 'next/image';

const MAIN_APP_ORIGIN = 'https://app.wisdomebooksclub.com'; 
const WEBSITE_ORIGIN = 'https://www.wisdomebooksclub.com';

const STORAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/YOUR_FIREBASE_STORAGE_BUCKET_HERE/o/'; // Or wherever the avatars are stored, fallback given below

export const Header: React.FC = () => {
  const { appUser } = useAuthStore();
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentTab, setCurrentTab] = useState('/wisdom-study-engine');

  const isAuthenticated = !!appUser;
  // Assuming anyone here is an institutional user having WSE access
  const isInstitutionalUser = true; 

  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  // Close sidebar on desktop layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && showSidebar) {
        setShowSidebar(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSidebar]);

  return (
    <>
      {/* Mobile Sidebar */}
      {showSidebar && (
        <div 
          className="fixed left-0 top-[85px] w-screen h-[calc(100vh-85px)] z-[1000] bg-[#111] p-5 md:hidden flex flex-col gap-2 overflow-y-auto"
        >
          <a
            href={isAuthenticated ? `${MAIN_APP_ORIGIN}/dashboard` : WEBSITE_ORIGIN}
            className="py-3 text-white font-[family-name:var(--font-poppins)] font-semibold text-lg no-underline hover:text-[#ed8f10] transition-colors"
          >
            Home
          </a>
          <a
            href={`${WEBSITE_ORIGIN}/pearls-of-wisdom`}
            className="py-3 text-white font-sans font-semibold text-lg no-underline hover:text-[#ed8f10] transition-colors"
          >
            Pearls of Wisdom
          </a>
          <a
            href={`${MAIN_APP_ORIGIN}/book-library`}
            className="py-3 text-white font-sans font-semibold text-lg no-underline hover:text-[#ed8f10] transition-colors"
          >
            eBook Library
          </a>
          <a
            href={`${MAIN_APP_ORIGIN}/bible-study-suite`}
            className="py-3 text-white font-sans font-semibold text-lg no-underline hover:text-[#ed8f10] transition-colors"
          >
            Bible Study Suite
          </a>
          {isAuthenticated && isInstitutionalUser && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); toggleSidebar(); }}
              className="py-3 text-[#ed8f10] font-sans font-semibold text-lg no-underline"
            >
              Wisdom Study Engine
            </a>
          )}
          {isAuthenticated && (
            <a
              href={`${MAIN_APP_ORIGIN}/my-library`}
              className="py-3 text-white font-sans font-semibold text-lg no-underline hover:text-[#ed8f10] transition-colors"
            >
              My Library
            </a>
          )}
          {(!isAuthenticated || (appUser?.membership_level !== 'Study Essentials' && appUser?.membership_level !== 'Bible Study Plus')) && (
            <a
              href={`${MAIN_APP_ORIGIN}/pricing`}
              className="py-3 text-white font-sans font-semibold text-lg no-underline hover:text-[#ed8f10] transition-colors"
            >
              Subscribe
            </a>
          )}
          <a
            href={isAuthenticated ? `${MAIN_APP_ORIGIN}/profile` : `${MAIN_APP_ORIGIN}/login`}
            className="py-3 text-white font-sans font-semibold text-lg no-underline hover:text-[#ed8f10] transition-colors"
          >
            {isAuthenticated ? 'Account' : 'Login'}
          </a>
        </div>
      )}

      {/* Main Navbar */}
      <header className="z-[999] w-full min-h-[85px] bg-[#111] border-b border-[#ed8f10] text-white flex flex-col justify-center px-4 md:px-10 shrink-0">
        <div className="flex flex-1 items-center justify-between gap-4 h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <a
              href={isAuthenticated ? `${MAIN_APP_ORIGIN}/dashboard` : WEBSITE_ORIGIN}
              className="flex items-center gap-2 cursor-pointer no-underline group"
            >
              <Image
                src={'/images/Logo_2.png'}
                width={80}
                height={80}
                className="w-[33px] h-[40px] md:w-[80px] md:h-[80px] object-cover"
                alt="logo"
                referrerPolicy="no-referrer"
              />
              <div className="text-white font-sans font-bold text-[18px] whitespace-nowrap">
                Wisdom{' '}
                <span className="text-[#ed8f10] font-sans">
                  eBooks{' '}
                </span>
                Club
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-start gap-2 lg:gap-3 bg-transparent">
            <a
              href={isAuthenticated ? `${MAIN_APP_ORIGIN}/dashboard` : WEBSITE_ORIGIN}
              className="py-2 px-2 lg:px-3 text-white font-sans font-semibold text-sm lg:text-base hover:text-[#ed8f10] whitespace-nowrap transition-colors no-underline flex justify-center items-center h-full"
            >
              Home
            </a>

            <a
              href={`${WEBSITE_ORIGIN}/pearls-of-wisdom`}
              className="py-2 px-2 lg:px-3 text-white font-sans font-semibold text-sm lg:text-base hover:text-[#ed8f10] whitespace-nowrap transition-colors no-underline flex justify-center items-center h-full"
            >
              Pearls of Wisdom
            </a>

            <a
              href={`${MAIN_APP_ORIGIN}/book-library`}
              className="py-2 px-2 lg:px-3 text-white font-sans font-semibold text-sm lg:text-base hover:text-[#ed8f10] whitespace-nowrap transition-colors no-underline flex justify-center items-center h-full"
            >
              eBook Library
            </a>

            <a
              href={`${MAIN_APP_ORIGIN}/bible-study-suite`}
              className="py-2 px-2 lg:px-3 text-white font-sans font-semibold text-sm lg:text-base hover:text-[#ed8f10] whitespace-nowrap transition-colors no-underline flex justify-center items-center h-full"
            >
              Bible Study Suite
            </a>

            {isAuthenticated && isInstitutionalUser && (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); }}
                className="py-2 px-2 lg:px-3 text-[#ed8f10] font-sans font-semibold text-sm lg:text-base whitespace-nowrap no-underline flex justify-center items-center h-full"
              >
                Wisdom Study Engine
              </a>
            )}

            {isAuthenticated && (
              <a
                href={`${MAIN_APP_ORIGIN}/my-library`}
                className="py-2 px-2 lg:px-3 text-white font-sans font-semibold text-sm lg:text-base hover:text-[#ed8f10] whitespace-nowrap transition-colors no-underline flex justify-center items-center h-full"
              >
                My Library
              </a>
            )}

            <div className="flex-1" /> {/* Spacer */}

            {(!isAuthenticated || (appUser?.membership_level !== 'Study Essentials' && appUser?.membership_level !== 'Bible Study Plus')) && (
              <a
                href={`${MAIN_APP_ORIGIN}/pricing`}
                className="bg-[#ed8f10] hover:bg-[#fca311] py-2 px-3 lg:px-4 rounded-md text-white font-sans font-semibold text-sm lg:text-base whitespace-nowrap transition-colors no-underline flex justify-center items-center"
              >
                Subscribe
              </a>
            )}

            <a
              href={isAuthenticated ? `${MAIN_APP_ORIGIN}/profile` : `${MAIN_APP_ORIGIN}/login`}
              className={`py-${isAuthenticated ? '1' : '2'} px-2 lg:px-3 text-white hover:text-[#ed8f10] font-sans font-semibold text-sm lg:text-base whitespace-nowrap transition-colors no-underline flex items-center justify-center gap-5  h-full`}
            >
              <span>{isAuthenticated ? 'Account' : 'Login'}</span>
              
              {isAuthenticated && (
                <div className="relative flex items-center justify-center">
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appUser?.user_name || 'User')}&background=333&color=fff`}
                    width={35}
                    height={35}
                    className="h-[35px] w-[35px] rounded-full object-cover self-center"
                    alt="User avatar"
                    referrerPolicy="no-referrer"
                  />
                  {(appUser?.membership_level === 'Study Essentials' || appUser?.membership_level === 'Bible Study Plus') && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] flex items-center justify-center">
                      {appUser?.membership_level === 'Study Essentials' ? (
                        <Star size={10} color="#FBC02D" fill="#FBC02D" />
                      ) : (
                        <Star size={10} color="#5A708C" fill="#5A708C" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 border-transparent focus:border-[#ed8f10] focus:border focus:rounded-md transition-all outline-none"
            >
              {showSidebar ? <X color="#ffffff" size={24} /> : <Menu color="#ffffff" size={24} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
