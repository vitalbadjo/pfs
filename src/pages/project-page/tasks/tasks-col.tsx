import { useDroppable } from "@dnd-kit/core";
import { Task, TaskCondition } from "../../../models/projects-model";
import { TaskItem } from "./task-item";
import styles from "./tasks-col.module.scss"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

type IConditionColumnProps = {
  condition: TaskCondition
  projectId: string
  tasks: Task[]
}

export const TaskColumn: React.FunctionComponent<IConditionColumnProps> = (props) => {
  const { condition, projectId, tasks } = props
  const { setNodeRef } = useDroppable({ id: condition.id });


  return <SortableContext
    id={condition.id}
    items={tasks}//{Object.values(tasks).map(v => `${condition.id}/${v.id}`)}
    strategy={rectSortingStrategy}
  >
    <div
      ref={setNodeRef}
      className={styles.tasksCol}
      style={{ gridTemplateRows: `repeat(${tasks.length + 3}, min-content)` }}
    >
      {tasks && tasks.map(task => {
        return <TaskItem
          id={task.id}
          key={task.id}
          condId={task.taskCondition}
          task={task}
        />
      })}
      <TaskItem id={`${condition.id}addtask`} condId={condition.id} projId={projectId} />
    </div>
  </SortableContext>
}



