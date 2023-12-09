import { Task } from "../../models/projects-model";
import { useContext, useState } from "react";
import style from "./task.module.scss"
import { TaskForm } from "./task-form";
import Modal from "../../components/modals/modal";
import { UserContext } from "../../providers/userContext";
import { getDatabase } from "firebase/database";
import tasksService from "../../services/tasks";
import { Dropdown } from "../../components/UI/dropdown/dropdown";
import { Button } from "../../components/UI/inputs/button";

type ITaskItemProps = {
  task?: Task
  condId?: string
  projId?: string
}

export type TaskData = Omit<Task, "projectId" | "taskCondition" | "id">
const defaultTaskData: TaskData = { displayName: "" }
export const TaskItem: React.FunctionComponent<ITaskItemProps> = ({ task, condId, projId }) => {
  const { user } = useContext(UserContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [taskData, setTaskData] = useState<TaskData>(defaultTaskData)
  const onSaveTask = async () => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, projId!, condId!)
        .create(taskData)
      setTaskData(defaultTaskData)
      setIsModalOpen(false)
    }
  }
  const onEditTask = async () => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, task?.projectId!, task?.taskCondition!)
        .update(task?.id!, taskData)
      setTaskData(defaultTaskData)
      setIsEditModalOpen(false)
    }
  }
  const onDeleteTask = async () => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, task?.projectId!, task?.taskCondition!)
        .delete(task?.id!)
      setIsDeleteModalOpen(false)
    }
  }

  if (task) {
    const { displayName, description } = task
    return <div className={style.task}>
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
      <div className={style.taskTitle}>
        {displayName}
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
      <div className={style.taskDesc}>{description}</div>
    </div>
  } else {
    return <div className={style.task}>
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
      <div className={style.taskDesc} onClick={() => setIsModalOpen(true)}>&nbsp;+ Добавить задачу</div>
    </div>
  }


}



