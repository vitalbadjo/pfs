import React, { PropsWithChildren, useContext } from "react"
import Layout from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { realtimeDatabasePaths } from "../models/realtime-database-paths";
import { UserContext } from "../providers/userContext";
import { useRTDBValue } from "../hooks/useRtdbValue";
import { RTDBProjects } from "../models/projects-model";
import { ProjectsMenu } from "../components/appBar/projectsMenu";

const PageContainer: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
	const { user } = useContext(UserContext)
	const projectssPath = realtimeDatabasePaths.projectsPath(user?.uid!)
	const { isLoading: isProjectsLoading, data: projects } = useRTDBValue<RTDBProjects>(projectssPath);

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
			<ProjectsMenu projects={projects} isProjectsLoading={isProjectsLoading} />
		</Sider>
		{children}
	</Layout>
}

export default PageContainer
