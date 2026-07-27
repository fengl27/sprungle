class Platform {

	static platformThings = {
		normal: {
			col: "grey",
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
		}
	}

    constructor(pos, size, type) {
        this.pos = Vect.get(pos);
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
}
var platforms = [];

var currLevel = 1;
function loadLevel(level) {
	platforms = [];
	fetch(`levels/level${level}.txt`)
		.then((res) => res.text())
		.then((text) => {
			let lines = text.split("\r").join("").split("\n");//delete the singular \r in each line
			for(var i = 0; i < lines.length; i ++) {
				let words = lines[i].split(" ");
				platforms.push(new Platform(
					new Vect(parseInt(words[0]), parseInt(words[1])),
					new Vect(parseInt(words[2]), parseInt(words[3])),
					words[4]
				));
			}
		}
	).catch((e) => console.error(e));
}

loadLevel(currLevel);
/*
var platforms = [
	new Platform(new Vect(-200, 100), new Vect(250, 10)),
	new Platform(new Vect(-200, 0), new Vect(10, 100)),
	new Platform(new Vect(330, -1130), new Vect(30, 910)),
	new Platform(new Vect(1160, -140), new Vect(10, 10)),
	new Platform(new Vect(1880, -140), new Vect(390, 20)),
	new Platform(new Vect(690, -330), new Vect(1190, 10)),
	new Platform(new Vect(1880, -330), new Vect(390, 20)),
	new Platform(new Vect(690, -1020), new Vect(10, 690)),
	new Platform(new Vect(360, -1020), new Vect(330, 10)),
	new Platform(new Vect(350, -1200), new Vect(10, 70)),
	new Platform(new Vect(340, -1160), new Vect(10, 20)),
	new Platform(new Vect(330, -1140), new Vect(10, 10)),
	new Platform(new Vect(530, -1030), new Vect(10, 10)),
	new Platform(new Vect(510, -1090), new Vect(10, 70)),
	new Platform(new Vect(630, -1060), new Vect(10, 40)),
	new Platform(new Vect(570, -1110), new Vect(20, 90)),
	new Platform(new Vect(580, -1160), new Vect(10, 50)),
	new Platform(new Vect(690, -1080), new Vect(20, 70)),
	new Platform(new Vect(700, -1130), new Vect(10, 50)),
	new Platform(new Vect(700, -1150), new Vect(10, 10)),
	new Platform(new Vect(590, -1170), new Vect(10, 10)),
	new Platform(new Vect(560, -1130), new Vect(10, 10)),
	new Platform(new Vect(2260, -1140), new Vect(10, 810)),
	new Platform(new Vect(2660, -450), new Vect(20, 20)),
	new Platform(new Vect(2910, -270), new Vect(20, 30)),
	new Platform(new Vect(3270, -490), new Vect(80, 20)),
	new Platform(new Vect(3320, -10), new Vect(220, 10)),
	new Platform(new Vect(3470, -270), new Vect(20, 30)),
	new Platform(new Vect(3570, -450), new Vect(40, 30)),
	new Platform(new Vect(3770, -360), new Vect(30, 20)),
	new Platform(new Vect(3760, -440), new Vect(20, 20)),
	new Platform(new Vect(3700, -210), new Vect(10, 40)),
	new Platform(new Vect(3920, -230), new Vect(20, 10)),
	new Platform(new Vect(3990, -360), new Vect(10, 20)),
	new Platform(new Vect(3960, -450), new Vect(10, 10)),
	new Platform(new Vect(4130, -410), new Vect(30, 10)),
	new Platform(new Vect(4230, -350), new Vect(30, 10)),
	new Platform(new Vect(4260, -250), new Vect(10, 10)),
	new Platform(new Vect(4130, -210), new Vect(10, 10)),
	new Platform(new Vect(4260, -290), new Vect(20, 10)),
	new Platform(new Vect(4440, -290), new Vect(30, 10)),
	new Platform(new Vect(4500, -170), new Vect(20, 10)),
	new Platform(new Vect(4390, -260), new Vect(10, 10)),
	new Platform(new Vect(4370, -390), new Vect(20, 10)),
	new Platform(new Vect(4600, -400), new Vect(40, 10)),
	new Platform(new Vect(4780, -260), new Vect(10, 10)),
	new Platform(new Vect(4730, -110), new Vect(10, 10)),
	new Platform(new Vect(4670, -280), new Vect(10, 10)),
	new Platform(new Vect(4780, -360), new Vect(10, 10)),
	new Platform(new Vect(5350, -380), new Vect(140, 10)),
	new Platform(new Vect(6160, -1520), new Vect(20, 1110)),
	new Platform(new Vect(6160, -190), new Vect(20, 1710)),
	new Platform(new Vect(1020, -130), new Vect(10, 1600)),
	new Platform(new Vect(1030, -130), new Vect(850, 10)),
	new Platform(new Vect(690, -320), new Vect(10, 90)),
	new Platform(new Vect(-1820, 100), new Vect(1410, 10)),
	new Platform(new Vect(-1690, -390), new Vect(1320, 10)),
	new Platform(new Vect(-3270, 190), new Vect(1030, 10), "death"),
	new Platform(new Vect(-2250, 200), new Vect(10, 1470), "death"),
	new Platform(new Vect(-3460, -210), new Vect(20, 20)),
	new Platform(new Vect(-3820, 150), new Vect(70, 10)),
	new Platform(new Vect(-3820, 100), new Vect(10, 50)),
	new Platform(new Vect(-4010, 60), new Vect(10, 10)),
	new Platform(new Vect(-3970, 60), new Vect(10, 10)),
	new Platform(new Vect(-4020, 100), new Vect(70, 10)),
	new Platform(new Vect(-4030, 80), new Vect(90, 20)),
	new Platform(new Vect(6990, -540), new Vect(20, 510), "win"),
	new Platform(new Vect(6180, -550), new Vect(840, 10), "death"),
	new Platform(new Vect(7010, -540), new Vect(10, 520), "death"),
	new Platform(new Vect(6180, -30), new Vect(830, 10), "death"),
];
*/

Platform.types = Object.keys(Platform.platformThings);