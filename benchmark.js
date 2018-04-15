"use strict";
const {isSQLMatch} = require("./");
const {Suite} = require("benchmark");

new Suite()
	.add("isSQLMatch", () => isSQLMatch("%ing", "string"))
	/*.add("New algorithm?", () => {

	})*/
	.on("cycle", event => console.log(event.target.toString()))
	//.on("complete", ()= > console.log("Fastest is " + this.filter("fastest").map("name")))
	.run({ async:true });
