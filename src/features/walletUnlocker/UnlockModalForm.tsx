import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Form, Input, Modal, notification } from 'antd';
import classNames from 'classnames';
import React from 'react';

import { useIsReadyQuery, useUnlockWalletMutation } from './walletUnlocker.api';

interface IFormInputs {
  password: string;
}

interface UnlockModalFormProps {
  closable?: boolean;
  handleUnlockWalletModalCancel: () => void;
  isUnlockWalletModalVisible: boolean;
}

export const UnlockModalForm = ({
  closable = true,
  handleUnlockWalletModalCancel,
  isUnlockWalletModalVisible,
}: UnlockModalFormProps): JSX.Element => {
  const [form] = Form.useForm<IFormInputs>();
  const [unlockWallet, { error: unlockWalletError, isLoading }] = useUnlockWalletMutation();
  const { data: isReady } = useIsReadyQuery();

  const handleUnlockWalletModalOk = async () => {
    try {
      if (isReady?.isUnlocked) {
        notification.success({ message: 'Wallet is already unlocked' });
        form.resetFields();
        handleUnlockWalletModalCancel();
      } else {
        const values = await form.validateFields();
        const res = await unlockWallet({ password: values.password });
        // @ts-ignore
        if (res?.error) throw new Error(res?.error);
        notification.success({ message: 'Wallet unlocked successfully' });
        form.resetFields();
        handleUnlockWalletModalCancel();
      }
    } catch (err) {
      // @ts-ignore
      notification.error({ message: err.message });
    }
  };

  return (
    <Modal
      style={{ textAlign: 'center' }}
      title="Unlock Wallet"
      visible={isUnlockWalletModalVisible}
      onOk={handleUnlockWalletModalOk}
      onCancel={() => {
        form.resetFields();
        handleUnlockWalletModalCancel();
      }}
      confirmLoading={isLoading}
      closable={closable}
      maskClosable={closable}
      maskStyle={{ backdropFilter: 'blur(6px)' }}
      footer={
        closable
          ? undefined
          : [
              <Button key="unlock" loading={isLoading} onClick={handleUnlockWalletModalOk}>
                Unlock
              </Button>,
            ]
      }
    >
      <Form layout="vertical" form={form} name="unlock_wallet_form" wrapperCol={{ span: 16 }}>
        <Form.Item
          label="Password"
          name="password"
          className={classNames({ 'has-error': unlockWalletError })}
        >
          <Input.Password iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
        </Form.Item>
        {unlockWalletError && <p className="error">{unlockWalletError}</p>}
      </Form>
    </Modal>
  );
};