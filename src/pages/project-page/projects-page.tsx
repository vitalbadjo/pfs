import { RTDBProjects, TaskCondition } from "../../models/projects-model";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../providers/userContext";
import { getDatabase, onValue, ref } from "firebase/database";
import { realtimeDatabasePaths } from "../../models/realtime-database-paths";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./projects-page.module.scss"
import { Unsubscribe } from "firebase/auth";
import { Conditions } from "./conditions/conditions";
import { Tasks } from "./tasks/tasks";
import { Button, Divider, Layout, Space, Typography, theme } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { ConfirmModal } from "../../components/modals/confirmModal";
import projectsService from "../../services/projects";
import { useRTDBValue } from "../../hooks/useRtdbValue";

let unsubscribe: Unsubscribe = () => { }
type ConditionsRaw = Record<string, TaskCondition>

export const ProjectsPage: React.FunctionComponent = () => {
  const { user } = useContext(UserContext)
  const { id: projectId } = useParams()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const navigate = useNavigate()

  const projectssPath = realtimeDatabasePaths.projectsPath(user?.uid!)
  const { data: projects } = useRTDBValue<RTDBProjects>(projectssPath);

  const [conditionsRaw, setConditionsRaw] = useState<ConditionsRaw>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)



  useEffect(() => {

    if (projectId) {
      unsubscribe()
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.conditionsPath(user?.uid!, projectId))

      unsubscribe = onValue(txRef, (snapshot) => {
        const data = snapshot.val();
        if (!!data) {
          setConditionsRaw(data)
        } else {
          setConditionsRaw({})
          console.log('Data not found (conditions)');
        }
      });
    }
    return unsubscribe
  }, [user?.uid, projectId])

  const onDeleteProject = async () => {
    navigate("/projects")
    await projectsService(getDatabase(), user?.uid!).delete(projectId!)
  }

  const conditionsArray = useMemo(() => {
    return Object.values(conditionsRaw).sort((a, b) => a.orderId - b.orderId)
  }, [conditionsRaw])

  if (!projectId) {
    return <div>Пожалуйста выберите проект в меню</div>
  }

  return <Layout>
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
        <Typography.Text strong>{projects && projectId ? projects[projectId].displayName : ""}</Typography.Text>
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
        <div className={styles.projectGrid}>
          <Conditions
            id={projectId}
            conditionsRaw={conditionsRaw}
            conditions={conditionsArray}
            setConditionsRaw={setConditionsRaw}
          />
          <Tasks
            projectId={projectId}
            conditionsArray={conditionsArray}
          />
        </div>
      </div>
    </Content>
  </Layout>
}



