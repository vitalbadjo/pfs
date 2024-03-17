import { TaskCondition } from "../../../models/projects-model";
import { useContext, useState } from "react";
import { UserContext } from "../../../providers/userContext";
import { getDatabase } from "firebase/database";
import { CSS } from "@dnd-kit/utilities";
import styles from "./condition.module.scss"
import projectsService from "../../../services/projects";
import { useSortable } from "@dnd-kit/sortable";
import { APP_ICONS } from "../../../config/media";
import { ConfirmModal } from "../../../components/modals/confirmModal";
import { Button, Dropdown } from "antd";

type IConditionColumnProps = {
  condition: TaskCondition | null
  projectId: string
}

const defaultConditionData: TaskConditionData = { displayName: "" }

export type TaskConditionData = Omit<TaskCondition, "id" | "projectId" | "orderId">

export const ConditionColumn: React.FunctionComponent<IConditionColumnProps> = (props) => {
  const { condition, projectId } = props
  const { user } = useContext(UserContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [conditionData, setConditionData] = useState<TaskConditionData>(defaultConditionData)

  const onSaveCondition = async () => {
    if (user?.uid) {
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .create(conditionData)
      setConditionData(defaultConditionData)
      setIsModalOpen(false)
    }
  }
  const onEditCondition = async () => {
    if (user?.uid) {
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .update(condition?.id!, conditionData)
      setConditionData(defaultConditionData)
      setIsEditModalOpen(false)
    }
  }
  const onDeleteCondition = async () => {
    if (user?.uid) {
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .delete(condition?.id!)
      setIsDeleteModalOpen(false)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: condition?.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1
  };
  const dragButtonStyle = { cursor: isDragging ? "grabbing" : "grab" }

  if (condition) {
    return <div ref={setNodeRef} style={style} className={styles.condition}>
      {/* <Modal
        title="Изменить стадию"
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        closeButtonText="Cancel"
        actionFunc={onEditCondition}
        actionText="Подтвердить"

      >
        <ConditionForm data={conditionData} onChangeAction={setConditionData} />
      </Modal> */}
      <ConfirmModal
        title="Удалить стадию"
        message={`Вы уверены что хотите удалить стадию "${condition.displayName}"?`}
        open={isDeleteModalOpen}
        confirm={onDeleteCondition}
        cancel={() => setIsDeleteModalOpen(false)}
      />
      <div className={styles.conditionHeader}>
        {APP_ICONS.dragHandler({
          ...listeners,
          ...attributes,
          style: dragButtonStyle,
          className: styles.dragHandler
        })}
        <div className={styles.conditionTitle}>{condition.displayName}</div>

        <Dropdown
          placement="bottom"
          menu={{
            items: [
              {
                key: "edit",
                label: (<Button onClick={() => {
                  setConditionData({
                    ...condition
                  })
                  setIsEditModalOpen(true)
                }}>Изменить</Button>)
              },
              {
                key: "delete",
                label: (<Button onClick={() => setIsDeleteModalOpen(true)}>Удалить</Button>)
              }
            ]
          }}
        >
          <Button>...</Button>
        </Dropdown>
      </div>
    </div>
  } else {
    return <div className={styles.condition}>
      {/* <Modal
        title="Добавить стадию"
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        closeButtonText="Cancel"
        actionFunc={onSaveCondition}
        actionText="Подтвердить"

      >
        <ConditionForm data={conditionData} onChangeAction={setConditionData} />
      </Modal> */}
      <div
        className={styles.conditionHeader}
        style={{ cursor: "pointer" }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={styles.conditionTitle}>Добавить стадию</div>
      </div>
    </div>
  }
}



