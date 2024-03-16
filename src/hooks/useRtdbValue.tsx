import { Unsubscribe, getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"

let unsubscribe: Unsubscribe = () => { }
type UseRtdbValueReturnType<T> = { isLoading: boolean, isError: null | Error, data: T | undefined }

export const useRTDBValue = <T extends {}>(path: string): UseRtdbValueReturnType<T> => {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(null)
  const [data, setData] = useState<T>()

  useEffect(() => {
    if (path) {
      const db = getDatabase()
      const txRef = ref(db, path)
      setIsLoading(true)
      unsubscribe = onValue(txRef, async (snapshot) => {
        const data = snapshot.val();
        if (!!data) {
          setData(data)
          setIsLoading(false)
          setIsError(null)
        } else {
          setData(undefined)
          setIsLoading(false)
          setIsError(null)
        }
      });
    }

    return unsubscribe
  }, [path])


  return { isLoading, isError, data }
}