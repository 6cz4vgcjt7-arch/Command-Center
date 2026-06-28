(function(){
  function byId(id){return document.getElementById(id);}
  function escapeHtml(value){return String(value ?? "").replace(/[&<>"']/g,match=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[match]));}
  function showScreen(id){document.querySelectorAll(".screen").forEach(screen=>screen.classList.remove("active","reviewMode"));const screen=byId(id);if(screen){screen.classList.add("active");if(id==="review")screen.classList.add("reviewMode");window.scrollTo({top:0,behavior:"instant"});}}
  function setActiveNav(id){document.querySelectorAll(".nav button").forEach(button=>button.classList.toggle("active",button.dataset.screen===id));}
  function money(value){return `$${Math.round(Number(value)||0).toLocaleString()}`;}
  function todayParts(){const date=new Date();return{weekday:date.toLocaleDateString(undefined,{weekday:"long"}),date:date.toLocaleDateString(undefined,{month:"long",day:"numeric"})};}
  function leaf(){return `<svg class="leafMark" viewBox="0 0 64 64" aria-hidden="true"><path d="M18.5 48.5C19.8 31.1 31.1 18.7 48.2 14.8c1.1 17.6-8.6 31.3-25.8 34.8" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.3 51.4c6.2-12.8 14.3-23.4 25.4-32.9" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M31.1 38.5l-1.7-11.2" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M36.8 31.5l8.2-.8" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>`;}
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
