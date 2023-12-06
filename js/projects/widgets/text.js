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
        this.value = await this.refresh();

        this.populate();

        return this;
    };

    this.populate = () =>
    {
        this.element.textContent = this.value;
    };
};

export default Text;