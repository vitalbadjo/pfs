import { TaskCondition } from "../../models/projects-model";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../providers/userContext";
import { getDatabase, onValue, ref } from "firebase/database";
import { realtimeDatabasePaths } from "../../models/realtime-database-paths";
import { useParams } from "react-router-dom";
import style from "./projects-page.module.scss"
import { ConditionColumn } from "./condition-col";
import { Unsubscribe } from "firebase/auth";

let unsubscribe: Unsubscribe = () => { }

export const ProjectsPage: React.FunctionComponent = () => {
  const { user } = useContext(UserContext)
  const [error, setError] = useState("")
  const { id } = useParams();
  const [conditions, setConditions] = useState<TaskCondition[]>()

  useEffect(() => {

    if (id) {
      unsubscribe()
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.conditionsPath(user?.uid!, id))

      unsubscribe = onValue(txRef, (snapshot) => {
        const data = snapshot.val();
        console.log("conddata", data, user?.uid, id)
        if (!!data) {
          setConditions(Object.values(data))
        } else {
          setConditions([])
          console.log('Data not found');
        }
      });
    }
    return unsubscribe
  }, [user?.uid, id])

  if (error) {
    return <div>Something went wrong</div>
  }

  if (!id) {
    return <div>Pleases select project</div>
  }

  return <div className={style.projectGrid} style={{ gridTemplateColumns: `repeat(${conditions?.length! + 1}, 200px)` }}>
    {conditions && conditions.map(condition => {
      return <ConditionColumn key={condition.id} condition={condition} projectId={id} />
    })}
    <ConditionColumn condition={null} projectId={id} />
  </div>
}



