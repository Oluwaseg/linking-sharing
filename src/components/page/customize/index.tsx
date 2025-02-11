'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import MainLayout from '../mainlayout';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  getDocs,
  where,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import github from '../../../../public/assets/github2.svg';
import youtube from '../../../../public/assets/youtube2.svg';
import chain from '../../../../public/assets/link_2.svg';
import linkedin from '../../../../public/assets/linkedin2.svg';
import fingerImage from '../../../../public/assets/fingerImage.svg';
import facebook from '../../../../public/assets/facebook2.svg';
import { toast, Toaster } from 'react-hot-toast';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

const platforms = ['GitHub', 'LinkedIn', 'Facebook', 'YouTube'];

const platformDefaultUrls: Record<string, string> = {
  GitHub: 'https://github.com/username',
  LinkedIn: 'https://linkedin.com/in/username',
  YouTube: 'https://youtube.com/channel/username',
  Facebook: 'https://facebook.com/username',
};

const platformImages: Record<string, string> = {
  GitHub: github,
  LinkedIn: linkedin,
  YouTube: youtube,
  Facebook: facebook,
};

interface Link {
  platform: string;
  url: string;
  id?: string;
  createdAt?: Date;
}

interface ProfileData {
  imageUrl?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

const CustomizeLinks: NextPage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [links, setLinks] = useState<Link[]>([]);
  const [urls, setUrls] = useState<{ [key: number]: string }>({});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [validationPerformed, setValidationPerformed] =
    useState<boolean>(false);
  const router = useRouter();

  const fetchLinks = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'links'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const linksList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Link[];

      setLinks(linksList);
      const urlMap = linksList.reduce(
        (acc, link, index) => {
          acc[index] = link.url;
          return acc;
        },
        {} as { [key: number]: string }
      );

      setUrls(urlMap);
      setShowPlaceholder(linksList.length === 0);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const profileDocRef = doc(db, 'profiles', user.uid);
          const profileDocSnap = await getDoc(profileDocRef);

          if (profileDocSnap.exists()) {
            const profileData = profileDocSnap.data() as ProfileData;
            setProfilePicture(profileData.imageUrl || null);
            setEmail(profileData.email ?? null);
            setFirstName(profileData.firstName || null);
            setLastName(profileData.lastName || null);
          }
        } catch (err) {
          console.error('Error fetching profile data:', err);
        }
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const timeout = setTimeout(
        () => {
          signOut(auth)
            .then(() => {
              toast.success('You have been signed out due to inactivity.');
              router.push('/login');
            })
            .catch((error) => {
              console.error('Sign-out error:', error);
              toast.error('Error signing out.');
            });
        },
        30 * 60 * 1000
      ); // 30 minutes

      // Clear timeout if the component unmounts or user changes
      return () => clearTimeout(timeout);
    }
  }, [user]);

  const isValidUrl = (platform: string, url: string) => {
    const regexes: Record<string, RegExp> = {
      GitHub: /^https:\/\/github\.com\/.+/,
      LinkedIn: /^https:\/\/(www\.)?linkedin\.com\/in\/.+/,
      Facebook: /^https:\/\/(www\.)?facebook\.com\/.+/,
      YouTube: /^https:\/\/(www\.)?youtube\.com\/(channel|user)\/.+/,
    };
    return regexes[platform]?.test(url) ?? false;
  };

  const addLink = () => {
    setLinks([...links, { platform: '', url: '', createdAt: new Date() }]);
    setShowPlaceholder(false);
  };

  const removeLink = async (index: number) => {
    if (!user) return;

    const linkToDelete = links[index];
    if (!linkToDelete.id) return;

    try {
      await deleteDoc(doc(db, 'links', linkToDelete.id));
      toast.success('Link deleted successfully!');
      setLinks(links.filter((_, i) => i !== index));
      setUrls((prevUrls) => {
        const newUrls = { ...prevUrls };
        delete newUrls[index];
        return newUrls;
      });
      if (links.length === 1) setShowPlaceholder(true);
    } catch (error) {
      toast.error('Error deleting link.');
      console.error('Error deleting link:', error);
    }
  };

  const handlePlatformChange = (index: number, platform: string) => {
    const newLinks = [...links];
    newLinks[index].platform = platform;
    setLinks(newLinks);
    setUrls((prevUrls) => {
      const newUrls = { ...prevUrls };
      delete newUrls[index];
      return newUrls;
    });
  };

  const handleUrlChange = (index: number, value: string) => {
    console.log(`Updating URL at index ${index} with value: ${value}`);
    setUrls((prevUrls) => ({ ...prevUrls, [index]: value }));
  };

  const toggleDropdown = (index: number) => {
    setDropdownOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const selectPlatform = (index: number, platform: string) => {
    handlePlatformChange(index, platform);
    console.log(`Selected platform at index ${index}: ${platform}`);
    setDropdownOpen((prev) => ({ ...prev, [index]: false }));
  };

  const allUrlsValid = links.every((link, index) =>
    isValidUrl(link.platform, urls[index] || '')
  );

  const saveLinks = async () => {
    setValidationPerformed(true);

    if (links.some((link, index) => !urls[index])) {
      toast.error("Links can't be empty");
      return;
    }

    if (!user) {
      toast.error('You must be logged in to save links.');
      return;
    }

    const invalidLinks = links.filter(
      (link, index) => !isValidUrl(link.platform, urls[index] || '')
    );
    if (invalidLinks.length > 0) {
      toast.error('One or more links are invalid. Please check and try again.');
      return;
    }

    try {
      const promises = links.map((link, index) => {
        const linkData = { ...link, url: urls[index] || '' };
        console.log('Saving link:', linkData);
        if (link.id) {
          return updateDoc(doc(db, 'links', link.id), linkData);
        } else {
          return addDoc(collection(db, 'links'), {
            ...linkData,
            userId: user.uid,
          });
        }
      });
      await Promise.all(promises);
      toast.success('Links saved successfully!');
      fetchLinks();
    } catch (error) {
      toast.error('Error saving links.');
      console.error('Error saving links:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-2 border-[#633CFF]"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin flex justify-center items-center rounded-full h-20 w-20 border-t-4 border-b-2 border-[#b32828]"></div>

        <p className="text-[#b32828] text-2xl font-semibold mt-4">
          Please log in to continue.
        </p>

        <Link href="/login" legacyBehavior>
          <a className="text-[#b32828] underline mt-2 font-semibold">
            Go to Login Page
          </a>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex bg-primary">
        <MainLayout
          profilePicture={profilePicture || undefined}
          email={email || undefined}
          firstName={firstName || undefined}
          lastName={lastName || undefined}
          links={links.map((link, index) => ({
            platform: link.platform,
            url: urls[index] || platformDefaultUrls[link.platform] || '',
          }))}
        />

        <div className="bg-gray-100 p-5 w-full h-full">
          <Head>
            <title>Customize Links</title>
          </Head>
          <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-12">
            <h1 className="sm:text-[32px] text-2xl font-bold mb-4 text-black">
              Customize your links
            </h1>
            <p className="text-[#737373] mb-6 text-base">
              Add/remove links below and then share all your profiles with the
              world!
            </p>
            <button
              onClick={addLink}
              className="w-full py-2 bg-transparent border hover:bg-purple border-[#633CFF] text-[#633CFF] font-bold rounded-lg mb-4"
            >
              + Add new link
            </button>

            <div className="h-[27rem] overflow-y-auto">
              {showPlaceholder && links.length === 0 && (
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
                      <p className="text-[#737373] font-semibold">
                        Link #{index + 1}
                      </p>
                    </div>
                    <button
                      onClick={() => removeLink(index)}
                      className="p-2 text-[#737373] text-base"
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
                        className="cursor-pointer px-4 py-2 border border-[#737373] rounded-lg w-full mb-8 text-black flex gap-2"
                      >
                        {platformImages[link.platform] && (
                          <Image
                            src={platformImages[link.platform]}
                            alt="icon"
                            width={15}
                            height={15}
                          />
                        )}
                        {link.platform || 'Select platform'}
                      </div>
                      {dropdownOpen[index] && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1">
                          {platforms.map((platform) => (
                            <div
                              key={platform}
                              onClick={() => selectPlatform(index, platform)}
                              className="cursor-pointer px-4 py-2 hover:bg-gray-200 flex items-center gap-2 active:text-secondary"
                            >
                              {platformImages[platform] && (
                                <Image
                                  src={platformImages[platform]}
                                  alt="icon"
                                  width={15}
                                  height={15}
                                />
                              )}
                              <span>{platform}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
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
                      className={`w-full p-2 border ${isValidUrl(link.platform, urls[index] || '') || !validationPerformed ? 'border-gray ' : 'border-red focus:border-tertiary'} focus:shadow-custom-shadow outline-none rounded-lg text-black px-[1.9rem]`}
                    />
                    <Image
                      src={chain}
                      alt="link"
                      width={20}
                      height={20}
                      className="absolute top-9 left-1 mx-1"
                    />
                    {!isValidUrl(link.platform, urls[index] || '') &&
                      validationPerformed && (
                        <p className="text-red text-xs absolute top-9 right-0 mx-5">
                          Please check the URL
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>

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
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </div>
    </>
  );
};

export default CustomizeLinks;
