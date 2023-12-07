import { List, ListSubheader, Typography } from "@mui/material"
import TransactionItem from "./transaction-item"
import React, { useContext, useEffect, useState } from "react"
import { UserContext } from "../../providers/userContext"
import { get, getDatabase, ref } from "firebase/database"
import { realtimeDatabasePaths } from "../../models/realtime-database-paths"
import { Outcomes } from "../../models/outcomes"
import { Incomes } from "../../models/incomes"
import BigNumber from "bignumber.js"

export type ITransactionListProps = {
	type: "outcomes" | "incomes"
}

const TransactionList: React.FunctionComponent<ITransactionListProps> = ({ type }) => {
	const { user, settings } = useContext(UserContext)
	const [error, setError] = useState("")
	const [txs, setTxs] = useState<(Outcomes | Incomes)[]>([])
	const [summary, setSummary] = useState("")

	useEffect(() => {
		const db = getDatabase()
		const txRef = ref(db, realtimeDatabasePaths[type](user?.uid!))
		get(txRef).then(res => {
			if (res.exists()) {
				setTxs(Object.values(res.val()))
				setError("")
			} else {
				setError("Cant get data")
			}

		}).catch(error => {
			setError(error)
		})
	}, [user?.uid, type])

	useEffect(() => {
		const summaryBn = txs.reduce((p, c) => {
			p = c.amount ? p.plus(new BigNumber(c.amount)) : new BigNumber(0)
			console.log("p", p.toNumber())
			return p
		}, new BigNumber(0))
		setSummary(summaryBn.toString())
	}, [txs])

	const getCategoryName = (catId: string) => {
		return settings[type === "outcomes" ? "outcomeCategories" : "incomeCategories"][catId]?.displayName!
	}

	if (error) {
		return <Typography>Something went wrong</Typography>
	}

	return <List
		subheader={
			<ListSubheader component="div" id="nested-list-subheader">
				{type === "incomes" ? "Icomes" : "Expenses"} {summary}
			</ListSubheader>
		}
	>
		{txs.map(tx => {
			const catId = "outcomeCategoryId" in tx ? tx.outcomeCategoryId : tx.incomeCategoryId
			return <TransactionItem
				key={tx.id}
				title={getCategoryName(catId)}
				amount={tx.amount}
				currency={""}
			/>
		})}
	</List>
}
export default TransactionList
