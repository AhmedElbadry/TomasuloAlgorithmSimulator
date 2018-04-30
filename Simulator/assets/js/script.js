

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
	LDalu: 2
}
var instCyc = {
	ADD: {cyc: 2, appr: "+"},
	SUB: {cyc: 2, appr: "-"},
	MUL: {cyc: 2, appr: "*"},
	LD: {cyc: 2, appr: "L"},
	SW: {cyc: 2, appr: "S"}
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
var ResStation1table = $("#ResStation1table");
var ResStation1tableCont = [];

var ResStation2table = $("#ResStation2table");
var ResStation2tableCont = [];


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





function issueInst(ints){

	

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
			console.log("push " + el);
		}else{
			console.log("queue is full");
			return null;
		}
		
	}

	this.pop = function(){
		if(!this.isEmpty()){
			numOfElements--;
			var oldFront = content[front];
			console.log("front " + front);
			front = (front + 1) % maxNumOfElements;
			console.log("pop " + oldFront);
			return content[oldFront];
		}else {
			console.log("queue is empty");
		}
		
	}

	this.retArray = function(){
		var arr = [];

		for(let i = front; i < front + rear + 1; i++){
			console.log(content[i]);
			arr.push(content[i]);
		}

		return arr;
	}
}

updateIQtable();

updateRFtable();

updateRATtable();


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

