export type ReorderType = {
  orderId: number
  id: string
  displayName: string
  projectId?: string
  taskCondition?: string
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