import { FunctionComponent, useContext, useEffect, useState } from "react"
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Task, TaskCondition, TasksGroups, TasksRaw } from "../../../models/projects-model"
import { UserContext } from "../../../providers/userContext"
import { Unsubscribe, getDatabase, onValue, ref } from "firebase/database"
import { realtimeDatabasePaths } from "../../../models/realtime-database-paths"
import { arrayMove, groupsToRaw, insertAtIndex, rawToGroups, removeAtIndex } from "../../../utils/tasks.utils"
import { TaskItem } from "./task-item"
import styles from "../projects-page.module.scss"
import { TaskColumn } from "./tasks-col"
import tasksService from "../../../services/tasks"

let unsubscribe: Unsubscribe = () => { }

type ITasks = {
  id: string//Project Id
  conditionsArray: TaskCondition[]
}

export type TaskData = Omit<Task, "projectId" | "taskCondition" | "id">

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
          setTasksGroups(rawToGroups(conditionsArray, data))
        } else {
          setTasksRaw({})
          setTasksGroups({})
          console.log('Data not found (tasks by project)');
        }
      });
    }
    return unsubscribe
  }, [user?.uid, id, conditionsArray])

  useEffect(() => {
    if (Object.keys(tasksGroups).length) {
      const db = getDatabase()
      tasksService(db, user?.uid!, id).updateBatch(groupsToRaw(tasksGroups))
    }

  }, [tasksGroups])

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
        return rawToGroups(conditionsArray, raw)
      });
    } else {
      // const activeIndex = active?.data?.current?.sortable.index;
      // const overIndex =
      //   over.id in tasksGroups
      //     ? tasksGroups[overContainer].length + 1
      //     : over?.data?.current?.sortable.index;
      // setTasksGroups((itemGroups) => {
      //   return {
      //     ...itemGroups,
      //     [overContainer]: arrayMove(
      //       itemGroups[overContainer],
      //       activeIndex,
      //       overIndex,
      //     ),
      //   };
      // })
    }
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) {
      setActiveTask(null);
      return;
    }
    let newItems;
    if (active.id !== over.id) {
      const activeContainer = active?.data?.current?.sortable.containerId;
      const overContainer = over.data.current?.sortable.containerId || over.id;
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.projectTasks} style={{ gridTemplateColumns: `repeat(${Object.keys(tasksGroups)?.length! + 1}, 200px)` }}>
        {Object.keys(tasksGroups).map((group) => (
          // <Droppable id={group} items={tasksGroups[group]} key={group} />
          <TaskColumn conditionId={group} tasks={tasksGroups[group]} key={group} projectId={id} />
        ))}
      </div>
      <DragOverlay >
        {activeTask ? <TaskItem id={activeTask.id} task={activeTask} dragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

