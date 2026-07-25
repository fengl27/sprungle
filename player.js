class Player {
    constructor(x, y, godMode) {
        this.pos = new Vect(x, y);
        this.size = new Vect(15,15);
        this.god = {
            platformStart: new Vect(),
            building: false,
            active: godMode || false,
            placeType: "normal"
        };
        this.vel = new Vect();
        this.grapple = {
            grappling: false,
            pos: new Vect(),
            grappleLength: 0,

            grappleBufferTime: 999,

            grappleDispRot: 0,
            grappleDispRotVel: 0,

            castAnim: 0,

            slackTimer: 0//time since last time the rope actually pulled the player
        };
        this.squish = new Vect();
        this.squishVel = new Vect();

        this.stretching = [false, false];//if stretching you don't want to be like squishing on the fake ceiling or something idk idk idk idk ikdiddkiddkid

        this.controls = {
            right: "d",
            left: "a",
            up: "w",
            down: "s",
            grapple: "mouseLeft",
            sprint: "shift",//god => sprint, normal => floor sliding
            bounce: " ",//wall bounces
            grapplePull: "mouseRight",//grapple pull
            toggleBuilder: "o",
            clearLevel: "c",//god only
            switchBuildType: "e",//god only (switch platform building type)
        };
        this.groundTimer = 0;//time since touched floor
        this.collisionTimer = 0;
        this.lastCollisionTimer = 0;//time since last "collision" -- since the last time where you hit the ground but you were in the air before then??
        this.jumpBufferTimer = 999;//time since pressed jump

        this.bounceTimer = 999;//how long since you pressed bounce
        this.bounceVel = new Vect();

        this.walking = true;//ground fric or no ground fronk

        this.moveDir = 0;

        this.smoothedVel = new Vect();//for camera movement

        this.faceRotThing = 0;//for displaying (don't worry about it)
    }

    get center() {
        return new Vect(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
    }

    display() {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        if(this.god.active) {
            //draw grid
            ctx.lineWidth = 1;
            var O = cam.toScreen({x: 0, y: 0});//origin
            //draw normal lines
            ctx.beginPath();
            for(var x = O.x%(20*cam.scale); x < canvas.width; x += 20 * cam.scale) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }
            for(var y = O.y%(20*cam.scale); y < canvas.height; y += 20 * cam.scale) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();
            //draw intermediate lines
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.beginPath();
            for(var x = (O.x%(20*cam.scale))-10*cam.scale; x < canvas.width; x += 20 * cam.scale) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }
            for(var y = (O.y%(20*cam.scale))-10*cam.scale; y < canvas.height; y += 20 * cam.scale) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();

            ctx.strokeStyle = "black";

            //draw ployer
            ctx.lineWidth = 3;
            ctx.fillStyle = "rgb(20,20,20)";
            cam.drawRect(this.pos, this.size);

            //draw platflerm
            if(this.god.building) {
                let p = cam.toGlobal(mouse);
                p.set(settings.platformSnap*Math.floor(p.x/settings.platformSnap), settings.platformSnap*Math.floor(p.y/settings.platformSnap));//ee
                let tl = new Vect(
                    Math.min(this.god.platformStart.x, p.x),
                    Math.min(this.god.platformStart.y, p.y),
                );
                let br = new Vect(
                    Math.max(this.god.platformStart.x, p.x)+settings.platformSnap,
                    Math.max(this.god.platformStart.y, p.y)+settings.platformSnap,
                );
                cam.drawRect(tl, Vect.sub(br, tl));
            }
            return;
        }
        //draw grapple line

        if(this.grapple.grappling) {
            let p = cam.toScreen(this.center);
            let animationLength = Math.min(10, this.grapple.grappleLength / 15);
            if(this.grapple.castAnim < animationLength) {
                //do the anim thing
                let currDist = easings.easeOutSine(Math.min(1, this.grapple.castAnim / animationLength));//current amount along the line we are
                let waveAmp = 50 * (1 - easings.easeOutBack(Math.min(1, this.grapple.castAnim / animationLength)));
                let diff = Vect.sub(this.grapple.pos, this.center);
                let waveVect = new Vect(-diff.y, diff.x);
                waveVect.mult(waveAmp / waveVect.mag());
                for(var i = 0; i < 1; i += 0.2) {
                    let p1 = Vect.lerp(this.center, this.grapple.pos, i*currDist);
                    let p2 = Vect.lerp(this.center, this.grapple.pos, (i+0.1)*currDist);
                    let p3 = Vect.lerp(this.center, this.grapple.pos, (i+0.2)*currDist);
                    p2.add(Vect.mult(waveVect, 1-i));
                    waveVect.mult(-1);
                    let sp1 = cam.toScreen(p1),
                        sp2 = cam.toScreen(p2),
                        sp3 = cam.toScreen(p3);
                    quadBezier(ctx, sp1.x, sp1.y, sp2.x, sp2.y, sp3.x, sp3.y);
                }
            }
            else if(sqrDist(this.center.x, this.center.y, this.grapple.pos.x, this.grapple.pos.y) >= this.grapple.grappleLength * this.grapple.grappleLength) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                p = cam.toScreen(this.grapple.pos);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
            else{
                //bezier curving time
                let dir = Vect.sub(this.grapple.pos, this.center);
                dir.normalize();
                
                let rotDir = -limit(this.vel.x/3, -1, 1) * limit(this.vel.y/3, -1, 1);
                let tangent = new Vect(-dir.y, dir.x);
                tangent.mult(rotDir);
                let mid = Vect.mult(Vect.add(this.grapple.pos, this.center), 0.5);
                tangent.mult(Math.sqrt(this.grapple.grappleLength * this.grapple.grappleLength - Vect.sqrDist(this.center, this.grapple.pos)) / 2);
                let p2 = cam.toScreen(Vect.add(mid, tangent));
                let p3 = cam.toScreen(this.grapple.pos);
                quadBezier(ctx, p.x, p.y, p2.x, p2.y, p3.x, p3.y);
            }
        }
        else {
            let bob = this.raycastGrapple();
            ctx.strokeStyle = bob? "rgb(0, 150, 0)": "rgb(100, 0, 0)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            let p = cam.toScreen(this.center);
            let diff = Vect.sub(mouse, p);
            if(diff.sqrMag() !== 0) {
                diff.mult((bob?bob[1]*cam.scale:canvas.width) / diff.mag());
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + diff.x, p.y + diff.y);
                ctx.stroke();
            }
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
        }

        ctx.fillStyle = "#ec8906";

        ctx.save();

        if(!this.walking && this.groundTimer > settings.coyoteTime) {
            if(this.grapple.grappling) {
                var diff = Vect.sub(this.center, this.grapple.pos);
                diff.normalize();
                var closest = new Vect();
                var closestId = -1;
                var cSqrDst = 9999999;
                for(var i = 0; i < 2 * Math.PI; i += Math.PI / 2) {
                    var curr = new Vect(Math.cos(this.grapple.grappleDispRot + i), Math.sin(this.grapple.grappleDispRot + i));
                    var dst = Vect.sqrDist(curr, diff);
                    if(dst < cSqrDst) {
                        cSqrDst = dst;
                        closest.set(curr);
                        closestId = i;
                    }
                }
                diff.mult(0.1);
                diff.add(closest);
                var oldDispRot = this.grapple.grappleDispRot;

                this.grapple.grappleDispRot = Math.atan2(diff.y, diff.x) - Math.PI / 2;

                this.grapple.grappleDispRotVel = (this.grapple.grappleDispRot - oldDispRot) % (Math.PI * 2);

                if(!this.faceRotThing) {
                    console.log(Math.round(closestId / Math.PI*2));
                    this.faceRotThing = [Math.PI / 2, 0, -Math.PI / 2, Math.PI][Math.round(closestId / Math.PI*2)];
                }
            }
            else {
                this.grapple.grappleDispRot += this.grapple.grappleDispRotVel;
                this.grapple.grappleDispRot %= Math.PI * 2;
            }
        }
        else {
            if(!this.walking) {
                this.squish.y = Math.abs(this.vel.x / 3) * lerp(0.8, 1.2, Math.sin(Date.now() / 100));//yea idc at this pint
                this.stretching[1] = false;
            }
            var targets = [0, Math.PI / 2, -Math.PI / 2];
            //var targets = [Math.PI * 2, 0, Math.PI * -2];
            var goal = this.grapple.grappleDispRot;
            var closest = targets.reduce(function(prev, curr) {
                return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
            });
            this.grapple.grappleDispRot -= closest;//rofl
            this.faceRotThing += closest;
            this.grapple.grappleDispRot *= 0.7;

            this.grapple.grappleDispRotVel = this.vel.x / 100;
        }

        var pivot = cam.toScreen(this.center);
        ctx.translate(pivot.x, pivot.y);
        ctx.rotate(this.grapple.grappleDispRot);
        ctx.translate(-pivot.x, -pivot.y);
        

        //squish/stretch time
        let squishTL = Vect.get(this.pos);
        let squishBR = Vect.add(this.pos, this.size);

        //squish y first (because i'm used to y squish more)
        if(this.squish.y > 0 !== this.stretching[1]) {
            //squish down to bottom surface
            squishTL.y += this.squish.y;
        }
        else {
            //squish up to ceiling
            squishBR.y += this.squish.y;
        }
        squishTL.x -= Math.abs(this.squish.y) * (this.stretching[1]? -1: 1);//squish outwards
        squishBR.x += Math.abs(this.squish.y) * (this.stretching[1]? -1: 1);//squish outwards

        //squish x (weird)
        if(this.squish.x > 0 !== this.stretching[0]) {
            //squish down to bottom surface
            squishTL.x += this.squish.x;
        }
        else {
            //squish up to ceiling
            squishBR.x += this.squish.x;
        }
        squishTL.y -= Math.abs(this.squish.x) * (this.stretching[0]? -1: 1);//squish outwards
        squishBR.y += Math.abs(this.squish.x) * (this.stretching[0]? -1: 1);//squish outwards

        var dispP = cam.toScreen(squishTL);
        var dispS = Vect.mult(Vect.sub(squishBR, squishTL), cam.scale);

        //rectangl
        ctx.fillRect(dispP.x, dispP.y, dispS.x, dispS.y);
        ctx.strokeRect(dispP.x, dispP.y, dispS.x, dispS.y);

        //eyes
        var faceOffset = Vect.mult(this.smoothedVel, 1 / Math.max(this.smoothedVel.mag() * 20, 30));
        ctx.fillStyle = "black";
        ctx.save();
        ctx.translate(pivot.x, pivot.y);
        ctx.rotate(this.faceRotThing);
        ctx.translate(-pivot.x, -pivot.y);
        ctx.beginPath();
        if(Date.now() % 3000 > 60) {
            ctx.arc(dispP.x + dispS.x * (0.2+faceOffset.x), dispP.y + dispS.y * 0.4, cam.scale * 1.2, 0, Math.PI * 2);
            ctx.arc(dispP.x + dispS.x * (0.8+faceOffset.x), dispP.y + dispS.y * 0.4, cam.scale * 1.2, 0, Math.PI * 2);
        }
        else {
            ctx.fillRect(dispP.x + dispS.x * (0.2+faceOffset.x) - cam.scale * 1.5, dispP.y + dispS.y * 0.42, cam.scale * 3, cam.scale * 0.5);
            ctx.fillRect(dispP.x + dispS.x * (0.8+faceOffset.x) - cam.scale * 1.5, dispP.y + dispS.y * 0.42, cam.scale * 3, cam.scale * 0.5);
        }
        ctx.fill();
        ctx.restore();

        this.faceRotThing *= 0.5;
        if(Math.abs(this.faceRotThing) < 0.05 && !this.grapple.grappling) {
            this.faceRotThing = 0;
        }

        //cam.drawRect(squishTL, Vect.sub(squishBR, squishTL));
        ctx.restore();
    }

    checkPlatformCollisions() {
        for(var i = 0; i < platforms.length; i ++) {
            if(AABBCollide(this.pos, this.size, platforms[i].pos, platforms[i].size)) {
                return platforms[i];
            }
        }
        return false;
    }

    raycastGrapple () {
        //runs when you send out the gap honk
        var dir = Vect.sub(cam.toGlobal(mouse), this.center);
        dir.mult(4 / dir.mag());
        let lim = 250;

        var anchorPos = this.center;//don't vect.get because no need >:)
        var length = 0;
        while(--lim > 0) {
            anchorPos.add(dir);
            length ++;
            let die = false;
            for(var i = 0; i < platforms.length; i ++) {
                if(IsPointInAABB(anchorPos, platforms[i].pos, platforms[i].size)) {
                    //die
                    die = true;
                    break;
                }
            }
            if(die) break;
        }
        if(lim <= 0) {
            return false;//didn't hit anyone
        }
        lim = 4;
        dir.div(4);
        while(--lim > 0) {
            anchorPos.sub(dir);
            length -= 1/4;
            let die = false;
            for(var i = 0; i < platforms.length; i ++) {
                if(!IsPointInAABB(anchorPos, platforms[i].pos, platforms[i].size)) {
                    //die
                    die = true;
                    break;
                }
            }
            if(die) break;
        }
        //yippie
        
        anchorPos.add(dir);
        length += 1/4;
        length *= 4;
        /*
        this.grapple.pos.set(anchorPos);
        this.grapple.grappleLength = length;
        this.grapple.grappling = true;
        */
       return [anchorPos, length];
    }

    moveTo(p) {
        var moveAmt = Vect.sub(p, this.pos);
        this.pos.x = p.x;
        let plat = this.checkPlatformCollisions();
        if(plat) {
            //x collision
            if(this.collisionTimer > settings.coyoteTime) {
                this.bounceVel.set(this.vel);
                this.bounceVel.x *= -settings.bouncePower;
                this.lastCollisionTimer = 0;
            }
            this.stretching[0] = false;
            this.squishVel.x += this.vel.x / 2;
            this.pos.x = Math.sign(moveAmt.x) === 1? plat.pos.x - this.size.x: plat.pos.x + plat.size.x;
            if(this.bounceTimer < settings.bounceTime*2) {
                this.vel.x *= -settings.bouncePower;
                this.bounceTimer = 999;
            }
            else {
                this.vel.x = 0;
                plat.properties.onTouch? plat.properties.onTouch(): false;
            }
            this.collisionTimer = 0;
        }
        this.pos.y = p.y;
        plat = this.checkPlatformCollisions();
        if(plat) {
            //y cliilition
            if(this.groundTimer > settings.coyoteTime) {
                this.stretching[1] = false;
                this.squishVel.y += this.vel.y / 2;

                this.bounceVel.set(this.vel);
                this.bounceVel.y *= -settings.bouncePower;
                this.lastCollisionTimer = 0;
            }
            this.pos.y = Math.sign(moveAmt.y) === 1? plat.pos.y - this.size.y: plat.pos.y + plat.size.y;
            if(moveAmt.y > 0 && !getInput(this.controls.sprint)) {
                this.walking = true;
            }
            if(this.bounceTimer < settings.bounceTime*2) {
                this.vel.y *= -settings.bouncePower;
                this.bounceTimer = 999;
                this.walking = false;//hehe
            }
            else {
                //don't bounce
                this.vel.y = 0;
                plat.properties.onTouch? plat.properties.onTouch(): false;
            }
            this.groundTimer = 0;
            this.collisionTimer = 0;
        }
    }

    reset() {
        this.pos.mult(0);
        this.vel.mult(0);
        this.groundTimer = 999;
        this.collisionTimer = 0;
        this.lastCollisionTimer = 0;
        this.jumpBufferTimer = 999;
        this.bounceTimer = 999;
        this.lastCollisionTimer = 999;

        this.bounceTimer = 999;
        this.grapple.grappling = false;
        this.walking = true;
        this.squish.mult(0);
        this.squishVel.mult(0);
        this.stretching = [false, false];
    }

    die() {
        this.reset();//only this for now (we can add animation later right?)
    }

    update() {
        this.smoothedVel.add(Vect.div(Vect.sub(this.vel, this.smoothedVel), 10));//for camera

        if(getInput(this.controls.toggleBuilder, true)) {
            this.god.active = !this.god.active;
            if(this.god.active) {
                this.reset();
            }
        }
        if(this.god.active) {
            var speed = getInput(this.controls.sprint)? settings.godSpeed*5: settings.godSpeed;
            this.pos.x += (getInput(this.controls.right) - getInput(this.controls.left)) * speed;
            this.pos.y += (getInput(this.controls.down) - getInput(this.controls.up)) * speed;
            cam.targetScale = getInput(this.controls.sprint)? h100 / 15: h100 / 6;

            if(getInput(this.controls.switchBuildType, true)) {
                //cycle place type
                this.god.placeType = Platform.types[(Platform.types.indexOf(this.god.placeType)+1)%Platform.types.length];
            }

            if(getInput(this.controls.grapple, true)) {
                //start build
                let p = cam.toGlobal(mouse);

                //delete stuff
                var deleted = false;
                for(var i = 0; i < platforms.length; i ++) {
                    if(IsPointInAABB(p, platforms[i].pos, platforms[i].size)) {
                        //die
                        platforms.splice(i, 1);
                        deleted = true;
                        i --;//don't skip any
                    }
                }
                if(!deleted) {
                    p.set(settings.platformSnap*Math.floor(p.x/settings.platformSnap), settings.platformSnap*Math.floor(p.y/settings.platformSnap));//ee

                    this.god.platformStart.set(p);
                    this.god.building = true;
                }
            }
            else if(this.god.building && !getInput(this.controls.grapple)) {
                this.god.building = false;
                
                //get mouse pos
                let p = cam.toGlobal(mouse);
                p.set(settings.platformSnap*Math.floor(p.x/settings.platformSnap), settings.platformSnap*Math.floor(p.y/settings.platformSnap));//ee

                let tl = new Vect(
                    Math.min(this.god.platformStart.x, p.x),
                    Math.min(this.god.platformStart.y, p.y),
                );
                let br = new Vect(
                    Math.max(this.god.platformStart.x, p.x)+settings.platformSnap,
                    Math.max(this.god.platformStart.y, p.y)+settings.platformSnap,
                );
                if(tl.x !== br.x && tl.y !== br.y) {//no lines allowed (they shouldn't be possible i think)
                    platforms.push(new Platform(tl, Vect.sub(br, tl), this.god.placeType));
                }
            }

            if(getInput(this.controls.clearLevel, true) && confirm("Clear entire level?")) {
                //explod
                platforms = [];
            }
            return;
        }
        else {
            cam.targetScale = Math.min(h100/6, h100 / this.vel.mag() * 1.5);
        }

        //check for grapple
        if(getInput(this.controls.grapple, true)) {
            //grapple buffer
            this.grapple.grappleBufferTime = 0;
        }
        if(this.grapple.grappleBufferTime < settings.jumpBufferTime) {
            //grapple
            var stuff = this.raycastGrapple();
            if(stuff) {
                this.walking = false;
                this.grapple.pos = stuff[0];
                this.grapple.grappleLength = stuff[1];
                this.grapple.grappling = true;
                this.grapple.castAnim = 0;
                this.grapple.grappleBufferTime = 999;
            }
        }
        if(!getInput(this.controls.grapple) && this.grapple.grappling) {
            //ungrapple
            this.grapple.grappling = false;
            particles.push(new Rope (this.grapple.pos.x,this.grapple.pos.y, this.center.x, this.center.y, this.grapple.grappleLength, settings.ropeParticleTimer));
            if(this.grapple.slackTimer < 5) {
                //if the rope isn't slack, give a slight pulling force
                this.vel.add(Vect.mult(Vect.normalize(Vect.sub(this.grapple.pos, this.center)), 2));
            }
        }
        if(getInput(this.controls.bounce, true)) {
            //bounce
            if(this.lastCollisionTimer < settings.bounceTime) {
                this.vel.set(this.bounceVel);//bounce straight away
                this.walking = false;
            }
            else if(!this.walking) {
                this.bounceTimer = 0;//bounce buffer
            }
        }
        if(getInput(this.controls.grapplePull,true) && this.grapple.grappling && this.grapple.slackTimer < 5) {
            //pull
            //console.log("grappulled");
            this.grapple.grappling = false;
            let pullForce = Vect.sub(this.grapple.pos, this.center);
            pullForce.mult(this.vel.mag() / pullForce.mag());
            this.vel.mult(0.3);
            this.vel.add(pullForce);
        }
        
        //accelerate
        var airSpeed = lerp(limit(this.vel.mag(), 0, 1), 0.5, 1) * settings.playerAirSpeed;
        this.moveDir = getInput(this.controls.right) - getInput(this.controls.left);
        this.vel.x += (this.walking? settings.playerSpeed: airSpeed) * this.moveDir;

        //jump
        if(this.groundTimer < settings.coyoteTime && this.jumpBufferTimer < settings.jumpBufferTime) {
            this.vel.y = -settings.playerJump;
            this.stretching[1] = true;
            this.squish.y = 0;//important
            this.squishVel.y = settings.playerJump;
            this.groundTimer = 999;
        }

        if(this.walking) {
            this.vel.x *= 0.9;
        }

        if(this.grapple.grappling) {
            this.walking = false;
            if(sqrDist(this.center.x, this.center.y, this.grapple.pos.x, this.grapple.pos.y) > this.grapple.grappleLength * this.grapple.grappleLength) {
                var normal = Vect.normalize(
                    Vect.sub(
                        this.center,
                        this.grapple.pos
                    )
                );
                var dp = Vect.dot(this.vel, normal);
                if(dp > 0) {
                    this.vel.sub(Vect.mult(normal, dp));
                    this.grapple.slackTimer = 0;
                };
                this.moveTo(
                    Vect.sub(
                        Vect.add(
                            Vect.mult(
                                normal,
                                this.grapple.grappleLength
                            ),
                            this.grapple.pos
                        ),
                        Vect.div(
                            this.size, 2
                        )
                    )
                );
            }
        }

        this.vel.add(settings.gravity);

        //timers
        this.grapple.slackTimer ++;
        this.grapple.grappleBufferTime ++;
        this.grapple.castAnim ++;
        this.lastCollisionTimer ++;
        this.collisionTimer ++;
        this.bounceTimer ++;
        this.groundTimer ++;
        this.jumpBufferTimer ++;
        if(getInput(this.controls.up, true)) {
            this.jumpBufferTimer = 0;
        }

        //move (you used to be able to go through walls so dt it is :)
        var technicallyVel = Math.max(Math.abs(this.vel.x),Math.abs(this.vel.y));
        var moveTimes = Math.max(1, Math.ceil(technicallyVel/(settings.platformSnap+this.size.x)));
        for(var i = 0; i < moveTimes; i ++) {
            this.moveTo(Vect.add(this.pos, Vect.div(this.vel, moveTimes)));
        }

        let oldSquish = Vect.get(this.squish);
        this.squishVel.mult(0.8);
        this.squishVel.sub(Vect.mult(this.squish, 0.1));
        this.squish.add(this.squishVel);
        
        //stretch check
        if(Math.sign(this.squish.x) !== Math.sign(oldSquish.x) && oldSquish.x!==0) this.stretching[0] = !this.stretching[0];
        if(Math.sign(this.squish.y) !== Math.sign(oldSquish.y) && oldSquish.y!==0) this.stretching[1] = !this.stretching[1];

        //not squishing anymore check
        if(Math.abs(this.squishVel.x) < 0.05 && Math.abs(this.squish.x) < 0.05) {this.squish.x = 0; this.stretching[0] = false;}
        if(Math.abs(this.squishVel.y) < 0.05 && Math.abs(this.squish.y) < 0.05) {this.squish.y = 0; this.stretching[1] = false;}
    }
}

var player = new Player(0,0, false);