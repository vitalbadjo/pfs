import { Divider, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useMemo, useState } from "react";
import { get, getDatabase, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import { UserContext } from "../../providers/userContext";
import { Project, Task, TaskCondition } from "../../models/projects-model";
import { realtimeDatabasePaths } from "../../models/realtime-database-paths";

type IProjectViewProps = {
  projectId: string
}

export const ProjectView: React.FunctionComponent<IProjectViewProps> = ({ projectId }) => {
  const { user } = useContext(UserContext)
  const [error, setError] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const { id } = useParams();

  useEffect(() => {
    const db = getDatabase()
    const txRef = ref(db, realtimeDatabasePaths.projectsPath(user?.uid!))
    get(txRef).then(res => {
      if (res.exists()) {
        const projectsResponse: Project[] = Object.values(res.val())
        setProjects(projectsResponse)
        setError("")
      } else {
        setError("Cant get projects data")
      }

    }).catch(error => {
      setError(error)
    })
  }, [user?.uid],)
  const project = projects.find(p => p.id === projectId)
  if (error) {
    console.log("error", error)
    return <Typography>Something went wrong</Typography>
  }

  if (!project) {
    return <Typography>Loading...</Typography>
  }
  return <>
    <div>{project.id}</div>
    <div>{project.displayName}</div>
    <div>
      {project.conditions ? Object.values(project?.conditions!).map(cond => {
        return <ProjectConditions key={cond + Date()} condition={{ id: cond, projectId: cond, displayName: "" }} />
      }) : null}
    </div>
  </>
}

export const ProjectConditions: React.FunctionComponent<{ condition: TaskCondition }> = ({ condition }) => {
  const { user } = useContext(UserContext)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const db = getDatabase()
    const taskTxRef = ref(db, realtimeDatabasePaths.tasksPath(user?.uid!, "", ""))
    get(taskTxRef).then(res => {
      if (res.exists()) {
        const taskResponse: Task[] = Object.values(res.val())
        setTasks(taskResponse)
        setError("")
      } else {
        setError("Cant get tasks data")
      }

    }).catch(error => {
      setError(error)
    })
  })

  return <List sx={{ width: '100%', minWidth: '200px', maxWidth: 360, bgcolor: 'background.paper' }}>
    {tasks.map((cond, i) => {
      return <ListItem key={i}>
        <ListItemText primary={cond.displayName} secondary="Jan 9, 2014" />
      </ListItem>

    })}
  </List>
}



