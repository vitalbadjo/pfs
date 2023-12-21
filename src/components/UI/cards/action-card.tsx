import { FunctionComponent } from "react";

type IActionardProps = {
  title?: string
  onClick?: () => void
}

export const ActionCard: FunctionComponent<IActionardProps> = ({ title, onClick }) => {
  return <div >
    <div onClick={onClick}>
      <p >{title}</p>
    </div>
  </div>
}