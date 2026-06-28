(function(){
  const APP_VERSION="v1.0";
  const APP_BUILD=100;
  let updateInfo=null;
  let versionTapCount=0;
  let data=window.CCStorage.load();
  const UI=window.SeasonsUI;
  const E=window.CCEngine;
  const screens={command:UI.byId("command"),review:UI.byId("review"),accounts:UI.byId("accounts"),settings:UI.byId("settings"),onboarding:UI.byId("onboarding")};

  const SEASONS={
    establish:{icon:"🌱",name:"Establish",line:"Build your financial foundation.",description:"Plant the seeds for a lifetime of financial confidence."},
    grow:{icon:"☀️",name:"Grow",line:"Increase your financial strength.",description:"Cultivate consistent habits that build long-term wealth."},
    steward:{icon:"🍂",name:"Steward",line:"Use your resources with intention.",description:"Care wisely for the life you've built and the people you love."},
    preserve:{icon:"❄️",name:"Preserve",line:"Protect your financial independence.",description:"Preserve what you've built so it can continue supporting your life and the people who matter most."}
  };
  function season(id){return SEASONS[id]||SEASONS.establish;}
  function setSeason(id){const s=season(id);data.seasonId=id;data.seasonName=s.name;data.seasonSince=data.seasonSince || new Date().toLocaleDateString(undefined,{month:"long",year:"numeric"});}
  function recommendSeason(){
    const answers=data.onboarding?.answers||{};
    const scores={establish:0,grow:0,steward:0,preserve:0};
    Object.values(answers).forEach(value=>{if(scores[value]!==undefined)scores[value]+=1;});
    const best=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0]?.[0]||"establish";
    data.onboarding.recommendedSeason=best;
    return best;
  }


  function save(){window.CCStorage.save(data);}
  function saveRender(screen="command"){save();render(screen);}
  function activeAccounts(){return E.activeAccounts(data);}
  function completedAccounts(){return E.completedAccounts(data);}
  function focus(){return E.focusAccount(data);}
  function show(screen){UI.showScreen(screen);UI.setActiveNav(screen==="onboarding"?"command":screen);}

  function render(screen){
    if(!data.setupComplete){renderOnboarding();show("onboarding");return;}
    renderCommand();renderReview();renderAccounts();renderSettings();show(screen);
  }

  function renderOnboarding(){
    data.onboarding=data.onboarding||{step:"welcome",answers:{},recommendedSeason:"establish"};
    const step=data.onboarding.step||"welcome";
    const answers=data.onboarding.answers||{};
    if(step==="welcome"){
      screens.onboarding.innerHTML=`
        <div class="topbar"><div class="brand">SEASONS</div>${UI.cycle(0,"tiny")}</div>
        <div class="title">Every financial life has seasons.</div>
        <p class="sub">Seasons helps you build lasting financial achievements through one intentional weekly habit.</p>
        <div class="card"><div class="label">The Weekly Practice</div><div class="value">Observe. Reflect. Progress.</div><p class="sub">Your season may change. Your weekly habit remains the same.</p></div>
        <button class="btn" data-action="startSeasonReflection">Begin</button>`;
      return;
    }
    if(step==="discover"){
      screens.onboarding.innerHTML=`
        <div class="topbar"><div class="brand">SEASONS</div>${UI.cycle(0,"tiny")}</div>
        <div class="screenTitle">Discover Your Current Season</div>
        <p class="sub">A short reflection to help choose your current focus. Seasons recommends. You decide.</p>
        <div class="card seasonQuestion"><div class="label">What feels like your highest financial priority today?</div>
          <select id="seasonQ1"><option value="establish" ${answers.q1==="establish"?"selected":""}>Build a stronger financial foundation</option><option value="grow" ${answers.q1==="grow"?"selected":""}>Grow my wealth</option><option value="steward" ${answers.q1==="steward"?"selected":""}>Use my resources more intentionally</option><option value="preserve" ${answers.q1==="preserve"?"selected":""}>Protect what I've built</option></select>
        </div>
        <div class="card seasonQuestion"><div class="label">Which statement sounds most like you?</div>
          <select id="seasonQ2"><option value="establish" ${answers.q2==="establish"?"selected":""}>I want less financial stress.</option><option value="grow" ${answers.q2==="grow"?"selected":""}>I want my money to grow.</option><option value="steward" ${answers.q2==="steward"?"selected":""}>I want greater confidence in my financial decisions.</option><option value="preserve" ${answers.q2==="preserve"?"selected":""}>I want to know what I've built will last.</option></select>
        </div>
        <div class="card seasonQuestion"><div class="label">Which achievement would have the greatest impact over the next few years?</div>
          <select id="seasonQ3"><option value="establish" ${answers.q3==="establish"?"selected":""}>Eliminate high-interest debt or build stability</option><option value="grow" ${answers.q3==="grow"?"selected":""}>Invest consistently and build long-term wealth</option><option value="steward" ${answers.q3==="steward"?"selected":""}>Balance home, family, and major decisions</option><option value="preserve" ${answers.q3==="preserve"?"selected":""}>Protect financial independence for the future</option></select>
        </div>
        <button class="btn" data-action="recommendCurrentSeason">Continue</button>`;
      return;
    }
    if(step==="recommendation"){
      const rec=season(data.onboarding.recommendedSeason||recommendSeason());
      screens.onboarding.innerHTML=`
        <div class="topbar"><div class="brand">SEASONS</div>${UI.cycle(1,"tiny")}</div>
        <div class="screenTitle">Based on your reflections...</div>
        <div class="card seasonCard selectedSeason"><div class="seasonIcon">${rec.icon}</div><div><div class="value">${rec.name}</div><div class="sub">${rec.line}</div><p class="sub">${rec.description}</p></div></div>
        <p class="sub center">Does this feel like the right current focus?</p>
        <button class="btn" data-action="acceptSeasonRecommendation">Continue</button>
        <button class="btn secondary" data-action="chooseAnotherSeason">Choose Another Season</button>`;
      return;
    }
    if(step==="chooseSeason"){
      screens.onboarding.innerHTML=`
        <div class="topbar"><div class="brand">SEASONS</div>${UI.cycle(1,"tiny")}</div>
        <div class="screenTitle">Choose Your Current Season</div>
        <p class="sub">Financial seasons are periods of focus, not levels to complete.</p>
        <div class="seasonGrid">${Object.entries(SEASONS).map(([id,s])=>`<button class="seasonCard ${data.seasonId===id?"selectedSeason":""}" data-action="selectSeason" data-season="${id}"><span class="seasonIcon">${s.icon}</span><span><b>${s.name}</b><span class="sub">${s.line}</span></span></button>`).join("")}</div>`;
      return;
    }
    screens.onboarding.innerHTML=`
      <div class="topbar"><div class="brand">SEASONS</div>${UI.cycle(2,"tiny")}</div>
      <div class="screenTitle">Build Your Weekly Review</div>
      <p class="sub">Set a simple weekly appointment. You can change this later.</p>
      <div class="card"><div class="label">Current Season</div><div class="value">${season(data.seasonId).icon} ${UI.escapeHtml(data.seasonName)}</div><div class="sub">${season(data.seasonId).line}</div></div>
      <div class="card">
        <div class="label">Weekly Review</div>
        <select id="setupDay"><option ${data.reviewDay==="Thursday"?"selected":""}>Thursday</option><option ${data.reviewDay==="Sunday"?"selected":""}>Sunday</option><option ${data.reviewDay==="Monday"?"selected":""}>Monday</option><option ${data.reviewDay==="Tuesday"?"selected":""}>Tuesday</option><option ${data.reviewDay==="Wednesday"?"selected":""}>Wednesday</option><option ${data.reviewDay==="Friday"?"selected":""}>Friday</option><option ${data.reviewDay==="Saturday"?"selected":""}>Saturday</option></select>
        <input id="setupTime" value="${UI.escapeHtml(data.reviewTime||"7:30 PM")}" placeholder="Review time">
      </div>
      <div class="card">
        <div class="label">Focus Strategy</div>
        <select id="setupStrategy"><option value="avalanche" ${data.strategy==="avalanche"?"selected":""}>Highest Interest First</option><option value="snowball" ${data.strategy==="snowball"?"selected":""}>Smallest Balance First</option></select>
      </div>
      <button class="btn" data-action="finishSetup">Begin Seasons</button>`;
  }

  function renderCommand(){
    const t=UI.todayParts();
    const f=focus();
    const reviewComplete=data.review?.status==="complete";
    const promo=E.soonestPromo(data);
    const promoLine=promo?`<div class="promoNote">${UI.escapeHtml(promo.name)} promo expires in ${promo.reviewsRemaining} week${promo.reviewsRemaining===1?"":"s"}</div>`:"";
    const progress=E.progressStatus(data);
    screens.command.innerHTML=`
      <div class="topbar brandOnly"><h1 class="brand">SEASONS</h1></div>
      <div class="dateBlock"><div class="weekday">${t.weekday}</div><div class="date">${t.date}</div></div>
      ${updateInfo?`<div class="updateBanner"><div><b>New version available</b><div class="sub">${UI.escapeHtml(updateInfo.version || "Update")}</div></div><button class="smallBtn" data-action="reloadUpdate">Reload</button></div>`:""}
      <div class="card">
        <div class="row"><div><div class="value">Weekly Review</div><div class="status">${reviewComplete?"Complete":data.review?.status==="inProgress"?"In Progress":data.review?.status==="allUpdated"?"Ready to Close":"Ready"}</div><div class="sub">${reviewComplete?"Next Thursday":`${data.reviewDay} • ${data.reviewTime}`}</div></div><div class="chev">›</div></div>
        <button class="btn" data-action="startReview">${data.review?.status==="inProgress"?"Continue Weekly Review":data.review?.status==="allUpdated"?"Close Week":reviewComplete?"View This Week":"Start Weekly Review"}</button>
      </div>
      <div class="card" data-screen="accounts"><div class="label">Focus</div><div class="value">${f?UI.escapeHtml(f.name):completedAccounts().length?"Season Complete":"Add Account"}</div><div class="spacer"></div><div class="value">${f?UI.money(f.balance):"—"}</div></div>
      <div class="card"><div class="row"><div><div class="label">Season</div><div class="value">${season(data.seasonId).icon} ${UI.escapeHtml(data.seasonName)}</div><div class="sub">Since ${UI.escapeHtml(data.seasonSince)} • ${progress}</div>${promoLine}</div><div class="chev">›</div></div></div>`;
  }

  function reviewAccounts(){return E.reviewOrder(data);}
  function promoSummary(account){
    if(!account?.promoEnabled)return "";
    const apr=`${Number(account.promoApr||0).toFixed(2)}% promo`;
    if(!account.promoExpires)return apr;
    const reviews=E.weeklyReviewsUntil(account.promoExpires);
    return reviews===null?apr:`${apr}, ${reviews} week${reviews===1?"":"s"} left`;
  }

  function accountDelta(account,newBalance){
    const previous=Number(account?.balance)||0;
    const current=Number(newBalance)||0;
    // For debt accounts, a positive change means the amount owed went down.
    return previous-current;
  }

  function changeLine(delta){
    const amount=UI.money(Math.abs(delta));
    if(delta>0)return `<div class="changeLine good">↓ ${amount} since last review</div>`;
    if(delta<0)return `<div class="changeLine attention">↑ ${amount} since last review</div>`;
    return `<div class="changeLine neutral">No meaningful change</div>`;
  }

  function weeklyObservations(){
    const accounts=reviewAccounts();
    const draft=data.review?.draft||{};
    const observations=[];
    const f=focus();
    if(f && draft[f.id]!==undefined){
      const delta=accountDelta(f,draft[f.id]);
      observations.push({label:"Focus Account",value:delta>0?`↓ ${UI.money(delta)}`:delta<0?`↑ ${UI.money(Math.abs(delta))}`:"No meaningful change",kind:delta>0?"good":delta<0?"attention":"neutral"});
    }
    const previousTotal=E.totalBalance(accounts);
    const currentTotal=accounts.reduce((sum,a)=>sum+(draft[a.id]!==undefined?Number(draft[a.id])||0:Number(a.balance)||0),0);
    const totalDelta=previousTotal-currentTotal;
    observations.push({label:"Total Balances",value:totalDelta>0?`↓ ${UI.money(totalDelta)}`:totalDelta<0?`↑ ${UI.money(Math.abs(totalDelta))}`:"No meaningful change",kind:totalDelta>0?"good":totalDelta<0?"attention":"neutral"});
    const promo=E.soonestPromo(data);
    if(promo && promo.reviewsRemaining!==null && promo.reviewsRemaining<=8){
      observations.push({label:"Upcoming",value:`${UI.escapeHtml(promo.name)} promo expires in ${promo.reviewsRemaining} week${promo.reviewsRemaining===1?"":"s"}`,kind:"neutral"});
    }
    return observations.slice(0,3);
  }

  function weeklyReflectionSentence(observations){
    const focusObs=observations.find(o=>o.label==="Focus Account");
    const promoObs=observations.find(o=>o.label==="Upcoming");
    if(focusObs?.kind==="good")return "Your Focus account moved in the right direction this week.";
    if(focusObs?.kind==="attention")return "Your Focus account increased this week. A short note can help explain the pattern later.";
    if(promoObs)return "A promotional APR is approaching. Planning ahead gives you more options.";
    return "Your review is complete and your records are current.";
  }

  function renderReview(){
    const accounts=reviewAccounts();
    if(!accounts.length){
      screens.review.innerHTML=`<div class="reviewHeader"><button class="back" data-screen="command">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div><div class="empty">${completedAccounts().length?"No active accounts remain.":"Add your first account to begin."}</div><button class="btn" data-screen="accounts">${completedAccounts().length?"View Accounts":"Add Account"}</button>`;
      return;
    }
    if(data.review.status==="complete"){
      screens.review.innerHTML=`<div class="reviewHeader"><button class="back" data-screen="command">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div><div class="card heroCard"><div><div class="label">This Week</div><div class="value">Complete</div><div class="sub">Next Thursday</div></div>${UI.cycle(4,"small")}</div><div class="card"><div class="label">Review</div><div class="sub">Your week is in order.</div><button class="btn secondary" data-action="beginNewReview">Edit This Week’s Review</button></div>`;
      return;
    }
    if(data.review.status==="paidOffPrompt"){renderPaidOffPrompt();return;}
    if(data.review.status==="reflection"){renderAccountReflection();return;}
    if(data.review.status==="allUpdated"){renderAllUpdated();return;}
    if(data.review.status!=="inProgress"){
      const f=focus();
      screens.review.innerHTML=`<div class="reviewHeader"><button class="back" data-screen="command">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div><div class="cycleWrap">${UI.cycle(0)}</div><div class="screenTitle">Weekly Review</div><p class="sub">Update your accounts one at a time.</p>${f?`<div class="card"><div class="label">This Week’s Focus</div><div class="value">${UI.escapeHtml(f.name)}</div><div class="sub">${UI.money(f.balance)} last reviewed</div></div>`:""}<div class="sub center">0 of ${accounts.length} accounts updated</div><button class="btn" data-action="beginNewReview">Start Review</button>`;
      return;
    }
    const index=Math.max(0,Math.min(data.review.index||0,accounts.length-1));
    const account=accounts[index];
    const seg=UI.reviewSegments(index,accounts.length);
    const draft=data.review.draft?.[account.id] ?? account.balance;
    screens.review.innerHTML=`
      <div class="reviewHeader"><button class="back" data-screen="command">‹</button><div class="reviewTitle">Weekly Review</div><button class="smallBtn" data-action="cancelReview">Close</button></div>
      <div class="cycleWrap">${UI.cycle(seg)}</div>
      <div class="reviewCount">Account ${index+1} of ${accounts.length}</div>
      <div class="accountName">${UI.escapeHtml(account.name)}</div>
      <div class="ledgerPair">
        <div><div class="label">Previous</div><div class="previousAmount">${UI.money(account.balance)}</div></div>
        <div class="ledgerLine"></div>
        <div><div class="label">Today</div><div class="ledgerWrap"><span>$</span><input id="todayBalance" inputmode="decimal" type="number" value="${Number(draft)||0}" aria-label="Today balance"></div></div>
      </div>
      <button class="btn reviewContinue" data-action="saveAccountReview">Continue</button>`;
    setTimeout(()=>{const input=UI.byId("todayBalance");if(input){input.focus();input.select();}},50);
  }

  function renderAccountReflection(){
    const pending=data.review.pendingReflection;
    const account=data.accounts.find(a=>a.id===pending?.accountId);
    if(!account){advanceReview();return;}
    const delta=Number(pending.delta)||0;
    const isIncrease=delta<0;
    screens.review.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="backFromReflection">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div>
      <div class="cycleWrap">${UI.cycle(UI.reviewSegments((data.review.index||0)+1,reviewAccounts().length))}</div>
      <div class="card center reflectionCard">
        <div class="label">${UI.escapeHtml(account.name)}</div>
        ${changeLine(delta)}
        <p class="sub">${isIncrease?"Would you like to add a note for later?":"Recorded for this week."}</p>
        ${isIncrease?`<button class="btn secondary" data-action="addReflectionNote">Add Note</button>`:""}
        <button class="btn" data-action="continueAfterReflection">Continue</button>
      </div>`;
  }

  function renderPaidOffPrompt(){
    const pending=data.review.pendingPaidOff;
    const account=data.accounts.find(a=>a.id===pending?.accountId);
    if(!account){advanceReview();return;}
    screens.review.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="backFromPaidOffPrompt">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div>
      <div class="cycleWrap">${UI.cycle(UI.reviewSegments(data.review.index||0,reviewAccounts().length))}</div>
      <div class="card center paidOffCard">
        <div class="pill">Account Completed</div>
        <div class="value" style="margin-top:18px">${UI.escapeHtml(account.name)}</div>
        <p class="sub">It looks like this account has been paid off.</p>
        <button class="btn" data-action="confirmPaidOff">Mark as Paid Off</button>
        <button class="btn secondary" data-action="notPaidOffYet">Not Yet</button>
      </div>`;
  }

  function renderAllUpdated(){
    const observations=weeklyObservations();
    const sentence=weeklyReflectionSentence(observations);
    screens.review.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="resumeLastAccount">‹</button><div class="reviewTitle">Weekly Review</div><span></span></div>
      <div class="cycleWrap">${UI.cycle(4)}</div>
      <div class="screenTitle">This Week</div>
      <p class="sub reflectionSentence">${UI.escapeHtml(sentence)}</p>
      <div class="card reflectionList">${observations.map(o=>`<div class="reflectionRow"><span>${UI.escapeHtml(o.label)}</span><strong class="${o.kind}">${o.value}</strong></div>`).join("")}</div>
      <button class="btn" data-action="closeWeek">Close Week</button>`;
  }

  function renderWeekClosed(){
    screens.review.innerHTML=`
      <div class="closed">
        ${UI.cycle(4,"large")}
        <div class="check" style="width:46px;height:46px;font-size:24px;margin-top:26px">✓</div>
        <div class="message">Your week is in order.</div>
        <p class="sub">See you next Thursday.</p>
      </div>`;
    show("review");
    setTimeout(()=>render("command"),3200);
  }

  function historyForAccount(account){
    const entries=(data.snapshots||[])
      .map(snapshot=>{const found=(snapshot.accounts||[]).find(item=>item.id===account.id);return found?{date:snapshot.date,balance:Number(found.balance)||0}:null;})
      .filter(Boolean)
      .sort((a,b)=>new Date(b.date)-new Date(a.date));
    return entries;
  }

  function renderAccounts(){
    const accounts=activeAccounts();
    const complete=completedAccounts();
    const f=focus();
    screens.accounts.innerHTML=`
      <div class="reviewHeader"><div class="screenTitle">Accounts</div><button class="smallBtn" data-action="showAddAccount">＋</button></div>
      <div class="sectionLabel">Active</div>
      <div class="accountList">${accounts.length?accounts.map(a=>{const promo=promoSummary(a);return `<div class="accountRow" data-action="showAccountDetail" data-id="${a.id}"><div class="accountMeta"><div>${f&&f.id===a.id?`<span class="focusDot"></span>`:""}${UI.escapeHtml(a.name)}</div><div class="sub">${UI.escapeHtml(a.type||"Account")}${promo?` • ${promo}`:""}</div></div><div class="row"><span>${UI.money(a.balance)}</span></div></div>`}).join(""):`<div class="empty">No active accounts.</div>`}</div>
      ${complete.length?`<div class="sectionLabel completedLabel">Completed</div><div class="accountList">${complete.map(a=>`<div class="accountRow completedRow" data-action="showAccountDetail" data-id="${a.id}"><div class="accountMeta"><div><span class="check miniCheck">✓</span>${UI.escapeHtml(a.name)}</div><div class="sub">Completed ${a.completedAt?UI.prettySnapshotDate(a.completedAt):""}</div></div><div>${UI.money(0)}</div></div>`).join("")}</div>`:""}
      <button class="btn secondary" data-action="showAddAccount">Add Account</button>`;
  }

  function renderAccountDetail(account){
    const promo=promoSummary(account);
    const history=historyForAccount(account);
    screens.accounts.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="backToAccounts">‹</button><div class="reviewTitle">${UI.escapeHtml(account.name)}</div><button class="smallBtn" data-action="manageAccount" data-id="${account.id}">Manage</button></div>
      ${focus()?.id===account.id?`<div class="pill detailPill">Focus Account</div>`:""}
      ${account.paidOff?`<div class="pill detailPill">Paid Off</div>`:""}
      <div class="card detailCard">
        <div class="detailRow"><span>Current Balance</span><strong>${UI.money(account.balance)}</strong></div>
        <div class="detailRow"><span>APR</span><strong>${Number(account.apr||0).toFixed(2)}%</strong></div>
        <div class="detailRow"><span>Minimum Payment</span><strong>${UI.money(account.min)}</strong></div>
        <div class="detailRow"><span>Statement Day</span><strong>${account.statementDay?UI.escapeHtml(account.statementDay):"—"}</strong></div>
      </div>
      ${account.promoEnabled?`<div class="card detailCard"><div class="label">Promotional APR</div><div class="detailRow"><span>Current Promo APR</span><strong>${Number(account.promoApr||0).toFixed(2)}%</strong></div><div class="detailRow"><span>Expires</span><strong>${account.promoExpires?UI.prettyDate(account.promoExpires):"—"}</strong></div><div class="detailRow"><span>Standard APR After</span><strong>${Number(account.standardApr||account.apr||0).toFixed(2)}%</strong></div>${promo?`<div class="helper">${promo}</div>`:""}</div>`:""}
      <div class="card detailCard"><div class="label">History</div>${history.length?history.slice(0,8).map(entry=>`<div class="detailRow"><span>${UI.prettySnapshotDate(entry.date)}</span><strong>${UI.money(entry.balance)}</strong></div>`).join(""):`<div class="sub">Balance history will appear after Weekly Reviews.</div>`}</div>
      ${account.note?`<div class="card"><div class="label">Notes</div><div class="sub">${UI.escapeHtml(account.note)}</div></div>`:""}`;
    show("accounts");
  }

  function renderManageAccount(account){
    screens.accounts.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="showAccountDetail" data-id="${account.id}">‹</button><div class="reviewTitle">Manage Account</div><span></span></div>
      <div class="card accountList">
        <button class="settingChoice" data-action="editAccount" data-id="${account.id}"><span><b>Edit Details</b><span class="sub">Update APR, payment, promo, or notes.</span></span><span class="miniChev">›</span></button>
        ${!account.paidOff?`<button class="settingChoice" data-action="markPaidOff" data-id="${account.id}"><span><b>Mark as Paid Off</b><span class="sub">Move this account to Completed.</span></span><span class="miniChev">›</span></button>`:""}
        <button class="settingChoice" data-action="archiveAccount" data-id="${account.id}"><span><b>Archive</b><span class="sub">Hide this account from normal use.</span></span><span class="miniChev">›</span></button>
      </div>`;
    show("accounts");
  }

  function renderAccountForm(account=null){
    const isEdit=Boolean(account);const promoOn=Boolean(account?.promoEnabled);
    screens.accounts.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="backToAccounts">‹</button><div class="reviewTitle">${isEdit?"Edit Account":"Add Account"}</div><span></span></div>
      <div class="card">
        <label class="label" for="formName">Account Name</label><input id="formName" value="${UI.escapeHtml(account?.name||"")}" placeholder="e.g., Chase Freedom">
        <label class="label" for="formType">Account Type</label><select id="formType"><option ${account?.type==="Credit Card"?"selected":""}>Credit Card</option><option ${account?.type==="Auto Loan"?"selected":""}>Auto Loan</option><option ${account?.type==="Personal Loan"?"selected":""}>Personal Loan</option><option ${account?.type==="Student Loan"?"selected":""}>Student Loan</option><option ${account?.type==="HELOC"?"selected":""}>HELOC</option></select>
        <label class="label" for="formBalance">Current Balance</label><input id="formBalance" type="number" inputmode="decimal" value="${Number(account?.balance)||0}">
        <label class="label" for="formApr">Standard APR</label><input id="formApr" type="number" inputmode="decimal" value="${Number(account?.apr)||0}">
        <label class="label" for="formMin">Minimum Payment</label><input id="formMin" type="number" inputmode="decimal" value="${Number(account?.min)||0}">
        <label class="label" for="formStatementDay">Statement Day</label><input id="formStatementDay" inputmode="numeric" value="${UI.escapeHtml(account?.statementDay||"")}" placeholder="e.g., 15th">
      </div>
      <div class="card promoCard"><label class="toggleRow"><span><span class="label">Promotional APR</span><span class="sub">Track intro rates and expiration dates.</span></span><input id="formPromo" type="checkbox" ${promoOn?"checked":""}></label><div id="promoFields" class="${promoOn?"":"hidden"}"><label class="label" for="formPromoApr">Current Promo APR</label><input id="formPromoApr" type="number" inputmode="decimal" value="${Number(account?.promoApr)||0}"><label class="label" for="formPromoExpires">Expires</label><input id="formPromoExpires" type="date" value="${UI.escapeHtml(account?.promoExpires||"")}"><label class="label" for="formStandardApr">Standard APR After</label><input id="formStandardApr" type="number" inputmode="decimal" value="${Number(account?.standardApr||account?.apr)||0}"><div class="helper" id="promoReviews">${account?.promoExpires?`${E.weeklyReviewsUntil(account.promoExpires)} week${E.weeklyReviewsUntil(account.promoExpires)===1?"":"s"} remaining`:"Add an expiration date to see weeks remaining."}</div></div></div>
      <div class="card"><label class="label" for="formNote">Notes</label><textarea id="formNote" placeholder="Optional">${UI.escapeHtml(account?.note||"")}</textarea></div>
      <div class="formFooter"><button class="btn formSaveBtn" data-action="saveAccount" data-id="${account?.id||""}">${isEdit?"Save Changes":"Save Account"}</button></div>`;
    show("accounts");setTimeout(()=>wirePromoForm(),0);
  }

  function renderSettings(){
    const dev=data.devMode;
    screens.settings.innerHTML=`<div class="screenTitle">Settings</div>
      ${updateInfo?`<div class="updateBanner"><div><b>New version available</b><div class="sub">${UI.escapeHtml(updateInfo.version||"Update")}</div></div><button class="smallBtn" data-action="reloadUpdate">Reload</button></div>`:""}
      <div class="card"><div class="settingsGroup"><div class="label">Preferences</div><button class="settingRow tappable" data-action="editReviewDay"><span>Weekly Review Day</span><span><span class="muted">${UI.escapeHtml(data.reviewDay)}</span><span class="miniChev">›</span></span></button><button class="settingRow tappable" data-action="editReviewTime"><span>Review Time</span><span><span class="muted">${UI.escapeHtml(data.reviewTime)}</span><span class="miniChev">›</span></span></button><button class="settingRow tappable" data-action="editStrategy"><span>Focus Strategy</span><span><span class="muted">${UI.strategyLabel(data.strategy)}</span><span class="miniChev">›</span></span></button></div></div>
      <div class="card"><div class="label">Privacy</div><div class="value">Local</div><div class="sub">No bank connections. Data stays in this browser unless exported.</div></div>
      <div class="card"><button class="settingRow tappable" data-action="tapVersion"><span>Version</span><span><span class="muted">${APP_VERSION} · Build ${APP_BUILD}</span><span class="miniChev">›</span></span></button><button class="settingRow tappable" data-action="forceUpdateCheck"><span>Check for Update</span><span class="miniChev">›</span></button></div>
      ${dev?`<div class="card"><div class="label">Developer</div><button class="settingRow tappable" data-action="loadDemoData"><span>Load Demo Data</span><span class="miniChev">›</span></button><button class="settingRow tappable" data-action="clearAppCache"><span>Clear App Cache</span><span class="miniChev">›</span></button><button class="settingRow tappable" data-action="resetAll"><span class="dangerText">Reset Local Data</span><span class="miniChev">›</span></button></div>`:""}
      <button class="btn secondary" data-action="exportData">Export Backup</button>${dev?"":`<button class="btn danger" data-action="resetAll">Reset Local Data</button>`}`;
  }

  function renderDayPicker(){const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];screens.settings.innerHTML=`<div class="reviewHeader"><button class="back" data-action="backToSettings">‹</button><div class="reviewTitle">Weekly Review Day</div><span></span></div><div class="card accountList">${days.map(day=>`<button class="settingChoice ${data.reviewDay===day?"selected":""}" data-action="setReviewDay" data-value="${day}"><span>${day}</span>${data.reviewDay===day?'<span class="check">✓</span>':''}</button>`).join("")}</div>`;show("settings");}
  function renderStrategyPicker(){const strategies=[{value:"avalanche",label:"Highest Interest First",sub:"Save more by paying interest first."},{value:"snowball",label:"Smallest Balance First",sub:"Build momentum through early wins."}];screens.settings.innerHTML=`<div class="reviewHeader"><button class="back" data-action="backToSettings">‹</button><div class="reviewTitle">Focus Strategy</div><span></span></div><div class="card accountList">${strategies.map(strategy=>`<button class="settingChoice ${data.strategy===strategy.value?"selected":""}" data-action="setStrategy" data-value="${strategy.value}"><span><b>${strategy.label}</b><span class="sub">${strategy.sub}</span></span>${data.strategy===strategy.value?'<span class="check">✓</span>':''}</button>`).join("")}</div>`;show("settings");}

  function wirePromoForm(){const checkbox=UI.byId("formPromo");const fields=UI.byId("promoFields");const expires=UI.byId("formPromoExpires");const reviews=UI.byId("promoReviews");if(checkbox&&fields){checkbox.addEventListener("change",()=>fields.classList.toggle("hidden",!checkbox.checked));}if(expires&&reviews){expires.addEventListener("input",()=>{const n=E.weeklyReviewsUntil(expires.value);reviews.textContent=n===null?"Add an expiration date to see weeks remaining.":`${n} week${n===1?"":"s"} remaining`;});}}

  function advanceReview(){const accounts=reviewAccounts();if(data.review.index>=accounts.length-1){data.review.status="allUpdated";}else{data.review.index+=1;data.review.status="inProgress";}data.review.pendingPaidOff=null;data.review.pendingReflection=null;saveRender("review");}
  function completeAccount(account){account.balance=0;account.paidOff=true;account.completedAt=new Date().toISOString();}

  async function checkForUpdate(silent=true){
    try{
      const response=await fetch(`version.json?ts=${Date.now()}`,{cache:"no-store"});
      if(!response.ok)throw new Error("No version file");
      const latest=await response.json();
      if(Number(latest.build)>APP_BUILD){updateInfo=latest;if(!silent)alert("A new version is available.");render(data.setupComplete?"settings":"command");return true;}
      updateInfo=null;if(!silent)alert("Seasons is up to date.");return false;
    }catch(error){if(!silent)alert("Could not check for updates right now.");return false;}
  }
  async function clearCaches(){
    if("serviceWorker" in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(reg=>reg.update().catch(()=>{})));}
    if("caches" in window){const keys=await caches.keys();await Promise.all(keys.map(key=>caches.delete(key)));}
  }
  function loadDemoDataset(){
    data.setupComplete=true;data.reviewDay=data.reviewDay||"Thursday";data.reviewTime=data.reviewTime||"7:30 PM";data.strategy=data.strategy||"avalanche";data.seasonId="establish";data.seasonName="Establish";data.seasonSince="June 2026";
    data.accounts=[
      {id:"demo_chase",name:"Chase Freedom",type:"Credit Card",balance:5427,apr:24.99,min:135,statementDay:"15th",note:"",promoEnabled:false,promoApr:0,promoExpires:"",standardApr:24.99,archived:false,paidOff:false,completedAt:null},
      {id:"demo_citi",name:"Citi",type:"Credit Card",balance:3820,apr:0,min:92,statementDay:"9th",note:"Promo rate",promoEnabled:true,promoApr:0,promoExpires:new Date(Date.now()+86400000*80).toISOString().slice(0,10),standardApr:24.49,archived:false,paidOff:false,completedAt:null},
      {id:"demo_auto",name:"Car Loan",type:"Auto Loan",balance:11420,apr:6.25,min:412,statementDay:"",note:"",promoEnabled:false,promoApr:0,promoExpires:"",standardApr:6.25,archived:false,paidOff:false,completedAt:null}
    ];
    data.startingAmount=20667;data.snapshots=[];data.review={status:"ready",index:0,draft:{},lastCompleted:null,nextReview:"Next Thursday",pendingPaidOff:null,pendingReflection:null,notes:{}};saveRender("command");
  }

  const actions={
    startSeasonReflection(){data.onboarding.step="discover";saveRender("onboarding");},
    recommendCurrentSeason(){data.onboarding.answers={q1:UI.byId("seasonQ1").value,q2:UI.byId("seasonQ2").value,q3:UI.byId("seasonQ3").value};data.onboarding.recommendedSeason=recommendSeason();data.onboarding.step="recommendation";saveRender("onboarding");},
    acceptSeasonRecommendation(){setSeason(data.onboarding.recommendedSeason||"establish");data.onboarding.step="setup";saveRender("onboarding");},
    chooseAnotherSeason(){data.onboarding.step="chooseSeason";saveRender("onboarding");},
    selectSeason(node){setSeason(node.dataset.season||"establish");data.onboarding.step="setup";saveRender("onboarding");},
    finishSetup(){data.reviewDay=UI.byId("setupDay").value;data.reviewTime=UI.byId("setupTime").value||"7:30 PM";data.strategy=UI.byId("setupStrategy").value;data.setupComplete=true;if(!data.seasonSince)data.seasonSince=new Date().toLocaleDateString(undefined,{month:"long",year:"numeric"});saveRender("command");},
    startReview(){if(!activeAccounts().length){renderAccountForm();return;}if(data.review.status==="complete"){render("review");return;}if(data.review.status!=="inProgress"&&data.review.status!=="allUpdated"&&data.review.status!=="paidOffPrompt"){data.review={status:"ready",index:0,draft:{},notes:{},lastCompleted:data.review?.lastCompleted||null,nextReview:"Next Thursday",pendingPaidOff:null,pendingReflection:null};}saveRender("review");},
    beginNewReview(){data.review={status:"inProgress",index:0,draft:{},notes:{},lastCompleted:data.review?.lastCompleted||null,nextReview:"Next Thursday",pendingPaidOff:null,pendingReflection:null};saveRender("review");},
    cancelReview(){saveRender("command");},
    saveAccountReview(){const accounts=reviewAccounts();const account=accounts[data.review.index];const input=UI.byId("todayBalance");if(!account||!input)return;const value=Number(input.value)||0;data.review.draft=data.review.draft||{};data.review.notes=data.review.notes||{};data.review.draft[account.id]=value;if(value===0 && !account.paidOff){data.review.status="paidOffPrompt";data.review.pendingPaidOff={accountId:account.id};saveRender("review");return;}const delta=accountDelta(account,value);if(Math.abs(delta)>=1){data.review.status="reflection";data.review.pendingReflection={accountId:account.id,previous:Number(account.balance)||0,current:value,delta};saveRender("review");return;}advanceReview();},
    backFromPaidOffPrompt(){data.review.status="inProgress";data.review.pendingPaidOff=null;saveRender("review");},
    backFromReflection(){data.review.status="inProgress";data.review.pendingReflection=null;saveRender("review");},
    continueAfterReflection(){advanceReview();},
    addReflectionNote(){const pending=data.review.pendingReflection;if(!pending)return;const note=prompt("Add a short note", data.review.notes?.[pending.accountId] || "");if(note!==null){data.review.notes=data.review.notes||{};data.review.notes[pending.accountId]=note.trim();save();}advanceReview();},
    confirmPaidOff(){const pending=data.review.pendingPaidOff;const account=data.accounts.find(a=>a.id===pending?.accountId);if(account){data.review.draft[account.id]=0;completeAccount(account);}advanceReview();},
    notPaidOffYet(){advanceReview();},
    resumeLastAccount(){data.review.status="inProgress";data.review.index=Math.max(0,(data.review.index||0)-1);saveRender("review");},
    closeWeek(){const observations=weeklyObservations();const reflection=weeklyReflectionSentence(observations);const accounts=reviewAccounts();accounts.forEach(a=>{if(data.review.draft&&data.review.draft[a.id]!==undefined && !a.paidOff)a.balance=Number(data.review.draft[a.id])||0;});data.review.status="complete";data.review.lastCompleted=new Date().toISOString();const allVisible=E.allAccounts(data).filter(a=>!a.archived);data.snapshots.push({date:data.review.lastCompleted,totalBalance:E.totalBalance(activeAccounts(data)),focusAccountId:focus()?.id||null,reflection,observations,notes:data.review.notes||{},accounts:allVisible.map(a=>({id:a.id,name:a.name,balance:a.balance,paidOff:Boolean(a.paidOff)}))});save();renderWeekClosed();},
    showAddAccount(){renderAccountForm();},
    showAccountDetail(node){const account=data.accounts.find(a=>a.id===node.dataset.id);if(account)renderAccountDetail(account);},
    manageAccount(node){const account=data.accounts.find(a=>a.id===node.dataset.id);if(account)renderManageAccount(account);},
    editAccount(node){const account=data.accounts.find(a=>a.id===node.dataset.id);if(account)renderAccountForm(account);},
    markPaidOff(node){const account=data.accounts.find(a=>a.id===node.dataset.id);if(account){completeAccount(account);save();renderAccountDetail(account);}},
    backToAccounts(){renderAccounts();show("accounts");},
    saveAccount(node){const id=node.dataset.id;let account=data.accounts.find(a=>a.id===id);if(!account){account={id:`acct_${Date.now()}`,archived:false,paidOff:false,completedAt:null};data.accounts.push(account);}account.name=UI.byId("formName").value||"Account";account.type=UI.byId("formType").value;account.balance=Number(UI.byId("formBalance").value)||0;account.apr=Number(UI.byId("formApr").value)||0;account.min=Number(UI.byId("formMin").value)||0;account.statementDay=UI.byId("formStatementDay")?.value||"";account.note=UI.byId("formNote").value||"";account.promoEnabled=Boolean(UI.byId("formPromo")?.checked);account.promoApr=Number(UI.byId("formPromoApr")?.value)||0;account.promoExpires=UI.byId("formPromoExpires")?.value||"";account.standardApr=Number(UI.byId("formStandardApr")?.value)||account.apr;if(!data.startingAmount)data.startingAmount=E.totalBalance(activeAccounts(data));save();renderAccountDetail(account);},
    archiveAccount(node){const account=data.accounts.find(a=>a.id===node.dataset.id);if(account&&confirm("Archive this account?")){account.archived=true;saveRender("accounts");}},
    exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="seasons-backup.json";link.click();},
    resetAll(){if(confirm("Reset all local Seasons data?")){data=window.CCStorage.reset();location.reload();}},
    editReviewDay(){renderDayPicker();},
    setReviewDay(node){data.reviewDay=node.dataset.value;saveRender("settings");},
    editReviewTime(){const next=prompt("Review time",data.reviewTime||"7:30 PM");if(next!==null&&next.trim()){data.reviewTime=next.trim();saveRender("settings");}},
    editStrategy(){renderStrategyPicker();},
    setStrategy(node){data.strategy=node.dataset.value;saveRender("settings");},
    tapVersion(){versionTapCount+=1;if(versionTapCount>=5){data.devMode=true;saveRender("settings");}},
    forceUpdateCheck(){checkForUpdate(false);},
    async reloadUpdate(){await clearCaches();location.reload();},
    async clearAppCache(){await clearCaches();alert("Cache cleared. Reloading Seasons.");location.reload();},
    loadDemoData(){if(confirm("Replace local data with demo data?")){loadDemoDataset();}},
    backToSettings(){renderSettings();show("settings");}
  };

  function handleClick(event){const actionTarget=event.target.closest("[data-action]");if(actionTarget){const action=actionTarget.dataset.action;if(actions[action]){actions[action](actionTarget);return;}}const screenTarget=event.target.closest("[data-screen]");if(screenTarget){const id=screenTarget.dataset.screen;render(id);}}
  document.addEventListener("click",handleClick);
  if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});}
  render(data.setupComplete?"command":"onboarding");
  setTimeout(()=>document.getElementById("splash")?.classList.add("hiddenSplash"),900);
  setTimeout(()=>checkForUpdate(true),800);
})();
