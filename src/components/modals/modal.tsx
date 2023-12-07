import React, { PropsWithChildren } from 'react'
import styles from './modal.module.scss'

type IModalProps = {
  title: string;
  isOpen: boolean;
  setIsOpen: Function
  closeButtonText?: string
}

const Modal: React.FunctionComponent<PropsWithChildren & IModalProps> = (props) => {
  const { children, title, isOpen, setIsOpen, closeButtonText } = props
  if (!isOpen) return null
  //todo close on esc
  // console.log(Object.keys(children!).toString())
  return (
    <div className={styles.overlay} onClick={(e) => setIsOpen(false)}>
      <div className={styles.modalContainer} onClick={e => {
        e.preventDefault()
        e.stopPropagation()
      }}>
        <button className={styles.modalButtonClose} onClick={() => setIsOpen(false)}>X</button>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>{title}</h4>
        </div>
        <div className={styles.modalBody} >
          {children}
        </div>
        <div className={styles.modalFooter} >
          <button className={styles.modalButton} onClick={() => setIsOpen(false)}>{closeButtonText || "Close"}</button>
        </div>
      </div>
    </div>
  )
}
export default Modal