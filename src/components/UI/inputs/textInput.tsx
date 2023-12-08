import { ChangeEvent, FunctionComponent, useState } from "react";
import styles from "./text-input.module.scss"

type ITextInput = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  title?: string
  type: "text" | "color"
  disabled?: boolean
  validationFunc?: (value: string) => { isValid: boolean, message: string }
  style?: Record<string, string>
}

export const TextInput: FunctionComponent<ITextInput> = (props) => {
  const { value, onChange, placeholder, title, type, disabled, validationFunc, style } = props
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(true)

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value
    const validation = validationFunc ? validationFunc(value) : { isValid, message: error }
    setIsValid(validation.isValid)
    setError(validation.isValid ? validation.message : "")
    onChange(value)

  }

  return <div className={styles.inputWrapper}>
    {title && <h4 className={styles.title}>{title}</h4>}
    <input
      style={style || {}}
      value={value}
      onChange={onChangeHandler}
      placeholder={placeholder || ""}
      type={type}
      disabled={!!disabled}
    />
    {error && <div className={styles.message}>{error}</div>}
  </div>
}