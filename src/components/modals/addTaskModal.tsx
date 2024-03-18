import React, { useState, useEffect } from 'react';
import { Form, Input, Modal, type FormInstance, Button } from 'antd';

export interface CreateTaskFormValues {
  displayName: string;
  description?: string
  id?: string
}

interface TaskCreateFormProps {
  initialValues: CreateTaskFormValues;
  onFormInstanceReady: (instance: FormInstance<CreateTaskFormValues>) => void;
}

const TaskCreateForm: React.FC<TaskCreateFormProps> = ({
  initialValues,
  onFormInstanceReady,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    onFormInstanceReady(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form layout="vertical" form={form} name="form_in_modal" initialValues={initialValues}>
      <Form.Item
        name="displayName"
        label="Task name"
        rules={[{ required: true, message: 'Please input the name of task!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Task description"
        rules={[{ required: false }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
};

interface TaskCreateFormModalProps {
  open: boolean;
  onCreate: (values: CreateTaskFormValues) => void;
  onCancel: () => void;
  onDelete: (id: string) => void
  initialValues: CreateTaskFormValues;
}

export const TaskCreateFormModal: React.FC<TaskCreateFormModalProps> = ({
  open,
  onCreate,
  onDelete,
  onCancel,
  initialValues,
}) => {
  const [formInstance, setFormInstance] = useState<FormInstance>();
  return (
    <Modal
      open={open}
      title={`${initialValues.id ? "Edit" : "Create a new"} task`}
      okButtonProps={{ autoFocus: true }}
      onCancel={onCancel}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={async () => {
          try {
            const values = await formInstance?.validateFields();
            formInstance?.resetFields();
            onCreate(values);
          } catch (error) {
            console.log('Failed:', error);
          }
        }}>
          Сохранить
        </Button>,
        initialValues.id ? <Button
          key="delete"
          danger
          onClick={() => onDelete(initialValues.id!)}
        >
          Удалить
        </Button> : null
      ]}
    >
      <TaskCreateForm
        initialValues={initialValues}
        onFormInstanceReady={(instance) => {
          setFormInstance(instance);
        }}
      />
    </Modal>
  );
};
