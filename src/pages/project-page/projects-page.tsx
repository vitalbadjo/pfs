import { TaskCondition } from "../../models/projects-model";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../providers/userContext";
import { getDatabase, onValue, ref } from "firebase/database";
import { realtimeDatabasePaths } from "../../models/realtime-database-paths";
import { useParams } from "react-router-dom";
import style from "./projects-page.module.scss"
import { ConditionColumn } from "./condition-col";
import { Unsubscribe } from "firebase/auth";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { reorder } from "../../utils/utils";
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import projectsService from "../../services/projects";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

let unsubscribe: Unsubscribe = () => { }

export const ProjectsPage: React.FunctionComponent = () => {
  const { user } = useContext(UserContext)
  const [error, setError] = useState("")
  const { id } = useParams();
  // const [conditions, setConditions] = useState<TaskCondition[]>()
  // state for dnd
  const [conditionsRaw, setConditionsRaw] = useState<Record<string, TaskCondition>>({})
  const [activeCondition, setActiveCondition] = useState<TaskCondition | null>(null)

  useEffect(() => {

    if (id) {
      unsubscribe()
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.conditionsPath(user?.uid!, id))

      unsubscribe = onValue(txRef, (snapshot) => {
        const data = snapshot.val();
        if (!!data) {
          setConditionsRaw(data)
        } else {
          setConditionsRaw({})
          console.log('Data not found (conditions)');
        }
      });
    }
    return unsubscribe
  }, [user?.uid, id])

  const dragStart = (e: DragStartEvent) => {
    // console.log("drag start", e)
    setActiveCondition(Object.values(conditionsRaw).find(p => p.id === e.active.id) || null)
  }

  const dragEnd = async (e: DragEndEvent) => {
    setActiveCondition(null)
    const act = `${e.active.id}`
    const tar = `${e.over?.id}`

    if (act && tar && act !== tar) {
      const newrojectsRawState = reorder(act, tar, conditionsRaw as any)
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

  const conditions = useMemo(() => {
    return Object.values(conditionsRaw)
  }, [conditionsRaw])

  if (error) {
    return <div>Something went wrong</div>
  }

  if (!id) {
    return <div>Pleases select project</div>
  }

  return <DndContext
    onDragStart={dragStart}
    onDragEnd={dragEnd}
    collisionDetection={closestCenter}
    sensors={sensors}
    modifiers={[restrictToHorizontalAxis]}
  >
    <div className={style.projectGrid} style={{ gridTemplateColumns: `repeat(${conditions?.length! + 1}, 200px)` }}>
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
    </div>
  </DndContext>
}



