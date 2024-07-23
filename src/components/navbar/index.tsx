"use client";
import Image from "next/image";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

import logo from "../../../public/assets/logo.svg";
import logo2 from "../../../public/assets/logo_2.svg";
import link from "../../../public/assets/link.svg";
import eye from "../../../public/assets/eye.svg";
import link2 from "../../../public/assets/link_2.svg";
import profile from "../../../public/assets/profile.svg";
import profile2 from "../../../public/assets/profile_2.svg";
import path from "path";
import Link from "next/link";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isLinkActive = pathname === "/links";
  const isProfileActive = pathname === "/profile-details";

  const handleNavigation = (path: string) => {
    router.push(path);
  };
  

  return (
    <section className="w-full bg-primary sm:px-10 px-8 py-5">
      <div className="flex justify-between bg-white sm:px-3 py-2 rounded-xl">
        <Link href={'/'}>
          <Image src={logo} alt="logo" className="w-40 h-auto sm:block hidden" />
          <Image src={logo2} alt="logo" className="sm:hidden block" />
        </Link>

        <div className="flex gap-6">
          <div
            className={`flex items-center gap-1 ${
              isLinkActive
                ? "border-2 border-purple bg-purple text-secondary py-1 px-4 rounded-md font-semibold"
                : "text-gray text-base font-semibold"
            }`}
            onClick={() => handleNavigation("/links")}
          >
            <Image
              src={isLinkActive ? link : link2}
              alt="link"
              className="w-5"
            />
            <h1 className="sm:block hidden">Links</h1>
          </div>

          <div
            className={`flex items-center gap-1 ${
              isProfileActive
                ? "border-2 border-purple bg-purple text-secondary py-1 px-4 rounded-md font-semibold"
                : "text-gray text-base font-semibold"
            }`}
            onClick={() => handleNavigation("/profile-details")}
          >
            <Image
              src={isProfileActive ? profile : profile2}
              alt="profile"
              className="w-5"
            />
            <h1 className="sm:block hidden">Profile Details</h1>
          </div>
        </div>
        <button className="border-secondary border px-5 rounded-md text-secondary font-semibold sm:block hidden">Preview 
        </button>
        <Image src={eye} alt="eye"  className="sm:hidden block border border-secondary px-3 py-[.px] w-[2.8rem] rounded "/>
      </div>
    </section>
  );
};

export default Navbar;
