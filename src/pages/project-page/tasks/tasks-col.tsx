import { useDroppable } from "@dnd-kit/core";
import { Task } from "../../../models/projects-model";
import { TaskItem } from "./task-item";
import styles from "./tasks-col.module.scss"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo } from "react";

type IConditionColumnProps = {
  conditionId: string
  projectId: string
  tasks: Task[]
}

export const TaskColumn: React.FunctionComponent<IConditionColumnProps> = memo((props) => {
  const { conditionId, tasks, projectId } = props
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
        />
      })}
      <TaskItem id={`${conditionId}addtask`} condId={conditionId} projId={projectId} />
    </div>
  </SortableContext>
})



