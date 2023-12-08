import React, { PropsWithChildren, ReactNode } from 'react'
import styles from './modal.module.scss'
import { Button } from '../UI/inputs/button';

type IModalProps = {
  title: string;
  isOpen: boolean;
  setIsOpen: Function
  closeButtonText?: string
  onCancel?: Function
  actionFunc?: Function
  actionText?: string
}

const Modal: React.FunctionComponent<PropsWithChildren & IModalProps> = (props) => {
  const { children, title, isOpen, setIsOpen, closeButtonText, onCancel, actionFunc, actionText } = props
  if (!isOpen) return null
  //todo close on esc
  // console.log(Object.keys(children!).toString())
  const onClose = () => {
    onCancel && onCancel()
    setIsOpen(false)
  }
  return (
    <div className={styles.overlay} onClick={() => onClose()}>
      <div className={styles.modalContainer} onClick={e => {
        e.preventDefault()
        e.stopPropagation()
      }}>
        <button className={styles.modalButtonClose} onClick={() => onClose()}>X</button>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>{title}</h4>
        </div>
        <div className={styles.modalBody} >
          {children}
        </div>
        <div className={styles.modalFooter} >
          {
            actionFunc && actionText && <Button
              onClick={() => actionFunc()}
              text={actionText || "Close"}
            />
          }
          <Button
            onClick={() => onClose()}
            text={closeButtonText || "Close"}
          />
        </div>
      </div>
    </div>
  )
}
export default Modal