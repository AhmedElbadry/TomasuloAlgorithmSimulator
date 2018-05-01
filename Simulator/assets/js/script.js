

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
	SUB: {cyc: 3, OP: "SUB", nOperands: 2, appr: "-", unit: "RS1"},
	MUL: {cyc: 7, OP: "MUL", nOperands: 2, appr: "*", unit: "RS2"},
	DIV: {cyc: 10, OP: "DIV", nOperands: 2, appr: "/", unit: "RS2"},
	LD: {cyc: 5, OP: "LD", nOperands: 1, appr: "L", unit: "LB"},
	SW: {cyc: 6, OP: "SW", nOperands: 1, appr: "S", unit: "SB"}
};


var IQtable = $("#IQtable");
var IQtableCont = new Queue();
var IQ = new Queue();

/*
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
		OP: "ADD",
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
IQ.push(
	{	isValid: true,
		OP: "DIV",
		rd: "F10",
		rs: "F13",
		rt: "F14",
		addrd: 0,
		addrs: 0,
		addrt: 0
	}
);

*/

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

/*
results

schema = {
	res: int,
	toBeWrittenAfter: int,
	addedInCyc: int,
	tag
}

*/
var dispRS1q = new Queue();
var dispRS2q = new Queue();
var dispLBq = new Queue();
var dispSBq = new Queue();


/*
Write back
*/
var WBq = new Queue();

//Memory
var Memory = [];

//initialize memory
for (var i = 0; i < 20000; i++) {
	Memory[i] = i + 1;
}




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




function updateAll(){
	updateIQtable();

	updateRFtable();

	updateRATtable();

	updateRS1();
	updateRS2();
	updateLB();
	updateSB();
}

updateAll();




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
	var instString = IQtableCont.front();

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

				console.log(RS[i]);

				// 4) Tag destination reg (add to RAT)
				RATtableCont[inst.rd] = RS[i].tag;

				usedResources[unit]++;
			}
		}
	}else if(unit == "SB"){
		for(var i = 0; i < resources[unit] && !isAdded; i++){
			if(!RS[i].isBusy){
				isAdded = true;

				// 2) Get inputs from RF ot RAT
				// 3) Issue the inst in a free RS

				
				RS[i].rd = findRegValue(inst.rd);
				RS[i].rs = findRegValue(inst.rs);
				RS[i].addrs = inst.addrs;



				// 4) Tag destination reg (add to RAT)
				//RATtableCont[inst.rd] = RS[i].tag;

				usedResources[unit]++;
			}
		}

	}

	if(isAdded){
		RS[i - 1].isBusy = true;
		RS[i - 1].addedInCyc = cycleNumber;
		console.log(RS[i - 1]);

		console.log("Issue " + cycleNumber + ":  the inst: " + instString + " is added to " + unit );
		
	}else {
		console.log("Issue " + cycleNumber + ":  the inst: " + instString + " is not added to " + unit );
	}


	return isAdded;

}

//will return a tag if found in RAT or a value from RF
function findRegValue(reg){
	return (RATtableCont[reg] == "-")? RFtableCont[reg] : RATtableCont[reg];
}




/*
=============== END ISSUE ================
*/



/*
********************
=     DISPATCH     =
********************

{
	res: int,
	toBeWrittenAfter: int;
	addedInCyc: int
}
*/

function dispatch(){

	//search for ready opearations in RS1

	for(let i = 0; i < resources.RS1; i++){
		var isDispatched = false;

		//is RS busy
		if(ResStation1TableCont[i].isBusy){
			var res = 0;

			//check if the operand are numbers 
			//and if there are are resources 
			//and if the instruction is dispatched in a previous cycle
			if(typeof ResStation1TableCont[i].rs === 'number'
				&& typeof ResStation1TableCont[i].rt === 'number'
				&& resources.adders > usedResources.adders
				&& ResStation1TableCont[i].addedInCyc < cycleNumber){

				//do the operation
				if(ResStation1TableCont[i].OP == "ADD"){
					res = ResStation1TableCont[i].rs + ResStation1TableCont[i].rt;
					isDispatched = true;
				}else if (ResStation1TableCont[i].OP == "SUB"){
					res = ResStation1TableCont[i].rs - ResStation1TableCont[i].rt;
					isDispatched = true;
				}

				//add the res to dispatch queue
				if(isDispatched){
					var temp = {
								res: res,
								toBeWrittenAfter: instInfo[ResStation1TableCont[i].OP].cyc,
								addedInCyc: cycleNumber,
								tag: ResStation1TableCont[i].tag
							};
					dispRS1q.push(temp);
					usedResources.adders++;

					console.log("the following inst is dispatched");
					console.log(ResStation1TableCont[i]);
					console.log("it's res opj");
					console.log(temp);

					//empty the RS
					ResStation1TableCont[i] = {isBusy: false, OP: "-", appr: "-", rs: "-", rt: "-", tag: "RS1_" + i, addedInCyc: 0};
					updateRS1();
				}
				

				console.log("used units " + usedResources.adders);

			}
		}
	}

	for(let i = 0; i < resources.RS2; i++){

		//is RS busy
		
		if(ResStation2TableCont[i].isBusy){

			var res = 0;
			var isDispatched = false;

			//check if the operand are numbers 
			//and if there are are resources 
			//and if the instruction is dispatched in a previous cycle
			if(typeof ResStation2TableCont[i].rs === 'number'
				&& typeof ResStation2TableCont[i].rt === 'number'
				&& resources.multipliers > usedResources.multipliers
				&& ResStation2TableCont[i].addedInCyc < cycleNumber){

				//do the operation
				if(ResStation2TableCont[i].OP == "MUL"){
					res = ResStation2TableCont[i].rs * ResStation2TableCont[i].rt;
					isDispatched = true;
				}else if (ResStation2TableCont[i].OP == "DIV"){
					res = ResStation2TableCont[i].rs / ResStation2TableCont[i].rt;
					res = res.toFixed(2);
					isDispatched = true;
					console.log(res);
				}

				//add the res to dispatch queue
				if(isDispatched){
					var temp = {
								res: res,
								toBeWrittenAfter: instInfo[ResStation2TableCont[i].OP].cyc,
								addedInCyc: cycleNumber,
								tag: ResStation2TableCont[i].tag
							};
					dispRS2q.push(temp);
					usedResources.multipliers++;

					console.log("the following inst is dispatched");
					console.log(ResStation2TableCont[i]);
					console.log("it's res opj");
					console.log(temp);

					//empty the RS
					ResStation2TableCont[i] = {isBusy: false, OP: "-", appr: "-", rs: "-", rt: "-", tag: "RS2_" + i, addedInCyc: 0};
					updateRS2();

				}
				
			}
		}

	}




	var minnn = -1;
	var resss = 0;

	for(let i = 0; i < resources.LB; i++){
		//getting the first instruction added because it is in-order
		if(LoadBufferTableCont[i].isBusy && (minnn == -1 || LoadBufferTableCont[i].addedInCyc < LoadBufferTableCont[minnn].addedInCyc))
			minnn = i;
	}

	if(minnn != -1
		&& typeof LoadBufferTableCont[minnn].rs === 'number'
		&& resources.LDalu > usedResources.LDalu
		&& LoadBufferTableCont[minnn].addedInCyc < cycleNumber){

		resss = LoadBufferTableCont[minnn].rs + LoadBufferTableCont[minnn].addrs;
		resss = Memory[resss];

		var temp = {
			res: resss,
			toBeWrittenAfter: instInfo["LD"].cyc,
			addedInCyc: cycleNumber,
			tag: LoadBufferTableCont[minnn].tag
		};

		console.log("the following inst is dispatched");
		console.log(LoadBufferTableCont[minnn]);
		console.log("it's res opj");
		console.log(temp);


		dispLBq.push(temp);
		//usedResources.LDalu++;

		LoadBufferTableCont[minnn] = {isBusy: false, rs: "-", tag: "LB_" + minnn, addrs: 0, addedInCyc: 0};
		updateLB();
	}


	minnn = -1;
	resss = 0;

	for(let i = 0; i < resources.SB; i++){

		//getting the first instruction added because it is in-order
		if(StoreBufferTableCont[i].isBusy && (minnn == -1 || StoreBufferTableCont[i].addedInCyc < StoreBufferTableCont[minnn].addedInCyc))
			minnn = i;
	}

	if(minnn != -1
		&& typeof StoreBufferTableCont[minnn].rs === 'number'
		&& typeof StoreBufferTableCont[minnn].rd === 'number'
		&& StoreBufferTableCont[minnn].addedInCyc < cycleNumber){


		resss = StoreBufferTableCont[minnn].rs + StoreBufferTableCont[minnn].addrs;
		Memory[resss] = StoreBufferTableCont[minnn].rd;

		var temp = {
			res: '-',
			toBeWrittenAfter: instInfo["SW"].cyc,
			addedInCyc: cycleNumber,
			tag: StoreBufferTableCont[minnn].tag
		};

		console.log("the following inst is dispatched");
		console.log(StoreBufferTableCont[minnn]);
		console.log("it's res opj");
		console.log(temp);

		dispSBq.push(temp);
		//usedResources.LDalu++;

		StoreBufferTableCont[minnn] = {isBusy: false, rd: "-", rs: "-", tag: "SB_" + minnn, addrs: 0, addedInCyc: 0};
		updateSB();
	}




}






/*
*********************
=     WriteBack     =
*********************

var dispRS1q = new Queue();
var dispRS2q = new Queue();
var dispLBq = new Queue();
var dispSBq = new Queue();
WBq

{
	res: int,
	toBeWrittenAfter: int;
	addedInCyc: int
}
*/


function WriteBack(){


	addReadyResToWBq(dispLBq);
	addReadyResToWBq(dispRS2q);
	addReadyResToWBq(dispRS1q);
	addReadyResToWBq(dispSBq);

	//WB the first ready result
	if(!WBq.isEmpty()){
		var readyRes = WBq.pop();

		var unit = (readyRes.tag).substring(0, (readyRes.tag).indexOf("_"));

		if(unit == "RS1"){
			usedResources.adders--;
			console.log("an adder is released, the used: " + usedResources.adders);

		}else if (unit == "RS2") {
			usedResources.multipliers--;
			console.log("a multipliers is released, the used: " + usedResources.multipliers);
			
		}else if (unit == "LB") {
			console.log("Load WB");
			console.log(readyRes);


		}else if (unit == "SB") {
			
		}

		captureRes(readyRes);
	}

	

	
	
}


function addReadyResToWBq(dispRSq){

	var qTemp = new Queue();

	//see all results
	while(!dispRSq.isEmpty()){

		var currRes = dispRSq.pop();

		var isAdded = false;
		//add to WBq if ready
		if(currRes.toBeWrittenAfter <= 0){
			if(currRes.res == "-"){
				console.log("store with the tag "+currRes.tag+" has finished");
			}else  {
				WBq.push(currRes);
				console.log("res with tag" + currRes.tag + " is added to WB queue");
			}
			isAdded = true;

		}

		// if res was not ready
		if(!isAdded){
			//decrement the cycles
			currRes.toBeWrittenAfter--;

			//add it again to the queue
			qTemp.push(currRes);
		}

	}

	//refill RS with the not ready results
	while (!qTemp.isEmpty()) {
		dispRSq.push(qTemp.pop());
	}
}




/*

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


*/


function captureRes(readyRes){

	captureResRS(readyRes, ResStation1TableCont);
	captureResRS(readyRes, ResStation2TableCont);
	captureResRS(readyRes, LoadBufferTableCont);
	captureResRS(readyRes, StoreBufferTableCont);

	captureResRFandRAT(readyRes);

	updateAll();


}

function captureResRS(readyRes, RS){
	console.log("to be capture");
	console.log(readyRes);
	var unit = (RS[0].tag).substring(0, (RS[0].tag).indexOf("_"));



	for(let i = 0; i < resources[unit]; i++){
		var isCaptured = false;
		if(RS[i].rs == readyRes.tag){
			RS[i].rs = readyRes.res;
			isCaptured = true;

		}
		if(RS[i].rt == readyRes.tag){
			RS[i].rt = readyRes.res;
			isCaptured = true;
		} 
		if(RS[i].rd == readyRes.tag) {
			RS[i].rd = readyRes.res;
			isCaptured = true;
		}

		if(isCaptured){
			console.log("res with tag " + readyRes.tag + " in "+ unit +" is captured " );
		}
	}

}

function captureResRFandRAT(readyRes){


	for(let i = 0; i < numOfReg; i++){
		if(RATtableCont[regName + i] == readyRes.tag){
			RFtableCont[regName + i] = readyRes.res;
			RATtableCont[regName + i] = "-";
			console.log("res with tag " + readyRes.tag + " in RF is captured " );
		}
		//console.log(RATtableCont[regName + i]);
		
	}


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
		}else{
			console.log("queue is full");
			return null;
		}
		
	}

	this.pop = function(){
		if(!this.isEmpty()){
			numOfElements--;
			var oldFront = content[front];
			front = (front + 1) % maxNumOfElements;
			return oldFront;
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
			arr.push(content[i]);
		}

		return arr;
	}
}



/*
var q = new Queue();

q.push(1);
var a = q.pop();


console.log(a);
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





/*
ADD F0, F2, F3
LD F0, F2
SUB F0, F2, F3


var IQtableCont = new Queue();
var IQ = new Queue();


var resources = {
	adders: 2,
	multipliers: 2,
	LDalu: 2,
	RS1: 3,
	RS2: 3,
	LB: 3,
	SB: 3
}


var instInfo = {
	ADD: {cyc: 2, OP: "ADD", nOperands: 2, appr: "+", unit: "RS1"},
	SUB: {cyc: 3, OP: "SUB", nOperands: 2, appr: "-", unit: "RS1"},
	MUL: {cyc: 7, OP: "MUL", nOperands: 2, appr: "*", unit: "RS2"},
	DIV: {cyc: 10, OP: "DIV", nOperands: 2, appr: "/", unit: "RS2"},
	LD: {cyc: 5, OP: "LD", nOperands: 1, appr: "L", unit: "LB"},
	SW: {cyc: 6, OP: "SW", nOperands: 1, appr: "S", unit: "SB"}
};




*/

/** Sidebar functions **/
$(document).ready(function () {
    var body = $('body'),
        sidebar = $('#sidebar'),
        sidebarForm = $('#sim-form'),
        sidebarOverlay = $('#sidebar-overlay'),
        validationResult = true,
        insInput = $('#ins'),
        addersNum = $('#adders'),
        mulNum = $('#mul'),
        ldNum = $('#ld'),
        rs1Num = $('#rs1'),
        rs2Num = $('#rs2'),
        lbNum = $('#lb'),
        sbNum = $('#sb'),
        addCyc = $('#ins-add'),
        subCyc = $('#ins-sub'),
        mulCyc = $('#ins-mul'),
        divCyc = $('#ins-div'),
        lwCyc = $('#ins-lw'),
        swCyc = $('#ins-sw');
    
    // open & close
    function sidebarToggle() {
        body.add(sidebar).add(sidebarForm).toggleClass('open');
        sidebarOverlay.fadeToggle(500);
    }
    $('#menu-icon, #sidebar-overlay').on('click', sidebarToggle);
    
    // validation
    // instructions
    var instructions;
    function instValidation() {
        instructions = insInput.val().split("\n");
        $.each(instructions, function(n, elem) {
            if( isInstValid(elem).isValid === false ){
                insInput.addClass('wrong');
                console.log("instruction " + (n+1) +" is wrong");
                validationResult = false;
            } else {
                insInput.removeClass('wrong');
            }
        } );
    }
    insInput.on('blur', instValidation);
    
    // other inputs
    function validateInput() {
        if ( !$.isNumeric($(this).val()) || $(this).val() < 0 ){
            $(this).addClass('wrong');
            validationResult = false;
        } else {
            $(this).removeClass('wrong');
        }
    }
    $('.pos-num').on('blur', validateInput);
    
    
    $('#form-submit').on('click', function() {
        validationResult = true;
        instValidation();
        $('.pos-num').each( validateInput );
        
        // if everything is okay
        if (validationResult === true){
            // emptying queues
            while( !IQtableCont.isEmpty() ){
                IQtableCont.pop();
            }
            while( !IQ.isEmpty() ){
                IQ.pop();
            }
            
            // insert instructions in ret objects into queues
            $.each(instructions, function(n, elem) {
                IQtableCont.push(elem);
                IQ.push( isInstValid(elem) );
            });
            
            // update resources values
            resources.adders = addersNum.val();
            resources.multipliers = mulNum.val();
            resources.LDalu = ldNum.val();
            resources.RS1 = rs1Num.val();
            resources.RS2 = rs2Num.val();
            resources.LB = lbNum.val();
            resources.SB = sbNum.val();
            
            // update inst cycles value
            instInfo.ADD.cyc = addCyc.val();
            instInfo.SUB.cyc = subCyc.val();
            instInfo.MUL.cyc = mulCyc.val();
            instInfo.DIV.cyc = divCyc.val();
            instInfo.LD.cyc = lwCyc.val();
            instInfo.SW.cyc = swCyc.val();
            
            // close sidebar
            setTimeout(sidebarToggle, 1000);

            console.log(IQtableCont);
            console.log(IQ);
            console.log(resources);
            console.log(instInfo);
            updateAll();
        }
    });
    
});


var controller = 0;


function runAcyc(){

	if(controller == 0){
		console.log("start cycle " + cycleNumber);
		console.log("cycle " + cycleNumber + ": issue start");
		if(!IQ.isEmpty()){
			issueInst();
		}else {
			console.log("There is no instructions to issue");
		}
		
		controller++;
		console.log("cycle " + cycleNumber + ": issue end");

	}else if(controller == 1) {
		console.log("cycle " + cycleNumber + ": dispatch start");
		dispatch();
		controller++;
		console.log("cycle " + cycleNumber + ": dispatch end");
	}else if(controller == 2) {
		console.log("cycle " + cycleNumber + ": WriteBack start");
		WriteBack();
		controller = 0;
		console.log("cycle " + cycleNumber + ": WriteBack end");
		console.log("end cycle " + cycleNumber);

		//start new cycle
		cycleNumber++;
	}

	
}

