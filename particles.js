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
    update() {
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

        
        this.vel.add(settings.gravity);
        this.vel.mult(0.995);
        if(sqrDist(this.p1.x, this.p1.y, this.p2.x, this.p2.y) > this.length * this.length* this.timeToLive / this.startingTime* this.timeToLive / this.startingTime) {
            diff.div(this.length);
            var dp = Vect.dot(this.vel, diff);
            this.vel.sub(Vect.mult(diff, dp));
        }

        this.timeToLive --;
        if(this.timeToLive <= 0) this.alive = false;
        this.p2.add(this.vel);
        
        console.log(this.p1, this.p2);
    }
}