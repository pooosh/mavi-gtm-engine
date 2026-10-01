export function SlackMark({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      width={size}
      viewBox="0 0 127.14 127.14"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path
        fill="#E01E5A"
        d="M27.35 79.51a13.67 13.67 0 1 1-13.67-13.67h13.67v13.67zm6.84 0a13.67 13.67 0 1 1 27.34 0v34.17a13.67 13.67 0 1 1-27.34 0V79.51z"
      />
      <path
        fill="#36C5F0"
        d="M47.63 27.35a13.67 13.67 0 1 1 13.67-13.67v13.67H47.63zm0 6.84a13.67 13.67 0 1 1 0 27.34H13.46a13.67 13.67 0 1 1 0-27.34h34.17z"
      />
      <path
        fill="#2EB67D"
        d="M99.79 47.63a13.67 13.67 0 1 1 13.67 13.67H99.79V47.63zm-6.84 0a13.67 13.67 0 1 1-27.34 0V13.46a13.67 13.67 0 1 1 27.34 0v34.17z"
      />
      <path
        fill="#ECB22E"
        d="M79.51 99.79a13.67 13.67 0 1 1-13.67 13.67V99.79h13.67zm0-6.84a13.67 13.67 0 1 1 0-27.34h34.17a13.67 13.67 0 1 1 0 27.34H79.51z"
      />
    </svg>
  );
}
