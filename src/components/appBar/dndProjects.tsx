import { FunctionComponent, PropsWithChildren } from "react";
import { Project } from "../../models/projects-model";
import styles from "./appBar.module.scss"
import { DragOverlay, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Dropdown } from "../UI/dropdown/dropdown";
import { useParams } from "react-router-dom";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";

type IDndProjectsProps = {
  projects: Project[]
  onClickProject: Function
  editProject: Function
  setIsModalOpen: Function
  setProjectToDelete: Function
  setAddProjectModal: Function
  activeProj: Project | undefined
}

export const DndProjects: FunctionComponent<PropsWithChildren & IDndProjectsProps> = (props) => {
  const { projects, onClickProject, editProject, setAddProjectModal, setIsModalOpen, setProjectToDelete, activeProj } = props
  const { setNodeRef } = useDroppable({
    id: 'dnd-projects',
  });

  return <SortableContext items={projects} strategy={rectSortingStrategy}>
    <ul className={styles.appBarSubMenu} ref={setNodeRef}>

      {projects.map(proj => {
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

    </ul>
  </SortableContext>
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
    cursor: false ? "grabbing" : "grab",
  };
  return <li
    ref={setNodeRef}
    style={style}
    className={id === proj.id ? styles.selectedProject : ""}
    key={proj.id}
    onClick={() => { onClickProject(proj.id) }}
    {...listeners}
    {...attributes}
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
}