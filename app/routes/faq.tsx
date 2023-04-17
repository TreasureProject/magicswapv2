import React from "react";
import { media } from "~/consts";
import { Link } from "react-router-dom";
import { ChevronRight as ChevronRightIcon } from "lucide-react";
import { DiscordSupportBar } from "~/components/FooterBars";

interface FaqProps {
  title: string;
  content: string;
  link: string;
}

const temporaryData = [
  {
    title: "Swapping",
    items: [
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
    ],
  },
  {
    title: "Swapping",
    items: [
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
      {
        title: "How do I exchange ERC20s?",
        content:
          "You can use our swap page to exchange ERC-20 crypto currencies for each other.",
        link: "/swap",
      },
    ],
  },
];

const FaqCard = ({ title, content, link }: FaqProps) => (
  <Link
    to={link}
    className="group w-full cursor-pointer rounded-lg bg-night-1000 p-4 transition-colors hover:bg-night-900"
  >
    <h1 className="font-medium">{title}</h1>
    <p className="mt-3 text-sm text-night-500 group-hover:text-night-200">
      {content}
    </p>
    <div className="mt-4 flex items-center text-night-600 transition-colors group-hover:text-night-200">
      <p className="font-sm ">Learn more</p>
      <ChevronRightIcon className="w-4 transition-all group-hover:ml-1" />
    </div>
  </Link>
);

const FAQ = () => {
  return (
    <div className="mt-14 flex flex-col gap-16">
      <div className="flex max-w-lg flex-col gap-6">
        <h1 className="text-3xl font-bold">Frequently Asked Question</h1>
        <p className="leading-[160%] text-night-300">
          Got questions? Good chance you’ll find an answer here. Still need
          help?{" "}
          <a
            href={media.discord}
            target="_blank"
            rel="noreferrer"
            className="text-night-100 underline"
          >
            Join our discord server
          </a>{" "}
          and talk with the community
        </p>
      </div>
      {temporaryData.map((data, index) => (
        <div className="flex flex-col gap-8" key={`${data.title}-${index}`}>
          <h1 className="text-lg font-medium text-night-100">{data.title}</h1>
          <div className="rows-3 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((item, i) => (
              <FaqCard
                title={item.title}
                content={item.content}
                link={item.link}
                key={`${item.title}-${index}`}
              />
            ))}
          </div>
        </div>
      ))}
      <DiscordSupportBar />
    </div>
  );
};

export default FAQ;
