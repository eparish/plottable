///<reference path="../lib/lodash.d.ts" />

class Interaction {
  public hitBox: D3.Selection;

  constructor(public componentToListenTo: Component) {
  }

  public listenToHitBox(hitBox: D3.Selection) {
    this.hitBox = hitBox;
    // no-op; should be overwritten
  }

  public registerWithComponent() {
    this.componentToListenTo.registerInteraction(this);
  }
}

class DragZoomInteraction extends Interaction {
  private zoom;
  constructor(componentToListenTo: Component, public renderers: Component[], public xScale: Scale, public yScale: Scale) {
    super(componentToListenTo);
    this.zoom = d3.behavior.zoom();
    this.zoom.x(this.xScale.scale);
    this.zoom.y(this.yScale.scale);
    var throttledZoom = _.throttle(() => this.rerenderZoomed(), 16);
    this.zoom.on("zoom", throttledZoom);

    this.registerWithComponent(); // It would be nice to have a call to this in the Interaction constructor, but
    // can't do this right now because that depends on listenToHitBox being callable, which depends on the DragZoomInteractor
    // constructor finishing first.
  }

  public listenToHitBox(hitBox: D3.Selection) {
    super.listenToHitBox(hitBox);
    this.zoom(hitBox);
  }

  private rerenderZoomed() {
    var translate = this.zoom.translate();
    var scale = this.zoom.scale();
    this.renderers.forEach((r) => {
      r.zoom(translate, scale);
      })
  }
}

interface XYSelectionArea {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

class AreaInteraction extends Interaction {
  private static CLASS_DRAG_BOX = "drag-box";
  private dragInitialized = false;
  private dragBehavior;
  private origin = [0,0];
  private constrainX: (n: number) => number;
  private constrainY: (n: number) => number;
  private dragBox: D3.Selection;

  constructor(
    private rendererComponent: XYRenderer,
    private areaCallback: (a: XYSelectionArea) => any
  ) {
    super(rendererComponent);
    this.dragBehavior = d3.behavior.drag();
    this.dragBehavior.on("dragstart", () => this.dragstart());
    this.dragBehavior.on("drag", () => this.drag());
    this.dragBehavior.on("dragend", () => this.dragend());
    this.registerWithComponent();
  }

  private dragstart(){
    this.dragBox.attr("height", 0).attr("width", 0);
    var availableWidth  = parseFloat(this.hitBox.attr("width"));
    var availableHeight = parseFloat(this.hitBox.attr("height"));
    // the constraint functions ensure that the selection rectangle will not exceed the hit box
    var constraintFunction = (min, max) => (x) => Math.min(Math.max(x, min), max);
    this.constrainX = constraintFunction(0, availableWidth);
    this.constrainY = constraintFunction(0, availableHeight);
  }

  private drag(){
    if (!this.dragInitialized) {
      this.origin = [d3.event.x, d3.event.y];
      this.dragInitialized = true;
    }

    var location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
    var width  = Math.abs(this.origin[0] - location[0]);
    var height = Math.abs(this.origin[1] - location[1]);
    var x = Math.min(this.origin[0], location[0]);
    var y = Math.min(this.origin[1], location[1]);
    this.dragBox.attr("x", x).attr("y", y).attr("height", height).attr("width", width);
  }

  private dragend(){
    this.dragInitialized = false;
  }

  public listenToHitBox(hitBox: D3.Selection) {
    super.listenToHitBox(hitBox);
    var cname = AreaInteraction.CLASS_DRAG_BOX;
    var element = this.componentToListenTo.element;
    this.dragBox = element.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
    hitBox.call(this.dragBehavior);
  }
}
