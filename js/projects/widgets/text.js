import Internals from "./widget.internals.js";

const Text = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // widget specific
    let text;

    this.set.config( "primitive", true );

    this.render = async () =>
    {
        text = await this.refresh();

        this.populate();

        return this;
    };

    this.populate = () =>
    {
        this.element.textContent = text;
    };
};

export default Text;