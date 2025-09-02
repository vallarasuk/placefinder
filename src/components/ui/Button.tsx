type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
  };
  
  export function Button({ variant = "primary", children, ...props }: ButtonProps) {
    const base = "px-4 py-2 rounded-lg font-medium";
    const styles =
      variant === "primary"
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-gray-200 text-black hover:bg-gray-300";
  
    return (
      <button className={`${base} ${styles}`} {...props}>
        {children}
      </button>
    );
  }
  