import classNames from "classnames";
import { memo } from "react";

interface ButtonProps {
  children: React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
  ternary?: boolean;
  outline?: boolean;
  rounded?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const Button = memo(
  ({
    children,
    primary,
    secondary,
    ternary,
    outline,
    rounded,
    type = "button",
    disabled = false,
    className,
    ...rest
  }: ButtonProps) => {
    const buttonClasses = classNames(
      "text-center py-3 px-4 border",
      {
        "bg-purple-900 text-white hover:bg-purple-700": primary,
        "bg-gray-500 text-white hover:bg-gray-700": secondary,
        "bg-purple-400 text-white hover:bg-purple-900": ternary,
        "bg-transparent border-blue-600 text-blue-600 hover:bg-blue-50":
          outline,
        "rounded-full": rounded,
        "rounded-md": !rounded,
        "opacity-50 cursor-not-allowed": disabled,
      },
      className,
    );

    return (
      <button
        type={type}
        disabled={disabled}
        className={buttonClasses}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

export default Button;
