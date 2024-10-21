class VSlider {
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
            this.bottomRight.y - this.height * this.value,
            this.width,
            this.height * this.value
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

    slide(y) {
        this.value = (this.bottomRight.y - y) / this.height;
        if (this.onSlide != undefined)
            this.onSlide();
    }
}
