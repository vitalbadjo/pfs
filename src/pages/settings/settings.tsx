import { Box, Button, Typography } from "@mui/material"
import { useContext } from "react"
import { UserContext } from "../../providers/userContext"
import { useNavigate } from "react-router-dom"

const SettingsPage = () => {
	const {settings} = useContext(UserContext)
	const navigate = useNavigate()
	return <>
		<Box>
			<Typography>Default currency: {settings.defaultCurrency}</Typography>
			<Typography>Language: {settings.language}</Typography>
			<Button variant="contained" onClick={() => navigate("/settings/categories")}>Edit categories</Button>
			<Button variant="contained" onClick={() => navigate("/settings/currencies")}>Edit currencies</Button>
		</Box>
	</>
}
export default SettingsPage
