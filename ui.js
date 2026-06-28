(function(){
  function byId(id){return document.getElementById(id);}
  function escapeHtml(value){return String(value ?? "").replace(/[&<>"']/g,match=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[match]));}
  function showScreen(id){document.querySelectorAll(".screen").forEach(screen=>screen.classList.remove("active","reviewMode"));const screen=byId(id);if(screen){screen.classList.add("active");if(id==="review")screen.classList.add("reviewMode");window.scrollTo({top:0,behavior:"instant"});}}
  function setActiveNav(id){document.querySelectorAll(".nav button").forEach(button=>button.classList.toggle("active",button.dataset.screen===id));}
  function money(value){return `$${Math.round(Number(value)||0).toLocaleString()}`;}
  function todayParts(){const date=new Date();return{weekday:date.toLocaleDateString(undefined,{weekday:"long"}),date:date.toLocaleDateString(undefined,{month:"long",day:"numeric"})};}
  function leaf(){return `<svg class="leafMark" viewBox="0 0 64 64" aria-hidden="true"><path d="M20.5 49.5C23.8 34.4 34.1 22.6 49 17.2c.8 14.9-8.4 27.9-23.5 31.6" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.5 49.5c7.4-11.7 16.1-21.1 27.6-31.1" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
  function cycle(segments=0,size=""){const filled=Math.max(0,Math.min(4,Number(segments)||0));const arcs=[
    "M32 8 A24 24 0 0 1 56 32",
    "M56 32 A24 24 0 0 1 32 56",
    "M32 56 A24 24 0 0 1 8 32",
    "M8 32 A24 24 0 0 1 32 8"
  ];return `<div class="cycle ${size}" aria-hidden="true"><svg viewBox="0 0 64 64">${arcs.map((d,i)=>`<path class="seg ${i<filled?"filled":""}" d="${d}"/>`).join("")}</svg><div class="cycleLeaf">${leaf()}</div></div>`;}
  function reviewSegments(done,total){if(!total)return 0;const p=(Number(done)||0)/Number(total);if(p>=1)return 4;if(p>=.75)return 3;if(p>=.5)return 2;if(p>=.25)return 1;return 0;}
  function displayName(account){return account?.name || "Account";}
  function strategyLabel(strategy){return strategy==="snowball"?"Smallest Balance First":"Highest Interest First";}
  function prettyDate(value){if(!value)return "";const d=new Date(value+"T00:00:00");if(Number.isNaN(d.getTime()))return value;return d.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});}
  function prettySnapshotDate(value){if(!value)return "";const d=new Date(value);if(Number.isNaN(d.getTime()))return value;return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
  window.SeasonsUI={byId,escapeHtml,showScreen,setActiveNav,money,todayParts,leaf,cycle,reviewSegments,displayName,strategyLabel,prettyDate,prettySnapshotDate};
  window.CCUI=Object.assign({},window.SeasonsUI,{monthName(months){const d=new Date();d.setMonth(d.getMonth()+months);return d.toLocaleString(undefined,{month:"short",year:"numeric"});}});
})();
