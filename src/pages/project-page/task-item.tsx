import { Task } from "../../models/projects-model";
import { useState } from "react";
import style from "./task.module.scss"
import { TaskForm } from "./task-form";
import Modal from "../../components/modals/modal";

type ITaskItemProps = {
  task?: Task
  condId?: string
  projId?: string
}

export const TaskItem: React.FunctionComponent<ITaskItemProps> = ({ task, condId, projId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  if (task) {
    const { displayName, description } = task
    return <div className={style.task}>
      <div className={style.taskTitle}>{displayName}</div>
      <div className={style.taskDesc}>{description}</div>
    </div>
  } else {
    return <div className={style.task}>
      {(condId && projId) && <Modal title="Add project" isOpen={isModalOpen} setIsOpen={setIsModalOpen} closeButtonText="Cancel">
        <TaskForm projectId={projId} conditionId={condId} closeModalAction={setIsModalOpen} />
      </Modal>}
      <div className={style.taskDesc} onClick={() => setIsModalOpen(true)}>+ Add task</div>
    </div>
  }


}



