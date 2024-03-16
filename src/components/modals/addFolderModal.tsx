import React, { useState, useEffect } from 'react';
import { Form, Input, Modal, type FormInstance, Cascader } from 'antd';
import { RTDBProjectsFolders } from '../../models/projects-model';

export interface CreateFolderFormValues {
  displayName: string;
  folderId?: string;
}

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

const foldersToOptions = (folders?: RTDBProjectsFolders): Option[] => {
  if (!folders) return []
  return Object.values(folders).map((folder) => {
    const children = folder.children ? { children: foldersToOptions(folder.children) } : {}
    return {
      value: folder.id,
      label: folder.displayName,
      ...children
    }
  })
}

interface FolderCreateFormProps {
  initialValues: CreateFolderFormValues;
  onFormInstanceReady: (instance: FormInstance<CreateFolderFormValues>) => void;
  folders: RTDBProjectsFolders | undefined
}

const FolderCreateForm: React.FC<FolderCreateFormProps> = ({
  initialValues,
  onFormInstanceReady,
  folders
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    onFormInstanceReady(form);
  }, []);
  const options: Option[] = foldersToOptions(folders)
  return (
    <Form layout="vertical" form={form} name="form_in_modal" initialValues={initialValues}>
      <Form.Item
        name="displayName"
        label="Project name"
        rules={[{ required: true, message: 'Please input the name of project!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="folderId" label="Folder">
        <Cascader options={options} changeOnSelect />
        {/* onChange={onChange} changeOnSelect />; */}
      </Form.Item>
    </Form>
  );
};

interface FolderCreateFormModalProps {
  open: boolean;
  onCreate: (values: { displayName: string, folderId: string[] }) => void;
  onCancel: () => void;
  folders: RTDBProjectsFolders | undefined
  initialValues: CreateFolderFormValues;
}

export const FolderCreateFormModal: React.FC<FolderCreateFormModalProps> = ({
  open,
  onCreate,
  onCancel,
  initialValues,
  folders
}) => {
  const [formInstance, setFormInstance] = useState<FormInstance>();
  return (
    <Modal
      open={open}
      title="Create a new folder"
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
      <FolderCreateForm
        initialValues={initialValues}
        onFormInstanceReady={(instance) => {
          setFormInstance(instance);
        }}
        folders={folders}
      />
    </Modal>
  );
};
