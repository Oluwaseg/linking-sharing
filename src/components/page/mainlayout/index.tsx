"use client";
import { FC } from "react";
import Image from "next/image";
import innerShape from "../../../../public/assets/Rectangle 15.svg";
import outerShape from "../../../../public/assets/Subtract.svg";

import github from '../../../../public/assets/github2.svg';
import youtube from '../../../../public/assets/youtube2.svg';
import linkedin from '../../../../public/assets/linkedin2.svg';

interface MainLayoutProps {
  links: { platform: string; url: string }[];
}

const platformImages: Record<string, string> = {
  GitHub: github,
  LinkedIn: linkedin,
  YouTube: youtube,
};

const MainLayout: FC<MainLayoutProps> = ({ links = [] }) => {
  return (
    <div className="py-[7rem] px-[5rem]">
      <div>
      <div className="h-[631px] w-[307px] relative">
        <Image
          className="absolute top-0 left-0"
          sizes=""
          style={{
            width: "90%",
            height: "auto",
          }}
          alt="inner shape"
          src={innerShape}
        />
        <Image
          src={outerShape}
          alt="outer"
          className="w-[16rem] absolute top-3 mx-2.5"
        />
        <div className="">
          <div className="rounded-full w-[7rem] h-[7rem] content-none bg-dark mx-[5rem] top-[4rem] absolute left-0" />
          <div className="w-[10rem] top-[12rem] mx-[3.6rem] absolute h-5 rounded-full bg-dark "></div>
          <div className="w-[5rem] top-[14rem] mx-[6.4rem] absolute h-2 rounded-full bg-dark "></div>
        </div>

        <div className="absolute flex gap-3 flex-col top-[16.5rem] left-0 mx-9">
          {links.map((link, index) => (
            <div
              key={index}
              className="rounded-md w-[13rem] h-11 bg-dark flex items-center pl-2 gap-1 justify-start text-white"
            >
              <Image
                src={platformImages[link.platform] || ""}
                alt={link.platform}
                width={20}
                height={20}
              />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                {link.platform}
              </a>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default MainLayout;
