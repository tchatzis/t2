const Message = function()
{
    let message;
    let messages;
    
    this.init = async function()
    {
        message = t2.ui.children.get( "message" );
        message.output = "text";
        message.element.classList.add( "expanded" );

        messages = await message.addComponent( { id: "message", type: "message", format: "block", output: "text" } ); 
    };

    this.set = async function( msg )
    {
        messages.set( msg );
        await t2.common.delay( () => message.element.classList.remove( "expanded" ), 5000 ); 
        messages.set();
    };
}

export default Message;