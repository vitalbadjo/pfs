import { Menu, MenuProps, Spin, theme } from 'antd';
import { UserContext } from '../../providers/userContext';
import { FolderDomain, Project, RTDBProjects, RTDBProjectsFolders } from '../../models/projects-model';
import { EditOutlined, FolderOutlined, LoadingOutlined, PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { FunctionComponent, useContext, useMemo, useState } from 'react';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CreateProjectFormValues, ProjectCreateFormModal } from '../modals/addProjectModal';
import projectsService from '../../services/projects';
import { getDatabase } from 'firebase/database';
import { FolderCreateFormModal } from '../modals/addFolderModal';
import { ConfirmModal } from '../modals/confirmModal';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
	label: React.ReactNode,
	key: `${"project" | "folder" | "delete" | "edit"}.${React.Key}`,
	icon?: React.ReactNode,
	children?: MenuItem[],
	danger?: boolean,
	type?: 'group',
): MenuItem {
	return {
		key,
		icon,
		children,
		label,
		danger,
		type,
	} as MenuItem;
}

const getMenuItemChildrenActions = (type: "project" | "folder", id: string, title: string) => {
	return [
		getItem(`Edit ${title}`, `${type}.edit.${id}`, <EditOutlined />, undefined, true),
		getItem(`Delete ${title}`, `${type}.delete.${id}`, <EditOutlined />, undefined, true)
	]
}

function getMenuItems(data: RTDBProjectsFolders | undefined, projects: RTDBProjects | undefined, parentFolderId?: string): ItemType[] {
	const projectsCopy = { ...projects }
	if (!data) {
		return parentFolderId ? [] : Object.values(projectsCopy).map(p => getItem(p.displayName, `project.${p.id}`, <ProjectOutlined />))
	}
	const folders = Object.keys(data).reduce<ItemType[]>((p, c, i) => {
		const { displayName, id, children } = data[c]

		const currentFolderProjects = Object.keys(projectsCopy)
			.filter(projectId => `${projectsCopy[projectId].folderId}` === `${id}`)
			.map(projectId => {
				const project = { ...projectsCopy[projectId] }
				delete projectsCopy[projectId]
				return getItem(project.displayName, `project.${project.id}`, <ProjectOutlined />, getMenuItemChildrenActions("project", project.id, project.displayName))
			})

		if (children || currentFolderProjects.length) {
			p[i] = getItem(
				displayName,
				`folder.${id}`,
				<FolderOutlined />,
				[...getMenuItemChildrenActions("folder", id, displayName), ...getMenuItems(children, projectsCopy, id), ...currentFolderProjects],
			)
		} else {
			p[i] = getItem(
				displayName,
				`folder.${id}`,
				<FolderOutlined />,
				getMenuItemChildrenActions("folder", id, displayName)
			)
		}

		return p
	}, [])
	const restProjectsItems = Object.values(projectsCopy).filter(p => p.folderId === parentFolderId).map(p => getItem(p.displayName, `project.${p.id}`, <ProjectOutlined />))
	// console.log("restProjectsItems", restProjectsItems)
	return [...folders, ...restProjectsItems]
}

type ProjectsMenuPropsType = {
	folders: RTDBProjectsFolders | undefined,
	projects: RTDBProjects | undefined,
	isProjectsLoading: boolean,
	isFoldersLoading: boolean,
}

export const ProjectsMenu: FunctionComponent<ProjectsMenuPropsType> = (props) => {
	const { folders, projects, isFoldersLoading, isProjectsLoading } = props
	const { user } = useContext(UserContext)
	const navigate = useNavigate()
	const { id: projectId } = useParams()
	const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false)
	const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false)
	const [editProjectModalOpen, setEditProjectModalOpen] = useState(false)
	const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false)
	const [editFolderModalOpen, setEditFolderModalOpen] = useState(false)
	const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false)
	const [selectedProject, setSelectedProject] = useState<Project>()
	const [selectedFolder, setSelectedFolder] = useState<FolderDomain>()

	const items: MenuProps['items'] = useMemo(() => {
		return getMenuItems(folders, projects)
	}, [folders, projects])

	const onCreateProject = async (values: CreateProjectFormValues) => {
		const { displayName, description, folderId } = values
		const folderIdValue = folderId?.length ? { folderId: folderId[folderId.length - 1] } : {}
		const data = {
			displayName,
			description: description || "",
			...folderIdValue
		}
		const dbRef = getDatabase()
		await projectsService(dbRef, user?.uid!).create(data)
		console.log("Project created")
		setCreateProjectModalOpen(false)
	}

	const onSelectFolder = {}

	const onCreateFolder = async (values: { displayName: string, folderId: string[] }) => {
		console.log(values)
		const { displayName, folderId } = values
		const path = folderId?.length ? folderId[folderId.length - 1] : ""
		console.log("path", path)
		const dbRef = getDatabase()
		await projectsService(dbRef, user?.uid!).folders.add(displayName, path)
		console.log("Project created")
		setCreateFolderModalOpen(false)
	}

	const onEditFolder = () => { }
	const onDeleteFolder = () => { }

	const onEditProject = () => { }
	const onDeleteProject = () => { }

	if (isFoldersLoading || isProjectsLoading) {
		return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
	}

	if (!projects || !folders) {
		return <Spin />
	}

	return <>
		<Menu
			inlineIndent={10}
			multiple={true}
			selectedKeys={projectId ? [`project.${projectId}`] : undefined}
			mode="inline"
			theme="dark"
			style={{ height: "100vh" }}
			items={[{
				label: "Projects",
				key: "projects",
				children: [{
					key: 'addFolder',
					label: 'addFolder',
					icon: <PlusOutlined />,
					danger: true,
					// onMouseEnter: console.log,
				}, {
					key: 'addProject',
					label: 'addProject',
					icon: <PlusOutlined />,
					danger: true,
				}, ...items]
			}]}
			onSelect={({ key, keyPath }) => {
				console.log(keyPath)
				const [type, action, id] = key.split(".")

				if (key === "addProject") {
					setCreateProjectModalOpen(true)
				} else if (key === "addFolder") {
					setCreateFolderModalOpen(true)
				} else {
					if (type === "project") {
						setSelectedProject(projects[id])
						if (action === "edit") {
							setEditProjectModalOpen(true)
						} else if (action === "delete") {
							setDeleteProjectModalOpen(true)
						} else {
							navigate(`/projects/${action}`)
						}
					} else {
						// setSelectedFolder(folders)
						if (action === "edit") {
							setEditFolderModalOpen(true)
						} else if (action === "delete") {
							setDeleteFolderModalOpen(true)
						}
					}
				}
			}}
		/>

		<ProjectCreateFormModal
			open={createProjectModalOpen}
			onCreate={onCreateProject}
			onCancel={() => setCreateProjectModalOpen(false)}
			initialValues={{ displayName: "" }}
			folders={folders}
		/>
		<FolderCreateFormModal
			open={createFolderModalOpen}
			onCreate={onCreateFolder}
			onCancel={() => setCreateFolderModalOpen(false)}
			initialValues={{ displayName: "" }}
			folders={folders}
		/>
		<ConfirmModal
			title='Удалить проект'
			open={deleteProjectModalOpen}
			confirm={onDeleteProject}
			cancel={() => setDeleteProjectModalOpen(false)}
		/>
		<ConfirmModal
			title='Удалить папку'
			open={deleteFolderModalOpen}
			confirm={onDeleteFolder}
			cancel={() => setDeleteFolderModalOpen(false)}
		/>
	</>


}

