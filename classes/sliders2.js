class HSlider {
    constructor(x, y, width, height) {
        this.width = width;
        this.height = height;
        this.topLeft = createVector(x, y);
        this.bottomRight = createVector(x + this.width, y + this.height);
        this.onSlide = undefined;
        this.value = 0.0;
    }

    draw() {
        stroke(0, 255, 0);
        fill(100);
        rect(
            this.topLeft.x,
            this.topLeft.y,
            this.width,
            this.height
        );
        fill(150);

        rect(
            this.topLeft.x,
            this.topLeft.y,
            this.width * this.value,
            this.height 
        );
    }

    isInside(x, y) {
        if (x > this.topLeft.x && x < this.bottomRight.x) {
            if (y > this.topLeft.y && y < this.bottomRight.y) {
                return true;
            }
        }

        return false;
    }

    slide(x) {
        this.value = ((this.topLeft.x - x) / this.width) * -1;
        if (this.onSlide != undefined)
            this.onSlide();
    }
}
