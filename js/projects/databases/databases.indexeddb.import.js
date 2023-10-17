import Common from "../../t2/t2.container.handlers.js";

const Panel = function()
{
    let self = this;
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "flex-left", css: [ "panel" ] } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this ); 
    };

    this.refresh = async function()
    {
        await navigation();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] }
        ] );
    } 
    
    async function output()
    {
        let form = t2.common.el( "form", this.element );
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

export default Panel;
