import { useDroppable } from "@dnd-kit/core";
import { Task } from "../../../models/projects-model";
import { TaskItem } from "./task-item";
import styles from "./tasks-col.module.scss"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

type IConditionColumnProps = {
  conditionId: string
  projectId: string
  tasks: Task[]
}

export const TaskColumn: React.FunctionComponent<IConditionColumnProps> = (props) => {
  const { conditionId, tasks } = props
  const { setNodeRef } = useDroppable({ id: conditionId });
  // console.log(tasks)

  return <SortableContext
    id={conditionId}
    items={tasks}//{Object.values(tasks).map(v => `${condition.id}/${v.id}`)}
    strategy={verticalListSortingStrategy}
  >
    <div
      ref={setNodeRef}
      className={styles.tasksCol}
      style={{ gridTemplateRows: `repeat(${tasks.length + 3}, min-content)` }}
    >
      {tasks.map(task => {
        return <TaskItem
          id={task.id}
          key={task.id}
          condId={task.taskCondition}
          task={task}
        />
      })}
      {/* <TaskItem id={`${conditionId}addtask`} condId={conditionId} projId={projectId} /> */}
    </div>
  </SortableContext>
}



