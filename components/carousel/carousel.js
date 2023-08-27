const template = document.createElement("template");

template.innerHTML = `
<link rel="stylesheet" href="components/carousel/style.css" />

<div id="slider" class="slider">
  <div class="wrapper">
    <div id="slides" class="slides">
      <span class="slide"></span>
      <span class="slide"></span>
      <span class="slide"></span>
      <span class="slide"></span>
      <span class="slide"></span>
    </div>

    <ul id="dots">
      <li data-position="0" class="dot"></li>
      <li data-position="1" class="dot"></li>
      <li data-position="2" class="dot"></li>
      <li data-position="3" class="dot"></li>
      <li data-position="4" class="dot"></li>
    </ul>
  </div>

  <a id="prev" class="control prev"></a>

  <a id="next" class="control next"></a>
</div>
`;

export class Carousel extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.wrapper = this.shadowRoot.getElementById("slider");
    this.items = this.shadowRoot.getElementById("slides");
    this.prev = this.shadowRoot.getElementById("prev");
    this.next = this.shadowRoot.getElementById("next");
    this.dotsItems = this.shadowRoot.getElementById("dots");

    this.posX1 = 0;
    this.posX2 = 0;
    this.posInitial = 0;
    this.posFinal = 0;
    this.threshold = 100;
    this.index = 0;
    this.allowShift = true;

    this.slides;
    this.dots;
    this.slidesLength;
    this.firstSlide;
    this.lastSlide;
    this.slideSize;

    this.init();
  }

  init() {
    this.slides = this.items.getElementsByClassName("slide");
    this.dots = this.dotsItems.getElementsByClassName("dot");
    this.slidesLength = this.slides.length;

    const firstSlide = this.slides[0];
    const lastSlide = this.slides[this.slidesLength - 1];
    const cloneFirst = firstSlide.cloneNode(true);
    const cloneLast = lastSlide.cloneNode(true);

    this.items.appendChild(cloneFirst);
    this.items.insertBefore(cloneLast, firstSlide);
    this.wrapper.classList.add("loaded");
    this.setActiveDot(this.index);

    this.items.onmousedown = this.dragStart.bind(this);
    this.items.addEventListener("touchstart", this.dragStart.bind(this));
    this.items.addEventListener("touchend", this.dragEnd.bind(this));
    this.items.addEventListener("touchmove", this.dragAction.bind(this));

    this.prev.addEventListener("click", () => this.shiftSlide(-1));
    this.next.addEventListener("click", () => this.shiftSlide(1));

    this.items.addEventListener("transitionend", this.checkIndex.bind(this));
  }

  dragStart(e) {
    e = e || window.event;
    e.preventDefault();
    this.posInitial = this.items.offsetLeft;

    if (e.type == "touchstart") {
      this.posX1 = e.touches[0].clientX;
    } else {
      this.posX1 = e.clientX;
      this.shadowRoot.onmouseup = this.dragEnd.bind(this);
      this.shadowRoot.onmousemove = this.dragAction.bind(this);
    }
  }

  dragAction(e) {
    e = e || window.event;

    if (e.type == "touchmove") {
      this.posX2 = this.posX1 - e.touches[0].clientX;
      this.posX1 = e.touches[0].clientX;
    } else {
      this.posX2 = this.posX1 - e.clientX;
      this.posX1 = e.clientX;
    }
    this.items.style.left = this.items.offsetLeft - this.posX2 + "px";
  }

  dragEnd(e) {
    this.posFinal = this.items.offsetLeft;
    if (this.posFinal - this.posInitial < -this.threshold) {
      this.shiftSlide(1, "drag");
    } else if (this.posFinal - this.posInitial > this.threshold) {
      this.shiftSlide(-1, "drag");
    } else {
      this.items.style.left = this.posInitial + "px";
    }

    this.shadowRoot.onmouseup = null;
    this.shadowRoot.onmousemove = null;
  }

  shiftSlide(dir, action) {
    this.items.classList.add("shifting");

    if (this.allowShift) {
      if (!action) {
        this.posInitial = this.items.offsetLeft;
      }

      this.slideSize = this.slides[0].offsetWidth;

      this.removeActiveDot(this.index);

      if (dir == 1) {
        this.items.style.left = this.posInitial - this.slideSize + "px";
        this.index++;
      } else if (dir == -1) {
        this.items.style.left = this.posInitial + this.slideSize + "px";
        this.index--;
      }
    }

    this.allowShift = false;
  }

  checkIndex() {
    this.items.classList.remove("shifting");

    if (this.index === -1) {
      this.items.style.left = -(this.slidesLength * this.slideSize) + "px";
      this.index = this.slidesLength - 1;
    }

    if (this.index === this.slidesLength) {
      this.items.style.left = -(1 * this.slideSize) + "px";
      this.index = 0;
    }

    this.setActiveDot(this.index);

    this.allowShift = true;
  }

  setActiveDot(idx) {
    this.dots[idx].classList.add("active");
  }

  removeActiveDot(idx) {
    this.dots[idx].classList.remove("active");
  }
}
