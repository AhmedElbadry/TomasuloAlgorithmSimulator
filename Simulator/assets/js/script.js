

/*
ADD
SUB
LD reg << mem
SW reg >> mem

*/

var cycleNumber = 1;
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
var IQ = new Queue();


IQtableCont.push("ADD F0, F2, F3");
IQtableCont.push("LD F0, F2(1000)");
IQtableCont.push("ADD F0, F2, F3");
IQtableCont.push("ADD F0, F2, F3");
IQtableCont.push("LD F0, F2(1000)");
IQtableCont.push("ADD F0, F2, F3");
IQtableCont.push("ADD F0, F2, F3");
IQtableCont.push("LD F0, F2(1000)");
IQtableCont.push("ADD F0, F2, F3");

IQ.push(
	{	isValid: true,
		OP: "SW",
		rd: "F0",
		rs: "F1",
		addrd: 0,
		addrs: 0,
		addrt: 0
	}
);

IQ.push(
	{	isValid: true,
		OP: "LD",
		rd: "F1",
		rs: "F2",
		addrd: 0,
		addrs: 0,
		addrt: 0
	}
);
IQ.push(
	{	isValid: true,
		OP: "ADD",
		rd: "F2",
		rs: "F3",
		rt: "F4",
		addrd: 0,
		addrs: 0,
		addrt: 0
	}
);
IQ.push(
	{	isValid: true,
		OP: "SUB",
		rd: "F3",
		rs: "F3",
		rt: "F4",
		addrd: 0,
		addrs: 0,
		addrt: 0
	}
);

IQ.push(
	{	isValid: true,
		OP: "MUL",
		rd: "F4",
		rs: "F3",
		rt: "F4",
		addrd: 0,
		addrs: 0,
		addrt: 0
	}
);


//registers
var numOfReg = 16;
var regName = "F";
var regName2 = "R";
var RFtable = $("#RFtable");
var RFtableCont = [];




//RAT
var RATtable = $("#RATtable");
var RATtableCont = [];

//initialize RF and RAT
for(let i = 0; i < numOfReg; i++){
	RFtableCont[regName + i] = i;
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
	ResStation1TableCont[i] = {isBusy: false, OP: "-", appr: "-", rs: "-", rt: "-", tag: "RS1_" + i, addedInCyc: 0};
}
for(let i = 0; i < resources.RS2; i++){
	ResStation2TableCont[i] = {isBusy: false, OP: "-", appr: "-", rs: "-", rt: "-", tag: "RS2_" + i, addedInCyc: 0};
}
for(let i = 0; i < resources.LB; i++){
	LoadBufferTableCont[i] = {isBusy: false, rs: "-", tag: "LB_" + i, addrs: 0, addedInCyc: 0};
}
for(let i = 0; i < resources.SB; i++){
	StoreBufferTableCont[i] = {isBusy: false, rd: "-", rs: "-", tag: "SB_" + i, addrs: 0, addedInCyc: 0};
}


//Memory
var Memory = [];




function updateIQtable () {
	IQtable.html("");
	var IQtableContArr = IQtableCont.retArray();
	IQtableContArr.forEach(function(el) {
		IQtable.prepend("<tr><td>" + ((el)? el : "-") + "</td></tr>");
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
		 StoreBufferTableCont[i].rd  + "</td><td>" +
		 StoreBufferTableCont[i].rs + "</td></tr>");
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

function issueInst(){
	var inst = IQ.front();
	var isAdded = false;
	console.log(">>>  " + instInfo[inst.OP].unit)
	if(instInfo[inst.OP].unit == "RS1"){

		if(addInstToResSation(ResStation1TableCont, inst)){
			updateRS1();
			isAdded = true;
		}
	}else if(instInfo[inst.OP].unit == "RS2"){
		if(addInstToResSation(ResStation2TableCont, inst)){
			updateRS2();
			isAdded = true;
		}
	}else if (instInfo[inst.OP].unit == "LB"){
		
		if(addInstToResSation(LoadBufferTableCont, inst)){
			updateLB();
			isAdded = true;
		}

	}else if (instInfo[inst.OP].unit == "SB") {
			if(addInstToResSation(StoreBufferTableCont, inst)){
			updateSB();
			isAdded = true;
		}
	}

	if(isAdded){
		IQtableCont.pop();
		IQ.pop();

		updateIQtable();
		updateRATtable();
	}

}
function addInstToResSation(RS, inst){

	var unit = instInfo[inst.OP].unit;
	var isAdded = false;

	if(resources[unit] < usedResources[unit]){
		console.log("There are no " + unit + "available");
	 	return false;
	}

	if(unit == "RS1" || unit == "RS2" ){

		for(var i = 0; i < resources[unit] && !isAdded; i++){
			if(!RS[i].isBusy){
				isAdded = true;

				// 2) Get inputs from RF ot RAT
				// 3) Issue the inst in a free RS

				RS[i].OP = inst.OP;
				RS[i].appr = instInfo[inst.OP].appr;
				RS[i].rs = findRegValue(inst.rs);
				RS[i].rt = findRegValue(inst.rt);

				// 4) Tag destination reg (add to RAT)
				RATtableCont[inst.rd] = RS[i].tag;

				console.log(RS[i]);
				usedResources[unit]++;
			}
		}

	}else if (unit == "LB"){
		for(var i = 0; i < resources[unit] && !isAdded; i++){
			if(!RS[i].isBusy){
				isAdded = true;

				// 2) Get inputs from RF ot RAT
				// 3) Issue the inst in a free RS

				RS[i].rs = findRegValue(inst.rs);
				RS[i].addrs = inst.addrs;

				// 4) Tag destination reg (add to RAT)
				RATtableCont[inst.rd] = RS[i].tag;

				console.log(RS[i]);
				usedResources[unit]++;
			}
		}
	}else if(unit == "SB"){
		for(var i = 0; i < resources[unit] && !isAdded; i++){
			if(!RS[i].isBusy){
				isAdded = true;

				// 2) Get inputs from RF ot RAT
				// 3) Issue the inst in a free RS

				
				RS[i].rd = findRegValue(inst.rs);
				RS[i].rs = findRegValue(inst.rs);
				RS[i].addrs = inst.addrs;

				// 4) Tag destination reg (add to RAT)
				RATtableCont[inst.rd] = RS[i].tag;

				console.log(RS[i]);
				usedResources[unit]++;
			}
		}

	}

	if(isAdded){
		RS[i - 1].isBusy = true;
		RS[i - 1].addedInCyc = cycleNumber;
		console.log(RS[i - 1]);
	}

	return isAdded;

}

issueInst();
issueInst();
issueInst();
issueInst();
issueInst();

/*
=============== END ISSUE ================
*/



cycleNumber++;


/*
*******************
=     DISPATCH     =
*******************
*/

function dispatch(){
	
}





/*
*******************
=     CAPTURE     =
*******************
*/

function capture(){

}








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
			console.log("queue is full");
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
			console.log("queue is empty");
		}
		
	}

	this.front = function(){
		if(!this.isEmpty()){
			return content[front];
		}else {
			console.log("queue is empty");
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
	var ret = {
		isValid: false,
		OP: "",
		rd: "",
		rs: "",
		rt: "",
		addrd: 0,
		addrs: 0,
		addrt: 0
	};

	var myins;
	var counter = -1;
	var temp = inst.substring(0, inst.indexOf(" "));
	var temp2;
	var new_ins = inst.substring(inst.indexOf(" ") + 1);
	var RorF;
	var open = false;

	for(var instType in instInfo){
		if(instInfo[instType].OP == temp){
			ret.OP = temp;
			myins = instType;
			break;
		}
	}

	if(ret.OP !== temp){
		console.log("instruction is not valid\n");
		return ret;
	}

	while(true){
		counter++;
        if(new_ins.indexOf(" ") == -1)
        	temp = new_ins;
        else
        	temp = new_ins.substring(0 , new_ins.indexOf(" "));

        if(temp[0] == '('){
        	open = true;
	        temp = temp.substring(1);
        }

        if(temp[0] !== regName && temp[0] !== regName2 && '0123456789'.indexOf(temp[0]) == -1){
        	console.log("Register name is not valid\n");
        	return ret;
        }

        if(temp[0] == regName || temp[0] == regName2){
        	RorF = temp[0];
	        temp = temp.substring(1);
	        temp2 = "";
	        while('0123456789'.indexOf(temp[0]) !== -1){
	        	temp2 += temp[0];
	        	temp = temp.substring(1);
	        }

	        if( (parseInt(temp2) >= numOfReg) || ((temp[0] == ')') !== open) || (temp !== "," && temp !== "" && !open) || (temp == "," && new_ins.indexOf(" ") == -1) || (temp == "" && new_ins.indexOf(" ") !== -1) ){
	        	console.log("Instruction Error!\n");
	        	return ret;
	        }

	        open = false;

	        if(!counter)
	        	ret.rd = RorF + temp2;
	        else if (counter == 1)
	        	ret.rs = RorF + temp2;
	        else
	        	ret.rt = RorF + temp2;
        }

        else if('0123456789'.indexOf(temp[0]) !== -1){
	        temp2 = "";
	        while('0123456789'.indexOf(temp[0]) !== -1){
	        	temp2 += temp[0];
	        	temp = temp.substring(1);
	        }

	        if( ((temp[0] == ')') !== open) || (temp !== "," && temp !== "" && !open && temp[0] !== '(') || (temp == "," && new_ins.indexOf(" ") == -1) || (temp == "" && new_ins.indexOf(" ") !== -1) ){
	        	console.log("Instruction Error!\n");
	        	return ret;
	        }

	        open = false;

	        if(!counter)
	        	ret.addrd = parseInt(temp2);
	        else if (counter == 1)
	        	ret.addrs = parseInt(temp2);
	        else
	        	ret.addrt = parseInt(temp2);

	        if(temp[0] == '('){
	        	new_ins = new_ins.substring(new_ins.indexOf('('));
	        	counter--;
	        	continue;
	        }
        }

        if(new_ins.indexOf(" ") == -1)
        	break;
        else
        	new_ins = new_ins.substring(new_ins.indexOf(" ") + 1);
	}

	if(instInfo[myins].nOperands !== counter){
        	console.log("operands count error!\n");
        	return ret;
	}

	ret.isValid = true;
	return ret;
}

console.log(isInstValid("ADD F0, F2, F3"));

