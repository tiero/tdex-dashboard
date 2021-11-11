import React from 'react';
import { Navigate, Route, Routes as ReactRouterDomRoutes } from 'react-router-dom';

import { useTypedSelector } from '../app/store';
import { Home } from '../features/home/Home';
import { CreateMarket } from '../features/operator/CreateMarket';
import { FeeDeposit } from '../features/operator/FeeDeposit';
import { FeeWithdraw } from '../features/operator/FeeWithdraw';
import { Market } from '../features/operator/Market';
import { Settings } from '../features/settings/Settings';
import { OnboardingConfirmMnemonic } from '../features/walletUnlocker/OnboardingConfirmMnemonic';
import { OnboardingPairing } from '../features/walletUnlocker/OnboardingPairing';
import { OnboardingShowMnemonic } from '../features/walletUnlocker/OnboardingShowMnemonic';

import {
  HOME_ROUTE,
  SETTINGS_ROUTE,
  MARKET_ROUTE,
  FEE_DEPOSIT_ROUTE,
  ONBOARDING_PAIRING_ROUTE,
  ONBOARDING_SHOW_MNEMONIC_ROUTE,
  ONBOARDING_CONFIRM_MNEMONIC_ROUTE,
  CREATE_MARKET_ROUTE,
  FEE_WITHDRAW_ROUTE,
} from './constants';

const PrivateRoute = ({ children }: any) => {
  const isOnboarded = useTypedSelector(
    ({ settings }) => !!(settings.macaroonCredentials && settings.tdexdConnectUrl)
  );
  return isOnboarded ? children : <Navigate to={ONBOARDING_PAIRING_ROUTE} />;
};

export const Routes = (): JSX.Element => {
  return (
    <ReactRouterDomRoutes>
      <Route
        path={HOME_ROUTE}
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path={MARKET_ROUTE}
        element={
          <PrivateRoute>
            <Market />
          </PrivateRoute>
        }
      />
      <Route
        path={SETTINGS_ROUTE}
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path={FEE_DEPOSIT_ROUTE}
        element={
          <PrivateRoute>
            <FeeDeposit />
          </PrivateRoute>
        }
      />
      <Route
        path={FEE_WITHDRAW_ROUTE}
        element={
          <PrivateRoute>
            <FeeWithdraw />
          </PrivateRoute>
        }
      />
      <Route
        path={CREATE_MARKET_ROUTE}
        element={
          <PrivateRoute>
            <CreateMarket />
          </PrivateRoute>
        }
      />

      {/* Onboarding Routes*/}
      <Route path={ONBOARDING_PAIRING_ROUTE} element={<OnboardingPairing />} />
      <Route path={ONBOARDING_SHOW_MNEMONIC_ROUTE} element={<OnboardingShowMnemonic />} />
      <Route path={ONBOARDING_CONFIRM_MNEMONIC_ROUTE} element={<OnboardingConfirmMnemonic />} />
    </ReactRouterDomRoutes>
  );
};
