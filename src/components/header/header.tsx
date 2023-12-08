import * as React from 'react';
import { PropsWithChildren, useContext } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./header.module.scss"
import { UserContext } from '../../providers/userContext';

export default function Header(props: PropsWithChildren) {
  const navigate = useNavigate()
  const { user } = useContext(UserContext)

  const onClick = (pageTitle: string, projId?: string) => {
    switch (pageTitle) {
      case "Settings": {
        navigate("/settings")
        break
      }
      case "Projects": {
        navigate("/projects")
        break
      }
      case "PFS Dashboard": {
        navigate("/")
        break
      }
      case "Add Project": {
        navigate("/add-project")
        break
      }
      default: {
        console.log(pageTitle, projId!)
        if (pageTitle.startsWith("Project")) {
          navigate(`/projects/${projId}`)
        } else {
          navigate('/')
        }
      }
    }
  }

  return (<>
    <ul className={styles.headerNav}>
      <li onClick={() => onClick("Projects", "Projects")}>Projects</li>
      <li onClick={() => onClick("PFS Dashboard", "Dashboard")}>Dashboard</li>
      <li onClick={() => onClick("Settings", "Settings")}>Settings</li>
    </ul>
    <div className={styles.userInfo}>
      <div>{user?.displayName}</div>
      <img src={user?.photoURL || undefined} alt="avatar" />
    </div>

  </>
  );
}
