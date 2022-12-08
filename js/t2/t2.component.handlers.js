import Common from "./t2.common.handlers.js";

const Handlers = function()
{
    this.element.setAttribute( "data-format", this.format || "" );

    Common.call( this );
};

export default Handlers;