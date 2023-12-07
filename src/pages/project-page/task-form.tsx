import React, { useContext, useState } from "react"
import { UserContext } from "../../providers/userContext"
import { getDatabase } from "firebase/database"
import tasksService from "../../services/tasks"
import { ProjectColors } from "../../models/projects-model"

type ITaskForm = {
  projectId: string
  conditionId: string
  closeModalAction: Function
}

export const TaskForm: React.FunctionComponent<ITaskForm> = (props) => {
  const { projectId, conditionId, closeModalAction } = props
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [color, setColor] = useState<ProjectColors>("gray")
  const [loading, setLoading] = useState(false)
  const { user } = useContext(UserContext)


  const onSaveTask = async () => {
    if (user?.uid) {
      setLoading(true)
      await tasksService(getDatabase(), user?.uid, projectId, conditionId)
        .create({
          displayName: name,
          description: desc,
          color: color
        })
      setLoading(false)
      closeModalAction(false)
    }
  }

  const onChange = (e: React.FormEvent<HTMLInputElement>, field: "name" | "desc" | "color") => {
    switch (field) {
      case "name":
        setName(e.currentTarget.value)
        break;
      case "desc":
        setDesc(e.currentTarget.value)
        break;
      case "color":
        setColor(e.currentTarget.value as ProjectColors)
        break;
      default:
        break;
    }
  }

  return <div className="taskForm">
    <input value={name} onChange={(e) => onChange(e, "name")} />
    <input value={desc} onChange={(e) => onChange(e, "desc")} />
    <input value={color} onChange={(e) => onChange(e, "color")} />
    <button
      onClick={onSaveTask}
      disabled={!name && !desc && !color}
    >Add task</button>
  </div>
}