import * as React from 'react';
import { PropsWithChildren, useContext, useEffect, useState } from "react"
import { getAuth } from "firebase/auth"
import { useNavigate, useParams } from "react-router-dom"
import { UserContext } from '../../providers/userContext';
import { Project } from '../../models/projects-model';
import { getDatabase, onValue, ref } from 'firebase/database';
import { realtimeDatabasePaths } from '../../models/realtime-database-paths';
import styles from "./appBar.module.scss"
import projectsService from '../../services/projects';
import Modal from '../modals/modal';

export default function AppBar(props: PropsWithChildren) {
	const navigate = useNavigate()

	const { user } = useContext(UserContext)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [projects, setProjects] = useState<Project[]>([])
	const { id } = useParams()

	useEffect(() => {
		const db = getDatabase()
		const txRef = ref(db, realtimeDatabasePaths.projectsPath(user?.uid!))
		onValue(txRef, (snapshot) => {
			const data = snapshot.val();
			if (!!data) {
				setProjects(Object.values(data))
			} else {
				console.log('Data not found');
			}
		});
	}, [user?.uid])

	const onClick = (pageTitle: string, projId: string) => {
		switch (pageTitle) {
			case "Add Project": {
				navigate("/add-project")
				break
			}
			default: {
				navigate(`/projects/${projId}`)
			}
		}
	}

	const removeProject = async () => {
		await projectsService(getDatabase(), user?.uid!).delete(id!)
	}
	const editProject = (project: Project) => {
		console.log("edit project")
	}

	return (
		<ul className={styles.appBarMenu}>
			<Modal title="Remove project" isOpen={isModalOpen} setIsOpen={setIsModalOpen} closeButtonText="Cancel">
				<div>Are you sure?</div>
				<button
					onClick={() => {
						removeProject()
						navigate("/projects")
						setIsModalOpen(false)
					}}
				>
					Confirm
				</button>
			</Modal>
			<li>Projects</li>
			<ul className={styles.appBarSubMenu}>
				{projects.map(proj => {
					return <li
						className={id === proj.id ? styles.selectedProject : ""}
						key={proj.id}
						onClick={(p) => {
							onClick(Object.keys(p).toString(), proj.id)
						}}
					>

						<div className={styles.projectActions}>
							<button onClick={() => editProject(proj)}>!</button>
							<button onClick={() => setIsModalOpen(true)}>X</button>
						</div>
						{proj.displayName}
					</li>

				})}
				<li onClick={() => onClick("Add Project", "Add project")}>Add project</li>
			</ul>
			<li onClick={() => getAuth().signOut()}>Logout</li>
		</ul>
	);
}
