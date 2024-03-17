import { useDroppable } from "@dnd-kit/core";
import { Task } from "../../../models/projects-model";
import { TaskItem } from "./task-item";
import styles from "./tasks-col.module.scss"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

type IConditionColumnProps = {
  conditionId: string
  projectId: string
  tasks: Task[]
  onDeleteTask: Function
}

export const TaskColumn: React.FunctionComponent<IConditionColumnProps> = (props) => {
  const { conditionId, tasks, projectId, onDeleteTask } = props
  const { setNodeRef } = useDroppable({ id: conditionId });

  return <SortableContext
    id={conditionId}
    items={tasks}
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
          onDeleteTask={onDeleteTask}
        />
      })}
      <TaskItem id={`${conditionId}addtask`} condId={conditionId} projId={projectId} onDeleteTask={onDeleteTask} />
    </div>
  </SortableContext>
}



