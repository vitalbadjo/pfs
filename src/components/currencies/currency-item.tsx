import React, { useState } from "react"
import { Currency } from "../../models/currency"

export type ICurrencyItemProps = Currency

const CurrencyItem: React.FunctionComponent<ICurrencyItemProps> = ({ displayName }) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	return <li	>
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
		{displayName}
	</li>
}
export default CurrencyItem
