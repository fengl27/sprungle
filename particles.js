var particles = [];
class Rope {
    constructor(x1, y1, x2, y2, length, timeToLive) {
        this.p1 = new Vect(x1, y1);
        this.p2 = new Vect(x2, y2);
        this.vel = new Vect(0, 0);
        this.length = length;
        this.size = new Vect(15,15);
        this.startingTime = timeToLive;
        this.timeToLive = timeToLive;
        this.alive = true;
    }
    display() {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        var p1 = cam.toScreen(this.p1);
        var p2 = cam.toScreen(this.p2);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
    update(dt) {
        /*
        if(sqrDist(this.p1.x, this.p1.y, this.p2.x, this.p2.y) > this.length * this.length) {
            var normal = Vect.normalize(
                Vect.sub(
                    this.p2,
                    this.p1
                )
            );
            var dp = Vect.dot(this.vel, normal);
            if(dp > 0) this.vel.sub(Vect.mult(normal, dp));
            this.vel.add(
                Vect.sub(
                    Vect.sub(
                        Vect.add(
                            Vect.mult(
                                normal,
                                this.length
                            ),
                            this.p1
                        ),
                        Vect.div(
                            this.size, 2
                        )
                    ),
                    this.p2
                )
            );
        }
        */
        if(sqrDist(this.p1.x, this.p1.y, this.p2.x, this.p2.y) > this.length * this.length* this.timeToLive / this.startingTime* this.timeToLive / this.startingTime) {
            var diff = Vect.sub(this.p2, this.p1);
            diff.mult(this.length / diff.mag() * this.timeToLive / this.startingTime);
            this.p2.set(Vect.add(this.p1, diff));
        }

        
        this.vel.add(Vect.mult(settings.gravity, dt));
        this.vel.mult(0.995);
        if(sqrDist(this.p1.x, this.p1.y, this.p2.x, this.p2.y) > this.length * this.length* this.timeToLive / this.startingTime* this.timeToLive / this.startingTime) {
            diff.div(this.length);
            var dp = Vect.dot(this.vel, diff);
            this.vel.sub(Vect.mult(diff, dp));
        }

        this.timeToLive -= dt;
        this.alive = this.timeToLive > 0;
        this.p2.add(this.vel);
        
    }
}

class Dust {
    constructor(x, y, vx, vym) {
        vym = vym || 1;
        this.pos = new Vect(x, y);
        this.vel = new Vect(vx * lerp(0.2, 0.5, Math.random() * Math.random()), lerp(-1, -5, Math.random()) * vym);
        var s = lerp(5, 10, Math.random());
        this.size = new Vect(s, s);
        this.alive = true;
        this.timeToLive = lerp(7, 13, Math.random());
    }

    update(dt) {
        this.pos.add(Vect.mult(this.vel, dt));
        this.vel.mult(frictionDT(0.95, dt));
        this.vel.add(Vect.mult(settings.gravity, 0.8 * dt));
        this.timeToLive -= dt;
        this.alive = this.timeToLive > 0;
    }

    display() {
        ctx.fillStyle = "rgba(100, 48, 48, 0.5)";
        ctx.lineWidth = 1;
        cam.drawRect(Vect.sub(this.pos, Vect.div(this.size, 2)), this.size);
        ctx.lineWidth = 3;
    }
}