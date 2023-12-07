import TransactionForm from "../components/transactions/transaction-form"
import TransactionList from "../components/transactions/transaction-list"

export default function Dashboard() {
	return <>
		<TransactionList type="outcomes" />
		<TransactionList type="incomes" />
		<TransactionForm type="outcome"/>
	</>
}
