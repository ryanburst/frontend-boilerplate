function triggerEvent(event) {
  if ('createEvent' in document) {
    let evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, false, true);
    this.dispatchEvent(evt);
  } else {
    this.fireEvent('on' + event);
  }
  return this;
}
window.trigger = document.trigger = Element.prototype.trigger = triggerEvent;