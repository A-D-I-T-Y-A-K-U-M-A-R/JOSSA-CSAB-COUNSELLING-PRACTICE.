let records = {};
let removeLocked = false;

let undoStack = [];
let JSON_DATA = {};


let ORIGINAL_DATA = [];
let CURRENT_DATA = [];

// 🔥 NORMALIZE FUNCTION (Seat Type safe compare)
function normalizeSeat(value){
    return (value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/-/g, " ");
}

// 🔥 SEAT TYPE FILTER
function applySeatTypeFilter(data){
    let selectedSeat = document.getElementById("seatType").value;

    // default = OPEN
    if(!selectedSeat){
        selectedSeat = "OPEN";
    }

    const normalizedSelected = normalizeSeat(selectedSeat);

    return data.filter(item => {
        const jsonSeat = normalizeSeat(item["Seat Type"]);
        return jsonSeat === normalizedSelected;
    });
}

// 🔥 NORMALIZE FUNCTION (Gender full-proof)
function normalizeGender(value){
    return (value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/-/g, " ")
        .replace(/\(\s*/g, "(")
        .replace(/\s*\)/g, ")");
}

// 🔥 GENDER FILTER
function applyGenderFilter(data){
    let selectedGender = document.getElementById("genderType").value;

    if(!selectedGender){
        selectedGender = "Gender-Neutral";
    }

    const normalizedSelected = normalizeGender(selectedGender);

    return data.filter(item => {
        const jsonGender = normalizeGender(item["Gender"]);
        return jsonGender === normalizedSelected;
    });
}

// 🔥 NORMALIZE QUOTA
function normalizeQuota(q){
    return (q || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

// 🔥 NORMALIZE STATE
function normalizeState(s){
    return (s || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\(.*?\)/g, "")   // remove brackets
        .replace(/nct/g, "")       // Delhi (NCT)
        .replace(/pondicherry/g, "puducherry");

}

// 🔥 HOME STATE FILTER
function applyHomeStateFilter(data){

    let selectedState = document.getElementById("homeState").value;

    if(!selectedState) return data; // agar select nahi kiya to skip

    selectedState = normalizeState(selectedState);

    return data.filter(item => {

       let instRaw = item["Institute"];
let inst = instRaw.toLowerCase().trim().replace(/\s+/g," ");

// 🔥 direct match
let instState = STATE_MAP[inst];

// 🔥 fallback (important)
if(!instState){
    for(let key in STATE_MAP){
        if(inst.includes(key)){
            instState = STATE_MAP[key];
            break;
        }
    }
}

instState = normalizeState(instState || "");

        let quotaRaw = normalizeQuota(item["Quota"]);

        // 🔥 normalize quota types
        let quota = "";
        if(quotaRaw.includes("home")) quota = "hs";
        else if(quotaRaw === "hs") quota = "hs";
        else if(quotaRaw.includes("all")) quota = "ai";
        else if(quotaRaw === "ai") quota = "ai";
        else if(quotaRaw.includes("other")) quota = "os";
        else if(quotaRaw === "os") quota = "os";
        else if(quotaRaw === "jk") quota = "jk";
        else if(quotaRaw === "go") quota = "go";
        else if(quotaRaw === "la") quota = "la";
        else if(quotaRaw.includes("dasa")) return false; // ❌ remove always

        // 🔴 SAME STATE
        if(instState === selectedState){

            // special states
            if(instState === "jammu and kashmir" && (quota === "hs" || quota === "jk")) return true;
            if(instState === "goa" && (quota === "hs" || quota === "go")) return true;
            if(instState === "ladakh" && (quota === "hs" || quota === "la")) return true;

            // normal states
            if(quota === "hs") return true;

            return false;
        }

        // 🔴 DIFFERENT STATE
        else{
            return (quota === "ai" || quota === "os");
        }

    });
}


async function loadJSON(){
    const res = await fetch("preferred_data.json");
    JSON_DATA = await res.json();

    ORIGINAL_DATA = JSON_DATA["ROUND 1 JOSSA 2025"] || [];

    let tempData = [...ORIGINAL_DATA];

    CURRENT_DATA = tempData;

    // ✅ populate after filtering
    populateSearchLists();

    // 🔥 RESTORE SEARCH STATE
    let savedType = localStorage.getItem("typeSearch") || "";
    let savedInst = localStorage.getItem("instSearch") || "";
    let savedBranch = localStorage.getItem("branchSearch") || "";

    document.getElementById("typeSearch").value = savedType;
    document.getElementById("instSearch").value = savedInst;
    document.getElementById("branchSearch").value = savedBranch;

    if(savedType || savedInst || savedBranch){
        document.getElementById("searchBtn").click();
    }
}


loadJSON();

// 🔴 SAVE FILTER VALUES

document.getElementById("seatType").onchange = function(){
localStorage.setItem("seatType", this.value);
};

document.getElementById("genderType").onchange = function(){
localStorage.setItem("genderType", this.value);
};

document.getElementById("homeState").onchange = function(){
localStorage.setItem("homeState", this.value);
};

let files = [
"ROUND 1 JOSSA 2025",
"ROUND 2 JOSSA 2025",
"ROUND 3 JOSSA 2025",
"ROUND 4 JOSSA 2025",
"ROUND 5 JOSSA 2025",
"ROUND 6 JOSSA 2025",
"ROUND 1 CSAB 2025",
"ROUND 2 CSAB 2025",
"ROUND 3 CSAB 2025"
];

const NIT_ORDER = {
"national institute of technology, tiruchirappalli":1,
"national institute of technology karnataka, surathkal":2,
"national institute of technology, rourkela":3,
"malaviya national institute of technology jaipur":4,
"national institute of technology, warangal":5,
"national institute of technology calicut":6,
"motilal nehru national institute of technology allahabad":7,
"national institute of technology, kurukshetra":8,
"sardar vallabhbhai national institute of technology, surat":9,
"national institute of technology hamirpur":10,
"visvesvaraya national institute of technology, nagpur":11,
"national institute of technology durgapur":12,
"national institute of technology, silchar":13,
"dr. b r ambedkar national institute of technology, jalandhar":14,
"national institute of technology raipur":15,
"national institute of technology, jamshedpur":16,
"national institute of technology patna":17,
"national institute of technology delhi":18,
"maulana azad national institute of technology bhopal":19,
"national institute of technology, andhra pradesh":20,
"national institute of technology, uttarakhand":21,
"national institute of technology agartala":22,
"national institute of technology goa":23,
"national institute of technology puducherry":24,
  "national institute of technology arunachal pradesh":25,
"national institute of technology meghalaya":26,
"national institute of technology nagaland":27,
"national institute of technology sikkim":28,
"national institute of technology, manipur":29,
"national institute of technology, mizoram":30,
"national institute of technology, srinagar":31
};

const IIIT_ORDER = {
"indian institute of information technology, allahabad":55,
"atal bihari vajpayee indian institute of information technology & management gwalior":56,
"indian institute of information technology lucknow":57,
"indian institute of information technology (iiit) nagpur":58,
"indian institute of information technology (iiit) pune":59,
"indian institute of information technology, raichur, karnataka":60,
"indian institute of information technology surat":61,
"indian institute of information technology (iiit) ranchi":62,
"indian institute of information technology (iiit), sri city, chittoor":63,
"indian institute of information technology (iiit)kota, rajasthan":64,
"indian institute of information technology(iiit) una, himachal pradesh":75,
"indian institute of information technology(iiit), vadodara, gujrat":76,
"indian institute of information technology bhagalpur":67,
"indian institute of information technology bhopal":68,
"indian institute of information technology design & manufacturing kurnool, andhra pradesh":69,
"indian institute of information technology guwahati":70,
"indian institute of information technology tiruchirappalli":71,
"indian institute of information technology(iiit) dharwad":72,
"indian institute of information technology(iiit) kalyani, west bengal":73,
"indian institute of information technology(iiit) kilohrad, sonepat, haryana":74,
"indian institute of information technology(iiit) kottayam":75,
"indian institute of information technology, agartala":76,
"indian institute of information technology, design & manufacturing, kancheepuram":77,
"indian institute of information technology, vadodara international campus diu (iiitvicd)":78,
"international institute of information technology, bhubaneswar":79,
"international institute of information technology, naya raipur":80,
"indian institute of information technology senapati manipur":81
};

const IIT_ORDER = {
"indian institute of technology (bhu) varanasi":32,
"indian institute of technology madras":33,
"indian institute of technology delhi":34,
"indian institute of technology bombay":35,
"indian institute of technology kanpur":36,
"indian institute of technology kharagpur":37,
"indian institute of technology roorkee":38,
"indian institute of technology guwahati":39,
"indian institute of technology hyderabad":40,
"indian institute of technology indore":41,
"indian institute of technology (ism) dhanbad":42,
"indian institute of technology bhilai":43,
"indian institute of technology bhubaneswar":44,
"indian institute of technology dharwad":45,
"indian institute of technology gandhinagar":46,
"indian institute of technology goa":47,
"indian institute of technology jammu":48,
"indian institute of technology jodhpur":49,
"indian institute of technology mandi":50,
"indian institute of technology palakkad":51,
"indian institute of technology patna":52,
"indian institute of technology ropar":53,
"indian institute of technology tirupati":54
};

const OTHER_ORDER = {
"birla institute of technology, mesra, ranchi":82,
"national institute of electronics and information technology, ajmer (rajasthan)":83,
"national institute of electronics and information technology, aurangabad (maharashtra)":84,
"national institute of electronics and information technology, gorakhpur (up)":85,
"national institute of electronics and information technology, patna (bihar)":86,
"national institute of electronics and information technology, ropar (punjab)":87,
"pt. dwarka prasad mishra indian institute of information technology, design & manufacture jabalpur":88,
"assam university, silchar":89,
"birla institute of technology, deoghar off-campus":90,
"birla institute of technology, patna off-campus":91,
"cu jharkhand":92,	
"central university of haryana":93,
"central university of jammu":94,
"central university of rajasthan, rajasthan":95,
"central institute of technology kokrajar, assam":96,
"chhattisgarh swami vivekanada technical university, bhilai (csvtu bhilai)":97,
"gati shakti vishwavidyalaya, vadodara":98,
"ghani khan choudhary institute of engineering and technology, malda, west bengal":99,
"gurukula kangri vishwavidyalaya, haridwar":100,
"indian institute of carpet technology, bhadohi":101,
"indian institute of engineering science and technology, shibpur":102,
"indian institute of handloom technology(iiht), varanasi":103,
"indian institute of handloom technology, salem":104,
"institute of chemical technology, mumbai: indian oil odisha campus, bhubaneswar":105,
"institute of engineering and technology, dr. h. s. gour university. sagar (a central university)":106,
"institute of infrastructure, technology, research and management-ahmedabad":107,
"islamic university of science and technology kashmir":108,
"j.k. institute of applied physics & technology, department of electronics & communication, university of allahabad- allahabad":109,
"jawaharlal nehru university, delhi":110,
"mizoram university, aizawl":111,
"national institute of advanced manufacturing technology, ranchi":112,
"national institute of food technology entrepreneurship and management, kundli":113,
"national institute of food technology entrepreneurship and management, thanjavur":114,
"north eastern regional institute of science and technology, nirjuli-791109 (itanagar),arunachal pradesh":115,
"north-eastern hill university, shillong":116,
"puducherry technological university, puducherry":117,
"punjab engineering college, chandigarh":118,
"rajiv gandhi national aviation university, fursatganj, amethi (up)":119,
"sant longowal institute of engineering and technology":120,
"school of engineering, tezpur university, napaam, tezpur":121,
"school of planning & architecture, bhopal":122,
"school of planning & architecture, new delhi":123,
"school of planning & architecture: vijayawada":124,
"school of studies of engineering and technology, guru ghasidas vishwavidyalaya, bilaspur":125,
"shri g. s. institute of technology and science indore":126,
"shri mata vaishno devi university, katra, jammu & kashmir":127,
"university of hyderabad":128
};

// 🔥 FULL STATE MAP (ALL COLLEGES)
const STATE_MAP = {

// ===== IIT =====
"indian institute of technology (bhu) varanasi":"uttar pradesh",
"indian institute of technology madras":"tamil nadu",
"indian institute of technology delhi":"delhi",
"indian institute of technology bombay":"maharashtra",
"indian institute of technology kanpur":"uttar pradesh",
"indian institute of technology kharagpur":"west bengal",
"indian institute of technology roorkee":"uttarakhand",
"indian institute of technology guwahati":"assam",
"indian institute of technology hyderabad":"telangana",
"indian institute of technology indore":"madhya pradesh",
"indian institute of technology (ism) dhanbad":"jharkhand",
"indian institute of technology bhilai":"chhattisgarh",
"indian institute of technology bhubaneswar":"odisha",
"indian institute of technology dharwad":"karnataka",
"indian institute of technology gandhinagar":"gujarat",
"indian institute of technology goa":"goa",
"indian institute of technology jammu":"jammu and kashmir",
"indian institute of technology jodhpur":"rajasthan",
"indian institute of technology mandi":"himachal pradesh",
"indian institute of technology palakkad":"kerala",
"indian institute of technology patna":"bihar",
"indian institute of technology ropar":"punjab",
"indian institute of technology tirupati":"andhra pradesh",

// ===== NIT =====
"national institute of technology, tiruchirappalli":"tamil nadu",
"national institute of technology karnataka, surathkal":"karnataka",
"national institute of technology, rourkela":"odisha",
"malaviya national institute of technology jaipur":"rajasthan",
"national institute of technology, warangal":"telangana",
"national institute of technology calicut":"kerala",
"motilal nehru national institute of technology allahabad":"uttar pradesh",
"national institute of technology, kurukshetra":"haryana",
"sardar vallabhbhai national institute of technology, surat":"gujarat",
"national institute of technology hamirpur":"himachal pradesh",
"visvesvaraya national institute of technology, nagpur":"maharashtra",
"national institute of technology durgapur":"west bengal",
"national institute of technology, silchar":"assam",
"dr. b r ambedkar national institute of technology, jalandhar":"punjab",
"national institute of technology raipur":"chhattisgarh",
"national institute of technology, jamshedpur":"jharkhand",
"national institute of technology patna":"bihar",
"national institute of technology delhi":"delhi",
"maulana azad national institute of technology bhopal":"madhya pradesh",
"national institute of technology, andhra pradesh":"andhra pradesh",
"national institute of technology, uttarakhand":"uttarakhand",
"national institute of technology agartala":"tripura",
"national institute of technology goa":"goa",
"national institute of technology puducherry":"puducherry",
"national institute of technology arunachal pradesh":"arunachal pradesh",
"national institute of technology meghalaya":"meghalaya",
"national institute of technology nagaland":"nagaland",
"national institute of technology sikkim":"sikkim",
"national institute of technology, manipur":"manipur",
"national institute of technology, mizoram":"mizoram",
"national institute of technology, srinagar":"jammu and kashmir",

// ===== IIIT =====
"indian institute of information technology, allahabad":"uttar pradesh",
"atal bihari vajpayee indian institute of information technology & management gwalior":"madhya pradesh",
"indian institute of information technology lucknow":"uttar pradesh",
"indian institute of information technology (iiit) nagpur":"maharashtra",
"indian institute of information technology (iiit) pune":"maharashtra",
"indian institute of information technology, raichur, karnataka":"karnataka",
"indian institute of information technology surat":"gujarat",
"indian institute of information technology (iiit) ranchi":"jharkhand",
"indian institute of information technology (iiit), sri city, chittoor":"andhra pradesh",
"indian institute of information technology (iiit)kota, rajasthan":"rajasthan",
"indian institute of information technology(iiit) una, himachal pradesh":"himachal pradesh",
"indian institute of information technology(iiit), vadodara, gujrat":"gujarat",
"indian institute of information technology bhagalpur":"bihar",
"indian institute of information technology bhopal":"madhya pradesh",
"indian institute of information technology design & manufacturing kurnool, andhra pradesh":"andhra pradesh",
"indian institute of information technology guwahati":"assam",
"indian institute of information technology tiruchirappalli":"tamil nadu",
"indian institute of information technology(iiit) dharwad":"karnataka",
"indian institute of information technology(iiit) kalyani, west bengal":"west bengal",
"indian institute of information technology(iiit) kilohrad, sonepat, haryana":"haryana",
"indian institute of information technology(iiit) kottayam":"kerala",
"indian institute of information technology, agartala":"tripura",
"indian institute of information technology, design & manufacturing, kancheepuram":"tamil nadu",
"indian institute of information technology, vadodara international campus diu (iiitvicd)":"daman and diu",
"international institute of information technology, bhubaneswar":"odisha",
"international institute of information technology, naya raipur":"chhattisgarh",
"indian institute of information technology senapati manipur":"manipur",

// ===== OTHER / GFTI =====
"birla institute of technology, mesra, ranchi":"jharkhand",
"national institute of electronics and information technology, ajmer (rajasthan)":"rajasthan",
"national institute of electronics and information technology, aurangabad (maharashtra)":"maharashtra",
"national institute of electronics and information technology, gorakhpur (up)":"uttar pradesh",
"national institute of electronics and information technology, patna (bihar)":"bihar",
"national institute of electronics and information technology, ropar (punjab)":"punjab",
"pt. dwarka prasad mishra indian institute of information technology, design & manufacture jabalpur":"madhya pradesh",
"assam university, silchar":"assam",
"birla institute of technology, deoghar off-campus":"jharkhand",
"birla institute of technology, patna off-campus":"bihar",
"cu jharkhand":"jharkhand",
"central university of haryana":"haryana",
"central university of jammu":"jammu and kashmir",
"central university of rajasthan, rajasthan":"rajasthan",
"central institute of technology kokrajar, assam":"assam",
"chhattisgarh swami vivekanada technical university, bhilai (csvtu bhilai)":"chhattisgarh",
"gati shakti vishwavidyalaya, vadodara":"gujarat",
"ghani khan choudhary institute of engineering and technology, malda, west bengal":"west bengal",
"gurukula kangri vishwavidyalaya, haridwar":"uttarakhand",
"indian institute of carpet technology, bhadohi":"uttar pradesh",
"indian institute of engineering science and technology, shibpur":"west bengal",
"indian institute of handloom technology(iiht), varanasi":"uttar pradesh",
"indian institute of handloom technology, salem":"tamil nadu",
"institute of chemical technology, mumbai: indian oil odisha campus, bhubaneswar":"odisha",
"institute of engineering and technology, dr. h. s. gour university. sagar (a central university)":"madhya pradesh",
"institute of infrastructure, technology, research and management-ahmedabad":"gujarat",
"islamic university of science and technology kashmir":"jammu and kashmir",
"j.k. institute of applied physics & technology, department of electronics & communication, university of allahabad- allahabad":"uttar pradesh",
"jawaharlal nehru university, delhi":"delhi",
"mizoram university, aizawl":"mizoram",
"national institute of advanced manufacturing technology, ranchi":"jharkhand",
"national institute of food technology entrepreneurship and management, kundli":"haryana",
"national institute of food technology entrepreneurship and management, thanjavur":"tamil nadu",
"north eastern regional institute of science and technology, nirjuli-791109 (itanagar),arunachal pradesh":"arunachal pradesh",
"north-eastern hill university, shillong":"meghalaya",
"puducherry technological university, puducherry":"puducherry",
"punjab engineering college, chandigarh":"chandigarh",
"rajiv gandhi national aviation university, fursatganj, amethi (up)":"uttar pradesh",
"sant longowal institute of engineering and technology":"punjab",
"school of engineering, tezpur university, napaam, tezpur":"assam",
"school of planning & architecture, bhopal":"madhya pradesh",
"school of planning & architecture, new delhi":"delhi",
"school of planning & architecture: vijayawada":"andhra pradesh",
"school of studies of engineering and technology, guru ghasidas vishwavidyalaya, bilaspur":"chhattisgarh",
"shri g. s. institute of technology and science indore":"madhya pradesh",
"shri mata vaishno devi university, katra, jammu & kashmir":"jammu and kashmir",
"university of hyderabad":"telangana"

};




function getPriority(inst){
let name = inst.toLowerCase();
if(NIT_ORDER[name]) return 1000 + NIT_ORDER[name];
if(IIIT_ORDER[name]) return 2000 + IIIT_ORDER[name];
if(OTHER_ORDER[name]) return 3000 + OTHER_ORDER[name];
if(IIT_ORDER[name]) return 4000 + IIT_ORDER[name];
return 9999;
}

function getType(inst){
let n = inst.toLowerCase();
if(n.includes("indian institute of technology")) return "IIT";
if(n.includes("national institute of technology")) return "NIT";
if(n.includes("indian institute of information technology")) return "IIIT";
 if(n.includes("birla institute of technology, mesra"))return "OTHER";
//          if(n.includes("birla institute of technology, mesra"))return "OTHER";   (ONLY GFTI AS BIT MEESRA)
//            return "OTHER";                   (ALL GFTI)
  
}

function populateSearchLists(){

    let instSet = new Set();
    let branchSet = new Set();

    ORIGINAL_DATA.forEach(d=>{
        instSet.add(d["Institute"]);
        branchSet.add(d["Academic Program Name"]);
    });

    let instList = document.getElementById("instList");
    let branchList = document.getElementById("branchList");

    instList.innerHTML="";
    branchList.innerHTML="";

    instSet.forEach(i=>{
        let o=document.createElement("option");
        o.value=i;
        instList.appendChild(o);
    });

    branchSet.forEach(b=>{
        let o=document.createElement("option");
        o.value=b;
        branchList.appendChild(o);
    });
}

function valid(inst, exam){
let t = getType(inst);
if(exam==="ADVANCE") return t==="IIT";
if(exam==="MAINS") return ["NIT","IIIT","OTHER"].includes(t);
return false;
}

/* LOCK */
document.addEventListener("DOMContentLoaded",()=>{
let lock = document.getElementById("lockStatus");

if(lock){
let saved = localStorage.getItem("lockStatus");
if(saved){
lock.value = saved;
removeLocked = (saved === "lock");
}
updateRemove();

// 🔴 RESTORE FILTER VALUES

let savedSeat = localStorage.getItem("seatType");
let savedGender = localStorage.getItem("genderType");
let savedState = localStorage.getItem("homeState");

if(savedSeat) document.getElementById("seatType").value = savedSeat;
if(savedGender) document.getElementById("genderType").value = savedGender;
if(savedState) document.getElementById("homeState").value = savedState;

lock.onchange=()=>{
localStorage.setItem("lockStatus", lock.value);
removeLocked = (lock.value==="lock");
updateRemove();
};
}
});

/* INPUT SAVE */
rank.oninput=()=>localStorage.setItem("rank",rank.value);
exam.onchange=()=>localStorage.setItem("exam",exam.value);

rank.value=localStorage.getItem("rank")||"";
exam.value=localStorage.getItem("exam")||"";

/* SAVE TABLE */
function saveTable(){
localStorage.setItem("previewTableData",previewTable.innerHTML);
}

/* LOAD TABLE */
function loadTable(){
let t=localStorage.getItem("previewTableData");
if(t){
previewTable.innerHTML=t;
updateRemove();
refreshAllButtons();


}
}
loadTable();

/* UNDO LOAD */
let savedUndo = localStorage.getItem("undoStack");
if(savedUndo){
undoStack = JSON.parse(savedUndo);
}

/* UPDATE REMOVE */
function updateRemove(){

document.querySelectorAll("#previewTable tr td:first-child button").forEach(btn=>{
if(btn.innerText.includes("REMOVE")){
btn.disabled = removeLocked;
btn.classList.toggle("locked-btn", removeLocked);
}
});

let undoBtn = document.getElementById("undoBtn");
if(undoBtn){
undoBtn.disabled = removeLocked;
undoBtn.classList.toggle("locked-btn", removeLocked);
}

let previewBtn = document.getElementById("previewBtn");
if(previewBtn){
previewBtn.disabled = removeLocked;
previewBtn.classList.toggle("locked-btn", removeLocked);
}


}

// 🔥 GLOBAL BUTTON COLOR REFRESH (NO LAG)
function refreshAllButtons(){

let main = JSON.parse(localStorage.getItem("mainList")||"[]");

let rows = document.querySelectorAll("#previewTable tr");

rows.forEach((row,i)=>{
    if(i===0) return;

    let instCell = row.children[2];
    let branchCell = row.children[3];
    let btn = row.children[1]?.querySelector("button");

    if(!instCell || !branchCell || !btn) return;

    let inst = instCell.innerText;
    let branch = branchCell.innerText;

    let exists = main.some(m=>m.inst===inst && m.branch===branch);

    if(exists){
        btn.style.background="red";
    }else{
        btn.style.background="lightgreen";
    }
});
}

/* PROCESS */
async function process(rank, exam){
records = {};

for(let file of files){
try{

// ❌ OLD EXCEL CODE REMOVED
// ✅ NEW JSON SOURCE
let rows = JSON_DATA[file];
if(!rows) continue;

let match = file.match(/round (\d+)/i);
let round = match ? parseInt(match[1]) : 0;
let source = file.toLowerCase().includes("jossa") ? "JOSSA" : "CSAB";

// 🔥 JSON LOOP (updated mapping)
for(let i=0;i<rows.length;i++){
let r = rows[i];

let inst = r["Institute"];
let branch = r["Academic Program Name"];
let opening = parseInt(r["Opening Rank"]);
let closing = parseInt(r["Closing Rank"]);

// 🔴 APPLY ALL FILTERS ROW-WISE (FINAL FIX)

let tempRow = [r];

// Seat Type
tempRow = applySeatTypeFilter(tempRow);
if(tempRow.length === 0) continue;

// Gender
tempRow = applyGenderFilter(tempRow);
if(tempRow.length === 0) continue;

// Home State
tempRow = applyHomeStateFilter(tempRow);
if(tempRow.length === 0) continue;

if(!closing || closing < rank) continue;
if(!valid(inst, exam)) continue;

let key = inst+"||"+branch;

if(!records[key]){
records[key] = {inst,branch,JOSSA:{},CSAB:{}};
}

let curr = records[key][source];

if(!curr.round || round < curr.round){
records[key][source] = {opening,closing,round};
}
}

}catch(e){}
}
}

/* BUILD */
function buildData(){
let arr=[];
for(let k in records){
let d=records[k];


arr.push([
d.inst,d.branch,
d.JOSSA.opening||"",d.JOSSA.closing||"",d.JOSSA.round||"",
d.CSAB.opening||"",d.CSAB.closing||"",d.CSAB.round||""
]);
}

arr.sort((a,b)=>{
let p1 = getPriority(a[0]);
let p2 = getPriority(b[0]);
if(p1 !== p2) return p1 - p2;
if(a[0] === b[0]) return a[1].localeCompare(b[1]);
return a[0].localeCompare(b[0]);
});

return arr;
}

/* PREVIEW */

previewBtn.onclick = async ()=>{

if(Object.keys(JSON_DATA).length === 0){
alert("Data loading... please wait 1 second");
return;
}

// 🔴 NO PRE-FILTERING (ROW FILTERING IN process)

let r=parseInt(rank.value);
let e=exam.value;

await process(r,e);
let data=buildData();

// 🔴 APPLY SEARCH ON FINAL DATA

if(window.SEARCH_ACTIVE){

data = data.filter(row=>{

let name = row[0].toLowerCase();
let branchName = row[1].toLowerCase();

let match = true;

if(window.SEARCH_TYPE==="IIT" && !name.includes("indian institute of technology")) match=false;
if(window.SEARCH_TYPE==="NIT" && !name.includes("national institute of technology")) match=false;
if(window.SEARCH_TYPE==="IIIT" && !name.includes("information technology")) match=false;
if(window.SEARCH_TYPE==="GFTI" && (
name.includes("indian institute of technology") ||
name.includes("national institute of technology") ||
name.includes("information technology")
)) match=false;

if(window.SEARCH_INST && !name.includes(window.SEARCH_INST)) match=false;
if(window.SEARCH_BRANCH && !branchName.includes(window.SEARCH_BRANCH)) match=false;

return match;
});

window.SEARCH_ACTIVE = false;
}

    

previewTable.innerHTML="";

let headers=[
"REMOVE","ADD",
"Institute","Branch",
"JoSAA Opening","JoSAA Closing","JoSAA Round",
"CSAB Opening","CSAB Closing","CSAB Round"
];

let tr=document.createElement("tr");
headers.forEach(h=>{
let th=document.createElement("th");
th.innerText=h;
tr.appendChild(th);
});
previewTable.appendChild(tr);

let last="";

data.forEach(r=>{

if(last && last!==r[0]){
let sep=document.createElement("tr");
sep.setAttribute("data-separator","true");

sep.innerHTML=`
<td colspan='11' style='height:40px;background:#eee;position:relative;'>

<button class="removeBlockBtn" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:red;color:white;border:none;padding:5px 10px;cursor:pointer;box-shadow:0 0 10px rgba(0,0,0,0.4);
">
REMOVE_COLLEGE_BLOCK
</button>

</td>
`;
previewTable.appendChild(sep);
sep.querySelector(".removeBlockBtn").onclick = function(){

let current = sep.nextElementSibling;
let toDelete = [];

// 🔴 collect rows
while(current){

if(current.getAttribute && current.getAttribute("data-separator")==="true"){
break;
}

toDelete.push(current);
current = current.nextElementSibling;
}

// 🔴 ALSO include separator itself
toDelete.push(sep);

// 🔴 FULL UNDO RESET (BLOCK = PERMANENT DELETE)
undoStack = [];
localStorage.removeItem("undoStack");

// 🔥 DELETE FROM DOM
toDelete.forEach(r=>r.remove());

// 🔥 SAVE
saveTable();
};
}

last=r[0];

let tr=document.createElement("tr");

// REMOVE
let td1=document.createElement("td");
let rm=document.createElement("button");
rm.innerText="REMOVE";
rm.style.background="red";
rm.style.color="white";
td1.appendChild(rm);
tr.appendChild(td1);



// ADD
let td3=document.createElement("td");
let add=document.createElement("button");
add.innerText="ADD";

// 🔥 CHECK FROM mainList
let main=JSON.parse(localStorage.getItem("mainList")||"[]");

let exists = main.some(m=>m.inst===r[0] && m.branch===r[1]);

if(exists){
    add.style.background="red";
}else{
    add.style.background="lightgreen";
}

td3.appendChild(add);
tr.appendChild(td3);

// DATA
r.forEach(v=>{
let td=document.createElement("td");
td.innerText=v;
tr.appendChild(td);
});

previewTable.appendChild(tr);
});

saveTable();
updateRemove();
};



/* 🔥 AUTO ADD TABLE SYSTEM */

document.getElementById("addTableBtn").onclick = async function(){

let btn = this;
btn.disabled = true;

let rows = Array.from(document.querySelectorAll("#previewTable tr"));

// header skip
rows = rows.slice(1);

// valid rows only
let validRows = rows.filter(r => r.children.length > 2);

for(let i=0; i<validRows.length; i++){

    let row = validRows[i];

    let addBtn = row.children[1]?.querySelector("button");

    if(addBtn){

        // same manual click effect
        addBtn.click();

        // delay so mechanism completes properly
        await new Promise(res => setTimeout(res, 3));
    }
}

// last row complete hone ke baad hi alert
alert("ALL ROWS ADDED");

btn.disabled = false;

};


/* UNDO */
function undoRemove(){

if(undoStack.length === 0) return;

let last = undoStack.pop();
localStorage.setItem("undoStack", JSON.stringify(undoStack));

// 🔴 CASE 1: REMOVE undo → restore row
if(last.type === "REMOVE"){
    let temp = document.createElement("table");
    temp.innerHTML = "<tbody>" + last.html + "</tbody>";

    let restoredRow = temp.querySelector("tr");
    let table = document.querySelector("#previewTable");

    if(table.rows.length > last.index){
        table.insertBefore(restoredRow, table.rows[last.index]);
    }else{
        table.appendChild(restoredRow);
    }

    saveTable();
    updateRemove();
}



// 🔴 CASE 2: ADD undo → remove from mainList
if(last.type === "ADD"){

    let main = JSON.parse(localStorage.getItem("mainList")||"[]");

    let index = main.findIndex(m=>m.inst===last.inst && m.branch===last.branch);

    if(index !== -1){
        main.splice(index,1);
    }

    localStorage.setItem("mainList", JSON.stringify(main));

    // 🔥 BUTTON COLOR BACK TO GREEN
    let rows = document.querySelectorAll("#previewTable tr");

    rows.forEach((row,i)=>{
        if(i===0) return;

        let instCell = row.children[2];
        let branchCell = row.children[3];
        let btn = row.children[1]?.querySelector("button");

        if(!instCell || !branchCell || !btn) return;

        let inst = instCell.innerText;
        let branch = branchCell.innerText;

        if(inst === last.inst && branch === last.branch){
            btn.style.background="lightgreen";
        }
    });
}
}

/* 🔥 FINAL EVENT SYSTEM (FIXED) */
document.addEventListener("click", function(e){

if(e.target.innerText.trim().includes("REMOVE")){
if(removeLocked) return;

let row = e.target.closest("tr");
let index = Array.from(row.parentNode.children).indexOf(row);

undoStack.push({ 
    type: "REMOVE",
    html: row.outerHTML, 
    index: index 
});
localStorage.setItem("undoStack", JSON.stringify(undoStack));

row.remove();
saveTable();
// 🔥 GLOBAL SYNC
refreshAllButtons();
}

if(e.target.innerText.trim().includes("ADD")){
let row = e.target.closest("tr");

let inst=row.children[2].innerText;
let branch=row.children[3].innerText;

// 🔥 NO POSITION INPUT ANYMORE
let pos = null;

let main=JSON.parse(localStorage.getItem("mainList")||"[]");

if(main.some(m=>m.inst===inst && m.branch===branch)) return;

// 🔥 ALWAYS ADD AT END
main.push({inst,branch});

 undoStack.push({
 type: "ADD",
 inst: inst,
 branch: branch
});
localStorage.setItem("undoStack", JSON.stringify(undoStack));
localStorage.setItem("mainList",JSON.stringify(main));
// 🔥 GLOBAL SYNC
refreshAllButtons();

// 🔥 BUTTON COLOR CHANGE

}

});

document.getElementById("searchBtn").onclick = function(){

let type = document.getElementById("typeSearch").value;
let inst = document.getElementById("instSearch").value.toLowerCase();
let branch = document.getElementById("branchSearch").value.toLowerCase();

    // 🔥 SAVE SEARCH STATE
localStorage.setItem("typeSearch", type);
localStorage.setItem("instSearch", inst);
localStorage.setItem("branchSearch", branch);
    
let tempData = [...ORIGINAL_DATA];

// 🔥 Apply all filters first
tempData = applySeatTypeFilter(tempData);
tempData = applyGenderFilter(tempData);
tempData = applyHomeStateFilter(tempData);

// 🔴 SAFE SEARCH STORE (no filtering here)

window.SEARCH_ACTIVE = true;
window.SEARCH_TYPE = type;
window.SEARCH_INST = inst;
window.SEARCH_BRANCH = branch;

previewBtn.click();
};

function resetSearch(){

document.getElementById("typeSearch").value="";
document.getElementById("instSearch").value="";
document.getElementById("branchSearch").value="";

localStorage.removeItem("typeSearch");
localStorage.removeItem("instSearch");
localStorage.removeItem("branchSearch");
    
window.SEARCH_ACTIVE = false;
window.SEARCH_TYPE = "";
window.SEARCH_INST = "";
window.SEARCH_BRANCH = "";

previewBtn.click();
}

document.getElementById("clearFilters").onclick = resetSearch;

document.getElementById("cleanTableBtn").onclick = function(){

let table = document.getElementById("previewTable");
if(!table) return;

// 🔴 CLEAR UNDO STACK (important)
undoStack = [];
localStorage.removeItem("undoStack");

let rows = Array.from(table.querySelectorAll("tr"));

let cleaned = [];
let i = 0;

while(i < rows.length){

let row = rows[i];
let isSeparator = row.children.length === 1 && row.children[0].colSpan == 11

if(!isSeparator){
cleaned.push(row);
i++;
continue;
}

// 🔴 START OF GROUP
let groupStart = i;

while(i < rows.length && rows[i].children.length === 1 && rows[i].children[0].colSpan == 11){
i++;
}

let groupEnd = i - 1;

// 🔴 CHECK POSITION
let isTop = groupStart === 1; // header ke baad
let isEnd = groupEnd === rows.length - 1;

// 🔴 APPLY RULES

// TOP → remove all
if(isTop){
continue;
}

// END → remove all
if(isEnd){
continue;
}

// MIDDLE → keep only last
cleaned.push(rows[groupEnd]);

}

// 🔴 rebuild table
table.innerHTML="";
cleaned.forEach(r=>table.appendChild(r));

// 🔴 SAVE (IMPORTANT for refresh persistence)
saveTable();

};

// 🔥 LIVE SYNC (NO LAG - STORAGE EVENT)
window.addEventListener("storage", function(e){

    if(e.key !== "mainList") return;

    let main = JSON.parse(localStorage.getItem("mainList")||"[]");

    let rows = document.querySelectorAll("#previewTable tr");

    rows.forEach((row,i)=>{
        if(i===0) return;

        let instCell = row.children[2];
        let branchCell = row.children[3];
        let btn = row.children[1]?.querySelector("button");

        if(!instCell || !branchCell || !btn) return;

        let inst = instCell.innerText;
        let branch = branchCell.innerText;

        let exists = main.some(m=>m.inst===inst && m.branch===branch);

        if(exists){
            btn.style.background="red";
        }else{
            btn.style.background="lightgreen";
        }
    });

});
