import React, { PropsWithChildren, useContext, useState } from "react"
import Layout, { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { Button, Divider, Space, theme } from "antd";
import { realtimeDatabasePaths } from "../models/realtime-database-paths";
import { UserContext } from "../providers/userContext";
import { useRTDBValue } from "../hooks/useRtdbValue";
import { RTDBProjects } from "../models/projects-model";
import { ProjectsMenu } from "../components/appBar/projectsMenu";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { ConfirmModal } from "../components/modals/confirmModal";
import { useNavigate, useParams } from "react-router-dom";
import projectsService from "../services/projects";
import { getDatabase } from "firebase/database";

const PageContainer: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
	const { user } = useContext(UserContext)
	const projectssPath = realtimeDatabasePaths.projectsPath(user?.uid!)
	const { isLoading: isProjectsLoading, data: projects } = useRTDBValue<RTDBProjects>(projectssPath);
	const { id: projectId } = useParams()
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const {
		token: { colorBgContainer, borderRadiusLG }
	} = theme.useToken();
	const navigate = useNavigate()

	const onDeleteProject = async () => {
		navigate("/")
		await projectsService(getDatabase(), user?.uid!).delete(projectId!)
	}
	// if (!projects) {
	// 	return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="Loading" fullscreen />
	// }
	// if (!projects[projectId!]) {
	// 	return <NotFound />
	// }
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
			<ProjectsMenu projects={projects} isProjectsLoading={isProjectsLoading} isFoldersLoading={isFoldersLoading} />
		</Sider>
		<Layout>
			<Header style={{
				margin: '24px 16px 0',
				background: colorBgContainer,
				borderRadius: borderRadiusLG,
			}}>
				<ConfirmModal
					title="Удалить проект"
					message={`Вы уверены что хотите удалить проект "${projects && projectId ? projects[projectId].displayName : ""}"?`}
					open={isDeleteModalOpen}
					confirm={onDeleteProject}
					cancel={() => setIsDeleteModalOpen(false)}
				/>
				<Space align="center">
					<Text strong>{projects && projectId ? projects[projectId].displayName : ""}</Text>
					<Divider type="vertical" />
					<Button icon={<EditOutlined />} type="primary" />
					{/* <Button icon={<PlusOutlined />} type="primary">Add project</Button> */}
					<Button icon={<DeleteOutlined />} onClick={() => setIsDeleteModalOpen(true)} danger />
				</Space>
			</Header>
			<Content style={{ margin: '24px 16px 0', overflow: "hidden" }}>
				<div
					style={{
						padding: 24,
						minHeight: 360,
						background: colorBgContainer,
						borderRadius: borderRadiusLG,
					}}
				>
					{projectId ? children : null}
				</div>
			</Content>
		</Layout>
	</Layout>
}

export default PageContainer
