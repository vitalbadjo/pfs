import { Database, get, ref, remove, update, push, set } from "firebase/database"
import { realtimeDatabasePaths } from "../models/realtime-database-paths"
import { checkSnapshotExist } from "./utils"
import { Task } from "../models/projects-model"

const tasksService = (dbRef: Database, uid: string, projectId: string, conditionId: string) => {
  const tasksRef = ref(
    dbRef,
    realtimeDatabasePaths.tasksPath(uid, projectId, conditionId)
  )
  return {
    async getAll() {
      const snapshot = await get(tasksRef)
      return checkSnapshotExist(snapshot)
    },
    async create(newData: Omit<Task, "id" | "projectId" | "taskCondition">) {
      const newItemRef = push(tasksRef, newData)
      try {
        await set(newItemRef, { ...newData, id: newItemRef.key, projectId, taskCondition: conditionId })
      } catch (error) {
        console.log("Task creation error: ", error)
      }

    },
    async delete(taskId: string) {
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.tasksPath(uid, projectId, conditionId)}/${taskId}`)
      remove(transactionRef).then(() => {
        console.log("Task deleted")
        // todo show popup
      }).catch(console.log)
    },
    update(taskId: string, newData: Partial<Task>) {
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.tasksPath(uid, projectId, conditionId)}/${taskId}`)
      update(transactionRef, newData).then(() => {
        console.log("Task updated")
        // todo show popup
      }).catch(console.log)
    },
  }
}

export default tasksService
