let preferences=[];
let isFrozen = JSON.parse(localStorage.getItem("freezeState")) || false;
const leftTable=document.querySelector("#leftTable tbody");
const rightTable=document.querySelector("#rightTable tbody");

const availableCount=document.getElementById("availableCount");
const filledCount=document.querySelector(".filledCount");

const typeSearch=document.getElementById("typeSearch");
const instSearch=document.getElementById("instSearch");
const branchSearch=document.getElementById("branchSearch");

const instList=document.getElementById("instList");
const branchList=document.getElementById("branchList");

let data=[];
let filteredData=[];

/* =========================
   LOAD DATA
========================= */
fetch("data.json")
.then(r=>r.json())
.then(json=>{
data=json;
filteredData=[...data];
populateLists();
loadSaved();
// 🔥 SAFE SYNC: only run when NOT frozen
if(!isFrozen){
loadMainList();
}
renderLeft();
renderRight();
});


/* =========================
   LOAD MAIN LIST FROM 2ND PAGE (FIXED)
========================= */
function loadMainList(){

// 🔥 IMPORTANT FIX: only ADD, never REMOVE existing preferences

let main = JSON.parse(localStorage.getItem("mainList")||"[]");

main.forEach((m,i)=>{


if(preferences.some(p=>p.inst===m.inst && p.branch===m.branch)) return;

if(i>=0 && i<=preferences.length){
preferences.splice(i,0,{inst:m.inst,branch:m.branch});
}else{
preferences.push({inst:m.inst,branch:m.branch});
}

});

}

/* =========================
   DROPDOWN LISTS
========================= */
function populateLists(){

let instSet=new Set();
let branchSet=new Set();

data.forEach(d=>{
instSet.add(d.inst);
branchSet.add(d.branch);
});

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

/* =========================
   LEFT TABLE
========================= */
function renderLeft(){

leftTable.innerHTML="";
let last="";

let main = JSON.parse(localStorage.getItem("mainList")||"[]");

filteredData.forEach(item=>{

if(last!=="" && last!==item.inst){

let sep=document.createElement("tr");
sep.innerHTML="<td colspan='4' style='background:lightyellow;height:8px'></td>";
leftTable.appendChild(sep);

}

last=item.inst;

let row=document.createElement("tr");

let already =
preferences.some(p=>p.inst===item.inst && p.branch===item.branch)

row.innerHTML=`
<td>${item.inst}</td>
<td>${item.branch}</td>
<td contenteditable="true"></td>
<td><button class="addBtn" ${already?"disabled":""}>Add</button></td>
`;

if(!already){

row.querySelector(".addBtn").onclick=()=>{

let choice=row.children[2].textContent.trim();
addPref(item.inst,item.branch,choice);

};

}

leftTable.appendChild(row);

});

availableCount.textContent="Total Available Choices: "+filteredData.length;

}

/* =========================
   ADD PREF
========================= */
function addPref(inst,branch,choice){
if(isFrozen) return;

if(preferences.some(p=>p.inst===inst && p.branch===branch)) return;

let pos=parseInt(choice);

if(pos && pos>0 && pos<=preferences.length){
preferences.splice(pos-1,0,{inst,branch});
}else{
preferences.push({inst,branch});
}

renderRight();
renderLeft();
autoSave();

}

/* =========================
   RIGHT TABLE
========================= */
function renderRight(){

rightTable.innerHTML="";

preferences.forEach((p,i)=>{

let row=document.createElement("tr");

row.innerHTML=`
<td>${p.inst}</td>
<td>${p.branch}</td>
<td><input type="number" value="${i+1}" min="1"></td>
<td><button class="deleteBtn" ${isFrozen?"disabled":""}>Delete</button></td>
`;

row.querySelector(".deleteBtn").onclick=()=>{

if(isFrozen) return;

preferences.splice(i,1);
renderRight();
renderLeft();
autoSave();

};

row.querySelector("input").onchange=(e)=>{

if(isFrozen){
renderRight();
return;
}

let n=parseInt(e.target.value);

if(!n || n<1 || n>preferences.length){
renderRight();
return;
}

let item=preferences.splice(i,1)[0];
preferences.splice(n-1,0,item);

renderRight();
autoSave();

};

rightTable.appendChild(row);

});

filledCount.textContent="Total Filled Choices: "+preferences.length;

}

/* =========================
   AUTO SAVE
========================= */
function autoSave(){
localStorage.setItem("prefs",JSON.stringify(preferences));
}

/* =========================
   LOAD SAVED
========================= */
function loadSaved(){

let s=localStorage.getItem("prefs");

if(s){
preferences=JSON.parse(s);
}

}

/* =========================
   SEARCH
========================= */
document.getElementById("searchBtn").onclick=()=>{

let t=typeSearch.value.toLowerCase();
let i=instSearch.value.toLowerCase();
let b=branchSearch.value.toLowerCase();

filteredData=data.filter(d=>{
return(
d.type.toLowerCase().includes(t) &&
d.inst.toLowerCase().includes(i) &&
d.branch.toLowerCase().includes(b)
);
});

renderLeft();

};

document.getElementById("clearFilters").onclick=()=>{

typeSearch.value="";
instSearch.value="";
branchSearch.value="";

filteredData=[...data];
renderLeft();

};

/* =========================
   DELETE ALL
========================= */
document.getElementById("deleteAllBtn").onclick=()=>{

if(isFrozen) return;

preferences=[];
localStorage.removeItem("mainList");
renderRight();
renderLeft();
autoSave();

};
/* =========================
   DOWNLOAD (ONLY MODIFIED PART)
========================= */
function downloadPDF(){

let rows = document.querySelectorAll("#rightTable tbody tr");

if(rows.length === 0){
alert("No choices to show");
return;
}

let html = `<html>
<head>
<title>JoSAA Choice Preferences</title>

<style>
body{font-family:Arial;padding:20px;}

table{border-collapse:collapse;width:100%;}

th{
background:orange;
color:black;
font-size:20px;
height:30px;
border:3px solid black;
text-align:center;
}

td{
font-size:18px;
height:30px;
border:3px solid black;
text-align:center;
}
</style>

</head>

<body>

<h2>JoSAA Choice Preferences</h2>

<table>

<tr>
<th>Choice No</th>
<th>Institute</th>
<th>Branch</th>
</tr>`;

rows.forEach((r)=>{

let inst = r.children[0].innerText;
let branch = r.children[1].innerText;
let choice = r.children[2].querySelector("input").value;

html += `
<tr>
<td>${choice}</td>
<td>${inst}</td>
<td>${branch}</td>
</tr>`;

});

html += `</table>

</body>
</html>`;

let win = window.open("");
win.document.write(html);
win.document.close();

}

const freezeSelect = document.getElementById("freezeSelect");

/* 🔥 LOAD STATE ON PAGE LOAD */
if(isFrozen){
freezeSelect.value = "freeze";
freezeSelect.style.background = "#8B0000";   // 🔴 FREEZE = RED
freezeSelect.style.color = "white";
}else{
freezeSelect.value = "float";
freezeSelect.style.background = "darkgreen"; // 🟢 FLOAT = GREEN
freezeSelect.style.color = "white";
}

/* 🔥 ON CHANGE */
freezeSelect.onchange = () => {

if(freezeSelect.value === "freeze"){
isFrozen = true;
freezeSelect.style.background = "#8B0000";   // 🔴 FREEZE
freezeSelect.style.color = "white";
}else{
isFrozen = false;
freezeSelect.style.background = "darkgreen"; // 🟢 FLOAT
freezeSelect.style.color = "white";
}

localStorage.setItem("freezeState", JSON.stringify(isFrozen));

renderRight();
renderLeft();

};
