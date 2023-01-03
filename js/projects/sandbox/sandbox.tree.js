const Template = function( module )
{
    let self = this;
    let array = [ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ];
    
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
        let tree = await this.addComponent( { id: "tree", type: "tree", format: "block" } );

    }
};

export default Template;