import Image from "next/image";
import slackLogo from "../../../assets/slack-icon-size_256.png";

export function SlackMark({ size = 16 }: { size?: number }) {
  return <Image alt="" aria-hidden="true" height={size} src={slackLogo} style={{ flexShrink: 0 }} width={size} />;
}
