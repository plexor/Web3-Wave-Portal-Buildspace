import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';
import background from './img/background.jpg'


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");

  //all state propery to store all waves
  const [allWaves, setAllWaves] = useState([]);

  //creating a method that gets all waves from your contract
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        //calling the getAllWaves method from our smart contract
        const waves = await wavePortalContract.getAllWaves();

        //we only need address, timestamp and message in out UI so lets pick those out
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        //storing our data in react state
        setAllWaves(wavesCleaned);
      } else {
        console.log("Eth object doesnt exist")
      }
    } catch (error) {
      console.log(error);
    }
  }

  //creating a variable that holds the contract address after deploying
  const contractAddress = "0xBa2F7b48bADE4Bf079F95a310Aa5E20a1961a27B"

  //creating a variable that references the abi content
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implementing connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrived total wave count...", count.toNumber());

        //executing the actual wave from the smart contract
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      }
      else {
        console.log("Ethereum object does not exist");
      }
    }
    catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    let wavePortalContract;
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);

    }
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <>
      <div className="mainContainer" >
        <div className="img" style={{
          backgroundImage: `url(${background})`
      
        }}>
        </div>
        <div className="dataContainer" >

          <div className="header">
            Hey there 👋
        </div>

          <div className="bio">
            I am Ruben Colon and welcome to Web3! Please Connect! 
        </div>
          <br />

          {
            currentAccount ? (<textarea name="messsage"
              placeholder="type your message"
              type="text"
              id="_message"
              value={message}
              onChange={e => setMessage(e.target.value)} />) : null
          }

          <button className="waveButton" onClick={wave}>
            Wave at Me
        </button>

          {/*
        * If there is no currentAccount render this button
        */}

          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
          </button>
          )}
          <br />
          {allWaves.map((wave, index) => {
            return (
              <div className="return" key={index} style={{ backgroundColor: "OldLace", margin: "8px", padding: "2px" }}>

                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>)
          })}

        </div>
      </div>
    </>
  );
}

export default App



