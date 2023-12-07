import {
	IconButton,
	ListItem,
	ListItemText,
	Menu,
	MenuItem,
} from "@mui/material"
import React, { useState } from "react"
import { MoreVert } from "@mui/icons-material"

export type ITransactionItemProps = {
	title: string
	amount: string
	currency: string
}

const TransactionItem: React.FunctionComponent<ITransactionItemProps> = ({ title, amount, currency }) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return <ListItem
		secondaryAction={
			<>
				<IconButton
					id="basic-button"
					aria-controls={open ? 'basic-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClick}
				>
					<MoreVert />
				</IconButton>
				<Menu
					id="basic-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					MenuListProps={{
						'aria-labelledby': 'basic-button',
					}}
				>
					<MenuItem onClick={handleClose}>Delete</MenuItem>
					<MenuItem onClick={handleClose}>Edit</MenuItem>
				</Menu>
			</>
		}
	>
		<ListItemText primary={`${title} ${amount}${currency}`} />

	</ListItem>
}
export default TransactionItem
