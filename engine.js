(function(){
  function activeAccounts(data){return (data.accounts||[]).filter(a=>!a.archived);}
  function totalBalance(accounts){return (accounts||[]).reduce((sum,account)=>sum+(Number(account.balance)||0),0);}
  function focusAccount(data){const accounts=activeAccounts(data).filter(a=>Number(a.balance)>0);if(!accounts.length)return activeAccounts(data)[0]||null;const sorted=[...accounts];if(data.strategy==="snowball")sorted.sort((a,b)=>(Number(a.balance)||0)-(Number(b.balance)||0));else sorted.sort((a,b)=>(Number(b.apr)||0)-(Number(a.apr)||0));return sorted[0];}
  function reviewOrder(data){const accounts=activeAccounts(data);const focus=focusAccount(data);if(!focus)return accounts;return [focus,...accounts.filter(a=>a.id!==focus.id)];}
  function progressPercent(data){const starting=Number(data.startingAmount)||0;if(starting<=0)return activeAccounts(data).length?0:0;return Math.max(0,Math.min(100,Math.round((1-totalBalance(activeAccounts(data))/starting)*100)));}
  function progressStatus(data){if(data.review?.status!=="complete")return "Review Due";const latest=data.snapshots?.slice(-4)||[];if(latest.length<2)return "On Track";return "On Track";}
  function completedAccounts(data){return activeAccounts(data).filter(a=>Number(a.balance)<=0).length;}
  function isSeasonComplete(data){return activeAccounts(data).length>0 && activeAccounts(data).every(a=>Number(a.balance)<=0);}
  window.CCEngine={activeAccounts,totalBalance,focusAccount,reviewOrder,progressPercent,progressStatus,completedAccounts,isSeasonComplete};
})();
