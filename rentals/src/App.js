import './App.css';
import QRCode from "react-qr-code";
import { BigNumber, ethers } from 'ethers';
import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config } from '@usedapp/core';
import abi from "./contracts/abi.json";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setAccount, setNetworkId, addProvider, changeContract, userChangeStatus, didRenderedCurrentItem, setTotalItems, changeBalance, changeBalanceNull, setCurrentItem, setItemsArr } from './web3Reducers';

const RentalsContract = "0x2E1bf9d08FE4496B7275e9081566C0bb0BF5ec45";

async function addAmoy() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: "0x13882", // Hexadecimal value for 80002
          chainName: 'Amoy',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC', // 2-6 characters long
            decimals: 18,
          },
          rpcUrls: ['https://polygon-amoy.gateway.tenderly.co'], // Add multiple if available
          blockExplorerUrls: ['https://amoy.polygonscan.com/'],
        },
      ],
    });
  } catch (error) {
    console.error('Error adding polygon amoy testnet:', error);
  }
}

function AccountPanel(itemsArr) {
  const { activateBrowserWallet, account } = useEthers();
  const _account = useSelector((state) => state.accounter.value);
  const networkId = useSelector((state) => state.accounter.networkId);
  const balance = useSelector((state) => state.accounter.balance);
  const _contract = useSelector((state) => state.accounter.contract);
  const networkProvider = useSelector((state) => state.accounter.provider);
  const titleInput = useRef(null);
  const priceInput = useRef(null);
  const signMyItem = async () => {
    networkProvider.getSigner(_account);
    var res = await _contract.signItem(priceInput.current.value.toString(), titleInput.current.value);
    var explorerUrl = "https://mumbai.polygonscan.com/tx/" + res.hash;
    await res.wait();
    window.location.reload(false);
  }
  console.log("itemsArr", itemsArr)
  return (
    <div className="account-panel">
      {!itemsArr && (<button onClick={() => activateBrowserWallet()}>Connect</button>)}
      {account && <p>Account: {account}</p>}
      {account && <p>Balance: {balance}</p>}
      <p>Network: {networkId}</p>
      {account && _contract && (
        <div className="item-sign-form">
          <div className="form-group">
            <label>Title of your item</label>
            <input id="title" ref={titleInput}></input>
          </div>
          <div className="form-group">
            <label>Price of your item in POL</label>
            <input id="price" ref={priceInput}></input>
          </div>
          <button onClick={signMyItem}>Sign your item</button>
        </div>
      )}
    </div>
  );
}

function ItemsArrShow() {
  const _contract = useSelector((state) => state.accounter.contract);
  const itemsArr = useSelector((state) => state.accounter.itemsArr);
  const _account = useSelector((state) => state.accounter.value);
  const hoursInput = useRef(null);
  const networkProvider = useSelector((state) => state.accounter.provider);
  const giveItemBackIn = async (index) => {
    var gasPrice = await networkProvider.getGasPrice();
    var res = await _contract.giveItem(index, {
      gasPrice: gasPrice,
      gasLimit: 398765,
    });
    var explorerUrl = "https://mumbai.polygonscan.com/tx/" + res.hash;
    await res.wait();
    window.location.reload(false);
  }
  const rentThisItem = async (index) => {
    var totalHours = hoursInput.current.value.toString();
    var itemPrice = itemsArr[index].price.toString();
    var hourlyPriceOfitems = await _contract.hourlyPriceOfitems();
    var totalPayment = (parseInt(hourlyPriceOfitems.toString()) * parseInt(totalHours));
    if (parseInt(itemPrice) < 99) {
      totalPayment += 100;
    } else {
      totalPayment += parseInt(itemPrice);
    }
    var formattedValue = ethers.utils.parseUnits(totalPayment.toString(), 'wei');
    var gasPrice = await networkProvider.getGasPrice();
    var res = await _contract.rentItem(index, hoursInput.current.value.toString(), {
      value: formattedValue,
      gasPrice: gasPrice,
      gasLimit: 398765,
    });
    var explorerUrl = "https://amoy.polygonscan.com/" + res.hash;
    await res.wait();
    window.location.reload(false);
  }
  return (
    <div className="items-container">
      {itemsArr.map((item, index) => {
        if (item.status == "0" && parseInt(item.renter) == parseInt(_account)) {
          return (
            <div key={index} className="item-card">
              <p>{item.title}</p>
              <p>Price in WEI: {item.price.toString()}</p>
              <QRCode value={`https://via.placeholder.com/600x400?text=${item.title}+${item.id}`} />
              <p>Give item back in</p>
              <button onClick={() => giveItemBackIn(item.id)}>💥</button>
            </div>
          );
        } else if (parseInt(item.owner) == parseInt(_account)) {
          return (
            <div key={index} className="item-card">
              <p>{item.title}</p>
              <p>Price in WEI: {item.price.toString()}</p>
              <QRCode value={`https://via.placeholder.com/600x400?text=${item.title}+${item.id}`} />
              <p>You are the owner of this item, change visibility</p>
              <button onClick={() => console.log("TODO")}>💥</button>
            </div>
          );
        } else if (item.status != "-1") {
          return (
            <div key={index} className="item-card">
              <p>{item.title}</p>
              <p>Price in WEI: {item.price.toString()}</p>
              <QRCode value={`https://via.placeholder.com/600x400?text=${item.title}+${item.id}`} />
              <p>Rent this item for <input id={`hours-${item.id}`} ref={hoursInput}></input> hours</p>
              <button onClick={() => rentThisItem(item.id)}>💥</button>
            </div>
          );
        }
      })}
    </div>
  );
}

function App() {
  const _account = useSelector((state) => state.accounter.value);
  const itemsArr = useSelector((state) => state.accounter.itemsArr);
  const networkProvider = useSelector((state) => state.accounter.provider);
  const _contract = useSelector((state) => state.accounter.contract);
  const totalItems = useSelector((state) => state.accounter.totalItems);
  const currentItem = useSelector((state) => state.accounter.currentItem);
  const _userChanged = useSelector((state) => state.accounter._userChanged);
  const currentItemRendered = useSelector((state) => state.accounter.currentItemRendered);
  const dispatch = useDispatch();

  useEffect(() => {
    addAmoy();
  }, []);

  useEffect(() => {
    if (_userChanged) {
      setBalance();
    }
    if (_contract && !totalItems && itemsArr.length === 0) {
      setBalance();
      fetchData();
      dispatch(setCurrentItem(window.location.search.split("item=")[1]));
    }
    async function setBalance() {
      const balance = await networkProvider.getBalance(_account);
      const balanceInEth = ethers.utils.formatEther(balance);
      dispatch(changeBalance(balanceInEth));
      dispatch(userChangeStatus(false));
    }
    async function fetchData() {
      const counter = await _contract.itemCounter();
      dispatch(setTotalItems(counter.toString()));
      const _itemsArr = [];
      for (let i = 0; i < counter; i++) {
        const selectedItem = await _contract.saleItems(i);
        _itemsArr.push(selectedItem);
      }
      dispatch(setItemsArr(_itemsArr));
    }
    if (window.ethereum) {
      dispatch(setNetworkId(window.ethereum.chainId));
      window.ethereum.on('accountsChanged', (accounts) => {
        dispatch(setAccount(accounts[0]));
        dispatch(userChangeStatus(true));
      });
      window.ethereum.request({ method: 'eth_requestAccounts' }).then(async (account) => {
        if (!_contract) {
          const newestProvider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = await newestProvider.getSigner();
          const mainContract = new ethers.Contract(RentalsContract, abi, signer);
          dispatch(changeContract(mainContract));
          dispatch(addProvider(newestProvider));
          dispatch(setAccount(account[0]));
          const balance = await newestProvider.getBalance(account[0]);
          const balanceInEth = ethers.utils.formatEther(balance);
        }
      });
      if (window.ethereum.chainId !== "0x13882") {
        window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: "0x13882" }],
        });
      }
    } else {
      alert("Wallet connect is not implemented yet, use MetaMask or a browser wallet");
    }
  }, [_userChanged, _contract, totalItems, itemsArr.length, dispatch, networkProvider, _account]);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Available Items</h2>
      </header>
      <main className="App-main">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "50px" }}>
          <ItemsArrShow />
        </div>
        {!itemsArr && (<h3>This will connect into blockchain and scan available items from the contract</h3>)}
        <AccountPanel props={itemsArr} />
      </main>
      <footer className="App-footer">
        <p>© 2023 Item Rental DApp</p>
      </footer>
    </div>
  );
}

export default App;