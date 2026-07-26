var performanceTracker = {
    lastMillis: Date.now(),
    fps: 0,
    dt: 0,
    timer: 250,
    update: function() {
        var currMillis = Date.now();
        this.timer -= currMillis - this.lastMillis;
        if(this.timer <= 0) {
            this.fps = 1000 / (currMillis - this.lastMillis);
            this.dt = 60 / this.fps;
            //this.timer += 250;
        }
        this.lastMillis = currMillis;
    }
};

function frame() {
    performanceTracker.update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update(performanceTracker.dt);
    player.display();
    for(var i = particles.length-1; i >= 0; i --) {
        particles[i].update(0.5);
        particles[i].display();
        if(!particles[i].alive) {
            particles.splice(i, 1);
        }
    }
    if(!player.god.active) {
        for(var i = 0; i < platforms.length; i ++) {
            platforms[i].border();
        }
        for(var i = 0; i < platforms.length; i ++) {
            platforms[i].display();
        }
    }
    else {
        for(var i = 0; i < platforms.length; i ++) {
            platforms[i].border();
            platforms[i].display();
        }

        //god ui
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.font = h100*5 + "px monospace";
        ctx.fillText("Place mode: " + player.god.placeType, h100, canvas.height);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 25, canvas.height / 2 * performanceTracker.dt);
    ctx.fillStyle = "black";
    ctx.fillRect(0, canvas.height / 4 - 2, 100, 4);

    cam.pos.add(Vect.div(Vect.sub(Vect.add(player.center, Vect.mult(player.smoothedVel, 16)), cam.pos), 10 / performanceTracker.dt));
    cam.scale += (cam.targetScale - cam.scale) / 10;

    justPressed = [];
    for(var i in mouse.buttons) {
        mouse.buttons[i][1] = false;
    }
    window.requestAnimationFrame(frame);
}
window.requestAnimationFrame(frame);