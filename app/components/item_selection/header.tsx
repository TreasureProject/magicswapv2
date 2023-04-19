import { Settings as SettingsIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  subtitle?: string;
  Icon?: React.ElementType;
  iconLink?: string;
}

export const Header = ({ title, subtitle, Icon, iconLink = "/" }: Props) => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        {!!Icon && iconLink ? (
          <Link to={iconLink}>
            {!!Icon && (
              <Icon className="w-6 cursor-pointer text-night-500 transition-colors hover:text-night-400" />
            )}
          </Link>
        ) : (
          !!Icon && <Icon className="w-6 text-night-500" />
        )}
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-[160%] text-night-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-medium leading-[160%] text-night-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {/* <IconDropdown Icon={SettingsIcon} className="text-night-400">
        Settings
      </IconDropdown> */}
    </div>
  );
};
