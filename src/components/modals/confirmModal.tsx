import React, { useState } from 'react';
import { Modal } from 'antd';
import Text from "antd/lib/typography/Text"

type ConfirmModalPropsType = {
  confirm: Function
  cancel: Function
  title: string
  message?: string
  open: boolean
}

export const ConfirmModal: React.FC<ConfirmModalPropsType> = (props) => {
  const { cancel, confirm: confirn, title, message, open } = props
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    setConfirmLoading(true);
    await confirn()
    setConfirmLoading(false);
    cancel()
  };

  return (

    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={() => cancel()}
    >
      <Text>{message}</Text>
    </Modal>
  );
};
