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
        let form = t2.common.el( "form", panel.element );
            form.id = "table";
            form.addEventListener( "submit", async ( e ) =>
            {
                e.preventDefault();

                let data = {};
                let formData = new FormData( e.target );
                let keys = Array.from( formData.keys() );
                    keys.forEach( key => data[ key ] = formData.get( key ) );

                await t2.db.table.add( data );

                //console.log( t2.db.table.add )

                version.value = ( t2.db.version || 1 ) + 1;
                table.value = null;
            } );
        let name = t2.common.el( "input", this.element );
            name.name = "name";
            name.placeholder = "name";
            name.value = t2.db.name;
            name.type = "text";
            name.setAttribute( "Form", form.id );
        let version = t2.common.el( "input", panel.element );
            version.name = "version";
            version.type = "number";
            version.value = t2.db.version + 1;
            version.placeholder = "version";
            version.setAttribute( "Form", form.id );
        let table = t2.common.el( "input", panel.element );
            table.name = "table";
            table.placeholder = "table";
            table.setAttribute( "Form", form.id );
            table.setAttribute( "required", "" );
        let submit = t2.common.el( "input", panel.element );
            submit.value = "Add";
            submit.type = "submit";
            submit.setAttribute( "Form", form.id ); 
    };
};

export default Panel;