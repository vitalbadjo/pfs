import { Database, get, ref, remove, update, push, set } from "firebase/database"
import { realtimeDatabasePaths } from "../models/realtime-database-paths"
import { checkSnapshotExist } from "./utils"
import { Project, TaskCondition } from "../models/projects-model"
import { reorderSimple } from "../utils/utils"

const projectsService = (dbRef: Database, uid: string) => {
  const path = realtimeDatabasePaths.projectsPath(uid)
  const projectsRef = ref(
    dbRef,
    path
  )

  return {
    async getAll() {
      const snapshot = await get(projectsRef)
      return checkSnapshotExist<Record<string, Project>>(snapshot)
    },
    async create(newData: Omit<Project, "id" | "orderId">) {
      const projects = Object.values<Project>((await this.getAll()) || {})
      const orderId = projects.length ? projects.sort((a, b) => +a?.orderId! - +b?.orderId!)[projects.length - 1].orderId! + 1 : 1
      const newItemRef = push(projectsRef, newData)
      await set(newItemRef, { ...newData, id: newItemRef.key, orderId, conditions: {} })
      return newItemRef.key
    },
    async swap(activeProjectId: string, targetProjectId: string) {
      const projects = await this.getAll()
      const newData = reorderSimple(activeProjectId, targetProjectId, projects)
      await update(projectsRef, newData)
    },
    async delete(projectId: string) {
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.projectsPath(uid)}/${projectId}`)
      remove(transactionRef).then(() => {
        console.log("Project deleted")
        // todo show popup
      }).catch(console.log)
      const transactionTasksRef = ref(dbRef, `${realtimeDatabasePaths.tasksPathByProject(uid, projectId)}`)
      remove(transactionTasksRef).then(() => {
        console.log("Project tasks deleted")
        // todo show popup
      }).catch(console.log)
    },
    async update(projectId: string, newData: Partial<Project>) {
      //todo reorder when removing
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.projectsPath(uid)}/${projectId}`)
      await update(transactionRef, newData)
    },
    condition: (projectId: string) => {
      const conditionsRef = ref(
        dbRef,
        realtimeDatabasePaths.conditionsPath(uid, projectId)
      )
      return {
        async getAll() {
          const snapshot = await get(conditionsRef)
          return checkSnapshotExist<Record<string, TaskCondition>>(snapshot)
        },
        async create(newData: Omit<Project, "id" | "orderId">) {
          const conditions = Object.values<Project>((await this.getAll()) || {})
          const orderId = conditions.length ? conditions.sort((a, b) => +a?.orderId! - +b?.orderId!)[conditions.length - 1].orderId! + 1 : 1
          const newItemRef = push(conditionsRef, newData)
          await set(newItemRef, { ...newData, id: newItemRef.key, orderId })
        },
        async swap(activeConditionId: string, targetConditionId: string) {
          const conditions = await this.getAll()
          // console.log("old", conditions)
          const newData = reorderSimple(activeConditionId, targetConditionId, conditions)
          // console.log("new", newData)
          await update(conditionsRef, newData)
        },
        async delete(conditionId: string) {
          //todo reorder when removing
          const conditionsRef = ref(dbRef, `${realtimeDatabasePaths.conditionsPath(uid, projectId)}/${conditionId}`)
          remove(conditionsRef).then(() => {
            console.log("Condition deleted")
            // todo show popup
          }).catch(console.log)
        },
        update(conditionId: string, newData: Partial<Project>) {
          const conditionsRef = ref(dbRef, `${realtimeDatabasePaths.conditionsPath(uid, projectId)}/${conditionId}`)
          update(conditionsRef, newData).then(() => {
            console.log("Condition updated")
            // todo show popup
          }).catch(console.log)
        },
      }
    },
  }
}

export default projectsService
