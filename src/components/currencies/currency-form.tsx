import {
	Box, Button, CircularProgress,
	SelectChangeEvent,
	TextField,
} from "@mui/material"
import { ChangeEvent, useContext, useState } from "react"
import { UserContext } from "../../providers/userContext"
import { getDatabase } from "firebase/database"
import { green } from "@mui/material/colors"
import settingsService from "../../services/settings"
import { useNavigate } from "react-router-dom"

export type ICurrencyFormProps = {}

const CurrencyForm: React.FunctionComponent<ICurrencyFormProps> = () => {
	const { user } = useContext(UserContext)
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ displayName: "", visible: true, isFiat: true })
	const navigate = useNavigate()

	const onSave = async () => {
		if (user?.uid) {
			setLoading(true)
			await settingsService(getDatabase(), user?.uid).currencies
				.create({
					displayName: form.displayName,
					visible: form.visible,
					isFiat: form.isFiat,
					rate: ""
				})
			setLoading(false)
		}

	}

	const handleChange = (event: SelectChangeEvent | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof typeof form) => {
		setForm(prevState => ({
			...prevState,
			[key]: event.target.value
		}))
	};
	return <Box
		component="form"
		sx={{
			'& .MuiTextField-root': { m: 1, width: '25ch' },
		}}
		noValidate
		autoComplete="off"
	>
		<div>
			<TextField
				error={false}
				id="outlined-error"
				label="Currency name"
				placeholder="Please enter currency name"
				helperText=""
				value={form.displayName}
				onChange={e => handleChange(e, "displayName")}
				required
			/>
		</div>
		<Box sx={{ m: 1, position: "relative", display: "inline-grid", gap: 1 }}>
			<Button
				disabled={loading}
				onClick={() => onSave()}
				variant="contained">Add currency</Button>
			{loading && (
				<CircularProgress
					size={24}
					sx={{
						color: green[500],
						position: 'absolute',
						top: '50%',
						left: '50%',
						marginTop: '-12px',
						marginLeft: '-12px',
					}}
				/>
			)}
			<Button variant="contained" onClick={() => navigate("/settings")}>Back</Button>
		</Box>

	</Box>
}

export default CurrencyForm
