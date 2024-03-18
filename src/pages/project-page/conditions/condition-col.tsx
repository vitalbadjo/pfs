import { TaskCondition } from "../../../models/projects-model";
import { useContext, useState } from "react";
import { UserContext } from "../../../providers/userContext";
import { getDatabase } from "firebase/database";
import { CSS } from "@dnd-kit/utilities";
import styles from "./condition.module.scss"
import projectsService from "../../../services/projects";
import { useSortable } from "@dnd-kit/sortable";
import { ConfirmModal } from "../../../components/modals/confirmModal";
import { Button, Col, Dropdown, Row, Typography, theme } from "antd";
import { HolderOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { ConditionCreateFormModal, CreateConditionFormValues } from "../../../components/modals/addConditionModal";

type IConditionColumnProps = {
  condition: TaskCondition | null
  projectId: string
}


export type TaskConditionData = Omit<TaskCondition, "id" | "projectId" | "orderId">

export const ConditionColumn: React.FunctionComponent<IConditionColumnProps> = (props) => {
  const { condition, projectId } = props
  const { user } = useContext(UserContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { token } = theme.useToken()

  const onSaveCondition = async (values: CreateConditionFormValues) => {
    const { displayName } = values
    if (user?.uid) {
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .create({ displayName })
      setIsModalOpen(false)
    }
  }
  const onEditCondition = async (values: CreateConditionFormValues) => {
    const { displayName, id } = values
    if (user?.uid) {
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .update(id!, { displayName })
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
  const dragButtonStyle = isDragging ? {
    cursor: "grabbing",
    transform: "rotateZ(4deg)",
    transformOrigin: "left",
    zIndex: 10
  } : { cursor: "grab" }
  if (condition) {
    return <div
      ref={setNodeRef}
      style={{
        ...dragButtonStyle,
        ...style,
        borderRadius: token.borderRadius,
        border: `1px solid ${token.colorBorder}`,
      }}
      className={styles.condition}
    >
      <ConditionCreateFormModal
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onCreate={onEditCondition}
        initialValues={{ displayName: condition.displayName, id: condition.id }}
      />
      <ConfirmModal
        title="Удалить стадию"
        message={`Вы уверены что хотите удалить стадию "${condition.displayName}"?`}
        open={isDeleteModalOpen}
        confirm={onDeleteCondition}
        cancel={() => setIsDeleteModalOpen(false)}
      />
      <Row justify="space-between" align="middle" wrap={false}>
        <Col span={4}>
          <Button
            type="text"
            icon={<HolderOutlined />}
            {...listeners}
            {...attributes}
            style={dragButtonStyle}
          />
        </Col>
        <Col span={16}>
          <Typography.Text strong ellipsis>{condition.displayName}</Typography.Text>
        </Col>
        <Col span={4}>
          <Dropdown
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "edit",
                  label: (<Button
                    onClick={() => {
                      setIsEditModalOpen(true)
                    }}
                    type="primary"
                    block
                  >Изменить</Button>)
                },
                {
                  key: "delete",
                  label: (<Button onClick={() => {
                    setIsDeleteModalOpen(true)
                  }} danger block>Удалить</Button>)
                }
              ]
            }}
          >
            <Button icon={<MoreOutlined />} type="text" />
          </Dropdown>
        </Col>
      </Row>
    </div>
  } else {
    return <>
      <ConditionCreateFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onCreate={onSaveCondition}
        initialValues={{ displayName: "" }}
      />
      <Button onClick={() => setIsModalOpen(true)} icon={<PlusOutlined />} block>Добавить стадию</Button>
    </>
  }
}



