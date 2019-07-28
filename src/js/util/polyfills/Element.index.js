function indexFromParent() {
  let children = this.parentNode.childNodes;
  let num = 0;
  for (let i=0; i<children.length; i++) {
    if (children[i]==this) return num;
    if (children[i].nodeType==1) num++;
  }
  return -1;
}

Element.prototype.index = indexFromParent;