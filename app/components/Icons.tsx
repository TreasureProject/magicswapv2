import type { ReactNode } from "react";

// Icon creation factory
const createIcon = ({
  path,
  displayName,
  width = 24,
  height = 24,
}: {
  path: ReactNode;
  displayName: string;
  width?: number;
  height?: number;
}) => {
  const Comp = (props: React.SVGAttributes<SVGElement>) => (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {path}
    </svg>
  );

  Comp.displayName = displayName;

  return Comp;
};

export const ExclamationCircleIcon = createIcon({
  path: (
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  displayName: "ExclamationCircleIcon",
});

export const CheckCircleIcon = createIcon({
  path: (
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  displayName: "CheckCircleIcon",
});

export const SpinnerIcon = createIcon({
  path: (
    <>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </>
  ),
  displayName: "SpinnerIcon",
});

export const PoolIcon = createIcon({
  width: 16,
  height: 13,
  path: (
    <path
      d="M0.5 12.7633V11.3008C0.8625 11.3008 1.17188 11.2445 1.42813 11.132C1.68438 11.0195 1.94375 10.8977 2.20625 10.7664C2.46875 10.6352 2.75937 10.5164 3.07812 10.4102C3.39688 10.3039 3.7875 10.2508 4.25 10.2508C4.725 10.2508 5.11562 10.3039 5.42188 10.4102C5.72813 10.5164 6.0125 10.6352 6.275 10.7664C6.5375 10.8977 6.8 11.0195 7.0625 11.132C7.325 11.2445 7.6375 11.3008 8 11.3008C8.3625 11.3008 8.675 11.2445 8.9375 11.132C9.2 11.0195 9.4625 10.8977 9.725 10.7664C9.9875 10.6352 10.275 10.5164 10.5875 10.4102C10.9 10.3039 11.2875 10.2508 11.75 10.2508C12.225 10.2508 12.6188 10.3039 12.9313 10.4102C13.2438 10.5164 13.5313 10.6352 13.7938 10.7664C14.0563 10.8977 14.3187 11.0195 14.5812 11.132C14.8437 11.2445 15.15 11.3008 15.5 11.3008V12.7633C15.025 12.7633 14.6281 12.707 14.3094 12.5945C13.9906 12.482 13.7 12.3602 13.4375 12.2289C13.175 12.0977 12.9188 11.9789 12.6688 11.8727C12.4188 11.7664 12.1125 11.7133 11.75 11.7133C11.4 11.7133 11.0969 11.7664 10.8406 11.8727C10.5844 11.9789 10.3281 12.0977 10.0719 12.2289C9.81562 12.3602 9.52813 12.482 9.20938 12.5945C8.89063 12.707 8.4875 12.7633 8 12.7633C7.5125 12.7633 7.10937 12.707 6.79062 12.5945C6.47187 12.482 6.18438 12.3602 5.92813 12.2289C5.67188 12.0977 5.41875 11.9789 5.16875 11.8727C4.91875 11.7664 4.6125 11.7133 4.25 11.7133C3.9 11.7133 3.59688 11.7664 3.34063 11.8727C3.08438 11.9789 2.825 12.0977 2.5625 12.2289C2.3 12.3602 2.00937 12.482 1.69062 12.5945C1.37187 12.707 0.975 12.7633 0.5 12.7633ZM0.5 9.42578V7.96328C0.8625 7.96328 1.17188 7.90703 1.42813 7.79453C1.68438 7.68203 1.94375 7.56016 2.20625 7.42891C2.46875 7.29766 2.75937 7.17891 3.07812 7.07266C3.39688 6.96641 3.7875 6.91328 4.25 6.91328C4.725 6.91328 5.11562 6.96641 5.42188 7.07266C5.72813 7.17891 6.0125 7.29766 6.275 7.42891C6.5375 7.56016 6.8 7.68203 7.0625 7.79453C7.325 7.90703 7.6375 7.96328 8 7.96328C8.3625 7.96328 8.675 7.90703 8.9375 7.79453C9.2 7.68203 9.4625 7.56016 9.725 7.42891C9.9875 7.29766 10.275 7.17891 10.5875 7.07266C10.9 6.96641 11.2875 6.91328 11.75 6.91328C12.225 6.91328 12.6188 6.96641 12.9313 7.07266C13.2438 7.17891 13.5313 7.29766 13.7938 7.42891C14.0563 7.56016 14.3187 7.68203 14.5812 7.79453C14.8437 7.90703 15.15 7.96328 15.5 7.96328V9.42578C15.025 9.42578 14.6281 9.36953 14.3094 9.25703C13.9906 9.14453 13.7 9.02266 13.4375 8.89141C13.175 8.76016 12.9188 8.64141 12.6688 8.53516C12.4188 8.42891 12.1125 8.37578 11.75 8.37578C11.3875 8.37578 11.0781 8.42891 10.8219 8.53516C10.5656 8.64141 10.3094 8.76016 10.0531 8.89141C9.79688 9.02266 9.5125 9.14453 9.2 9.25703C8.8875 9.36953 8.4875 9.42578 8 9.42578C7.5125 9.42578 7.10937 9.36953 6.79062 9.25703C6.47187 9.14453 6.18438 9.02266 5.92813 8.89141C5.67188 8.76016 5.41875 8.64141 5.16875 8.53516C4.91875 8.42891 4.6125 8.37578 4.25 8.37578C3.9 8.37578 3.59688 8.42891 3.34063 8.53516C3.08438 8.64141 2.825 8.76016 2.5625 8.89141C2.3 9.02266 2.00937 9.14453 1.69062 9.25703C1.37187 9.36953 0.975 9.42578 0.5 9.42578ZM0.5 6.08828V4.62578C0.8625 4.62578 1.17188 4.56953 1.42813 4.45703C1.68438 4.34453 1.94375 4.22266 2.20625 4.09141C2.46875 3.96016 2.75937 3.84141 3.07812 3.73516C3.39688 3.62891 3.7875 3.57578 4.25 3.57578C4.725 3.57578 5.11562 3.62891 5.42188 3.73516C5.72813 3.84141 6.0125 3.96016 6.275 4.09141C6.5375 4.22266 6.8 4.34453 7.0625 4.45703C7.325 4.56953 7.6375 4.62578 8 4.62578C8.3625 4.62578 8.675 4.56953 8.9375 4.45703C9.2 4.34453 9.4625 4.22266 9.725 4.09141C9.9875 3.96016 10.275 3.84141 10.5875 3.73516C10.9 3.62891 11.2875 3.57578 11.75 3.57578C12.225 3.57578 12.6188 3.62891 12.9313 3.73516C13.2438 3.84141 13.5313 3.96016 13.7938 4.09141C14.0563 4.22266 14.3187 4.34453 14.5812 4.45703C14.8437 4.56953 15.15 4.62578 15.5 4.62578V6.08828C15.025 6.08828 14.6281 6.03203 14.3094 5.91953C13.9906 5.80703 13.7 5.68516 13.4375 5.55391C13.175 5.42266 12.9188 5.30391 12.6688 5.19766C12.4188 5.09141 12.1125 5.03828 11.75 5.03828C11.4 5.03828 11.0969 5.09141 10.8406 5.19766C10.5844 5.30391 10.3281 5.42266 10.0719 5.55391C9.81562 5.68516 9.52813 5.80703 9.20938 5.91953C8.89063 6.03203 8.4875 6.08828 8 6.08828C7.5125 6.08828 7.10937 6.03203 6.79062 5.91953C6.47187 5.80703 6.18438 5.68516 5.92813 5.55391C5.67188 5.42266 5.41875 5.30391 5.16875 5.19766C4.91875 5.09141 4.6125 5.03828 4.25 5.03828C3.9 5.03828 3.59688 5.09141 3.34063 5.19766C3.08438 5.30391 2.825 5.42266 2.5625 5.55391C2.3 5.68516 2.00937 5.80703 1.69062 5.91953C1.37187 6.03203 0.975 6.08828 0.5 6.08828ZM0.5 2.75078V1.28828C0.8625 1.28828 1.17188 1.23203 1.42813 1.11953C1.68438 1.00703 1.94375 0.885156 2.20625 0.753906C2.46875 0.622656 2.75937 0.503906 3.07812 0.397656C3.39688 0.291406 3.7875 0.238281 4.25 0.238281C4.725 0.238281 5.11562 0.291406 5.42188 0.397656C5.72813 0.503906 6.0125 0.622656 6.275 0.753906C6.5375 0.885156 6.8 1.00703 7.0625 1.11953C7.325 1.23203 7.6375 1.28828 8 1.28828C8.3625 1.28828 8.675 1.23203 8.9375 1.11953C9.2 1.00703 9.4625 0.885156 9.725 0.753906C9.9875 0.622656 10.275 0.503906 10.5875 0.397656C10.9 0.291406 11.2875 0.238281 11.75 0.238281C12.225 0.238281 12.6188 0.291406 12.9313 0.397656C13.2438 0.503906 13.5313 0.622656 13.7938 0.753906C14.0563 0.885156 14.3187 1.00703 14.5812 1.11953C14.8437 1.23203 15.15 1.28828 15.5 1.28828V2.75078C15.025 2.75078 14.6281 2.69453 14.3094 2.58203C13.9906 2.46953 13.7 2.34766 13.4375 2.21641C13.175 2.08516 12.9188 1.96641 12.6688 1.86016C12.4188 1.75391 12.1125 1.70078 11.75 1.70078C11.4 1.70078 11.0969 1.75391 10.8406 1.86016C10.5844 1.96641 10.3281 2.08516 10.0719 2.21641C9.81562 2.34766 9.52813 2.46953 9.20938 2.58203C8.89063 2.69453 8.4875 2.75078 8 2.75078C7.5125 2.75078 7.10937 2.69453 6.79062 2.58203C6.47187 2.46953 6.18438 2.34766 5.92813 2.21641C5.67188 2.08516 5.41875 1.96641 5.16875 1.86016C4.91875 1.75391 4.6125 1.70078 4.25 1.70078C3.9 1.70078 3.59688 1.75391 3.34063 1.86016C3.08438 1.96641 2.825 2.08516 2.5625 2.21641C2.3 2.34766 2.00937 2.46953 1.69062 2.58203C1.37187 2.69453 0.975 2.75078 0.5 2.75078Z"
      fill="currentColor"
    />
  ),
  displayName: "PoolIcon",
});

export const InventoryIcon = createIcon({
  width: 16,
  height: 16,
  path: (
    <path
      d="M5.33398 11.9987C4.96732 11.9987 4.65354 11.8683 4.39265 11.6074C4.13132 11.346 4.00065 11.032 4.00065 10.6654V2.66536C4.00065 2.2987 4.13132 1.9847 4.39265 1.72336C4.65354 1.46248 4.96732 1.33203 5.33398 1.33203H13.334C13.7007 1.33203 14.0147 1.46248 14.276 1.72336C14.5369 1.9847 14.6673 2.2987 14.6673 2.66536V10.6654C14.6673 11.032 14.5369 11.346 14.276 11.6074C14.0147 11.8683 13.7007 11.9987 13.334 11.9987H5.33398ZM2.66732 14.6654C2.30065 14.6654 1.98687 14.5349 1.72598 14.274C1.46465 14.0127 1.33398 13.6987 1.33398 13.332V3.9987H2.66732V13.332H12.0007V14.6654H2.66732Z"
      fill="currentColor"
    />
  ),
  displayName: "InventoryIcon",
});
