'use client';

import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import MainLayout from '../mainlayout';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

import Image from 'next/image';
import github from '../../../../public/assets/github.svg';
import youtube from '../../../../public/assets/youtube.svg';
import linkedin from '../../../../public/assets/linkedin.svg';
import fingerImage from '../../../../public/assets/fingerImage.svg';

const platforms = ['GitHub', 'LinkedIn', 'Twitter', 'YouTube'];

const platformDefaultUrls: Record<string, string> = {
  GitHub: 'https://github.com/username',
  LinkedIn: 'https://linkedin.com/in/username',
  Twitter: 'https://twitter.com/username',
  YouTube: 'https://youtube.com/channel/username',
};

const platformImages: Record<string, string> = {
  GitHub: github,
  LinkedIn: linkedin,
  Twitter: '',
  YouTube: youtube,
};

interface Link {
  platform: string;
}

const CustomizeLinks: NextPage = () => {
  // authenticate user
  const [user, loading, error] = useAuthState(auth);
  const [links, setLinks] = useState<Link[]>([{ platform: 'GitHub' }]);
  const [urls, setUrls] = useState<{ [key: number]: string }>({});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [savedLinks, setSavedLinks] = useState<
    { platform: string; url: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    // Redirect to sign-up if no user and not loading
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        sessionStorage.removeItem('user');
        router.push('/login');
      })
      .catch((error) => {
        console.error('Sign Out Error', error);
      });
  };

  if (loading) {
    // Optionally add a loading spinner or message here
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error: {error.message}
      </div>
    );
  }

  const addLink = () => {
    setLinks([...links, { platform: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
    setUrls((prevUrls) => {
      const newUrls = { ...prevUrls };
      delete newUrls[index];
      return newUrls;
    });
  };

  const handlePlatformChange = (index: number, platform: string) => {
    const newLinks = [...links];
    newLinks[index].platform = platform;
    setLinks(newLinks);
    setUrls((prevUrls) => {
      const newUrls = { ...prevUrls };
      delete newUrls[index]; // Reset URL when platform changes
      return newUrls;
    });
  };

  const handleUrlChange = (index: number, value: string) => {
    setUrls((prevUrls) => ({ ...prevUrls, [index]: value }));
  };

  const toggleDropdown = (index: number) => {
    setDropdownOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const selectPlatform = (index: number, platform: string) => {
    handlePlatformChange(index, platform);
    setDropdownOpen((prev) => ({ ...prev, [index]: false }));
  };

  const saveLinks = () => {
    const finalLinks = links.map((link, index) => ({
      platform: link.platform,
      url: urls[index] || platformDefaultUrls[link.platform] || '',
    }));
    setSavedLinks(finalLinks);
  };

  return (
    <>
      {user && (
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl">Welcome, {user.email}</h1>
        </header>
      )}
      <button onClick={handleSignOut}>Log out</button>
      <div className="flex bg-primary">
        <MainLayout links={savedLinks} />

        <div className="bg-gray-100 p-5 w-full h-full">
          <Head>
            <title>Customize Links</title>
          </Head>
          <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-12">
            <h1 className="text-2xl font-bold mb-4 text-black">
              Customize your links
            </h1>
            <p className="text-[#737373] mb-6">
              Add/edit/remove links below and then share all your profiles with
              the world!
            </p>
            <button
              onClick={addLink}
              className="w-full py-2 bg-transparent border border-[#633CFF] text-[#633CFF] font-bold rounded mb-4"
            >
              + Add new link
            </button>

            {/* Start of Scrollable Section */}
            <div className="h-[27rem] overflow-y-auto">
              {links.length === 0 && (
                <section className="self-stretch rounded-xl bg-[#fafafa] overflow-hidden flex flex-col items-center justify-center py-[62.5px] px-5 box-border max-w-full">
                  <div className="self-stretch flex flex-col items-center justify-center gap-[40px] max-w-full">
                    <Image
                      className="relative"
                      width={249.5}
                      height={40}
                      loading="lazy"
                      alt="finger image"
                      src={fingerImage}
                    />
                    <div className="w-[400px] flex flex-col items-center justify-start gap-[24px] max-w-full">
                      <h1 className="self-stretch text-[#333] font-bold text-[32px]">
                        Let’s get you started
                      </h1>
                      <div className="self-stretch text-[16px] text-[#737373] font-normal">
                        Use the “Add new link” button to get started. Once you
                        have more than one link, you can reorder and edit them.
                        We’re here to help you share your profiles with
                        everyone!
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {links.map((link, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between text-center items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="">
                        <div className="w-3 border border-gray bg-gray" />
                        <div className="w-3 border border-gray mt-1 bg-gray" />
                      </div>
                      <p className="text-[#737373]">Link</p>
                    </div>
                    <button
                      onClick={() => removeLink(index)}
                      className="p-2 text-[#737373]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-full">
                      <label className="text-[#737373] text-xs" htmlFor="">
                        Platform
                      </label>
                      <div
                        onClick={() => toggleDropdown(index)}
                        className="cursor-pointer px-4 py-2 border border-[#737373] rounded w-full mb-8 text-black flex gap-2"
                      >
                        {platformImages[link.platform] && (
                          <Image
                            src={platformImages[link.platform]}
                            alt="icon"
                            width={20}
                            height={20}
                          />
                        )}
                        {link.platform || 'Select platform'}
                      </div>
                      {dropdownOpen[index] && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1">
                          {platforms.map((platform) => (
                            <div
                              key={platform}
                              onClick={() => selectPlatform(index, platform)}
                              className="cursor-pointer px-4 py-2 hover:bg-gray-200 flex items-center gap-2"
                            >
                              {platformImages[platform] && (
                                <Image
                                  src={platformImages[platform]}
                                  alt="icon"
                                  width={20}
                                  height={20}
                                />
                              )}
                              <span>{platform}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#737373] text-xs" htmlFor="Label">
                      Link
                    </label>
                    <input
                      type="text"
                      placeholder={
                        platformDefaultUrls[link.platform] ||
                        'e.g. https://github.com/username'
                      }
                      value={urls[index] || ''}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className="w-full p-2 border border-[#737373] rounded text-black"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* End of Scrollable Section */}

            <hr className="mt-5" />

            <div className="mt-2 text-right">
              <button
                onClick={saveLinks}
                className="px-4 py-2 bg-[#633CFF] text-white font-bold rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomizeLinks;
