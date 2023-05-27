import { Resvg } from "@resvg/resvg-js";
import type { SatoriOptions } from "satori";
import satori from "satori";

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "~/routes/resources.og";

const loadFont = (baseUrl: string, name: string, weight: 500 | 600 | 700) =>
  fetch(new URL(`${baseUrl}/fonts/${name}`)).then(
    async (res) =>
      ({
        name: "ABCWhyte",
        weight,
        data: await res.arrayBuffer(),
        style: "normal",
      } as const)
  );

export const MagicSwapLogoFull = () => (
  <svg
    viewBox="0 0 156 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    tw="w-72 h-14"
  >
    <path
      d="M0 8.72774V19.2779C0 21.0237 0.929257 22.6343 2.43008 23.5025L9.35159 27.5166C10.4634 28.1611 11.8296 28.1611 12.9414 27.5166L19.8629 23.5025C21.3637 22.6286 22.293 21.0181 22.293 19.2779V8.72774C22.293 6.98191 21.3637 5.36951 19.8629 4.50317L12.9414 0.483439C11.8296 -0.161146 10.4634 -0.161146 9.35159 0.483439L2.43008 4.49753C0.929257 5.37139 0 6.98191 0 8.72774Z"
      fill="#DC2626"
    />
    <path
      d="M4.87375 8.90929L5.78202 9.21372C6.11655 9.32836 6.36698 9.60461 6.43239 9.95227L6.8155 11.8353C6.82672 11.8841 6.8697 11.9161 6.92016 11.9161C6.97062 11.9161 7.0136 11.8841 7.02482 11.8353L7.40794 9.95227C7.47895 9.61025 7.72565 9.32836 8.06391 9.21372L8.97218 8.90929C9.01516 8.89237 9.0432 8.85479 9.0432 8.81156C9.0432 8.76834 9.01516 8.73076 8.97218 8.71384L8.06391 8.4094C7.72939 8.29477 7.47895 8.01852 7.40794 7.67085L7.02482 5.78784C7.0136 5.73898 6.97062 5.70703 6.92016 5.70703C6.8697 5.70703 6.82672 5.73898 6.8155 5.78784L6.43239 7.67085C6.36137 8.01288 6.11468 8.29477 5.78202 8.4094L4.87375 8.71384C4.83077 8.73076 4.80273 8.76834 4.80273 8.81156C4.80273 8.85479 4.83077 8.89237 4.87375 8.90929V8.90929Z"
      fill="#FFFCF5"
    />
    <path
      d="M9.59603 22.0893L9.25777 21.0256C9.18675 20.8057 9.02042 20.6291 8.80363 20.5501C6.28253 19.6387 4.4417 17.2784 4.28097 14.4745C4.26789 14.2584 4.43983 14.0742 4.65475 14.0742H5.77794C5.97417 14.0742 6.13489 14.2264 6.14984 14.4219C6.32738 17.0171 8.48406 19.073 11.1098 19.073H12.0125C12.5115 19.073 12.7619 19.68 12.4087 20.0352L10.2165 22.2396C10.0184 22.4388 9.682 22.3561 9.59603 22.0893V22.0893Z"
      fill="#FFFCF5"
    />
    <path
      d="M17.5628 14.0736H16.4396C16.2434 14.0736 16.0808 13.9214 16.0677 13.7241C15.9032 11.3524 14.0867 9.39989 11.7114 9.11048L10.9489 9.0184C10.4854 8.96202 10.2891 8.3926 10.6199 8.05998L12.6402 6.0285C12.8458 5.82178 13.1952 5.9195 13.2663 6.20139L13.5484 7.32143C13.6026 7.53754 13.7503 7.72171 13.9521 7.81567C16.2116 8.8549 17.787 11.0893 17.9366 13.6733C17.9496 13.8894 17.7777 14.0736 17.5628 14.0736V14.0736Z"
      fill="#FFFCF5"
    />
    <path
      d="M10.6062 12.2134L9.23982 13.5875C8.96175 13.8671 8.96175 14.3204 9.23982 14.6L10.6062 15.9741C10.8843 16.2537 11.3351 16.2537 11.6132 15.9741L12.9796 14.6C13.2577 14.3204 13.2577 13.8671 12.9796 13.5875L11.6132 12.2134C11.3351 11.9338 10.8843 11.9338 10.6062 12.2134Z"
      fill="#FFFCF5"
    />
    <path
      d="M35.2307 6.60744C35.2093 6.52169 35.1237 6.45737 35.0382 6.45737H30.0111C29.947 6.45737 29.8828 6.50025 29.84 6.56456C29.7972 6.62888 29.7758 6.69319 29.8186 6.77895L30.4176 8.27963V19.0417L29.5619 21.1426C29.5405 21.2069 29.5405 21.2927 29.5833 21.357C29.6261 21.4213 29.6903 21.4428 29.7758 21.4428H33.4766C33.5621 21.4428 33.6263 21.4213 33.6691 21.357C33.7119 21.2927 33.7119 21.2069 33.6905 21.1426L32.8348 19.0417V11.1952L37.2843 21.5928C37.3271 21.6571 37.3913 21.7215 37.4768 21.7215C37.5624 21.7215 37.648 21.6786 37.6907 21.5928L42.8034 10.7236V19.6419L42.2044 21.1426C42.1616 21.2069 42.183 21.2927 42.2258 21.357C42.2686 21.4213 42.3327 21.4428 42.3969 21.4428H47.2742C47.3598 21.4428 47.424 21.4213 47.4667 21.357C47.5095 21.2927 47.5095 21.2069 47.4881 21.1426L46.8892 19.6419V8.27963L47.4881 6.77895C47.5095 6.69319 47.5095 6.62888 47.4667 6.56456C47.424 6.50025 47.3598 6.45737 47.2742 6.45737H42.29C42.183 6.45737 42.1188 6.52169 42.076 6.586L38.4608 14.1966L35.2307 6.60744Z"
      fill="#FFFDF7"
    />
    <path
      d="M60.3728 19.6419V14.5182C60.3728 9.56593 52.9712 9.93038 49.8267 11.281C49.7839 11.3024 49.7411 11.3453 49.7197 11.4096C49.6983 11.4739 49.6983 11.5168 49.7197 11.5811L50.6609 13.5535C50.7037 13.5963 50.7465 13.6392 50.8107 13.6606C50.8749 13.6821 50.939 13.6606 50.9818 13.6178C52.1584 12.7817 54.4045 11.4954 55.8163 12.3743C56.1586 12.5887 56.2656 13.0175 56.3083 13.4248C56.287 13.4248 56.2656 13.4248 56.2442 13.4248C54.0622 13.4248 51.6664 13.9608 50.1048 15.6115C49.0994 16.6834 48.5218 18.2699 49.1207 19.7063C49.7197 21.1426 51.2171 21.7 52.6932 21.7C54.0408 21.7 55.2602 21.357 56.3083 20.5638V21.2284C56.3083 21.357 56.3939 21.4428 56.5223 21.4428H60.7792C60.8648 21.4428 60.929 21.4213 60.9717 21.357C60.9931 21.2927 61.0145 21.2284 60.9931 21.1641L60.3728 19.6419ZM56.3083 17.0693C56.3083 17.884 55.9447 18.6343 55.2602 19.0845C54.8323 19.3847 54.1264 19.5776 53.6558 19.2346C53.3991 19.0631 53.3135 18.7844 53.2921 18.4843C53.2493 17.7554 53.613 16.9836 54.0836 16.4262C54.6612 15.7616 55.4313 15.3757 56.3083 15.29V17.0693Z"
      fill="#FFFDF7"
    />
    <path
      d="M72.9188 25.859H74.2665C74.5446 25.859 74.6515 25.8805 74.7371 25.709C75.9992 23.3293 74.6729 20.1993 71.4 20.8425C69.9026 21.1212 67.6137 21.7858 66.373 22.0216C64.8756 22.3432 64.6402 20.5638 65.9451 20.2636C67.357 19.9635 68.6191 20.1993 69.9668 19.9206C71.4214 19.6205 72.7691 18.9559 73.6461 17.7339C74.9082 15.9331 74.6088 13.5963 73.0044 12.0956C73.5178 11.817 74.1595 11.6669 74.7371 11.6026C74.8869 11.5811 74.9724 11.4311 74.9082 11.3024L73.6889 8.66552C73.6247 8.53689 73.4964 8.49401 73.3894 8.55833C72.4268 9.11572 71.7637 10.0161 71.3144 11.0237C70.3518 10.6378 69.2822 10.4878 68.234 10.4878C61.8165 10.4878 60.3619 16.3404 64.0413 18.913C62.5652 19.5562 61.1962 21.893 62.0946 23.7367C62.8006 25.2373 64.3622 25.709 65.9451 25.709C67.2928 25.6875 70.2449 24.9158 71.5711 24.5299C72.6835 24.1869 73.2825 24.8514 72.7691 25.5803C72.7691 25.6018 72.7477 25.6018 72.7477 25.6018C72.7263 25.6447 72.7263 25.6875 72.7477 25.709C72.7477 25.7304 72.7477 25.7519 72.7477 25.7733C72.7691 25.7733 72.7691 25.7947 72.7691 25.7947C72.8119 25.8376 72.8546 25.859 72.9188 25.859ZM70.2021 14.9255C70.3732 15.5472 70.4374 16.2761 70.2663 16.9193C69.8812 18.4414 68.5977 18.6343 67.4853 17.5839C66.9078 17.0265 66.5013 16.2547 66.2874 15.4829C66.1163 14.8398 66.0735 14.1323 66.2232 13.4677C66.373 12.8674 66.758 12.2672 67.4212 12.16C68.0201 12.0742 68.5977 12.4172 69.0255 12.8246C69.6031 13.3819 70.0096 14.1537 70.2021 14.9255Z"
      fill="#FFFDF7"
    />
    <path
      d="M80.7097 19.6419V10.9594C80.7097 10.8951 80.6883 10.8308 80.6456 10.7879C80.5814 10.745 80.5172 10.7236 80.453 10.745L76.7951 11.7312C76.7951 11.7526 76.7951 11.7526 76.7951 11.7526L76.0463 11.9885C75.9822 12.0099 75.918 12.0528 75.8966 12.1171C75.8752 12.1814 75.8752 12.2457 75.918 12.31L76.6453 13.5106V19.6419L76.0463 21.1641C76.0036 21.2284 76.025 21.2927 76.0677 21.357C76.1105 21.4213 76.1747 21.4428 76.2389 21.4428H81.1162C81.2017 21.4428 81.2659 21.4213 81.3087 21.357C81.3515 21.2927 81.3515 21.2284 81.3301 21.1641L80.7097 19.6419ZM76.41 7.89374C76.41 9.09428 77.394 10.059 78.592 10.059H78.6133H78.6347C79.8327 10.0804 80.8167 9.09428 80.8167 7.89374C80.8167 6.67176 79.8327 5.70703 78.6347 5.70703H78.6133H78.592C77.394 5.70703 76.41 6.67176 76.41 7.89374Z"
      fill="#FFFDF7"
    />
    <path
      d="M93.3017 12.2457C93.3017 12.1814 93.2804 12.1171 93.2376 12.0742C92.0182 10.8951 90.2855 10.4878 88.617 10.4878C85.2157 10.4878 82.4562 12.4815 82.4562 16.0832C82.4562 19.7063 85.1943 21.7 88.617 21.7C90.4566 21.7 92.3605 21.1855 93.5798 19.7491C93.644 19.6634 93.644 19.5562 93.5798 19.4704C93.5157 19.3847 93.3873 19.3632 93.3017 19.4061C92.5744 19.8349 91.7402 20.0278 90.9059 20.0278C90.6492 20.0278 90.4139 20.0064 90.1572 19.9635C87.9966 19.6634 86.7345 17.9483 86.4136 15.8902C86.2853 15.0541 86.3281 14.0894 86.5848 13.2962C86.7559 12.7817 87.0982 12.1171 87.6757 11.9885C88.5528 11.7741 89.3657 12.7174 89.7935 13.3605C90.0074 13.725 90.1999 14.0894 90.3497 14.4753C90.3925 14.5396 90.4353 14.6039 90.4994 14.6039C90.585 14.6254 90.6492 14.6039 90.692 14.5611L93.2162 12.3958C93.2804 12.3529 93.3017 12.31 93.3017 12.2457Z"
      fill="#FFFDF7"
    />
    <path
      d="M108.017 7.74367C107.996 7.67936 107.953 7.61504 107.91 7.5936C106.114 6.62888 104.531 6.09292 102.498 6.09292C100.894 6.09292 99.204 6.45737 97.8991 7.44353C97.0434 8.08668 96.4017 9.00853 96.2733 10.1019C96.1878 10.6164 96.252 11.1309 96.4231 11.6454C97.3857 14.6039 102.135 15.3114 104.21 17.4552C104.466 17.7339 104.702 18.0769 104.787 18.4414C104.851 18.6343 104.873 18.913 104.766 19.106C104.68 19.256 104.552 19.3847 104.402 19.4919C103.846 19.8992 102.99 19.792 102.37 19.6419C101.407 19.4061 100.466 18.913 99.6318 18.3985C98.8617 17.884 98.0916 17.2623 97.4713 16.5763C97.4285 16.5119 97.3643 16.4905 97.3001 16.4905C97.2146 16.5119 97.1718 16.5334 97.129 16.5977L95.0326 19.5347C95.0112 19.5776 94.9898 19.6419 95.0112 19.7063C95.0112 19.7706 95.054 19.8134 95.0968 19.8563C96.9579 20.9925 99.1826 21.8072 101.365 21.8072C103.482 21.8072 105.771 21.5071 107.333 19.9421C108.167 19.0845 108.681 18.0769 108.595 16.855C108.595 16.6191 108.531 16.3833 108.467 16.1475C107.889 14.411 105.75 13.2319 104.231 12.4387C103.653 12.1171 103.055 11.817 102.456 11.5168C101.942 11.2381 101.407 10.938 100.915 10.6164C100.488 10.3377 100.102 9.93038 99.9313 9.4373C99.803 9.09428 99.803 8.72983 99.9955 8.40826C100.231 8.02237 100.659 7.8723 101.086 7.8723C102.926 7.8723 104.616 9.39442 105.472 10.938C105.515 11.0023 105.579 11.0452 105.664 11.0452C105.728 11.0452 105.793 11.0237 105.857 10.9594L107.975 7.91518C108.017 7.85086 108.039 7.80799 108.017 7.74367Z"
      fill="#FFFDF7"
    />
    <path
      d="M113.197 11.7741C113.111 11.5383 113.261 11.088 113.154 10.8737C113.132 10.7879 113.047 10.745 112.961 10.745H108.491C108.405 10.745 108.341 10.7665 108.298 10.8308C108.255 10.8951 108.255 10.9809 108.277 11.0452L113.026 21.3356C113.068 21.3999 113.154 21.4428 113.239 21.4428H115.913C115.999 21.4428 116.063 21.3999 116.106 21.3141L118.395 16.0832L120.812 21.3356C120.855 21.3999 120.94 21.4428 121.026 21.4428H123.7C123.786 21.4428 123.85 21.3999 123.893 21.3141L128.385 11.0452C128.406 10.9809 128.406 10.8951 128.363 10.8308C128.321 10.7665 128.256 10.745 128.171 10.745H124.641C124.513 10.745 124.427 10.8094 124.427 10.9165L123.465 17.4552C122.481 15.2685 121.561 13.0604 120.598 10.8737C120.555 10.7879 120.491 10.745 120.384 10.745H116.277C116.192 10.745 116.127 10.7665 116.085 10.8308C116.042 10.8951 116.042 10.9809 116.063 11.0452L117.325 13.7464L115.764 17.6482C114.844 15.633 114.095 13.8107 113.197 11.7741Z"
      fill="#FFFDF7"
    />
    <path
      d="M140.132 19.6419V14.5182C140.132 9.56593 132.73 9.93038 129.586 11.281C129.543 11.3024 129.5 11.3453 129.479 11.4096C129.458 11.4739 129.458 11.5168 129.479 11.5811L130.42 13.5535C130.463 13.5963 130.506 13.6392 130.57 13.6606C130.634 13.6821 130.698 13.6606 130.741 13.6178C131.918 12.7817 134.164 11.4954 135.576 12.3743C135.918 12.5887 136.025 13.0175 136.068 13.4248C136.046 13.4248 136.025 13.4248 136.003 13.4248C133.821 13.4248 131.426 13.9608 129.864 15.6115C128.859 16.6834 128.281 18.2699 128.88 19.7063C129.479 21.1426 130.976 21.7 132.452 21.7C133.8 21.7 135.019 21.357 136.068 20.5638V21.2284C136.068 21.357 136.153 21.4428 136.281 21.4428H140.538C140.624 21.4428 140.688 21.4213 140.731 21.357C140.752 21.2927 140.774 21.2284 140.752 21.1641L140.132 19.6419ZM136.068 17.0693C136.068 17.884 135.704 18.6343 135.019 19.0845C134.592 19.3847 133.886 19.5776 133.415 19.2346C133.158 19.0631 133.073 18.7844 133.051 18.4843C133.009 17.7554 133.372 16.9836 133.843 16.4262C134.42 15.7616 135.19 15.3757 136.068 15.29V17.0693Z"
      fill="#FFFDF7"
    />
    <path
      d="M146.702 20.5638C147.558 21.3141 148.563 21.6571 149.718 21.7C150.232 21.7429 150.724 21.7 151.216 21.5714C152.328 21.2927 153.355 20.671 154.082 19.7491C154.895 18.7415 155.28 17.4981 155.28 16.1904C155.28 13.725 153.548 11.3239 151.152 10.6593C150.339 10.4235 149.505 10.4235 148.713 10.6378C147.943 10.8308 147.28 11.2596 146.702 11.7955V10.9594C146.702 10.8308 146.617 10.745 146.488 10.745H146.403C146.381 10.745 146.36 10.745 146.317 10.7665L146.189 10.8094L142.788 11.7312C142.788 11.7526 142.788 11.7526 142.788 11.7526L142.039 11.9885C141.975 12.0099 141.91 12.0528 141.889 12.1171C141.868 12.1814 141.868 12.2457 141.91 12.31L142.638 13.5106V25.4946C142.638 25.5589 142.659 25.6232 142.723 25.6661C142.766 25.709 142.852 25.7304 142.916 25.709L146.552 24.7014L147.323 24.4656C147.387 24.4441 147.43 24.4012 147.451 24.3369C147.472 24.2726 147.472 24.2083 147.43 24.144L146.702 22.9434V20.5638ZM146.895 14.4967C147.066 13.9393 147.387 13.3605 147.943 13.1032C148.007 13.0818 148.093 13.0389 148.157 13.0175C148.264 12.9961 148.349 12.9961 148.456 12.9961C149.034 12.9746 149.569 13.3605 149.954 13.7678C150.489 14.3895 150.852 15.2042 151.023 15.9974C151.216 16.855 151.323 17.884 151.023 18.7201C150.831 19.2346 150.467 19.6848 149.932 19.8349C149.312 20.0064 148.692 19.7706 148.221 19.3847C147.515 18.8058 147.087 17.884 146.895 16.9836C146.702 16.1904 146.659 15.29 146.895 14.4967Z"
      fill="#FFFDF7"
    />
  </svg>
);

export const HONEY_25 = "#FFFDF7";

export const NIGHT_100 = "#E7E8E9";

export const NIGHT_200 = "#CFD1D4";

export const NIGHT_400 = "#9FA3A9";

export const generateOgImage = async (
  content: React.ReactNode,
  origin: string
) => {
  const fontData = await Promise.all([
    loadFont(origin, "ABCWhyteVariable.woff", 500),
    loadFont(origin, "ABCWhyte-Bold.otf", 600),
    loadFont(origin, "ABCWhyte-Black.otf", 700),
  ]).then((fonts) => fonts.flat());

  const options: SatoriOptions = {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts: fontData,
  };

  const svg = await satori(
    <div
      tw="flex relative"
      style={{
        width: options.width,
        height: options.height,
        fontFamily: "ABCWhyte",
        fontSize: 45,
        backgroundImage: `url(${origin}/img/thumbnail.png)`,
      }}
    >
      {content}
    </div>,
    options
  );

  const resvg = new Resvg(svg);

  const pngData = resvg.render();

  return pngData.asPng();
};
