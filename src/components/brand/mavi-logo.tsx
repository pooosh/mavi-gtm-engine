/* Official MAVI logo (assets/mavi_logo.svg, served from /public). */
export function MaviLogo({ height = 24 }: { height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="MAVI"
      className="mavi-logo"
      height={height}
      src="/mavi_logo.svg"
      style={{ height, width: "auto", flexShrink: 0, display: "inline-block" }}
      width={Math.round((height * 137) / 29)}
    />
  );
}

/* Mark-only crop of the same logo, for small spots (avatars, footers). */
export function MaviMark({ size = 24 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      aria-hidden="true"
      className="mavi-mark"
      height={size}
      src="/mavi_mark.svg"
      style={{ height: size, width: "auto", flexShrink: 0, display: "inline-block" }}
      width={Math.round((size * 36) / 29)}
    />
  );
}

