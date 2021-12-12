import './onboardingRestoreMnemonic.less';
import Icon, { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Col, Form, Row, Typography, Input, notification, Breadcrumb } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import type { InitWalletReply } from '../../api-spec/generated/js/walletunlocker_pb';
import { useTypedDispatch, useTypedSelector } from '../../app/store';
import { ReactComponent as chevronRight } from '../../assets/images/chevron-right.svg';
import {
  HOME_ROUTE,
  ONBOARDING_CREATE_OR_RESTORE_ROUTE,
  ONBOARDING_PAIRING_ROUTE,
} from '../../routes/constants';
import { sleep } from '../../utils';
import { encodeBase64UrlMacaroon } from '../../utils/connect';
import { setMacaroonCredentials, setTdexdConnectUrl } from '../settings/settingsSlice';

import { useInitWalletMutation, useUnlockWalletMutation } from './walletUnlocker.api';

interface IFormInputs {
  mnemonic: string;
  password: string;
  passwordConfirm: string;
}

export const OnboardingRestoreMnemonic = (): JSX.Element => {
  const { Title } = Typography;
  const [form] = Form.useForm<IFormInputs>();
  const [hasMatchingError, setHasMatchingError] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unlockWallet, { error: unlockWalletError }] = useUnlockWalletMutation();
  const [initWallet, { error: initWalletError }] = useInitWalletMutation();
  const dispatch = useTypedDispatch();
  const tdexdConnectUrl = useTypedSelector(({ settings }) => settings.tdexdConnectUrl);

  useEffect(() => {
    unlockWalletError && notification.error({ message: unlockWalletError });
  }, [unlockWalletError]);

  useEffect(() => {
    initWalletError && notification.error({ message: initWalletError });
  }, [initWalletError]);

  const handleRestoreWallet = async () => {
    try {
      setIsLoading(true);
      const { mnemonic, password, passwordConfirm } = await form.validateFields();
      if (!mnemonic || !password || !passwordConfirm) return;
      const mnemonicSanitized = mnemonic.trim().split(' ');
      if (password === passwordConfirm) {
        setHasMatchingError(false);
        // @ts-ignore
        const { data } = await initWallet({
          isRestore: true,
          password: password,
          mnemonic: mnemonicSanitized,
        });
        data.on('status', async (status: any) => {
          if (status.code === 0) {
            await sleep(1000);
            await unlockWallet({ password });
            await sleep(1000);
            setIsLoading(false);
            navigate(HOME_ROUTE);
          } else {
            console.log('status', status);
          }
        });
        data.on('data', async (data: InitWalletReply) => {
          if (data.getStatus() === 0 && data.getData().length > 150) {
            dispatch(setMacaroonCredentials(data.getData()));
            const base64UrlMacaroon = encodeBase64UrlMacaroon(data.getData());
            dispatch(setTdexdConnectUrl(tdexdConnectUrl + '&macaroon=' + base64UrlMacaroon));
          }
        });
      } else {
        notification.error({ message: "Passwords don't match" });
        setHasMatchingError(true);
      }
    } catch (err) {
      // @ts-ignore
      notification.error({ message: err.message });
    }
  };

  return (
    <>
      <Breadcrumb separator={<Icon component={chevronRight} />} className="mt-8 mb-2">
        <Breadcrumb.Item>
          <Link to={ONBOARDING_PAIRING_ROUTE}>Pairing</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={ONBOARDING_CREATE_OR_RESTORE_ROUTE}>Create or Restore</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Restore</Breadcrumb.Item>
      </Breadcrumb>
      <div className="panel">
        <div id="restore-mnemonic">
          <Row className="text-center" justify="center">
            <Col span={24}>
              <Title level={2} className="dm-mono dm-mono__xxx dm-mono__bold">
                Write Your Mnemonic
              </Title>
              <Form
                onFinish={handleRestoreWallet}
                layout="vertical"
                form={form}
                name="pairing_form"
                wrapperCol={{ span: 16, offset: 4 }}
                validateTrigger="onBlur"
              >
                <Form.Item
                  name="mnemonic"
                  className="w-100 mt-8"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your mnemonic',
                    },
                    {
                      validator: async (_, mnemonic: string) => {
                        if (mnemonic?.trim().split(' ').length === 24) {
                          return Promise.resolve();
                        } else {
                          return Promise.reject(new Error('Must be 24 words'));
                        }
                      },
                    },
                  ]}
                >
                  <Input.TextArea rows={5} />
                </Form.Item>
                <Title level={2} className="dm-mono dm-mono__xxx dm-mono__bold mt-8">
                  Set Your Password
                </Title>
                <Form.Item
                  name="password"
                  className={classNames('input', { 'has-error': hasMatchingError })}
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password',
                    },
                    {
                      min: 8,
                      message: 'Password must be min 8 characters',
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="Set Password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete="on"
                  />
                </Form.Item>
                <Form.Item
                  name="passwordConfirm"
                  className={classNames('input', { 'has-error': hasMatchingError })}
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your password',
                    },
                    {
                      min: 8,
                      message: 'Password must be min 8 characters',
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="Confirm Password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete="on"
                  />
                </Form.Item>
                {hasMatchingError && <p className="error">{hasMatchingError}</p>}
                <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
                  <Button htmlType="submit" className="w-100 mt-4" loading={isLoading}>
                    RESTORE
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};
