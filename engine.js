(function(){
  function allAccounts(data){return data.accounts||[];}
  function activeAccounts(data){return allAccounts(data).filter(a=>!a.archived&&!a.paidOff);}
  function completedAccounts(data){return allAccounts(data).filter(a=>a.paidOff&&!a.archived);}
  function totalBalance(accounts){return (accounts||[]).reduce((sum,account)=>sum+(Number(account.balance)||0),0);}
  function promoIsActive(account){return Boolean(account?.promoEnabled && account?.promoExpires && new Date(account.promoExpires+'T23:59:59') >= new Date());}
  function effectiveApr(account){return promoIsActive(account) ? Number(account.promoApr)||0 : Number(account.apr)||0;}
  function focusAccount(data){
    const accounts=activeAccounts(data).filter(a=>Number(a.balance)>0);
    if(!accounts.length)return activeAccounts(data)[0]||null;
    const sorted=[...accounts];
    if(data.strategy==="snowball")sorted.sort((a,b)=>(Number(a.balance)||0)-(Number(b.balance)||0));
    else sorted.sort((a,b)=>effectiveApr(b)-effectiveApr(a));
    return sorted[0];
  }
  function reviewOrder(data){const accounts=activeAccounts(data);const focus=focusAccount(data);if(!focus)return accounts;return [focus,...accounts.filter(a=>a.id!==focus.id)];}
  function progressPercent(data){const starting=Number(data.startingAmount)||0;if(starting<=0)return activeAccounts(data).length?0:0;return Math.max(0,Math.min(100,Math.round((1-totalBalance(activeAccounts(data))/starting)*100)));}
  function lastBalanceForAccount(snapshot,accountId){const found=(snapshot.accounts||[]).find(item=>item.id===accountId);return found?Number(found.balance)||0:null;}
  function focusBalanceTrend(data,focusId){
    const history=(data.snapshots||[]).filter(s=>lastBalanceForAccount(s,focusId)!==null).slice(-4);
    if(history.length<4)return "insufficient";
    const balances=history.map(s=>lastBalanceForAccount(s,focusId));
    let decreases=0;
    let increases=0;
    for(let i=1;i<balances.length;i++){
      if(balances[i]<balances[i-1])decreases++;
      if(balances[i]>balances[i-1])increases++;
    }
    if(decreases===0)return increases>0?"increasing":"flat";
    return "decreasing";
  }
  function progressStatus(data){
    if(data.review?.status!=="complete")return "Review Due";
    const focus=focusAccount(data);
    if(!focus)return "On Track";
    const trend=focusBalanceTrend(data,focus.id);
    if(trend==="flat"||trend==="increasing")return "Needs Attention";
    return "On Track";
  }
  function isSeasonComplete(data){return activeAccounts(data).length===0 && completedAccounts(data).length>0;}
  function daysUntil(dateString){if(!dateString)return null;const end=new Date(dateString+'T23:59:59');if(Number.isNaN(end.getTime()))return null;const ms=end-new Date();return Math.ceil(ms/86400000);}
  function weeklyReviewsUntil(dateString){const days=daysUntil(dateString);if(days===null)return null;return Math.max(0,Math.ceil(days/7));}
  function soonestPromo(data){const promos=activeAccounts(data).filter(a=>a.promoEnabled&&a.promoExpires).map(a=>({...a,daysRemaining:daysUntil(a.promoExpires),reviewsRemaining:weeklyReviewsUntil(a.promoExpires)})).filter(a=>a.daysRemaining!==null&&a.daysRemaining>=0).sort((a,b)=>a.daysRemaining-b.daysRemaining);return promos[0]||null;}
  window.CCEngine={allAccounts,activeAccounts,completedAccounts,totalBalance,focusAccount,reviewOrder,progressPercent,progressStatus,focusBalanceTrend,promoIsActive,effectiveApr,daysUntil,weeklyReviewsUntil,soonestPromo,isSeasonComplete};
})();
