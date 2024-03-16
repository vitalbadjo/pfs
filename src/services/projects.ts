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
  const foldersPath = realtimeDatabasePaths.projectsFoldersPath(uid)
  const foldersRef = ref(dbRef, foldersPath)

  return {
    async getAll() {
      const snapshot = await get(projectsRef)
      return checkSnapshotExist<Record<string, Project>>(snapshot)
    },
    // subscribe(callback: (data: Record<string, Project>) => void) {
    //   onValue(projectsRef, (snapshot) => {
    //     const data: Record<string, Project>  = snapshot.val();
    //     if (!!data) {
    //       callback(Object.values(data))
    //     } else {
    //       console.log('Project service: Data not found');
    //     }
    //   }),
    // },
    async create(newData: Omit<Project, "id" | "orderId">) {
      const projects = Object.values<Project>((await this.getAll()) || {})
      const orderId = projects.length ? projects.sort((a, b) => +a?.orderId! - +b?.orderId!)[projects.length - 1].orderId! + 1 : 1
      const newItemRef = push(projectsRef, newData)
      await set(newItemRef, { ...newData, id: newItemRef.key, orderId, conditions: {} })
    },
    async swap(activeProjectId: string, targetProjectId: string) {
      const projects = await this.getAll()
      const newData = reorderSimple(activeProjectId, targetProjectId, projects)
      await update(projectsRef, newData)
    },
    async _create(newData: Omit<Project, "id">) {
      const projects = await this.getAll()
      console.log("Service: projects - ", projects)
      const oid = projects.length
      const newRef = ref(dbRef, `${path}/${oid}`)
      const key = push(projectsRef, newData).key
      // // const newItemRef = push(newRef, newData)
      await set(newRef, { ...newData, id: key, conditions: {} })
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
    update(projectId: string, newData: Partial<Project>) {
      //todo reorder when removing
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
    // folders: {
    //   get: async (): Promise<RTDBProjectsFolders> => {
    //     const snapshot = await get(foldersRef)
    //     return checkSnapshotExist<RTDBProjectsFolders>(snapshot)
    //   },
    //   add: async (displayName: string, path: string) => {
    //     const newRef = ref(dbRef, `${foldersPath}/${path ? `${path}/children/` : ""}`)
    //     const newData = { displayName, orderId: 0 }
    //     const newItemRef = push(newRef, newData)
    //     try {
    //       await set(newItemRef, { ...newData, id: newItemRef.key })//TODO handle order correct ID
    //       console.log(`%c PROJECT SERVICE_add: New Project folder with name: "${displayName}" created`, "color: green;")
    //     } catch (error) {
    //       console.log(`%c PROJECT SERVICE_add: Creation new Project folder with name: "${displayName}" Error`, "color: red;")
    //       console.log("PROJECT SERVICE_add: ErroText: ", error)
    //     }
    //   },
    //   update: async (id: string, displayName: string, path: string) => {
    //     const folderRef = ref(dbRef, `${foldersPath}/${id}`)
    //     update(folderRef, { displayName, path }).then(() => {
    //       console.log("Folder updated")
    //     }).catch(console.log)
    //   },
    //   delete: async (path: string, id: string) => {
    //     const folderRef = ref(dbRef, `${foldersPath}/${path}/${id}`)
    //     try {
    //       await remove(folderRef)
    //       console.log(`%c PROJECT SERVICE_delete: Folder with id: "${id}" removed`, "color: green;")
    //     } catch (error) {
    //       console.log(`%c PROJECT SERVICE_delete: Removing new Project folder with id: "${id}" Error`, "color: red;")
    //       console.log("PROJECT SERVICE_delete: ErroText: ", error)
    //     }
    //   }

    // }
  }
}

export default projectsService
