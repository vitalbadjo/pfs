import { TaskCondition } from "../../models/projects-model";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../providers/userContext";
import { getDatabase, onValue, ref } from "firebase/database";
import { realtimeDatabasePaths } from "../../models/realtime-database-paths";
import { useParams } from "react-router-dom";
import styles from "./projects-page.module.scss"
import { Unsubscribe } from "firebase/auth";
import { Conditions } from "./conditions/conditions";
import { Tasks } from "./tasks/tasks";

let unsubscribe: Unsubscribe = () => { }
type ConditionsRaw = Record<string, TaskCondition>

export const ProjectsPage: React.FunctionComponent = () => {
  const { user } = useContext(UserContext)
  const { id } = useParams();
  // const [conditions, setConditions] = useState<TaskCondition[]>()
  // state for dnd
  const [conditionsRaw, setConditionsRaw] = useState<ConditionsRaw>({})

  useEffect(() => {

    if (id) {
      unsubscribe()
      const db = getDatabase()
      const txRef = ref(db, realtimeDatabasePaths.conditionsPath(user?.uid!, id))

      unsubscribe = onValue(txRef, (snapshot) => {
        const data = snapshot.val();
        if (!!data) {
          setConditionsRaw(data)
        } else {
          setConditionsRaw({})
          console.log('Data not found (conditions)');
        }
      });
    }
    return unsubscribe
  }, [user?.uid, id])

  const conditionsArray = useMemo(() => {
    return Object.values(conditionsRaw).sort((a, b) => a.orderId - b.orderId)
  }, [conditionsRaw])

  if (!id) {
    return <div>Пожалуйста выберите проект в меню слева</div>
  }

  return <div className={styles.projectGrid}>
    <Conditions
      id={id}
      conditionsRaw={conditionsRaw}
      conditions={conditionsArray}
      setConditionsRaw={setConditionsRaw}
    />
    <Tasks
      id={id}
      conditionsArray={conditionsArray}
    />
  </div>

}



