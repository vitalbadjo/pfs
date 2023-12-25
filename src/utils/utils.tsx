
export const insertAtIndex: <T>(array: T[], index: number, item: T) => T[] = (array, index, item) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

export type ReorderType = {
  orderId: number
  id: string
  displayName: string
  projectId: string
  taskCondition: string
} & Record<string, any>


/**
 * 
 * @param activeId 
 * @param targetId 
 * @param data 
 * @returns data
 * 
 */

export const reorderSimple = (activeId: string, targetId: string, data: Record<string, ReorderType>) => {

  const { id: activeItemId, orderId: activeItemOrderId } = { ...data[activeId] }
  const { id: targetItemId, orderId: targetItemOrderId } = { ...data[targetId] }

  if (Math.abs(+activeItemOrderId - +targetItemOrderId) === 1) {// if only swap two elements needed
    data[activeItemId].orderId = targetItemOrderId
    data[targetItemId].orderId = activeItemOrderId
  } else {
    if (activeItemOrderId > targetItemOrderId) {
      Object.keys(data).forEach(v => {// смещаем все что ниже таргета на 1
        if (data[v].orderId >= targetItemOrderId && data[v].orderId < activeItemOrderId) {
          data[v].orderId = +data[v].orderId + 1
        }
      })
      data[activeItemId].orderId = targetItemOrderId
    } else {
      Object.keys(data).forEach(v => { // все что больше активного и меньше таргета смещаем на -1
        if (data[v].orderId <= targetItemOrderId && data[v].orderId > activeItemOrderId) {
          data[v].orderId = +data[v].orderId - 1
        }
      })
      data[activeItemId].orderId = targetItemOrderId
    }
  }
  return data
}


const reorderRemove = (activeId: string, data: Record<string, ReorderType>) => {
  const orderIdToDelete = data[activeId].orderId
  delete data[activeId]
  Object.keys(data).forEach(v => {
    if (data[v].orderId > orderIdToDelete) {
      data[v].orderId = data[v].orderId - 1
    }
  })
  return data
}

const reorderAdd = (activeObject: ReorderType, targetId: string, targetParentId: string, data: Record<string, ReorderType>) => {
  // const isActiveIdInData = activeId in Object.keys(data)
  const isTargetIdInData = targetId in Object.keys(data)
  if (isTargetIdInData) {
    Object.values(data).filter(v => +v.orderId >= +data[targetId].orderId).forEach(v => {
      data[v.id].orderId = +data[v.id].orderId + 1//`${}`
    })
    data[activeObject.id] = { ...activeObject, orderId: data[targetId].orderId }
  } else {
    const lastIndex = Object.values(data).length + 1
    data[activeObject.id] = { ...activeObject, orderId: lastIndex, taskCondition: targetParentId }
  }
  return data
}


//reorder function for tasks
type ReorderCondiditonId = string
type ReorderTaskId = string
export type ReorderBetweenListsData = Record<ReorderCondiditonId, Record<ReorderTaskId, ReorderType>>
export const reorderBetweenLists = (activeId: string, targetId: string, data: ReorderBetweenListsData) => {
  const [activeCondition, activeTask] = activeId.split("/")
  const [targetCondition, targetTask] = targetId.split("/")
  if (activeCondition === targetCondition) {
    data[activeCondition] = reorderSimple(activeTask, targetTask, data[activeCondition])
    return data
  } else {
    //removing
    const activeObject = { ...data[activeCondition][activeTask] }
    data[activeCondition] = reorderRemove(activeTask, data[activeCondition])
    //adding
    data[targetCondition] = reorderAdd(activeObject, targetTask, targetCondition, data[targetCondition])
    data[targetCondition] = reorderSimple(activeTask, targetTask, data[targetCondition])
    return data
  }
}