class Platform {

	static platformThings = {
		normal: {
			col: "rgb(148, 148, 148)",
			canGrapple: true
		},
		noGrapple: {
			col: "rgb(45, 45, 45)",
			canGrapple: false
		},
		oneWay: {
			col: "special",
			canGrapple: (grappleDir) => {grappleDir > 0},//upwards things go through it
			display: function(p) {
				ctx.fillStyle = "grey";
				ctx.fillRect(Math.round(p.x), Math.round(p.y), this.size.x * cam.scale + 0.7, 2 * cam.scale + 0.7);
			},
			outline: function(p) {
				ctx.fillStyle = "black";
				ctx.fillRect(Math.round(p.x - 3), Math.round(p.y - 3), this.size.x*cam.scale + 6, 2 *cam.scale + 6);
			},
			collision: function(platform, playerPrevPos, playerPostPos, isYMove) {
				return isYMove && playerPostPos.y + player.size.y > platform.pos.y && playerPrevPos.y + player.size.y <= platform.pos.y + 2 && playerPostPos.y > playerPrevPos.y;
			}
		},
		death: {
			col: "rgb(150, 0, 0)",
			canGrapple: true,
			onTouch: function() {//you can still bounce off it without dying
				player.die();
			}
		},
		lava: {//this one just kills you
			col: "rgb(100, 0, 0)",
			onTouch: function() {
				player.die();
			},
			onBounce: function() {
				player.die();
			},
			canGrapple: false,
		},
		win: {
			col: "special",
			bounciness: -1,
			canGrapple: true,
			display: function(p) {
				ctx.fillStyle = "white";
				for(var x = 0; x < Math.floor(this.size.x / 10); x ++) {
					for(var y = 0; y < Math.floor(this.size.y / 10); y ++) {
						if((x + y) % 2 === 0) {// checkerboardcheck
							ctx.fillRect(
								p.x + x * 10 * cam.scale,
								p.y + y * 10 * cam.scale,
								10 * cam.scale, 10 * cam.scale
							);
						}
					}
				}
			},
			onTouch: function() {
				player.win();
			}
		},
		bouncy: {
			col: "rgb(7, 145, 7)",
			bounciness: -1.1,
			canGrapple: true
		},
		whiteDecor: {
			decorationLayer: 1,//fronk decoration (also doens't get to be collision)
			/*
			collision: () => {false},
			canGrapple: () => {false},
			*/
			col: "white",
		},
		factoryBackground: {
			decorationLayer: 3,//mid decoration
			col: "special",
			display: function(p) {
				var offsetThing = {
					x: (((this.pos.x+4500) % 45) + 45) * cam.scale,
					y: (((this.pos.y+4500) % 25) + 25) * cam.scale
				};
				ctx.save();
				ctx.lineWidth = h100/5 * cam.scale;
				ctx.fillStyle = "rgb(105, 105, 120)";
				ctx.fillRect(p.x, p.y, this.size.x*cam.scale + 1, this.size.y*cam.scale + 1);
				ctx.strokeStyle = "rgb(82, 82, 92)";
				var globalY = this.pos.y;
				for(var y = p.y - offsetThing.y; y < p.y + this.size.y*cam.scale; y += 25*cam.scale) {
					var yThing = Math.floor(globalY / 25);
					globalY += 25;
					for(var x = p.x - offsetThing.x; x < p.x + this.size.x*cam.scale; x += 45*cam.scale) {
						var goofyX = yThing%2===0? x+22.5*cam.scale: x;
						/*
						var tl = {
							x: limit(goofyX,	p.x, p.x + this.size.x*cam.scale),
							y: limit(y, 		p.y, p.y + this.size.y*cam.scale)
						};
						var br = {
							x: limit(goofyX+45*cam.scale, 	p.x, p.x + this.size.x*cam.scale),
							y: limit(y+25*cam.scale, 		p.y, p.y + this.size.y*cam.scale)
						};
						ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
						*/
						if(goofyX <= p.x + this.size.x * cam.scale + h100/10 && goofyX >= p.x) {
							ctx.beginPath();
							ctx.moveTo(goofyX, limit(y, p.y, p.y + this.size.y * cam.scale));
							ctx.lineTo(goofyX, limit(y + 25*cam.scale, p.y, p.y + this.size.y * cam.scale));
							ctx.stroke();
						}
					}
					if(y >= p.y) {
						ctx.beginPath();
						ctx.moveTo(p.x, y);
						ctx.lineTo(p.x+this.size.x*cam.scale + 0.7, y);
						ctx.stroke();
					}
				}
				ctx.restore();
			}
		},
		darkFactoryBackground: {
			decorationLayer: 2,//back decoration
			col: "special",
			display: function(p) {
				var offsetThing = {
					x: (((this.pos.x+4500) % 45) + 45) * cam.scale,
					y: (((this.pos.y+4500) % 25) + 25) * cam.scale
				};
				ctx.save();
				ctx.lineWidth = h100/5 * cam.scale;
				ctx.fillStyle = "rgb(69, 69, 89)";
				ctx.fillRect(p.x, p.y, this.size.x*cam.scale + 1, this.size.y*cam.scale + 1);
				ctx.strokeStyle = "rgb(40, 40, 50)";
				var globalY = this.pos.y;
				for(var y = p.y - offsetThing.y; y < p.y + this.size.y*cam.scale; y += 25*cam.scale) {
					var yThing = Math.floor(globalY / 25);
					globalY += 25;
					for(var x = p.x - offsetThing.x; x < p.x + this.size.x*cam.scale; x += 45*cam.scale) {
						var goofyX = yThing%2===0? x+22.5*cam.scale: x;
						/*
						var tl = {
							x: limit(goofyX,	p.x, p.x + this.size.x*cam.scale),
							y: limit(y, 		p.y, p.y + this.size.y*cam.scale)
						};
						var br = {
							x: limit(goofyX+45*cam.scale, 	p.x, p.x + this.size.x*cam.scale),
							y: limit(y+25*cam.scale, 		p.y, p.y + this.size.y*cam.scale)
						};
						ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
						*/
						if(goofyX < p.x + this.size.x * cam.scale && goofyX >= p.x) {
							ctx.beginPath();
							ctx.moveTo(goofyX, limit(y, p.y, p.y + this.size.y * cam.scale));
							ctx.lineTo(goofyX, limit(y + 25*cam.scale, p.y, p.y + this.size.y * cam.scale));
							ctx.stroke();
						}
					}
					if(y >= p.y) {
						ctx.beginPath();
						ctx.moveTo(p.x, y);
						ctx.lineTo(p.x+this.size.x*cam.scale + 0.7, y);
						ctx.stroke();
					}
				}
				ctx.restore();
			}
		},

		cloud: {
			decorationLayer: 2,
			col: "special",
			outline: function(p) {
				if(player.god.active) {
            		ctx.fillRect(Math.round(p.x - 3), Math.round(p.y - 3), this.size.x*cam.scale + 6, this.size.y*cam.scale + 6);
				}
			},
			display: function(p) {
				var center = Vect.add(Vect.div(this.size, 2), this.pos);
				if(!this.cloudThings) {
					this.cloudThings = [];
					for(var i = 0; i < 100; i ++) {
						this.cloudThings.push({
							pos: new Vect(
								this.pos.x + this.size.x * Math.random(),
								this.pos.y + this.size.y * Math.random()
							),
							size: lerp(20, 50, easings.easeInQuad(Math.random())),
							phase: Math.random() * Math.PI * 4
						});
					}
				}
				if(Math.random() < 0.2) {
					this.cloudThings.push({
						pos: new Vect(
							this.pos.x,
							this.pos.y + this.size.y * Math.random()
						),
						size: lerp(20, 50, easings.easeInQuad(Math.random())),
						phase: Math.random() * Math.PI * 4
					});
				}

				for(var i = 0; i < this.cloudThings.length; i ++) {
					var dst = dist(center.x*(this.size.y/this.size.x), center.y, this.cloudThings[i].pos.x* (this.size.y/this.size.x), this.cloudThings[i].pos.y);//ellipse
					var opacity = easings.easeInOutQuad(1-limit(dst / this.size.y * 2, 0, 1)) * 0.4;
					ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";

					var size = lerp(0.9, 1.1, (Math.sin(this.cloudThings[i].phase) + 1) / 2) * this.cloudThings[i].size * cam.scale;
					var p = cam.toScreen(this.cloudThings[i].pos);
					ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);

					this.cloudThings[i].pos.y += Math.sin(this.cloudThings[i].phase * 0.5) * 0.5;
					this.cloudThings[i].phase += 2 / this.cloudThings[i].size;
					this.cloudThings[i].pos.x += 0.2 + 4 / this.cloudThings[i].size;
					if(this.cloudThings[i].pos.x > this.pos.x+this.size.x) {
						this.cloudThings.splice(i, 1);
						i --;
					}
 				}
			}
		},
		starBackground: {
			decorationLayer: 3,//mid decorationas
			col: "special",
			display: function(p) {
				ctx.save();
				ctx.lineWidth = h100/5 * cam.scale;
				ctx.fillStyle = "rgb(54, 54, 85)";
				ctx.fillRect(p.x, p.y, this.size.x*cam.scale + 1, this.size.y*cam.scale + 1);
				ctx.fillStyle = "rgb(223, 223, 245)";
				let parralaxOffset = Vect.sub(Vect.mult(Vect.add(this.pos,player.pos), 0.1),this.pos);
				let parralaxOffsetIndexChange = new Vect(Math.floor(parralaxOffset.x / settings.platformSnap), Math.floor(parralaxOffset.y / settings.platformSnap));
				for(var i = -1; i < this.size.x/settings.platformSnap; i += 1) {
					for(var j = -1; j < this.size.y/settings.platformSnap; j += 1) {
						for(var k = 0; k < (hash(hash((i-parralaxOffsetIndexChange.x)) + (j-parralaxOffsetIndexChange.y)) * 1.5-1)/2; k ++) {
							let starPos = Vect.add(parralaxOffset, new Vect(this.pos.x + (i-parralaxOffsetIndexChange.x) * settings.platformSnap + hash(this.pos.y + this.pos.x + (j-parralaxOffsetIndexChange.y)) * settings.platformSnap, this.pos.y + (j-parralaxOffsetIndexChange.y) * settings.platformSnap + hash(this.pos.x + this.pos.y + (i-parralaxOffsetIndexChange.x)) * settings.platformSnap));
							let starScreenPos = cam.toScreen(starPos);
							if(starScreenPos.x < p.x + this.size.x * cam.scale + 2 && starScreenPos.x > p.x-2 && starScreenPos.y < p.y + this.size.y * cam.scale + 2 && starScreenPos.y > p.y-2) {
								ctx.beginPath();
								ctx.arc(starScreenPos.x, starScreenPos.y, (hash(hash(j-parralaxOffsetIndexChange.y) + (i-parralaxOffsetIndexChange.x)) * 1 + 0.5) * cam.scale, 0, 2*Math.PI);
								ctx.fill();
							}
						}
					}
				}
				ctx.restore();
			}
		},
		blackDecor: {
			decorationLayer: 1,//fronk decoration (also doens't get to be collision)
			/*
			collision: () => {false},
			canGrapple: () => {false},
			*/
			col: "rgb(20, 20, 20)",
		},
	}

    constructor(pos, size, type) {
        this.pos = Vect.get(pos);
		this.dead = false;
        this.size = Vect.get(size);
		this.type = type || "normal";
		this.properties = Platform.platformThings[this.type];
    }

    border() {
        ctx.fillStyle = "black";
        var p = cam.toScreen(this.pos);
        if(p.x < canvas.width && p.x + this.size.x * cam.scale > 0 && p.y < canvas.height && p.y + this.size.y * cam.scale > 0) {
			if(this.properties.outline) {
				this.properties.outline.call(this, p);
			}
			else {
            	ctx.fillRect(Math.round(p.x - 3), Math.round(p.y - 3), this.size.x*cam.scale + 6, this.size.y*cam.scale + 6);
			}
        }
    }

    display() {
        var p = cam.toScreen(this.pos);
        if(p.x < canvas.width && p.x + this.size.x * cam.scale > 0 && p.y < canvas.height && p.y + this.size.y * cam.scale > 0) {
			if(this.properties.col === "special") {
				this.properties.display.call(this, p);
			}
			else {
				ctx.fillStyle = this.properties.col;
				ctx.fillRect(Math.round(p.x), Math.round(p.y), this.size.x*cam.scale + 0.7, this.size.y*cam.scale + 0.7);
			}
        }
    }

	static addPlatform(platforms, platformDecorationLayers, plat) {
		var layer = plat.properties.decorationLayer? plat.properties.decorationLayer: 0;
		if(layer === 0) {
			platforms.push(plat);
		}
		else {
			layer --;
			if(platformDecorationLayers[layer]) {
				platformDecorationLayers[layer].push(plat);
			}
			else {
				platformDecorationLayers[layer] = [plat];
			}
		}
	}
}
var platforms = [];
var platformDecorationLayers = [[], [], []];

var currLevel = 1;

var customLevels = {

};
let stuff = window.localStorage.getItem("grapple-game-custom-levels");
if(stuff) {
	customLevels = JSON.parse(stuff);
	delete stuff;
}

function parseCode(levelCode) {
	let lines = levelCode.split(" ").join("").split("\n").join(" ").split("\r").join(" ").split("|");//platforms
	let parsedPlatforms = [];
	let parsedLayers = [[], [], []];
	for(var i = 0; i < lines.length; i ++) {
		let words = lines[i].split("/");
		var newPlatform = new Platform(
			new Vect(parseInt(words[0], 36), parseInt(words[1], 36)),
			new Vect(parseInt(words[2], 36), parseInt(words[3], 36)),
			Platform.types[parseInt(words[4], 36)]
		);
		Platform.addPlatform(parsedPlatforms, parsedLayers, newPlatform);
	}
	return [parsedPlatforms, parsedLayers];
}

/*
function parseCode(levelCode) {
	let lines = levelCode.split("\r").join("").split("\n");//platforms
	let parsedPlatforms = [];
	for(var i = 0; i < lines.length; i ++) {
		let words = lines[i].split(" ");
		parsedPlatforms.push(new Platform(
			new Vect(parseInt(words[0]), parseInt(words[1])),
			new Vect(parseInt(words[2]), parseInt(words[3])),
			words[4]
		));
	}
	return parsedPlatforms;
}
*/
function loadLevel(level) {
	if(customLevels[level]) {
		[platforms, platformDecorationLayers] = parseCode(customLevels[level]);
		return;
	}
	platforms = [];
	platformDecorationLayers = [[], [], []];
	try {
		fetch(`levels/level${level}.txt`)
			.then((res) => res.text())
			.then((text) => {
				[platforms, platformDecorationLayers] = parseCode(text);
			})
	}
	catch(e) {
		console.error(e + "\n\nwow an error")
	}
	console.log("loaded level :)");
}

Platform.types = Object.keys(Platform.platformThings);

loadLevel(currLevel);
