import React, { useState } from "react"

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

	return <li>
		<button
			id="basic-button"
			aria-controls={open ? 'basic-menu' : undefined}
			aria-haspopup="true"
			aria-expanded={open ? 'true' : undefined}
			onClick={handleClick}
		>
		</button>
		<ul
			id="basic-menu"

		>
			<li onClick={handleClose}>Delete</li>
			<li onClick={handleClose}>Edit</li>
		</ul>
		{`${title} ${amount}${currency}`}

	</li>
}
export default TransactionItem
