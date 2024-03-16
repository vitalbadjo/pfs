import { APP_CONSTANTS } from "../config/constants"

export type ProjectColors = keyof typeof APP_CONSTANTS.styles.colors.cardBackgrounds

export type KanbanBaseFields = {
  orderId: number
  displayName: string
  id: string
  description?: string
  //TODO
  color?: ProjectColors
}

export type TaskCondition = {
  orderId: number
  projectId: Project["id"]
  id: string
  displayName: string
}

export type Project = KanbanBaseFields & {
  parentProjectId?: string
  conditions?: TaskCondition//Record<TaskCondition['id'], TaskCondition>
}

export type RTDBProjects = Record<string, Project>

export type Task = KanbanBaseFields & {
  projectId: Project["id"]
  taskCondition: TaskCondition["id"]
}

export type ConditionId = string
export type TaskId = string
export type TasksRaw = Record<ConditionId, Record<TaskId, Task>>
export type TasksGroups = Record<ConditionId, Task[]>

// export type FolderDomain = {
//   displayName: string
//   id: string
//   orderId: number
//   path: string
// }

// export type RTDBProjectsFolders = Record<string, FolderDomain & { children?: RTDBProjectsFolders }>
