function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.display();
    for(var i = particles.length-1; i >= 0; i --) {
        particles[i].update();
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

    cam.pos.add(Vect.div(Vect.sub(Vect.add(player.center, Vect.mult(player.smoothedVel, 16)), cam.pos), 10));
    cam.scale += (cam.targetScale - cam.scale) / 10;

    justPressed = [];
    for(var i in mouse.buttons) {
        mouse.buttons[i][1] = false;
    }
    window.requestAnimationFrame(frame);
}
window.requestAnimationFrame(frame);