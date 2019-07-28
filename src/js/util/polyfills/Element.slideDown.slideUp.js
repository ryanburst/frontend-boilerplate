function whichTransitionEvent(){
  var t;
  var el = document.createElement('fakeelement');
  var transitions = {
    'WebkitTransition' :'webkitTransitionEnd',
    'MozTransition'    :'transitionend',
    'MSTransition'     :'msTransitionEnd',
    'OTransition'      :'oTransitionEnd',
    'transition'       :'transitionend'
  }

  for(t in transitions){
    if( el.style[t] !== undefined ){
      return transitions[t];
    }
  }
}

/**
 * Slide an element up like jQuery's slideDown function using CSS3 transitions.
 * @see https://gist.github.com/ludder/4226288
 * @param  {timing|callback}   Timing string or callback function when done
 * @param  {func}              Callback function when done
 * @return {void}
 */
function slideDown(timing = '300ms ease',cb =()=>{}) {
  if (typeof timing === 'function') {
    cb = timing;
    timing = '250ms ease';
  }

  if( this.offsetHeight ) {
    this.setAttribute('data-original-height',this.offsetHeight);
    this.style.height = 'auto';
  }

  // Get element height
  this.style.webkitTransition = 'none';
  this.style.transition = 'none';
  this.style.visibility = 'hidden';
  this.style.maxHeight = 'none';
  this.style.display = 'block';
  var height = this.offsetHeight + this.style.paddingBottom + this.style.paddingTop + 'px' ;
  this.style.removeProperty('visibility');
  this.style.maxHeight = 0;
  this.style.overflow = 'hidden';

  // Begin transition
  this.style.webkitTransition = 'max-height ' + timing + ', opacity ' + timing + ' 200ms';
  this.style.transition = 'max-height ' + timing + ', opacity ' + timing + ' 200ms';
  var endSlideDown = () => {
    this.style.removeProperty('-webkit-transition');
    this.style.removeProperty('transition');
    this.style.removeProperty('max-height');
    this.style.removeProperty('overflow');
    this.removeEventListener(whichTransitionEvent(), endSlideDown);
    cb.call();
  };
  // Stack issue, use setTimeout hack to move to bottom of stack
  setTimeout(() => {
    requestAnimationFrame(() => {
      this.addEventListener(whichTransitionEvent(), endSlideDown);
      this.style.maxHeight = height;
      this.style.opacity = '1';
    });
  });

  return this;
}

/**
 * Slide an element up like jQuery's slideUp function using CSS3 transitions.
 * @see https://gist.github.com/ludder/4226288
 * @param  {timing|callback}   Timing string or callback function when done
 * @param  {func}              Callback function when done
 * @return {void}
 */
function slideUp(timing = '300ms ease',cb =()=>{}) {
  if (typeof timing === 'function') {
    cb = timing;
    timing = '300ms ease';
  }

  let endHeight = this.getAttribute('data-original-height') ? parseInt(this.getAttribute('data-original-height')) : 0;

  this.style.webkitTransition = 'none';
  this.style.transition = 'none';
  var height = this.offsetHeight + this.style.paddingBottom + this.style.paddingTop + 'px' ;
  this.style.maxHeight = height;
  this.style.overflow = 'hidden';

  // Begin transition
  this.style.webkitTransition = 'max-height ' + timing + ' 150ms, opacity ' + timing;
  this.style.transition = 'max-height ' + timing + ' 150ms, opacity ' + timing;
  var endSlideUp = () => {
    this.style.removeProperty('-webkit-transition');
    this.style.removeProperty('transition');
    if( ! this.getAttribute('data-original-height') ) {
      this.style.removeProperty('max-height');
      this.style.display = 'none';
    }
    this.removeEventListener(whichTransitionEvent(), endSlideUp);
    cb.call();
  };
  // Stack issue, use setTimeout hack to move to bottom of stack
  setTimeout(() => {
    requestAnimationFrame(() => {
      this.addEventListener(whichTransitionEvent(), endSlideUp);
      this.style.maxHeight = endHeight + 'px';
      this.style.opacity = endHeight;
    });
  });

  return this;
}

Element.prototype.slideDown = slideDown;
Element.prototype.slideUp = slideUp;