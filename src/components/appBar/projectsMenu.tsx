import { Menu, MenuProps, Spin } from 'antd';
import { RTDBProjects } from '../../models/projects-model';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { FunctionComponent, useContext, useMemo, useState } from 'react';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateProjectFormValues, ProjectCreateFormModal } from '../modals/addProjectModal';
import { getDatabase } from 'firebase/database';
import projectsService from '../../services/projects';
import { UserContext } from '../../providers/userContext';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
	label: React.ReactNode,
	key: React.Key,
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

const getMenuItems = (projects: RTDBProjects, parentId?: string): ItemType[] => {
	const projectsCopy = { ...projects }
	return Object.values(projects).reduce<ItemType[]>((p, c) => {
		if (!parentId) {
			if (!c.parentProjectId) {
				delete projectsCopy[c.id]
				const childrens = getMenuItems(projectsCopy, c.id)
				p.push(getItem(c.displayName, c.id, null, childrens.length ? childrens : undefined))
			}
		} else {
			if (c.parentProjectId === parentId) {
				delete projectsCopy[c.id]
				const childrens = getMenuItems(projectsCopy, c.id)
				p.push(getItem(c.displayName, c.id, null, childrens.length ? childrens : undefined))
			}
		}
		return p
	}, [])
}

type ProjectsMenuPropsType = {
	projects: RTDBProjects | undefined,
	isProjectsLoading: boolean,
}

export const ProjectsMenu: FunctionComponent<ProjectsMenuPropsType> = (props) => {
	const { user } = useContext(UserContext)
	const { projects, isProjectsLoading } = props
	const navigate = useNavigate()
	const { id: projectId } = useParams()
	const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false)

	const items: MenuProps['items'] = useMemo(() => {
		return getMenuItems(projects || {})
	}, [projects])

	const onCreateProject = async (values: CreateProjectFormValues) => {
		const { displayName, description, parentProjectId } = values
		const folderIdValue = parentProjectId?.length ? { parentProjectId: parentProjectId[parentProjectId.length - 1] } : {}
		const data = {
			displayName,
			description: description || "",
			...folderIdValue
		}
		await projectsService(getDatabase(), user?.uid!).create(data)
		setCreateProjectModalOpen(false)
	}

	if (isProjectsLoading) {
		return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
	}

	if (!projects) {
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
				}, {
					key: 'addProject',
					label: 'addProject',
					icon: <PlusOutlined />,
					danger: true,
				}, ...items]
			}]}
			onSelect={({ key, keyPath }) => {
				if (key === "addProject") {
					setCreateProjectModalOpen(true)
				} else {
					navigate(`/projects/${key}`)
				}
			}}
		/>

		<ProjectCreateFormModal
			open={createProjectModalOpen}
			onCreate={onCreateProject}
			onCancel={() => setCreateProjectModalOpen(false)}
			initialValues={{ displayName: "" }}
			projects={projects}
		/>
	</>


}

