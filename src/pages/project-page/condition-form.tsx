import React, { useContext, useState } from "react"
import { UserContext } from "../../providers/userContext"
import { getDatabase } from "firebase/database"
import { ProjectColors } from "../../models/projects-model"
import projectsService from "../../services/projects"

type IConditionForm = {
  projectId: string
  closeModalAction: Function
}

export const ConditionForm: React.FunctionComponent<IConditionForm> = (props) => {
  const { projectId, closeModalAction } = props
  const [name, setName] = useState("")
  const [color, setColor] = useState<ProjectColors>("gray")
  const [loading, setLoading] = useState(false)
  const { user } = useContext(UserContext)


  const onSaveCondition = async () => {
    if (user?.uid) {
      setLoading(true)
      await projectsService(getDatabase(), user?.uid).condition(projectId)
        .create({
          displayName: name,
          color: color
        })
      setLoading(false)
      closeModalAction(false)
    }
  }

  const onChange = (e: React.FormEvent<HTMLInputElement>, field: "name" | "color") => {
    switch (field) {
      case "name":
        setName(e.currentTarget.value)
        break;
      case "color":
        setColor(e.currentTarget.value as ProjectColors)
        break;
      default:
        break;
    }
  }

  return <div className="conditionForm">
    <input value={name} onChange={(e) => onChange(e, "name")} />
    <input value={color} onChange={(e) => onChange(e, "color")} />
    <button
      onClick={onSaveCondition}
      disabled={!name && !color}
    >Add condition</button>
  </div>
}