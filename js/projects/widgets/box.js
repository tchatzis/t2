import Internals from "../widgets/widget.internals.js";

const Box = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // widget specific
    let content;
    
    this.render = async () =>
    {
        content = await this.refresh();

        this.populate();

        return this;
    };

    this.populate = () =>
    {
        // TODO: switch according to content;
        console.log( content );
    };
};

export default Box;