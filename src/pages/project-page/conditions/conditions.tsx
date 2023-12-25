import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import styles from "../projects-page.module.scss"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { ConditionColumn } from "./condition-col"
import { FunctionComponent, useContext, useState } from "react"
import { TaskCondition } from "../../../models/projects-model"
import { reorderSimple } from "../../../utils/utils"
import projectsService from "../../../services/projects"
import { getDatabase } from "firebase/database"
import { UserContext } from "../../../providers/userContext"

type ConditionsRaw = Record<string, TaskCondition>
type IConditions = {
  id: string//Project id
  conditionsRaw: ConditionsRaw
  conditions: TaskCondition[]
  setConditionsRaw: React.Dispatch<React.SetStateAction<Record<string, TaskCondition>>>
}

export const Conditions: FunctionComponent<IConditions> = (props) => {
  const { conditionsRaw, setConditionsRaw, id, conditions } = props
  const { user } = useContext(UserContext)
  const [activeCondition, setActiveCondition] = useState<TaskCondition | null>(null)

  const dragStart = (e: DragStartEvent) => {
    setActiveCondition(Object.values(conditionsRaw).find(p => p.id === e.active.id) || null)
  }

  const dragEnd = async (e: DragEndEvent) => {
    setActiveCondition(null)
    const act = `${e.active.id}`
    const tar = `${e.over?.id}`

    if (act && tar && act !== tar) {
      const newrojectsRawState = reorderSimple(act, tar, conditionsRaw as any)
      setConditionsRaw(newrojectsRawState as any)
      await projectsService(getDatabase(), user?.uid!).condition(id!).swap(act, tar)
      console.log("Update on server completed!")
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  return <div className={styles.projectConditions} style={{ gridTemplateColumns: `repeat(${conditions?.length! + 1}, 200px)` }}>
    <DndContext
      onDragStart={dragStart}
      onDragEnd={dragEnd}
      collisionDetection={closestCenter}
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis]}
    >
      <SortableContext
        items={(conditions || []).sort((a, b) => +a.orderId - +b.orderId)}
        strategy={horizontalListSortingStrategy}
      >
        {conditions && conditions.sort((a, b) => +a.orderId - +b.orderId).map(condition => {
          return <ConditionColumn key={condition.id} condition={condition} projectId={id} />
        })}
        <DragOverlay>
          {activeCondition ? (
            <ConditionColumn
              key={activeCondition.id}
              condition={activeCondition}
              projectId={id}
            />
          ) : null}
        </DragOverlay>
      </SortableContext>
      <ConditionColumn condition={null} projectId={id} />
    </DndContext>
  </div>
}