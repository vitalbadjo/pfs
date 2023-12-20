import { FunctionComponent, PropsWithChildren } from "react";
import { Project } from "../../models/projects-model";
import styles from "./appBar.module.scss"
import { DragOverlay, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Dropdown } from "../UI/dropdown/dropdown";
import { useParams } from "react-router-dom";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { APP_ICONS } from "../../config/media";
import { Button } from "../UI/inputs/button";

type IDndProjectsProps = {
  projects: Project[]
  onClickProject: Function
  editProject: Function
  setIsModalOpen: Function
  setProjectToDelete: Function
  setAddProjectModal: Function
  activeProj: Project | null
}

export const DndProjects: FunctionComponent<PropsWithChildren & IDndProjectsProps> = (props) => {
  const {
    projects,
    onClickProject,
    editProject,
    setAddProjectModal,
    setIsModalOpen,
    setProjectToDelete,
    activeProj
  } = props

  return <ul className={styles.appBarSubMenu} >
    <SortableContext items={projects.sort((a, b) => +a.orderId - +b.orderId)} strategy={verticalListSortingStrategy}>
      {projects.sort((a, b) => +a.orderId - +b.orderId).map(proj => {
        return <DndProjectsItem
          key={proj.id}
          onClickProject={onClickProject}
          setIsModalOpen={setIsModalOpen}
          setProjectToDelete={setProjectToDelete}
          editProject={editProject}
          proj={proj}
        />

      })}
      <DragOverlay>{activeProj ?
        <DndProjectsItem
          key={activeProj.id}
          onClickProject={onClickProject}
          setIsModalOpen={setIsModalOpen}
          setProjectToDelete={setProjectToDelete}
          editProject={editProject}
          proj={activeProj}
        /> : null
      }
      </DragOverlay>
      <li onClick={() => setAddProjectModal(true)}>Add project <span>+&nbsp;&nbsp;</span></li>
    </SortableContext>
  </ul>

}

type IDndProjectsItemProps = {
  onClickProject: Function
  editProject: Function
  setIsModalOpen: Function
  setProjectToDelete: Function
  proj: Project
}

const DndProjectsItem: FunctionComponent<IDndProjectsItemProps> = (props) => {
  const { id } = useParams()
  const { setIsModalOpen, setProjectToDelete, editProject, onClickProject, proj } = props
  const { attributes, listeners, setNodeRef, transform, isDragging, transition } = useSortable({
    id: proj.id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,

  };
  const dragButtonStyle = { cursor: isDragging ? "grabbing" : "grab" }
  return <li
    ref={setNodeRef}
    style={style}
    className={id === proj.id ? styles.selectedProject : ""}
    key={proj.id}
    onClick={() => { onClickProject(proj.id) }}
  >
    {APP_ICONS.dragHandler({
      ...listeners,
      ...attributes,
      style: { dragButtonStyle },
      className: styles.dragHandler
    })}
    <div {...listeners} {...attributes} style={dragButtonStyle} className={styles.dragHandler}></div>
    {proj.displayName}
    <Dropdown hover={false}>
      <Button onClick={() => editProject(proj)} text="Edit" />
      <Button onClick={() => {
        setIsModalOpen(true)
        setProjectToDelete(proj)
      }} text="Delete" />
    </Dropdown>
  </li>
}