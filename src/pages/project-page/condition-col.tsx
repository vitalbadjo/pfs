import { Task, TaskCondition } from "../../models/projects-model";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../providers/userContext";
import { getDatabase, onValue, ref } from "firebase/database";
import { realtimeDatabasePaths } from "../../models/realtime-database-paths";
import { TaskItem } from "./task-item";
import style from "./condition.module.scss"
import Modal from "../../components/modals/modal";
import { ConditionForm } from "./condition-form";
import projectsService from "../../services/projects";
import { Dropdown } from "../../components/UI/dropdown/dropdown";
import { Button } from "../../components/UI/inputs/button";

type IConditionColumnProps = {
  condition: TaskCondition | null
  projectId: string
}

const defaultConditionData: TaskConditionData = { displayName: "" }

export type TaskConditionData = Omit<TaskCondition, "id" | "projectId" | "orderId">

export const ConditionColumn: React.FunctionComponent<IConditionColumnProps> = (props) => {
  const { condition, projectId } = props
  const { user } = useContext(UserContext)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [conditionData, setConditionData] = useState<TaskConditionData>(defaultConditionData)

  useEffect(() => {
    if (projectId && condition) {
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.tasksPath(user?.uid!, projectId, condition.id))
      onValue(txRef, (snapshot) => {
        const data = snapshot.val();
        if (!!data) {
          setTasks(Object.values(data))
        } else {
          console.log('Data not found');
        }
      });
    }
  }, [condition, projectId, user?.uid])

  const onSaveCondition = async () => {
    if (user?.uid) {
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .create(conditionData)
      setConditionData(defaultConditionData)
      setIsModalOpen(false)
    }
  }
  const onEditCondition = async () => {
    if (user?.uid) {
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .update(condition?.id!, conditionData)
      setConditionData(defaultConditionData)
      setIsEditModalOpen(false)
    }
  }
  const onDeleteCondition = async () => {
    if (user?.uid) {
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .delete(condition?.id!)
      setIsDeleteModalOpen(false)
    }
  }

  if (condition) {
    return <div className={style.condition}>
      <Modal
        title="Изменить стадию"
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        closeButtonText="Cancel"
        actionFunc={onEditCondition}
        actionText="Подтвердить"

      >
        <ConditionForm data={conditionData} onChangeAction={setConditionData} />
      </Modal>
      <Modal
        title="Удалить стадию"
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        closeButtonText="Cancel"
        actionFunc={onDeleteCondition}
        actionText="Удалить"

      >
        Вы уверены что хотите удалить стадию "{condition.displayName}"?
      </Modal>
      <div className={style.conditionTitle}>
        {condition.displayName}
        <Dropdown
          hover={false}
        >
          <Button text="Изменить" onClick={() => {
            setConditionData({
              ...condition
            })
            setIsEditModalOpen(true)
          }} />
          <Button text="Удалить" onClick={() => setIsDeleteModalOpen(true)} />
        </Dropdown>
      </div>
      <div className={style.conditionBody}>
        {tasks && tasks.map(task => {
          return <TaskItem key={task.id} task={task} />
        })}
        <TaskItem condId={condition.id} projId={projectId} />
      </div>
    </div>
  } else {
    return <div className={style.condition}>
      <Modal
        title="Добавить стадию"
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        closeButtonText="Cancel"
        actionFunc={onSaveCondition}
        actionText="Подтвердить"

      >
        <ConditionForm data={conditionData} onChangeAction={setConditionData} />
      </Modal>
      <div
        className={style.conditionTitle}
        style={{ cursor: "pointer" }}
        onClick={() => setIsModalOpen(true)}
      >
        Добавить стадию
      </div>
    </div>
  }
}



