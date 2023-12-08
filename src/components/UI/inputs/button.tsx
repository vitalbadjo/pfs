import { FunctionComponent, MouseEventHandler } from "react"
import styles from "./button.module.scss"

type IButtonProps = {
  text: string
  styleType?: "error" | "success"
  onClick: MouseEventHandler<HTMLButtonElement>
}

export const Button: FunctionComponent<IButtonProps> = (props) => {
  const { text, onClick, styleType } = props
  return <button
    className={`${styles.button} ${styleType && styles[styleType]}`}
    onClick={onClick}
  >
    {text}
  </button>
}