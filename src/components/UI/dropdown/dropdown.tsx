import { FunctionComponent, PropsWithChildren, useEffect, useRef, useState } from "react"
import styles from "./dropdown.module.scss"


type IDropdownProps = {
  hover: boolean
  id?: string
}

export const Dropdown: FunctionComponent<PropsWithChildren & IDropdownProps> = (props) => {
  const { children, id } = props
  const [visible, setVisible] = useState(false)
  const backDropRef = useRef<any>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (backDropRef.current && !backDropRef.current.contains(event.target)) {
        setVisible(false)
      }
    }
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible])

  return <div
    ref={backDropRef}
    id={id}
    className={styles.dropdownButton}
    onClick={(e) => {
      e.stopPropagation()
      e.preventDefault()
      setVisible(!visible)
    }}
  >

    <div className={`${styles.dropdownContainer} ${visible && styles.dropdownContainerVisible}`}>
      {children}
    </div>
  </div>
}