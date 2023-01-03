const Tabs = function( module )
{
    let self = this;
    let tab = 0;
    
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
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: container, args: null } ] } ] },
        ] );
    }

    async function container()
    {

    }
};

export default Tabs;