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
        let array = 
        [
            {
                parent: "lego",
                label: "city"
            },
            {
                parent: "tree",
                label: "test"
            },
            {
                parent: "tree",
                label: "lego"
            },
            {
                parent: "test",
                label: 1
            },
            {
                parent: 1,
                label: 2
            },
            {
                parent: "lego",
                label: "technic"
            }
        ];
        
        let tree = await this.addComponent( { id: "tree", type: "tree", format: "block", output: "dual" } );
            tree.subscription.add( { event: "selectBranch", handler: listen } );
            tree.subscription.add( { event: "changeParent", handler: listen } );
            tree.update( { array: array } );

        function listen( e )
        {
            console.error( e.detail );
        }
    }
};

export default Template;