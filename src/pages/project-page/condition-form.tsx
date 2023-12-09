import React from "react"
import { TaskConditionData } from "./condition-col"
import { TextInput } from "../../components/UI/inputs/textInput"

type IConditionForm = {
  data: TaskConditionData
  onChangeAction: Function
}

export const ConditionForm: React.FunctionComponent<IConditionForm> = (props) => {
  const { data, onChangeAction } = props

  const onChange = (value: string, key: keyof TaskConditionData) => {
    onChangeAction({
      ...data,
      [key]: value
    })
  }

  return <div className="conditionForm">
    <TextInput
      value={data.displayName}
      onChange={(e) => onChange(e, "displayName")}
      type="text"
    />
  </div>
}