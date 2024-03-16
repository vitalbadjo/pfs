import React, { useState, useEffect } from 'react';
import { Form, Input, Modal, type FormInstance, Cascader } from 'antd';
import { RTDBProjects } from '../../models/projects-model';

export interface CreateProjectFormValues {
  displayName: string;
  description?: string;
  parentProjectId?: string;
}

interface Option {
  value: string;
  label: string;
}

const foldersToOptions = (projects?: RTDBProjects): Option[] => {
  if (!projects) return []
  return Object.values(projects).map((folder) => {
    return {
      value: folder.id,
      label: folder.displayName,
    }
  })
}

interface ProjectCreateFormProps {
  initialValues: CreateProjectFormValues;
  onFormInstanceReady: (instance: FormInstance<CreateProjectFormValues>) => void;
  projects: RTDBProjects | undefined
}

const CollectionCreateForm: React.FC<ProjectCreateFormProps> = ({
  initialValues,
  onFormInstanceReady,
  projects
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    onFormInstanceReady(form);
  }, []);
  const options: Option[] = foldersToOptions(projects)
  return (
    <Form layout="vertical" form={form} name="form_in_modal" initialValues={initialValues}>
      <Form.Item
        name="displayName"
        label="Project name"
        rules={[{ required: true, message: 'Please input the name of project!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input type="textarea" />
      </Form.Item>
      <Form.Item name="folderId" label="Folder">
        <Cascader options={options} changeOnSelect />
        {/* onChange={onChange} changeOnSelect />; */}
      </Form.Item>
    </Form>
  );
};

interface ProjectCreateFormModalProps {
  open: boolean;
  onCreate: (values: CreateProjectFormValues) => void;
  onCancel: () => void;
  projects: RTDBProjects | undefined
  initialValues: CreateProjectFormValues;
}

export const ProjectCreateFormModal: React.FC<ProjectCreateFormModalProps> = ({
  open,
  onCreate,
  onCancel,
  initialValues,
  projects
}) => {
  const [formInstance, setFormInstance] = useState<FormInstance>();
  return (
    <Modal
      open={open}
      title="Create a new project"
      okText="Create"
      cancelText="Cancel"
      okButtonProps={{ autoFocus: true }}
      onCancel={onCancel}
      destroyOnClose
      onOk={async () => {
        try {
          const values = await formInstance?.validateFields();
          formInstance?.resetFields();
          onCreate(values);
        } catch (error) {
          console.log('Failed:', error);
        }
      }}
    >
      <CollectionCreateForm
        initialValues={initialValues}
        onFormInstanceReady={(instance) => {
          setFormInstance(instance);
        }}
        projects={projects}
      />
    </Modal>
  );
};
