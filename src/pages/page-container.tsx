import React, { PropsWithChildren, useState } from "react"
import styles from "./page-container.module.scss"
import AppBar from "../components/appBar/appBar";
import Header from "../components/header/header";

const PageContainer: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
	return <div className={styles.pageContainer}>
		<nav className={styles.header}>
			<Header />
		</nav>
		<div className={styles.leftBar}>
			<AppBar />
		</div>
		<div className={styles.body}>{children}</div>
	</div>
}

export default PageContainer
