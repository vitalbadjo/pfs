import { Task, TaskCondition } from "../../models/projects-model";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../providers/userContext";
import { getDatabase, onValue, ref } from "firebase/database";
import { realtimeDatabasePaths } from "../../models/realtime-database-paths";
import { TaskItem } from "./task-item";
import style from "./condition.module.scss"
import Modal from "../../components/modals/modal";
import { ConditionForm } from "./condition-form";

type IConditionColumnProps = {
  condition: TaskCondition | null
  projectId: string
}

export const ConditionColumn: React.FunctionComponent<IConditionColumnProps> = (props) => {
  const { condition, projectId } = props
  const { user } = useContext(UserContext)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (projectId && condition) {
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.tasksPath(user?.uid!, projectId, condition.id))
      onValue(txRef, (snapshot) => {
        const data = snapshot.val();
        if (!!data) {
          console.log("data", data)
          setTasks(Object.values(data))
        } else {
          console.log('Data not found');
        }
      });
    }
  }, [condition, projectId, user?.uid])
  if (condition) {
    return <div className={style.condition}>
      <div className={style.conditionTitle}>{condition.displayName}</div>
      <div className={style.conditionBody}>
        {tasks && tasks.map(task => {
          return <TaskItem key={task.id} task={task} />
        })}
        <TaskItem condId={condition.id} projId={projectId} />
      </div>
    </div>
  } else {
    return <div className={style.condition}>
      <Modal title="Add condition" isOpen={isModalOpen} setIsOpen={setIsModalOpen} closeButtonText="Cancel">
        <ConditionForm projectId={projectId} closeModalAction={setIsModalOpen} />
      </Modal>
      <div
        className={style.conditionTitle}
        style={{ cursor: "pointer" }}
        onClick={() => setIsModalOpen(true)}
      >
        add condition
      </div>
    </div>
  }
}



