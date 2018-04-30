

/*
ADD
SUB
LD reg << mem
SW reg >> mem

*/


//hardware resources
var resources = {
	adders: 2,
	multipliers: 2,
	LDalu: 2,
	RS1: 3,
	RS2: 3,
	LB: 3,
	SB: 3
}
var usedResources = {
	adders: 0,
	multipliers: 0,
	LDalu: 0,
	RS1: 0,
	RS2: 0,
	LB: 0,
	SB: 0
}
var instInfo = {
	ADD: {cyc: 2, OP: "ADD", nOperands: 2, appr: "+", unit: "RS1"},
	SUB: {cyc: 2, OP: "SUB", nOperands: 2, appr: "-", unit: "RS1"},
	MUL: {cyc: 2, OP: "MUL", nOperands: 2, appr: "*", unit: "RS2"},
	LD: {cyc: 2, OP: "LD", nOperands: 1, appr: "L", unit: "LB"},
	SW: {cyc: 2, OP: "SW", nOperands: 1, appr: "S", unit: "SB"}
};


var IQtable = $("#IQtable");
var IQtableCont = new Queue();
IQtableCont.push("ADD F0, F2, F3");
IQtableCont.push("LD F0, F2(1000)");
IQtableCont.push("ADD F0, F2, F3");


//registers
var numOfReg = 16;
var regName = "F";
var RFtable = $("#RFtable");
var RFtableCont = [];




//RAT
var RATtable = $("#RATtable");
var RATtableCont = [];

//initialize RF and RAT
for(let i = 0; i < numOfReg; i++){
	RFtableCont[regName + i] = 0;
	RATtableCont[regName + i] = "-";
}


//reservation stations
var ResStation1Table = $("#ResStation1Table");
var ResStation1TableCont = [];

var ResStation2Table = $("#ResStation2Table");
var ResStation2TableCont = [];



//load buffer
var LoadBufferTable = $("#LoadBufferTable");
var LoadBufferTableCont = [];

//store buffer
var StoreBufferTable = $("#StoreBufferTable");
var StoreBufferTableCont = [];


//initialize rs, lb and sb
for(let i = 0; i < resources.RS1; i++){
	ResStation1TableCont[i] = {isBusy: false, OP: "-", appr: "-", rs: "-", rt: "-", tag: "RS1_" + i};
}
for(let i = 0; i < resources.RS2; i++){
	ResStation2TableCont[i] = {isBusy: false, OP: "-", appr: "-", rs: "-", rt: "-", tag: "RS2_" + i};
}
for(let i = 0; i < resources.LB; i++){
	LoadBufferTableCont[i] = {isBusy: false, rs: "-", tag: "LB_" + i};
}
for(let i = 0; i < resources.SB; i++){
	StoreBufferTableCont[i] = {isBusy: false, rs: "-", rt: "-", tag: "SB_" + i};
}


//Memory
var Memory = [];




function updateIQtable () {
	IQtable.html("");
	var IQtableContArr = IQtableCont.retArray();
	IQtableContArr.forEach(function(el) {
		IQtable.prepend("<tr><td>" + el + "</td></tr>");
	});
}

function updateRFtable() {
	RFtable.html("");
	for(let reg in RFtableCont){
		RFtable.append("<tr><td> " + reg + "</td><td>" + RFtableCont[reg] + "</td></tr>");
	}
}

function updateRATtable() {
	RATtable.html("");
	for(let reg in RFtableCont){
		RATtable.append("<tr><td> " + reg +
		 "</td><td>" +   RATtableCont[reg] + "</td></tr>");

	}
}

function updateRS1(){
	ResStation1Table.html("");
	for(let i = 0; i < resources.RS1; i++){
		ResStation1Table.append("<tr><td> " +
			ResStation1TableCont[i].appr  + "</td><td>" +
			ResStation1TableCont[i].rs + "</td><td>" +
			ResStation1TableCont[i].rt +  "</td></tr>");
	}
}
function updateRS2(){
	ResStation2Table.html("");
	for(let i = 0; i < resources.RS2; i++){
		ResStation2Table.append("<tr><td> " +
			ResStation2TableCont[i].appr  + "</td><td>" +
			ResStation2TableCont[i].rs + "</td><td>" +
			ResStation2TableCont[i].rt +  "</td></tr>");
	}
}
/*
for(let i = 0; i < resources.lb; i++){
	LoadBufferTableCont[i] = {isBusy: false, rs: "-"};
}
for(let i = 0; i < resources.sb; i++){
	StoreBufferTableCont[i] = {isBusy: false, rs: "-", rt: "-"};
}*/
function updateLB(){
	LoadBufferTable.html("");
	for(let i = 0; i < resources.LB; i++){
		LoadBufferTable.append("<tr><td> " + LoadBufferTableCont[i].rs  + "</td></tr>");
	}
}
function updateSB(){
	StoreBufferTable.html("");
	for(let i = 0; i < resources.SB; i++){
		StoreBufferTable.append("<tr><td> " +
		 StoreBufferTableCont[i].rs  + "</td><td>" +
		 StoreBufferTableCont[i].rt + "</td></tr>");
	}
}




/*
*****************
=     ISSUE     =
*****************
1) Get inst. from IQ
2) Get inputs from RF ot RAT
3) Issue the inst in a free RS
4) Tag destination reg (add to RAT)





*/
// TO BE CONTINUED
function issueInst(inst){

/*
	//syntax for inst: OP rd, rs, rt
	var OP = inst.substring(0, inst.indexOf(" "));
	//console.log("_"+ OP + "_");

	var rd = inst.substring(inst.indexOf(" ") + 1 , inst.indexOf(", "));
	//console.log("_"+ rd + "_");

	var rs = inst.substring(inst.indexOf(", ") + 2 , inst.indexOf(",", inst.indexOf(", ") + 2));
	//console.log("_"+ rs + "_");

	if(OP != instInfo.LD.OP && OP != instInfo.SW.OP){
		var rt = inst.substring(inst.lastIndexOf(", ") + 2);
		//console.log("_"+ rt + "_");
	}*/


	if(instInfo[inst.OP].unit == "RS1"){

		if(addInstToResSation(ResStation1TableCont, inst)){
			updateRS1();
			updateRATtable();

		}
	}


	

}

function addInstToResSation(RS, inst){

	var unit = instInfo[inst.OP].unit;
	if(unit == "RS1" || unit == "RS2" ){
		let isAdded = false;

		if(resources[unit] > usedResources[unit]){
			for(let i = 0; i < resources[unit] && !isAdded; i++){
				if(!RS[i].isBusy){
					isAdded = true;

					// 2) Get inputs from RF ot RAT
					// 3) Issue the inst in a free RS

					RS[i].isBusy = true;
					RS[i].OP = inst.OP;
					RS[i].appr = instInfo[inst.OP].appr;
					RS[i].rs = findRegValue(inst.rs);
					RS[i].rt = findRegValue(inst.rt);
					/*
					RS[i] = {isBusy: true,
						OP: inst.OP,
						appr: instInfo[inst.OP].appr,
						rs: findRegValue(inst.rs),
						rt: findRegValue(inst.rt),
					};*/

					// 4) Tag destination reg (add to RAT)
					RATtableCont[inst.rd] = RS[i].tag;

					console.log(RS[i]);
					usedResources[unit]++;
				}
			}
		}else {
			console.log("All " + unit + " are used")
		}
		
		return isAdded;
	}

}
var tempInst = {isValid: true,
	OP: "ADD",
	rd: "F0",
	rs: "F1",
	rt: "F2"
}
issueInst(tempInst);


//will return a tag if found in RAT or a value from RF
function findRegValue(reg){
	console.log("2>> " + RATtableCont[reg]);
	console.log("3>> " + reg);

	return (RATtableCont[reg] == "-")? RFtableCont[reg] : RATtableCont[reg];
}




function Queue(){
	var content = [];
	var front = 0;
	var rear = -1;
	var numOfElements = 0;
	const maxNumOfElements = 1000;

	this.isFull = function(){
		return numOfElements == maxNumOfElements;
	}

	this.isEmpty = function(){
		return numOfElements == 0;
	}

	this.push = function(el){
		if(!this.isFull()){
			numOfElements++;
			rear = (rear + 1) % maxNumOfElements;
			content[rear] = el;
			//console.log("push " + el);
		}else{
			//console.log("queue is full");
			return null;
		}
		
	}

	this.pop = function(){
		if(!this.isEmpty()){
			numOfElements--;
			var oldFront = content[front];
			//console.log("front " + front);
			front = (front + 1) % maxNumOfElements;
			return content[oldFront];
		}else {
			//console.log("queue is empty");
		}
		
	}

	this.retArray = function(){
		var arr = [];

		for(let i = front; i < front + rear + 1; i++){
			//console.log(content[i]);
			arr.push(content[i]);
		}

		return arr;
	}
}

updateIQtable();

updateRFtable();

updateRATtable();

updateRS1();
updateRS2();
updateLB();
updateSB();

/*
var q = new Queue();

q.push(1);
q.push(2);
q.push(3);
q.push(4);
q.push(5);
q.push(1);
q.push(2);
q.push(3);
q.push(4);
q.push(5);

console.log(q.retArray());
*/




/*let sum = (a, b) => a + b;
console.log(sum(5 , 4));*/








/*

ALLOWED syntax
==============
OP rd, rs, rt
OP rd, rs
OP rd, rs(int)
OP rd(int), rs
==============

note: rd, rs and rt should be

first char = the variable called regName
the number after the char should be inside [0, numOfReg[

ex: F0, F5, F11


return true if the input string is one of the formats above, return false otherwise

*/
function isInstValid(inst){
}



