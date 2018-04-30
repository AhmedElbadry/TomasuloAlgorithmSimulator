

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
	rs1: 3,
	rs2: 3,
	lb: 3,
	sb: 3
}
var instInfo = {
	ADD: {cyc: 2, OP: "ADD", appr: "+"},
	SUB: {cyc: 2, OP: "SUB", appr: "-"},
	MUL: {cyc: 2, OP: "MUL", appr: "*"},
	LD: {cyc: 2, OP: "LD", appr: "L"},
	SW: {cyc: 2, OP: "SW", appr: "S"}
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
	RFtableCont[i] = 0;
	RATtableCont[i] = "";
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
for(let i = 0; i < resources.rs1; i++){
	ResStation1TableCont[i] = {isBusy: false, OP: "-",  rs: "-", rt: "-"};
}
for(let i = 0; i < resources.rs2; i++){
	ResStation2TableCont[i] = {isBusy: false, OP: "-", rs: "-", rt: "-"};
}
for(let i = 0; i < resources.lb; i++){
	LoadBufferTableCont[i] = {isBusy: false, rs: "-"};
}
for(let i = 0; i < resources.sb; i++){
	StoreBufferTableCont[i] = {isBusy: false, rs: "-", rt: "-"};
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
	for(let i = 0; i < numOfReg; i++){
		RFtable.append("<tr><td> " + regName + i + "</td><td>" + RFtableCont[i] + "</td></tr>");
	}
}

function updateRATtable() {
	RATtable.html("");
	for(let i = 0; i < numOfReg; i++){
		RATtable.append("<tr><td> " + regName + i + "</td><td>" +  ((RATtableCont[i] != "")? RATtableCont:"&nbsp;") + "</td></tr>");

	}
}

function updateRS1(){
	ResStation1Table.html("");
	for(let i = 0; i < resources.rs1; i++){
		ResStation1Table.append("<tr><td> " +
			ResStation1TableCont[i].OP  + "</td><td>" +
			ResStation1TableCont[i].rs + "</td><td>" +
			ResStation1TableCont[i].rt +  "</td></tr>");
	}
}
function updateRS2(){
	ResStation2Table.html("");
	for(let i = 0; i < resources.rs2; i++){
		ResStation2Table.append("<tr><td> " +
			ResStation2TableCont[i].OP  + "</td><td>" +
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
	for(let i = 0; i < resources.lb; i++){
		LoadBufferTable.append("<tr><td> " + LoadBufferTableCont[i].rs  + "</td></tr>");
	}
}
function updateSB(){
	StoreBufferTable.html("");
	for(let i = 0; i < resources.lb; i++){
		StoreBufferTable.append("<tr><td> " +
		 StoreBufferTableCont[i].rs  + "</td><td>" +
		 StoreBufferTableCont[i].rt + "</td></tr>");
	}
}




// TO BE CONTINUED
function issueInst(ints){

	//syntax for inst: OP rd, rs, rt
	var OP = ints.substring(0, ints.indexOf(" "));
	console.log("_"+ OP + "_");

	var rd = ints.substring(ints.indexOf(" ") + 1 , ints.indexOf(", "));
	console.log("_"+ rd + "_");

	var rs = ints.substring(ints.indexOf(", ") + 2 , ints.indexOf(",", ints.indexOf(", ") + 2));
	console.log("_"+ rs + "_");

	if(OP != instInfo.LD.OP && OP != instInfo.SW.OP){
		var rt = ints.substring(ints.lastIndexOf(", ") + 2);
		console.log("_"+ rt + "_");
	}


	if(OP == instInfo.ADD.OP 
		|| OP == instInfo.SUB.OP ){


	}






}

issueInst("ADD F0, F2, F3");




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

