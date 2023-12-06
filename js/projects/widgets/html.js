import Internals from "../widgets/widget.internals.js";

const HTML = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // widget specific
    this.render = async () =>
    {
        this.value =await this.refresh();

        this.populate();

        return this;
    };

    this.populate = () => this.element.innerHTML = this.value;
};

export default HTML;