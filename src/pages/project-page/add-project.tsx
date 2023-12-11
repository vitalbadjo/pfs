import React from "react"
import { Project } from "../../models/projects-model"
import { TextInput } from "../../components/UI/inputs/textInput"

type IAddProjectForm = {
  data: Omit<Project, "id" | "conditions">
  setData: (data: Omit<Project, "id">) => void
}

export const AddProjectForm: React.FunctionComponent<IAddProjectForm> = (props) => {
  const { data, setData } = props

  const handleChange = (value: string, key: keyof typeof data) => {
    setData({
      ...data,
      [key]: value
    })
  };
  return <>
    <TextInput
      value={data.displayName || ""}
      placeholder="Название"
      onChange={e => handleChange(e, "displayName")}
      type="text"
    />
    <TextInput
      value={data.description || ""}
      placeholder="Описание"
      onChange={e => handleChange(e, "description")}
      type="text"
    />
  </>
}