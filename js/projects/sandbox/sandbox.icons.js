const Template = function( module )
{
    let self = this;
    
    this.init = async function()
    {
        await this.refresh();

        await navigation();
    };

    this.refresh = async function()
    {

    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
        ] );
    } 

    async function output()
    {
        let d = 50;
        let array = [];
        let types = Object.keys( t2.icons.library );
            types.forEach( type => 
            {
                let icon = t2.icons.init( { type: type, height: d, width: d, style: "stroke: gray;" } );

                if ( icon )
                    array.push( icon );
            } );
        
        let box = await this.addContainer( { id: "box", type: "box", format: "block" } );
        let icons = await box.addComponent( { id: "icons", type: "icons", format: "flex" } );
            icons.update( array );
    }   
};

export default Template;