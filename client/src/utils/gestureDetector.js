/**
 * Gesture detector for custom video player controls
 */
export class GestureDetector {
    constructor(element, callbacks) {
        this.element = element;
        this.callbacks = callbacks;
        this.tapCount = 0;
        this.tapTimer = null;
        this.lastTapTime = 0;
        this.tapDelay = 300; // ms between taps to count as multi-tap

        this.init();
    }

    init() {
        this.element.addEventListener('click', this.handleClick.bind(this));
        this.element.addEventListener('touchend', this.handleTouch.bind(this));
    }

    handleClick(e) {
        this.processTap(e);
    }

    handleTouch(e) {
        e.preventDefault();
        this.processTap(e.changedTouches[0]);
    }

    processTap(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTapTime;

        // Reset tap count if too much time has passed
        if (tapLength > this.tapDelay) {
            this.tapCount = 0;
        }

        this.tapCount++;
        this.lastTapTime = currentTime;

        // Clear existing timer
        if (this.tapTimer) {
            clearTimeout(this.tapTimer);
        }

        // Wait for potential additional taps
        this.tapTimer = setTimeout(() => {
            this.executeTap(event, this.tapCount);
            this.tapCount = 0;
        }, this.tapDelay);
    }

    executeTap(event, count) {
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const width = rect.width;
        const position = this.getPosition(x, width);

        if (count === 1) {
            this.handleSingleTap(position);
        } else if (count === 2) {
            this.handleDoubleTap(position);
        } else if (count === 3) {
            this.handleTripleTap(position);
        }
    }

    getPosition(x, width) {
        const leftThird = width / 3;
        const rightThird = (width / 3) * 2;

        if (x < leftThird) return 'left';
        if (x > rightThird) return 'right';
        return 'center';
    }

    handleSingleTap(position) {
        if (position === 'center' && this.callbacks.onSingleTapCenter) {
            this.callbacks.onSingleTapCenter();
        }
    }

    handleDoubleTap(position) {
        if (position === 'left' && this.callbacks.onDoubleTapLeft) {
            this.callbacks.onDoubleTapLeft();
        } else if (position === 'right' && this.callbacks.onDoubleTapRight) {
            this.callbacks.onDoubleTapRight();
        }
    }

    handleTripleTap(position) {
        if (position === 'left' && this.callbacks.onTripleTapLeft) {
            this.callbacks.onTripleTapLeft();
        } else if (position === 'center' && this.callbacks.onTripleTapCenter) {
            this.callbacks.onTripleTapCenter();
        } else if (position === 'right' && this.callbacks.onTripleTapRight) {
            this.callbacks.onTripleTapRight();
        }
    }

    destroy() {
        this.element.removeEventListener('click', this.handleClick);
        this.element.removeEventListener('touchend', this.handleTouch);
        if (this.tapTimer) {
            clearTimeout(this.tapTimer);
        }
    }
}

export default GestureDetector;
