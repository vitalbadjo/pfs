import { FunctionComponent, useContext, useEffect, useState } from "react"
import styles from "../projects-page.module.scss"
import { Task, TaskCondition } from "../../../models/projects-model"
import { TaskColumn } from "./tasks-col"
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, closestCorners, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { TaskItem } from "./task-item"
import { Unsubscribe, getDatabase, onValue, ref } from "firebase/database"
import { UserContext } from "../../../providers/userContext"
import { realtimeDatabasePaths } from "../../../models/realtime-database-paths"
import { reorderBetweenLists, reorderSimple } from "../../../utils/utils"
import tasksService from "../../../services/tasks"

let unsubscribe: Unsubscribe = () => { }

type ConditionId = string
type TaskId = string
export type TasksRaw = Record<ConditionId, Record<TaskId, Task>>
type TasksGroups = Record<ConditionId, Task[]>

type ITasks = {
  id: string//Project Id
  conditionsArray: TaskCondition[]
}

export const Tasks: FunctionComponent<ITasks> = (props) => {
  const { id, conditionsArray } = props
  const { user } = useContext(UserContext)

  const [tasksRaw, setTasksRaw] = useState<TasksRaw>({})
  const [tasksGroups, setTasksGroups] = useState<TasksGroups>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  useEffect(() => {

    if (id) {
      unsubscribe()
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.tasksPathByProject(user?.uid!, id))

      unsubscribe = onValue(txRef, (snapshot) => {
        const data: TasksRaw = snapshot.val();
        if (!!data) {
          setTasksRaw(data)
          const tg: TasksGroups = {}
          Object.keys(data).forEach(groupId => {
            tg[groupId] = Object.values(data[groupId]).sort((a, b) => +a.orderId - +b.orderId)
          })
          setTasksGroups(tg)
        } else {
          setTasksRaw({})
          setTasksGroups({})
          console.log('Data not found (tasks by project)');
        }
      });
    }
    return unsubscribe
  }, [user?.uid, id])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask(tasksRaw[e.active.data.current?.sortable.containerId][e.active.id])

  }
  const handleDragCancel = () => setActiveTask(null)
  const handleDragOver = ({ over, active }: DragOverEvent) => {
    const overId = over?.id;

    if (!overId) {
      return;
    }
    const activeContainer = active.data.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;
    if (activeContainer !== overContainer) {
      const newRaw = reorderBetweenLists(`${activeContainer}/${active.id}`, `${overContainer}/${over.id}`, tasksRaw)
      setTasksRaw(() => {
        return newRaw
      })
      const tg: TasksGroups = {}
      Object.keys(newRaw).forEach(groupId => {
        tg[groupId] = Object.values(newRaw[groupId]).sort((a, b) => +a.orderId - +b.orderId)
      })
      setTasksGroups(tg)
    }
    else {
      const newRaw: TasksRaw = {
        ...tasksRaw,
        [activeContainer]: reorderSimple(`${active.id}`, `${overId}`, tasksRaw[activeContainer]),
      }
      setTasksRaw(newRaw)
      const tg: TasksGroups = {}
      Object.keys(newRaw).forEach(groupId => {
        tg[groupId] = Object.values(newRaw[groupId]).sort((a, b) => +a.orderId - +b.orderId)
      })
      setTasksGroups(tg)
    }
  }
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    const overContainer = over?.data.current?.sortable.containerId || over?.id;
    const activeId = `${active.id}`
    const targetId = `${over?.id}`
    const newRaw: TasksRaw = tasksRaw
    newRaw[overContainer] = reorderSimple(activeId, targetId, tasksRaw[overContainer])
    setTasksRaw(newRaw)
    const tg: TasksGroups = {}
    Object.keys(newRaw).forEach(groupId => {
      tg[groupId] = Object.values(newRaw[groupId]).sort((a, b) => +a.orderId - +b.orderId)
    })
    setTasksGroups(tg)
    const db = getDatabase()
    await tasksService(db, user?.uid!, id).updateBatch(newRaw)
  }

  return <DndContext
    sensors={sensors}
    onDragStart={handleDragStart}
    onDragCancel={handleDragCancel}
    onDragOver={handleDragOver}
    onDragEnd={handleDragEnd}
    collisionDetection={closestCorners}
  >
    <div className={styles.projectTasks} style={{ gridTemplateColumns: `repeat(${conditionsArray?.length! + 1}, 200px)` }}>

      {conditionsArray && conditionsArray.sort((a, b) => +a.orderId - +b.orderId).map(condition => {
        return <TaskColumn
          key={`${condition.id}`}
          condition={condition}
          projectId={id}
          tasks={tasksGroups[condition.id] || []}
        />
      })}

    </div>
    <DragOverlay>
      {activeTask ? <TaskItem id={activeTask.id} task={activeTask} /> : null}
    </DragOverlay>
  </DndContext>
}

