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
        
        let select = t2.icons.init( { type: "select", height: d, width: d, style: "stroke: gray;" } );
        let snap = t2.icons.init( { type: "snap", height: d, width: d, style: "stroke: gray;" } );

        let array = [ select, snap ];
        
        let box = await this.addContainer( { id: "box", type: "box", format: "block" } );
        let icons = await box.addComponent( { id: "icons", type: "icons", format: "flex" } );
            icons.update( array );
    }   
};

export default Template;