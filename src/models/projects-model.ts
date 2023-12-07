import { APP_CONSTANTS } from "../config/constants"

export type ProjectColors = keyof typeof APP_CONSTANTS.styles.colors.cardBackgrounds

export type KanbanBaseFields = {
  displayName: string
  id: string
  description?: string
  //TODO
  color?: ProjectColors
}

export type TaskCondition = {
  projectId: Project["id"]
  id: string
  displayName: string
}

export type Project = KanbanBaseFields & {
  conditions?: TaskCondition//Record<TaskCondition['id'], TaskCondition>
}

export type Task = KanbanBaseFields & {
  projectId: Project["id"]
  taskCondition: TaskCondition["id"]
}
