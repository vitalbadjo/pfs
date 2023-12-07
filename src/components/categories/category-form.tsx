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

export type ICategoryFormProps = {
	type: "incomeCategories" | "outcomeCategories"
}

const CategoryForm: React.FunctionComponent<ICategoryFormProps> = ({ type }) => {
	const { user } = useContext(UserContext)
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ displayName: "", icon: "" })
	const navigate = useNavigate()
	const text = type === "incomeCategories" ?
		{
			title: "Add income category",
			buttonText: "Add category"
		} :
		{
			title: "Add expense",
			buttonText: "Add category"
		}

	const onSave = async () => {
		if (user?.uid) {
			setLoading(true)
			await settingsService(getDatabase(), user?.uid).categories(type)
				.create({
					displayName: form.displayName,
					icon: form.icon,
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
				label="Category name"
				placeholder="Please enter category name"
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
				variant="contained">{text.buttonText}</Button>
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

export default CategoryForm
