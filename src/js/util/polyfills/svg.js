class SVG {
  constructor() {
    this.checkmark = document.querySelector('.checkmark');
    if(this.checkmark) {
      let isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
      let fireFoxAgent = window.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
      let fireFoxVersion = fireFoxAgent ? parseInt(fireFoxAgent[1]) : 0;
      let webgl = null;
      if(fireFoxVersion) {
        webgl = WebGL2RenderingContext;
      }
      let lowFirefox = (fireFoxVersion < 51 && webgl);
      if(!isIE11 || !lowFirefox) {
        this.animateSVG();
      }
    }
  }

  animateSVG() {

    this.checkmark.classList.add('checkmark--animated');
    this.checkmark.querySelector('.checkmark__circle').classList.add('checkmark__circle--animated');
    this.checkmark.querySelector('.checkmark__check').classList.add('checkmark__check--animated');
  }

  paintSVG() {
    this.checkmark.classList.add('checkmark--static');
    this.checkmark.querySelector('.checkmark__circle').classList.add('checkmark__circle--static');
    this.checkmark.querySelector('.checkmark__check').classList.add('checkmark__check--static');
  }
}

new SVG;