import { Task } from "../../../models/projects-model";
import { useContext, useState } from "react";
import styles from "./task.module.scss"
import { TaskForm } from "./task-form";
import Modal from "../../../components/modals/modal";
import { UserContext } from "../../../providers/userContext";
import { getDatabase } from "firebase/database";
import tasksService from "../../../services/tasks";
import { Dropdown } from "../../../components/UI/dropdown/dropdown";
import { Button } from "../../../components/UI/inputs/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { APP_ICONS } from "../../../config/media";

type ITaskItemProps = {
  task?: Task
  condId?: string
  projId?: string
  id: string
}

export type TaskData = Omit<Task, "projectId" | "taskCondition" | "id">
const defaultTaskData: TaskData = { displayName: "", orderId: 0 }
export const TaskItem: React.FunctionComponent<ITaskItemProps> = ({ task, condId, projId, id }) => {
  const { user } = useContext(UserContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [taskData, setTaskData] = useState<TaskData>(defaultTaskData)
  const onSaveTask = async () => {
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
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragButtonStyle = { cursor: isDragging ? "grabbing" : "grab" }

  if (task) {
    const { displayName, description } = task
    return <div
      {...attributes}
      ref={setNodeRef}
      className={styles.task}
      style={style}
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
        Вы уверены что хотите удалить задачу "{task.displayName}"?
      </Modal>
      <div className={styles.taskHeader}>
        {APP_ICONS.dragHandler({
          ...listeners,
          ...attributes,
          style: dragButtonStyle,
          className: styles.dragHandler
        })}
        <div className={styles.taskTitle} >{displayName}</div>
        <Dropdown hover={false}>
          <Button text="Изменить" onClick={() => {
            setTaskData({
              ...task
            })
            setIsEditModalOpen(true)
          }} />
          <Button text="Удалить" onClick={() => setIsDeleteModalOpen(true)} />
        </Dropdown>
      </div>
      {description && <div className={styles.taskDesc}>{description}</div>}
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
      <div className={styles.taskDesc} onClick={() => setIsModalOpen(true)}>&nbsp;+ Добавить задачу</div>
    </div>
  }


}



