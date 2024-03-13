import { FunctionComponent, useContext, useEffect, useState } from "react"
import styles from "../projects-page.module.scss"
import { Task, TaskCondition } from "../../../models/projects-model"
import { TaskColumn } from "./tasks-col"
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { TaskItem } from "./task-item"
import { Unsubscribe, getDatabase, onValue, ref } from "firebase/database"
import { UserContext } from "../../../providers/userContext"
import { realtimeDatabasePaths } from "../../../models/realtime-database-paths"
import { reorderBetweenLists, reorderSimple } from "../../../utils/utils"
import tasksService from "../../../services/tasks"
import Modal from "../../../components/modals/modal"
import { TaskEditForm } from "./task-edit-form copy"

let unsubscribe: Unsubscribe = () => { }

type ConditionId = string
type TaskId = string
export type TasksRaw = Record<ConditionId, Record<TaskId, Task>>
type TasksGroups = Record<ConditionId, Task[]>

type ITasks = {
  id: string//Project Id
  conditionsArray: TaskCondition[]
}

export type TaskData = Omit<Task, "projectId" | "taskCondition" | "id">
const defaultTaskData: TaskData = { displayName: "", orderId: 0 }

export const Tasks: FunctionComponent<ITasks> = (props) => {
  const { id, conditionsArray } = props
  const { user } = useContext(UserContext)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [tasksRaw, setTasksRaw] = useState<TasksRaw>({})
  const [tasksGroups, setTasksGroups] = useState<TasksGroups>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task>()

  useEffect(() => {
    if (id) {
      unsubscribe()
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.tasksPathByProject(user?.uid!, id))

      unsubscribe = onValue(txRef, (snapshot) => {
        const data: TasksRaw = snapshot.val();
        if (!!data) {
          setTasksRaw(data)
          const tg: TasksGroups = conditionsArray.reduce((p, c) => {
            p[c.id] = []
            return p
          }, {} as TasksGroups)
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

  useEffect(() => {
    console.log("conditionsArray upd", conditionsArray)
    const tg: TasksGroups = conditionsArray.reduce((p, c) => {
      p[c.id] = []
      return p
    }, {} as TasksGroups)
    Object.keys(tasksRaw).forEach(groupId => {
      tg[groupId] = Object.values(tasksRaw[groupId]).sort((a, b) => +a.orderId - +b.orderId)
    })
    setTasksGroups(tg)
    console.log("tg", tg)
  }, [conditionsArray])

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

  const handleDragOver = (e: DragOverEvent) => {
    const { over, active } = e
    const overId = over?.id;
    console.log("over act cont id", e)
    console.log("over over cont id", e)

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
      const tg: TasksGroups = conditionsArray.reduce((p, c) => {
        p[c.id] = []
        return p
      }, {} as TasksGroups)
      Object.keys(newRaw).forEach(groupId => {
        tg[groupId] = Object.values(newRaw[groupId]).sort((a, b) => +a.orderId - +b.orderId)
      })
      setTasksGroups(tg)
    }
    else if (active.id !== overId) {
      const newRaw: TasksRaw = {
        ...tasksRaw,
        [activeContainer]: reorderSimple(`${active.id}`, `${overId}`, tasksRaw[activeContainer]),
      }
      setTasksRaw(newRaw)
      const tg: TasksGroups = conditionsArray.reduce((p, c) => {
        p[c.id] = []
        return p
      }, {} as TasksGroups)
      Object.keys(newRaw).forEach(groupId => {
        tg[groupId] = Object.values(newRaw[groupId]).sort((a, b) => +a.orderId - +b.orderId)
      })
      setTasksGroups(tg)
    }
  }
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    console.log("end", e)
    const overContainer = over?.data.current?.sortable.containerId || over?.id;
    const activeContainer = active.data.current?.sortable.containerId
    const activeId = `${active.id}`
    const targetId = `${over?.id}`
    const newRaw: TasksRaw = tasksRaw
    if ((e.delta.x === e.delta.y && !e.delta.x)) {//!over || 
      console.log("simulate click")
      setSelectedTask(tasksRaw[activeContainer][activeId])
      setIsEditModalOpen(true)
    } else {//if (activeId !== targetId)
      console.log("simulate click")
      newRaw[overContainer] = reorderSimple(activeId, targetId, tasksRaw[overContainer])
      setTasksRaw(newRaw)
      const tg: TasksGroups = conditionsArray.reduce((p, c) => {
        p[c.id] = []
        return p
      }, {} as TasksGroups)
      Object.keys(newRaw).forEach(groupId => {
        tg[groupId] = Object.values(newRaw[groupId]).sort((a, b) => +a.orderId - +b.orderId)
      })
      setTasksGroups(tg)
      const db = getDatabase()
      console.log("newRaw", newRaw)
      await tasksService(db, user?.uid!, id).updateBatch(newRaw)
    }
    console.log("f", activeContainer, "s", overContainer)
  }

  const onEditTask = async (task: Task) => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, task?.projectId!)
        .update(task.taskCondition, task.id, task)
      setSelectedTask(undefined)
      setIsEditModalOpen(false)
    }
  }
  const onDeleteTask = async (task: Task) => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, task?.projectId!)
        .delete(task.id, task.taskCondition)
      setIsDeleteModalOpen(false)
    }
  }
  if (!conditionsArray.length) {
    return null
  }
  return <DndContext
    sensors={sensors}
    onDragStart={handleDragStart}
    onDragCancel={handleDragCancel}
    onDragOver={handleDragOver}
    onDragEnd={handleDragEnd}
  >
    <Modal
      title="Изменить задачу"
      isOpen={isEditModalOpen}
      setIsOpen={setIsEditModalOpen}
      closeButtonText="Отменить"
      actionFunc={onEditTask}
      actionText="Подтвердить"
    >
      <TaskEditForm data={selectedTask} onChangeAction={setSelectedTask} />
    </Modal>
    <Modal
      title="Удалить задачу"
      isOpen={isDeleteModalOpen}
      setIsOpen={setIsDeleteModalOpen}
      closeButtonText="Отменить"
      actionFunc={onDeleteTask}
      actionText="Удалить"
    >
      Вы уверены что хотите удалить задачу "{selectedTask?.displayName}"?
    </Modal>
    <div className={styles.projectTasks} style={{ gridTemplateColumns: `repeat(${conditionsArray?.length! + 1}, 200px)` }}>

      {conditionsArray && conditionsArray.sort((a, b) => +a.orderId - +b.orderId).map(condition => {
        // {Object.keys(tasksGroups).map(condition => {
        return <TaskColumn
          key={condition.id}
          conditionId={condition.id}
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

