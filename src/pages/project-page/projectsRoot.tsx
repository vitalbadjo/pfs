import { PlusOutlined } from "@ant-design/icons"
import { Button, Space, Spin, Typography, theme } from "antd"
import projectsService from "../../services/projects"
import { UserContext } from "../../providers/userContext"
import { FunctionComponent, useContext, useState } from "react"
import { getDatabase } from "firebase/database"
import { ProjectCreateFormModal } from "../../components/modals/addProjectModal"
import { RTDBProjects } from "../../models/projects-model"
import { useRTDBValue } from "../../hooks/useRtdbValue"
import { realtimeDatabasePaths } from "../../models/realtime-database-paths"
import Layout, { Header } from "antd/lib/layout/layout"



export const ProjectsRootPage: FunctionComponent = () => {
  const { user } = useContext(UserContext)
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();
  const [modalOpen, setModalOpen] = useState(false)
  const projectssPath = realtimeDatabasePaths.projectsPath(user?.uid!)
  const { isLoading: isProjectsLoading, data: projects } = useRTDBValue<RTDBProjects>(projectssPath);

  const onCreate = async () => {
    await projectsService(getDatabase(), user?.uid!)
  }
  if (isProjectsLoading) {
    return <Spin />
  }
  return <Layout>
    <Header style={{
      margin: '24px 16px 0',
      background: colorBgContainer,
      borderRadius: borderRadiusLG,
    }}>
      <ProjectCreateFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onCreate={onCreate}
        initialValues={{ displayName: "" }}
        projects={projects}
      />
      <Space>
        <Typography.Text>Plese select project or create new one</Typography.Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Create</Button>
      </Space>
    </Header>

  </Layout>
}