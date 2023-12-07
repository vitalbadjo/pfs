import { Box, Modal, Typography } from "@mui/material"
import React, { PropsWithChildren } from "react"

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

type ISimpleModalProps = {
  open: boolean
  handleClose: () => void
}

export const SimpleModal: React.FunctionComponent<PropsWithChildren & ISimpleModalProps> = ({ open, handleClose, children }) => {


  return <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={style}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Text in a modal
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
        {children}
      </Typography>
    </Box>
  </Modal>
}