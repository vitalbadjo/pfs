import { Task } from "../../../models/projects-model";
import { useContext, useState } from "react";
import styles from "./task.module.scss"
import { TaskForm } from "./task-add-form";
import Modal from "../../../components/modals/modal";
import { UserContext } from "../../../providers/userContext";
import { getDatabase } from "firebase/database";
import tasksService from "../../../services/tasks";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { APP_ICONS } from "../../../config/media";
import { Card } from "antd";
import { Button } from "../../../components/UI/inputs/button";
import { Dropdown } from "../../../components/UI/dropdown/dropdown";

type ITaskItemProps = {
  task?: Task
  condId?: string
  projId?: string
  id: string
  dragOverlay?: boolean
}

export type TaskData = Omit<Task, "projectId" | "taskCondition" | "id">
const defaultTaskData: TaskData = { displayName: "", orderId: 0 }

export const TaskItem: React.FunctionComponent<ITaskItemProps> = ({ task, condId, projId, id, dragOverlay }) => {
  const { user } = useContext(UserContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [taskData, setTaskData] = useState<TaskData>(defaultTaskData)
  const onSaveTask = async () => {
    console.log("ons create")
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, projId!)
        .create(taskData, condId!)
      setTaskData(defaultTaskData)
      setIsModalOpen(false)
    }
  }
  const onEditTask = async () => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, task?.projectId!)
        .update(condId!, task?.id!, taskData)
      setTaskData(defaultTaskData)
      setIsEditModalOpen(false)
    }
  }
  const onDeleteTask = async () => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, task?.projectId!)
        .delete(task?.id!, condId!)
      setIsDeleteModalOpen(false)
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
  };

  const dragButtonStyle = { cursor: dragOverlay ? "grabbing" : "grab" }

  if (task) {
    const { displayName, description, orderId, id, taskCondition } = task
    return <div
      ref={setNodeRef}
      className={styles.task}
      style={style}
      {...listeners}
      {...attributes}
    >
      {/* todo refactor modal dom position */}
      <Modal
        title="Добавить задачу"
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        closeButtonText="Отменить"
        actionFunc={onEditTask}
        actionText="Подтвердить"
      >
        <TaskForm data={taskData} onChangeAction={setTaskData} />
      </Modal>
      <Modal
        title="Удалить задачу"
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        closeButtonText="Отменить"
        actionFunc={onDeleteTask}
        actionText="Удалить"
      >
        Вы уверены что хотите удалить задачу "{displayName}"?
      </Modal>
      <Card title={displayName} size="small" style={{ maxHeight: "121px" }}>
        <Dropdown hover={false} id={`taskItemDropdown.${id}`}>
          <Button text="Изменить" onClick={() => {
            setTaskData({
              ...task
            })
            setIsEditModalOpen(true)
          }} />
          <Button text="Удалить" onClick={() => setIsDeleteModalOpen(true)} />
        </Dropdown>
        <p>{id}</p>
        <p>{description}</p>

        <p>{orderId}</p>
      </Card>
      {/* {APP_ICONS.dragHandler({
        ...listeners,
        ...attributes,
        style: dragButtonStyle,
        className: styles.dragHandler
      })}
      <div className={styles.taskHeader}>
        <div className={styles.taskTitle} >{displayName}</div>
      </div>
      {description && <div className={styles.taskDesc}>{description}</div>}
      <div className={styles.taskDesc}>Condition {taskCondition}</div>
      <div className={styles.taskDesc}>Id {id}</div>
      <div className={styles.taskDesc}>OrderId {orderId}</div> */}
    </div>
  } else {
    return <div className={styles.task}>
      {(condId && projId) && <Modal
        title="Добавить задачу"
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        closeButtonText="Cancel"
        actionFunc={onSaveTask}
        actionText="Подтвердить"
      >
        <TaskForm data={taskData} onChangeAction={setTaskData} />
      </Modal>}
      <div className={styles.taskTitle} onClick={() => setIsModalOpen(true)}>&nbsp;+ Добавить задачу</div>
    </div>
  }


}



