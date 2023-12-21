import { FunctionComponent, PropsWithChildren } from "react";
import { APP_CONSTANTS } from "../../../config/constants";

type ISimpleCardProps = {
  title?: string
  desc?: string
  background?: keyof typeof APP_CONSTANTS.styles.colors.cardBackgrounds
  key: string
  onClick?: () => void
}

export const SimpleCard: FunctionComponent<PropsWithChildren & ISimpleCardProps> = ({ children, key, title, desc, background, onClick }) => {
  return <div key={key}>
    <div onClick={onClick} style={{ backgroundColor: APP_CONSTANTS.styles.colors.cardBackgrounds[background || "violet"] }}>
      <p>{title}</p>
      <p >{desc}</p>
      {children || null}
    </div>
  </div>
}