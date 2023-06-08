import { Loader } from "lucide-react";

import { cn } from "~/lib/utils";

interface Props {
  className?: string;
}

export const LoaderIcon = ({ className }: Props) => (
  <Loader className={cn("animate-spin text-night-400", className)} />
);

export const DiscordIcon = ({ className }: Props) => (
  <svg viewBox="0 0 20 20" className={className}>
    <path
      d="M14.998 5.70055C14.0536 5.27423 13.0545 4.97131 12.0272 4.7998C11.8992 5.02302 11.7497 5.32325 11.6466 5.5621C10.5389 5.4014 9.44141 5.4014 8.3541 5.5621C8.25105 5.32331 8.09816 5.02302 7.96901 4.7998C6.94064 4.97139 5.94072 5.27508 4.99591 5.70277C3.11581 8.44396 2.60613 11.117 2.86094 13.7522C4.10795 14.6507 5.31643 15.1965 6.50454 15.5536C6.79981 15.1618 7.06083 14.7471 7.2849 14.3136C6.85831 14.1569 6.44707 13.9638 6.05606 13.7366C6.15896 13.663 6.25943 13.5863 6.35733 13.5066C8.7267 14.5759 11.3011 14.5759 13.6423 13.5066C13.7406 13.5858 13.841 13.6624 13.9435 13.7366C13.5519 13.9644 13.1398 14.1579 12.7124 14.3147C12.9377 14.75 13.1983 15.1651 13.4928 15.5547C14.682 15.1976 15.8916 14.6518 17.1386 13.7522C17.4376 10.6974 16.6279 8.04881 14.998 5.70049V5.70055ZM7.60771 12.1316C6.89643 12.1316 6.31312 11.4909 6.31312 10.7108C6.31312 9.93062 6.884 9.28886 7.60771 9.28886C8.33148 9.28886 8.91474 9.92948 8.90231 10.7108C8.90343 11.4909 8.33148 12.1316 7.60771 12.1316ZM12.3918 12.1316C11.6806 12.1316 11.0973 11.4909 11.0973 10.7108C11.0973 9.93062 11.6681 9.28886 12.3918 9.28886C13.1156 9.28886 13.6989 9.92948 13.6864 10.7108C13.6864 11.4909 13.1156 12.1316 12.3918 12.1316V12.1316Z"
      fill="currentColor"
    />
  </svg>
);

export const TwitterIcon = ({ className }: Props) => (
  <svg viewBox="0 0 20 20" className={className}>
    <path
      d="M16.8001 5.8932C16.2948 6.11708 15.7521 6.26835 15.1815 6.33673C15.7702 5.98444 16.2107 5.42999 16.4207 4.77682C15.8675 5.10538 15.2622 5.33664 14.6308 5.46057C14.2063 5.00728 13.644 4.70683 13.0312 4.60587C12.4184 4.50491 11.7894 4.60909 11.2419 4.90223C10.6944 5.19537 10.259 5.66107 10.0033 6.22703C9.74754 6.79299 9.68582 7.42754 9.82769 8.03217C8.70688 7.9759 7.61044 7.68458 6.6095 7.17713C5.60857 6.66968 4.72553 5.95744 4.01767 5.08663C3.77564 5.50413 3.63647 5.9882 3.63647 6.50373C3.6362 6.96783 3.75049 7.42482 3.96919 7.83415C4.1879 8.24348 4.50426 8.59251 4.8902 8.85025C4.44261 8.83601 4.00489 8.71506 3.61348 8.49748V8.53379C3.61343 9.1847 3.83859 9.81559 4.25074 10.3194C4.66289 10.8232 5.23666 11.1689 5.87468 11.2978C5.45946 11.4102 5.02413 11.4267 4.60158 11.3462C4.78159 11.9063 5.13223 12.3961 5.60443 12.7469C6.07662 13.0978 6.64671 13.2923 7.2349 13.3031C6.23642 14.0869 5.00329 14.5121 3.73389 14.5102C3.50903 14.5103 3.28436 14.4971 3.06104 14.4709C4.34955 15.2993 5.84947 15.739 7.38133 15.7373C12.5669 15.7373 15.4017 11.4424 15.4017 7.71753C15.4017 7.59651 15.3987 7.47429 15.3933 7.35327C15.9447 6.9545 16.4206 6.46071 16.7989 5.89502L16.8001 5.8932V5.8932Z"
      fill="currentColor"
    />
  </svg>
);

export const MagicIcon = ({ className }: Props) => (
  <svg viewBox="0 0 16 18" className={className}>
    <path
      d="M15.8177 8.74672L13.461 7.94949C12.5949 7.65794 11.9522 6.92449 11.7699 6.0316L10.7761 1.12524C10.7488 1.00224 10.6394 0.911133 10.5117 0.911133C10.3841 0.911133 10.2747 1.00224 10.2474 1.12524L9.25363 6.0316C9.07129 6.92449 8.42856 7.65794 7.56246 7.94949L5.20577 8.74672C5.09637 8.78316 5.02344 8.88794 5.02344 9.00183C5.02344 9.11572 5.09637 9.2205 5.20577 9.25694L7.56246 10.0542C8.42856 10.3457 9.07129 11.0792 9.25363 11.9721L10.2474 16.8739C10.2747 16.9969 10.3841 17.088 10.5117 17.088C10.6394 17.088 10.7488 16.9969 10.7761 16.8739L11.7699 11.9721C11.9522 11.0792 12.5949 10.3457 13.461 10.0542L15.8177 9.25694C15.9271 9.2205 16.0001 9.11572 16.0001 9.00183C16.0001 8.88794 15.9271 8.78316 15.8177 8.74672Z"
      fill="currentColor"
    />
    <path
      d="M3.15464 4.25084L3.98427 4.53329C4.28968 4.63806 4.5176 4.89318 4.58142 5.21207L4.93242 6.94318C4.94153 6.98874 4.978 7.02063 5.02358 7.02063C5.06917 7.02063 5.10563 6.98874 5.11475 6.94318L5.46575 5.21207C5.52957 4.89773 5.75748 4.63806 6.0629 4.53329L6.89253 4.25084C6.929 4.23717 6.95635 4.20073 6.95635 4.15973C6.95635 4.11873 6.929 4.08228 6.89253 4.06862L6.0629 3.78617C5.75748 3.68139 5.52957 3.42628 5.46575 3.10739L5.11475 1.37627C5.10563 1.33072 5.06917 1.29883 5.02358 1.29883C4.978 1.29883 4.94153 1.33072 4.93242 1.37627L4.58142 3.10739C4.5176 3.42173 4.28968 3.68139 3.98427 3.78617L3.15464 4.06862C3.11817 4.08228 3.09082 4.11873 3.09082 4.15973C3.09082 4.20073 3.11817 4.23717 3.15464 4.25084Z"
      fill="currentColor"
    />
    <path
      d="M5.09173 12.7554L3.97949 12.3773C3.56923 12.2407 3.26382 11.8944 3.18177 11.4708L2.71225 9.15198C2.69857 9.09276 2.64844 9.05176 2.58918 9.05176C2.52992 9.05176 2.47521 9.09276 2.4661 9.15198L1.99658 11.4708C1.90997 11.8944 1.60456 12.2407 1.19886 12.3773L0.0866108 12.7554C0.0364683 12.7737 0 12.8192 0 12.8739C0 12.9286 0.0364683 12.9787 0.0866108 12.9923L1.19886 13.3704C1.60912 13.5071 1.91453 13.8533 1.99658 14.277L2.4661 16.5958C2.47977 16.655 2.52992 16.696 2.58918 16.696C2.64844 16.696 2.70313 16.655 2.71225 16.5958L3.18177 14.277C3.26838 13.8533 3.57379 13.5071 3.97949 13.3704L5.09173 12.9923C5.14188 12.9741 5.17835 12.9286 5.17835 12.8739C5.17835 12.8192 5.14188 12.7691 5.09173 12.7554Z"
      fill="currentColor"
    />
  </svg>
);

export const PoolIcon = ({ className }: Props) => (
  <svg
    width="16"
    height="13"
    viewBox="0 0 16 13"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M0.5 12.7633V11.3008C0.8625 11.3008 1.17188 11.2445 1.42813 11.132C1.68438 11.0195 1.94375 10.8977 2.20625 10.7664C2.46875 10.6352 2.75937 10.5164 3.07812 10.4102C3.39688 10.3039 3.7875 10.2508 4.25 10.2508C4.725 10.2508 5.11562 10.3039 5.42188 10.4102C5.72813 10.5164 6.0125 10.6352 6.275 10.7664C6.5375 10.8977 6.8 11.0195 7.0625 11.132C7.325 11.2445 7.6375 11.3008 8 11.3008C8.3625 11.3008 8.675 11.2445 8.9375 11.132C9.2 11.0195 9.4625 10.8977 9.725 10.7664C9.9875 10.6352 10.275 10.5164 10.5875 10.4102C10.9 10.3039 11.2875 10.2508 11.75 10.2508C12.225 10.2508 12.6188 10.3039 12.9313 10.4102C13.2438 10.5164 13.5313 10.6352 13.7938 10.7664C14.0563 10.8977 14.3187 11.0195 14.5812 11.132C14.8437 11.2445 15.15 11.3008 15.5 11.3008V12.7633C15.025 12.7633 14.6281 12.707 14.3094 12.5945C13.9906 12.482 13.7 12.3602 13.4375 12.2289C13.175 12.0977 12.9188 11.9789 12.6688 11.8727C12.4188 11.7664 12.1125 11.7133 11.75 11.7133C11.4 11.7133 11.0969 11.7664 10.8406 11.8727C10.5844 11.9789 10.3281 12.0977 10.0719 12.2289C9.81562 12.3602 9.52813 12.482 9.20938 12.5945C8.89063 12.707 8.4875 12.7633 8 12.7633C7.5125 12.7633 7.10937 12.707 6.79062 12.5945C6.47187 12.482 6.18438 12.3602 5.92813 12.2289C5.67188 12.0977 5.41875 11.9789 5.16875 11.8727C4.91875 11.7664 4.6125 11.7133 4.25 11.7133C3.9 11.7133 3.59688 11.7664 3.34063 11.8727C3.08438 11.9789 2.825 12.0977 2.5625 12.2289C2.3 12.3602 2.00937 12.482 1.69062 12.5945C1.37187 12.707 0.975 12.7633 0.5 12.7633ZM0.5 9.42578V7.96328C0.8625 7.96328 1.17188 7.90703 1.42813 7.79453C1.68438 7.68203 1.94375 7.56016 2.20625 7.42891C2.46875 7.29766 2.75937 7.17891 3.07812 7.07266C3.39688 6.96641 3.7875 6.91328 4.25 6.91328C4.725 6.91328 5.11562 6.96641 5.42188 7.07266C5.72813 7.17891 6.0125 7.29766 6.275 7.42891C6.5375 7.56016 6.8 7.68203 7.0625 7.79453C7.325 7.90703 7.6375 7.96328 8 7.96328C8.3625 7.96328 8.675 7.90703 8.9375 7.79453C9.2 7.68203 9.4625 7.56016 9.725 7.42891C9.9875 7.29766 10.275 7.17891 10.5875 7.07266C10.9 6.96641 11.2875 6.91328 11.75 6.91328C12.225 6.91328 12.6188 6.96641 12.9313 7.07266C13.2438 7.17891 13.5313 7.29766 13.7938 7.42891C14.0563 7.56016 14.3187 7.68203 14.5812 7.79453C14.8437 7.90703 15.15 7.96328 15.5 7.96328V9.42578C15.025 9.42578 14.6281 9.36953 14.3094 9.25703C13.9906 9.14453 13.7 9.02266 13.4375 8.89141C13.175 8.76016 12.9188 8.64141 12.6688 8.53516C12.4188 8.42891 12.1125 8.37578 11.75 8.37578C11.3875 8.37578 11.0781 8.42891 10.8219 8.53516C10.5656 8.64141 10.3094 8.76016 10.0531 8.89141C9.79688 9.02266 9.5125 9.14453 9.2 9.25703C8.8875 9.36953 8.4875 9.42578 8 9.42578C7.5125 9.42578 7.10937 9.36953 6.79062 9.25703C6.47187 9.14453 6.18438 9.02266 5.92813 8.89141C5.67188 8.76016 5.41875 8.64141 5.16875 8.53516C4.91875 8.42891 4.6125 8.37578 4.25 8.37578C3.9 8.37578 3.59688 8.42891 3.34063 8.53516C3.08438 8.64141 2.825 8.76016 2.5625 8.89141C2.3 9.02266 2.00937 9.14453 1.69062 9.25703C1.37187 9.36953 0.975 9.42578 0.5 9.42578ZM0.5 6.08828V4.62578C0.8625 4.62578 1.17188 4.56953 1.42813 4.45703C1.68438 4.34453 1.94375 4.22266 2.20625 4.09141C2.46875 3.96016 2.75937 3.84141 3.07812 3.73516C3.39688 3.62891 3.7875 3.57578 4.25 3.57578C4.725 3.57578 5.11562 3.62891 5.42188 3.73516C5.72813 3.84141 6.0125 3.96016 6.275 4.09141C6.5375 4.22266 6.8 4.34453 7.0625 4.45703C7.325 4.56953 7.6375 4.62578 8 4.62578C8.3625 4.62578 8.675 4.56953 8.9375 4.45703C9.2 4.34453 9.4625 4.22266 9.725 4.09141C9.9875 3.96016 10.275 3.84141 10.5875 3.73516C10.9 3.62891 11.2875 3.57578 11.75 3.57578C12.225 3.57578 12.6188 3.62891 12.9313 3.73516C13.2438 3.84141 13.5313 3.96016 13.7938 4.09141C14.0563 4.22266 14.3187 4.34453 14.5812 4.45703C14.8437 4.56953 15.15 4.62578 15.5 4.62578V6.08828C15.025 6.08828 14.6281 6.03203 14.3094 5.91953C13.9906 5.80703 13.7 5.68516 13.4375 5.55391C13.175 5.42266 12.9188 5.30391 12.6688 5.19766C12.4188 5.09141 12.1125 5.03828 11.75 5.03828C11.4 5.03828 11.0969 5.09141 10.8406 5.19766C10.5844 5.30391 10.3281 5.42266 10.0719 5.55391C9.81562 5.68516 9.52813 5.80703 9.20938 5.91953C8.89063 6.03203 8.4875 6.08828 8 6.08828C7.5125 6.08828 7.10937 6.03203 6.79062 5.91953C6.47187 5.80703 6.18438 5.68516 5.92813 5.55391C5.67188 5.42266 5.41875 5.30391 5.16875 5.19766C4.91875 5.09141 4.6125 5.03828 4.25 5.03828C3.9 5.03828 3.59688 5.09141 3.34063 5.19766C3.08438 5.30391 2.825 5.42266 2.5625 5.55391C2.3 5.68516 2.00937 5.80703 1.69062 5.91953C1.37187 6.03203 0.975 6.08828 0.5 6.08828ZM0.5 2.75078V1.28828C0.8625 1.28828 1.17188 1.23203 1.42813 1.11953C1.68438 1.00703 1.94375 0.885156 2.20625 0.753906C2.46875 0.622656 2.75937 0.503906 3.07812 0.397656C3.39688 0.291406 3.7875 0.238281 4.25 0.238281C4.725 0.238281 5.11562 0.291406 5.42188 0.397656C5.72813 0.503906 6.0125 0.622656 6.275 0.753906C6.5375 0.885156 6.8 1.00703 7.0625 1.11953C7.325 1.23203 7.6375 1.28828 8 1.28828C8.3625 1.28828 8.675 1.23203 8.9375 1.11953C9.2 1.00703 9.4625 0.885156 9.725 0.753906C9.9875 0.622656 10.275 0.503906 10.5875 0.397656C10.9 0.291406 11.2875 0.238281 11.75 0.238281C12.225 0.238281 12.6188 0.291406 12.9313 0.397656C13.2438 0.503906 13.5313 0.622656 13.7938 0.753906C14.0563 0.885156 14.3187 1.00703 14.5812 1.11953C14.8437 1.23203 15.15 1.28828 15.5 1.28828V2.75078C15.025 2.75078 14.6281 2.69453 14.3094 2.58203C13.9906 2.46953 13.7 2.34766 13.4375 2.21641C13.175 2.08516 12.9188 1.96641 12.6688 1.86016C12.4188 1.75391 12.1125 1.70078 11.75 1.70078C11.4 1.70078 11.0969 1.75391 10.8406 1.86016C10.5844 1.96641 10.3281 2.08516 10.0719 2.21641C9.81562 2.34766 9.52813 2.46953 9.20938 2.58203C8.89063 2.69453 8.4875 2.75078 8 2.75078C7.5125 2.75078 7.10937 2.69453 6.79062 2.58203C6.47187 2.46953 6.18438 2.34766 5.92813 2.21641C5.67188 2.08516 5.41875 1.96641 5.16875 1.86016C4.91875 1.75391 4.6125 1.70078 4.25 1.70078C3.9 1.70078 3.59688 1.75391 3.34063 1.86016C3.08438 1.96641 2.825 2.08516 2.5625 2.21641C2.3 2.34766 2.00937 2.46953 1.69062 2.58203C1.37187 2.69453 0.975 2.75078 0.5 2.75078Z"
      fill="currentColor"
    ></path>
  </svg>
);

export const SwapIcon = ({ className }: Props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" className={className}>
    <path
      d="M19 18L15 22L13.55 20.6L15.15 19L8 19C6.9 19 5.95833 18.6083 5.175 17.825C4.39167 17.0417 4 16.1 4 15C4 13.9 4.39167 12.9583 5.175 12.175C5.95833 11.3917 6.9 11 8 11L15 11C15.55 11 16.0208 10.8042 16.4125 10.4125C16.8042 10.0208 17 9.55 17 9C17 8.45 16.8042 7.97917 16.4125 7.5875C16.0208 7.19583 15.55 7 15 7L7.85 7L9.45 8.6L8 10L4 6L8 2L9.45 3.4L7.85 5L15 5C16.1 5 17.0417 5.39167 17.825 6.175C18.6083 6.95833 19 7.9 19 9C19 10.1 18.6083 11.0417 17.825 11.825C17.0417 12.6083 16.1 13 15 13L8 13C7.45 13 6.97917 13.1958 6.5875 13.5875C6.19583 13.9792 6 14.45 6 15C6 15.55 6.19583 16.0208 6.5875 16.4125C6.97917 16.8042 7.45 17 8 17L15.15 17L13.55 15.4L15 14L19 18Z"
      fill="currentColor"
    />
  </svg>
);

export const ExchangeIcon = ({ className }: Props) => (
  <svg viewBox="0 0 20 21" className={className}>
    <mask
      id="mask0_3387_50597"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="24"
      height="25"
    >
      <rect y="0.5" width="24" height="24" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_3387_50597)">
      <path
        d="M4.99935 16.332L1.66602 12.9987L2.83268 11.7904L4.16602 13.1237V7.16536C4.16602 6.2487 4.4924 5.46398 5.14518 4.8112C5.79796 4.15842 6.58268 3.83203 7.49935 3.83203C8.41602 3.83203 9.20074 4.15842 9.85352 4.8112C10.5063 5.46398 10.8327 6.2487 10.8327 7.16536V12.9987C10.8327 13.457 10.996 13.8495 11.3227 14.1762C11.6488 14.5023 12.041 14.6654 12.4993 14.6654C12.9577 14.6654 13.3502 14.5023 13.6768 14.1762C14.003 13.8495 14.166 13.457 14.166 12.9987V7.04036L12.8327 8.3737L11.666 7.16536L14.9993 3.83203L18.3327 7.16536L17.166 8.3737L15.8327 7.04036V12.9987C15.8327 13.9154 15.5063 14.7001 14.8535 15.3529C14.2007 16.0056 13.416 16.332 12.4993 16.332C11.5827 16.332 10.798 16.0056 10.1452 15.3529C9.4924 14.7001 9.16602 13.9154 9.16602 12.9987V7.16536C9.16602 6.70703 9.00296 6.31481 8.67685 5.9887C8.35018 5.66203 7.95768 5.4987 7.49935 5.4987C7.04102 5.4987 6.64879 5.66203 6.32268 5.9887C5.99602 6.31481 5.83268 6.70703 5.83268 7.16536V13.1237L7.16602 11.7904L8.33268 12.9987L4.99935 16.332Z"
        fill="#606C83"
      />
    </g>
  </svg>
);

export const TokenIcon = ({ className }: Props) => (
  <svg width="14" height="18" viewBox="0 0 14 18" className={className}>
    <path
      d="M12.5078 3.38281C11.5625 1.76562 10.2734 0.875 8.875 0.875H5.125C3.72656 0.875 2.4375 1.76562 1.49219 3.38281C0.546875 5 0.125 6.89062 0.125 9C0.125 11.1094 0.609375 13.1094 1.49219 14.6172C2.375 16.125 3.72656 17.125 5.125 17.125H8.875C10.2734 17.125 11.5625 16.2344 12.5078 14.6172C13.4531 13 13.875 11.1094 13.875 9C13.875 6.89062 13.3906 4.89062 12.5078 3.38281ZM12.6094 8.375H10.1094C10.0469 7.03125 9.78906 5.74219 9.35156 4.625H11.7422C12.2188 5.67188 12.5391 6.96875 12.6094 8.375ZM11 3.375H8.75781C8.49327 2.92443 8.17879 2.50512 7.82031 2.125H8.875C9.65625 2.125 10.3906 2.59375 11 3.375ZM8.875 15.875H7.82031C8.17879 15.4949 8.49327 15.0756 8.75781 14.625H11C10.3906 15.4062 9.65625 15.875 8.875 15.875ZM11.7422 13.375H9.35156C9.78906 12.2578 10.0469 10.9688 10.1094 9.625H12.6094C12.5391 11.0312 12.2188 12.3281 11.7422 13.375Z"
      fill="currentColor"
    />
  </svg>
);

export const CheckIcon = ({ className }: Props) => (
  <svg width="9" height="6" viewBox="0 0 9 6" className={className}>
    <path
      d="M3.52503 5.93281L0.710449 3.11823L2.00837 1.82031L3.52503 3.33698L6.7917 0.0703125L8.08962 1.36823L3.52503 5.93281Z"
      fill="currentColor"
    />
  </svg>
);

export const FilledFilterIcon = ({ className }: Props) => (
  <svg width="16" height="17" viewBox="0 0 16 17" className={className}>
    <path
      d="M6.09435 8.0606C6.26225 8.24332 6.35443 8.48201 6.35443 8.72892V16.0047C6.35443 16.4426 6.88283 16.6649 7.1956 16.357L9.22526 14.0311C9.49687 13.7051 9.64666 13.5438 9.64666 13.2212V8.73057C9.64666 8.48365 9.74049 8.24497 9.90675 8.06223L15.7307 1.74282C16.1669 1.26874 15.8311 0.5 15.1858 0.5H0.815241C0.169964 0.5 -0.167489 1.26709 0.270377 1.74282L6.09435 8.0606Z"
      fill="currentColor"
    />
  </svg>
);
