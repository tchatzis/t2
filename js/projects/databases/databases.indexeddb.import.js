import Common from "../../t2/t2.common.handlers.js";

const Import = function()
{
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex-left" } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this ); 
    };
    
    this.run = async function()
    {
        panel.clear();

        let form = t2.common.el( "form", panel.element );
            form.id = "import";
            form.addEventListener( "submit", ( e ) => upload( e ) );
        let file = t2.common.el( "input", panel.element );
            file.name = "file";
            file.placeholder = "file";
            file.type = "file";
        let submit = t2.common.el( "input", panel.element );
            submit.value = "Import";
            submit.type = "submit";
            submit.setAttribute( "Form", form.id ); 
    };

    function upload( e )
    {
        e.preventDefault();

        let data = {};
        let formData = new FormData( e.target );
        let keys = Array.from( formData.keys() );
            keys.forEach( key => data[ key ] = formData.get( key ) );


        let file = new FileReader()

        console.log( file );

        console.log( Array.from( formData.entries() ) );
    };
};

export default Import;
