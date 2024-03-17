import { Task, TaskCondition, TasksGroups, TasksRaw } from "../models/projects-model";
import { arrayMove as dndKitArrayMove } from "@dnd-kit/sortable";

export const groupsToRaw: (tasksGroups: TasksGroups) => TasksRaw = (tasksGroups) => {
  let tasksRaw: TasksRaw = {};
  Object.keys(tasksGroups).forEach(condId => {
    tasksRaw[condId] = tasksGroups[condId].reduce<Record<string, Task>>((p, c, i) => {
      p[c.id] = { ...c, orderId: i }
      return p
    }, {})
  })
  return tasksRaw
}

export const rawToGroups: (conditionsArray: TaskCondition[], raw: TasksRaw) => TasksGroups = (conditionsArray, raw) => {
  const tg: TasksGroups = conditionsArray.reduce((p, c) => {
    p[c.id] = []
    return p
  }, {} as TasksGroups)
  Object.keys(raw).forEach(groupId => {
    tg[groupId] = Object.values(raw[groupId]).sort((a, b) => +a.orderId - +b.orderId)
  })
  return tg
}

export const removeAtIndex: (array: Task[], index: number) => Task[] = (array, index) => {
  return [...array.slice(0, index), ...array.slice(index + 1)];
};

export const insertAtIndex: <K extends Task>(array: K[], index: number, item: K) => K[] = (array, index, item) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
}

export const arrayMove: <K extends string>(array: K[], index: K, item: K) => K[] = (array, oldIndex, newIndex) => {
  return dndKitArrayMove(array, +oldIndex, +newIndex);
};