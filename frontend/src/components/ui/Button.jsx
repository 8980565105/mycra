import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary", // default variant
  size = "md",         // default size
  className = "",
  type = "button",
  disabled = false,
}) => {
  // Variant styles
  const variants = {
    common: "bg-color-100 text-white text-[18px] min-w-[200px] py-[8px] md:py-[15px]  ",
    secondary: "bg-white text-black text-[18px] min-w-[200px] py-[8px] md:py-[15px] box-shadow",
    outline: "border light-border text-black text-[18px] min-w-[200px] py-[8px] md:py-[15px] ",
  };

  // Size styles
  const sizes = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-6 text-base",
    lg: "py-3 px-8 text-[18px]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[3px]  inline-flex  justify-center transition duration-300 ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
