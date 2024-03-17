
export type KanbanBaseFields = {
  orderId: number
  displayName: string
  id: string
  description?: string
  //TODO
  color?: string
}

export type TaskCondition = {
  orderId: number
  projectId: Project["id"]
  id: string
  displayName: string
}

export type Project = KanbanBaseFields & {
  parentProjectId?: string
  conditions?: TaskCondition
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
