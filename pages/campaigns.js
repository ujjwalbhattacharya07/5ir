import { ethers } from "ethers";
import styles from '../styles/campaign.module.css';
import crowdfund_abi from "../utils/crowdfundAbi.json";
import usdcAbi from "../utils/usdcAbi.json";
import { useState, useEffect } from "react";

// import Modal from "../components/modal";

  

const Campaigns = () => {
  const [result, setResult] = useState([]);
  const [showModal, setShowModdal] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [id, setId] = useState();
  const [amount, setAmount] = useState();
  const contractAddress = '0xf4FE0634bF724592a46D7898c2723d2eCA5cE7E6';
  const  usdcContractAddress = '0x07865c6e87b9f70255377e024ace6630c1eaa37f';

  // See all the listed campaigns
  const see = async () => {
    try{ 

      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts"});

      if (accounts.length !== 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, crowdfund_abi, signer);
        const seeCampaigns = await contract.seeCampaigns();
        setResult(seeCampaigns);
      } else {
        alert("Please connect wallet to see campaigns");
      }
     } catch(error) {
     console.log(error);
     alert("Please install metamask and connect wallet to see campaigns");
 
  }
}

 useEffect(() => {
    see();
  }, []);
  const pledge = async () => {

    try{

      const {ethereum} = window;

          // first approve before pledging
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner(); 
      const usdcContract = new ethers.Contract(usdcContractAddress,usdcAbi,signer);
      const approval = await usdcContract.approve(contractAddress, (amount * 1000000));
      alert("Approving, please wait.")
      await approval.wait();
      alert('approved! Wait to pledge immediately');
    
      // Implement the pledge function
      const contract = new ethers.Contract(contractAddress, crowdfund_abi, signer);
      const pledge = await contract.pledge(id,amount);
      await pledge.wait();
      alert(` Done: ${pledge.hash}`);

    } catch(error){
      console.log(error)
      alert(error.message);
    }

  }

 
  const withdraw = async () => {

    try{

      const { ethereum } = window;

        // Implement the withdraw function
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner(); 
        const contract = new ethers.Contract(contractAddress, crowdfund_abi, signer);
        const withdrawal = await contract.withdraw(id);
        alert('Mining in progress, please wait');
        await withdrawal.wait();
        alert('Done! Solve your problem');


    } catch(err) {
      alert(err.message);
    }


  }

  // function for date display
  const date = (timeStamp) => {
      let dateFormat = new Date(timeStamp);
      return (dateFormat.getDate()+
      '/' + (dateFormat.getMonth()+1)+
      '/' + dateFormat.getFullYear()+
      ' ' + dateFormat.getHours()+
      ':' + dateFormat.getMinutes()+
      ':' + dateFormat.getSeconds()
      );

  }


  
  return (    
        <div className={styles.container}>
            {
            result.map((res) => (
              <div className={styles.card} key={res.CampaignNo}>
                <h2 style={{textAlign:"center", paddingBottom:"20px"}}>{(res.Title).toString()}</h2>
                <h3 style={{paddingBottom:"10px",color:"#FFF", marginLeft:"10px"}}>Campaign ID: {(res.CampaignNo).toString()}</h3>
                <p style={{paddingBottom:"10px",color:"#fff"}}> Details: {(res.Purpose).toString()}</p>
                <p style={{paddingBottom:"10px",color:"#fff"}} className={styles.blue}>Target: {((res.Target)/1000000).toString()} USDC</p>
                <p style={{paddingBottom:"10px",color:"#fff"}}> Raised so far: {((res.Raised)/1000000).toString()} USDC</p>
                <p style={{paddingBottom:"10px",color:"#fff"}}> Start Time: {(date(res.StartTime * 1000))}</p>
                <p style={{paddingBottom:"10px",color:"#fff"}}> End Time: {(date(res.EndTime * 1000))}</p>
                {(res.Withdrawn) ? <p>Withdrawn: <span className={styles.green}>Yes</span></p> : <p> Withdrawn: <span className={styles.red}>No</span></p>}
                <button style={{color:"#000", fontWeight:"700"}} onClick={()=> setShowModdal(true)}>Pledge</button>
                <button style={{color:"#000", fontWeight:"700"}} onClick={()=> setShowWithdraw(true)}>Withdraw</button>
                {(res.StartTime *1000 > Date.now()) ? <p className={styles.yet_to_start}> Campaign yet to start</p> :((res.StartTime*1000 < Date.now()) && (res.EndTime*1000 > Date.now()))?<p className={styles.ongoing}>Campaign is ongoing</p> :<p className={styles.ended}>Campaign ended</p>}
            
                </div>
              
            ))
          }

          {showWithdraw ? (
            <div className={styles.overlay}>
              <div className={styles.modal}>
                <button onClick={()=> setShowWithdraw(false)} className={styles.close}>X</button>
                <p>Withdraw</p>
                <p className={styles.withdraw_statement}>Ensure you are withdrawing your campaign <br/>
                (Only campaign owner can withdraw from this campaign)
                </p>
                <input type='number' onChange={(e)=>{ setId(e.target.value)}} placeholder='Campaign ID'/>
                <button onClick={withdraw}>Withdraw</button>
                
              </div>
            </div>
          ) : null}

          {showModal ? (
            <div className={styles.overlay}>
              <div className={styles.modal}>
                <button onClick={()=> setShowModdal(false)} className={styles.close}>X</button>  
                <p>Pledge</p>
                <input type='number' onChange={(e)=>{ setId(e.target.value)}} placeholder='Campaign ID'/>
                <input type='number' onChange={(e)=>{ setAmount(e.target.value)}} placeholder='Amount'/>
                <button onClick={pledge}>Pledge</button>
                
              </div>
              </div>
          ) : null}

       
    </div>
  );
}


export default Campaigns;
