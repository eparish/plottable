///<reference path="../reference.ts" />

module Plottable {
  export class QuantitativeScale<D> extends Scale<D, number> {
    protected static _DEFAULT_NUM_TICKS = 10;
    protected _d3Scale: D3.Scale.QuantitativeScale;
    public _userSetDomainer: boolean = false;
    private _domainer: Domainer = new Domainer();
    public _typeCoercer = (d: any) => +d;
    private _tickGenerator: Scales.TickGenerators.TickGenerator<D> = (scale: Plottable.QuantitativeScale<D>) => scale.getDefaultTicks();

    /**
     * Constructs a new QuantitativeScaleScale.
     *
     * A QuantitativeScaleScale is a Scale that maps anys to numbers. It
     * is invertible and continuous.
     *
     * @constructor
     * @param {D3.Scale.QuantitativeScaleScale} scale The D3 QuantitativeScaleScale
     * backing the QuantitativeScaleScale.
     */
    constructor(scale: D3.Scale.QuantitativeScale) {
      super(scale);
    }

    protected _getExtent(): D[] {
      return this._domainer.computeDomain(this._getAllExtents(), this);
    }

    /**
     * Retrieves the domain value corresponding to a supplied range value.
     *
     * @param {number} value: A value from the Scale's range.
     * @returns {D} The domain value corresponding to the supplied range value.
     */
    public invert(value: number): D {
      return <any> this._d3Scale.invert(value);
    }

    /**
     * Creates a copy of the QuantitativeScaleScale with the same domain and range but without any registered list.
     *
     * @returns {QuantitativeScale} A copy of the calling QuantitativeScaleScale.
     */
    public copy(): QuantitativeScale<D> {
      return new QuantitativeScale<D>(this._d3Scale.copy());
    }

    public domain(): D[];
    public domain(values: D[]): QuantitativeScale<D>;
    public domain(values?: D[]): any {
      return super.domain(values); // need to override type sig to enable method chaining:/
    }

    protected _setDomain(values: D[]) {
        var isNaNOrInfinity = (x: any) => x !== x || x === Infinity || x === -Infinity;
        if (isNaNOrInfinity(values[0]) || isNaNOrInfinity(values[1])) {
            Utils.Methods.warn("Warning: QuantitativeScaleScales cannot take NaN or Infinity as a domain value. Ignoring.");
            return;
        }
        super._setDomain(values);
    }

    /**
     * Gets ticks generated by the default algorithm.
     */
    public getDefaultTicks(): D[] {
        return this._d3Scale.ticks(QuantitativeScale._DEFAULT_NUM_TICKS);
    }

    /**
     * Gets a set of tick values spanning the domain.
     *
     * @returns {D[]} The generated ticks.
     */
    public ticks(): D[] {
      return this._tickGenerator(this);
    }

    /**
     * Given a domain, expands its domain onto "nice" values, e.g. whole
     * numbers.
     */
    public _niceDomain(domain: D[], count?: number): D[] {
      return this._d3Scale.copy().domain(domain).nice(count).domain();
    }

    /**
     * Gets a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * @return {Domainer} The scale's current domainer.
     */
    public domainer(): Domainer;
    /**
     * Sets a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * When you set domainer, we assume that you know what you want the domain
     * to look like better that we do. Ensuring that the domain is padded,
     * includes 0, etc., will be the responsability of the new domainer.
     *
     * @param {Domainer} domainer If provided, the new domainer.
     * @return {QuantitativeScale} The calling QuantitativeScaleScale.
     */
    public domainer(domainer: Domainer): QuantitativeScale<D>;
    public domainer(domainer?: Domainer): any {
      if (domainer == null) {
        return this._domainer;
      } else {
        this._domainer = domainer;
        this._userSetDomainer = true;
        this._autoDomainIfAutomaticMode();
        return this;
      }
    }

    public _defaultExtent(): number[] {
      return [0, 1];
    }

    /**
     * Gets the tick generator of the QuantitativeScale.
     *
     * @returns {TickGenerator} The current tick generator.
     */
    public tickGenerator(): Scales.TickGenerators.TickGenerator<D>;
    /**
     * Sets a tick generator
     *
     * @param {TickGenerator} generator, the new tick generator.
     * @return {QuantitativeScale} The calling QuantitativeScale.
     */
    public tickGenerator(generator: Scales.TickGenerators.TickGenerator<D>): QuantitativeScale<D>;
    public tickGenerator(generator?: Scales.TickGenerators.TickGenerator<D>): any {
      if (generator == null) {
        return this._tickGenerator;
      } else {
        this._tickGenerator = generator;
        return this;
      }
    }
  }
}
