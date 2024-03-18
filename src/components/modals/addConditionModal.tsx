import React, { useState, useEffect } from 'react';
import { Form, Input, Modal, type FormInstance } from 'antd';

export interface CreateConditionFormValues {
  displayName: string;
  id?: string
}

interface ConditionCreateFormProps {
  initialValues: CreateConditionFormValues;
  onFormInstanceReady: (instance: FormInstance<CreateConditionFormValues>) => void;
}

const CollectionCreateForm: React.FC<ConditionCreateFormProps> = ({
  initialValues,
  onFormInstanceReady,
}) => {
  const [form] = Form.useForm();
  console.log("form", form.getFieldsValue())
  useEffect(() => {
    onFormInstanceReady(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form layout="vertical" form={form} name="form_in_modal" initialValues={initialValues}>
      <Form.Item
        name="displayName"
        label="Condition name"
        rules={[{ required: true, message: 'Please input the name of condition!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="id" hidden>
        <Input />
      </Form.Item>
    </Form>
  );
};

interface ConditionCreateFormModalProps {
  open: boolean;
  onCreate: (values: CreateConditionFormValues) => void;
  onCancel: () => void;
  initialValues: CreateConditionFormValues;
}

export const ConditionCreateFormModal: React.FC<ConditionCreateFormModalProps> = ({
  open,
  onCreate,
  onCancel,
  initialValues,
}) => {
  const [formInstance, setFormInstance] = useState<FormInstance>();
  return (
    <Modal
      open={open}
      title={`${initialValues.id ? "Edit" : "Create"} a new condition`}
      okText="Save"
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
      />
    </Modal>
  );
};
