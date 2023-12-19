import Internals from "./widget.internals.js";

const Text = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // widget specific
    this.set.config( "primitive", true );

    this.render = async () =>
    {
        let value = await this.refresh();
        
        this.set.config( "value", value ); 

        this.set.value();

        return this;
    };
};

export default Text;