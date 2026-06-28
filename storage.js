(function(){
  const CURRENT_KEY="seasons_v01_data";
  const LEGACY_KEYS=["cc_v20_data","cc_v121_data","cc_v12_data","cc_clean_v11_data","cc_clean_v1_data"];
  const blank={
    setupComplete:false,
    reviewDay:"Thursday",
    reviewTime:"7:30 PM",
    strategy:"avalanche",
    seasonId:"establish",
    seasonName:"Establish",
    seasonSince:"June 2026",
    onboarding:{step:"welcome",answers:{},recommendedSeason:"establish"},
    startingAmount:0,
    accounts:[],
    snapshots:[],
    review:{status:"ready",index:0,draft:{},lastCompleted:null,nextReview:"Next Thursday",pendingPaidOff:null,pendingReflection:null,notes:{}}
  };
  function cloneBlank(){return JSON.parse(JSON.stringify(blank));}
  function normalizeAccount(account,index){return{
    id:account.id || `acct_${Date.now()}_${index}_${Math.random().toString(16).slice(2)}`,
    name:account.name || "Account",
    type:account.type || "Credit Card",
    balance:Number(account.balance)||0,
    apr:Number(account.apr)||0,
    min:Number(account.min)||0,
    statementDay:account.statementDay || "",
    note:account.note || "",
    promoEnabled:Boolean(account.promoEnabled),
    promoApr:Number(account.promoApr)||0,
    promoExpires:account.promoExpires || "",
    standardApr:Number(account.standardApr)||0,
    archived:Boolean(account.archived),
    paidOff:Boolean(account.paidOff),
    completedAt:account.completedAt || null
  };}
  function normalize(data){const base=Object.assign(cloneBlank(),data||{});base.strategy=base.strategy || "avalanche";
    base.seasonId=base.seasonId || "establish";
    base.seasonName=base.seasonName || "Establish";
    base.onboarding=Object.assign({step:"welcome",answers:{},recommendedSeason:"establish"},base.onboarding||{});
    base.onboarding.answers=base.onboarding.answers||{};base.accounts=(base.accounts||[]).map(normalizeAccount);base.snapshots=base.snapshots || base.reviewHistory || [];
    if(!base.review)base.review=cloneBlank().review;
    base.review=Object.assign(cloneBlank().review,base.review);base.review.notes=base.review.notes||{};
    if(base.setupComplete===undefined)base.setupComplete=Boolean(base.accounts.length);
    if(!base.startingAmount && base.accounts.length)base.startingAmount=base.accounts.reduce((sum,a)=>sum+(Number(a.balance)||0),0);
    return base;
  }
  function load(){
    const current=localStorage.getItem(CURRENT_KEY);if(current)return normalize(JSON.parse(current));
    for(const key of LEGACY_KEYS){const value=localStorage.getItem(key);if(value)return normalize(JSON.parse(value));}
    return cloneBlank();
  }
  function save(data){localStorage.setItem(CURRENT_KEY,JSON.stringify(normalize(data)));}
  function reset(){localStorage.removeItem(CURRENT_KEY);return cloneBlank();}
  window.CCStorage={load,save,reset,blank:cloneBlank};
})();
