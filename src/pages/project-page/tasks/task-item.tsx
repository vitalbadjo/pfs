import { Task } from "../../../models/projects-model";
import { useContext, useState } from "react";
import { UserContext } from "../../../providers/userContext";
import { getDatabase } from "firebase/database";
import tasksService from "../../../services/tasks";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Card, theme } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { CreateTaskFormValues, TaskCreateFormModal } from "../../../components/modals/addTaskModal";

type ITaskItemProps = {
  task?: Task
  condId?: string
  projId?: string
  id: string
  dragOverlay?: boolean
}

export const TaskItem: React.FunctionComponent<ITaskItemProps> = ({ task, condId, projId, id, dragOverlay }) => {
  const { user } = useContext(UserContext)

  const { token } = theme.useToken()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const onSaveTask = async (values: CreateTaskFormValues) => {
    if (user?.uid) {
      const { displayName, description } = values
      await tasksService(getDatabase(), user?.uid, projId!)
        .create({ displayName, description, orderId: 0 }, condId!)
      setIsModalOpen(false)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    maxHeight: "121px",
    backgroundColor: token.colorBgLayout,
    overflow: "hidden",
    cursor: dragOverlay ? "grabbing" : "grab"
  };



  if (task) {
    const { displayName, description } = task
    return <Card
      ref={setNodeRef}
      title={displayName}
      size="small"
      styles={{ header: { paddingRight: 0 } }}
      style={style}
      {...listeners}
      {...attributes}
    >
      <p>{description}</p>
    </Card>
  } else {
    return <>
      {(condId && projId) &&
        <TaskCreateFormModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onDelete={() => { }}
          onCreate={onSaveTask}
          initialValues={{ displayName: "", description: "" }}
        />
      }
      <Button onClick={() => setIsModalOpen(true)} icon={<PlusOutlined />} block>Добавить задачу</Button>
    </>
  }
}



