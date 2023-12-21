import { ChangeEvent, useContext, useState } from "react"
import { UserContext } from "../../providers/userContext"
import { getDatabase } from "firebase/database"
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

	const handleChange = (event: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof typeof form) => {
		setForm(prevState => ({
			...prevState,
			[key]: event.target.value
		}))
	};
	return <div	>
		<div>
			<textarea
				id="outlined-error"
				placeholder="Please enter currency name"
				value={form.displayName}
				onChange={e => handleChange(e, "displayName")}
				required
			/>
		</div>
		<div>
			<button
				disabled={loading}
				onClick={() => onSave()}
			>Add currency</button>
			{loading && "loading"}
			<button onClick={() => navigate("/settings")}>Back</button>
		</div>

	</div>
}

export default CurrencyForm
