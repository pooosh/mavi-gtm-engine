export function SlackMark({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
      <g fill="none" strokeLinecap="round" strokeWidth="3.6">
        <path d="M5 10.2h6.4" stroke="#36C5F0" />
        <path d="M9.9 5v6.4" stroke="#36C5F0" />
        <path d="M13 5h.1v6.4" stroke="#2EB67D" />
        <path d="M13 9.9h6" stroke="#2EB67D" />
        <path d="M19 13.8h-6.2" stroke="#ECB22E" />
        <path d="M14.1 19v-6.2" stroke="#ECB22E" />
        <path d="M11 19h-.1v-6.2" stroke="#E01E5A" />
        <path d="M11 14.1H5" stroke="#E01E5A" />
      </g>
    </svg>
  );
}
