import { FunctionComponent, useContext, useEffect, useState } from "react"
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Task, TaskCondition, TasksGroups, TasksRaw } from "../../../models/projects-model"
import { UserContext } from "../../../providers/userContext"
import { Unsubscribe, getDatabase, onValue, ref } from "firebase/database"
import { realtimeDatabasePaths } from "../../../models/realtime-database-paths"
import { arrayMove, groupsToRaw, insertAtIndex, rawToGroups, removeAtIndex } from "../../../utils/tasks.utils"
import { TaskItem } from "./task-item"
import { TaskColumn } from "./tasks-col"
import tasksService from "../../../services/tasks"
import Modal from "../../../components/modals/modal"
import { TaskEditForm } from "./task-edit-form"
import styles from "../projects-page.module.scss"

let unsubscribe: Unsubscribe = () => { }

type ITasks = {
  projectId: string
  conditionsArray: TaskCondition[]
}

export type TaskData = Omit<Task, "projectId" | "taskCondition" | "id">

export const Tasks: FunctionComponent<ITasks> = (props) => {
  const { projectId, conditionsArray } = props
  const { user } = useContext(UserContext)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task>()

  const [tasksRaw, setTasksRaw] = useState<TasksRaw>({})
  const [tasksGroups, setTasksGroups] = useState<TasksGroups>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (projectId) {
      unsubscribe()
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.tasksPathByProject(user?.uid!, projectId))

      unsubscribe = onValue(txRef, (snapshot) => {
        const data: TasksRaw = snapshot.val();
        if (!!data) {
          setTasksRaw(data)
          setTasksGroups(rawToGroups(conditionsArray, data))
        } else {
          setTasksRaw({})
          setTasksGroups({})
          console.log('Data not found (tasks by project)');
        }
      });
    }
    return unsubscribe
  }, [user?.uid, projectId, conditionsArray])

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const container = active?.data?.current?.sortable.containerId
    setActiveTask(tasksGroups[container].find(el => el.id === active.id)!)
  };

  const handleDragCancel = () => setActiveTask(null);

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;
    if (!overId) {
      return;
    }

    const activeContainer = active?.data?.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    if (activeContainer !== overContainer) {
      setTasksGroups((itemGroups) => {
        const activeIndex = active?.data?.current?.sortable.index;
        const overIndex =
          over.id in itemGroups
            ? itemGroups[overContainer].length + 1
            : over?.data?.current?.sortable.index;

        const newGroups = moveBetweenContainers(
          itemGroups,
          activeContainer,
          activeIndex,
          overContainer,
          overIndex,
          activeTask!
        );
        const raw = groupsToRaw(newGroups)
        setTasksRaw(raw)
        return rawToGroups(conditionsArray, raw)
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta, activatorEvent } = event
    if (!over) {
      setActiveTask(null);
      return;
    }
    const activeContainer = active?.data?.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;
    const activeId = active?.id

    if ((delta.x === delta.y && !delta.x)) {
      console.log("simulate click")
      //@ts-ignore
      const evId = activatorEvent.target?.id
      if (evId) {
        const [dropdownEvent, _] = evId.split(".")
        if (dropdownEvent === "taskItemDropdown") {
          setSelectedTask(tasksRaw[activeContainer][activeId])
          setIsDeleteModalOpen(true)
        }
      } else {
        setSelectedTask(tasksRaw[activeContainer][activeId])
        setIsEditModalOpen(true)
      }

    }

    let newItems;
    if (active.id !== over.id) {
      const activeIndex = active?.data?.current?.sortable.index;
      const overIndex =
        over.id in tasksGroups
          ? tasksGroups[overContainer].length + 1
          : over?.data?.current?.sortable.index;

      setTasksGroups((itemGroups) => {

        if (activeContainer === overContainer) {
          newItems = {
            ...itemGroups,
            [overContainer]: arrayMove(
              itemGroups[overContainer],
              activeIndex,
              overIndex,
            ),
          };

        } else {
          newItems = moveBetweenContainers(
            itemGroups,
            activeContainer,
            activeIndex,
            overContainer,
            overIndex,
            activeTask!
          );

        }

        newItems = groupsToRaw(newItems)
        const db = getDatabase()
        tasksService(db, user?.uid!, projectId).updateBatch(newItems)
        setTasksRaw(newItems)
        return rawToGroups(conditionsArray, newItems);
      });
    }
    setActiveTask(null);
  };

  const moveBetweenContainers = (
    items: TasksGroups,
    activeContainer: string,
    activeIndex: string,
    overContainer: string,
    overIndex: string,
    item: Task
  ) => {
    return {
      ...items,
      [activeContainer]: removeAtIndex(items[activeContainer], +activeIndex),
      [overContainer]: insertAtIndex(items[overContainer], +overIndex, item),
    };
  };

  const onEditTask = async () => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, selectedTask?.projectId!)
        .update(selectedTask?.taskCondition!, selectedTask?.id!, selectedTask!)
      setSelectedTask(undefined)
      setIsEditModalOpen(false)
    }
  }
  const onDeleteTask = async () => {
    if (user?.uid) {
      await tasksService(getDatabase(), user?.uid, selectedTask?.projectId!)
        .delete(selectedTask?.id!, selectedTask?.taskCondition!)
      setIsDeleteModalOpen(false)
    }
  }
  return (
    <DndContext
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
      <div className={styles.projectTasks} style={{ gridTemplateColumns: `repeat(${conditionsArray.length! + 1}, 200px)` }}>
        {conditionsArray.map((group) => (
          <TaskColumn conditionId={group.id} tasks={tasksGroups[group.id] || []} key={group.id} projectId={projectId} />
        ))}
      </div>
      <DragOverlay >
        {activeTask ? <TaskItem id={activeTask.id} task={activeTask} dragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

