import Common from "../widgets/common.js";

const Box = function( params )
{ 
    this.element = document.createElement( "div" );
    
    this.params = params;
    this.params.class = this.constructor.name;

    // common
    Common.call( this );

    Object.defineProperty( this.data, "output", { value: false, writeable: false } );

    this.init = async () =>
    {
        await this.data.refresh();
    };
};

export default Box;