import { Database, get, ref, remove, update, push, set } from "firebase/database"
import { realtimeDatabasePaths } from "../models/realtime-database-paths"
import { checkSnapshotExist } from "./utils"
import { Task, TasksRaw } from "../models/projects-model"

const tasksService = (dbRef: Database, uid: string, projectId: string) => {
  const tasksOfProjectRef = ref(
    dbRef,
    realtimeDatabasePaths.tasksPathByProject(uid, projectId)
  )
  const tasksOfConditionRef = (conditionId: string) => ref(
    dbRef,
    realtimeDatabasePaths.tasksPathByCondition(uid, projectId, conditionId)
  )
  return {
    async getAllFromCondition(conditionId: string) {

      const snapshot = await get(tasksOfConditionRef(conditionId))
      return checkSnapshotExist<Record<string, Task>>(snapshot)
    },
    async getAllFromProject() {
      const snapshot = await get(tasksOfProjectRef)
      return checkSnapshotExist<Record<string, Record<string, Task>>>(snapshot)
    },
    async create(newData: Omit<Task, "id" | "projectId" | "taskCondition">, conditionId: string) {
      const tasks = Object.values<Task>((await this.getAllFromCondition(conditionId)) || {})
      const orderId = tasks.length ? tasks.sort((a, b) => +a?.orderId! - +b?.orderId!)[tasks.length - 1].orderId! + 1 : 1
      const newItemRef = push(tasksOfConditionRef(conditionId), newData)
      const requestData = { ...newData, id: newItemRef.key, projectId, taskCondition: conditionId, orderId }
      try {
        await set(newItemRef, requestData)
      } catch (error) {
        console.log("Task creation error: ", error)
      }

    },
    async updateBatch(tasksRaw: TasksRaw) {
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.tasksPathByProject(uid, projectId)}`)
      try {
        await update(transactionRef, tasksRaw)
        console.log("Service: Task batch updated")
      } catch (error) {
        console.log("Task batch not updated")
      }

    },
    async delete(taskId: string, conditionId: string) {
      //todo reorder when removing
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.tasksPathByCondition(uid, projectId, conditionId)}/${taskId}`)
      remove(transactionRef).then(() => {
        console.log("Task deleted")
        // todo show popup
      }).catch(console.log)
    },
    update(conditionId: string, taskId: string, newData: Partial<Task>) {
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.tasksPathByCondition(uid, projectId, conditionId)}/${taskId}`)
      update(transactionRef, newData).then((v) => {
        console.log("Task updated")
        // todo show popup
      }).catch(console.log)
    },
  }
}

export default tasksService
