///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class StackedArea extends Abstract.Stacked {

    public _baseline: D3.Selection;
    public _baselineValue = 0;

    /**
     * Constructs a StackedArea plot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: Abstract.QuantitativeScale, yScale: Abstract.QuantitativeScale) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this.project("fill", () => Core.Colors.INDIGO);
    }

    public _getDrawer(key: string) {
      return new Plottable._Drawer.Area(key);
    }

    public _setup() {
      super._setup();
      this._baseline = this.renderArea.append("line").classed("baseline", true);
    }

    public _paint() {
      super._paint();

      var scaledBaseline = this.yScale.scale(this._baselineValue);
      var baselineAttr: IAttributeToProjector = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.availableWidth,
        "y2": scaledBaseline
      };
      this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);

      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];

      attrToProjector["d"] = (d) => d3.svg.area()
                                    .x(xFunction)
                                    .y0(y0Function)
                                    .y1(yFunction)(d.values);

      // Align fill with first index
      var fillProjector = attrToProjector["fill"];
      attrToProjector["fill"] = (d, i) => fillProjector(d.values[0], i);

      this._getDrawersInOrder().forEach((drawer, i) => {
        drawer.draw([this._stackedData[i]], attrToProjector);
      });
    }

    public _updateYDomainer() {
      return Plot.Area.prototype._updateYDomainer.apply(this);
    }

    public _onDataSourceUpdate() {
      return Plot.Area.prototype._onDataSourceUpdate.apply(this);
    }

    public _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["y"] = (d: any) => this.yScale.scale(d.y + d.y0);
      attrToProjector["y0"] = (d: any) => this.yScale.scale(d.y0);
      return attrToProjector;
    }
  }
}
}
