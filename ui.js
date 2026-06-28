(function(){
  function byId(id){return document.getElementById(id);}
  function escapeHtml(value){return String(value ?? "").replace(/[&<>"']/g,match=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[match]));}
  function showScreen(id){document.querySelectorAll(".screen").forEach(screen=>screen.classList.remove("active","reviewMode"));const screen=byId(id);if(screen){screen.classList.add("active");if(id==="review")screen.classList.add("reviewMode");window.scrollTo({top:0,behavior:"instant"});}}
  function setActiveNav(id){document.querySelectorAll(".nav button").forEach(button=>button.classList.toggle("active",button.dataset.screen===id));}
  function money(value){return `$${Math.round(Number(value)||0).toLocaleString()}`;}
  function todayParts(){const date=new Date();return{weekday:date.toLocaleDateString(undefined,{weekday:"long"}),date:date.toLocaleDateString(undefined,{month:"long",day:"numeric"})};}
  function leaf(){return `<svg class="leafMark" viewBox="0 0 64 64" aria-hidden="true"><path d="M21.5 45.5C24.8 34.8 33.9 24.8 46.5 18.2c1.2 12.8-6.6 23.6-18.1 27.1-2.3.7-4.5.8-6.9.2Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 49.5c7.3-9.7 14.8-18.1 26.1-29.1" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M32.5 34.8h9.2M28.4 39.2l5.8 5.2" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
  function cycle(segments=0,size=""){const filled=Math.max(0,Math.min(4,Number(segments)||0));const arcs=[
    "M36 8 A24 24 0 0 1 56 28",
    "M56 36 A24 24 0 0 1 36 56",
    "M28 56 A24 24 0 0 1 8 36",
    "M8 28 A24 24 0 0 1 28 8"
  ];return `<div class="cycle ${size}" data-filled="${filled}" aria-hidden="true"><svg viewBox="0 0 64 64">${arcs.map((d,i)=>`<path class="seg ${i<filled?"filled":""} s${i+1}" d="${d}"/>`).join("")}</svg><div class="cycleLeaf">${leaf()}</div></div>`;}
  function reviewSegments(done,total){if(!total)return 0;const p=(Number(done)||0)/Number(total);if(p>=1)return 4;if(p>=.75)return 3;if(p>=.5)return 2;if(p>=.25)return 1;return 0;}
  function displayName(account){return account?.name || "Account";}
  function strategyLabel(strategy){return strategy==="snowball"?"Smallest Balance First":"Highest Interest First";}
  function prettyDate(value){if(!value)return "";const d=new Date(value+"T00:00:00");if(Number.isNaN(d.getTime()))return value;return d.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});}
  function prettySnapshotDate(value){if(!value)return "";const d=new Date(value);if(Number.isNaN(d.getTime()))return value;return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
  window.SeasonsUI={byId,escapeHtml,showScreen,setActiveNav,money,todayParts,leaf,cycle,reviewSegments,displayName,strategyLabel,prettyDate,prettySnapshotDate};
  window.CCUI=Object.assign({},window.SeasonsUI,{monthName(months){const d=new Date();d.setMonth(d.getMonth()+months);return d.toLocaleString(undefined,{month:"short",year:"numeric"});}});
})();
