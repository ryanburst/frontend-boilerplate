import './Element.on.off';
import './Element.trigger';
import './Element.on.off';

/**
 * Safari does not like to fire the focus event when a label is
 * clicked on like other browsers. This polyfill will listen for
 * the label click event, then trigger a focus on the input if
 * the element doesn't already have focus.
 */
document.querySelectorAll('label[for]').forEach(label => {
  let id    = label.getAttribute('for');
  let input = document.querySelector('#' + id);

  if (! input) { return; }

  label.on('click',e => {
    // Use set timeout to clear the stack and make sure the active element
    // is not the one we're about to give focus to, as we don't want a
    // double focus event to be triggered.
    setTimeout(() => {
      if (input === document.activeElement) { return; }
      input.trigger('focus')
    });
  });
});