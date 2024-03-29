import Internals from "../widgets/widget.internals.js";

const Box = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // widget specific
    this.render = async () =>
    {
        this.value = await this.refresh();

        this.populate();

        return this;
    };

    this.populate = () =>
    {
        //console.log( this.value );
        
        // TODO: switch according to content;
        //console.log( content );
    };
};

export default Box;