(function(){
  let data=window.CCStorage.load();
  const UI=window.SeasonsUI;
  const E=window.CCEngine;
  const screens={command:UI.byId("command"),review:UI.byId("review"),accounts:UI.byId("accounts"),settings:UI.byId("settings"),onboarding:UI.byId("onboarding")};

  function save(){window.CCStorage.save(data);}
  function saveRender(screen="command"){save();render(screen);}
  function activeAccounts(){return E.activeAccounts(data);}
  function focus(){return E.focusAccount(data);}
  function show(screen){UI.showScreen(screen);UI.setActiveNav(screen==="onboarding"?"command":screen);}

  function render(screen){
    if(!data.setupComplete){renderOnboarding();show("onboarding");return;}
    renderCommand();renderReview();renderAccounts();renderSettings();show(screen);
  }

  function renderOnboarding(){
    screens.onboarding.innerHTML=`
      <div class="topbar"><div class="brand">SEASONS</div>${UI.leaf()}</div>
      <div class="title">Your first Season.</div>
      <p class="sub">Review your accounts once a week. Record where you stand. Leave with a clear focus.</p>
      <div class="card">
        <div class="label">Weekly Review</div>
        <select id="setupDay"><option>Thursday</option><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Friday</option><option>Saturday</option></select>
        <input id="setupTime" value="7:30 PM" placeholder="Review time">
      </div>
      <div class="card">
        <div class="label">Focus Strategy</div>
        <select id="setupStrategy"><option value="avalanche">Highest Interest First</option><option value="snowball">Smallest Balance First</option></select>
      </div>
      <button class="btn" data-action="finishSetup">Begin</button>`;
  }

  function renderCommand(){
    const t=UI.todayParts();const f=focus();const status=E.progressStatus(data);const reviewComplete=data.review?.status==="complete";
    screens.command.innerHTML=`
      <div class="topbar"><h1 class="brand">SEASONS</h1>${UI.leaf()}</div>
      <div class="dateBlock"><div class="weekday">${t.weekday}</div><div class="date">${t.date}</div></div>
      <div class="card">
        <div class="row"><div><div class="value">Weekly Review</div><div class="status">${reviewComplete?"Complete":data.review?.status==="inProgress"?"In Progress":"Ready"}</div><div class="sub">${reviewComplete?"Next Thursday":`${data.reviewDay} • ${data.reviewTime}`}</div></div><div class="chev">›</div></div>
        <button class="btn" data-action="startReview">${data.review?.status==="inProgress"?"Continue Weekly Review":reviewComplete?"View This Week":"Start Weekly Review"}</button>
      </div>
      <div class="card" data-screen="accounts"><div class="label">Focus</div><div class="value">${f?UI.escapeHtml(f.name):"Add Account"}</div><div class="spacer"></div><div class="label">Last Reviewed</div><div class="value">${f?UI.money(f.balance):"—"}</div></div>
      <div class="card"><div class="row"><div><div class="label">Progress</div><div class="value">${status}</div></div><div class="check">✓</div></div></div>
      <div class="card"><div class="row"><div><div class="label">Season</div><div class="value">${UI.escapeHtml(data.seasonName)}</div><div class="sub">Since ${UI.escapeHtml(data.seasonSince)}</div></div><div class="chev">›</div></div></div>`;
  }

  function reviewAccounts(){return E.reviewOrder(data);}
  function renderReview(){
    const accounts=reviewAccounts();
    if(!accounts.length){screens.review.innerHTML=`<div class="reviewHeader"><button class="back" data-screen="command">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div><div class="empty">Add your first account to begin.</div><button class="btn" data-screen="accounts">Add Account</button>`;return;}
    if(data.review.status==="complete"){
      screens.review.innerHTML=`<div class="reviewHeader"><button class="back" data-screen="command">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div><div class="card heroCard"><div><div class="label">This Week</div><div class="value">Complete</div><div class="sub">Next Thursday</div></div>${UI.cycle(4,"small")}</div><div class="card"><div class="label">Review</div><div class="sub">Your week is in order.</div><button class="btn secondary" data-action="beginNewReview">Edit This Week’s Review</button></div>`;return;
    }
    if(data.review.status==="allUpdated"){renderAllUpdated();return;}
    if(data.review.status!=="inProgress"){
      const f=focus();
      screens.review.innerHTML=`<div class="reviewHeader"><button class="back" data-screen="command">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div><div class="cycleWrap">${UI.cycle(0)}</div><div class="screenTitle">Weekly Review</div><p class="sub">Update your accounts one at a time.</p>${f?`<div class="card"><div class="label">This Week’s Focus</div><div class="value">${UI.escapeHtml(f.name)}</div><div class="sub">${UI.money(f.balance)} last reviewed</div></div>`:""}<div class="sub center">0 of ${accounts.length} accounts updated</div><button class="btn" data-action="beginNewReview">Start Review</button>`;return;
    }
    const index=Math.max(0,Math.min(data.review.index||0,accounts.length-1));const account=accounts[index];const done=index;const seg=UI.reviewSegments(done,accounts.length);const draft=data.review.draft?.[account.id] ?? account.balance;
    screens.review.innerHTML=`
      <div class="reviewHeader"><button class="back" data-screen="command">‹</button><div class="reviewTitle">Weekly Review</div><button class="smallBtn" data-action="cancelReview">Close</button></div>
      <div class="cycleWrap">${UI.cycle(seg)}</div>
      <div class="reviewCount">Account ${index+1} of ${accounts.length}</div>
      <div class="accountName">${UI.escapeHtml(account.name)}</div>
      <div class="previousBlock"><div class="label">Previous</div><div class="previousAmount">${UI.money(account.balance)}</div><div class="helper">Updated last review</div></div>
      <div class="label">Today</div>
      <div class="ledgerWrap"><span>$</span><input id="todayBalance" inputmode="decimal" type="number" value="${Number(draft)||0}" aria-label="Today balance"></div>
      <div class="helper">Enter today’s balance as of now.</div>
      <button class="btn" data-action="saveAccountReview">Continue</button>`;
    setTimeout(()=>{const input=UI.byId("todayBalance");if(input){input.focus();input.select();}},50);
  }

  function renderAllUpdated(){const accounts=reviewAccounts();screens.review.innerHTML=`
    <div class="reviewHeader"><button class="back" data-action="resumeLastAccount">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div>
    <div class="cycleWrap">${UI.cycle(4)}</div>
    <div class="center"><div class="value">All Accounts Updated</div><div class="sub">You’re ready to close your week.</div></div>
    <div class="card accountList">${accounts.map(a=>`<div class="row"><div class="row" style="justify-content:flex-start"><span class="check">✓</span><span>${UI.escapeHtml(a.name)}</span></div><span>${UI.money(data.review.draft?.[a.id] ?? a.balance)}</span></div>`).join("")}</div>
    <button class="btn" data-action="closeWeek">Close Week</button>`;}

  function renderWeekClosed(){screens.review.innerHTML=`
    <div class="closed">
      ${UI.cycle(4,"large")}
      <div class="check" style="width:46px;height:46px;font-size:24px;margin-top:26px">✓</div>
      <div class="message">Your week is in order.</div>
      <p class="sub">See you next Thursday.</p>
      <button class="btn" data-screen="command">Return to Command</button>
    </div>`;show("review");setTimeout(()=>render("command"),3200);}

  function renderAccounts(){const accounts=activeAccounts();const f=focus();screens.accounts.innerHTML=`
    <div class="reviewHeader"><div class="screenTitle">Accounts</div><button class="smallBtn" data-action="showAddAccount">＋</button></div>
    <div class="accountList">${accounts.length?accounts.map(a=>`<div class="accountRow" data-action="editAccount" data-id="${a.id}"><div class="accountMeta"><div>${f&&f.id===a.id?`<span class="focusDot"></span>`:""}${UI.escapeHtml(a.name)}</div><div class="sub">${UI.escapeHtml(a.type||"Account")}</div></div><div class="row"><span>${UI.money(a.balance)}</span><span class="chev">›</span></div></div>`).join(""):`<div class="empty">No accounts yet.</div>`}</div>
    <button class="btn secondary" data-action="showAddAccount">Add Account</button>`;}

  function renderAccountForm(account=null){const isEdit=Boolean(account);screens.accounts.innerHTML=`
    <div class="reviewHeader"><button class="back" data-action="backToAccounts">‹</button><div class="reviewTitle">${isEdit?"Edit Account":"Add Account"}</div><button class="smallBtn" data-action="saveAccount" data-id="${account?.id||""}">Save</button></div>
    <div class="card">
      <label class="label" for="formName">Account Name</label><input id="formName" value="${UI.escapeHtml(account?.name||"")}" placeholder="e.g., Chase Freedom">
      <label class="label" for="formType">Account Type</label><select id="formType"><option ${account?.type==="Credit Card"?"selected":""}>Credit Card</option><option ${account?.type==="Auto Loan"?"selected":""}>Auto Loan</option><option ${account?.type==="Personal Loan"?"selected":""}>Personal Loan</option><option ${account?.type==="Student Loan"?"selected":""}>Student Loan</option><option ${account?.type==="HELOC"?"selected":""}>HELOC</option></select>
      <label class="label" for="formBalance">Current Balance</label><input id="formBalance" type="number" inputmode="decimal" value="${Number(account?.balance)||0}">
      <label class="label" for="formApr">APR</label><input id="formApr" type="number" inputmode="decimal" value="${Number(account?.apr)||0}">
      <label class="label" for="formMin">Minimum Payment</label><input id="formMin" type="number" inputmode="decimal" value="${Number(account?.min)||0}">
      <label class="label" for="formNote">Notes</label><textarea id="formNote" placeholder="Optional">${UI.escapeHtml(account?.note||"")}</textarea>
    </div>
    ${isEdit?`<button class="btn danger" data-action="archiveAccount" data-id="${account.id}">Archive Account</button>`:""}`;show("accounts");}

  function renderSettings(){screens.settings.innerHTML=`
    <div class="screenTitle">Settings</div>
    <div class="card"><div class="settingsGroup"><div class="label">Preferences</div><div class="settingRow"><span>Weekly Review Day</span><span class="muted">${UI.escapeHtml(data.reviewDay)}</span></div><div class="settingRow"><span>Review Time</span><span class="muted">${UI.escapeHtml(data.reviewTime)}</span></div><div class="settingRow"><span>Focus Strategy</span><span class="muted">${UI.strategyLabel(data.strategy)}</span></div></div></div>
    <div class="card"><div class="label">Privacy</div><div class="value">Local</div><div class="sub">No bank connections. Data stays in this browser unless exported.</div></div>
    <button class="btn secondary" data-action="exportData">Export Backup</button>
    <button class="btn danger" data-action="resetAll">Reset Local Data</button>`;}

  const actions={
    finishSetup(){data.reviewDay=UI.byId("setupDay").value;data.reviewTime=UI.byId("setupTime").value||"7:30 PM";data.strategy=UI.byId("setupStrategy").value;data.setupComplete=true;saveRender("command");},
    startReview(){if(!activeAccounts().length){renderAccountForm();return;}if(data.review.status==="complete"){render("review");return;}if(data.review.status!=="inProgress"&&data.review.status!=="allUpdated"){data.review={status:"ready",index:0,draft:{},lastCompleted:data.review?.lastCompleted||null,nextReview:"Next Thursday"};}saveRender("review");},
    beginNewReview(){data.review={status:"inProgress",index:0,draft:{},lastCompleted:data.review?.lastCompleted||null,nextReview:"Next Thursday"};saveRender("review");},
    cancelReview(){saveRender("command");},
    saveAccountReview(){const accounts=reviewAccounts();const account=accounts[data.review.index];const input=UI.byId("todayBalance");if(!account||!input)return;data.review.draft=data.review.draft||{};data.review.draft[account.id]=Number(input.value)||0;if(data.review.index>=accounts.length-1){data.review.status="allUpdated";}else{data.review.index+=1;data.review.status="inProgress";}saveRender("review");},
    resumeLastAccount(){data.review.status="inProgress";data.review.index=Math.max(0,(data.review.index||0)-1);saveRender("review");},
    closeWeek(){const accounts=reviewAccounts();accounts.forEach(a=>{if(data.review.draft&&data.review.draft[a.id]!==undefined)a.balance=Number(data.review.draft[a.id])||0;});data.review.status="complete";data.review.lastCompleted=new Date().toISOString();data.snapshots.push({date:data.review.lastCompleted,totalBalance:E.totalBalance(activeAccounts(data)),accounts:activeAccounts(data).map(a=>({id:a.id,name:a.name,balance:a.balance}))});save();renderWeekClosed();},
    showAddAccount(){renderAccountForm();},
    editAccount(node){const account=data.accounts.find(a=>a.id===node.dataset.id);if(account)renderAccountForm(account);},
    backToAccounts(){renderAccounts();show("accounts");},
    saveAccount(node){const id=node.dataset.id;let account=data.accounts.find(a=>a.id===id);if(!account){account={id:`acct_${Date.now()}`,archived:false};data.accounts.push(account);}account.name=UI.byId("formName").value||"Account";account.type=UI.byId("formType").value;account.balance=Number(UI.byId("formBalance").value)||0;account.apr=Number(UI.byId("formApr").value)||0;account.min=Number(UI.byId("formMin").value)||0;account.note=UI.byId("formNote").value||"";if(!data.startingAmount)data.startingAmount=E.totalBalance(activeAccounts(data));saveRender("accounts");},
    archiveAccount(node){const account=data.accounts.find(a=>a.id===node.dataset.id);if(account&&confirm("Archive this account?")){account.archived=true;saveRender("accounts");}},
    exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="seasons-backup.json";link.click();},
    resetAll(){if(confirm("Reset all local Seasons data?")){data=window.CCStorage.reset();location.reload();}}
  };

  function handleClick(event){const actionTarget=event.target.closest("[data-action]");if(actionTarget){const action=actionTarget.dataset.action;if(actions[action]){actions[action](actionTarget);return;}}
    const screenTarget=event.target.closest("[data-screen]");if(screenTarget){const id=screenTarget.dataset.screen;render(id);}}
  document.addEventListener("click",handleClick);
  if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});}
  render(data.setupComplete?"command":"onboarding");
})();
