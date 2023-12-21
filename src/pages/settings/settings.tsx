import { useContext } from "react"
import { UserContext } from "../../providers/userContext"
import { useNavigate } from "react-router-dom"

const SettingsPage = () => {
	const { settings } = useContext(UserContext)
	const navigate = useNavigate()
	return <>
		<div>
			<p>Default currency: {settings.defaultCurrency}</p>
			<p>Language: {settings.language}</p>
			<button onClick={() => navigate("/settings/categories")}>Edit categories</button>
			<button onClick={() => navigate("/settings/currencies")}>Edit currencies</button>
		</div>
	</>
}
export default SettingsPage
