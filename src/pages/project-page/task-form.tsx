import React, { useState } from "react"
import { Task } from "../../models/projects-model"
import { TextInput } from "../../components/UI/inputs/textInput"
import { TaskData } from "./task-item"

type ITaskForm = {
  data: TaskData
  onChangeAction: Function
}

export const TaskForm: React.FunctionComponent<ITaskForm> = (props) => {
  const { data, onChangeAction } = props

  const onChange = (value: string, field: keyof Task) => {
    onChangeAction({
      ...data,
      [field]: value
    })
  }

  return <div className="taskForm">
    <TextInput
      value={data.displayName}
      onChange={(e) => onChange(e, "displayName")}
      type="text"
      placeholder="Название"
    />
    <TextInput
      value={data.description || ""}
      onChange={(e) => onChange(e, "description")}
      type="text"
      placeholder="Описание"
    />
    <TextInput
      value={data.color || ""}
      onChange={(e) => onChange(e, "color")}
      type="color"
      placeholder="Цвет"
    />
  </div>
}