import Internals from "../widgets/widget.internals.js";

const Template = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // extend externals


    // widget specific
    let array;
    let fulfill;
    let previous = null;
    let schema;

    this.render = async () =>
    {
        schema = this.get.schema();
    
        array = await this.refresh();
        this.set.data( array );

        await this.populate();

        return this;
    };

    this.populate = async function()
    {
        fulfill = new t2.common.Fulfill();

        if ( this.config.sort )
            array = this.get.copy().sort( this.sort[ this.config.sort.direction ] );
            array.forEach( record => this.add.row( record ) );

        const completed = new t2.common.Fulfill();

        let widgets = await fulfill.resolve();
            widgets.forEach( widget => completed.add( widget.render() ) );

        const rendered = await completed.resolve();
            rendered.forEach( ( widget, index ) => completed.add( widget.add.handler( { event: "click", handler: this.handlers.click, record: null } ) ) );
    };
};

export default Table;