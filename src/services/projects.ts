import { Database, get, ref, remove, update, push, set } from "firebase/database"
import { realtimeDatabasePaths } from "../models/realtime-database-paths"
import { checkSnapshotExist } from "./utils"
import { Transaction } from "../models/transaction"
import { Project } from "../models/projects-model"

const projectsService = (dbRef: Database, uid: string) => {
  const projectsRef = ref(
    dbRef,
    realtimeDatabasePaths.projectsPath(uid)
  )

  return {
    async getAll() {
      const snapshot = await get(projectsRef)
      return checkSnapshotExist(snapshot)
    },
    async create(newData: Omit<Project, "id">) {
      const newItemRef = push(projectsRef, newData)
      await set(newItemRef, { ...newData, id: newItemRef.key, conditions: {} })
    },
    async delete(projectId: string) {
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.projectsPath(uid)}/${projectId}`)
      remove(transactionRef).then(() => {
        console.log("Project deleted")
        // todo show popup
      }).catch(console.log)
    },
    update(projectId: string, newData: Partial<Project>) {
      const transactionRef = ref(dbRef, `${realtimeDatabasePaths.projectsPath(uid)}/${projectId}`)
      update(transactionRef, newData).then(() => {
        console.log("Project updated")
        // todo show popup
      }).catch(console.log)
    },
    condition: (projectId: string) => {
      const conditionsRef = ref(
        dbRef,
        realtimeDatabasePaths.conditionsPath(uid, projectId)
      )
      return {
        async getAll() {
          const snapshot = await get(conditionsRef)
          return checkSnapshotExist(snapshot)
        },
        async create(newData: Omit<Project, "id">) {
          const newItemRef = push(conditionsRef, newData)
          await set(newItemRef, { ...newData, id: newItemRef.key })
        },
        async delete(conditionId: string) {
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
    }
  }
}

export default projectsService
