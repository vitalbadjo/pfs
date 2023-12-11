type OrderById = {
  id: string
  order: string | undefined
  [key: string]: any
}

export const insertAtIndex: <T>(array: T[], index: number, item: T) => T[] = (array, index, item) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

const findParents = (arr: OrderById[], item: OrderById): OrderById[] => {
  let index = arr.findIndex(v => v.id === item.order)
  if (index > -1) {
    const parent = arr[index]
    const spliced = [...arr]
    spliced.splice(index, 1)
    return [...findParents(spliced, parent), parent]
  }
  return [item]
}

export const orderById = (data: OrderById[]) => {

  const sortable: OrderById[] = data.filter((v) => data.find(e => v.id === e.order))
  // console.log("sortable", sortable)
  const unsortable: OrderById[] = data.filter((v) => !data.find(e => v.id === e.order))
  // console.log("unsortable", unsortable)
  const root = [...unsortable, ...sortable.filter(v => unsortable.find((e => v.id === e.order)))]
  console.log("root", root)
  if (root.length) {
    // root.forEach(v => {
    //   const i = sortable.findIndex(e => v.id === e.order)
    //   if (i > -1) {
    //     root.push(sortable[i])
    //   }
    // })

    while (sortable.find(e => e.id === root[root.length - 1].order)) {
      console.log("root", root)
      root.push(sortable.find(e => e.id === root[root.length - 1].order)!)
    }
  } else {
    throw Error("Elements for sorting is recurse")
  }
  return root
  // return sortable.reduce((p, c, i, a) => {
  //   const prevA = a.findIndex(v => v.id === c.order)
  //   if (prevA > -1) {

  //   } else {
  //     p = insertAtIndex(p,0,c)
  //   }
  //   if (p.findIndex(v => v.id === c.id) === -1) {

  //     if (prevA > -1) {

  //       const prevB = p.findIndex(v => v.id === c.order)
  //       if (prevB > -1) {
  //         p = insertAtIndex(p, prevB + 1, c)
  //       } else {
  //         p = [...p, ...findParents(a, c)]
  //       }
  //     } else {
  //       p = [c, ...p]
  //     }
  //   }


  //   // if (i === a.length - 1) {
  //   //   if (temp.length > 0) {
  //   //     const arr = [...p, ...temp]
  //   //     temp = []
  //   //     p = orderById(arr)
  //   //   }
  //   // }

  //   return p
  // }, [] as OrderById[])
}
const testData = [
  { id: "dsa", order: "asd", o: 4 },
  { id: "ewq", order: "qwe", o: 2 },
  { id: "qwe", order: undefined, o: 1 },
  { id: "cxz", order: "zxc", o: 6 },
  { id: "asd", order: "ewq", o: 3 },
  { id: "zxc", order: "dsa", o: 5 },
]