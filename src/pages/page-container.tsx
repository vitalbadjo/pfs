import React, { PropsWithChildren } from "react"
import AppBar from "../components/appBar/appBar";
import Layout, { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { Menu, theme } from "antd";

const PageContainer: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken();
	return <Layout>
		<Sider
			breakpoint="lg"
			collapsedWidth="0"
			onBreakpoint={(broken) => {
				console.log(broken);
			}}
			onCollapse={(collapsed, type) => {
				console.log(collapsed, type);
			}}
		>
			<div className="demo-logo-vertical" />
			<AppBar />
		</Sider>
		<Layout>
			<Header style={{ padding: 0, background: colorBgContainer }} />
			<Content style={{ margin: '24px 16px 0' }}>
				<div
					style={{
						padding: 24,
						minHeight: 360,
						background: colorBgContainer,
						borderRadius: borderRadiusLG,
					}}
				>
					{children}
				</div>
			</Content>
		</Layout>
	</Layout>
	// return <div className={styles.pageContainer}>
	// 	<nav className={styles.header}>
	// 		<Header />
	// 	</nav>
	// 	<div className={styles.leftBar}>
	// 		<AppBar />
	// 	</div>
	// 	<div className={styles.body}>{children}</div>
	// </div>
}

export default PageContainer
