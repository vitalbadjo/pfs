import { Menu, MenuProps, Spin } from 'antd';
import { RTDBProjects } from '../../models/projects-model';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { FunctionComponent, useContext, useMemo, useState } from 'react';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { useNavigate } from 'react-router-dom';
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
	return Object.values(projects).sort((a, b) => a.orderId - b.orderId).reduce<ItemType[]>((p, c) => {
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
	const { projects, isProjectsLoading } = props

	const { user } = useContext(UserContext)
	const navigate = useNavigate()

	const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false)

	const [selectedMenuKeys, setSelectedMenuKeys] = useState<string[]>([])

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
		const key = await projectsService(getDatabase(), user?.uid!).create(data)
		setCreateProjectModalOpen(false)
		if (key) {
			setSelectedMenuKeys([key])
			navigate(`/projects/${key}`)
		}
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
			selectedKeys={selectedMenuKeys}
			mode="inline"
			theme="dark"
			style={{ height: "100vh" }}
			items={[{
				label: "Projects",
				key: "projects",
				children: [{
					key: 'addProject',
					label: 'addProject',
					icon: <PlusOutlined />,
					danger: true,
				}, ...items]
			}]}
			onSelect={({ key, keyPath }) => {
				setSelectedMenuKeys([key])
				if (key === "addProject") {
					setCreateProjectModalOpen(true)
				} else {
					navigate(`/projects/${key}`)
				}
			}}
			onOpenChange={(keys) => {
				if (keys.length > 1) {
					const lastKey = keys[keys.length - 1]
					if (lastKey !== "projects") {
						setSelectedMenuKeys([lastKey])
						navigate(`/projects/${lastKey}`)
					}
				}
			}}
		/>
		<ProjectCreateFormModal
			open={createProjectModalOpen}
			onCreate={onCreateProject}
			onCancel={() => {
				setCreateProjectModalOpen(false)
				setSelectedMenuKeys([])
			}}
			initialValues={{ displayName: "" }}
			projects={projects}
		/>
	</>
}

