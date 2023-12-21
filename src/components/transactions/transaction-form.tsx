import { ChangeEvent, useContext, useEffect, useState } from "react"
import { UserContext } from "../../providers/userContext"
import { TransactionCategory } from "../../models/transactionCategory"
import transactionsService from "../../services/transactions"
import { getDatabase } from "firebase/database"

export type ITransactionFormProps = {
	type: "income" | "outcome"
}

const TransactionForm: React.FunctionComponent<ITransactionFormProps> = ({ type }) => {
	const { settings, user } = useContext(UserContext)
	const [loading, setLoading] = useState(false)
	const [incomesCat, setIncomesCat] = useState<TransactionCategory[]>([])
	const [outcomesCat, setOutcomesCat] = useState<TransactionCategory[]>([])
	const [form, setForm] = useState({ category: "", currency: "", desc: "", amount: "" })
	const text = type === "income" ?
		{
			title: "Add income",
			buttonText: "Add income"
		} :
		{
			title: "Add expense",
			buttonText: "Add expense"
		}

	useEffect(() => {
		const { incomeCategories, outcomeCategories, currencies } = settings
		setIncomesCat(Object.values(incomeCategories))
		setOutcomesCat(Object.values(outcomeCategories))
		if (Object.keys(currencies).length) {
			setForm(prevState => ({
				...prevState,
				currency: settings.defaultCurrency
			}))
		}
	}, [settings])

	const onSave = async () => {
		if (user?.uid) {
			setLoading(true)
			await transactionsService(getDatabase(), user?.uid, type)
				.create(type, {
					id: "",
					amount: form.amount,
					currencyId: form.currency,
					rate: "",
					description: "Test",
					date: new Date().toISOString(),
					creationDate: "",
					updateDate: "",
					deletionDate: "",
					...type === "income" ? { incomeCategoryId: form.category } : { outcomeCategoryId: form.category }
				})
			setLoading(false)
		}

	}

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, key: keyof typeof form) => {
		setForm(prevState => ({
			...prevState,
			[key]: event.target.value
		}))
	};
	return <div>
		<div>
			<input
				id="outlined-error"
				placeholder="Please enter amount"
				value={form.amount}
				onChange={e => handleChange(e, "amount")}
				required
			/>
			<input
				id="outlined-error-helper-text"
				value={form.desc}
				onChange={e => handleChange(e, "desc")}
			/>
			<form>
				<input id="currency-select-helper-label">Currency</input>
				<select
					id="currency-select-helper"
					value={form.currency}
					onChange={e => handleChange(e, "currency")}
				>
					{Object.values(settings.currencies).map(val => {
						return <div key={val.displayName} className={val.id}>{val.displayName}</div>
					})}
				</select>
				{/*<FormHelperText>With label + helper text</FormHelperText>*/}
			</form>
			<form >
				<input id="category-select-helper-label">Category</input>
				<select
					id="category-select-helper"
					value={form.category}
					onChange={e => handleChange(e, "category")}
				>
					<div className="">
						<em>None</em>
					</div>
					{(type === "income" ? incomesCat : outcomesCat).map(val => {
						return <div key={val.displayName} className={val.id}>{val.displayName}</div>
					})}
				</select>
				{/*<FormHelperText>With label + helper text</FormHelperText>*/}
			</form>
		</div>
		<div >
			<button
				disabled={loading}
				onClick={() => onSave()}
			>{text.buttonText}</button>
		</div>
	</div>
}

export default TransactionForm
