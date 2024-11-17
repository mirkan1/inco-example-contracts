import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {
  Mainnet,
  DAppProvider,
  useEtherBalance,
  useEthers,
  Config,
  // BNB,
  Polygon,
  //PolygonTestnet,
  BSCTestnet,
  DEFAULT_SUPPORTED_CHAINS,
} from '@usedapp/core';
// import { DEFAULT_SUPPORTED_CHAINS } from '@usedapp/core/constats';
// import { formatEther } from '@ethersproject/units';
import { Provider } from 'react-redux';
import store from './store';


const config = {
  readOnlyChainId: "0x13882",
  readOnlyUrls: {
    [80002]: 'https://polygon-amoy.gateway.tenderly.co',
  },
  networks: [
    DEFAULT_SUPPORTED_CHAINS[29],
  ]
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </Provider>
);

import reportWebVitals from './reportWebVitals';

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();