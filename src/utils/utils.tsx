type OrderById = {
  id: string
  order: string | undefined
  [key: string]: any
}

export const insertAtIndex: <T>(array: T[], index: number, item: T) => T[] = (array, index, item) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

export type ReorderType = {
  orderId: string
  id: string
} & Record<string, string | number | object | [] | undefined>

export const reorder = (activeId: string, targetId: string, data: Record<string, ReorderType>) => {
  // if (activeId.length !== 20 || targetId.length !== 20) {
  //   console.log("Can't reorder items because one of id's is incorrect", `active id: ${activeId}`, `target id: ${targetId}`)
  //   return data
  // }

  const { id: activeItemId, orderId: activeItemOrderId } = { ...data[activeId] }
  const { id: targetItemId, orderId: targetItemOrderId } = { ...data[targetId] }
  if (Math.abs(+activeItemOrderId - +targetItemOrderId) === 1) {
    data[activeItemId].orderId = targetItemOrderId
    data[targetItemId].orderId = activeItemOrderId
  } else {
    if (activeItemOrderId > targetItemOrderId) {
      Object.keys(data).forEach(v => {// смещаем все что ниже таргета на 1
        if (data[v].orderId >= targetItemOrderId && data[v].orderId < activeItemOrderId) {
          // console.log(data[+v])
          data[v].orderId = `${+data[v].orderId + 1}`
        }
      })
      data[activeItemId].orderId = targetItemOrderId
    } else {
      Object.keys(data).forEach(v => { // все что больше активного и меньше таргета смещаем на -1
        if (data[v].orderId <= targetItemOrderId && data[v].orderId > activeItemOrderId) {
          data[v].orderId = `${+data[v].orderId - 1}`
        }
      })
      data[activeItemId].orderId = targetItemOrderId
    }
  }
  return data
}
