var performanceTracker = {
    lastMillis: Date.now(),
    fps: 0,
    dt: 0,
    update: function() {
        var currMillis = Date.now();
        this.fps = 1000 / (currMillis - this.lastMillis);

        if(this.fps < 2) {
            this.fps = 60;//override
        }

        this.dt = 60 / this.fps;
        //this.timer += 250;
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
        ctx.save();
        //speedrun ui
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.lineWidth = h100;
        ctx.textAlign = "left";
        ctx.textBaseline = "hanging";
        ctx.font = h100*8 + "px pixelFont";
        var txt = Math.floor(player.speedrunTimer / 60).toString().padStart(2, "0") + ":" + (player.speedrunTimer%60).toFixed(2).toString().padStart(5, "0");
        var bestTime = player.bestTimes[currLevel]? player.bestTimes[currLevel]: 0;
        var bestTimeTxt = "Best " + Math.floor(bestTime / 60).toString().padStart(2, "0") + ":" + (bestTime%60).toFixed(2).toString().padStart(5, "0");
        
        if(player.won) {
            ctx.font = h100 * 25 + "px pixelFont";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeText(txt, canvas.width/2, canvas.height/2);
            ctx.fillText(txt, canvas.width/2, canvas.height/2);

            if(player.bestTimes[currLevel] === player.speedrunTimer) {
                ctx.font = h100 * 8 + "px pixelFont";
                ctx.strokeText("New best!", canvas.width / 2, canvas.height / 2 + h100 * 8);
                ctx.fillText("New best!", canvas.width / 2, canvas.height / 2 + h100 * 8);
            }
        }
        else {
            ctx.strokeText(txt, h100, h100);
            ctx.fillText(txt, h100, h100);
            ctx.font = h100 * 4 + "px pixelFont";
            ctx.strokeText(bestTimeTxt, h100, h100 * 5);
            ctx.fillText(bestTimeTxt, h100, h100 * 5);
        }


        ctx.restore();
    }
    else {
        for(var i = 0; i < platforms.length; i ++) {
            platforms[i].border();
            platforms[i].display();
        }

        //god ui
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.lineWidth = h100;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.font = h100*8 + "px pixelFont";
        ctx.strokeText("Place mode: " + player.god.placeType, h100, canvas.height);
        ctx.fillText("Place mode: " + player.god.placeType, h100, canvas.height);

        ctx.textAlign = "right";
        ctx.strokeText("Level: " + currLevel, canvas.width - h100, canvas.height);
        ctx.fillText("Level: " + currLevel, canvas.width - h100, canvas.height);
    }
    /*
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 25, canvas.height / 2 * performanceTracker.dt);
    ctx.fillStyle = "black";
    ctx.fillRect(0, canvas.height / 4 - 2, 100, 4);
    */
    cam.pos.add(Vect.div(Vect.sub(Vect.add(player.center, Vect.mult(player.smoothedVel, 12)), cam.pos), 10 / performanceTracker.dt));
    cam.scale += (cam.targetScale - cam.scale) / 8;

    justPressed = [];
    for(var i in mouse.buttons) {
        mouse.buttons[i][1] = false;
    }
    window.requestAnimationFrame(frame);
}
window.requestAnimationFrame(frame);