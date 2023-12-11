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
import { AddProjectForm } from '../../pages/project-page/add-project';
import { DndContext, DragEndEvent, DragStartEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { DndProjects } from './dndProjects';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

export default function AppBar(props: PropsWithChildren) {
	const navigate = useNavigate()

	const { user } = useContext(UserContext)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isAddProjectModal, setAddProjectModal] = useState(false)
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
	const [projects, setProjects] = useState<Project[]>([])
	const [addProjectData, setAddProjectData] = useState<Omit<Project, "id" | "conditions">>({ displayName: "" })
	const [activeProj, setActiveProj] = useState<Project>()

	useEffect(() => {
		const db = getDatabase()
		const txRef = ref(db, realtimeDatabasePaths.projectsPath(user?.uid!))
		onValue(txRef, (snapshot) => {
			const data = snapshot.val();
			if (!!data) {
				setProjects(Object.values(data))
			} else {
				setProjects([])
				console.log('Data not found');
			}
		});
	}, [user?.uid])

	const onClickProject = (projId: string) => {
		navigate(`/projects/${projId}`)
	}

	const removeProject = async () => {
		if (projectToDelete) {
			await projectsService(getDatabase(), user?.uid!).delete(projectToDelete?.id)
			setProjectToDelete(null)
			setIsModalOpen(false)
		}
	}
	const editProject = (project: Project) => {
		console.log("edit project")
	}

	const addProject = async () => {
		if (addProjectData) {
			await projectsService(getDatabase(), user?.uid!).create(addProjectData)
			setAddProjectModal(false)
		} else {
			setAddProjectModal(false)
		}
		setAddProjectData({ displayName: "" })
	}

	const dragStart = (e: DragStartEvent) => {
		console.log("drag start", e)
		setActiveProj(projects.find(p => p.id === e.active.id))
	}
	const dragEnd = (e: DragEndEvent) => {
		console.log("drag end", e)
	}

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	return (
		<ul className={styles.appBarMenu}>
			<Modal
				title="Remove project"
				isOpen={isModalOpen}
				setIsOpen={setIsModalOpen}
				closeButtonText="Cancel"
				onCancel={() => { setProjectToDelete(null) }}
				actionText="Подтвердить"
				actionFunc={() => { removeProject() }}
			>
				<div>Вы уверены что хотите удалить проект "{projectToDelete?.displayName}"?</div>
			</Modal>
			<Modal
				title="Добавить проект"
				isOpen={isAddProjectModal}
				setIsOpen={setAddProjectModal}
				closeButtonText="Cancel"
				onCancel={() => {
					setAddProjectModal(false)
					setAddProjectData({ displayName: "" })
				}}
				actionText="Подтвердить"
				actionFunc={() => { addProject() }}

			>
				<AddProjectForm data={addProjectData} setData={setAddProjectData} />
			</Modal>
			<li>Projects</li>
			<DndContext
				onDragStart={dragStart}
				onDragEnd={dragEnd}
				collisionDetection={closestCenter}
				sensors={sensors}
				modifiers={[restrictToVerticalAxis]}
			>
				<DndProjects
					activeProj={activeProj}
					setAddProjectModal={setAddProjectModal}
					setIsModalOpen={setIsModalOpen}
					setProjectToDelete={setProjectToDelete}
					editProject={editProject}
					projects={projects}
					onClickProject={onClickProject}
				/>
				{/* <ul className={styles.appBarSubMenu}>
					{projects.map(proj => {
						return <li
							className={id === proj.id ? styles.selectedProject : ""}
							key={proj.id}
							onClick={() => { onClickProject(proj.id) }}
						>
							{proj.displayName}
							<Dropdown hover={false}>
								<button onClick={() => editProject(proj)}>Edit</button>
								<button onClick={() => {
									setIsModalOpen(true)
									setProjectToDelete(proj)
								}}>Delete</button>
							</Dropdown>
						</li>

					})}
					<li onClick={() => setAddProjectModal(true)}>Add project <span>+&nbsp;&nbsp;</span></li>
				</ul> */}
			</DndContext>
			<li onClick={() => getAuth().signOut()}>Logout</li>
		</ul >
	);
}
