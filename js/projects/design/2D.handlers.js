const Handlers = function()
{
    this.init = function()
    {
        this.clear = ( context, data ) => 
        {
            context.close();
            console.log( "cancel", data  );
        };
        this.modify = async ( context, data ) => 
        {
            context.close();
            console.log( "modify", data.config );

            let popup = t2.ui.components.get( "attributes" );
                popup.show();
                popup.setTitle( { title: `modify ${ data.type }` } );

            console.log( t2 )
        };
        this.save = ( context, data ) => 
        {
            context.close();
            console.log( "save", data  );
        };


    };
};

export default Handlers;