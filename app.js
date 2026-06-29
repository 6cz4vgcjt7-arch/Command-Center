(function(){
  const APP_VERSION="v1.2.2";
  const APP_BUILD=113;
  let updateInfo=null;
  let versionTapCount=0;
  const startupErrors=window.SEASONS_BOOT_ERRORS || [];
  const UI=window.SeasonsUI;
  const E=window.CCEngine;
  let data;
  try{
    data=window.CCStorage.load();
  }catch(error){
    startupErrors.push("Storage load failed: "+(error?.message||error));
    try{localStorage.removeItem("seasons_v01_data");}catch(_){}
    data=window.CCStorage.blank ? window.CCStorage.blank() : {setupComplete:false,accounts:[],snapshots:[],review:{status:"ready",index:0,draft:{},notes:{}}};
  }
  const screens={command:UI.byId("command"),review:UI.byId("review"),accounts:UI.byId("accounts"),settings:UI.byId("settings"),onboarding:UI.byId("onboarding")};

  const SEASONS={
    establish:{icon:"🌱",name:"Establish",line:"Build your financial foundation.",description:"Plant the seeds for a lifetime of financial confidence."},
    grow:{icon:"☀️",name:"Grow",line:"Increase your financial strength.",description:"Cultivate consistent habits that build long-term wealth."},
    steward:{icon:"🍂",name:"Steward",line:"Use your resources with intention.",description:"Care wisely for the life you've built and the people you love."},
    preserve:{icon:"❄️",name:"Preserve",line:"Protect your financial independence.",description:"Preserve what you've built so it can continue supporting your life and the people who matter most."}
  };
  function season(id){return SEASONS[id]||SEASONS.establish;}
  function setSeason(id){const s=season(id);data.seasonId=id;data.seasonName=s.name;data.seasonSince=new Date().toLocaleDateString(undefined,{month:"long",year:"numeric"});}
  function seasonWelcome(id){
    if(id==="establish")return "Every new chapter begins by strengthening the foundation beneath it.";
    if(id==="grow")return "The work you did in Establish made this season possible.";
    if(id==="steward")return "Your growing resources can now support broader priorities.";
    if(id==="preserve")return "This season is about protecting the independence you've worked to build.";
    return "What matters is recognizing what deserves your attention today.";
  }
  function accountKind(account){return E.accountKind?E.accountKind(account):"debt";}
  function isDebt(account){return accountKind(account)==="debt";}
  function isFoundation(account){return accountKind(account)==="foundation";}
  function isRetirement(account){return String(account?.type||"").toLowerCase().includes("retirement");}
  function accountIcon(account){
    if(isFoundation(account))return isRetirement(account)?"☀️":"🌱";
    return "";
  }
  function commandReflection(){
    const id=data.seasonId||"establish";
    if(id==="grow")return "Consistency compounds over time.";
    if(id==="steward")return "Small decisions today shape tomorrow.";
    if(id==="preserve")return "Protecting what you've built creates lasting freedom.";
    return "Building your foundation creates options later.";
  }
  function directionWord(account,delta){
    if(delta>0)return isDebt(account)?"decreased":"increased";
    if(delta<0)return isDebt(account)?"increased":"decreased";
    return "unchanged";
  }
  function recommendSeason(){
    const answers=data.onboarding?.answers||{};
    const scores={establish:0,grow:0,steward:0,preserve:0};
    Object.values(answers).forEach(value=>{if(scores[value]!==undefined)scores[value]+=1;});
    const best=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0]?.[0]||"establish";
    data.onboarding.recommendedSeason=best;
    return best;
  }


  function save(){try{window.CCStorage.save(data);}catch(error){startupErrors.push("Save failed: "+(error?.message||error));}}
  function saveRender(screen="command"){save();render(screen);}
  function activeAccounts(){return E.activeAccounts(data);}
  function completedAccounts(){return E.completedAccounts(data);}
  function focus(){return E.focusAccount(data);}
  function show(screen){try{UI.showScreen(screen);UI.setActiveNav(screen==="onboarding"?"command":screen);}catch(error){startupErrors.push("Show failed: "+(error?.message||error));}}

  function render(screen){
    try{
      if(!data.setupComplete){safeSection("onboarding", renderOnboarding);show("onboarding");return;}
      safeSection("command", renderCommand);
      safeSection("review", renderReview);
      safeSection("accounts", renderAccounts);
      safeSection("settings", renderSettings);
      show(screen);
    }catch(error){
      startupErrors.push("Render failed: "+(error?.message||error));
      renderStartupError(error);
    }
  }

  function safeSection(name, fn){
    try{ fn(); }
    catch(error){
      startupErrors.push(name+" failed: "+(error?.message||error));
      const target=screens[name] || UI.byId(name);
      if(target){
        target.innerHTML=`<div class="topbar"><div class="brand">SEASONS</div></div><div class="card startupError"><div class="screenTitle">${name.charAt(0).toUpperCase()+name.slice(1)} is temporarily unavailable.</div><p class="sub">Seasons kept the rest of the app open instead of getting stuck.</p><button class="btn" data-action="showDiagnostics">Show diagnostics</button><button class="btn secondary" data-action="clearAppCache">Clear cache and reload</button></div>`;
      }
    }
  }

  function renderStartupError(error){
    const target=UI.byId("command") || document.querySelector(".screen");
    if(target){
      target.classList.add("active");
      target.innerHTML=`<div class="topbar"><div class="brand">SEASONS</div></div><div class="card startupError"><div class="screenTitle">Seasons had trouble starting.</div><p class="sub">The app recovered instead of staying stuck on the opening screen.</p><button class="btn" data-action="clearAppCache">Clear cache and reload</button><button class="btn secondary" data-action="showDiagnostics">Show diagnostics</button><button class="btn secondary" onclick="location.reload()">Reload</button><p class="tinyNote">${APP_VERSION}</p></div>`;
    }
    try{window.SEASONS_HIDE_SPLASH && window.SEASONS_HIDE_SPLASH();}catch(_){}
  }

  function renderDiagnostics(){
    const target=UI.byId("settings") || UI.byId("command") || document.querySelector(".screen");
    const errors=(startupErrors.length?startupErrors:["No startup errors recorded."]).slice(-12);
    if(target){
      target.innerHTML=`<div class="reviewHeader"><button class="back" data-action="backToCommand">‹</button><div class="reviewTitle">Diagnostics</div><span></span></div><div class="card"><div class="label">App Version</div><div class="value">${APP_VERSION}</div><p class="sub">This screen helps identify startup and module errors.</p></div><div class="card"><div class="label">Startup Log</div><pre class="debugLog">${UI.escapeHtml(errors.join("\n"))}</pre></div><button class="btn" data-action="clearAppCache">Clear cache and reload</button><button class="btn secondary" data-action="resetLocalData">Reset local data</button>`;
      show(target.id || "command");
    }
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
      <div class="commandLogo">${UI.cycle(0,"tiny")}</div>
      <div class="commandReflection">${UI.escapeHtml(commandReflection())}</div>
      <div class="dateBlock compactDate"><div class="weekday">${t.weekday}</div><div class="date">${t.date}</div></div>
      ${updateInfo?`<div class="updateBanner"><div><b>New version available</b><div class="sub">${UI.escapeHtml(updateInfo.version || "Update")}</div></div><button class="smallBtn" data-action="reloadUpdate">Reload</button></div>`:""}
      <div class="card commandCard primaryReview">
        <div class="row"><div><div class="value">Weekly Review</div><div class="status">${reviewComplete?"Complete":data.review?.status==="inProgress"?"In Progress":data.review?.status==="allUpdated"?"Ready to Close":"Ready"}</div><div class="sub">${reviewComplete?"Next Thursday":`${data.reviewDay} • ${data.reviewTime}`}</div></div><div class="chev">›</div></div>
        <button class="btn compactBtn" data-action="startReview">${data.review?.status==="inProgress"?"Continue Weekly Review":data.review?.status==="allUpdated"?"Close Week":reviewComplete?"View This Week":"Start Weekly Review"}</button>
      </div>
      <div class="card commandCard tappableCard" data-action="showSeasonDetail"><div class="row"><div><div class="label">Season</div><div class="value">${season(data.seasonId).icon} ${UI.escapeHtml(data.seasonName)}</div><div class="sub">Since ${UI.escapeHtml(data.seasonSince)} • ${progress}</div>${promoLine}</div><div class="chev">›</div></div></div>
      <div class="card commandCard tappableCard" data-action="showFocusDetail"><div class="row"><div><div class="label">Focus</div><div class="value">${f?UI.escapeHtml(f.name):completedAccounts().length?"Season Complete":"Add Account"}</div></div><div><div class="value alignRight">${f?UI.money(f.balance):"—"}</div><div class="chev compactChev">›</div></div></div></div>`;
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
    // For debt accounts, lower is progress. For foundation accounts, higher is progress.
    return isDebt(account) ? previous-current : current-previous;
  }

  function changeLine(delta,account){
    const amount=UI.money(Math.abs(delta));
    if(delta>0){
      const arrow=isDebt(account)?"↓":"↑";
      return `<div class="changeLine good">${arrow} ${amount} since last review</div>`;
    }
    if(delta<0){
      const arrow=isDebt(account)?"↑":"↓";
      return `<div class="changeLine attention">${arrow} ${amount} since last review</div>`;
    }
    return `<div class="changeLine neutral">No meaningful change</div>`;
  }

  function weeklyObservations(){
    const accounts=reviewAccounts();
    const draft=data.review?.draft||{};
    const observations=[];
    const f=focus();
    if(f && draft[f.id]!==undefined){
      const delta=accountDelta(f,draft[f.id]);
      observations.push({label:"Focus Account",value:delta>0?`${isDebt(f)?"↓":"↑"} ${UI.money(delta)}`:delta<0?`${isDebt(f)?"↑":"↓"} ${UI.money(Math.abs(delta))}`:"No meaningful change",kind:delta>0?"good":delta<0?"attention":"neutral"});
    }
    const debtAccounts=accounts.filter(isDebt);
    const foundationAccounts=accounts.filter(a=>!isDebt(a));
    if(debtAccounts.length){
      const prevDebt=E.totalBalance(debtAccounts);
      const currDebt=debtAccounts.reduce((sum,a)=>sum+(draft[a.id]!==undefined?Number(draft[a.id])||0:Number(a.balance)||0),0);
      const delta=prevDebt-currDebt;
      observations.push({label:"Debt",value:delta>0?`↓ ${UI.money(delta)}`:delta<0?`↑ ${UI.money(Math.abs(delta))}`:"No meaningful change",kind:delta>0?"good":delta<0?"attention":"neutral"});
    }
    if(foundationAccounts.length){
      const prevFound=E.totalBalance(foundationAccounts);
      const currFound=foundationAccounts.reduce((sum,a)=>sum+(draft[a.id]!==undefined?Number(draft[a.id])||0:Number(a.balance)||0),0);
      const delta=currFound-prevFound;
      observations.push({label:"Foundations",value:delta>0?`↑ ${UI.money(delta)}`:delta<0?`↓ ${UI.money(Math.abs(delta))}`:"No meaningful change",kind:delta>0?"good":delta<0?"attention":"neutral"});
    }
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
    if(focusObs?.kind==="attention")return "Your Focus account moved against your plan this week. A short note can help explain the pattern later.";
    if(promoObs)return "A promotional APR is approaching. Planning ahead gives you more options.";
    return "Your review is complete and your records are current.";
  }

  function renderSeasonDetail(){
    const current=season(data.seasonId);
    screens.command.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="backToCommand">‹</button><div class="reviewTitle">Current Season</div><button class="smallBtn" data-action="showSeasonChooser">Change</button></div>
      <div class="card seasonDetailHero"><div class="seasonIcon bigSeason">${current.icon}</div><div><div class="value">${UI.escapeHtml(current.name)}</div><div class="sub">${UI.escapeHtml(current.line)}</div><p class="sub">${UI.escapeHtml(current.description)}</p></div></div>
      <p class="sub">Financial seasons are periods of focus, not levels to complete. Your season can change. Your weekly habit remains the same.</p>
      <div class="card seasonNotice"><div class="label">Season Check-In</div><div class="value">What deserves your attention now?</div><p class="sub">If life has shifted, Seasons can help you reflect on whether your current season still fits.</p><button class="btn secondary" data-action="showSeasonTransitionNotice">Reflect on Season</button></div>
      <div class="sectionLabel">The Four Financial Seasons</div>
      <div class="accountList">${Object.entries(SEASONS).map(([id,s])=>`<div class="accountRow ${id===data.seasonId?"selectedSeasonRow":""}"><div class="accountMeta"><div>${s.icon} ${UI.escapeHtml(s.name)}</div><div class="sub">${UI.escapeHtml(s.line)}</div></div>${id===data.seasonId?'<span class="check miniCheck">✓</span>':''}</div>`).join("")}</div>`;
    show("command");
  }

  function renderSeasonTransitionNotice(){
    screens.command.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="showSeasonDetail">‹</button><div class="reviewTitle">Season Check-In</div><span></span></div>
      <div class="card center reflectionCard">
        <div class="label">We've noticed a seasonal change.</div>
        <div class="value">Over recent reviews, your financial priorities may be shifting.</div>
        <p class="sub">Would you like to reflect on whether your current season still fits?</p>
        <button class="btn" data-action="startSeasonTransitionReflection">Reflect</button>
        <button class="btn secondary" data-action="showSeasonDetail">Keep Current Season</button>
        <button class="btn secondary" data-action="showSeasonWhy">Why did you notice this?</button>
      </div>`;
    show("command");
  }

  function renderSeasonWhy(){
    const progress=E.progressStatus(data);
    const active=activeAccounts();
    const debts=active.filter(isDebt);
    const foundations=active.filter(isFoundation);
    screens.command.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="showSeasonTransitionNotice">‹</button><div class="reviewTitle">Why Seasons Noticed</div><span></span></div>
      <div class="card">
        <div class="label">Recent Signals</div>
        <div class="detailRow"><span>Progress</span><strong>${UI.escapeHtml(progress)}</strong></div>
        <div class="detailRow"><span>Debt Accounts</span><strong>${debts.length}</strong></div>
        <div class="detailRow"><span>Foundations</span><strong>${foundations.length}</strong></div>
        <p class="sub">Seasons never changes your season automatically. It only invites reflection when your records suggest your attention may be shifting.</p>
      </div>
      <button class="btn" data-action="startSeasonTransitionReflection">Reflect</button>`;
    show("command");
  }

  function transitionSeasonRecommendation(answers){
    const scores={establish:0,grow:0,steward:0,preserve:0};
    const map={debt:"establish",efund:"establish",retirement:"grow",kids:"steward",growth:"grow",preserve:"preserve",spend:"steward",unexpected:"establish",managing:"steward",brokerage:"grow",focusDebt:"establish"};
    Object.values(answers||{}).forEach(v=>{const key=map[v]; if(key)scores[key]+=1;});
    if(answers?.q2==="spend" && answers?.q2plan==="yes")scores.steward+=1;
    if(answers?.q2==="spend" && answers?.q2plan==="no")scores.establish+=1;
    return Object.entries(scores).sort((a,b)=>b[1]-a[1])[0]?.[0] || data.seasonId || "establish";
  }
  function transitionReasons(answers,id){
    const reasons=[];
    if(answers?.q1==="debt")reasons.push("You identified debt payoff as the priority with the greatest near-term impact.");
    if(answers?.q1==="efund")reasons.push("You identified emergency savings as the priority with the greatest near-term impact.");
    if(answers?.q1==="retirement")reasons.push("You identified retirement savings as a primary use of attention and resources.");
    if(answers?.q1==="kids")reasons.push("You identified your children's future as a major priority.");
    if(answers?.q1==="growth")reasons.push("You identified long-term investing as a primary priority.");
    if(answers?.q1==="preserve")reasons.push("You identified protecting what you've built as a primary priority.");
    if(answers?.q2==="spend")reasons.push("You considered spending on something meaningful, so Seasons included intentional use of resources in the recommendation.");
    if(!reasons.length)reasons.push("Your answers suggest where your next dollar and next unit of attention may create the greatest long-term benefit.");
    return reasons.slice(0,3);
  }
  function renderSeasonTransitionReflection(){
    const a=data.seasonTransition?.answers||{};
    screens.command.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="showSeasonTransitionNotice">‹</button><div class="reviewTitle">Reflect</div><span></span></div>
      <p class="sub">These questions help identify where your next dollar and next bit of attention may do the most good.</p>
      <div class="card seasonQuestion"><div class="label">Which financial priority would have the greatest positive impact over the next year?</div>
        <select id="seasonTQ1"><option value="debt" ${a.q1==="debt"?"selected":""}>Pay off debt</option><option value="efund" ${a.q1==="efund"?"selected":""}>Build my emergency fund</option><option value="retirement" ${a.q1==="retirement"?"selected":""}>Increase retirement savings</option><option value="kids" ${a.q1==="kids"?"selected":""}>Save for my children</option><option value="growth" ${a.q1==="growth"?"selected":""}>Invest for long-term growth</option><option value="preserve" ${a.q1==="preserve"?"selected":""}>Preserve what I've built</option></select>
      </div>
      <div class="card seasonQuestion"><div class="label">If you unexpectedly received $5,000 tomorrow, what would you most likely do?</div>
        <select id="seasonTQ2"><option value="debt" ${a.q2==="debt"?"selected":""}>Pay off debt</option><option value="efund" ${a.q2==="efund"?"selected":""}>Build my emergency fund</option><option value="retirement" ${a.q2==="retirement"?"selected":""}>Increase retirement savings</option><option value="kids" ${a.q2==="kids"?"selected":""}>Fund my children's future</option><option value="growth" ${a.q2==="growth"?"selected":""}>Invest for long-term growth</option><option value="spend" ${a.q2==="spend"?"selected":""}>Spend it on something meaningful today</option></select>
        <div class="gentleReflection"><div class="label">If spending feels most honest</div><p class="sub">There's nothing wrong with enjoying the resources you've worked hard to earn. Seasons simply asks whether the choice aligns with what deserves your attention most right now.</p><label class="label" for="seasonTQ2Plan">Is this something you've been intentionally planning for?</label><select id="seasonTQ2Plan"><option value="yes" ${a.q2plan==="yes"?"selected":""}>Yes</option><option value="no" ${a.q2plan==="no"?"selected":""}>No / not really</option></select></div>
      </div>
      <div class="card seasonQuestion"><div class="label">Which of these keeps taking most of your financial attention?</div>
        <select id="seasonTQ3"><option value="debt" ${a.q3==="debt"?"selected":""}>Debt</option><option value="unexpected" ${a.q3==="unexpected"?"selected":""}>Unexpected expenses</option><option value="retirement" ${a.q3==="retirement"?"selected":""}>Retirement readiness</option><option value="kids" ${a.q3==="kids"?"selected":""}>Paying for my children's future</option><option value="managing" ${a.q3==="managing"?"selected":""}>Managing several priorities at once</option><option value="preserve" ${a.q3==="preserve"?"selected":""}>Protecting what I've built</option></select>
      </div>
      <div class="card seasonQuestion"><div class="label">What account deserves the most attention over the next 12 months?</div>
        <select id="seasonTQ4"><option value="focusDebt" ${a.q4==="focusDebt"?"selected":""}>Focus debt</option><option value="efund" ${a.q4==="efund"?"selected":""}>Emergency fund</option><option value="retirement" ${a.q4==="retirement"?"selected":""}>Retirement</option><option value="kids" ${a.q4==="kids"?"selected":""}>Kids' savings / 529</option><option value="brokerage" ${a.q4==="brokerage"?"selected":""}>Long-term investments</option><option value="preserve" ${a.q4==="preserve"?"selected":""}>Preservation / income reserves</option></select>
      </div>
      <button class="btn" data-action="recommendSeasonFromTransition">See Recommendation</button>
      <div class="card quietMessage"><div class="value">Seasons change.</div><p class="sub">The goal isn't to stay in one forever. The goal is to recognize what deserves your attention today.</p></div>`;
    show("command");
  }
  function renderSeasonTransitionRecommendation(){
    const answers=data.seasonTransition?.answers||{};
    const id=data.seasonTransition?.recommendedSeason||transitionSeasonRecommendation(answers);
    const rec=season(id);
    const reasons=transitionReasons(answers,id);
    screens.command.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="startSeasonTransitionReflection">‹</button><div class="reviewTitle">Recommendation</div><span></span></div>
      <div class="card selectedSeason"><div class="label">Based on your reflection...</div><div class="value">${rec.icon} ${UI.escapeHtml(rec.name)}</div><p class="sub">${UI.escapeHtml(rec.line)}</p></div>
      <div class="card detailCard"><div class="label">Why this recommendation?</div>${reasons.map(r=>`<div class="detailRow"><span>✓</span><strong>${UI.escapeHtml(r)}</strong></div>`).join("")}</div>
      <button class="btn" data-action="acceptSeasonTransitionRecommendation">Use ${UI.escapeHtml(rec.name)}</button>
      <button class="btn secondary" data-action="showSeasonChooser">Choose Another Season</button>`;
    show("command");
  }

  function renderSeasonTransitionConfirm(id){
    const current=season(id);
    screens.command.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="showSeasonDetail">‹</button><div class="reviewTitle">Current Season</div><span></span></div>
      <div class="card center seasonDetailHero"><div class="seasonIcon bigSeason">${current.icon}</div><div><div class="value">${UI.escapeHtml(current.name)}</div><p class="sub">${UI.escapeHtml(seasonWelcome(id))}</p></div></div>
      <div class="card quietMessage"><div class="value">Seasons change.</div><p class="sub">The goal isn't to stay in one forever. The goal is to recognize what deserves your attention today.</p></div>
      <button class="btn" data-action="backToCommand">Continue</button>`;
    show("command");
  }

  function renderSeasonChooser(){
    screens.command.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="showSeasonDetail">‹</button><div class="reviewTitle">Choose Season</div><span></span></div>
      <p class="sub">Choose the season that best describes your current focus.</p>
      <div class="seasonGrid">${Object.entries(SEASONS).map(([id,s])=>`<button class="seasonCard ${data.seasonId===id?"selectedSeason":""}" data-action="setSeasonFromCommand" data-season="${id}"><span class="seasonIcon">${s.icon}</span><span><b>${UI.escapeHtml(s.name)}</b><span class="sub">${UI.escapeHtml(s.line)}</span></span></button>`).join("")}</div>`;
    show("command");
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
      <div id="reviewDeltaPreview" class="inlineDelta">${Math.abs(accountDelta(account,draft))>=1?changeLine(accountDelta(account,draft),account):""}</div>
      <button class="btn reviewContinue" data-action="saveAccountReview">Continue</button>`;
    setTimeout(()=>wireReviewBalanceInput(account),50);
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
        ${changeLine(delta,account)}
        <p class="sub">Would you like to remember what changed?</p>
        <button class="btn secondary" data-action="addReflectionNote">Add Note</button>
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
    const debts=accounts.filter(isDebt);
    const foundations=accounts.filter(isFoundation);
    const complete=completedAccounts();
    const f=focus();
    const accountRow=(a)=>{const promo=promoSummary(a);const icon=accountIcon(a);return `<div class="accountRow" data-action="showAccountDetail" data-id="${a.id}"><div class="accountMeta"><div>${f&&f.id===a.id?`<span class="focusDot"></span>`:""}${icon?`<span class="accountIcon">${icon}</span>`:""}${UI.escapeHtml(a.name)}</div><div class="sub">${UI.escapeHtml(a.type||"Account")}${promo?` • ${promo}`:""}</div></div><div class="row"><span>${UI.money(a.balance)}</span></div></div>`};
    screens.accounts.innerHTML=`
      <div class="reviewHeader"><div class="screenTitle">Accounts</div><button class="smallBtn" data-action="showAddAccount">＋</button></div>
      <div class="sectionLabel">Active Debts</div>
      <div class="accountList">${debts.length?debts.map(accountRow).join(""):`<div class="empty">No active debts.</div>`}</div>
      <div class="sectionLabel">Foundations</div>
      <div class="accountList">${foundations.length?foundations.map(accountRow).join(""):`<div class="empty">No foundation accounts yet.</div>`}</div>
      ${complete.length?`<div class="sectionLabel completedLabel">Completed</div><div class="accountList">${complete.map(a=>`<div class="accountRow completedRow" data-action="showAccountDetail" data-id="${a.id}"><div class="accountMeta"><div><span class="check miniCheck">✓</span>${UI.escapeHtml(a.name)}</div><div class="sub">Completed ${a.completedAt?UI.prettySnapshotDate(a.completedAt):""}</div></div><div>${UI.money(0)}</div></div>`).join("")}</div>`:""}
      <button class="btn secondary" data-action="showAddAccount">Add Account</button>
      <p class="screenReflection">Review only the accounts that deserve your attention today.</p>`;
  }

  function renderAccountDetail(account){
    const promo=promoSummary(account);
    const history=historyForAccount(account);
    const foundation=isFoundation(account);
    screens.accounts.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="backToAccounts">‹</button><div class="reviewTitle">${accountIcon(account)} ${UI.escapeHtml(account.name)}</div><button class="smallBtn" data-action="manageAccount" data-id="${account.id}">Manage</button></div>
      ${focus()?.id===account.id?`<div class="pill detailPill">Focus Account</div>`:""}
      ${account.paidOff?`<div class="pill detailPill">Paid Off</div>`:""}
      <div class="card detailCard">
        <div class="detailRow"><span>Account Type</span><strong>${UI.escapeHtml(account.type||"Account")}</strong></div>
        <div class="detailRow"><span>Current Balance</span><strong>${UI.money(account.balance)}</strong></div>
        ${foundation?`<div class="helper">Foundation accounts move in the right direction when their balance increases.</div>`:`<div class="detailRow"><span>APR</span><strong>${Number(account.apr||0).toFixed(2)}%</strong></div><div class="detailRow"><span>Minimum Payment</span><strong>${UI.money(account.min)}</strong></div><div class="detailRow"><span>Statement Day</span><strong>${account.statementDay?UI.escapeHtml(account.statementDay):"—"}</strong></div>`}
      </div>
      ${!foundation && account.promoEnabled?`<div class="card detailCard"><div class="label">Promotional APR</div><div class="detailRow"><span>Current Promo APR</span><strong>${Number(account.promoApr||0).toFixed(2)}%</strong></div><div class="detailRow"><span>Expires</span><strong>${account.promoExpires?UI.prettyDate(account.promoExpires):"—"}</strong></div><div class="detailRow"><span>Standard APR After</span><strong>${Number(account.standardApr||account.apr||0).toFixed(2)}%</strong></div>${promo?`<div class="helper">${promo}</div>`:""}</div>`:""}
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
    const type=account?.type||"Credit Card";
    const foundation=isFoundation({type});
    screens.accounts.innerHTML=`
      <div class="reviewHeader"><button class="back" data-action="backToAccounts">‹</button><div class="reviewTitle">${isEdit?"Edit Account":"Add Account"}</div><span></span></div>
      <div class="card accountTypeCard">
        <div class="label">What would you like to add?</div>
        <label class="label" for="formType">Account Type</label><select id="formType"><option ${type==="Credit Card"?"selected":""}>Credit Card</option><option ${type==="Auto Loan"?"selected":""}>Auto Loan</option><option ${type==="Personal Loan"?"selected":""}>Personal Loan</option><option ${type==="Student Loan"?"selected":""}>Student Loan</option><option ${type==="HELOC"?"selected":""}>HELOC</option><option ${type==="Emergency Fund"?"selected":""}>Emergency Fund</option><option ${type==="Retirement"?"selected":""}>Retirement</option></select>
        <div class="helper" id="accountTypeHelper">${foundation?"Foundation accounts track what you are building, not what you owe.":"Debt accounts track what you are paying down."}</div>
      </div>
      <div class="card">
        <label class="label" for="formName">Account Name</label><input id="formName" value="${UI.escapeHtml(account?.name||"")}" placeholder="e.g., Chase Freedom">
        <label class="label" for="formBalance">Current Balance</label><input id="formBalance" type="number" inputmode="decimal" value="${Number(account?.balance)||0}">
        <div id="debtFields" class="${foundation?"hidden":""}">
          <label class="label" for="formApr">Standard APR</label><input id="formApr" type="number" inputmode="decimal" value="${Number(account?.apr)||0}">
          <label class="label" for="formMin">Minimum Payment</label><input id="formMin" type="number" inputmode="decimal" value="${Number(account?.min)||0}">
          <label class="label" for="formStatementDay">Statement Day</label><input id="formStatementDay" inputmode="numeric" value="${UI.escapeHtml(account?.statementDay||"")}" placeholder="e.g., 15th">
        </div>
      </div>
      <div id="promoCard" class="card promoCard ${foundation?"hidden":""}"><label class="toggleRow"><span><span class="label">Promotional APR</span><span class="sub">Track intro rates and expiration dates.</span></span><input id="formPromo" type="checkbox" ${promoOn?"checked":""}></label><div id="promoFields" class="${promoOn?"":"hidden"}"><label class="label" for="formPromoApr">Current Promo APR</label><input id="formPromoApr" type="number" inputmode="decimal" value="${Number(account?.promoApr)||0}"><label class="label" for="formPromoExpires">Expires</label><input id="formPromoExpires" type="date" value="${UI.escapeHtml(account?.promoExpires||"")}"><label class="label" for="formStandardApr">Standard APR After</label><input id="formStandardApr" type="number" inputmode="decimal" value="${Number(account?.standardApr||account?.apr)||0}"><div class="helper" id="promoReviews">${account?.promoExpires?`${E.weeklyReviewsUntil(account.promoExpires)} week${E.weeklyReviewsUntil(account.promoExpires)===1?"":"s"} remaining`:"Add an expiration date to see weeks remaining."}</div></div></div>
      <div class="card"><label class="label" for="formNote">Notes</label><textarea id="formNote" placeholder="Optional">${UI.escapeHtml(account?.note||"")}</textarea></div>
      <div class="formFooter"><button class="btn formSaveBtn" data-action="saveAccount" data-id="${account?.id||""}">${isEdit?"Save Changes":"Save Account"}</button></div>`;
    show("accounts");setTimeout(()=>{wirePromoForm();wireAccountTypeForm();},0);
  }

  function wireAccountTypeForm(){
    const type=UI.byId("formType");
    if(!type)return;
    const update=()=>{
      const foundation=accountKind({type:type.value})==="foundation";
      UI.byId("debtFields")?.classList.toggle("hidden",foundation);
      UI.byId("promoCard")?.classList.toggle("hidden",foundation);
      const helper=UI.byId("accountTypeHelper");
      if(helper)helper.textContent=foundation?"Foundation accounts track what you are building, not what you owe.":"Debt accounts track what you are paying down.";
      const promo=UI.byId("formPromo"); if(foundation&&promo)promo.checked=false;
    };
    type.addEventListener("change",update);
    update();
  }

  function wirePromoForm(){const checkbox=UI.byId("formPromo");const fields=UI.byId("promoFields");const expires=UI.byId("formPromoExpires");const reviews=UI.byId("promoReviews");if(checkbox&&fields){checkbox.addEventListener("change",()=>fields.classList.toggle("hidden",!checkbox.checked));}if(expires&&reviews){expires.addEventListener("input",()=>{const n=E.weeklyReviewsUntil(expires.value);reviews.textContent=n===null?"Add an expiration date to see weeks remaining.":`${n} week${n===1?"":"s"} remaining`;});}}

  function advanceReview(){const accounts=reviewAccounts();if(data.review.index>=accounts.length-1){data.review.status="allUpdated";}else{data.review.index+=1;data.review.status="inProgress";}data.review.pendingPaidOff=null;data.review.pendingReflection=null;saveRender("review");}
  function completeAccount(account){account.balance=0;account.paidOff=true;account.completedAt=new Date().toISOString();}


  function renderSettings(){
    screens.settings.innerHTML=`
      <div class="reviewHeader"><div class="screenTitle">Settings</div><button class="smallBtn" data-action="forceUpdateCheck">Check</button></div>
      <div class="card">
        <div class="label">Weekly Review</div>
        <button class="settingChoice" data-action="editReviewDay"><span><b>${UI.escapeHtml(data.reviewDay||"Thursday")}</b><span class="sub">Review day</span></span><span class="miniChev">›</span></button>
        <button class="settingChoice" data-action="editReviewTime"><span><b>${UI.escapeHtml(data.reviewTime||"7:30 PM")}</b><span class="sub">Review time</span></span><span class="miniChev">›</span></button>
      </div>
      <div class="card">
        <div class="label">Focus Strategy</div>
        <button class="settingChoice" data-action="editStrategy"><span><b>${UI.escapeHtml(UI.strategyLabel(data.strategy))}</b><span class="sub">How Seasons chooses your focus debt</span></span><span class="miniChev">›</span></button>
      </div>
      <div class="card">
        <div class="label">App</div>
        <button class="settingChoice" data-action="showDiagnostics"><span><b>Diagnostics</b><span class="sub">Version, startup log, and recovery tools</span></span><span class="miniChev">›</span></button>
        <button class="settingChoice" data-action="clearAppCache"><span><b>Clear cache and reload</b><span class="sub">Use this after uploading a new build</span></span><span class="miniChev">›</span></button>
        <button class="settingChoice" data-action="exportData"><span><b>Export backup</b><span class="sub">Download your local Seasons data</span></span><span class="miniChev">›</span></button>
      </div>
      <button class="btn secondary" data-action="loadDemoData">Load Demo Data</button>
      <button class="btn secondary" data-action="resetAll">Reset Seasons</button>
      <p class="tinyNote" data-action="tapVersion">${APP_VERSION}</p>`;
  }

  function renderDayPicker(){
    const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    screens.settings.innerHTML=`<div class="reviewHeader"><button class="back" data-action="backToSettings">‹</button><div class="reviewTitle">Review Day</div><span></span></div><div class="card accountList">${days.map(day=>`<button class="settingChoice" data-action="setReviewDay" data-value="${day}"><span><b>${day}</b></span>${data.reviewDay===day?'<span class="check miniCheck">✓</span>':'<span class="miniChev">›</span>'}</button>`).join("")}</div>`;
    show("settings");
  }

  function renderStrategyPicker(){
    const strategies=[{id:"avalanche",label:"Highest Interest First",sub:"Usually saves the most interest."},{id:"snowball",label:"Smallest Balance First",sub:"Builds momentum with faster wins."}];
    screens.settings.innerHTML=`<div class="reviewHeader"><button class="back" data-action="backToSettings">‹</button><div class="reviewTitle">Focus Strategy</div><span></span></div><div class="card accountList">${strategies.map(s=>`<button class="settingChoice" data-action="setStrategy" data-value="${s.id}"><span><b>${s.label}</b><span class="sub">${s.sub}</span></span>${data.strategy===s.id?'<span class="check miniCheck">✓</span>':'<span class="miniChev">›</span>'}</button>`).join("")}</div>`;
    show("settings");
  }

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
      {id:"demo_auto",name:"Car Loan",type:"Auto Loan",balance:11420,apr:6.25,min:412,statementDay:"",note:"",promoEnabled:false,promoApr:0,promoExpires:"",standardApr:6.25,archived:false,paidOff:false,completedAt:null},
      {id:"demo_efund",name:"Emergency Fund",type:"Emergency Fund",balance:4000,apr:0,min:0,statementDay:"",note:"Foundation account",promoEnabled:false,promoApr:0,promoExpires:"",standardApr:0,archived:false,paidOff:false,completedAt:null},
      {id:"demo_retire",name:"Retirement",type:"Retirement",balance:18000,apr:0,min:0,statementDay:"",note:"Foundation account",promoEnabled:false,promoApr:0,promoExpires:"",standardApr:0,archived:false,paidOff:false,completedAt:null}
    ];
    data.startingAmount=20667;data.snapshots=[];data.review={status:"ready",index:0,draft:{},lastCompleted:null,nextReview:"Next Thursday",pendingPaidOff:null,pendingReflection:null,notes:{}};saveRender("command");
  }

  const actions={
    startSeasonReflection(){data.onboarding.step="discover";saveRender("onboarding");},
    recommendCurrentSeason(){data.onboarding.answers={q1:UI.byId("seasonQ1")?.value||"establish",q2:UI.byId("seasonQ2")?.value||"establish",q3:UI.byId("seasonQ3")?.value||"establish"};data.onboarding.recommendedSeason=recommendSeason();data.onboarding.step="recommendation";saveRender("onboarding");},
    acceptSeasonRecommendation(){setSeason(data.onboarding.recommendedSeason||"establish");data.onboarding.step="setup";saveRender("onboarding");},
    chooseAnotherSeason(){data.onboarding.step="chooseSeason";saveRender("onboarding");},
    selectSeason(node){setSeason(node.dataset.season||"establish");data.onboarding.step="setup";saveRender("onboarding");},
    finishSetup(){data.reviewDay=UI.byId("setupDay").value;data.reviewTime=UI.byId("setupTime").value||"7:30 PM";data.strategy=UI.byId("setupStrategy").value;data.setupComplete=true;if(!data.seasonSince)data.seasonSince=new Date().toLocaleDateString(undefined,{month:"long",year:"numeric"});saveRender("command");},
    showFocusDetail(){const f=focus();if(f){renderAccountDetail(f);}else{render("accounts");}},
    showSeasonDetail(){renderSeasonDetail();},
    showSeasonChooser(){renderSeasonChooser();},
    showSeasonTransitionNotice(){renderSeasonTransitionNotice();},
    showSeasonWhy(){renderSeasonWhy();},
    startSeasonTransitionReflection(){renderSeasonTransitionReflection();},
    recommendSeasonFromTransition(){const answers={q1:UI.byId("seasonTQ1").value,q2:UI.byId("seasonTQ2").value,q2plan:UI.byId("seasonTQ2Plan")?.value||"yes",q3:UI.byId("seasonTQ3").value,q4:UI.byId("seasonTQ4").value};data.seasonTransition={answers,recommendedSeason:transitionSeasonRecommendation(answers)};save();renderSeasonTransitionRecommendation();},
    acceptSeasonTransitionRecommendation(){const id=data.seasonTransition?.recommendedSeason||data.seasonId||"establish";setSeason(id);save();renderSeasonTransitionConfirm(id);},
    backToCommand(){render("command");},
    setSeasonFromCommand(node){setSeason(node.dataset.season||"establish");save();renderSeasonDetail();},
    setSeasonFromTransition(node){const id=node.dataset.season||"establish";setSeason(id);save();renderSeasonTransitionConfirm(id);},
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
    saveAccount(node){const id=node.dataset.id;let account=data.accounts.find(a=>a.id===id);if(!account){account={id:`acct_${Date.now()}`,archived:false,paidOff:false,completedAt:null};data.accounts.push(account);}account.name=UI.byId("formName").value||"Account";account.type=UI.byId("formType").value;account.balance=Number(UI.byId("formBalance").value)||0;const foundation=accountKind(account)==="foundation";account.apr=foundation?0:(Number(UI.byId("formApr")?.value)||0);account.min=foundation?0:(Number(UI.byId("formMin")?.value)||0);account.statementDay=foundation?"":(UI.byId("formStatementDay")?.value||"");account.note=UI.byId("formNote").value||"";account.promoEnabled=foundation?false:Boolean(UI.byId("formPromo")?.checked);account.promoApr=foundation?0:(Number(UI.byId("formPromoApr")?.value)||0);account.promoExpires=foundation?"":(UI.byId("formPromoExpires")?.value||"");account.standardApr=foundation?0:(Number(UI.byId("formStandardApr")?.value)||account.apr);if(!data.startingAmount)data.startingAmount=E.totalBalance(activeAccounts(data));save();renderAccountDetail(account);},
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
    async clearAppCache(){await clearCaches();try{localStorage.removeItem("seasons_v01_data_corrupt");}catch(_){} alert("Cache cleared. Reloading Seasons.");location.reload();},
    showDiagnostics(){renderDiagnostics();},
    resetLocalData(){if(confirm("Reset local data and reload Seasons?")){try{localStorage.removeItem("seasons_v01_data");}catch(_){} location.reload();}},
    loadDemoData(){if(confirm("Replace local data with demo data?")){loadDemoDataset();}},
    backToSettings(){renderSettings();show("settings");}
  };

  function handleClick(event){
    try{
      const actionTarget=event.target.closest("[data-action]");
      if(actionTarget){const action=actionTarget.dataset.action;if(actions[action]){actions[action](actionTarget);return;}}
      const screenTarget=event.target.closest("[data-screen]");if(screenTarget){const id=screenTarget.dataset.screen;render(id);}
    }catch(error){
      startupErrors.push("Action failed: "+(error?.message||error));
      renderStartupError(error);
    }
  }
  document.addEventListener("click",handleClick);
  if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js?v=1.1.3").catch(error=>startupErrors.push("Service worker failed: "+(error?.message||error)));}
  try{render(data.setupComplete?"command":"onboarding");}catch(error){startupErrors.push("Startup failed: "+(error?.message||error));renderStartupError(error);}
  setTimeout(()=>{try{window.SEASONS_HIDE_SPLASH ? window.SEASONS_HIDE_SPLASH() : document.getElementById("splash")?.classList.add("hiddenSplash");}catch(_){}},900);
  setTimeout(()=>{try{checkForUpdate(true);}catch(error){startupErrors.push("Update check failed: "+(error?.message||error));}},800);
})();
