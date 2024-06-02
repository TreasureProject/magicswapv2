import { Link } from "react-router-dom";

import { DiscordSupportBar } from "~/components/FooterBars";

const Privacy = () => {
  return (
    <div className="mt-14 flex flex-col gap-16">
      <div className="flex max-w-3xl flex-col gap-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="leading-[160%] text-night-300">
          Effective Date:{" "}
          <span className="text-night-100">February 16, 2023</span>
        </p>
        <p className="leading-[160%] text-night-400">
          Treasure Project Ltd ("
          <span className="text-night-100">Treasure</span>", "
          <span className="text-night-100">we</span>", "
          <span className="text-night-100">us</span>", or "
          <span className="text-night-100">our</span>") recognizes the
          importance of protecting the privacy of the users of our service. It
          is our intent to balance our legitimate business interests in
          collecting and using information received from and about you with your
          reasonable expectations of privacy. The following privacy policy
          (“Privacy Policy”) is the way we handle information learned about you
          from your visits to our website available at{" "}
          <a
            href="https://treasure.lol"
            target="_blank"
            rel="noreferrer"
            className="text-ruby-700 underline"
          >
            treasure.lol
          </a>
          ,{" "}
          <a
            href="https://app.treasure.lol"
            target="_blank"
            rel="noreferrer"
            className="text-ruby-700 underline"
          >
            app.treasure.lol
          </a>
          , and any other website offered by us that links to this privacy
          policy (collectively the <span className="text-night-100">site</span>
          ).
        </p>
        <p className="leading-[160%] text-night-400">
          <span className="font-medium text-night-100">
            {" "}
            PLEASE REVIEW THIS PRIVACY POLICY CAREFULLY
          </span>{" "}
          When you submit information to or through the Site, you consent to the
          collection and processing of your information as described in this
          Privacy Policy. By using the Site, you accept the terms of this
          Privacy Policy and out{" "}
          <Link to="/tos" className="text-night-300 underline">
            Terms of Service
          </Link>
          .
        </p>
        <p className="leading-[160%] text-night-400">
          <span className="font-medium text-night-100">
            Personal Information:
          </span>{" "}
          Treasure collects personal information from you when you interact with
          the Site. This information is collected and stored electronically by
          us. Certain information may be provided to us voluntarily by you,
          collected automatically by us from you, or received by us from a third
          party source.
        </p>
      </div>
      <div className="flex max-w-3xl flex-col gap-6">
        <h1 className="text-xl font-bold">
          1. Information Voluntarily Provided By You
        </h1>

        <p className="leading-[160%] text-night-400">
          We collect information about you when you use the certain aspects of
          the Site, including information you provide when you link a digital
          wallet, make a purchase, or contact our support team. Such information
          includes:
        </p>
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-2">
            <div className="bg-base-100 h-[4px] w-[4px] rounded-full"></div>
            <p className="text-night-400">
              <span className="font-medium text-night-100">Contact Data:</span>{" "}
              in the form of your email address and other contact information
              you provide.{" "}
            </p>
          </li>
          <li className="flex items-center gap-2">
            <div className="bg-base-100 h-[4px] w-[4px] rounded-full"></div>
            <p className="text-night-400">
              <span className="font-medium text-night-100">
                Profile information:
              </span>{" "}
              in the form of your email address and other contact information
              you provide.
            </p>
          </li>
          <li className="flex items-center gap-2">
            <div className="bg-base-100 h-[4px] w-[4px] rounded-full"></div>
            <p className="text-night-400">
              <span className="font-medium text-night-100">
                Digital Wallet Information:
              </span>{" "}
              including your digital wallet address.
            </p>
          </li>
          <li className="flex items-center gap-2">
            <div className="bg-base-100 h-[4px] w-[4px] rounded-full"></div>
            <p className="text-night-400">
              <span className="font-medium text-night-100">
                Transaction Event Data:
              </span>{" "}
              including but not limited to applicable public IDs related to the
              transaction, transaction price information, and the date and time
              of the transaction.
            </p>
          </li>
          <li className="flex items-center gap-2">
            <div className="bg-base-100 h-[4px] w-[4px] rounded-full"></div>
            <p className="text-night-400">
              <span className="font-medium text-night-100">Content:</span>{" "}
              including any content in messages you may send to us.
            </p>
          </li>
          <p className="leading-[160%] text-night-400">
            You may choose to voluntarily provide other information to us that
            we do not request, and, in such instances, we have no control over
            what categories of personal information such disclosure may include.
            Any additional information provided by you to us is provided at your
            own risk.
          </p>
        </ul>
      </div>
      <DiscordSupportBar />
    </div>
  );
};

export default Privacy;
